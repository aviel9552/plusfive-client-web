import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'
import { FiCheck } from 'react-icons/fi'
import { useLanguage } from '../../context/LanguageContext'
import { getCommonTableTranslations } from '../../utils/translations'
import { BRAND_COLOR } from '../../utils/constants'

const PAGE_SIZES = [7, 10, 20, 30, 50]

function getPagination(current, total) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  if (current <= 2) {
    return [1, 2, '...', total]
  }
  if (current >= total - 2) {
    return [1, '...', total - 2, total - 1, total]
  }
  return [1, '...', current, '...', total]
}

function PageSizeMenu({ anchorRef, open, onClose, pageSize, pageSizes, onSelect, isRTL }) {
  const menuRef = useRef(null)
  const [style, setStyle] = useState({ visibility: 'hidden' })

  useEffect(() => {
    if (!open || !anchorRef.current) return undefined

    const updatePosition = () => {
      const rect = anchorRef.current.getBoundingClientRect()
      const menuHeight = menuRef.current?.offsetHeight || 220
      const spaceBelow = window.innerHeight - rect.bottom
      const openUp = spaceBelow < menuHeight + 12 && rect.top > menuHeight + 12

      setStyle({
        position: 'fixed',
        left: isRTL ? Math.max(8, rect.right - 208) : Math.min(rect.left, window.innerWidth - 216),
        top: openUp ? rect.top - menuHeight - 8 : rect.bottom + 8,
        width: 208,
        zIndex: 2147483647,
        visibility: 'visible',
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, anchorRef, isRTL])

  useEffect(() => {
    if (!open) return undefined

    const handleOutside = (event) => {
      if (
        anchorRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return
      }
      onClose()
    }

    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open, onClose, anchorRef])

  if (!open) return null

  return createPortal(
    <div
      ref={menuRef}
      style={style}
      className="rounded-2xl border border-gray-200 bg-white py-1 text-[11px] shadow-2xl dark:border-commonBorder dark:bg-[#181818]"
      onClick={(e) => e.stopPropagation()}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {pageSizes.map((size, index) => {
        const isSelected = pageSize === size
        const isLast = index === pageSizes.length - 1

        return (
          <React.Fragment key={size}>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 transition hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
              onClick={() => {
                onSelect(size)
                onClose()
              }}
            >
              <span className="text-[13px] text-gray-800 dark:text-gray-100">{size}</span>
              {isSelected ? (
                <span
                  className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  <FiCheck className="text-[10px] text-white" />
                </span>
              ) : null}
            </button>
            {!isLast ? (
              <div className="mx-3 my-1 border-t border-gray-200 dark:border-commonBorder" />
            ) : null}
          </React.Fragment>
        )
      })}
    </div>,
    document.body,
  )
}

export const DEFAULT_PAGE_SIZES = PAGE_SIZES

export default function CommonPagination({
  currentPage = 1,
  pageSize = PAGE_SIZES[1],
  total = 0,
  onPageChange,
  onPageSizeChange,
  className = '',
  showPageSizeSelector = true,
  showPageInfo = true,
  pageSizes = PAGE_SIZES,
}) {
  const { language } = useLanguage()
  const isRTL = language === 'he'
  const textDir = isRTL ? 'rtl' : 'ltr'
  const ct = getCommonTableTranslations(language)
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1)
  const paginationNumbers = getPagination(currentPage, totalPages)
  const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false)
  const dropdownRef = useRef(null)

  if (total === 0) return null

  return (
    <div
      className={`flex flex-col items-center justify-between gap-4 px-2 py-2 text-start md:flex-row ${className}`}
      dir={textDir}
    >
      {showPageSizeSelector ? (
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-4 sm:justify-start">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="hidden sm:inline">{ct.rowsPerPage}</span>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 dark:border-commonBorder dark:bg-[#181818] dark:text-gray-300 dark:hover:bg-[#222]"
                onClick={() => setShowPageSizeDropdown((open) => !open)}
              >
                <span>{pageSize}</span>
                <svg
                  className={`transform transition-transform ${showPageSizeDropdown ? 'rotate-180' : ''}`}
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <PageSizeMenu
                anchorRef={dropdownRef}
                open={showPageSizeDropdown}
                onClose={() => setShowPageSizeDropdown(false)}
                pageSize={pageSize}
                pageSizes={pageSizes}
                onSelect={(size) => onPageSizeChange?.(size)}
                isRTL={isRTL}
              />
            </div>
          </label>
          {showPageInfo ? (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {ct.pageInfo
                .replace('{{from}}', String((currentPage - 1) * pageSize + 1))
                .replace('{{to}}', String(Math.min(currentPage * pageSize, total)))
                .replace('{{total}}', String(total))}
            </span>
          ) : null}
        </div>
      ) : null}

      <nav className="flex items-center gap-2" aria-label={ct.pagination || 'Table navigation'}>
        <button
          type="button"
          onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="rounded-full border border-gray-200 p-1.5 text-gray-500 transition-all duration-200 hover:border-pink-500 hover:text-pink-500 disabled:opacity-50 dark:border-customBorderColor dark:text-gray-400"
          aria-label={ct.prevPage || 'Previous page'}
        >
          {isRTL ? <FaAngleRight className="h-4 w-4" /> : <FaAngleLeft className="h-4 w-4" />}
        </button>

        <div className="flex items-center gap-1">
          {paginationNumbers.map((num, i) =>
            num === '...' ? (
              <span key={`ellipsis-${i}`} className="px-2 py-1 text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={`page-${num}`}
                type="button"
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold transition-all duration-200 ${
                  currentPage === num
                    ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                    : 'border-gray-200 text-gray-700 hover:border-customPink hover:text-customPink dark:border-customBorderColor dark:text-gray-300'
                }`}
                onClick={() => onPageChange?.(Number(num))}
                aria-label={`Go to page ${num}`}
                aria-current={currentPage === num ? 'page' : undefined}
              >
                {num}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="rounded-full border border-gray-200 p-1.5 text-gray-500 transition-all duration-200 hover:border-pink-500 hover:text-pink-500 disabled:opacity-50 dark:border-customBorderColor dark:text-gray-400"
          aria-label={ct.nextPage || 'Next page'}
        >
          {isRTL ? <FaAngleLeft className="h-4 w-4" /> : <FaAngleRight className="h-4 w-4" />}
        </button>
      </nav>
    </div>
  )
}
