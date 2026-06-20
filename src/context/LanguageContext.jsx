import { createContext, useContext, useState, useEffect } from 'react'

const languages = {
  en: 'En',
  he: 'He',
}

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'he'
  })

  const changeLanguage = (lang) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)

    if (lang === 'he') {
      document.documentElement.dir = 'rtl'
      document.documentElement.lang = 'he'
    } else {
      document.documentElement.dir = 'ltr'
      document.documentElement.lang = 'en'
    }
  }

  useEffect(() => {
    if (language === 'he') {
      document.documentElement.dir = 'rtl'
      document.documentElement.lang = 'he'
    } else {
      document.documentElement.dir = 'ltr'
      document.documentElement.lang = 'en'
    }
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, languages }}>
      {children}
    </LanguageContext.Provider>
  )
}
