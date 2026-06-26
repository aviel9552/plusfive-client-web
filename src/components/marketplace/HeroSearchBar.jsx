import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FiSearch, FiX, FiMapPin } from 'react-icons/fi'
import { useLanguage } from '../../context/LanguageContext'
import { getMarketplaceTranslations } from '../../utils/translations'

function ButtonSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

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
    if (syncUrl && !next.trim()) applyBrowseQuery('')
  }

  const handleClear = () => {
    setQuery('')
    if (syncUrl) applyBrowseQuery('')
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

  /* ─── compact (BrowsePage) ──────────────────────────────── */
  if (compact) {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-xl items-center gap-2 rounded-full border border-gray-200/90 bg-white/95 px-4 py-2.5 shadow-sm ring-1 ring-black/[0.03] dark:border-gray-700 dark:bg-[#141414]/95 dark:ring-white/[0.04]"
      >
        <FiSearch className="shrink-0 text-base text-gray-400" aria-hidden />
        <input
          type="text"
          role="searchbox"
          value={query}
          onChange={handleChange}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchPlaceholder}
          className="w-full min-w-0 border-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
        />
        {showClear ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label={t.clearSearch}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <FiX className="h-3.5 w-3.5" aria-hidden />
          </button>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="ml-1 inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-700 disabled:cursor-wait disabled:opacity-70 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          {loading ? (
            <>
              <ButtonSpinner />
              <span className="hidden sm:inline">{t.searching}</span>
            </>
          ) : (
            t.search
          )}
        </button>
      </form>
    )
  }

  /* ─── Hero (full) — Fresha pill style ───────────────────── */
  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl"
      aria-label={t.searchPlaceholder}
    >
      {/* Outer pill container */}
      <div className="flex w-full items-center overflow-hidden rounded-full border border-gray-200 bg-white shadow-lg shadow-gray-200/60 ring-1 ring-black/[0.04] transition-shadow focus-within:shadow-xl focus-within:ring-customPink/20 dark:border-gray-700 dark:bg-[#1a1a1a] dark:shadow-none dark:ring-white/[0.06]">

        {/* Segment 1: service query */}
        <div className="flex flex-1 items-center gap-2 px-5 py-3.5 sm:py-4">
          <FiSearch className="shrink-0 text-base text-gray-400" aria-hidden />
          <input
            type="text"
            role="searchbox"
            value={query}
            onChange={handleChange}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchPlaceholder}
            className="w-full min-w-0 border-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white sm:text-base"
          />
          {showClear ? (
            <button
              type="button"
              onClick={handleClear}
              aria-label={t.clearSearch}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <FiX className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>

        {/* Divider */}
        <div className="h-7 w-px shrink-0 bg-gray-200 dark:bg-gray-700" aria-hidden />

        {/* Segment 2: location hint (static visual) */}
        <div className="hidden items-center gap-2 px-5 text-sm text-gray-400 sm:flex">
          <FiMapPin className="shrink-0 text-base" aria-hidden />
          <span>{t.searchLocationHint ?? 'Near me'}</span>
        </div>

        {/* Divider (desktop only) */}
        <div className="hidden h-7 w-px shrink-0 bg-gray-200 dark:bg-gray-700 sm:block" aria-hidden />

        {/* Search button */}
        <div className="p-1.5 sm:p-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-wait disabled:opacity-70 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 sm:px-6"
          >
            {loading ? (
              <>
                <ButtonSpinner />
                <span className="hidden sm:inline">{t.searching}</span>
              </>
            ) : (
              t.search
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
