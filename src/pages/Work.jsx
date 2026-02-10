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

  // Separate projects into large (brand, ux, dev) and small (photo, art)
  const { largeProjects, smallProjects } = useMemo(() => {
    const large = []
    const small = []
    
    filteredProjects.forEach(project => {
      const hasLargeCategory = project.categories.some(c => ['ux', 'dev', 'brand'].includes(c))
      if (hasLargeCategory) {
        large.push(project)
      } else {
        small.push(project)
      }
    })
    
    return { largeProjects: large, smallProjects: small }
  }, [filteredProjects])

  // Grid configuration
  const CELL_SIZE = 300
  const COLS_PER_TILE = 6 // 6 columns = 3 blocks of 2x2

  // Calculate rows needed to fit all items
  // Each tile row has: 1-2 large blocks + 1-2 small block areas (4 small each)
  // Pattern per 2-row section: 3 large + 12 small = 15 items
  const largePerTileRow = 3 // 3 large blocks per 2-row section
  const smallPerTileRow = 12 // 3 small block areas × 4 = 12 small per 2-row section
  
  // Calculate how many 2-row sections we need to show all items at least once
  const largeSections = Math.ceil(largeProjects.length / largePerTileRow)
  const smallSections = Math.ceil(smallProjects.length / smallPerTileRow)
  const sectionsNeeded = Math.max(largeSections, smallSections, 1)
  
  const ROWS_PER_TILE = sectionsNeeded * 2
  const TILE_WIDTH = COLS_PER_TILE * CELL_SIZE
  const TILE_HEIGHT = ROWS_PER_TILE * CELL_SIZE

  // Generate grid with alternating pattern
  const gridItems = useMemo(() => {
    const items = []
    let largeIndex = 0
    let smallIndex = 0
    
    // Pattern: alternating large (2x2) and small (2x2 grid of 1x1) blocks
    // Row 0: [Large] [Small×4] [Large]
    // Row 1: [Small×4] [Large] [Small×4]
    for (let row = 0; row < ROWS_PER_TILE; row += 2) {
      const rowOffset = (row / 2) % 2
      
      for (let col = 0; col < COLS_PER_TILE; col += 2) {
        const blockOffset = (col / 2) % 2
        const isLargeBlock = (rowOffset + blockOffset) % 2 === 0
        
        if (isLargeBlock) {
          // Large block (2x2) - use large project or fallback to small
          const project = largeProjects.length > 0 
            ? largeProjects[largeIndex % largeProjects.length]
            : smallProjects[smallIndex % smallProjects.length]
          
          items.push({
            project,
            x: col * CELL_SIZE,
            y: row * CELL_SIZE,
            size: 'large',
            width: CELL_SIZE * 2,
            height: CELL_SIZE * 2,
            delay: items.length * 0.02,
          })
          
          if (largeProjects.length > 0) largeIndex++
          else smallIndex++
        } else {
          // 2x2 grid of small blocks
          for (let sr = 0; sr < 2; sr++) {
            for (let sc = 0; sc < 2; sc++) {
              const project = smallProjects.length > 0
                ? smallProjects[smallIndex % smallProjects.length]
                : largeProjects[largeIndex % largeProjects.length]
              
              items.push({
                project,
                x: (col + sc) * CELL_SIZE,
                y: (row + sr) * CELL_SIZE,
                size: 'small',
                width: CELL_SIZE,
                height: CELL_SIZE,
                delay: items.length * 0.02,
              })
              
              if (smallProjects.length > 0) smallIndex++
              else largeIndex++
            }
          }
        }
      }
    }
    
    return items
  }, [largeProjects, smallProjects, ROWS_PER_TILE])

  // Calculate which tile copies need to be rendered based on viewport
  const getVisibleTiles = useCallback(() => {
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
  }, [offset, TILE_WIDTH, TILE_HEIGHT])

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
            gridItems.map((item, index) => (
              <div
                key={`${tx}-${ty}-${index}`}
                className={`work__canvas-item work__canvas-item--${item.size} ${isLoaded ? 'work__canvas-item--loaded' : ''}`}
                style={{
                  left: item.x + tx * TILE_WIDTH,
                  top: item.y + ty * TILE_HEIGHT,
                  width: item.width,
                  height: item.height,
                  animationDelay: `${item.delay}s`,
                }}
              >
                {item.project.isVideo ? (
                  <video
                    className="work__canvas-media"
                    src={`${item.project.image}#t=0.001`}
                    preload="metadata"
                    loop
                    muted
                    playsInline
                    onMouseEnter={(e) => e.target.play().catch(() => {})}
                    onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0 }}
                  />
                ) : (
                  <img
                    className="work__canvas-media"
                    src={item.project.image}
                    alt={item.project.title}
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
