import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useTransition } from '../context/TransitionContext'
import { useMediaQuery } from '../utils/useMediaQuery'
import { useCategory } from '../context/CategoryContext'
import { categories } from '../data/projects'
import CollapsingText from './CollapsingText'
import './Header.css'

function Header() {
  const location = useLocation()
  const isCarouselPage = location.pathname === '/'
  const { activeCategory, setActiveCategory } = useCategory()
  const { transitionTo } = useTransition()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isCompact = useMediaQuery('(max-width: 768px)')
  const dropdownRef = useRef(null)
  const activeLabel = categories.find((category) => category.id === activeCategory)?.label

  // Close the filter menu on outside click or Escape
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

  const selectCategory = (id) => {
    setIsMenuOpen(false)
    setActiveCategory(id)
  }

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
        <a href="/" className="header__name" aria-label="Ryan Stone" onClick={(e) => handleNavClick(e, '/')}>
          {/* Small screens: letters slide down and "S" slides over to read "RS" */}
          <span>
            R<CollapsingText collapsed={isCompact}>yan </CollapsingText>S<CollapsingText collapsed={isCompact}>tone</CollapsingText>
          </span>
        </a>
      </div>

      {isCarouselPage && (
        <nav className="header__tabs">
          {categories.map((category, index) => (
            <button
              key={category.id}
              className={`header__tab ${activeCategory === category.id ? 'header__tab--active' : ''}`}
              aria-pressed={activeCategory === category.id}
              onClick={() => selectCategory(category.id)}
            >
              <span style={{ animationDelay: `${0.05 + index * 0.03}s` }}>
                {category.label}
              </span>
            </button>
          ))}
        </nav>
      )}

      {/* Responsive: filters collapse into a centered dropdown */}
      {isCarouselPage && (
        <div className={`header__dropdown ${isMenuOpen ? 'header__dropdown--open' : ''}`} ref={dropdownRef}>
          <button
            className="header__dropdown-trigger"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
          >
            {/* Chevron rides inside the animated span so it enters with the label */}
            <span className="header__dropdown-label">
              <span>
                {activeLabel}
                <svg className="header__dropdown-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </span>
          </button>
          <div className="header__dropdown-menu" role="menu">
            {categories.map((category) => (
              <button
                key={category.id}
                role="menuitemradio"
                aria-checked={activeCategory === category.id}
                tabIndex={isMenuOpen ? 0 : -1}
                className={`header__dropdown-item ${activeCategory === category.id ? 'header__dropdown-item--active' : ''}`}
                onClick={() => selectCategory(category.id)}
              >
                {category.label}
                {activeCategory === category.id && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </button>
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
