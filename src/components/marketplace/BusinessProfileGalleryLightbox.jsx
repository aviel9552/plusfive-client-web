import { useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi'
import { withCacheBuster } from '../../utils/imageUrl'

export default function BusinessProfileGalleryLightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
  actionLabel,
  onAction,
}) {
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') onPrev()
      if (event.key === 'ArrowRight') onNext()
    },
    [onClose, onPrev, onNext],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [handleKeyDown])

  if (!images.length || index < 0 || index >= images.length) return null

  const currentSrc = images[index]

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
    >
      <div className="absolute top-4 left-4 rounded-lg bg-black/50 px-3 py-1.5 text-sm font-semibold text-white">
        {index + 1}/{images.length}
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        aria-label="Close"
      >
        <FiX className="h-5 w-5" />
      </button>

      {images.length > 1 ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onPrev()
          }}
          className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg bg-black/70 text-white transition hover:bg-black/90 md:bg-white/10 md:hover:bg-white/20"
          aria-label="Previous image"
        >
          <FiChevronLeft className="h-6 w-6" />
        </button>
      ) : null}

      <img
        src={withCacheBuster(currentSrc)}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-h-[78vh] max-w-[92vw] select-none rounded-lg object-contain sm:max-h-[86vh] sm:max-w-[90vw]"
        draggable={false}
      />

      {images.length > 1 ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg bg-black/70 text-white transition hover:bg-black/90 md:bg-white/10 md:hover:bg-white/20"
          aria-label="Next image"
        >
          <FiChevronRight className="h-6 w-6" />
        </button>
      ) : null}

      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onAction()
          }}
          className="absolute bottom-6 left-1/2 max-w-[min(92vw,360px)] -translate-x-1/2 rounded-full bg-white px-8 py-3 text-sm font-semibold text-gray-900 shadow-lg transition hover:bg-gray-100"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>,
    document.body,
  )
}
