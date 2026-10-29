import './PixelLoader.css'

// 3×3 grid (row by row): the step at which each pixel appears, tracing a
// clockwise spiral around the edge that ends in the center
const SPIRAL_STEPS = [0, 1, 2, 7, 8, 3, 6, 5, 4]

function PixelLoader({ label = 'Loading' }) {
  return (
    <span className="pixel-loader" role="status" aria-label={label}>
      {SPIRAL_STEPS.map((step, index) => (
        <span key={index} className="pixel-loader__pixel" style={{ '--step': step }} />
      ))}
    </span>
  )
}

export default PixelLoader
