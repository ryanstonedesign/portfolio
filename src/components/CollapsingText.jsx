import { useLayoutEffect, useRef, useState } from 'react'
import './CollapsingText.css'

// Text that slides down out of view while its gap closes, so neighbors slide over
// in sync. Expanding runs the reverse.
function CollapsingText({ collapsed, children }) {
  const innerRef = useRef(null)
  const [width, setWidth] = useState(null)

  // Measure the natural width so the gap can animate to and from it
  useLayoutEffect(() => {
    const inner = innerRef.current
    const measure = () => setWidth(inner.scrollWidth)
    measure()
    document.fonts?.ready.then(measure)
    const observer = new ResizeObserver(measure)
    observer.observe(inner)
    return () => observer.disconnect()
  }, [])

  return (
    <span
      className={`collapsing-text ${collapsed ? 'collapsing-text--collapsed' : ''}`}
      style={width ? { '--collapsing-width': `${width}px` } : undefined}
    >
      <span ref={innerRef} className="collapsing-text__inner">{children}</span>
    </span>
  )
}

export default CollapsingText
