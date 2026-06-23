import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { searchPublicBusinesses } from '../../services/publicBookingService'
import BusinessListingCard from './BusinessListingCard'
import CommonLoader from '../commonComponent/CommonLoader'
import { useLanguage } from '../../context/LanguageContext'
import { getMarketplaceTranslations } from '../../utils/translations'

export default function BusinessCarouselSection({
  title,
  subtitle,
  viewAllHref = '/browse',
  viewAllSearchParams,
  query = '',
  sort = 'recommended',
  limit = 8,
  badge,
  scrollable = false,
  hideWhenEmpty = false,
}) {
  const { language } = useLanguage()
  const t = getMarketplaceTranslations(language)
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const viewAllTo = viewAllSearchParams
    ? `${viewAllHref}?${viewAllSearchParams}`
    : viewAllHref

  const { data, isPending, isError } = useQuery({
    queryKey: ['public-businesses', sort, query, limit, 1],
    queryFn: () => searchPublicBusinesses({ q: query, page: 1, limit, sort }),
    staleTime: 60 * 1000,
  })

  const businesses = data?.businesses ?? []

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const maxScroll = scrollWidth - clientWidth
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft < maxScroll - 4)
  }, [])

  useEffect(() => {
    if (!scrollable || !businesses.length) return undefined

    const el = scrollRef.current
    if (!el) return undefined

    updateScrollState()

    const onResize = () => updateScrollState()
    window.addEventListener('resize', onResize)
    el.addEventListener('scroll', updateScrollState, { passive: true })

    return () => {
      window.removeEventListener('resize', onResize)
      el.removeEventListener('scroll', updateScrollState)
    }
  }, [scrollable, businesses.length, updateScrollState])

  const scrollByStep = (direction) => {
    const el = scrollRef.current
    if (!el) return
    const firstCard = el.firstElementChild
    const step = firstCard?.clientWidth ? firstCard.clientWidth + 16 : el.clientWidth * 0.85
    const delta = direction === 'left' ? -step : step
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  if (hideWhenEmpty && !isPending && (isError || businesses.length === 0)) {
    return null
  }

  return (
    <section className="py-8 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl lg:text-3xl">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:mt-1 sm:text-sm">
                {subtitle}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3 sm:pt-1">
            {scrollable && !isPending && businesses.length > 0 ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollByStep('left')}
                  disabled={!canScrollLeft}
                  aria-label={t.scrollPrev}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-customPink/40 hover:text-customPink disabled:cursor-not-allowed disabled:opacity-35 dark:border-gray-700 dark:bg-[#141414] dark:text-gray-200 sm:h-9 sm:w-9"
                >
                  <FiChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByStep('right')}
                  disabled={!canScrollRight}
                  aria-label={t.scrollNext}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-customPink/40 hover:text-customPink disabled:cursor-not-allowed disabled:opacity-35 dark:border-gray-700 dark:bg-[#141414] dark:text-gray-200 sm:h-9 sm:w-9"
                >
                  <FiChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            ) : null}

            <Link
              to={viewAllTo}
              className="inline-flex items-center gap-0.5 text-xs font-semibold text-gray-700 hover:text-customPink dark:text-gray-300 sm:gap-1 sm:text-sm"
            >
              {t.viewAll}
              <FiChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {isPending ? (
          <div className="flex min-h-[180px] items-center justify-center sm:min-h-[200px]">
            <CommonLoader />
          </div>
        ) : isError || businesses.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500 dark:border-gray-700 sm:px-6 sm:py-12">
            {t.noBusinesses}
          </p>
        ) : scrollable ? (
          <div
            ref={scrollRef}
            className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 pt-0.5 snap-x snap-mandatory scroll-smooth touch-pan-x [-webkit-overflow-scrolling:touch] [scrollbar-width:none] sm:-mx-6 sm:gap-4 sm:px-6 lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
          >
            {businesses.map((business) => (
              <div
                key={business.businessId || business.businessSlug}
                className="w-[min(78vw,300px)] shrink-0 snap-start sm:w-[280px] lg:w-[300px]"
              >
                <BusinessListingCard business={business} badge={badge} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
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
