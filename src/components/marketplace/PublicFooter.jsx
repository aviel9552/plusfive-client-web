import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'
import { getMarketplaceTranslations } from '../../utils/translations'
import { getBusinessOwnerAppUrl } from '../../utils/publicBookingIntent'
import DarkLogo from '../../assets/DarkLogo.png'
import LightLogo from '../../assets/LightLogo.jpeg'

const CATEGORY_LINKS = [
  { key: 'catSalon', query: 'salon' },
  { key: 'catBarber', query: 'barber' },
  { key: 'catSpa', query: 'spa' },
  { key: 'catNails', query: 'nails' },
  { key: 'catBeauty', query: 'beauty' },
]

export default function PublicFooter() {
  const { isAuthenticated } = useAuth()
  const { language } = useLanguage()
  const { isDarkMode } = useTheme()
  const t = getMarketplaceTranslations(language)
  const ownerAppUrl = getBusinessOwnerAppUrl()

  const linkClass =
    'text-sm text-gray-600 transition hover:text-customPink dark:text-gray-400 dark:hover:text-customPink'

  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-[#080808]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex" aria-label={t.brandName}>
              <img
                src={isDarkMode ? DarkLogo : LightLogo}
                alt={t.brandName}
                className="h-7 w-auto object-contain sm:h-8"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {t.footerTagline}
            </p>
            <p className="mt-3 text-xs font-medium text-gray-500 dark:text-gray-500">
              {t.heroStats}
            </p>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              {t.footerExplore}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/" className={linkClass}>
                  {t.home}
                </Link>
              </li>
              <li>
                <Link to="/browse" className={linkClass}>
                  {t.browse}
                </Link>
              </li>
              <li>
                <Link to="/browse?sort=recommended" className={linkClass}>
                  {t.recommended}
                </Link>
              </li>
              <li>
                <Link to="/browse?sort=trending" className={linkClass}>
                  {t.trending}
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              {t.footerCategories}
            </h3>
            <ul className="mt-4 space-y-3">
              {CATEGORY_LINKS.map(({ key, query }) => (
                <li key={key}>
                  <Link to={`/browse?q=${encodeURIComponent(query)}`} className={linkClass}>
                    {t[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              {t.footerForBusiness}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href={ownerAppUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {t.listBusiness}
                </a>
              </li>
              <li>
                {isAuthenticated ? (
                  <Link to="/client/home" className={linkClass}>
                    {t.myAccount}
                  </Link>
                ) : (
                  <Link to="/login" className={linkClass}>
                    {t.logIn}
                  </Link>
                )}
              </li>
              {isAuthenticated ? (
                <li>
                  <Link to="/client/appointments" className={linkClass}>
                    {t.footerMyAppointments}
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 dark:border-gray-800 sm:flex-row sm:items-center">
          <p className="text-center text-xs text-gray-500 dark:text-gray-500 sm:text-start">
            © {new Date().getFullYear()} PlusFive. {t.footerRights}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-customPink" />
              {t.heroTrustSecure}
            </span>
            <span className="hidden h-3 w-px bg-gray-300 dark:bg-gray-700 sm:block" />
            <span>{t.heroTrustInstant}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
