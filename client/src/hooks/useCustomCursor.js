import { useEffect, useRef } from 'react'

const useCustomCursor = () => {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const trailRef = useRef([])
  const isTouch = useRef(false)
  const prefersReducedMotion = useRef(false)
  const isMobile = useRef(false)

  useEffect(() => {
    // Enhanced device detection
    isTouch.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    isMobile.current = window.innerWidth <= 640 // Mobile: no cursor
    
    // Check for reduced motion preference
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    // Enhanced cursor for desktop, simplified for tablet, hidden for mobile
    if (prefersReducedMotion.current) {
      return
    }

    // Create cursor elements with enhanced styling
    const dot = document.createElement('div')
    dot.className = 'cursor-dot'
    dotRef.current = dot
    
    const ring = document.createElement('div')
    ring.className = 'cursor-ring'
    ringRef.current = ring

    // Create trail elements (fewer for mobile/tablet)
    const trailCount = isMobile.current ? 0 : window.innerWidth <= 1024 ? 4 : 10
    const trailElements = []
    for (let i = 0; i < trailCount; i++) {
      const trail = document.createElement('div')
      trail.className = 'cursor-trail'
      trail.style.opacity = (trailCount - i) / trailCount * 0.4
      trail.style.transform = `scale(${(trailCount - i) / trailCount * 0.6})`
      trailElements.push(trail)
      document.body.appendChild(trail)
    }
    trailRef.current = trailElements
    
    document.body.appendChild(dot)
    document.body.appendChild(ring)
    document.body.classList.add('custom-cursor')

    // Enhanced cursor positioning with better offsets
    let mouseX = 0
    let mouseY = 0
    let dotX = 0
    let dotY = 0
    let ringX = 0
    let ringY = 0
    let trailPositions = Array(trailCount).fill({ x: 0, y: 0 })

    const updateCursor = () => {
      // Enhanced smooth follow animation with device-specific easing
      const dotEasing = isMobile.current ? 0.8 : 0.95
      const ringEasing = isMobile.current ? 0.2 : 0.25
      
      dotX += (mouseX - dotX) * dotEasing
      dotY += (mouseY - dotY) * dotEasing
      ringX += (mouseX - ringX) * ringEasing
      ringY += (mouseY - ringY) * ringEasing

      // Enhanced positioning with better centering
      const dotSize = window.innerWidth > 1024 ? 48 : 12
      const ringSize = window.innerWidth > 1024 ? 120 : 36
      
      dot.style.transform = `translate(${dotX - dotSize/2}px, ${dotY - dotSize/2}px)`
      ring.style.transform = `translate(${ringX - ringSize/2}px, ${ringY - ringSize/2}px)`

      // Update trail with enhanced positioning
      if (trailCount > 0) {
        trailPositions = [
          { x: dotX, y: dotY },
          ...trailPositions.slice(0, -1)
        ]

        trailElements.forEach((trail, index) => {
          const pos = trailPositions[index]
          if (pos) {
            const scale = (trailCount - index) / trailCount * 0.6
            const trailSize = window.innerWidth > 1024 ? 20 : 5
            trail.style.transform = `translate(${pos.x - trailSize/2}px, ${pos.y - trailSize/2}px) scale(${scale})`
          }
        })
      }

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

    // Enhanced hover detection with better element targeting
    const handleMouseEnter = (e) => {
      const target = e.target
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.classList.contains('cursor-hover') ||
        target.classList.contains('cursor-pointer') ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('.cursor-hover') ||
        target.closest('.cursor-pointer')
      ) {
        document.body.classList.add('cursor-hover')
      }
    }

    const handleMouseLeave = (e) => {
      const target = e.target
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.classList.contains('cursor-hover') ||
        target.classList.contains('cursor-pointer') ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('.cursor-hover') ||
        target.closest('.cursor-pointer')
      ) {
        document.body.classList.remove('cursor-hover')
      }
    }

    // Enhanced loading state detection
    const handleLoadingState = () => {
      const loadingElements = document.querySelectorAll('.loading, .cursor-loading, [data-loading="true"]')
      if (loadingElements.length > 0) {
        document.body.classList.add('cursor-loading')
      } else {
        document.body.classList.remove('cursor-loading')
      }
    }

    // Enhanced resize handler for responsive behavior
    const handleResize = () => {
      const width = window.innerWidth
      isMobile.current = width <= 640
      
      if (isMobile.current && isTouch.current) {
        // Hide cursor on small touch devices
        dot.style.display = 'none'
        ring.style.display = 'none'
        trailElements.forEach(trail => {
          trail.style.display = 'none'
        })
      } else {
        // Show cursor on larger screens with appropriate sizing
        dot.style.display = 'block'
        ring.style.display = 'block'
        trailElements.forEach(trail => {
          trail.style.display = 'block'
        })
        
        // Update cursor sizes based on screen size
        if (width > 1024) {
          // Desktop: very large cursor
          dot.style.width = '48px'
          dot.style.height = '48px'
          ring.style.width = '120px'
          ring.style.height = '120px'
          ring.style.borderWidth = '6px'
        } else {
          // Tablet: medium cursor
          dot.style.width = '12px'
          dot.style.height = '12px'
          ring.style.width = '36px'
          ring.style.height = '36px'
          ring.style.borderWidth = '2px'
        }
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseenter', handleMouseEnter, true)
    document.addEventListener('mouseleave', handleMouseLeave, true)
    window.addEventListener('resize', handleResize)
    
    // Observe DOM changes for loading states
    const observer = new MutationObserver(handleLoadingState)
    observer.observe(document.body, { 
      childList: true, 
      subtree: true, 
      attributes: true, 
      attributeFilter: ['class', 'data-loading'] 
    })

    // Initial setup
    handleResize()
    handleLoadingState()
    updateCursor()

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseenter', handleMouseEnter, true)
      document.removeEventListener('mouseleave', handleMouseLeave, true)
      window.removeEventListener('resize', handleResize)
      observer.disconnect()
      
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
      
      document.body.classList.remove('custom-cursor', 'cursor-hover', 'cursor-click', 'cursor-loading')
    }
  }, [])

  return null
}

export default useCustomCursor