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
  const positionRef = useRef({ x: -100, y: -100 })
  const trailPositions = useRef(Array(TRAIL_COUNT).fill({ x: -100, y: -100 }))

  useEffect(() => {
    const handleMouseMove = (e) => {
      positionRef.current = { x: e.clientX, y: e.clientY }
      setPosition({ x: e.clientX, y: e.clientY })
      
      // Check if cursor is over an image element
      const element = document.elementFromPoint(e.clientX, e.clientY)
      const isOver = element?.closest('.work__image-container') !== null
      setIsOverImage(isOver)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
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
          RS
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
        RS
      </div>
    </>
  )
}

export default CustomCursor

