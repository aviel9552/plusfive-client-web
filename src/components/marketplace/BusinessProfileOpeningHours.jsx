import { buildOpeningHoursRows } from '../../utils/marketplace/businessProfileHelpers'

export default function BusinessProfileOpeningHours({
  businessOperatingHours,
  language,
  title,
}) {
  const rows = buildOpeningHoursRows(businessOperatingHours, language)
  if (rows.length === 0) return null

  return (
    <div>
      <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
      <ul className="max-w-md space-y-3 text-sm">
        {rows.map((row) => (
          <li key={row.dayKey} className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400">
              {!row.isClosed ? (
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
              )}
              {row.label}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {row.isClosed ? '—' : row.hours}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
