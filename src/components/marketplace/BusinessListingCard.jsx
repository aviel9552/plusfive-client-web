import { Link } from 'react-router-dom'
import { FiMapPin } from 'react-icons/fi'
import { withCacheBuster } from '../../utils/imageUrl'
import { BRAND_COLOR } from '../../utils/constants'
import { useLanguage } from '../../context/LanguageContext'
import { getMarketplaceTranslations } from '../../utils/translations'

function formatBusinessType(type) {
  if (!type || typeof type !== 'string') return null
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function StarIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      aria-hidden
      fill="currentColor"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.951-.69l1.286-3.957z" />
    </svg>
  )
}

function CardImage({ business }) {
  const imageUrl = business.profileImage
  const src = imageUrl ? withCacheBuster(imageUrl) : null
  const name = business.businessName || business.name || 'B'
  const initial = name.charAt(0).toUpperCase()

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
      />
    )
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-pink-100 via-purple-50 to-violet-100 dark:from-pink-950/50 dark:via-purple-950/40 dark:to-violet-950/50">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 80%, rgba(255,37,124,0.35) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(126,58,242,0.25) 0%, transparent 45%)',
        }}
      />
      <span
        className="relative text-5xl font-bold tracking-tight"
        style={{ color: BRAND_COLOR }}
      >
        {initial}
      </span>
    </div>
  )
}

export default function BusinessListingCard({ business, badge }) {
  const { language } = useLanguage()
  const t = getMarketplaceTranslations(language)
  const slug = business.businessSlug
  const name = business.businessName || business.name || ''
  const href = slug ? `/business/${encodeURIComponent(slug)}` : '#'
  const businessType = formatBusinessType(business.businessType)
  const rating = business.rating ?? business.averageRating ?? null
  const reviewCount = business.reviewCount ?? business.totalReviews ?? null
  const ratingValue = rating ? parseFloat(rating) : null

  return (
    <Link
      to={href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:border-gray-700/80 dark:bg-[#1a1a1a] dark:hover:border-gray-600"
    >
      {/* ── Image ── */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-gray-100 dark:bg-gray-900">
        <CardImage business={business} />

        {/* Featured badge — top left */}
        {badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm backdrop-blur-sm">
            {badge}
          </span>
        ) : null}
      </div>

      {/* ── Info ── */}
      <div className="flex flex-col gap-0.5 px-3 py-3 sm:px-4 sm:py-3.5">
        {/* Row 1: name + rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 flex-1 text-sm font-semibold text-gray-900 dark:text-white sm:text-[0.9375rem]">
            {name}
          </h3>
          {ratingValue && !isNaN(ratingValue) ? (
            <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-gray-900 dark:text-white">
              <StarIcon className="h-3.5 w-3.5 text-yellow-400" />
              {ratingValue.toFixed(1)}
            </span>
          ) : null}
        </div>

        {/* Row 2: address */}
        {business.address ? (
          <p className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
            {business.address}
          </p>
        ) : null}

        {/* Row 3: type · reviews */}
        {(businessType || reviewCount) ? (
          <p className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
            {businessType}
            {businessType && reviewCount ? (
              <span className="mx-1 text-gray-300 dark:text-gray-600">·</span>
            ) : null}
            {reviewCount ? `${Number(reviewCount).toLocaleString()} ${t.reviews || 'reviews'}` : null}
          </p>
        ) : null}
      </div>
    </Link>
  )
}
