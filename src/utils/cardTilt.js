import './cardTilt.css'

// Floating card effect: tilts toward the cursor and moves a shimmer across the
// surface. Writes CSS variables once per frame; no React state, no re-renders.
const MAX_TILT = 7 // degrees
const frames = new WeakMap()

export const tiltCard = (e) => {
  if (e.pointerType !== 'mouse') return

  const el = e.currentTarget
  const { clientX, clientY } = e
  if (frames.has(el)) return

  frames.set(el, requestAnimationFrame(() => {
    frames.delete(el)
    const rect = el.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))

    el.style.setProperty('--tilt-x', `${((0.5 - y) * 2 * MAX_TILT).toFixed(2)}deg`)
    el.style.setProperty('--tilt-y', `${((x - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`)
    el.style.setProperty('--shine-x', `${(x * 100).toFixed(1)}%`)
    el.style.setProperty('--shine-y', `${(y * 100).toFixed(1)}%`)
  }))
}

export const resetCard = (e) => {
  const el = e.currentTarget
  cancelAnimationFrame(frames.get(el))
  frames.delete(el)
  el.style.removeProperty('--tilt-x')
  el.style.removeProperty('--tilt-y')
  el.style.removeProperty('--shine-x')
  el.style.removeProperty('--shine-y')
}
