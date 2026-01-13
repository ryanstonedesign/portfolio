import { useState, useEffect, useRef } from 'react'
import { useFooter } from '../context/FooterContext'
import { useCategory } from '../context/CategoryContext'
import { useSettings } from '../context/SettingsContext'
import { getProjectsByCategory } from '../data/projects'
import './Work.css'

function Work() {
  const { activeCategory } = useCategory()
  const { carouselSpeed, imageTransition, imageOpacity } = useSettings()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isExpanding, setIsExpanding] = useState(false)
  const [isCollapsing, setIsCollapsing] = useState(false)
  const intervalRef = useRef(null)
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const scrollAccumulator = useRef(0)
  const scrollCooldown = useRef(false)
  const { setCenterContent, setNavigation, clearNavigation } = useFooter()

  const filteredProjects = getProjectsByCategory(activeCategory)
  const currentProject = filteredProjects[currentIndex]

  // Navigation handlers for mobile chevrons
  const goToPrev = () => {
    setCurrentIndex((prev) => {
      let newIndex = prev - 1
      if (newIndex < 0) newIndex = filteredProjects.length - 1
      return newIndex
    })
  }

  const goToNext = () => {
    setCurrentIndex((prev) => {
      let newIndex = prev + 1
      if (newIndex >= filteredProjects.length) newIndex = 0
      return newIndex
    })
  }

  // Reset index when category changes
  useEffect(() => {
    setCurrentIndex(0)
  }, [activeCategory])

  // Auto-rotate images based on carousel speed setting
  useEffect(() => {
    if (isHovering || isFullscreen || filteredProjects.length <= 1) {
      return
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredProjects.length)
    }, carouselSpeed)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isHovering, isFullscreen, filteredProjects.length, activeCategory, carouselSpeed])

  // Update footer with counter
  useEffect(() => {
    if (filteredProjects.length > 0) {
      setCenterContent(
        <span className="footer__counter">
          <span className="footer__counter-current">{String(currentIndex + 1).padStart(2, '0')}</span>
          <span className="footer__counter-separator">/</span>
          <span className="footer__counter-total">{String(filteredProjects.length).padStart(2, '0')}</span>
        </span>
      )
    } else {
      setCenterContent(null)
    }

    return () => setCenterContent(null)
  }, [currentIndex, filteredProjects.length, setCenterContent])

  // Set up navigation for mobile chevrons
  useEffect(() => {
    if (filteredProjects.length > 1) {
      setNavigation(goToPrev, goToNext)
    }
    return () => clearNavigation()
  }, [filteredProjects.length])

  // Control video playback based on state
  useEffect(() => {
    if (!videoRef.current) return
    
    if (isVideoPlaying) {
      // Use play() with promise to handle autoplay restrictions
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented, that's okay
        })
      }
    } else {
      videoRef.current.pause()
    }
  }, [isVideoPlaying])

  // Reset video when switching projects or categories
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0
      }
    }, 50)
    
    return () => clearTimeout(timeoutId)
  }, [currentIndex, activeCategory])

  // Handle video playback state when hover/fullscreen changes
  useEffect(() => {
    const shouldPlay = currentProject?.isVideo && (isHovering || isFullscreen)
    
    const timeoutId = setTimeout(() => {
      if (videoRef.current) {
        if (shouldPlay) {
          const playPromise = videoRef.current.play()
          if (playPromise !== undefined) {
            playPromise.catch(() => {})
          }
        } else {
          videoRef.current.pause()
        }
      }
      setIsVideoPlaying(shouldPlay)
    }, 50)
    
    return () => clearTimeout(timeoutId)
  }, [currentIndex, activeCategory, isHovering, isFullscreen, currentProject?.isVideo])

  // Update cursor when current project or video state changes
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('cursorupdate'))
  }, [currentIndex, isVideoPlaying])

  // Handle wheel scroll for carousel navigation
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e) => {
      if (filteredProjects.length <= 1) return
      
      e.preventDefault()
      
      // Skip if on cooldown
      if (scrollCooldown.current) return
      
      // Accumulate scroll delta
      scrollAccumulator.current += e.deltaY
      
      const threshold = 50
      
      if (Math.abs(scrollAccumulator.current) >= threshold) {
        const direction = scrollAccumulator.current > 0 ? 1 : -1
        
        setCurrentIndex((prev) => {
          let newIndex = prev + direction
          if (newIndex < 0) newIndex = filteredProjects.length - 1
          if (newIndex >= filteredProjects.length) newIndex = 0
          return newIndex
        })
        
        scrollAccumulator.current = 0
        
        // Set cooldown to prevent multiple triggers
        scrollCooldown.current = true
        setTimeout(() => {
          scrollCooldown.current = false
        }, 25)
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [filteredProjects.length])

  // Handle keyboard navigation (left/right arrows)
  useEffect(() => {
    if (!isHovering && !isFullscreen) return
    if (filteredProjects.length <= 1) return

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setCurrentIndex((prev) => {
          let newIndex = prev - 1
          if (newIndex < 0) newIndex = filteredProjects.length - 1
          return newIndex
        })
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setCurrentIndex((prev) => {
          let newIndex = prev + 1
          if (newIndex >= filteredProjects.length) newIndex = 0
          return newIndex
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isHovering, isFullscreen, filteredProjects.length])


  const handleContainerClick = (e) => {
    // Don't toggle video if clicking the enlarge button
    if (e.target.closest('.work__enlarge-button')) return
    
    if (currentProject?.isVideo) {
      setIsVideoPlaying(prev => !prev)
    }
  }

  const collapseFullscreen = () => {
    setIsCollapsing(true)
    setIsFullscreen(false)
    window.dispatchEvent(new CustomEvent('cursorupdate', { detail: { ignoreButton: true, forceLight: true } }))
    
    setTimeout(() => {
      setIsCollapsing(false)
      if (containerRef.current) {
        containerRef.current.style.removeProperty('--start-top')
        containerRef.current.style.removeProperty('--start-left')
        containerRef.current.style.removeProperty('--start-width')
        containerRef.current.style.removeProperty('--start-height')
      }
    }, 400)
  }

  const handleEnlargeClick = (e) => {
    e.stopPropagation()
    
    if (!isFullscreen && containerRef.current) {
      // Going to fullscreen - capture current position
      const rect = containerRef.current.getBoundingClientRect()
      containerRef.current.style.setProperty('--start-top', `${rect.top}px`)
      containerRef.current.style.setProperty('--start-left', `${rect.left}px`)
      containerRef.current.style.setProperty('--start-width', `${rect.width}px`)
      containerRef.current.style.setProperty('--start-height', `${rect.height}px`)
      
      setIsExpanding(true)
      setIsFullscreen(true)
      window.dispatchEvent(new CustomEvent('cursorupdate', { detail: { ignoreButton: true } }))
      
      setTimeout(() => {
        setIsExpanding(false)
      }, 400)
    } else {
      collapseFullscreen()
    }
  }

  // Handle Escape key to close fullscreen
  useEffect(() => {
    if (!isFullscreen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        collapseFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  return (
    <div className="work">
      {/* Image/Video Container */}
      <div 
        ref={containerRef}
        className={`work__image-container ${isFullscreen ? 'work__image-container--fullscreen' : ''} ${isExpanding ? 'work__image-container--animating' : ''} ${isCollapsing ? 'work__image-container--collapsing' : ''}`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleContainerClick}
        data-is-video={currentProject?.isVideo || false}
        data-video-playing={isVideoPlaying}
        data-is-fullscreen={isFullscreen}
      >
        {filteredProjects.length > 0 ? (
          <div className={`work__image-wrapper ${imageTransition === 'dissolve' ? 'work__image-wrapper--dissolve' : ''}`} data-opacity={imageOpacity}>
            {/* Render all media stacked for preloading, toggle visibility */}
            {filteredProjects.map((project, index) => (
              project.isVideo ? (
                <video
                  key={project.id || index}
                  ref={index === currentIndex ? videoRef : null}
                  className={`work__video work__media--stacked ${index === currentIndex ? 'work__media--active' : ''} ${imageTransition === 'instant' ? 'work__media--instant' : ''}`}
                  src={`${project.image}#t=0.001`}
                  preload="metadata"
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  key={project.id || index}
                  className={`work__image work__media--stacked ${index === currentIndex ? 'work__media--active' : ''} ${imageTransition === 'instant' ? 'work__media--instant' : ''}`}
                  src={project.image}
                  alt={project.title}
                />
              )
            ))}
            
            {/* Badges */}
            <div className={`work__badges ${isHovering ? 'work__badges--visible' : ''}`}>
              {currentProject?.categories.map((cat) => (
                <span key={cat} className="work__badge">
                  {cat.toUpperCase()}
                </span>
              ))}
              <span className="work__badge">{currentProject?.year}</span>
            </div>

            {/* Enlarge button */}
            <button 
              className={`work__enlarge-button ${isHovering ? 'work__enlarge-button--visible' : ''}`}
              onClick={handleEnlargeClick}
              aria-label={isFullscreen ? 'Minimize' : 'Maximize'}
            >
              {isFullscreen ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 14 10 14 10 20"></polyline>
                  <polyline points="20 10 14 10 14 4"></polyline>
                  <line x1="14" y1="10" x2="21" y2="3"></line>
                  <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <polyline points="9 21 3 21 3 15"></polyline>
                  <line x1="21" y1="3" x2="14" y2="10"></line>
                  <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
              )}
            </button>

            {/* Play button for videos */}
            {currentProject?.isVideo && (
              <div className={`work__play-button ${isHovering || isVideoPlaying ? 'work__play-button--hidden' : ''}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}
          </div>
        ) : (
          <div className="work__empty">No projects in this category</div>
        )}
      </div>
    </div>
  )
}

export default Work
