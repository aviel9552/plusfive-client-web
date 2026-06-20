const STATUS_STYLES = {
  booked: 'bg-pink-500/10 text-customPink border-pink-500/20',
  scheduled: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-300',
  confirmed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-300',
  paid: 'bg-violet-500/10 text-customViolet border-violet-500/20',
  cancelled: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-300',
  no_show: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-300',
}

export function getStatusStyle(status) {
  const key = String(status || 'booked').toLowerCase()
  return STATUS_STYLES[key] || STATUS_STYLES.booked
}

export function getStatusLabel(status, t) {
  const key = String(status || 'booked').toLowerCase()
  return t[`status_${key}`] || t.status_booked || key
}
