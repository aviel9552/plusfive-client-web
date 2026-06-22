import { useEffect, useMemo, useRef, useState } from 'react'
import { FiCamera, FiImage } from 'react-icons/fi'
import BusinessProfileGalleryLightbox from './BusinessProfileGalleryLightbox'

const ROTATE_MS = 4500
const SWIPE_THRESHOLD = 48

function GalleryImage({ src, alt, className = '', onClick, roundedClass = 'rounded-2xl' }) {
  const clickable = typeof onClick === 'function'
  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={`relative min-h-0 overflow-hidden bg-gray-200 dark:bg-gray-800 ${roundedClass} ${
        clickable ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <img
        key={src}
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover object-center animate-[galleryFadeIn_0.7s_ease-out]"
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </div>
  )
}

function getRotatedImages(images, offset) {
  const count = images.length
  if (count <= 1) return images
  const start = ((offset % count) + count) % count
  return Array.from({ length: count }, (_, i) => images[(start + i) % count])
}

export default function BusinessProfileGallery({
  images,
  businessName,
  seeAllLabel,
  chooseServicesLabel,
  onChooseServices,
}) {
  const displayImages = useMemo(() => images.filter(Boolean), [images])
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [slideOffset, setSlideOffset] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef(null)

  const rotated = useMemo(
    () => getRotatedImages(displayImages, slideOffset),
    [displayImages, slideOffset],
  )

  const activeIndex =
    displayImages.length > 0
      ? ((slideOffset % displayImages.length) + displayImages.length) % displayImages.length
      : 0

  useEffect(() => {
    if (displayImages.length <= 1 || isPaused || lightboxIndex != null) return undefined

    const timer = window.setInterval(() => {
      setSlideOffset((prev) => prev + 1)
    }, ROTATE_MS)

    return () => window.clearInterval(timer)
  }, [displayImages.length, isPaused, lightboxIndex])

  const openLightbox = (index) => {
    if (!displayImages.length) return
    const safeIndex = Math.max(0, Math.min(index, displayImages.length - 1))
    setLightboxIndex(safeIndex)
  }

  const closeLightbox = () => setLightboxIndex(null)

  const showPrev = () => {
    setLightboxIndex((prev) =>
      prev == null ? null : (prev - 1 + displayImages.length) % displayImages.length,
    )
  }

  const showNext = () => {
    setLightboxIndex((prev) =>
      prev == null ? null : (prev + 1) % displayImages.length,
    )
  }

  const handleChooseServices = () => {
    closeLightbox()
    onChooseServices?.()
  }

  const goToSlide = (direction) => {
    setSlideOffset((prev) => prev + direction)
  }

  const pauseProps = {
    onMouseEnter: () => setIsPaused(true),
    onMouseLeave: () => setIsPaused(false),
    onFocus: () => setIsPaused(true),
    onBlur: () => setIsPaused(false),
  }

  const touchProps = {
    onTouchStart: (e) => {
      touchStartX.current = e.touches[0]?.clientX ?? null
      setIsPaused(true)
    },
    onTouchEnd: (e) => {
      const startX = touchStartX.current
      touchStartX.current = null
      const endX = e.changedTouches[0]?.clientX
      if (startX == null || endX == null) {
        setIsPaused(false)
        return
      }
      const diff = startX - endX
      if (Math.abs(diff) >= SWIPE_THRESHOLD) {
        goToSlide(diff > 0 ? 1 : -1)
      }
      window.setTimeout(() => setIsPaused(false), 600)
    },
  }

  const lightbox =
    lightboxIndex != null ? (
      <BusinessProfileGalleryLightbox
        images={displayImages}
        index={lightboxIndex}
        onClose={closeLightbox}
        onPrev={showPrev}
        onNext={showNext}
        actionLabel={chooseServicesLabel}
        onAction={onChooseServices ? handleChooseServices : undefined}
      />
    ) : null

  if (displayImages.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-900 sm:aspect-[2/1]">
        <FiImage className="h-10 w-10" />
      </div>
    )
  }

  const [main, second, third] = rotated
  const mainIndex = displayImages.indexOf(main)
  const secondIndex = displayImages.indexOf(second)
  const thirdIndex = displayImages.indexOf(third)
  const mobileHero = rotated[0]
  const mobileHeroIndex = displayImages.indexOf(mobileHero)

  const seeAllButton = (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        openLightbox(0)
      }}
      className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-2 text-xs font-semibold text-white shadow-md backdrop-blur-sm transition hover:bg-black/80 sm:bottom-3 sm:right-3 sm:px-4 sm:py-2 sm:text-sm sm:bg-white/95 sm:text-gray-900 sm:hover:bg-white dark:sm:bg-gray-900/95 dark:sm:text-white dark:sm:hover:bg-gray-900"
    >
      <FiCamera className="h-4 w-4 shrink-0" />
      <span>{seeAllLabel}</span>
      {displayImages.length > 1 ? (
        <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[11px] tabular-nums sm:bg-gray-900/10 sm:dark:bg-white/15">
          {displayImages.length}
        </span>
      ) : null}
    </button>
  )

  return (
    <>
      <style>{`
        @keyframes galleryFadeIn {
          from { opacity: 0.55; transform: scale(1.02); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Mobile: full-width hero carousel */}
      <div
        className="relative -mx-4 sm:hidden"
        {...pauseProps}
        {...touchProps}
      >
        <GalleryImage
          src={mobileHero}
          alt={businessName}
          className="aspect-[4/3] w-full"
          roundedClass="rounded-none"
          onClick={() => openLightbox(mobileHeroIndex)}
        />

        {displayImages.length > 1 ? (
          <div
            className={`absolute left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 ${
              displayImages.length >= 2 ? 'bottom-12' : 'bottom-3'
            }`}
          >
            {displayImages.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`Image ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setSlideOffset(i)
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        ) : null}

        {displayImages.length >= 2 ? seeAllButton : null}
      </div>

      {/* Desktop: Fresha-style grid */}
      {displayImages.length === 1 ? (
        <GalleryImage
          src={main}
          alt={businessName}
          className="hidden aspect-[5/2] w-full sm:block"
          onClick={() => openLightbox(0)}
        />
      ) : null}

      {displayImages.length === 2 ? (
        <div
          className="hidden h-[clamp(200px,42vw,440px)] grid-cols-2 gap-3 sm:grid"
          {...pauseProps}
        >
          <GalleryImage
            src={main}
            alt={businessName}
            className="h-full"
            onClick={() => openLightbox(mainIndex)}
          />
          <GalleryImage
            src={second}
            alt=""
            className="h-full"
            onClick={() => openLightbox(secondIndex)}
          />
        </div>
      ) : null}

      {displayImages.length >= 3 ? (
        <div
          className="hidden h-[clamp(200px,42vw,440px)] grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] grid-rows-2 gap-3 sm:grid"
          {...pauseProps}
        >
          <GalleryImage
            src={main}
            alt={businessName}
            className="row-span-2 h-full min-h-0"
            onClick={() => openLightbox(mainIndex)}
          />
          <GalleryImage
            src={second}
            alt=""
            className="h-full min-h-0"
            onClick={() => openLightbox(secondIndex)}
          />
          <div className="relative h-full min-h-0">
            <GalleryImage
              src={third}
              alt=""
              className="h-full"
              onClick={() => openLightbox(thirdIndex)}
            />
            {seeAllButton}
          </div>
        </div>
      ) : null}

      {lightbox}
    </>
  )
}
