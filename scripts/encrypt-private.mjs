// Encrypts the private project list so only the password can reveal it.
// Reads private/projects.json (gitignored) and PRIVATE_PASSWORD from .env.local,
// writes src/data/private.enc.json (safe to commit).
//
// Usage: npm run encrypt-private

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { webcrypto as crypto } from 'node:crypto'

const SOURCE = 'private/projects.json'
const OUTPUT = 'src/data/private.enc.json'
const ITERATIONS = 600000

const readPassword = () => {
  if (process.env.PRIVATE_PASSWORD) return process.env.PRIVATE_PASSWORD
  if (existsSync('.env.local')) {
    const match = readFileSync('.env.local', 'utf8').match(/^PRIVATE_PASSWORD=(.*)$/m)
    if (match) return match[1].trim()
  }
  throw new Error('Set PRIVATE_PASSWORD in .env.local')
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

const { mediaBaseUrl, files } = JSON.parse(readFileSync(SOURCE, 'utf8'))

const manifest = files.map((entry) => {
  const item = typeof entry === 'string' ? { filename: entry } : entry
  const src = item.src
    || (item.placeholder ? placeholderSrc(item.filename) : `${mediaBaseUrl}/${item.filename}`)
  return { filename: item.filename, src }
})

const salt = crypto.getRandomValues(new Uint8Array(16))
const iv = crypto.getRandomValues(new Uint8Array(12))
const baseKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(readPassword()), 'PBKDF2', false, ['deriveKey'])
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

console.log(`Encrypted ${manifest.length} private projects to ${OUTPUT}`)
