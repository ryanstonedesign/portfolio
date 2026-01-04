import { useState, useRef, useEffect } from 'react'
import { useSettings } from '../context/SettingsContext'
import './SettingsPopover.css'

const CAROUSEL_SPEED_OPTIONS = [
  { label: 'Fastest (1s)', value: 1000 },
  { label: 'Faster (1.5s)', value: 1500 },
  { label: 'Default (2s)', value: 2000 },
  { label: 'Slower (2.5s)', value: 2500 },
]

const IMAGE_TRANSITION_OPTIONS = [
  { label: 'Instant (default)', value: 'instant' },
  { label: 'Dissolve', value: 'dissolve' },
]

function SettingsPopover() {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef(null)
  const { carouselSpeed, setCarouselSpeed, imageTransition, setImageTransition } = useSettings()

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="settings-popover" ref={popoverRef}>
      <button 
        className="settings-popover__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Prototype settings"
        aria-expanded={isOpen}
      >
        <svg 
          className="settings-popover__icon"
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="settings-popover__content">
          <div className="settings-popover__header">
            Prototype Settings
          </div>
          
          <div className="settings-popover__section">
            <label className="settings-popover__label" htmlFor="carousel-speed">
              Carousel Speed
            </label>
            <select
              id="carousel-speed"
              className="settings-popover__select"
              value={carouselSpeed}
              onChange={(e) => setCarouselSpeed(Number(e.target.value))}
            >
              {CAROUSEL_SPEED_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="settings-popover__section">
            <label className="settings-popover__label" htmlFor="image-transition">
              Image Transition
            </label>
            <select
              id="image-transition"
              className="settings-popover__select"
              value={imageTransition}
              onChange={(e) => setImageTransition(e.target.value)}
            >
              {IMAGE_TRANSITION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsPopover

