import { FiCheckCircle, FiClock, FiShield } from 'react-icons/fi'
import { useLanguage } from '../../context/LanguageContext'
import { getMarketplaceTranslations } from '../../utils/translations'

const BADGES = [
  { key: 'heroTrustInstant', Icon: FiCheckCircle },
  { key: 'heroTrustNoAccount', Icon: FiClock },
  { key: 'heroTrustSecure', Icon: FiShield },
]

export default function MarketplaceTrustBadges() {
  const { language } = useLanguage()
  const t = getMarketplaceTranslations(language)

  return (
    <div className="mt-6 flex flex-col items-stretch gap-2.5 px-1 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-6 sm:gap-y-3 lg:mt-10">
      {BADGES.map(({ key, Icon }) => (
        <span
          key={key}
          className="inline-flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400 sm:text-sm"
        >
          <Icon className="h-4 w-4 shrink-0 text-customPink" />
          {t[key]}
        </span>
      ))}
    </div>
  )
}
