// Turns decrypted private manifest entries into URLs the carousel can display.
//
// Preferred path: public/private-sw.js streams each file, decrypting chunks as the
// player needs them, so large videos start right away and can seek. The worker
// holds no keys; it asks this page for them per request, and this page only has
// them while the private section is unlocked.
//
// Fallback (service workers unavailable, e.g. some private-browsing modes): the
// whole file is downloaded and decrypted into an in-memory blob: URL.

const BASE = import.meta.env.BASE_URL
const TAG_SIZE = 16

export const fromBase64 = (value) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0))

const chunkIv = (prefix, index) => {
  const iv = new Uint8Array(12)
  iv.set(prefix)
  new DataView(iv.buffer).setUint32(8, index)
  return iv
}

const absoluteUrl = (blob) => new URL(blob, `${window.location.origin}${BASE}`).href

// Keys the service worker may ask for, only while unlocked
const unlockedEntries = new Map()
let isListening = false

const listenForKeyRequests = () => {
  if (isListening) return
  isListening = true
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type !== 'private-media-key' || !event.ports[0]) return
    event.ports[0].postMessage(unlockedEntries.get(event.data.id) || null)
  })
  navigator.serviceWorker.startMessages()
}

// Register the streaming worker and wait until it controls this page. Some
// browsers block workers without ever answering, so give up after a few seconds.
const startWorker = () => {
  if (!('serviceWorker' in navigator)) return Promise.resolve(false)
  return Promise.race([
    registerWorker(),
    new Promise((resolve) => setTimeout(() => resolve(false), 5000)),
  ])
}

const registerWorker = async () => {
  try {
    listenForKeyRequests()
    await navigator.serviceWorker.register(`${BASE}private-sw.js`, { scope: BASE, updateViaCache: 'none' })
    await navigator.serviceWorker.ready
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, 3000)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          clearTimeout(timer)
          resolve()
        }, { once: true })
      })
    }
    return Boolean(navigator.serviceWorker.controller)
  } catch {
    return false
  }
}

const decryptWholeFile = async ({ blob, key, iv, size, chunkSize, type }) => {
  const response = await fetch(absoluteUrl(blob), { cache: 'no-store' })
  if (!response.ok) throw new Error(`Could not load ${blob}`)
  const bytes = new Uint8Array(await response.arrayBuffer())
  const cryptoKey = await crypto.subtle.importKey('raw', fromBase64(key), 'AES-GCM', false, ['decrypt'])
  const prefix = fromBase64(iv)
  const encryptedChunk = chunkSize + TAG_SIZE
  const parts = []
  for (let index = 0; index * chunkSize < size; index++) {
    const encrypted = bytes.subarray(index * encryptedChunk, (index + 1) * encryptedChunk)
    parts.push(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: chunkIv(prefix, index) }, cryptoKey, encrypted))
  }
  return URL.createObjectURL(new Blob(parts, { type }))
}

// Resolve every entry to a displayable URL. Only encrypted blobs and inline
// placeholders are accepted, so a plain public link can never sneak in.
export const unlockMedia = async (manifest) => {
  const canStream = manifest.some((item) => item.blob) && await startWorker()

  const results = await Promise.allSettled(manifest.map(async (item) => {
    if (item.blob) {
      if (!canStream) return { filename: item.filename, src: await decryptWholeFile(item) }
      const id = item.blob.split('/').pop().replace(/\.bin$/, '')
      unlockedEntries.set(id, { ...item, url: absoluteUrl(item.blob) })
      return { filename: item.filename, src: `${BASE}__private-media/${id}` }
    }
    if (item.src?.startsWith('data:')) return { filename: item.filename, src: item.src }
    throw new Error(`Refusing unencrypted media for ${item.filename}`)
  }))

  results.forEach((result) => {
    if (result.status === 'rejected') console.error(result.reason)
  })
  return results.filter((result) => result.status === 'fulfilled').map((result) => result.value)
}

// Forget keys and free decrypted files when leaving the private section
export const lockMedia = (urls) => {
  unlockedEntries.clear()
  urls.forEach((url) => {
    if (url.startsWith('blob:')) URL.revokeObjectURL(url)
  })
}
