import { useId } from 'react'
import './NameLoader.css'

// A word repeated around a circle of radius r (centered in a 100×100 box).
// Repeat counts are chosen so the words close the loop at natural spacing.
function NameRing({ id, word, repeat, radius, className }) {
  const circumference = 2 * Math.PI * radius
  // Start at the top and run clockwise
  const path = `M 50,${50 - radius} a ${radius},${radius} 0 1,1 0,${radius * 2} a ${radius},${radius} 0 1,1 0,${-radius * 2}`

  return (
    <g className={className}>
      <path id={id} d={path} fill="none" />
      <text className="name-loader__text">
        <textPath href={`#${id}`} textLength={circumference.toFixed(1)} lengthAdjust="spacing">
          {word.repeat(repeat)}
        </textPath>
      </text>
    </g>
  )
}

// Loading mark: RYAN on the outer ring and STONE on the inner, turning in
// opposite directions while gently pulsing
function NameLoader({ label = 'Loading' }) {
  const id = useId()

  return (
    <span className="name-loader" role="status" aria-label={label}>
      <svg className="name-loader__svg" viewBox="0 0 100 100" aria-hidden="true">
        <g className="name-loader__pulse">
          <NameRing id={`${id}-outer`} word="RYAN" repeat={8} radius={38} className="name-loader__ring name-loader__ring--outer" />
          <NameRing id={`${id}-inner`} word="STONE" repeat={4} radius={21} className="name-loader__ring name-loader__ring--inner" />
        </g>
      </svg>
    </span>
  )
}

export default NameLoader
