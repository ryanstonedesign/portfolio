// Streams private media: fetches only the encrypted chunks a video or image needs
// and decrypts them in the browser, so large videos start playing right away and
// can seek without downloading the whole file.
//
// This worker never stores keys. For every request it asks the page that made it
// for that file's key; a page that hasn't been unlocked has none, so nothing is
// served. Decrypted bytes are never cached.
//
// Blob format (see scripts/encrypt-private.mjs): the file is split into chunkSize
// chunks, each AES-256-GCM encrypted with IV = 8-byte prefix + 4-byte chunk index.

const PREFIX = '/__private-media/'
const TAG_SIZE = 16
const CHUNKS_PER_FETCH = 4
const NO_STORE = { 'Cache-Control': 'no-store' }

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  // Everything else on the site goes straight to the network untouched
  if (url.origin !== self.location.origin || !url.pathname.includes(PREFIX)) return
  event.respondWith(serve(event, url.pathname.split(PREFIX)[1]))
})

const fromBase64 = (value) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0))

const chunkIv = (prefix, index) => {
  const iv = new Uint8Array(12)
  iv.set(prefix)
  new DataView(iv.buffer).setUint32(8, index)
  return iv
}

// Ask one page for a file's key; resolves null if it doesn't have it
const askClient = (client, id) => new Promise((resolve) => {
  const channel = new MessageChannel()
  const timer = setTimeout(() => resolve(null), 3000)
  channel.port1.onmessage = (event) => {
    clearTimeout(timer)
    resolve(event.data || null)
  }
  client.postMessage({ type: 'private-media-key', id }, [channel.port2])
})

const findEntry = async (event, id) => {
  const client = event.clientId && await self.clients.get(event.clientId)
  if (client) {
    const entry = await askClient(client, id)
    if (entry) return entry
  }
  // Some browsers don't report which page a media request came from
  for (const other of await self.clients.matchAll({ type: 'window' })) {
    if (other.id === event.clientId) continue
    const entry = await askClient(other, id)
    if (entry) return entry
  }
  return null
}

const parseRange = (header, size) => {
  if (!header) return { start: 0, end: size - 1, partial: false }
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim())
  if (!match || (match[1] === '' && match[2] === '')) return null
  let start
  let end = size - 1
  if (match[1] === '') {
    start = Math.max(0, size - Number(match[2]))
  } else {
    start = Number(match[1])
    if (match[2] !== '') end = Math.min(Number(match[2]), size - 1)
  }
  if (start >= size || start > end) return null
  return { start, end, partial: true }
}

// Decrypt chunks lazily as the player reads, a few chunks per network request
const streamRange = ({ url, size, chunkSize }, key, prefix, start, end) => {
  const encryptedChunk = chunkSize + TAG_SIZE
  const encryptedSize = size + Math.ceil(size / chunkSize) * TAG_SIZE
  const last = Math.floor(end / chunkSize)
  let next = Math.floor(start / chunkSize)

  return new ReadableStream({
    async pull(controller) {
      try {
        if (next > last) {
          controller.close()
          return
        }
        const groupEnd = Math.min(last, next + CHUNKS_PER_FETCH - 1)
        const from = next * encryptedChunk
        const to = Math.min((groupEnd + 1) * encryptedChunk, encryptedSize) - 1
        const response = await fetch(url, { headers: { Range: `bytes=${from}-${to}` }, cache: 'no-store' })
        if (response.status !== 206 && response.status !== 200) throw new Error(`Media fetch failed: ${response.status}`)
        let bytes = new Uint8Array(await response.arrayBuffer())
        // A host that ignores Range sends the whole file
        if (response.status === 200) bytes = bytes.subarray(from, to + 1)

        for (let index = next; index <= groupEnd; index++) {
          const offset = (index - next) * encryptedChunk
          const encrypted = bytes.subarray(offset, Math.min(offset + encryptedChunk, bytes.length))
          const plain = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: chunkIv(prefix, index) }, key, encrypted))
          const chunkStart = index * chunkSize
          controller.enqueue(plain.subarray(Math.max(0, start - chunkStart), Math.min(plain.length, end - chunkStart + 1)))
        }
        next = groupEnd + 1
      } catch (error) {
        controller.error(error)
      }
    },
    cancel() {
      next = last + 1
    },
  })
}

const serve = async (event, id) => {
  const entry = await findEntry(event, id)
  if (!entry) return new Response('Not found', { status: 404, headers: NO_STORE })

  const { size, type } = entry
  const range = parseRange(event.request.headers.get('range'), size)
  if (!range) {
    return new Response(null, { status: 416, headers: { ...NO_STORE, 'Content-Range': `bytes */${size}` } })
  }

  const key = await crypto.subtle.importKey('raw', fromBase64(entry.key), 'AES-GCM', false, ['decrypt'])
  const { start, end, partial } = range
  const headers = {
    ...NO_STORE,
    'Content-Type': type,
    'Content-Length': String(end - start + 1),
    'Accept-Ranges': 'bytes',
  }
  if (partial) headers['Content-Range'] = `bytes ${start}-${end}/${size}`

  return new Response(streamRange(entry, key, fromBase64(entry.iv), start, end), {
    status: partial ? 206 : 200,
    headers,
  })
}
