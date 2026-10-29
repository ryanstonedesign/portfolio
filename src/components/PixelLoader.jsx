import { useMemo } from 'react'
import './PixelLoader.css'

const GRID = 4
const MIN_CYCLE = 2.6 // seconds
const MAX_CYCLE = 4.8

// Each pixel gets its own loop length and starting point, so they float in and
// out independently and the pattern never settles into a repeat
const randomPixels = () =>
  Array.from({ length: GRID * GRID }, () => {
    const cycle = MIN_CYCLE + Math.random() * (MAX_CYCLE - MIN_CYCLE)
    return {
      '--pixel-cycle': `${cycle.toFixed(2)}s`,
      // Negative delay starts each pixel mid-loop, so the field is alive immediately
      '--pixel-delay': `${(-Math.random() * cycle).toFixed(2)}s`,
    }
  })

function PixelLoader({ label = 'Loading' }) {
  const pixels = useMemo(randomPixels, [])

  return (
    <span className="pixel-loader" role="status" aria-label={label}>
      {pixels.map((style, index) => (
        <span key={index} className="pixel-loader__pixel" style={style} />
      ))}
    </span>
  )
}

export default PixelLoader
