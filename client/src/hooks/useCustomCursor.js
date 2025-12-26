import { useEffect, useRef } from 'react'

const useCustomCursor = () => {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const trailRef = useRef([])
  const isTouch = useRef(false)
  const prefersReducedMotion = useRef(false)

  useEffect(() => {
    // Check for touch device
    isTouch.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    
    // Check for reduced motion preference
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    // Don't show custom cursor on touch devices or if reduced motion is preferred
    if (isTouch.current || prefersReducedMotion.current) {
      return
    }

    // Create cursor elements
    const dot = document.createElement('div')
    dot.className = 'cursor-dot'
    dotRef.current = dot
    
    const ring = document.createElement('div')
    ring.className = 'cursor-ring'
    ringRef.current = ring

    // Create trail elements
    const trailElements = []
    for (let i = 0; i < 8; i++) {
      const trail = document.createElement('div')
      trail.className = 'cursor-trail'
      trail.style.opacity = (8 - i) / 8 * 0.3
      trail.style.transform = `scale(${(8 - i) / 8 * 0.5})`
      trailElements.push(trail)
      document.body.appendChild(trail)
    }
    trailRef.current = trailElements
    
    document.body.appendChild(dot)
    document.body.appendChild(ring)
    document.body.classList.add('custom-cursor')

    let mouseX = 0
    let mouseY = 0
    let dotX = 0
    let dotY = 0
    let ringX = 0
    let ringY = 0
    let trailPositions = Array(8).fill({ x: 0, y: 0 })

    const updateCursor = () => {
      // Smooth follow animation
      dotX += (mouseX - dotX) * 0.9
      dotY += (mouseY - dotY) * 0.9
      ringX += (mouseX - ringX) * 0.2
      ringY += (mouseY - ringY) * 0.2

      dot.style.transform = `translate(${dotX - 6}px, ${dotY - 6}px)`
      ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`

      // Update trail
      trailPositions = [
        { x: dotX, y: dotY },
        ...trailPositions.slice(0, -1)
      ]

      trailElements.forEach((trail, index) => {
        const pos = trailPositions[index]
        if (pos) {
          trail.style.transform = `translate(${pos.x - 3}px, ${pos.y - 3}px) scale(${(8 - index) / 8 * 0.5})`
        }
      })

      requestAnimationFrame(updateCursor)
    }

    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const handleMouseDown = () => {
      document.body.classList.add('cursor-click')
      setTimeout(() => {
        document.body.classList.remove('cursor-click')
      }, 150)
    }

    const handleMouseEnter = (e) => {
      const target = e.target
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.classList.contains('cursor-hover') ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]')
      ) {
        document.body.classList.add('cursor-hover')
      }
    }

    const handleMouseLeave = (e) => {
      const target = e.target
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.classList.contains('cursor-hover') ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]')
      ) {
        document.body.classList.remove('cursor-hover')
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseenter', handleMouseEnter, true)
    document.addEventListener('mouseleave', handleMouseLeave, true)

    updateCursor()

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseenter', handleMouseEnter, true)
      document.removeEventListener('mouseleave', handleMouseLeave, true)
      
      if (dot && dot.parentNode) {
        dot.parentNode.removeChild(dot)
      }
      if (ring && ring.parentNode) {
        ring.parentNode.removeChild(ring)
      }
      
      trailElements.forEach(trail => {
        if (trail && trail.parentNode) {
          trail.parentNode.removeChild(trail)
        }
      })
      
      document.body.classList.remove('custom-cursor', 'cursor-hover', 'cursor-click')
    }
  }, [])

  return null
}

export default useCustomCursor