import { Link } from 'react-router-dom'
import { FiArrowRight, FiCalendar, FiCompass, FiList } from 'react-icons/fi'

const ACTIONS = [
  {
    key: 'book',
    to: '/client/book/business',
    icon: FiCalendar,
    accent: 'bg-pink-500/10 text-customPink',
  },
  {
    key: 'appointments',
    to: '/client/appointments',
    icon: FiList,
    accent: 'bg-violet-500/10 text-customViolet',
  },
  {
    key: 'explore',
    to: '/browse',
    icon: FiCompass,
    accent: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
]

export default function HomeQuickActions({ t, isRtl }) {
  return (
    <section className="rounded-2xl border border-customGray2 bg-white dark:border-commonBorder dark:bg-customBrown">
      <div className="border-b border-customGray2 px-5 py-4 dark:border-commonBorder">
        <h2 className="text-16 font-bold text-gray-900 dark:text-white">{t.quickActionsTitle}</h2>
      </div>
      <div className="divide-y divide-customGray2 dark:divide-commonBorder">
        {ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.key}
              to={action.to}
              className="flex items-center gap-4 px-5 py-4 transition hover:bg-gray-50 dark:hover:bg-[#0a0a0a]"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.accent}`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-15 font-semibold text-gray-900 dark:text-white">
                  {t[`quickAction_${action.key}`]}
                </p>
                <p className="mt-0.5 text-13 text-customBoldTextColor dark:text-customGray2">
                  {t[`quickAction_${action.key}_hint`]}
                </p>
              </div>
              <FiArrowRight
                className={`h-5 w-5 shrink-0 text-customBoldTextColor dark:text-customGray2 ${isRtl ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </Link>
          )
        })}
      </div>
    </section>
  )
}
