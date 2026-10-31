// Encrypts the private section so nothing in it can be seen without the password.
//
// Every private file is encrypted with its own random AES-256-GCM key and written
// under a random name, so the repo, the deployed site and any bucket only ever hold
// unreadable .bin blobs. The list of projects (filenames, blob locations and the
// per-file keys) is then encrypted with a key derived from PRIVATE_PASSWORD and
// written to src/data/private.enc.json.
//
// Never put private files in public/, src/content/ or the public R2 bucket. Keep the
// originals in private/ (gitignored) and run this script instead.
//
// Setup (all inside the gitignored private/ folder):
//   private/media/            the original files, named like the public ones
//                             (e.g. ux_dev_secretProject_2026.mp4)
//   private/projects.json     { "files": ["ux_dev_secretProject_2026.mp4", ...] }
//                             Order works like orderedFiles in src/data/projects.js.
//                             An entry can be { "filename": "...", "placeholder": true }
//                             to show a gray card until the real file exists.
//                             Optional "blobBaseUrl": "https://pub-xxxx.r2.dev/p" to
//                             host the encrypted blobs on R2 (needed for files over
//                             ~95 MB, which GitHub rejects).
//   .env.local                PRIVATE_PASSWORD=<at least 16 characters; a random
//                             passphrase of 5+ words is ideal>
//
// Usage: npm run encrypt-private
//   - Without blobBaseUrl: blobs go to public/private-media/ and are committed.
//   - With blobBaseUrl: blobs go to private/upload/; upload them to that location.
//   Commit public/private-media/ (if used) and src/data/private.enc.json.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs'
import { join, extname, basename } from 'node:path'
import { webcrypto as crypto } from 'node:crypto'

const SOURCE = 'private/projects.json'
const MEDIA_DIR = 'private/media'
const OUTPUT = 'src/data/private.enc.json'
const PUBLIC_BLOB_DIR = 'public/private-media'
const UPLOAD_BLOB_DIR = 'private/upload'
const ITERATIONS = 600000
const MIN_PASSWORD_LENGTH = 16
const MAX_REPO_BLOB_BYTES = 95 * 1024 * 1024

const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  // QuickTime files are labeled mp4 so Chrome will play H.264 .mov files too
  '.mov': 'video/mp4',
  '.webm': 'video/webm',
}

const fail = (message) => {
  console.error(`\n✖ ${message}\n`)
  process.exit(1)
}

const readPassword = () => {
  let password = process.env.PRIVATE_PASSWORD
  if (!password && existsSync('.env.local')) {
    const match = readFileSync('.env.local', 'utf8').match(/^PRIVATE_PASSWORD=(.*)$/m)
    if (match) password = match[1].trim()
  }
  if (!password) fail('Set PRIVATE_PASSWORD in .env.local')
  // The encrypted file is public, so the password can be guessed offline with no
  // rate limit. Length is the only real defense.
  if (password.length < MIN_PASSWORD_LENGTH) {
    fail(`PRIVATE_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters (a random 5+ word passphrase is ideal)`)
  }
  return password
}

// Gray card with the project title, used until real media is uploaded
const placeholderSrc = (filename) => {
  const label = filename.replace(/\.[^/.]+$/, '').split('_').slice(-2, -1)[0]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="1160" viewBox="0 0 1440 1160">
<rect width="1440" height="1160" fill="#1c1c1c"/>
<text x="720" y="580" fill="#6b6b6b" font-family="Inter, sans-serif" font-size="40" text-anchor="middle" dominant-baseline="middle" letter-spacing="4">PRIVATE · ${label.toUpperCase()}</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const toBase64 = (bytes) => Buffer.from(bytes).toString('base64')
const toHex = (bytes) => Buffer.from(bytes).toString('hex')

// Refuse to run if a private file has also been dropped into a public location
const findPublicCopies = (filenames) => {
  const publicNames = new Set()
  const walk = (dir) => {
    if (!existsSync(dir)) return
    for (const name of readdirSync(dir)) {
      const path = join(dir, name)
      if (statSync(path).isDirectory()) walk(path)
      else publicNames.add(name.toLowerCase())
    }
  }
  walk('public')
  walk('src/content')
  return filenames.filter((name) => publicNames.has(basename(name).toLowerCase()))
}

const { files, blobBaseUrl, mediaBaseUrl } = JSON.parse(readFileSync(SOURCE, 'utf8'))

if (mediaBaseUrl) {
  fail('mediaBaseUrl is no longer supported: it pointed at unencrypted files anyone could download. Move the originals into private/media/ and remove mediaBaseUrl.')
}

const entries = files.map((entry) => (typeof entry === 'string' ? { filename: entry } : entry))

const leaked = findPublicCopies(entries.map((item) => item.filename))
if (leaked.length) {
  fail(`These private files are also in public/ or src/content/, where anyone can download them. Delete them there first:\n  ${leaked.join('\n  ')}`)
}

const password = readPassword()

// Start from an empty blob folder so files removed from the list stop being published
const blobDir = blobBaseUrl ? UPLOAD_BLOB_DIR : PUBLIC_BLOB_DIR
rmSync(blobDir, { recursive: true, force: true })
mkdirSync(blobDir, { recursive: true })

const manifest = []
for (const item of entries) {
  if (item.placeholder) {
    manifest.push({ filename: item.filename, src: placeholderSrc(item.filename) })
    continue
  }

  const sourcePath = join(MEDIA_DIR, item.filename)
  if (!existsSync(sourcePath)) fail(`Missing ${sourcePath} (or mark it "placeholder": true)`)

  const type = MIME_TYPES[extname(item.filename).toLowerCase()]
  if (!type) fail(`Unsupported file type: ${item.filename}`)

  const fileKey = crypto.getRandomValues(new Uint8Array(32))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await crypto.subtle.importKey('raw', fileKey, 'AES-GCM', false, ['encrypt'])
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, readFileSync(sourcePath)))

  if (!blobBaseUrl && encrypted.length > MAX_REPO_BLOB_BYTES) {
    fail(`${item.filename} is too large for GitHub. Set "blobBaseUrl" in ${SOURCE} and upload the blobs to R2 instead.`)
  }

  const blobName = `${toHex(crypto.getRandomValues(new Uint8Array(16)))}.bin`
  writeFileSync(join(blobDir, blobName), encrypted)

  manifest.push({
    filename: item.filename,
    blob: blobBaseUrl ? `${blobBaseUrl.replace(/\/$/, '')}/${blobName}` : `private-media/${blobName}`,
    key: toBase64(fileKey),
    iv: toBase64(iv),
    type,
  })
}

const salt = crypto.getRandomValues(new Uint8Array(16))
const iv = crypto.getRandomValues(new Uint8Array(12))
const baseKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey'])
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
  baseKey,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt'],
)
const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(manifest)))

writeFileSync(OUTPUT, JSON.stringify({
  iterations: ITERATIONS,
  salt: toBase64(salt),
  iv: toBase64(iv),
  data: toBase64(new Uint8Array(data)),
}, null, 2) + '\n')

const blobCount = manifest.filter((item) => item.blob).length
console.log(`Encrypted ${manifest.length} private projects to ${OUTPUT}`)
if (blobCount) {
  console.log(blobBaseUrl
    ? `Upload the ${blobCount} files in ${UPLOAD_BLOB_DIR}/ to ${blobBaseUrl}/ (they are encrypted; replace any old ones)`
    : `Wrote ${blobCount} encrypted files to ${PUBLIC_BLOB_DIR}/ — commit them with ${OUTPUT}`)
}
