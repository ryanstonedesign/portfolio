import { useState, useEffect, useRef } from 'react'
import { createProject, sortByYear } from '../data/projects'
import encrypted from '../data/private.enc.json'
import Work from './Work'
import './Private.css'

// Shown at random when the password is wrong
const WRONG_PASSWORD_PHRASES = [
  'Try another spell',
  'The Fat Lady isn’t buying it',
  'Ten points from your house',
  'Mischief not managed',
  'Accio correct password',
  'The Sorting Hat has concerns',
  'Even Hermione would double-check that',
  'The Marauder’s Map shows no such password',
  'Expelliarmus! Password rejected',
  'Platform 9¾ is still a wall for you',
]

const pickPhrase = (previous) => {
  const options = WRONG_PASSWORD_PHRASES.filter((phrase) => phrase !== previous)
  return options[Math.floor(Math.random() * options.length)]
}

const fromBase64 = (value) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0))

// Decrypt the private project list; throws when the password is wrong
const decryptManifest = async (password) => {
  const baseKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey'])
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: fromBase64(encrypted.salt), iterations: encrypted.iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  )
  const data = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(encrypted.iv) }, key, fromBase64(encrypted.data))
  return JSON.parse(new TextDecoder().decode(data))
}

// Fetch and decrypt one private file into an in-memory URL that exists only in this tab
const decryptMedia = async ({ blob, key, iv, type }) => {
  const url = /^https?:/.test(blob) ? blob : `${import.meta.env.BASE_URL}${blob}`
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) throw new Error(`Could not load ${blob}`)
  const fileKey = await crypto.subtle.importKey('raw', fromBase64(key), 'AES-GCM', false, ['decrypt'])
  const data = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(iv) }, fileKey, await response.arrayBuffer())
  return URL.createObjectURL(new Blob([data], { type }))
}

// Resolve every manifest entry to a displayable URL. Only encrypted blobs and inline
// placeholders are accepted, so a plain public link can never sneak in.
const resolveMedia = async (manifest) => {
  const results = await Promise.allSettled(manifest.map(async (item) => {
    if (item.blob) return { filename: item.filename, src: await decryptMedia(item) }
    if (item.src?.startsWith('data:')) return { filename: item.filename, src: item.src }
    throw new Error(`Refusing unencrypted media for ${item.filename}`)
  }))
  results.forEach((result) => {
    if (result.status === 'rejected') console.error(result.reason)
  })
  return results.filter((result) => result.status === 'fulfilled').map((result) => result.value)
}

const toProjects = (media) => sortByYear(media.map(({ filename, src }, index) => createProject(filename, src, index)))

function Private() {
  // Never remembered: the password is required on every visit
  const [projects, setProjects] = useState(null)
  const [password, setPassword] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorPhrase, setErrorPhrase] = useState('')
  const inputRef = useRef(null)

  // Keep the private page out of search results
  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]') || document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'robots' }))
    const previous = meta.content
    meta.content = 'noindex, nofollow'
    return () => {
      meta.content = previous
    }
  }, [])

  // Clear any unlock saved by an earlier version of this page
  useEffect(() => {
    try {
      sessionStorage.removeItem('private-manifest')
    } catch {
      // Storage unavailable; nothing to clear
    }
  }, [])

  // Release decrypted files from memory when leaving the private section
  useEffect(() => {
    if (!projects) return undefined
    return () => {
      projects.forEach(({ image }) => {
        if (image.startsWith('blob:')) URL.revokeObjectURL(image)
      })
    }
  }, [projects])

  // Return focus to the field after a wrong password
  useEffect(() => {
    if (hasError && !isChecking) inputRef.current?.focus()
  }, [hasError, isChecking])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password || isChecking) return

    setIsChecking(true)
    setHasError(false)

    let manifest
    try {
      manifest = await decryptManifest(password)
    } catch {
      setErrorPhrase((previous) => pickPhrase(previous))
      setHasError(true)
      setPassword('')
      setIsChecking(false)
      return
    }

    // Password was right; the field is no longer needed
    setPassword('')
    setProjects(toProjects(await resolveMedia(manifest)))
    setIsChecking(false)
  }

  if (projects) {
    return <Work projects={projects} />
  }

  return (
    <div className="private">
      <form className="private__form" onSubmit={handleSubmit}>
        <div className={`private__field ${hasError ? 'private__field--error' : ''}`}>
          <input
            ref={inputRef}
            id="private-password"
            className="private__input"
            type="password"
            placeholder="Password"
            aria-label="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setHasError(false)
            }}
            autoFocus
            autoComplete="current-password"
            disabled={isChecking}
            aria-invalid={hasError}
          />
          <button
            type="submit"
            className={`private__submit ${password ? 'private__submit--visible' : ''}`}
            disabled={!password || isChecking}
            tabIndex={password ? 0 : -1}
            aria-label="Unlock"
          >
            {isChecking ? (
              <span className="private__spinner" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            )}
          </button>
        </div>
        <p className="private__message" aria-live="polite">
          {hasError ? errorPhrase : ' '}
        </p>
      </form>
    </div>
  )
}

export default Private
