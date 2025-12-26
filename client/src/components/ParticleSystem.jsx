import { useEffect, useRef } from 'react'

const ParticleSystem = ({ particleCount = 50, theme = 'light' }) => {
  const containerRef = useRef(null)
  const particlesRef = useRef([])
  const animationRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    // Clear existing particles
    container.innerHTML = ''
    particlesRef.current = []

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = 'particle'
      
      const size = Math.random() * 4 + 2
      const x = Math.random() * window.innerWidth
      const y = Math.random() * window.innerHeight
      const speedX = (Math.random() - 0.5) * 0.5
      const speedY = (Math.random() - 0.5) * 0.5
      const opacity = Math.random() * 0.5 + 0.1

      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      particle.style.left = `${x}px`
      particle.style.top = `${y}px`
      particle.style.opacity = opacity

      container.appendChild(particle)
      
      particlesRef.current.push({
        element: particle,
        x,
        y,
        speedX,
        speedY,
        size,
        opacity,
        baseOpacity: opacity
      })
    }

    // Animation loop
    const animate = () => {
      particlesRef.current.forEach(particle => {
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Wrap around screen
        if (particle.x > window.innerWidth) particle.x = -particle.size
        if (particle.x < -particle.size) particle.x = window.innerWidth
        if (particle.y > window.innerHeight) particle.y = -particle.size
        if (particle.y < -particle.size) particle.y = window.innerHeight

        // Update position
        particle.element.style.left = `${particle.x}px`
        particle.element.style.top = `${particle.y}px`

        // Pulse effect
        const pulse = Math.sin(Date.now() * 0.001 + particle.x * 0.01) * 0.3 + 0.7
        particle.element.style.opacity = particle.baseOpacity * pulse
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      particlesRef.current.forEach(particle => {
        if (particle.x > window.innerWidth) particle.x = window.innerWidth
        if (particle.y > window.innerHeight) particle.y = window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [particleCount, theme])

  return (
    <div 
      ref={containerRef}
      className="particles-container"
      style={{ opacity: theme === 'dark' ? 0.3 : 0.2 }}
    />
  )
}

export default ParticleSystem