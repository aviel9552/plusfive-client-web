import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { getMarketplaceTranslations } from '../../utils/translations'

const CATEGORIES = [
  { key: 'catSalon',   query: 'salon'   },
  { key: 'catBarber',  query: 'barber'  },
  { key: 'catSpa',     query: 'spa'     },
  { key: 'catNails',   query: 'nails'   },
  { key: 'catBeauty',  query: 'beauty'  },
  { key: 'catMassage', query: 'massage' },
]

export default function MarketplaceCategoryChips() {
  const { language } = useLanguage()
  const t = getMarketplaceTranslations(language)

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:gap-2.5 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
      {CATEGORIES.map(({ key, query, icon }) => {
        const label = t[key]
        if (!label) return null
        return (
          <Link
            key={key}
            to={`/browse?q=${encodeURIComponent(query)}`}
            className="inline-flex shrink-0 items-center rounded-full border border-gray-300/60 bg-white/10 px-4 py-2 text-sm font-medium text-gray-800 backdrop-blur-sm transition hover:border-customPink/40 hover:bg-white/20 hover:text-customPink dark:border-gray-600/50 dark:bg-white/5 dark:text-gray-200 dark:hover:border-customPink/50 dark:hover:text-customPink"
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
