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
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4)
  }, [])

  useEffect(() => {
    if (!scrollable || !businesses.length) return undefined
    const el = scrollRef.current
    if (!el) return undefined
    updateScrollState()
    window.addEventListener('resize', updateScrollState)
    el.addEventListener('scroll', updateScrollState, { passive: true })
    return () => {
      window.removeEventListener('resize', updateScrollState)
      el.removeEventListener('scroll', updateScrollState)
    }
  }, [scrollable, businesses.length, updateScrollState])

  const scrollByStep = (dir) => {
    const el = scrollRef.current
    if (!el) return
    const step = (el.firstElementChild?.clientWidth ?? el.clientWidth * 0.85) + 16
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' })
  }

  if (hideWhenEmpty && !isPending && (isError || businesses.length === 0)) return null

  const showArrows = scrollable && !isPending && businesses.length > 0

  return (
    <section className="py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Section header ── */}
        <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
          <div className="min-w-0">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                {subtitle}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* header arrows — mobile only (desktop uses edge arrows) */}
            {showArrows ? (
              <div className="flex items-center gap-2 sm:hidden">
                <button
                  type="button"
                  onClick={() => scrollByStep('left')}
                  disabled={!canScrollLeft}
                  aria-label={t.scrollPrev}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-gray-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-[#1e1e1e] dark:text-gray-200 dark:hover:border-gray-500"
                >
                  <FiChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByStep('right')}
                  disabled={!canScrollRight}
                  aria-label={t.scrollNext}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-gray-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-[#1e1e1e] dark:text-gray-200 dark:hover:border-gray-500"
                >
                  <FiChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}

            <Link
              to={viewAllTo}
              className="text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white sm:text-sm"
            >
              {t.viewAll}
            </Link>
          </div>
        </div>

        {/* ── Content ── */}
        {isPending ? (
          <div className="flex min-h-[180px] items-center justify-center">
            <CommonLoader />
          </div>
        ) : isError || businesses.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500 dark:border-gray-700 sm:py-12">
            {t.noBusinesses}
          </p>
        ) : scrollable ? (
          <div className="group/carousel relative">
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto pb-3 pt-0.5 snap-x snap-mandatory scroll-smooth touch-pan-x [-webkit-overflow-scrolling:touch] [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden"
            >
              {businesses.map((business) => (
                <div
                  key={business.businessId || business.businessSlug}
                  className="w-[min(72vw,260px)] shrink-0 snap-start sm:w-[260px] lg:w-[280px]"
                >
                  <BusinessListingCard business={business} badge={badge} />
                </div>
              ))}
            </div>

            {/* edge arrows — desktop only, at the left/right edges, vertically centered */}
            {showArrows ? (
              <>
                <button
                  type="button"
                  onClick={() => scrollByStep('left')}
                  aria-label={t.scrollPrev}
                  className={`absolute -left-5 top-[42%] z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition hover:scale-105 hover:shadow-lg dark:border-gray-700 dark:bg-[#1e1e1e] dark:text-gray-200 sm:flex ${
                    canScrollLeft ? 'opacity-100' : 'pointer-events-none opacity-0'
                  }`}
                >
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByStep('right')}
                  aria-label={t.scrollNext}
                  className={`absolute -right-5 top-[42%] z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition hover:scale-105 hover:shadow-lg dark:border-gray-700 dark:bg-[#1e1e1e] dark:text-gray-200 sm:flex ${
                    canScrollRight ? 'opacity-100' : 'pointer-events-none opacity-0'
                  }`}
                >
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </>
            ) : null}
          </div>
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
