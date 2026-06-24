import { Link } from 'react-router-dom'
import { FiBriefcase, FiCalendar, FiZap } from 'react-icons/fi'
import { withCacheBuster } from '../../utils/imageUrl'

const AVATAR_COLORS = [
  'from-violet-500 to-purple-600',
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-rose-500 to-pink-600',
]

function colorForName(name = '') {
  const code = (name || '').charCodeAt(0) || 0
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}

function HomeAvatar({ name, imageUrl }) {
  const initial = (name || 'C').charAt(0).toUpperCase()

  if (imageUrl) {
    return (
      <img
        src={withCacheBuster(imageUrl)}
        alt=""
        className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-4 ring-white dark:ring-customBrown sm:h-20 sm:w-20"
      />
    )
  }

  return (
    <span
      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-bold text-white ring-4 ring-white dark:ring-customBrown sm:h-20 sm:w-20 sm:text-2xl ${colorForName(name)}`}
    >
      {initial}
    </span>
  )
}

export default function HomeWelcomeHero({ name, businessName, profileImage, t }) {
  const greeting = t.welcomeBack.replace('{{name}}', name)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-customGray2 bg-white dark:border-commonBorder dark:bg-customBrown">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-customPink/10 via-transparent to-customViolet/10"
        aria-hidden
      />
      <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        <HomeAvatar name={name} imageUrl={profileImage} />

        <div className="min-w-0 flex-1">
          <p className="inline-flex items-center gap-2 text-11 font-semibold uppercase tracking-[0.08em] text-customPink">
            <FiZap className="h-3.5 w-3.5" aria-hidden />
            {t.dashboardLabel}
          </p>
          <h1 className="mt-1 text-22 font-black text-gray-900 dark:text-white sm:text-26">
            {greeting}
          </h1>
          <p className="mt-1 text-14 text-customBoldTextColor dark:text-customGray2">
            {t.subtitle}
          </p>
          {businessName ? (
            <p className="mt-3 inline-flex max-w-full items-center gap-2 truncate rounded-full border border-customPink/20 bg-customPink/5 px-3 py-1 text-12 font-semibold text-customPink">
              <FiBriefcase className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">{businessName}</span>
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <Link
            to="/client/book/business"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-customPink px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <FiCalendar className="h-4 w-4" aria-hidden />
            {t.bookAppointment}
          </Link>
          <Link
            to="/client/appointments"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 dark:border-commonBorder dark:bg-[#0a0a0a] dark:text-white dark:hover:bg-[#1a1a1a]"
          >
            {t.viewAppointments}
          </Link>
        </div>
      </div>
    </div>
  )
}
