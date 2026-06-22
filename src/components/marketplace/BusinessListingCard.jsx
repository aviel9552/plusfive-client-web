import { Link } from 'react-router-dom'
import { FiMapPin } from 'react-icons/fi'
import { withCacheBuster } from '../../utils/imageUrl'
import { BRAND_COLOR } from '../../utils/constants'

function CardImage({ business }) {
  const imageUrl = business.coverImage || business.profileImage
  const src = imageUrl ? withCacheBuster(imageUrl) : null
  const name = business.businessName || business.name || 'B'
  const initial = name.charAt(0).toUpperCase()

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
      />
    )
  }

  return (
    <div
      className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 text-4xl font-bold dark:from-pink-950/40 dark:via-purple-950/30 dark:to-blue-950/40"
      style={{ color: BRAND_COLOR }}
    >
      {initial}
    </div>
  )
}

export default function BusinessListingCard({ business, badge }) {
  const slug = business.businessSlug
  const name = business.businessName || business.name || ''
  const href = slug ? `/business/${encodeURIComponent(slug)}` : '#'

  return (
    <Link
      to={href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-[#111111]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-900">
        <CardImage business={business} />
        {badge ? (
          <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-base font-semibold text-gray-900 dark:text-white">{name}</h3>
        </div>
        {business.address ? (
          <p className="mt-1.5 flex items-start gap-1 text-sm text-gray-500 dark:text-gray-400">
            <FiMapPin className="mt-0.5 shrink-0" />
            <span className="line-clamp-2">{business.address}</span>
          </p>
        ) : null}
      </div>
    </Link>
  )
}
