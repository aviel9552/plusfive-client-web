import { Link, useLocation } from 'react-router-dom'
import { FiChevronRight } from 'react-icons/fi'
import { useBooking } from '../../context/BookingContext'

const STEPS = [
  { key: 'business', path: '/client/book/business' },
  { key: 'services', path: '/client/book/services' },
  { key: 'staff', path: '/client/book/staff' },
  { key: 'datetime', path: '/client/book/datetime' },
  { key: 'confirm', path: '/client/book/confirm' },
]

export default function BookingProgress({ t }) {
  const location = useLocation()
  const { allowChooseTeamMember } = useBooking()

  const visibleSteps = allowChooseTeamMember
    ? STEPS
    : STEPS.filter((s) => s.key !== 'staff')

  const currentIndex = visibleSteps.findIndex((s) => location.pathname.startsWith(s.path))

  return (
    <nav className="mb-4 overflow-x-auto pb-1 sm:mb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max items-center gap-1 px-0.5 text-xs text-gray-500 sm:text-sm">
      {visibleSteps.map((step, index) => {
        const isActive = index === currentIndex
        const isPast = index < currentIndex
        const label = t[`step${step.key.charAt(0).toUpperCase()}${step.key.slice(1)}`] || step.key

        return (
          <span key={step.key} className="flex items-center gap-1">
            {index > 0 && (
              <FiChevronRight className="text-gray-400" aria-hidden />
            )}
            {isPast ? (
              <Link
                to={step.path}
                className="font-medium text-gray-700 hover:text-customPink transition-colors"
              >
                {label}
              </Link>
            ) : (
              <span
                className={
                  isActive
                    ? 'font-semibold text-customPink'
                    : 'text-gray-400'
                }
              >
                {label}
              </span>
            )}
          </span>
        )
      })}
      </div>
    </nav>
  )
}
