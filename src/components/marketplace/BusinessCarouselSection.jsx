import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FiChevronRight } from 'react-icons/fi'
import { searchPublicBusinesses } from '../../services/publicBookingService'
import BusinessListingCard from './BusinessListingCard'
import CommonLoader from '../commonComponent/CommonLoader'
import { useLanguage } from '../../context/LanguageContext'
import { getMarketplaceTranslations } from '../../utils/translations'

export default function BusinessCarouselSection({
  title,
  viewAllHref = '/browse',
  query = '',
  limit = 8,
  badge,
}) {
  const { language } = useLanguage()
  const t = getMarketplaceTranslations(language)

  const { data, isPending, isError } = useQuery({
    queryKey: ['public-businesses', query, limit, 1],
    queryFn: () => searchPublicBusinesses({ q: query, page: 1, limit }),
    staleTime: 60 * 1000,
  })

  const businesses = data?.businesses ?? []

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            {title}
          </h2>
          <Link
            to={viewAllHref}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-gray-700 hover:text-customPink dark:text-gray-300"
          >
            {t.viewAll}
            <FiChevronRight />
          </Link>
        </div>

        {isPending ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <CommonLoader />
          </div>
        ) : isError || businesses.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center text-gray-500 dark:border-gray-700">
            {t.noBusinesses}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {businesses.map((business) => (
              <BusinessListingCard
                key={business.businessId || business.businessSlug}
                business={business}
                badge={badge}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
