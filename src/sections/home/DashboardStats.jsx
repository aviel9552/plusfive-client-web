import { FiCalendar, FiCreditCard, FiPackage, FiTrendingUp } from 'react-icons/fi'

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl border border-customGray2 bg-white p-4 dark:border-commonBorder dark:bg-customBrown sm:p-5">
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <p className="text-22 font-bold text-customLightTextColor dark:text-white sm:text-24">
        {value}
      </p>
      <p className="mt-1 text-12 text-customBoldTextColor dark:text-customGray2 sm:text-13">
        {label}
      </p>
    </div>
  )
}

function StatSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-customGray2 bg-white p-4 dark:border-commonBorder dark:bg-customBrown sm:p-5">
      <div className="mb-3 h-10 w-10 rounded-xl bg-gray-100 dark:bg-[#1a1a1a]" />
      <div className="h-7 w-16 rounded bg-gray-100 dark:bg-[#1a1a1a]" />
      <div className="mt-2 h-4 w-24 rounded bg-gray-100 dark:bg-[#1a1a1a]" />
    </div>
  )
}

export default function DashboardStats({ stats, t, formatCurrency, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <StatCard
        icon={FiCalendar}
        label={t.statAppointments}
        value={stats.appointments ?? 0}
        accent="bg-pink-500/10 text-customPink"
      />
      <StatCard
        icon={FiCreditCard}
        label={t.statPayments}
        value={stats.payments ?? 0}
        accent="bg-violet-500/10 text-customViolet"
      />
      <StatCard
        icon={FiTrendingUp}
        label={t.statTotalSpent}
        value={formatCurrency(stats.totalSpent ?? 0)}
        accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      />
      <StatCard
        icon={FiPackage}
        label={t.statProducts}
        value={stats.productPurchases ?? 0}
        accent="bg-amber-500/10 text-amber-600 dark:text-amber-400"
      />
    </div>
  )
}
