import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useTransition } from '../context/TransitionContext'
import './Header.css'

const sections = [
  { label: 'Public', path: '/' },
  { label: 'Private', path: '/private' },
]

function Header() {
  const location = useLocation()
  const isCarouselPage = location.pathname === '/' || location.pathname === '/private'
  const { transitionTo } = useTransition()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const dropdownRef = useRef(null)
  const activeSection = sections.find((section) => section.path === location.pathname)

  // Close the section menu on outside click or Escape
  useEffect(() => {
    if (!isMenuOpen) return

    const handlePointerDown = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setIsMenuOpen(false)
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  // Close the menu after navigating
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  const handleNavClick = (e, path) => {
    e.preventDefault()
    if (location.pathname !== path) {
      transitionTo(path)
    }
  }

  const isInfoPage = location.pathname === '/info'

  return (
    <header className={`header ${isInfoPage ? 'header--with-gradient' : ''}`}>
      <div className="header__left">
        <a href="/" className="header__name" onClick={(e) => handleNavClick(e, '/')}>
          <span>Ryan Stone</span>
        </a>
      </div>

      {isCarouselPage && (
        <nav className="header__tabs">
          {sections.map((section, index) => (
            <a
              key={section.path}
              href={section.path}
              className={`header__tab ${location.pathname === section.path ? 'header__tab--active' : ''}`}
              onClick={(e) => handleNavClick(e, section.path)}
            >
              <span style={{ animationDelay: `${0.05 + index * 0.03}s` }}>
                {section.label}
              </span>
            </a>
          ))}
        </nav>
      )}

      {/* Responsive: sections collapse into a centered dropdown */}
      {isCarouselPage && (
        <div className={`header__dropdown ${isMenuOpen ? 'header__dropdown--open' : ''}`} ref={dropdownRef}>
          <button
            className="header__dropdown-trigger"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
          >
            <span className="header__dropdown-label">
              <span>{activeSection?.label}</span>
            </span>
            <svg className="header__dropdown-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div className="header__dropdown-menu" role="menu">
            {sections.map((section) => (
              <a
                key={section.path}
                href={section.path}
                role="menuitem"
                tabIndex={isMenuOpen ? 0 : -1}
                className={`header__dropdown-item ${location.pathname === section.path ? 'header__dropdown-item--active' : ''}`}
                onClick={(e) => {
                  setIsMenuOpen(false)
                  handleNavClick(e, section.path)
                }}
              >
                {section.label}
                {location.pathname === section.path && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      <nav className="header__right">
        <a href="/info" className="header__link" onClick={(e) => handleNavClick(e, '/info')}>
          <span>Info</span>
        </a>
      </nav>
    </header>
  )
}

export default Header
