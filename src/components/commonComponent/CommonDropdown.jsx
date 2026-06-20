import { useEffect, useRef, useState } from 'react'
import { FiCheck, FiChevronDown } from 'react-icons/fi'
import { useLanguage } from '../../context/LanguageContext'

export default function CommonDropdown({
  value,
  options = [],
  onChange,
  label,
  placeholder = '',
  disabled = false,
  className = '',
  menuClassName = '',
}) {
  const { language } = useLanguage()
  const isRtl = language === 'he'
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  const selected = options.find((opt) => opt.value === value)
  const buttonLabel = selected?.label || placeholder || label

  useEffect(() => {
    if (!open) return undefined

    const handleOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {label ? (
        <p className="mb-2 text-12 font-medium text-customBoldTextColor dark:text-customGray2">
          {label}
        </p>
      ) : null}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full min-w-[160px] items-center justify-between gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-800 transition-colors hover:border-customPink hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-commonBorder dark:bg-[#181818] dark:text-gray-100 dark:hover:bg-[#2a2a2a] sm:text-sm ${
          open ? 'border-customPink' : ''
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{buttonLabel}</span>
        <FiChevronDown
          className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} aria-hidden />
          <div
            dir={isRtl ? 'rtl' : 'ltr'}
            role="listbox"
            className={`absolute z-30 mt-2 w-full min-w-[200px] rounded-2xl border border-gray-200 bg-white py-1 shadow-lg dark:border-commonBorder dark:bg-[#181818] ${
              isRtl ? 'right-0' : 'left-0'
            } ${menuClassName}`}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value
              return (
                <div key={String(option.value)}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-gray-50 dark:hover:bg-[#2a2a2a] sm:text-sm"
                    onClick={() => {
                      onChange?.(option.value)
                      setOpen(false)
                    }}
                  >
                    <span className="text-gray-800 dark:text-gray-100">{option.label}</span>
                    {isSelected ? (
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-customPink">
                        <FiCheck className="text-[10px] text-white" />
                      </span>
                    ) : null}
                  </button>
                  {index < options.length - 1 ? (
                    <div className="mx-3 border-t border-gray-200 dark:border-commonBorder" />
                  ) : null}
                </div>
              )
            })}
          </div>
        </>
      ) : null}
    </div>
  )
}
