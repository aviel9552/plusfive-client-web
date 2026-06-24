import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { getCustomerHomeTranslations } from '../../utils/translations'
import {
  getCustomerDashboard,
  getErrorMessage,
} from '../../services/customerDashboardService'
import DashboardStats from '../../sections/home/DashboardStats'
import HomeWelcomeHero from '../../sections/home/HomeWelcomeHero'
import HomeQuickActions from '../../sections/home/HomeQuickActions'
import RecentActivitySection from '../../sections/home/RecentActivitySection'
import UpcomingSection from '../../sections/appointments/UpcomingSection'

export default function HomePage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const t = getCustomerHomeTranslations(language)
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
    <div dir={isRtl ? 'rtl' : 'ltr'} className="mx-auto max-w-5xl space-y-6">
      <HomeWelcomeHero
        name={welcomeName}
        businessName={user?.businessName}
        profileImage={user?.profileImage}
        t={t}
      />

      <DashboardStats
        stats={dashboard?.stats}
        t={t}
        formatCurrency={formatCurrency}
        loading={loading}
      />

      <HomeQuickActions t={t} isRtl={isRtl} />

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <UpcomingSection
          nextAppointment={dashboard?.nextAppointment}
          formatDateTime={formatDateTime}
          loading={loading}
        />
        <RecentActivitySection
          items={dashboard?.recentActivity}
          t={t}
          formatCurrency={formatCurrency}
          loading={loading}
          language={language}
        />
      </div>
    </div>
  )
}
