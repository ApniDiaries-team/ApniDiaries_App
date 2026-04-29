// useCountUp.js - React Native compatible (no DOM/IntersectionObserver needed)
import { useEffect, useRef, useState } from 'react'

export function useCountUp(target, isVisible, duration = 1500) {
  const [count, setCount] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return

    hasAnimated.current = true
    let start = 0
    const increment = target / (duration / 16)

    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [isVisible, target, duration])

  return count
}
