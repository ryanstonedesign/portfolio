import { useState, useEffect, useRef } from 'react'
import { useFooter } from '../context/FooterContext'
import { useCategory } from '../context/CategoryContext'
import { getProjectsByCategory } from '../data/projects'
import './Work.css'

function Work() {
  const { activeCategory } = useCategory()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const intervalRef = useRef(null)
  const { setCenterContent } = useFooter()

  const filteredProjects = getProjectsByCategory(activeCategory)

  // Reset index when category changes
  useEffect(() => {
    setCurrentIndex(0)
  }, [activeCategory])

  // Auto-rotate images every second
  useEffect(() => {
    if (isHovering || filteredProjects.length <= 1) {
      return
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredProjects.length)
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isHovering, filteredProjects.length, activeCategory])

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

  const currentProject = filteredProjects[currentIndex]

  return (
    <div className="work">
      {/* Image Container */}
      <div 
        className="work__image-container"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {filteredProjects.length > 0 ? (
          <div className="work__image-wrapper">
            {/* Placeholder for now - replace with actual images */}
            <div 
              className="work__image"
              style={{ backgroundImage: `url(${currentProject?.image})` }}
            >
              <div className="work__image-placeholder">
                <span className="work__image-title">{currentProject?.title}</span>
                <span className="work__image-category">{currentProject?.category}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="work__empty">No projects in this category</div>
        )}
      </div>
    </div>
  )
}

export default Work
