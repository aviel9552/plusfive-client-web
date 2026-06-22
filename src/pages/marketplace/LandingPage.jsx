import { Link } from 'react-router-dom'
import HeroSearchBar from '../../components/marketplace/HeroSearchBar'
import BusinessCarouselSection from '../../components/marketplace/BusinessCarouselSection'
import { useLanguage } from '../../context/LanguageContext'
import { getMarketplaceTranslations } from '../../utils/translations'

export default function LandingPage() {
  const { language } = useLanguage()
  const t = getMarketplaceTranslations(language)

  return (
    <div>
      <section className="relative overflow-hidden border-b border-gray-200/60 dark:border-gray-800">
        <div
          className="absolute inset-0 bg-gradient-to-br from-pink-100/80 via-purple-50/60 to-sky-100/70 dark:from-pink-950/30 dark:via-purple-950/20 dark:to-sky-950/20"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 text-center sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-24">
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            {t.heroTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 dark:text-gray-300 sm:text-lg">
            {t.heroSubtitle}
          </p>
          <div className="mx-auto mt-8 flex justify-center sm:mt-10">
            <HeroSearchBar />
          </div>
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">{t.heroStats}</p>
        </div>
      </section>

      <BusinessCarouselSection title={t.recommended} badge={t.featured} />

      <BusinessCarouselSection title={t.exploreMore} viewAllHref="/browse" limit={12} />

      <section className="border-t border-gray-200 bg-white py-16 dark:border-gray-800 dark:bg-[#0a0a0a]">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            {t.ctaTitle}
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-300">{t.ctaSubtitle}</p>
          <Link
            to="/browse"
            className="mt-8 inline-flex rounded-full bg-gray-900 px-8 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900"
          >
            {t.browseAll}
          </Link>
        </div>
      </section>
    </div>
  )
}
