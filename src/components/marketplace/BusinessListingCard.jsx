import { Link } from 'react-router-dom'
import { FiMapPin, FiArrowRight } from 'react-icons/fi'
import { withCacheBuster } from '../../utils/imageUrl'
import { BRAND_COLOR } from '../../utils/constants'
import { useLanguage } from '../../context/LanguageContext'
import { getMarketplaceTranslations } from '../../utils/translations'

function formatBusinessType(type) {
  if (!type || typeof type !== 'string') return null
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
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
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
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

  return (
    <Link
      to={href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-customPink/30 hover:shadow-lg hover:shadow-customPink/5 dark:border-gray-800 dark:bg-[#111111] dark:hover:border-customPink/40"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-900">
        <CardImage business={business} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
        {badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm backdrop-blur-sm">
            {badge}
          </span>
        ) : null}
        {businessType ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {businessType}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
          {name}
        </h3>
        {business.address ? (
          <p className="mt-1.5 flex items-start gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <FiMapPin className="mt-0.5 shrink-0 text-customPink/70" />
            <span className="line-clamp-2">{business.address}</span>
          </p>
        ) : null}

        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-customPink transition group-hover:gap-2.5">
          {t.bookNow}
          <FiArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}
