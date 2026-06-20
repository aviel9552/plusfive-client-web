import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { getCustomerHomeTranslations, getCustomerBookingTranslations } from '../../utils/translations'
import { BRAND_COLOR } from '../../utils/constants'
import {
  getCustomerDashboard,
  getErrorMessage,
} from '../../services/customerDashboardService'
import DashboardStats from '../../sections/home/DashboardStats'
import RecentActivitySection from '../../sections/home/RecentActivitySection'
import UpcomingSection from '../../sections/appointments/UpcomingSection'

export default function HomePage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const t = getCustomerHomeTranslations(language)
  const bookT = getCustomerBookingTranslations(language)
  const isRtl = language === 'he'

  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  const locale = language === 'he' ? 'he-IL' : 'en-US'

  const formatCurrency = useCallback(
    (amount) =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'ILS',
        maximumFractionDigits: 0,
      }).format(amount || 0),
    [locale],
  )

  const formatDateTime = useCallback(
    (value) => {
      if (!value) return ''
      return new Date(value).toLocaleString(locale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
    [locale],
  )

  const formatDate = useCallback(
    (value) => {
      if (!value) return ''
      return new Date(value).toLocaleString(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
    [locale],
  )

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const data = await getCustomerDashboard()
        if (!cancelled) setDashboard(data)
      } catch (err) {
        if (!cancelled) {
          toast.error(getErrorMessage(err, t.loadError))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [t.loadError, user?.businessId])

  const welcomeName = user?.fullName || user?.name || t.welcomeFallback

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
          {t.title}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-white">
          {t.welcomeBack.replace('{{name}}', welcomeName)}
          {user?.businessName ? ` · ${user.businessName}` : ''}
        </p>
        <p className="mt-1 text-sm text-gray-600 dark:text-white">
          {t.subtitle}
        </p>
        <Link
          to="/client/book/business"
          className="mt-4 inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          {bookT.selectServices}
        </Link>
      </div>

      <DashboardStats stats={dashboard?.stats} t={t} formatCurrency={formatCurrency} />

      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingSection
          nextAppointment={dashboard?.nextAppointment}
          formatDateTime={formatDateTime}
          loading={loading}
        />
        <RecentActivitySection
          items={dashboard?.recentActivity}
          t={t}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
          loading={loading}
        />
      </div>
    </div>
  )
}
