import { useLanguage } from '../../context/LanguageContext'
import { getCustomerHomeTranslations } from '../../utils/translations'

export default function UpcomingSection({ nextAppointment, formatDateTime, loading }) {
  const { language } = useLanguage()
  const t = getCustomerHomeTranslations(language)
  const isRtl = language === 'he'

  return (
    <section
      dir={isRtl ? 'rtl' : 'ltr'}
      className="rounded-2xl border border-customGray2 bg-white p-6 dark:border-commonBorder dark:bg-customBrown"
    >
      <h2 className="text-18 font-semibold text-customLightTextColor dark:text-white">
        {t.upcomingTitle}
      </h2>

      {loading ? (
        <p className="mt-3 text-14 text-customBoldTextColor dark:text-customGray2">{t.loading}</p>
      ) : null}

      {!loading && !nextAppointment ? (
        <p className="mt-3 text-14 text-customBoldTextColor dark:text-customGray2">
          {t.noAppointments}
        </p>
      ) : null}

      {!loading && nextAppointment ? (
        <div className="mt-4 rounded-xl border border-customGray2 bg-[#fafafa] p-4 dark:border-commonBorder dark:bg-[#141414]">
          <p className="text-16 font-semibold text-customLightTextColor dark:text-white">
            {nextAppointment.serviceName || t.appointmentFallback}
          </p>
          {nextAppointment.staffName ? (
            <p className="mt-1 text-14 text-customBoldTextColor dark:text-customGray2">
              {nextAppointment.staffName}
            </p>
          ) : null}
          {nextAppointment.startDate ? (
            <p className="mt-2 text-14 font-medium text-customPink">
              {formatDateTime(nextAppointment.startDate)}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
