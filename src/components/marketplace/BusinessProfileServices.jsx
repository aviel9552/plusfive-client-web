import { useMemo, useState } from 'react'
import {
  filterServicesByCategory,
  groupServiceCategories,
} from '../../utils/marketplace/businessProfileHelpers'

export default function BusinessProfileServices({
  services,
  showPrices,
  featuredLabel,
  servicesTitle,
  bookLabel,
  noServicesLabel,
  seeAllLabel,
  durationLabel,
  allowBooking,
  onBookService,
}) {
  const categories = useMemo(
    () => groupServiceCategories(services, featuredLabel),
    [services, featuredLabel],
  )
  const [activeCategory, setActiveCategory] = useState(featuredLabel)
  const [showAll, setShowAll] = useState(false)

  const filtered = useMemo(
    () => filterServicesByCategory(services, activeCategory, featuredLabel),
    [services, activeCategory, featuredLabel],
  )

  const visible = showAll ? filtered : filtered.slice(0, 6)

  if (services.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">{noServicesLabel}</p>
  }

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">{servicesTitle}</h2>

      {categories.length > 1 ? (
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setActiveCategory(cat)
                setShowAll(false)
              }}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                activeCategory === cat
                  ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                  : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300 dark:border-gray-700 dark:bg-transparent dark:text-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      ) : null}

      <ul className="space-y-3">
        {visible.map((service) => (
          <li
            key={service.id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-[#111111]"
          >
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white">{service.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                {service.duration != null && Number(service.duration) > 0 ? (
                  <span>
                    {durationLabel.replace('{n}', String(Number(service.duration)))}
                  </span>
                ) : null}
                {service.duration != null &&
                Number(service.duration) > 0 &&
                showPrices &&
                service.price != null ? (
                  <span aria-hidden>·</span>
                ) : null}
                {showPrices && service.price != null ? (
                  <span className="font-medium text-gray-900 dark:text-white">
                    ₪{Number(service.price).toLocaleString()}
                  </span>
                ) : null}
              </div>
            </div>
            {allowBooking ? (
              <button
                type="button"
                onClick={() => onBookService(service.id)}
                className="shrink-0 rounded-full border border-gray-900 px-5 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 dark:border-gray-300 dark:text-white dark:hover:bg-gray-900"
              >
                {bookLabel}
              </button>
            ) : null}
          </li>
        ))}
      </ul>

      {!showAll && filtered.length > 6 ? (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-5 rounded-full border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-900"
        >
          {seeAllLabel}
        </button>
      ) : null}
    </div>
  )
}
