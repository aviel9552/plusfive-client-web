import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FiSearch, FiX } from 'react-icons/fi'
import CommonLoader from '../commonComponent/CommonLoader'
import { useLanguage } from '../../context/LanguageContext'
import { getMarketplaceTranslations } from '../../utils/translations'

export default function HeroSearchBar({
  initialQuery = '',
  compact = false,
  syncUrl = false,
  loading = false,
}) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { language } = useLanguage()
  const t = getMarketplaceTranslations(language)
  const [query, setQuery] = useState(initialQuery)

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  const applyBrowseQuery = useCallback(
    (value) => {
      const trimmed = value.trim()
      const params = new URLSearchParams(searchParams)

      if (trimmed) {
        params.set('q', trimmed)
      } else {
        params.delete('q')
      }

      params.delete('page')
      setSearchParams(params, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const handleChange = (e) => {
    const next = e.target.value
    setQuery(next)

    if (syncUrl && !next.trim()) {
      applyBrowseQuery('')
    }
  }

  const handleClear = () => {
    setQuery('')
    if (syncUrl) {
      applyBrowseQuery('')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const q = query.trim()

    if (syncUrl) {
      applyBrowseQuery(q)
      return
    }

    navigate(q ? `/browse?q=${encodeURIComponent(q)}` : '/browse')
  }

  const showClear = query.length > 0

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex w-full flex-col gap-2 rounded-2xl border border-gray-200/90 bg-white/95 p-2 shadow-xl shadow-gray-300/30 backdrop-blur-sm ring-1 ring-black/[0.03] dark:border-gray-700 dark:bg-[#141414]/95 dark:shadow-none dark:ring-white/[0.04] sm:flex-row sm:items-center sm:rounded-full sm:gap-2 ${
        compact ? 'max-w-xl sm:p-1.5' : 'max-w-3xl sm:p-2.5'
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 px-2 sm:px-3">
        <FiSearch className="shrink-0 text-lg text-customPink/70" aria-hidden />
        <input
          type="text"
          role="searchbox"
          value={query}
          onChange={handleChange}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchPlaceholder}
          className="w-full min-w-0 border-0 bg-transparent py-1 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white sm:text-base"
        />
        {showClear ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label={t.clearSearch}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <FiX className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-customPink px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-customPink/20 transition hover:bg-customPink/90 disabled:cursor-wait disabled:opacity-80 sm:w-auto sm:rounded-full sm:px-6"
      >
        {loading ? (
          <>
            <CommonLoader />
            <span>{t.searching}</span>
          </>
        ) : (
          t.search
        )}
      </button>
    </form>
  )
}
