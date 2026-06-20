import { getStatusLabel, getStatusStyle } from '../../utils/appointmentStatus'

function AppointmentCard({ appointment, t, formatDateTime, formatCurrency }) {
  const status = appointment.status || 'booked'

  return (
    <article className="rounded-xl border border-customGray2 bg-[#fafafa] p-4 dark:border-commonBorder dark:bg-[#141414]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-16 font-semibold text-customLightTextColor dark:text-white">
            {appointment.serviceName || t.appointmentFallback}
          </p>
          {appointment.staffName ? (
            <p className="mt-1 text-14 text-customBoldTextColor dark:text-customGray2">
              {appointment.staffName}
            </p>
          ) : null}
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-11 font-semibold uppercase tracking-wide ${getStatusStyle(status)}`}
        >
          {getStatusLabel(status, t)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-13 text-customBoldTextColor dark:text-customGray2">
        {appointment.startDate ? (
          <span className="font-medium text-customPink">{formatDateTime(appointment.startDate)}</span>
        ) : (
          <span>{t.datePending}</span>
        )}
        {appointment.price != null ? (
          <span>{formatCurrency(appointment.price)}</span>
        ) : null}
        {appointment.duration ? <span>{appointment.duration}</span> : null}
      </div>
    </article>
  )
}

export default function AppointmentList({
  items,
  emptyText,
  loading,
  loadingText,
  t,
  formatDateTime,
  formatCurrency,
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-customGray2 bg-white p-6 dark:border-commonBorder dark:bg-customBrown">
        <p className="text-14 text-customBoldTextColor dark:text-customGray2">{loadingText}</p>
      </div>
    )
  }

  if (!items?.length) {
    return (
      <div className="rounded-2xl border border-customGray2 bg-white p-6 dark:border-commonBorder dark:bg-customBrown">
        <p className="text-14 text-customBoldTextColor dark:text-customGray2">{emptyText}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          t={t}
          formatDateTime={formatDateTime}
          formatCurrency={formatCurrency}
        />
      ))}
    </div>
  )
}
