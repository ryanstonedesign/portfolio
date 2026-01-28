import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useCategory } from '../context/CategoryContext'
import { getProjectsByCategory } from '../data/projects'
import './Work.css'

function Work() {
  const { activeCategory } = useCategory()
  const [isLoaded, setIsLoaded] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)
  const isDragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  const filteredProjects = getProjectsByCategory(activeCategory)

  // Tile size - the area that contains all images before repeating
  const TILE_WIDTH = 2400
  const TILE_HEIGHT = 2000

  // Generate random non-overlapping positions using grid-based placement
  const imagePositions = useMemo(() => {
    const cellWidth = 500 // Each cell is 500px wide
    const cellHeight = 400 // Each cell is 400px tall
    const padding = 50 // Padding within each cell for randomness
    
    // Calculate grid dimensions
    const cols = Math.floor(TILE_WIDTH / cellWidth)
    const rows = Math.floor(TILE_HEIGHT / cellHeight)
    
    // Create array of all available cells
    const availableCells = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        availableCells.push({ row, col })
      }
    }
    
    // Shuffle the cells for random distribution (seeded by category for consistency)
    const seed = activeCategory.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    for (let i = availableCells.length - 1; i > 0; i--) {
      const j = Math.floor(((seed * (i + 1) * 9301 + 49297) % 233280) / 233280 * (i + 1))
      ;[availableCells[i], availableCells[j]] = [availableCells[j], availableCells[i]]
    }
    
    // Assign each image to a unique cell with some randomness within
    return filteredProjects.map((_, index) => {
      const cell = availableCells[index % availableCells.length]
      const randomSeed = ((seed + index) * 9301 + 49297) % 233280
      const randomX = (randomSeed / 233280) * Math.max(0, cellWidth - padding * 2 - 400)
      const randomY = (((randomSeed * 9301 + 49297) % 233280) / 233280) * Math.max(0, cellHeight - padding * 2 - 300)
      return {
        x: cell.col * cellWidth + padding + randomX,
        y: cell.row * cellHeight + padding + randomY,
        delay: index * 0.05,
      }
    })
  }, [filteredProjects.length, activeCategory])

  // Calculate which tile copies need to be rendered based on viewport
  const getVisibleTiles = useCallback(() => {
    if (!containerRef.current) return [{ tx: 0, ty: 0 }]
    
    const viewWidth = window.innerWidth
    const viewHeight = window.innerHeight
    
    // Calculate which tiles are visible
    const startTileX = Math.floor((offset.x - viewWidth) / TILE_WIDTH) - 1
    const endTileX = Math.ceil((offset.x + viewWidth * 2) / TILE_WIDTH) + 1
    const startTileY = Math.floor((offset.y - viewHeight) / TILE_HEIGHT) - 1
    const endTileY = Math.ceil((offset.y + viewHeight * 2) / TILE_HEIGHT) + 1
    
    const tiles = []
    for (let tx = startTileX; tx <= endTileX; tx++) {
      for (let ty = startTileY; ty <= endTileY; ty++) {
        tiles.push({ tx, ty })
      }
    }
    return tiles
  }, [offset])

  const visibleTiles = getVisibleTiles()

  // Handle mouse/touch drag for panning
  const handleMouseDown = useCallback((e) => {
    isDragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
    containerRef.current.style.cursor = 'grabbing'
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return
    
    const deltaX = e.clientX - lastPos.current.x
    const deltaY = e.clientY - lastPos.current.y
    
    setOffset(prev => ({
      x: prev.x - deltaX,
      y: prev.y - deltaY
    }))
    
    lastPos.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab'
    }
  }, [])

  // Handle scroll wheel
  const handleWheel = useCallback((e) => {
    e.preventDefault()
    setOffset(prev => ({
      x: prev.x + e.deltaX,
      y: prev.y + e.deltaY
    }))
  }, [])

  // Trigger load animation
  useEffect(() => {
    setIsLoaded(false)
    setOffset({ x: 0, y: 0 }) // Reset offset on category change
    const timer = setTimeout(() => setIsLoaded(true), 50)
    return () => clearTimeout(timer)
  }, [activeCategory])

  // Add event listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      container.removeEventListener('wheel', handleWheel)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [handleWheel, handleMouseUp, handleMouseMove])

  return (
    <div className="work work--canvas">
      <div 
        className="work__canvas-container"
        ref={containerRef}
        onMouseDown={handleMouseDown}
      >
        <div 
          className="work__canvas"
          style={{
            transform: `translate(${-offset.x}px, ${-offset.y}px)`,
          }}
        >
          {visibleTiles.map(({ tx, ty }) => (
            filteredProjects.map((project, index) => (
              <div
                key={`${tx}-${ty}-${project.id || index}`}
                className={`work__canvas-item ${isLoaded ? 'work__canvas-item--loaded' : ''}`}
                style={{
                  left: (imagePositions[index]?.x || 0) + tx * TILE_WIDTH,
                  top: (imagePositions[index]?.y || 0) + ty * TILE_HEIGHT,
                  animationDelay: `${imagePositions[index]?.delay || 0}s`,
                }}
              >
                {project.isVideo ? (
                  <video
                    className="work__canvas-media"
                    src={`${project.image}#t=0.001`}
                    preload="metadata"
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    className="work__canvas-media"
                    src={project.image}
                    alt={project.title}
                    loading="eager"
                  />
                )}
              </div>
            ))
          ))}
        </div>
      </div>
    </div>
  )
}

export default Work
