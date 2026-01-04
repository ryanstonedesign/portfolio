import { useState, useEffect, useRef } from 'react'
import './CustomCursor.css'

const TRAIL_COUNT = 6
const TRAIL_DELAY = 40 // ms between each trail position update
const MIN_DISTANCE = 8 // minimum distance from cursor to show trail

function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [trails, setTrails] = useState(
    Array(TRAIL_COUNT).fill({ x: -100, y: -100, visible: false })
  )
  const [isOverImage, setIsOverImage] = useState(false)
  const [cursorText, setCursorText] = useState('RS')
  const positionRef = useRef({ x: -100, y: -100 })
  const trailPositions = useRef(Array(TRAIL_COUNT).fill({ x: -100, y: -100 }))

  useEffect(() => {
    const updateCursorState = (x, y) => {
      const element = document.elementFromPoint(x, y)
      const container = element?.closest('.work__image-container')
      const enlargeButton = element?.closest('.work__enlarge-button')
      const isOver = container !== null
      setIsOverImage(isOver)

      // Check if hovering over enlarge button
      if (enlargeButton && container) {
        const isFullscreen = container.classList.contains('work__image-container--fullscreen')
        setCursorText(isFullscreen ? 'Shrink' : 'Enlarge')
      }
      // Check if hovering over a video and get play state
      else if (isOver && container) {
        const isVideo = container.dataset.isVideo === 'true'
        const isPlaying = container.dataset.videoPlaying === 'true'
        if (isVideo) {
          setCursorText(isPlaying ? 'Pause' : 'Play')
        } else {
          setCursorText('RS')
        }
      } else {
        setCursorText('RS')
      }
    }

    const handleMouseMove = (e) => {
      positionRef.current = { x: e.clientX, y: e.clientY }
      setPosition({ x: e.clientX, y: e.clientY })
      updateCursorState(e.clientX, e.clientY)
    }

    const handleClick = () => {
      // Re-check state immediately after click
      requestAnimationFrame(() => {
        updateCursorState(positionRef.current.x, positionRef.current.y)
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
    }
  }, [])

  // Animate trails to follow cursor with delay
  useEffect(() => {
    const intervals = trails.map((_, index) => {
      return setInterval(() => {
        const target = index === 0 
          ? positionRef.current 
          : trailPositions.current[index - 1]
        
        const current = trailPositions.current[index]
        const ease = 0.35
        
        const newPos = {
          x: current.x + (target.x - current.x) * ease,
          y: current.y + (target.y - current.y) * ease,
        }
        
        trailPositions.current[index] = newPos
        
        // Calculate distance from main cursor
        const dx = newPos.x - positionRef.current.x
        const dy = newPos.y - positionRef.current.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        setTrails(prev => {
          const updated = [...prev]
          updated[index] = { ...newPos, visible: distance > MIN_DISTANCE }
          return updated
        })
      }, TRAIL_DELAY)
    })

    return () => intervals.forEach(clearInterval)
  }, [])

  return (
    <>
      {/* Trail cursors - render in reverse so first trail is on top */}
      {trails.map((trail, index) => (
        <div
          key={index}
          className={`cursor-trail ${isOverImage ? 'cursor-trail--inverted' : ''}`}
          style={{
            left: trail.x,
            top: trail.y,
            opacity: trail.visible ? 1 - (index + 1) / (TRAIL_COUNT + 1) : 0,
          }}
        >
          {cursorText}
        </div>
      )).reverse()}
      
      {/* Main cursor */}
      <div
        className={`custom-cursor ${isOverImage ? 'custom-cursor--inverted' : ''}`}
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {cursorText}
      </div>
    </>
  )
}

export default CustomCursor

