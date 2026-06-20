import { useEffect, useRef, useState } from 'react'
import { BsEye, BsEyeSlash } from 'react-icons/bs'
import { useLanguage } from '../../context/LanguageContext'

export default function FloatingInput({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  error,
  placeholder,
  onFocus,
  onBlur,
  showPasswordToggle = false,
  required = false,
  suggestions = [],
  onSuggestionSelect,
  autoComplete = 'off',
  whiteText = false,
}) {
  const { language } = useLanguage()
  const isRTL = language === 'he'
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  const hasValue = value && value.toString().trim() !== ''
  const shouldFloat = isFocused || hasValue

  const inputType =
    showPasswordToggle && type === 'password'
      ? showPassword
        ? 'text'
        : 'password'
      : type

  const handleFocus = (e) => {
    setIsFocused(true)
    if (suggestions.length > 0) setShowSuggestions(true)
    onFocus?.(e)
  }

  const handleBlur = (e) => {
    setIsFocused(false)
    setTimeout(() => setShowSuggestions(false), 200)
    onBlur?.(e)
  }

  const handleSuggestionClick = (suggestion) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion)
    } else if (onChange) {
      onChange({
        target: {
          name,
          value: suggestion.password || suggestion.email || suggestion,
        },
      })
    }
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSuggestions])

  const textColor = whiteText ? '#ffffff' : '#111827'
  const borderColor = error ? '#ef4444' : whiteText ? '#ffffff' : '#111827'
  const autofillBg = whiteText ? '#000000' : '#ffffff'

  return (
    <div className="relative w-full">
      <style>{`
        #${id}:-webkit-autofill,
        #${id}:-webkit-autofill:hover,
        #${id}:-webkit-autofill:focus,
        #${id}:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px ${autofillBg} inset !important;
          box-shadow: 0 0 0 1000px ${autofillBg} inset !important;
          -webkit-text-fill-color: ${textColor} !important;
          caret-color: ${textColor} !important;
          background-color: ${autofillBg} !important;
          border-color: ${borderColor} !important;
          transition: background-color 5000s ease-in-out 0s, color 5000s ease-in-out 0s;
        }
      `}</style>
      <div className="relative" style={{ minHeight: '56px' }}>
        <input
          ref={inputRef}
          type={inputType}
          id={id}
          name={name}
          value={value || ''}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={shouldFloat ? placeholder : ''}
          className={`w-full border-0 border-b bg-transparent px-0 pb-2 pt-6 font-light transition-colors duration-200 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none ${
            error ? 'border-red-500' : ''
          } ${whiteText ? 'placeholder-white/70' : 'placeholder-gray-400'} ${
            isRTL ? 'text-right' : 'text-left'
          }`}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            color: textColor,
            borderColor,
            outline: 'none',
            boxShadow: 'none',
            caretColor: textColor,
            colorScheme: whiteText ? 'dark' : 'light',
          }}
          autoComplete={autoComplete}
        />

        <label
          htmlFor={id}
          className={`pointer-events-none absolute transition-all duration-300 ease-out ${
            isRTL ? 'right-0' : 'left-0'
          } ${shouldFloat ? 'top-0 text-xs' : 'top-6 text-base'}`}
          style={{ color: error && whiteText ? '#fca5a5' : whiteText ? '#9ca3af' : '#6b7280' }}
        >
          {label}
          {required ? <span className="ml-1 text-red-500">*</span> : null}
        </label>

        {showPasswordToggle && type === 'password' ? (
          <button
            type="button"
            className={`absolute bottom-2 flex items-center focus:outline-none ${
              isRTL ? 'left-0' : 'right-0'
            } ${
              whiteText
                ? 'text-white hover:text-gray-300'
                : 'text-gray-400 hover:text-gray-600'
            } z-10 transition-colors duration-200`}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <BsEyeSlash className="h-5 w-5" /> : <BsEye className="h-5 w-5" />}
          </button>
        ) : null}
      </div>

      {showSuggestions && suggestions.length > 0 ? (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-commonBorder dark:bg-gray-800"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {suggestion.avatar ? (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                  <span className="text-sm font-medium text-white">{suggestion.avatar}</span>
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {suggestion.name || suggestion.email || suggestion}
                </div>
                {suggestion.email && suggestion.name ? (
                  <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {suggestion.email}
                  </div>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="mt-1 flex items-center gap-1 text-sm text-red-500">
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  )
}
