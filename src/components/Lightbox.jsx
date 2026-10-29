import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './Lightbox.css'

const OPEN_MS = 450
const MAX_ZOOM = 4
const DOUBLE_TAP_ZOOM = 2.5
const DOUBLE_TAP_MS = 300

const ExpandIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9"></polyline>
    <polyline points="9 21 3 21 3 15"></polyline>
    <line x1="21" y1="3" x2="14" y2="10"></line>
    <line x1="3" y1="21" x2="10" y2="14"></line>
  </svg>
)

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

export { ExpandIcon }

// Where the media sits when fitted to the screen
const fitRect = (aspect) => {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const width = Math.min(vw, vh * aspect)
  const height = width / aspect
  return { left: (vw - width) / 2, top: (vh - height) / 2, width, height }
}

// Transform that places an element laid out at `to` over the rect `from`
const flip = (from, to) =>
  `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

// Full-screen viewer that grows out of the card's media, with pinch, pan and
// double-tap zoom (trackpad pinch, scroll and double-click on desktop).
// sourceEl is the card's <img>/<video>; buttonEl is the card's expand button.
function Lightbox({ project, sourceEl, buttonEl, radius = 0, onClose }) {
  const stageRef = useRef(null)
  const frameRef = useRef(null)
  const zoomRef = useRef(null)
  const buttonRef = useRef(null)
  const videoRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)

  const aspect = project.isVideo
    ? (sourceEl.videoWidth / sourceEl.videoHeight) || sourceEl.clientWidth / sourceEl.clientHeight
    : (sourceEl.naturalWidth / sourceEl.naturalHeight) || sourceEl.clientWidth / sourceEl.clientHeight
  // Fitted position, kept in a ref too so handlers always read the latest size
  const [target, setTarget] = useState(() => fitRect(aspect))
  const targetRef = useRef(target)

  // Zoom state lives in a ref and is written straight to the DOM (no re-renders)
  const zoom = useRef({ scale: 1, x: 0, y: 0 })
  const gesture = useRef({ pointers: new Map(), start: null, lastTap: 0, moved: false })

  const applyZoom = (animate) => {
    const { scale, x, y } = zoom.current
    const el = zoomRef.current
    el.style.transition = animate ? 'transform 300ms var(--ease-out)' : 'none'
    el.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
    // Let zoomed media spill past the fitted frame onto the whole screen
    frameRef.current.classList.toggle('lightbox__frame--zoomed', scale > 1)
  }

  // Keep the zoomed media covering the screen edges it overflows
  const clampZoom = () => {
    const z = zoom.current
    z.scale = Math.min(MAX_ZOOM, Math.max(1, z.scale))
    const { width, height } = targetRef.current
    const maxX = Math.max(0, (width * z.scale - window.innerWidth) / 2)
    const maxY = Math.max(0, (height * z.scale - window.innerHeight) / 2)
    z.x = Math.min(maxX, Math.max(-maxX, z.x))
    z.y = Math.min(maxY, Math.max(-maxY, z.y))
  }

  // Open: start exactly over the card, then animate to full screen once the
  // lightbox has a picture to show
  useLayoutEffect(() => {
    const frame = frameRef.current
    const button = buttonRef.current
    const media = frame.querySelector('.lightbox__media')
    const from = sourceEl.getBoundingClientRect()
    const buttonTo = button.getBoundingClientRect()
    const buttonFrom = buttonEl.getBoundingClientRect()
    let isCancelled = false

    frame.style.transition = 'none'
    frame.style.transform = flip(from, target)
    frame.style.visibility = 'hidden'
    // Corner radius is scaled with the frame, so compensate to match the card
    frame.style.borderRadius = `${radius * (target.width / from.width)}px`
    button.style.transition = 'none'
    button.style.transform = `translate(${buttonFrom.left - buttonTo.left}px, ${buttonFrom.top - buttonTo.top}px)`
    button.style.visibility = 'hidden'

    // Videos: paint the card's current frame behind the lightbox video so there is
    // a picture immediately, while the video itself loads
    if (project.isVideo) {
      const still = frame.querySelector('.lightbox__still')
      still.width = Math.round(target.width * window.devicePixelRatio)
      still.height = Math.round(target.height * window.devicePixelRatio)
      try {
        still.getContext('2d').drawImage(sourceEl, 0, 0, still.width, still.height)
      } catch {
        // Frame unavailable; the video will appear when it loads
      }
    }

    const isReady = project.isVideo ? Promise.resolve() : media.decode().catch(() => {})
    const timeout = new Promise((resolve) => window.setTimeout(resolve, 400))

    Promise.race([isReady, timeout]).then(() => {
      if (isCancelled) return
      // Swap the card for the lightbox copy, then grow
      sourceEl.style.visibility = 'hidden'
      buttonEl.style.visibility = 'hidden'
      frame.style.visibility = ''
      button.style.visibility = ''
      frame.getBoundingClientRect() // commit the start position before animating
      frame.style.transition = ''
      frame.style.transform = ''
      frame.style.borderRadius = '0px'
      button.style.transition = ''
      button.style.transform = ''
      setIsOpen(true)
      // Move keyboard focus into the lightbox
      button.focus({ preventScroll: true })
    })

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      isCancelled = true
      document.body.style.overflow = previousOverflow
      sourceEl.style.visibility = ''
      buttonEl.style.visibility = ''
    }
  }, [])

  // Pick up the video where the card left off
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = sourceEl.currentTime || 0
    video.play().catch(() => setIsPlaying(false))
  }, [])

  const close = () => {
    if (isClosing) return
    setIsClosing(true)
    zoom.current = { scale: 1, x: 0, y: 0 }
    applyZoom(true)

    const frame = frameRef.current
    const button = buttonRef.current
    const to = sourceEl.getBoundingClientRect()
    const buttonTo = buttonEl.getBoundingClientRect()
    const buttonFrom = button.getBoundingClientRect()
    const current = targetRef.current
    frame.style.transform = flip(to, current)
    frame.style.borderRadius = `${radius * (current.width / to.width)}px`
    button.style.transform = `translate(${buttonTo.left - buttonFrom.left}px, ${buttonTo.top - buttonFrom.top}px)`
    setIsOpen(false)

    if (project.isVideo && videoRef.current) {
      sourceEl.currentTime = videoRef.current.currentTime
    }
    window.setTimeout(() => {
      onClose()
      // Return focus to the expand button once it's visible again
      requestAnimationFrame(() => buttonEl.focus({ preventScroll: true }))
    }, OPEN_MS)
  }

  // Refit to the window as it resizes, keeping any zoom in bounds
  useEffect(() => {
    const handleResize = () => {
      const next = fitRect(aspect)
      targetRef.current = next
      setTarget(next)
      clampZoom()
      applyZoom(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [aspect])

  // Escape closes. Listens in the capture phase so nothing on the page can swallow it
  const closeRef = useRef(close)
  closeRef.current = close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault()
        closeRef.current()
      }
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [])

  // Trackpad pinch / ctrl+scroll zooms around the cursor; plain scroll pans while zoomed
  useEffect(() => {
    const stage = stageRef.current
    const handleWheel = (e) => {
      e.preventDefault()
      const z = zoom.current
      if (e.ctrlKey) {
        const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
        const contentX = (e.clientX - center.x - z.x) / z.scale
        const contentY = (e.clientY - center.y - z.y) / z.scale
        z.scale = Math.min(MAX_ZOOM, Math.max(1, z.scale * Math.exp(-e.deltaY * 0.01)))
        z.x = e.clientX - center.x - contentX * z.scale
        z.y = e.clientY - center.y - contentY * z.scale
      } else if (z.scale > 1) {
        z.x -= e.deltaX
        z.y -= e.deltaY
      }
      clampZoom()
      applyZoom(false)
    }
    stage.addEventListener('wheel', handleWheel, { passive: false })
    return () => stage.removeEventListener('wheel', handleWheel)
  }, [])

  const toggleVideo = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {})
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  // Gestures: pinch to zoom, drag to pan while zoomed, double-tap to zoom in/out
  const handlePointerDown = (e) => {
    const g = gesture.current
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // Pointer already gone; tracking still works without capture
    }
    g.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    g.moved = false

    const points = [...g.pointers.values()]
    const z = zoom.current
    const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const anchor = points.length === 2 ? midpoint(points[0], points[1]) : points[0]
    g.start = {
      scale: z.scale,
      x: z.x,
      y: z.y,
      anchor,
      distance: points.length === 2 ? distance(points[0], points[1]) : 0,
      // Point on the (unzoomed) media under the anchor
      contentX: (anchor.x - center.x - z.x) / z.scale,
      contentY: (anchor.y - center.y - z.y) / z.scale,
    }
  }

  const handlePointerMove = (e) => {
    const g = gesture.current
    if (!g.pointers.has(e.pointerId) || !g.start) return
    g.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const points = [...g.pointers.values()]
    const z = zoom.current
    const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

    if (points.length === 2 && g.start.distance) {
      const mid = midpoint(points[0], points[1])
      z.scale = Math.min(MAX_ZOOM, Math.max(0.8, g.start.scale * (distance(points[0], points[1]) / g.start.distance)))
      z.x = mid.x - center.x - g.start.contentX * z.scale
      z.y = mid.y - center.y - g.start.contentY * z.scale
      g.moved = true
    } else if (points.length === 1 && g.start.scale > 1) {
      z.x = g.start.x + (points[0].x - g.start.anchor.x)
      z.y = g.start.y + (points[0].y - g.start.anchor.y)
      g.moved = true
    } else if (distance(points[0], g.start.anchor) > 8) {
      g.moved = true
    }
    applyZoom(false)
  }

  const handlePointerUp = (e) => {
    const g = gesture.current
    if (!g.pointers.has(e.pointerId)) return
    const point = g.pointers.get(e.pointerId)
    g.pointers.delete(e.pointerId)

    if (g.pointers.size > 0) {
      // One finger lifted mid-pinch: continue as a pan from the remaining finger
      handlePointerDown({ ...e, pointerId: [...g.pointers.keys()][0], clientX: [...g.pointers.values()][0].x, clientY: [...g.pointers.values()][0].y, currentTarget: e.currentTarget })
      return
    }

    clampZoom()
    applyZoom(true)

    if (g.moved) return
    const now = performance.now()
    if (now - g.lastTap < DOUBLE_TAP_MS) {
      // Double tap: zoom in around the tap, or back out
      const z = zoom.current
      if (z.scale > 1) {
        zoom.current = { scale: 1, x: 0, y: 0 }
      } else {
        const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
        z.scale = DOUBLE_TAP_ZOOM
        z.x = -(point.x - center.x) * (DOUBLE_TAP_ZOOM - 1)
        z.y = -(point.y - center.y) * (DOUBLE_TAP_ZOOM - 1)
        clampZoom()
      }
      applyZoom(true)
      g.lastTap = 0
    } else {
      g.lastTap = now
    }
    if (project.isVideo) toggleVideo()
  }

  return createPortal(
    <div className={`lightbox ${isOpen ? 'lightbox--open' : ''}`} role="dialog" aria-modal="true" aria-label={project.title}>
      <div className="lightbox__backdrop" />

      <div
        ref={stageRef}
        className="lightbox__stage"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          ref={frameRef}
          className="lightbox__frame"
          style={{ left: target.left, top: target.top, width: target.width, height: target.height }}
        >
          <div ref={zoomRef} className="lightbox__zoom">
            {project.isVideo && <canvas className="lightbox__still" aria-hidden="true" />}
            {project.isVideo ? (
              <video
                ref={videoRef}
                className="lightbox__media"
                src={project.image}
                loop
                muted
                playsInline
              />
            ) : (
              <img className="lightbox__media" src={project.image} alt={project.title} draggable="false" />
            )}
          </div>
        </div>

        {project.isVideo && (
          <span className={`lightbox__play ${isPlaying || isClosing ? 'lightbox__play--hidden' : ''}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        )}
      </div>

      <button ref={buttonRef} className="lightbox__close" onClick={close} aria-label="Close">
        <span className={`lightbox__icon ${isOpen ? '' : 'lightbox__icon--visible'}`}><ExpandIcon /></span>
        <span className={`lightbox__icon ${isOpen ? 'lightbox__icon--visible' : ''}`}><CloseIcon /></span>
      </button>
    </div>,
    document.body,
  )
}

export default Lightbox
