import { useEffect, useRef, useState } from 'react'

/**
 * Counts up from 0 to `end` when the element scrolls into view.
 * Renders the count with an optional prefix/suffix (e.g. "10,000+").
 */
export default function AnimatedCounter({
  end,
  duration = 1800,
  prefix = '',
  suffix = '',
  className = '',
}) {
  const [count, setCount] = useState(0)
  const startRef = useRef(null)
  const rafRef = useRef(null)
  const observerRef = useRef(null)
  const elRef = useRef(null)
  const doneRef = useRef(false)

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(ease * end))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        doneRef.current = true
      }
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !doneRef.current) {
          startRef.current = null
          rafRef.current = requestAnimationFrame(animate)
          observerRef.current?.disconnect()
        }
      },
      { threshold: 0.3 },
    )

    observerRef.current.observe(el)

    return () => {
      observerRef.current?.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [end, duration])

  return (
    <span ref={elRef} className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}
