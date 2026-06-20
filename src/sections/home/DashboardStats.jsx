import { FiCalendar, FiCreditCard, FiPackage, FiTrendingUp } from 'react-icons/fi'

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl border border-customGray2 bg-white p-5 dark:border-commonBorder dark:bg-customBrown">
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <p className="text-24 font-bold text-customLightTextColor dark:text-white">{value}</p>
      <p className="mt-1 text-13 text-customBoldTextColor dark:text-customGray2">{label}</p>
    </div>
  )
}

export default function DashboardStats({ stats, t, formatCurrency }) {
  if (!stats) return null

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
