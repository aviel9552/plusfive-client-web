import { FiCheck, FiMapPin } from 'react-icons/fi'
import { BRAND_COLOR } from '../../utils/constants'
import { withCacheBuster } from '../../utils/imageUrl'
import {
  bookingCardButtonClass,
  bookingSelectedCardClass,
  bookingDefaultCardClass,
} from './bookingStyles'

function BusinessAvatar({ name, image, size = 'md' }) {
  const initial = (name || 'B').charAt(0).toUpperCase()
  const sizeClass = size === 'sm' ? 'h-10 w-10 text-sm' : 'h-12 w-12 text-base sm:h-14 sm:w-14 sm:text-lg'
  const imageUrl = image ? withCacheBuster(image) : null

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className={`shrink-0 rounded-full object-cover ${sizeClass}`}
      />
    )
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-gray-100 font-bold ${sizeClass}`}
      style={{ color: BRAND_COLOR }}
    >
      {initial}
    </span>
  )
}

export default function BusinessPickerCard({
  business,
  isSelected,
  onSelect,
  badge,
  disabled = false,
}) {
  const name = business.businessName || business.name || ''
  const slug = business.businessSlug

  return (
    <button
      type="button"
      disabled={disabled || !slug}
      onClick={() => slug && onSelect(business)}
      className={`${bookingCardButtonClass} ${
        isSelected ? bookingSelectedCardClass : bookingDefaultCardClass
      } ${disabled || !slug ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <BusinessAvatar name={name} image={business.profileImage || business.image} />
        <div className="min-w-0 flex-1 text-start">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold text-gray-900 dark:text-gray-100">{name}</p>
            {badge ? (
              <span className="shrink-0 rounded-md bg-customPink/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-customPink">
                {badge}
              </span>
            ) : null}
          </div>
          {business.address ? (
            <p className="mt-0.5 flex items-start gap-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
              <FiMapPin className="mt-0.5 shrink-0" />
              <span className="line-clamp-2">{business.address}</span>
            </p>
          ) : null}
        </div>
      </div>
      {isSelected ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-customPink text-white">
          <FiCheck />
        </span>
      ) : null}
    </button>
  )
}
