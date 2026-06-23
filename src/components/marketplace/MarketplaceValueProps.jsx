import { FiCalendar, FiMapPin, FiSmartphone } from 'react-icons/fi'
import { useLanguage } from '../../context/LanguageContext'
import { getMarketplaceTranslations } from '../../utils/translations'

const VALUE_PROPS = [
  {
    titleKey: 'valueProp1Title',
    bodyKey: 'valueProp1Body',
    Icon: FiCalendar,
    accent: 'from-pink-500/15 to-rose-500/5',
    iconBg: 'bg-customPink/10 text-customPink',
  },
  {
    titleKey: 'valueProp2Title',
    bodyKey: 'valueProp2Body',
    Icon: FiMapPin,
    accent: 'from-violet-500/15 to-purple-500/5',
    iconBg: 'bg-violet-500/10 text-violet-500 dark:text-violet-400',
  },
  {
    titleKey: 'valueProp3Title',
    bodyKey: 'valueProp3Body',
    Icon: FiSmartphone,
    accent: 'from-sky-500/15 to-blue-500/5',
    iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  },
]

export default function MarketplaceValueProps() {
  const { language } = useLanguage()
  const t = getMarketplaceTranslations(language)

  return (
    <section className="relative overflow-hidden border-y border-gray-200/80 bg-gray-50/50 py-12 dark:border-gray-800 dark:bg-[#080808] sm:py-16 lg:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-customPink/[0.04] via-transparent to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10 lg:mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-customPink sm:text-sm">
            {t.valuePropsEyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            {t.valuePropsTitle}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 sm:gap-5 lg:gap-6">
          {VALUE_PROPS.map(({ titleKey, bodyKey, Icon, accent, iconBg }) => (
            <div
              key={titleKey}
              className={`group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-customPink/20 hover:shadow-md dark:border-gray-800 dark:bg-[#111111] dark:hover:border-customPink/30 sm:p-7 lg:rounded-3xl lg:p-8`}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${accent}`}
                aria-hidden
              />

              <div className="relative">
                <div
                  className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg} transition group-hover:scale-105 sm:h-14 sm:w-14`}
                >
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                  {t[titleKey]}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:mt-3 sm:text-[0.9375rem]">
                  {t[bodyKey]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
