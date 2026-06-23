import { Link } from 'react-router-dom'
import { FiStar, FiHeart, FiSun, FiUser, FiGrid } from 'react-icons/fi'
import { useLanguage } from '../../context/LanguageContext'
import { getMarketplaceTranslations } from '../../utils/translations'

const CATEGORIES = [
  { key: 'catSalon', query: 'salon', Icon: FiGrid },
  { key: 'catBarber', query: 'barber', Icon: FiUser },
  { key: 'catSpa', query: 'spa', Icon: FiHeart },
  { key: 'catNails', query: 'nails', Icon: FiStar },
  { key: 'catBeauty', query: 'beauty', Icon: FiSun },
]

export default function MarketplaceCategoryChips() {
  const { language } = useLanguage()
  const t = getMarketplaceTranslations(language)

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:gap-3 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
      {CATEGORIES.map(({ key, query, Icon }) => (
        <Link
          key={key}
          to={`/browse?q=${encodeURIComponent(query)}`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200/80 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm transition hover:border-customPink/40 hover:text-customPink dark:border-gray-700/80 dark:bg-white/5 dark:text-gray-200 dark:hover:border-customPink/50 dark:hover:text-customPink sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
        >
          <Icon className="h-3.5 w-3.5 shrink-0 opacity-70 sm:h-4 sm:w-4" />
          {t[key]}
        </Link>
      ))}
    </div>
  )
}
