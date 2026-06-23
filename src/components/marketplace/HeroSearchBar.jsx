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
      className={`flex w-full flex-col gap-2 rounded-2xl border border-gray-200/90 bg-white/95 p-2 shadow-xl shadow-gray-300/30 backdrop-blur-sm ring-1 ring-black/[0.03] dark:border-gray-700 dark:bg-[#141414]/95 dark:shadow-none dark:ring-white/[0.04] sm:flex-row sm:items-center sm:rounded-full sm:gap-2 ${
        compact ? 'max-w-xl sm:p-1.5' : 'max-w-3xl sm:p-2.5'
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 px-2 sm:px-4">
        <FiSearch className="shrink-0 text-lg text-customPink/70" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full min-w-0 border-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white sm:text-base"
        />
      </div>
      <button
        type="submit"
        className="w-full shrink-0 rounded-xl bg-customPink px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-customPink/20 transition hover:bg-customPink/90 sm:w-auto sm:rounded-full sm:px-6"
      >
        {t.search}
      </button>
    </form>
  )
}
