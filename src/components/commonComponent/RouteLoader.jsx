import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import CommonLoader from './CommonLoader'

function isBookingFlowPath(pathname) {
  return pathname.startsWith('/client/book')
}

export default function RouteLoader({ children, loadTime = 100 }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [isFadingIn, setIsFadingIn] = useState(false)
  const location = useLocation()
  const previousPathRef = useRef(location.pathname)

  useEffect(() => {
    const previousPath = previousPathRef.current
    const currentPath = location.pathname
    previousPathRef.current = currentPath

    const skipLoader =
      isBookingFlowPath(previousPath) && isBookingFlowPath(currentPath)

    if (skipLoader) {
      setIsLoading(false)
      setIsFadingOut(false)
      setIsFadingIn(false)
      return undefined
    }

    setIsLoading(true)
    setIsFadingOut(false)
    setIsFadingIn(true)

    const fadeInTimer = setTimeout(() => setIsFadingIn(false), 200)

    const loadTimer = setTimeout(() => {
      setIsFadingOut(true)
      setTimeout(() => {
        setIsLoading(false)
        setIsFadingOut(false)
      }, 500)
    }, loadTime)

    return () => {
      clearTimeout(fadeInTimer)
      clearTimeout(loadTimer)
    }
  }, [location.pathname, loadTime])

  if (isLoading) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity ease-out dark:bg-customBlack ${
          isFadingIn
            ? 'opacity-0 duration-200'
            : isFadingOut
              ? 'opacity-0 duration-500'
              : 'opacity-100 duration-200'
        }`}
      >
        <CommonLoader />
      </div>
    )
  }

  return children
}
