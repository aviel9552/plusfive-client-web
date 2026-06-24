import { Link } from 'react-router-dom'
import { FiCalendar, FiCreditCard, FiPackage } from 'react-icons/fi'

const TYPE_META = {
  appointment: {
    icon: FiCalendar,
    badge: 'bg-pink-500/10 text-customPink',
    labelKey: 'activityAppointment',
  },
  payment: {
    icon: FiCreditCard,
    badge: 'bg-violet-500/10 text-customViolet',
    labelKey: 'activityPayment',
  },
  product_purchase: {
    icon: FiPackage,
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    labelKey: 'activityProduct',
  },
}

function formatActivityDate(value, locale) {
  if (!value) return ''
  const date = new Date(value)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const time = date.toLocaleString(locale, { hour: '2-digit', minute: '2-digit' })

  if (isToday) {
    return time
  }

  return date.toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ActivityRow({ item, t, formatCurrency, locale }) {
  const meta = TYPE_META[item.type] || TYPE_META.appointment
  const Icon = meta.icon
  const subtitle = item.subtitle
    ? item.subtitle.charAt(0).toUpperCase() + item.subtitle.slice(1)
    : null

  return (
    <li className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.badge}`}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-14 font-semibold text-gray-900 dark:text-white">
            {item.title}
          </p>
          {item.amount != null ? (
            <p className="shrink-0 text-14 font-bold text-gray-900 dark:text-white">
              {formatCurrency(item.amount)}
            </p>
          ) : null}
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-3">
          <p className="truncate text-12 text-customBoldTextColor dark:text-customGray2">
            <span className="font-medium text-customPink">{t[meta.labelKey]}</span>
            {subtitle ? ` · ${subtitle}` : ''}
          </p>
          <time className="shrink-0 text-12 text-customBoldTextColor dark:text-customGray2">
            {formatActivityDate(item.occurredAt, locale)}
          </time>
        </div>
      </div>
    </li>
  )
}

export default function RecentActivitySection({
  items,
  t,
  formatCurrency,
  loading,
  language = 'en',
}) {
  const locale = language === 'he' ? 'he-IL' : 'en-US'
  const visibleItems = items?.slice(0, 6) || []

  return (
    <section className="rounded-2xl border border-customGray2 bg-white dark:border-commonBorder dark:bg-customBrown">
      <div className="flex items-center justify-between gap-3 border-b border-customGray2 px-5 py-3.5 dark:border-commonBorder">
        <h2 className="text-16 font-bold text-gray-900 dark:text-white">{t.recentActivity}</h2>
        <Link
          to="/client/appointments"
          className="text-13 font-semibold text-customPink transition hover:opacity-80"
        >
          {t.viewAll}
        </Link>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-0 divide-y divide-customGray2 p-0 dark:divide-commonBorder">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 px-5 py-3.5">
              <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-[#1a1a1a]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-[#1a1a1a]" />
                <div className="h-3 w-1/2 rounded bg-gray-100 dark:bg-[#1a1a1a]" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && visibleItems.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <p className="text-14 font-semibold text-gray-900 dark:text-white">{t.noActivity}</p>
          <p className="mt-1 text-13 text-customBoldTextColor dark:text-customGray2">
            {t.noActivityHint}
          </p>
        </div>
      ) : null}

      {!loading && visibleItems.length > 0 ? (
        <ul className="max-h-[min(24rem,60vh)] divide-y divide-customGray2 overflow-y-auto dark:divide-commonBorder">
          {visibleItems.map((item) => (
            <ActivityRow
              key={item.id}
              item={item}
              t={t}
              formatCurrency={formatCurrency}
              locale={locale}
            />
          ))}
        </ul>
      ) : null}
    </section>
  )
}
