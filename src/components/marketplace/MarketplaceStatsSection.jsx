import AnimatedCounter from './AnimatedCounter'
import { useLanguage } from '../../context/LanguageContext'
import { getMarketplaceTranslations } from '../../utils/translations'

const STATS = [
  { end: 10000, suffix: '+', labelKey: 'stat1Label' },
  { end: 500,   suffix: '+', labelKey: 'stat2Label' },
  { end: 20,    suffix: '+', labelKey: 'stat3Label' },
  { end: 2000,  suffix: '+', labelKey: 'stat4Label' },
]

export default function MarketplaceStatsSection() {
  const { language } = useLanguage()
  const t = getMarketplaceTranslations(language)

  return (
    <section className="relative overflow-hidden border-y border-gray-200/80 bg-white py-14 dark:border-gray-800 dark:bg-[#0a0a0a] sm:py-16 lg:py-20">
      {/* subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-customPink/[0.05] via-transparent to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* heading */}
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-customPink sm:text-sm">
            {t.statsEyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            {t.statsTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-base">
            {t.statsSubtitle}
          </p>
        </div>

        {/* stats grid */}
        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4 lg:gap-10">
          {STATS.map(({ end, suffix, labelKey }) => (
            <div
              key={labelKey}
              className="group flex flex-col items-center gap-1 rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-8 text-center transition duration-300 hover:border-customPink/20 hover:bg-white hover:shadow-sm dark:border-gray-800/80 dark:bg-[#111111] dark:hover:border-customPink/30 sm:py-10"
            >
              <span className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-[3.25rem]">
                <AnimatedCounter end={end} suffix={suffix} duration={1600} />
              </span>
              <span className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400 sm:text-base">
                {t[labelKey]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
