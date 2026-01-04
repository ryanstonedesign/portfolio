import { useState, useEffect, useRef } from 'react'
import { useFooter } from '../context/FooterContext'
import { useCategory } from '../context/CategoryContext'
import { useSettings } from '../context/SettingsContext'
import { getProjectsByCategory } from '../data/projects'
import './Work.css'

function Work() {
  const { activeCategory } = useCategory()
  const { carouselSpeed, imageTransition } = useSettings()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isExpanding, setIsExpanding] = useState(false)
  const [isCollapsing, setIsCollapsing] = useState(false)
  const intervalRef = useRef(null)
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const { setCenterContent } = useFooter()

  const filteredProjects = getProjectsByCategory(activeCategory)
  const currentProject = filteredProjects[currentIndex]

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

  // Control video playback based on click state
  useEffect(() => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }, [isVideoPlaying])

  // Reset video playing state and pause video when switching projects
  useEffect(() => {
    setIsVideoPlaying(false)
    // Explicitly pause the video after ref updates
    requestAnimationFrame(() => {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
      }
    })
  }, [currentIndex])

  // Auto-play video on hover
  useEffect(() => {
    if (currentProject?.isVideo) {
      if (isHovering) {
        setIsVideoPlaying(true)
      } else {
        setIsVideoPlaying(false)
      }
    }
  }, [isHovering, currentProject?.isVideo])

  const handleContainerClick = (e) => {
    // Don't toggle video if clicking the enlarge button
    if (e.target.closest('.work__enlarge-button')) return
    
    if (currentProject?.isVideo) {
      setIsVideoPlaying(prev => !prev)
    }
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
      
      setTimeout(() => {
        setIsExpanding(false)
      }, 400)
    } else {
      // Collapsing from fullscreen
      setIsCollapsing(true)
      setIsFullscreen(false)
      
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
  }

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
      >
        {filteredProjects.length > 0 ? (
          <div className={`work__image-wrapper ${imageTransition === 'dissolve' ? 'work__image-wrapper--dissolve' : ''}`}>
            {/* Render all media stacked for preloading, toggle visibility */}
            {filteredProjects.map((project, index) => (
              project.isVideo ? (
                <video
                  key={project.id || index}
                  ref={index === currentIndex ? videoRef : null}
                  className={`work__video work__media--stacked ${index === currentIndex ? 'work__media--active' : ''} ${imageTransition === 'instant' ? 'work__media--instant' : ''}`}
                  src={project.image}
                  preload="auto"
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
