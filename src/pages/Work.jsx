import { useState, useEffect } from 'react'
import { useFooter } from '../context/FooterContext'
import { useSettings } from '../context/SettingsContext'
import YearIndicator from '../components/YearIndicator'
import SwipeCarousel from '../components/SwipeCarousel'
import NameLoader from '../components/NameLoader'
import './Work.css'

function Work({ projects }) {
  const { yearComponent, shape } = useSettings()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [isCarouselLoading, setIsCarouselLoading] = useState(true)
  const { setCenterContent } = useFooter()

  const currentProject = projects[currentIndex]

  // Reset index when the project set changes
  useEffect(() => {
    setCurrentIndex(0)
  }, [projects])

  useEffect(() => {
    document.body.classList.toggle('work-carousel-loading', isCarouselLoading)

    return () => {
      document.body.classList.remove('work-carousel-loading')
    }
  }, [isCarouselLoading])

  // Preload the active carousel set before removing the centered loading state.
  useEffect(() => {
    let isCancelled = false

    if (projects.length === 0) {
      setIsCarouselLoading(false)
      return () => {
        isCancelled = true
      }
    }

    setIsCarouselLoading(true)

    const loadMedia = (project) => new Promise((resolve) => {
      const timeoutId = window.setTimeout(resolve, 30000)

      const finish = () => {
        window.clearTimeout(timeoutId)
        resolve()
      }

      if (project.isVideo) {
        const video = document.createElement('video')
        video.preload = 'auto'
        video.muted = true
        video.playsInline = true
        video.addEventListener('loadeddata', finish, { once: true })
        video.addEventListener('error', finish, { once: true })
        video.src = `${project.image}#t=0.001`
        video.load()
        return
      }

      const image = new Image()
      image.addEventListener('load', finish, { once: true })
      image.addEventListener('error', finish, { once: true })
      image.src = project.image
    })

    Promise.all(projects.map(loadMedia)).then(() => {
      if (!isCancelled) {
        setIsCarouselLoading(false)
      }
    })

    return () => {
      isCancelled = true
    }
  }, [projects])

  // Footer counter
  useEffect(() => {
    if (isCarouselLoading || projects.length === 0) {
      setCenterContent(null)
    } else {
      setCenterContent(
        <span className="footer__counter">
          <span className="footer__counter-current">{String(currentIndex + 1).padStart(2, '0')}</span>
          <span className="footer__counter-separator">/</span>
          <span className="footer__counter-total">{String(projects.length).padStart(2, '0')}</span>
        </span>
      )
    }

    return () => setCenterContent(null)
  }, [currentIndex, projects.length, setCenterContent, isCarouselLoading])

  return (
    <div className="work">
      {isCarouselLoading && (
        <div className="work__loading-overlay">
          <NameLoader label="Loading media" />
        </div>
      )}

      {projects.length > 0 ? (
        <SwipeCarousel
          projects={projects}
          currentIndex={currentIndex}
          onIndexChange={setCurrentIndex}
          onHoverChange={setIsHovering}
          shape={shape}
          isLoading={isCarouselLoading}
        />
      ) : (
        <div className="work__empty">No projects yet</div>
      )}

      {/* Year indicator - right side, visible on hover, large screens only */}
      <YearIndicator
        activeYear={currentProject?.year}
        isVisible={isHovering}
        variant={yearComponent}
      />
    </div>
  )
}

export default Work
