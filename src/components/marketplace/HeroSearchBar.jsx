import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch } from 'react-icons/fi'
import { useLanguage } from '../../context/LanguageContext'
import { getMarketplaceTranslations } from '../../utils/translations'

export default function HeroSearchBar({ initialQuery = '', compact = false }) {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const t = getMarketplaceTranslations(language)
  const [query, setQuery] = useState(initialQuery)

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  const handleSubmit = (e) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/browse?q=${encodeURIComponent(q)}` : '/browse')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex w-full items-center gap-2 rounded-full border border-gray-200 bg-white shadow-lg shadow-gray-200/50 dark:border-gray-700 dark:bg-[#141414] dark:shadow-none ${
        compact ? 'max-w-xl p-1.5' : 'max-w-3xl p-2 sm:p-2.5'
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 px-3 sm:px-4">
        <FiSearch className="shrink-0 text-lg text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full border-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white sm:text-base"
        />
      </div>
      <button
        type="submit"
        className="shrink-0 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 sm:px-6"
      >
        {t.search}
      </button>
    </form>
  )
}
