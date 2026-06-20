import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { getNotFoundTranslations } from '../../utils/translations'

export default function NotFoundPage() {
  const { language } = useLanguage()
  const t = getNotFoundTranslations(language)
  const isRtl = language === 'he'

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 font-inter"
    >
      <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">{t.title}</h1>
      <Link to="/client/home" className="text-linkPrimary hover:text-linkPrimaryHover">
        {t.backHome}
      </Link>
    </div>
  )
}
