import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import HeroSearchBar from '../../components/marketplace/HeroSearchBar'
import BusinessListingCard from '../../components/marketplace/BusinessListingCard'
import CommonLoader from '../../components/commonComponent/CommonLoader'
import CommonPagination from '../../components/commonComponent/CommonPagination'
import { searchPublicBusinesses } from '../../services/publicBookingService'
import { useLanguage } from '../../context/LanguageContext'
import { getMarketplaceTranslations } from '../../utils/translations'

const PAGE_SIZE = 12

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { language } = useLanguage()
  const t = getMarketplaceTranslations(language)

  const qParam = searchParams.get('q') || ''
  const sortParam = searchParams.get('sort') || 'recommended'
  const pageParam = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)

  const sortTitleMap = {
    recommended: t.recommended,
    trending: t.trending,
    new: t.newOnPlusfive,
  }
  const pageTitle = sortTitleMap[sortParam] || t.browseTitle

  const { data, isPending, isError } = useQuery({
    queryKey: ['public-businesses-browse', qParam, sortParam, pageParam],
    queryFn: () =>
      searchPublicBusinesses({ q: qParam, page: pageParam, limit: PAGE_SIZE, sort: sortParam }),
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  })

  const businesses = data?.businesses ?? []
  const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: 0 }

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(page))
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          {pageTitle}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{t.browseSubtitle}</p>
      </div>

      <div className="mb-8 max-w-3xl">
        <HeroSearchBar initialQuery={qParam} compact />
      </div>

      {qParam ? (
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          {t.resultsFor} &ldquo;{qParam}&rdquo;
          {pagination.total ? ` · ${pagination.total} ${t.results}` : ''}
        </p>
      ) : null}

      {isPending && !businesses.length ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <CommonLoader />
        </div>
      ) : isError ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {t.loadError}
        </p>
      ) : businesses.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center text-gray-500 dark:border-gray-700">
          {t.noBusinesses}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {businesses.map((business) => (
              <BusinessListingCard
                key={business.businessId || business.businessSlug}
                business={business}
              />
            ))}
          </div>

          {pagination.total > PAGE_SIZE ? (
            <div className="mt-10">
              <CommonPagination
                currentPage={pageParam}
                pageSize={PAGE_SIZE}
                total={pagination.total}
                onPageChange={handlePageChange}
                showPageSizeSelector={false}
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
