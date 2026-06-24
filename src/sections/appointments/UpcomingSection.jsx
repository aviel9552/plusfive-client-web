import { Link } from 'react-router-dom'
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi'
import { useLanguage } from '../../context/LanguageContext'
import { getCustomerHomeTranslations } from '../../utils/translations'

function AppointmentDateChip({ startDate, locale }) {
  if (!startDate) return null
  const date = new Date(startDate)
  const month = date.toLocaleString(locale, { month: 'short' })
  const day = date.toLocaleString(locale, { day: 'numeric' })
  const weekday = date.toLocaleString(locale, { weekday: 'short' })
  const time = date.toLocaleString(locale, { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-customPink/20 bg-customPink/5 px-3 py-2.5 text-center dark:border-customPink/30 dark:bg-customPink/10">
      <span className="text-10 font-semibold uppercase tracking-wide text-customPink">
        {weekday}
      </span>
      <span className="text-22 font-black leading-none text-gray-900 dark:text-white">
        {day}
      </span>
      <span className="text-11 font-medium text-customBoldTextColor dark:text-customGray2">
        {month}
      </span>
      <span className="mt-1.5 flex items-center gap-1 text-12 font-semibold text-customPink">
        <FiClock className="h-3 w-3" aria-hidden />
        {time}
      </span>
    </div>
  )
}

export default function UpcomingSection({ nextAppointment, formatDateTime, loading }) {
  const { language } = useLanguage()
  const t = getCustomerHomeTranslations(language)
  const isRtl = language === 'he'
  const locale = language === 'he' ? 'he-IL' : 'en-US'

  return (
    <section
      dir={isRtl ? 'rtl' : 'ltr'}
      className="rounded-2xl border border-customGray2 bg-white dark:border-commonBorder dark:bg-customBrown"
    >
      <div className="flex items-center justify-between gap-3 border-b border-customGray2 px-5 py-3.5 dark:border-commonBorder">
        <h2 className="text-16 font-bold text-gray-900 dark:text-white">{t.upcomingTitle}</h2>
        <Link
          to="/client/appointments"
          className="text-13 font-semibold text-customPink transition hover:opacity-80"
        >
          {t.viewAll}
        </Link>
      </div>

      <div className="p-4 sm:p-5">
        {loading ? (
          <div className="animate-pulse flex gap-4">
            <div className="h-24 w-20 shrink-0 rounded-xl bg-gray-100 dark:bg-[#1a1a1a]" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-5 w-2/3 rounded bg-gray-100 dark:bg-[#1a1a1a]" />
              <div className="h-4 w-1/2 rounded bg-gray-100 dark:bg-[#1a1a1a]" />
            </div>
          </div>
        ) : null}

        {!loading && !nextAppointment ? (
          <div className="rounded-xl border border-dashed border-customGray2 bg-[#fafafa] px-4 py-6 text-center dark:border-commonBorder dark:bg-[#0a0a0a]">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-pink-500/10 text-customPink">
              <FiCalendar className="h-5 w-5" aria-hidden />
            </div>
            <p className="text-14 font-semibold text-gray-900 dark:text-white">{t.noAppointments}</p>
            <p className="mt-1 text-13 text-customBoldTextColor dark:text-customGray2">
              {t.noAppointmentsHint}
            </p>
            <Link
              to="/client/book/business"
              className="mt-4 inline-flex items-center rounded-xl bg-customPink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {t.bookAppointment}
            </Link>
          </div>
        ) : null}

        {!loading && nextAppointment ? (
          <div className="flex items-start gap-4 rounded-xl border border-customGray2 bg-[#fafafa] p-4 dark:border-commonBorder dark:bg-[#0a0a0a]">
            <AppointmentDateChip startDate={nextAppointment.startDate} locale={locale} />
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-17 font-bold text-gray-900 dark:text-white">
                {nextAppointment.serviceName || t.appointmentFallback}
              </p>
              {nextAppointment.businessName ? (
                <p className="mt-1 text-13 text-customBoldTextColor dark:text-customGray2">
                  {nextAppointment.businessName}
                </p>
              ) : null}
              {nextAppointment.staffName ? (
                <p className="mt-3 flex items-center gap-2 text-14 text-gray-700 dark:text-gray-300">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white dark:bg-[#1a1a1a]">
                    <FiUser className="h-3.5 w-3.5 text-customPink" aria-hidden />
                  </span>
                  {nextAppointment.staffName}
                </p>
              ) : null}
              {nextAppointment.startDate ? (
                <p className="mt-2 text-13 text-customBoldTextColor dark:text-customGray2 sm:hidden">
                  {formatDateTime(nextAppointment.startDate)}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
