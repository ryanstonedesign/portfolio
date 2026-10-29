import { useEffect, useRef, useState } from 'react'
import { tiltCard, resetCard } from '../utils/cardTilt'
import Lightbox, { ExpandIcon } from './Lightbox'
import './SwipeCarousel.css'

// Horizontal swipe carousel.
// Native scroll-snap does the momentum and settling, so the browser handles
// velocity on the compositor; JS only reads the settled index.
const WHEEL_THRESHOLD = 40 // accumulated vertical wheel delta per step
const WHEEL_LOCK = 300 // ms before the next wheel step

function SwipeCarousel({ projects, currentIndex, onIndexChange, onHoverChange, shape, isLoading }) {
  const trackRef = useRef(null)
  const itemRefs = useRef([])
  const videoRefs = useRef([])
  const strideRef = useRef(0)
  const frameRef = useRef(0)
  // Starts unset so the first render scrolls to the current project
  const indexRef = useRef(null)
  const wheelRef = useRef({ total: 0, lockedUntil: 0, target: 0 })
  const [playingIndex, setPlayingIndex] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const lightboxOpenRef = useRef(false)
  lightboxOpenRef.current = lightbox !== null

  const scrollToIndex = (index, behavior = 'smooth') => {
    const clamped = Math.min(projects.length - 1, Math.max(0, index))
    trackRef.current?.scrollTo({ left: clamped * strideRef.current, behavior })
    return clamped
  }

  // Distance between item centers, measured once per resize
  useEffect(() => {
    const measure = () => {
      const [first, second] = itemRefs.current
      strideRef.current = first && second ? second.offsetLeft - first.offsetLeft : (first?.offsetWidth || 1)
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (trackRef.current) observer.observe(trackRef.current)
    return () => observer.disconnect()
  }, [projects])

  // Read the nearest index while scrolling (one read per frame)
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const handleScroll = () => {
      if (frameRef.current) return
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = 0
        const stride = strideRef.current || 1
        const index = Math.min(projects.length - 1, Math.max(0, Math.round(track.scrollLeft / stride)))
        if (index !== indexRef.current) {
          indexRef.current = index
          onIndexChange(index)
        }
      })
    }

    track.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      track.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
    }
  }, [projects.length, onIndexChange])

  // Vertical mouse wheel steps one project at a time; horizontal trackpad
  // scrolling is left to the browser
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const handleWheel = (e) => {
      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return
      e.preventDefault()

      const wheel = wheelRef.current
      const now = performance.now()
      wheel.total += e.deltaY
      if (now < wheel.lockedUntil || Math.abs(wheel.total) < WHEEL_THRESHOLD) return

      // Chain from the last target so quick steps aren't lost mid-animation
      const from = now - wheel.lockedUntil < WHEEL_LOCK ? wheel.target : indexRef.current ?? 0
      wheel.target = scrollToIndex(from + (wheel.total > 0 ? 1 : -1))
      wheel.total = 0
      wheel.lockedUntil = now + WHEEL_LOCK
    }

    track.addEventListener('wheel', handleWheel, { passive: false })
    return () => track.removeEventListener('wheel', handleWheel)
  }, [projects.length])

  // Arrow keys step through projects
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxOpenRef.current || e.target.closest?.('input, textarea')) return
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        scrollToIndex((indexRef.current ?? 0) + (e.key === 'ArrowRight' ? 1 : -1))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [projects.length])

  // Jump to the index when it changes from outside (e.g. a new project set)
  useEffect(() => {
    const track = trackRef.current
    if (!track || currentIndex === indexRef.current) return
    indexRef.current = currentIndex
    track.scrollTo({ left: currentIndex * strideRef.current, behavior: 'instant' })
  }, [currentIndex])

  // Pause any video that leaves center
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video && index !== currentIndex && !video.paused) {
        video.pause()
        video.currentTime = 0
      }
    })
    setPlayingIndex((playing) => (playing === currentIndex ? playing : null))
  }, [currentIndex])

  const playVideo = (index, shouldPlay) => {
    const video = videoRefs.current[index]
    if (!video) return
    if (shouldPlay) {
      video.play().catch(() => {})
      setPlayingIndex(index)
    } else {
      video.pause()
      setPlayingIndex(null)
    }
  }

  const handleItemClick = (index) => {
    // Tapping a side item brings it to center
    if (index !== currentIndex) {
      scrollToIndex(index)
      return
    }
    playVideo(index, videoRefs.current[index]?.paused)
  }

  const openLightbox = (e, project, index) => {
    e.stopPropagation()
    const card = e.currentTarget.closest('.swipe__card')
    const sourceEl = card.querySelector('.swipe__image, .swipe__video')
    playVideo(index, false)
    setLightbox({ project, sourceEl, buttonEl: e.currentTarget })
  }

  // With a mouse, the centered video plays while hovered
  const handleCardEnter = (e, index) => {
    if (e.pointerType === 'mouse' && index === currentIndex) playVideo(index, true)
  }

  const handleCardLeave = (e, index) => {
    resetCard(e)
    if (e.pointerType === 'mouse' && index === currentIndex) playVideo(index, false)
  }

  return (
    <div
      ref={trackRef}
      className={`swipe ${isLoading ? 'swipe--loading' : ''}`}
      data-shape={shape}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      {projects.map((project, index) => {
        // Keep full buffering near the center only
        const isNear = Math.abs(index - currentIndex) <= 1
        return (
          <div
            key={project.id || index}
            ref={(el) => { itemRefs.current[index] = el }}
            className={`swipe__item ${index === currentIndex ? 'swipe__item--active' : ''}`}
            onClick={() => handleItemClick(index)}
          >
            <div className="swipe__media">
              <div
                className="swipe__card card-tilt"
                data-is-video={project.isVideo}
                data-video-playing={playingIndex === index}
                onPointerEnter={(e) => handleCardEnter(e, index)}
                onPointerMove={tiltCard}
                onPointerLeave={(e) => handleCardLeave(e, index)}
              >
                {project.isVideo ? (
                  <video
                    ref={(el) => { videoRefs.current[index] = el }}
                    className="swipe__video"
                    src={`${project.image}#t=0.001`}
                    preload={isNear ? 'auto' : 'metadata'}
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    className="swipe__image"
                    src={project.image}
                    alt={project.title}
                    loading={isNear ? 'eager' : 'lazy'}
                    decoding="async"
                    draggable="false"
                  />
                )}
                {/* Short year, e.g. 2026 → ’26 */}
                <span className="swipe__badge">’{project.year.slice(-2)}</span>
                {project.isVideo && (
                  <span className={`swipe__play ${playingIndex === index ? 'swipe__play--hidden' : ''}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                )}
                <span className="card-tilt__shine" />
                <button
                  className="swipe__expand"
                  onClick={(e) => openLightbox(e, project, index)}
                  aria-label={`View ${project.title} full screen`}
                >
                  <ExpandIcon />
                </button>
              </div>
            </div>
          </div>
        )
      })}

      {lightbox && (
        <Lightbox
          key={lightbox.project.id}
          project={lightbox.project}
          sourceEl={lightbox.sourceEl}
          buttonEl={lightbox.buttonEl}
          radius={shape === 'rounded' ? 24 : 0}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}

export default SwipeCarousel
