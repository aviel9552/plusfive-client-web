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

function ActivityCard({ item, t, formatDate, formatCurrency }) {
  const meta = TYPE_META[item.type] || TYPE_META.appointment
  const Icon = meta.icon

  return (
    <div className="flex items-start gap-3 rounded-xl border border-customGray2 bg-white p-4 dark:border-commonBorder dark:bg-[#141414]">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.badge}`}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-11 font-semibold uppercase tracking-wide text-customBoldTextColor dark:text-customGray2">
              {t[meta.labelKey]}
            </p>
            <p className="truncate text-15 font-semibold text-customLightTextColor dark:text-white">
              {item.title}
            </p>
            {item.subtitle ? (
              <p className="text-13 text-customBoldTextColor dark:text-customGray2">
                {item.subtitle}
              </p>
            ) : null}
          </div>
          {item.amount != null ? (
            <p className="shrink-0 text-15 font-bold text-customLightTextColor dark:text-white">
              {formatCurrency(item.amount)}
            </p>
          ) : null}
        </div>
        <p className="mt-2 text-12 text-customBoldTextColor dark:text-customGray2">
          {formatDate(item.occurredAt)}
        </p>
      </div>
    </div>
  )
}

export default function RecentActivitySection({
  items,
  t,
  formatDate,
  formatCurrency,
  loading,
}) {
  return (
    <section className="rounded-2xl border border-customGray2 bg-white p-6 dark:border-commonBorder dark:bg-customBrown">
      <h2 className="text-18 font-semibold text-customLightTextColor dark:text-white">
        {t.recentActivity}
      </h2>

      {loading ? (
        <p className="mt-4 text-14 text-customBoldTextColor dark:text-customGray2">
          {t.loading}
        </p>
      ) : null}

      {!loading && (!items || items.length === 0) ? (
        <p className="mt-4 text-14 text-customBoldTextColor dark:text-customGray2">
          {t.noActivity}
        </p>
      ) : null}

      {!loading && items?.length > 0 ? (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <ActivityCard
              key={item.id}
              item={item}
              t={t}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
