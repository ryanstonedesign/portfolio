import { useState, useEffect, useRef } from 'react'
import { createProject, sortByYear } from '../data/projects'
import encrypted from '../data/private.enc.json'
import Work from './Work'
import './Private.css'

// Shown at random when the password is wrong
const WRONG_PASSWORD_PHRASES = [
  'Alohomora failed. Try another spell.',
  'The Fat Lady isn’t buying it.',
  'Ten points from your house.',
  'Mischief not managed.',
  'Accio correct password?',
  'The Sorting Hat has concerns.',
  'Even Hermione would double-check that.',
  'The Marauder’s Map shows no such password.',
  'Expelliarmus! Password rejected.',
  'Platform 9¾ is still a wall for you.',
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

const toProjects = (manifest) => sortByYear(manifest.map(({ filename, src }, index) => createProject(filename, src, index)))

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

  // Return focus to the field after a wrong password
  useEffect(() => {
    if (hasError && !isChecking) inputRef.current?.focus()
  }, [hasError, isChecking])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password || isChecking) return

    setIsChecking(true)
    setHasError(false)

    try {
      const manifest = await decryptManifest(password)
      setProjects(toProjects(manifest))
    } catch {
      setErrorPhrase((previous) => pickPhrase(previous))
      setHasError(true)
      setPassword('')
    } finally {
      setIsChecking(false)
    }
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
