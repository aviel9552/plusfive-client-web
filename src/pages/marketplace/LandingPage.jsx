import { Link } from 'react-router-dom'
import HeroSearchBar from '../../components/marketplace/HeroSearchBar'
import BusinessCarouselSection from '../../components/marketplace/BusinessCarouselSection'
import MarketplaceValueProps from '../../components/marketplace/MarketplaceValueProps'
import MarketplaceCategoryChips from '../../components/marketplace/MarketplaceCategoryChips'
import MarketplaceTrustBadges from '../../components/marketplace/MarketplaceTrustBadges'
import { useLanguage } from '../../context/LanguageContext'
import { getMarketplaceTranslations } from '../../utils/translations'

export default function LandingPage() {
  const { language } = useLanguage()
  const t = getMarketplaceTranslations(language)

  return (
    <div>
      <section className="relative flex min-h-0 flex-col justify-center overflow-hidden border-b border-gray-200/60 py-10 dark:border-gray-800 sm:min-h-[calc(100dvh-4rem)] sm:py-12 lg:py-14">
        <div
          className="absolute inset-0 bg-gradient-to-b from-pink-50/90 via-white to-purple-50/40 dark:from-[#120810] dark:via-[#080808] dark:to-[#0a0612]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-customPink/20 blur-3xl dark:bg-customPink/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 top-32 h-80 w-80 rounded-full bg-purple-400/20 blur-3xl dark:bg-purple-600/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-[32rem] -translate-x-1/2 rounded-full bg-sky-300/15 blur-3xl dark:bg-sky-500/5"
          aria-hidden
        />

        <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 py-6 text-center sm:px-6 sm:py-10 lg:px-8">
          <p className="mb-3 inline-flex w-fit items-center rounded-full border border-customPink/20 bg-customPink/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-customPink dark:border-customPink/30 dark:bg-customPink/10 sm:mb-4 sm:px-4 sm:py-1.5 sm:text-xs">
            {t.heroEyebrow}
          </p>

          <h1 className="mx-auto max-w-4xl text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
            {t.heroTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:mt-5 sm:text-base md:text-lg">
            {t.heroSubtitle}
          </p>

          <div className="mx-auto mt-8 flex w-full max-w-3xl justify-center sm:mt-10">
            <HeroSearchBar />
          </div>

          <div className="mt-6">
            <MarketplaceCategoryChips />
          </div>

          <MarketplaceTrustBadges />

          <p className="mt-6 text-sm font-medium text-gray-500 dark:text-gray-500">
            {t.heroStats}
          </p>
        </div>
      </section>

      <BusinessCarouselSection
        title={t.recommended}
        subtitle={t.recommendedSubtitle}
        badge={t.featured}
        sort="recommended"
        viewAllSearchParams="sort=recommended"
        scrollable
        limit={10}
      />

      <div className="bg-white dark:bg-[#0a0a0a]">
        <BusinessCarouselSection
          title={t.trending}
          subtitle={t.trendingSubtitle}
          badge={t.badgeTrending}
          sort="trending"
          viewAllSearchParams="sort=trending"
          scrollable
          limit={10}
          hideWhenEmpty
        />

        <BusinessCarouselSection
          title={t.newOnPlusfive}
          subtitle={t.newSubtitle}
          badge={t.badgeNew}
          sort="new"
          viewAllSearchParams="sort=new"
          scrollable
          limit={10}
          hideWhenEmpty
        />
      </div>

      <MarketplaceValueProps />

      <BusinessCarouselSection
        title={t.exploreMore}
        subtitle={t.exploreMoreSubtitle}
        viewAllHref="/browse"
        sort="recommended"
        limit={12}
      />

      <section className="relative overflow-hidden border-t border-gray-200 bg-gradient-to-br from-gray-900 via-gray-900 to-[#1a0a14] py-16 dark:border-gray-800 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-customPink/20 via-transparent to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">{t.ctaTitle}</h2>
          <p className="mt-3 text-gray-300">{t.ctaSubtitle}</p>
          <Link
            to="/browse"
            className="mt-8 inline-flex rounded-full bg-customPink px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-customPink/25 transition hover:bg-customPink/90"
          >
            {t.browseAll}
          </Link>
        </div>
      </section>
    </div>
  )
}
