import { DAYS_OF_WEEK_KEYS } from '../../config/bookingConstants'

const DAY_LABELS_EN = {
  sunday: 'Sunday',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
}

const DAY_LABELS_HE = {
  sunday: 'יום ראשון',
  monday: 'יום שני',
  tuesday: 'יום שלישי',
  wednesday: 'יום רביעי',
  thursday: 'יום חמישי',
  friday: 'יום שישי',
  saturday: 'יום שבת',
}

function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null
  const [h, m] = timeStr.split(':').map((v) => Number(v))
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

export function formatBusinessTime(timeStr, language = 'en') {
  const minutes = parseTimeToMinutes(timeStr)
  if (minutes == null) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (language === 'he') {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

export function getDayLabel(dayKey, language = 'en') {
  const labels = language === 'he' ? DAY_LABELS_HE : DAY_LABELS_EN
  return labels[dayKey] || dayKey
}

export function getTodayDayKey() {
  return DAYS_OF_WEEK_KEYS[new Date().getDay()]
}

export function getOpenStatus(businessOperatingHours, language, t) {
  if (!businessOperatingHours || typeof businessOperatingHours !== 'object') {
    return { isOpen: null, label: null }
  }

  const todayKey = getTodayDayKey()
  const today = businessOperatingHours[todayKey]
  if (!today?.active || !today.endTime) {
    return { isOpen: false, label: t.closedToday }
  }

  const now = new Date()
  const current = now.getHours() * 60 + now.getMinutes()
  const start = parseTimeToMinutes(today.startTime)
  const end = parseTimeToMinutes(today.endTime)

  if (start != null && end != null && current >= start && current < end) {
    return {
      isOpen: true,
      label: t.openUntil.replace('{time}', formatBusinessTime(today.endTime, language)),
    }
  }

  return { isOpen: false, label: t.closedToday }
}

export function buildOpeningHoursRows(businessOperatingHours, language) {
  if (!businessOperatingHours) return []
  return DAYS_OF_WEEK_KEYS.map((dayKey) => {
    const cfg = businessOperatingHours[dayKey]
    const label = getDayLabel(dayKey, language)
    if (!cfg?.active) {
      return { dayKey, label, hours: null, isClosed: true }
    }
    const start = formatBusinessTime(cfg.startTime, language)
    const end = formatBusinessTime(cfg.endTime, language)
    if (!start || !end) {
      return { dayKey, label, hours: null, isClosed: true }
    }
    return { dayKey, label, hours: `${start} – ${end}`, isClosed: false }
  })
}

export function collectGalleryImages(business, gallery = []) {
  const urls = []
  const push = (url) => {
    if (url && typeof url === 'string' && !urls.includes(url)) urls.push(url)
  }

  ;(gallery || []).forEach((item) => {
    push(item?.url || item?.fileUrl)
  })

  push(business?.coverImage)

  const galleryCount = urls.length
  if (galleryCount < 3) {
    push(business?.image)
  }

  return urls
}

export function groupServiceCategories(services, featuredLabel) {
  const categories = []
  const seen = new Set()

  services.forEach((service) => {
    const cat = String(service?.category || '').trim()
    if (cat && !seen.has(cat)) {
      seen.add(cat)
      categories.push(cat)
    }
  })

  return [featuredLabel, ...categories]
}

export function filterServicesByCategory(services, category, featuredLabel) {
  if (!category || category === featuredLabel) return services
  return services.filter((s) => String(s?.category || '').trim() === category)
}
