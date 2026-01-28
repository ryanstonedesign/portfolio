import { useState, useEffect, useRef, useCallback } from 'react'
import { useFooter } from '../context/FooterContext'
import { useCategory } from '../context/CategoryContext'
import { useSettings } from '../context/SettingsContext'
import { getProjectsByCategory } from '../data/projects'
import './Work.css'

function Work() {
  const { activeCategory } = useCategory()
  const { imageOpacity } = useSettings()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [playingVideos, setPlayingVideos] = useState({})
  const [, forceUpdate] = useState(0)
  const containerRef = useRef(null)
  const trackRef = useRef(null)
  const videoRefs = useRef({})
  const { setCenterContent } = useFooter()

  const filteredProjects = getProjectsByCategory(activeCategory)
  
  // Render 3 copies for seamless looping
  const tripleProjects = [...filteredProjects, ...filteredProjects, ...filteredProjects]

  // Detect touch device
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        window.matchMedia('(hover: none) and (pointer: coarse)').matches
      )
    }
    checkTouchDevice()
    window.matchMedia('(hover: none) and (pointer: coarse)').addEventListener('change', checkTouchDevice)
    return () => {
      window.matchMedia('(hover: none) and (pointer: coarse)').removeEventListener('change', checkTouchDevice)
    }
  }, [])

  // Reset when category changes
  useEffect(() => {
    setCurrentIndex(0)
  }, [activeCategory])

  // Force re-render after mount and on resize to get correct measurements
  useEffect(() => {
    const timer = setTimeout(() => forceUpdate(n => n + 1), 100)
    
    const handleResize = () => forceUpdate(n => n + 1)
    window.addEventListener('resize', handleResize)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [activeCategory])


  const goToNext = useCallback(() => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    setCurrentIndex(prev => prev + 1)
    
    // After transition completes, reset if we've gone past the first set
    setTimeout(() => {
      setIsTransitioning(false)
      setCurrentIndex(prev => {
        if (prev >= filteredProjects.length) {
          return prev - filteredProjects.length
        }
        return prev
      })
    }, 1500) // Match CSS transition duration
  }, [filteredProjects.length, isTransitioning])

  const goToPrev = useCallback(() => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    
    setCurrentIndex(prev => {
      // If at start, jump to end of second set first
      if (prev === 0) {
        return filteredProjects.length - 1
      }
      return prev - 1
    })
    
    setTimeout(() => {
      setIsTransitioning(false)
    }, 1500)
  }, [filteredProjects.length, isTransitioning])

  // Handle wheel scroll
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let scrollAccumulator = 0
    let scrollCooldown = false

    const handleWheel = (e) => {
      if (filteredProjects.length <= 1 || isTransitioning) return
      
      e.preventDefault()
      
      if (scrollCooldown) return
      
      scrollAccumulator += e.deltaY
      
      if (Math.abs(scrollAccumulator) >= 50) {
        if (scrollAccumulator > 0) {
          goToNext()
        } else {
          goToPrev()
        }
        scrollAccumulator = 0
        scrollCooldown = true
        setTimeout(() => {
          scrollCooldown = false
        }, 1500)
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [filteredProjects.length, isTransitioning, goToNext, goToPrev])

  // Calculate offset to center current image in viewport
  const getTrackOffset = useCallback(() => {
    if (!trackRef.current || !containerRef.current || filteredProjects.length === 0) return 0
    
    const items = trackRef.current.querySelectorAll('.work__stack-item')
    if (items.length === 0 || currentIndex >= items.length) return 0
    
    const containerHeight = containerRef.current.offsetHeight
    const currentItem = items[currentIndex]
    const currentItemHeight = currentItem.offsetHeight
    
    // Calculate position of current item's top edge
    let itemTop = 0
    for (let i = 0; i < currentIndex; i++) {
      itemTop += items[i].offsetHeight + 32 // 32px gap
    }
    
    // Calculate offset to center the current item
    // We want: itemTop + (itemHeight/2) - offset = containerHeight/2
    // So: offset = itemTop + (itemHeight/2) - (containerHeight/2)
    const offset = itemTop + (currentItemHeight / 2) - (containerHeight / 2)
    
    return offset
  }, [currentIndex, filteredProjects.length])

  // Handle individual video hover
  const handleVideoMouseEnter = (key) => {
    const video = videoRefs.current[key]
    if (video) {
      video.play().catch(() => {})
      setPlayingVideos(prev => ({ ...prev, [key]: true }))
    }
  }

  const handleVideoMouseLeave = (key) => {
    const video = videoRefs.current[key]
    if (video) {
      video.pause()
      setPlayingVideos(prev => ({ ...prev, [key]: false }))
    }
  }

  const handleVideoClick = (key, e) => {
    e.stopPropagation()
    const video = videoRefs.current[key]
    if (!video) return

    if (video.paused) {
      video.play().catch(() => {})
      setPlayingVideos(prev => ({ ...prev, [key]: true }))
    } else {
      video.pause()
      setPlayingVideos(prev => ({ ...prev, [key]: false }))
    }
  }

  // Update footer with counter
  useEffect(() => {
    if (filteredProjects.length > 0) {
      const displayIndex = currentIndex % filteredProjects.length
      setCenterContent(
        <span className="footer__counter">
          <span className="footer__counter-current">{String(displayIndex + 1).padStart(2, '0')}</span>
          <span className="footer__counter-separator">/</span>
          <span className="footer__counter-total">{String(filteredProjects.length).padStart(2, '0')}</span>
        </span>
      )
    } else {
      setCenterContent(null)
    }

    return () => setCenterContent(null)
  }, [currentIndex, filteredProjects.length, setCenterContent])

  // Update cursor
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('cursorupdate'))
  }, [currentIndex])

  const trackOffset = getTrackOffset()

  return (
    <div className="work work--stack">
      <div 
        ref={containerRef}
        className="work__stack-container"
      >
        {filteredProjects.length > 0 ? (
          <div 
            ref={trackRef}
            className={`work__stack-track ${isTransitioning ? 'work__stack-track--transitioning' : ''}`}
            data-opacity={imageOpacity}
            style={{ transform: `translateY(-${trackOffset}px)` }}
          >
            {tripleProjects.map((project, index) => {
              const itemKey = `${project.id || index}-${Math.floor(index / filteredProjects.length)}`
              const isCurrentItem = index === currentIndex
              
              return (
                <div 
                  key={itemKey}
                  className={`work__stack-item ${isCurrentItem ? 'work__stack-item--current' : ''}`}
                >
                  {project.isVideo ? (
                    <div 
                      className="work__stack-video-wrapper"
                      onMouseEnter={() => handleVideoMouseEnter(itemKey)}
                      onMouseLeave={() => handleVideoMouseLeave(itemKey)}
                      onClick={(e) => handleVideoClick(itemKey, e)}
                    >
                      <video
                        ref={el => { if (el) videoRefs.current[itemKey] = el }}
                        className="work__stack-media work__stack-media--video"
                        src={`${project.image}#t=0.001`}
                        preload="metadata"
                        loop
                        muted
                        playsInline
                      />
                      <div className={`work__stack-play-button ${playingVideos[itemKey] ? 'work__stack-play-button--hidden' : ''}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <img
                      className="work__stack-media"
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                    />
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="work__empty">No projects in this category</div>
        )}
      </div>
    </div>
  )
}

export default Work
