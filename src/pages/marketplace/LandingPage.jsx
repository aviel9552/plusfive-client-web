import { Link } from 'react-router-dom'
import HeroSearchBar from '../../components/marketplace/HeroSearchBar'
import BusinessCarouselSection from '../../components/marketplace/BusinessCarouselSection'
import MarketplaceValueProps from '../../components/marketplace/MarketplaceValueProps'
import MarketplaceCategoryChips from '../../components/marketplace/MarketplaceCategoryChips'
import MarketplaceTrustBadges from '../../components/marketplace/MarketplaceTrustBadges'
import MarketplaceStatsSection from '../../components/marketplace/MarketplaceStatsSection'
import MarketplaceTestimonials from '../../components/marketplace/MarketplaceTestimonials'
import AnimatedCounter from '../../components/marketplace/AnimatedCounter'
import { useLanguage } from '../../context/LanguageContext'
import { getMarketplaceTranslations } from '../../utils/translations'

export default function LandingPage() {
  const { language } = useLanguage()
  const t = getMarketplaceTranslations(language)

  return (
    <div>

      {/* ═══════════════════════════════════════════════════════════
          Hero + Recommended share ONE continuous gradient — Fresha
          -mt-16 pt-16 pulls the gradient up behind the transparent
          header so there's no seam (header content stays above via z-40)
      ═══════════════════════════════════════════════════════════ */}
      <div className="relative -mt-16 pt-16">

        {/* ── Gradient layer — spans both hero AND recommended ── */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 dark:hidden"
          style={{
            height: '820px',
            background:
              'radial-gradient(ellipse 140% 60% at 50% 0%, #f0d6fa 0%, #ece6fc 20%, #f0edfe 38%, #f7f5ff 55%, #ffffff 75%)',
          }}
          aria-hidden
        />
        {/* dark mode version */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 hidden dark:block"
          style={{
            height: '820px',
            background:
              'radial-gradient(ellipse 140% 60% at 50% 0%, #1a0d2e 0%, #110a22 25%, #0c0818 45%, #080808 70%)',
          }}
          aria-hidden
        />

        {/* ─── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-14 sm:pt-16 lg:pt-20">
          <div className="mx-auto w-full max-w-5xl px-4 text-center sm:px-6 lg:px-8">

            {/* eyebrow */}
            <p className="mb-4 inline-flex items-center rounded-full border border-customPink/20 bg-customPink/5 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-customPink dark:border-customPink/30 dark:bg-customPink/10 sm:text-xs">
              {t.heroEyebrow}
            </p>

            {/* H1 */}
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl lg:text-[4rem] lg:leading-[1.08]">
              {t.heroTitle}
            </h1>

            {/* subtitle */}
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base md:text-lg">
              {t.heroSubtitle}
            </p>

            {/* search bar */}
            <div className="mx-auto mt-9 flex w-full max-w-3xl justify-center sm:mt-10">
              <HeroSearchBar />
            </div>

            {/* appointment counter */}
            {/* <p className="mt-5 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
              <span className="font-bold text-gray-900 dark:text-white">
                <AnimatedCounter end={12847} duration={2200} />
              </span>
              {' '}
              {t.appointmentsBookedToday ?? 'appointments booked today'}
            </p> */}

            {/* Get the app */}
            <a
              href="#"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-gray-300/80 bg-white/70 px-5 py-2.5 text-sm font-medium text-gray-900 shadow-sm backdrop-blur-sm transition hover:bg-white hover:shadow-md dark:border-gray-600 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              {t.getTheApp ?? 'Get the app'}
            </a>

            {/* category chips */}
            <div className="mt-8 w-full">
              <MarketplaceCategoryChips />
            </div>

            {/* trust badges */}
            <MarketplaceTrustBadges />

            {/* heroStats */}
            <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-500">
              {t.heroStats}
            </p>
          </div>
        </section>

        {/* ─── Recommended — sits on the same gradient ──────────── */}
        <div className="relative">
          <BusinessCarouselSection
            title={t.recommended}
            subtitle={t.recommendedSubtitle}
            badge={t.featured}
            sort="recommended"
            viewAllSearchParams="sort=recommended"
            scrollable
            limit={10}
          />
        </div>

      </div>{/* end gradient wrapper */}

      {/* ─── New to PlusFive ──────────────────────────────────── */}
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

      {/* ─── Trending ─────────────────────────────────────────── */}
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

      {/* ─── Stats ────────────────────────────────────────────── */}
      <MarketplaceStatsSection />

      {/* ─── Value props ──────────────────────────────────────── */}
      <MarketplaceValueProps />

      {/* ─── Testimonials ─────────────────────────────────────── */}
      <MarketplaceTestimonials />

      {/* ─── Explore more ─────────────────────────────────────── */}
      <BusinessCarouselSection
        title={t.exploreMore}
        subtitle={t.exploreMoreSubtitle}
        viewAllHref="/browse"
        sort="recommended"
        limit={12}
      />

      {/* ─── CTA banner ───────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-gray-200 bg-gradient-to-br from-gray-50 via-white to-pink-50 py-16 dark:border-gray-800 dark:from-gray-900 dark:via-gray-900 dark:to-[#1a0a14] sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-customPink/10 via-transparent to-transparent dark:from-customPink/20"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">{t.ctaTitle}</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-300">{t.ctaSubtitle}</p>
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
