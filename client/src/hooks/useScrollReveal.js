import { useEffect, useRef } from 'react'

const useScrollReveal = (options = {}) => {
  const elementRef = useRef(null)
  
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
    delay = 0,
    duration = 600,
    easing = 'ease-out',
    direction = 'up', // 'up', 'down', 'left', 'right', 'fade'
    distance = 50
  } = options

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      element.style.opacity = '1'
      element.style.transform = 'none'
      return
    }

    // Set initial styles
    element.style.opacity = '0'
    element.style.transition = `opacity ${duration}ms ${easing} ${delay}ms, transform ${duration}ms ${easing} ${delay}ms`
    
    switch (direction) {
      case 'up':
        element.style.transform = `translateY(${distance}px)`
        break
      case 'down':
        element.style.transform = `translateY(-${distance}px)`
        break
      case 'left':
        element.style.transform = `translateX(${distance}px)`
        break
      case 'right':
        element.style.transform = `translateX(-${distance}px)`
        break
      case 'fade':
        element.style.transform = 'scale(0.9)'
        break
      default:
        element.style.transform = `translateY(${distance}px)`
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1'
            entry.target.style.transform = 'translateY(0) translateX(0) scale(1)'
            
            if (triggerOnce) {
              observer.unobserve(entry.target)
            }
          } else if (!triggerOnce) {
            entry.target.style.opacity = '0'
            switch (direction) {
              case 'up':
                entry.target.style.transform = `translateY(${distance}px)`
                break
              case 'down':
                entry.target.style.transform = `translateY(-${distance}px)`
                break
              case 'left':
                entry.target.style.transform = `translateX(${distance}px)`
                break
              case 'right':
                entry.target.style.transform = `translateX(-${distance}px)`
                break
              case 'fade':
                entry.target.style.transform = 'scale(0.9)'
                break
              default:
                entry.target.style.transform = `translateY(${distance}px)`
            }
          }
        })
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, triggerOnce, delay, duration, easing, direction, distance])

  return elementRef
}

export default useScrollReveal