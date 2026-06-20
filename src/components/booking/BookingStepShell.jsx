import { BRAND_COLOR } from '../../utils/constants'

/**
 * Responsive booking step layout:
 * - Mobile: summary on top, sticky Continue bar at bottom
 * - Desktop (lg+): main + sticky sidebar
 */
export default function BookingStepShell({
  children,
  sidebar,
  onContinue,
  continueDisabled = false,
  continueLabel,
}) {
  const showContinue = Boolean(onContinue)

  const continueButtonClass = (fullWidth = true) =>
    `${fullWidth ? 'w-full' : 'min-w-[220px]'} rounded-xl px-4 py-3.5 text-sm font-semibold text-white transition ${
      continueDisabled
        ? 'cursor-not-allowed bg-gray-300 dark:bg-gray-600'
        : 'hover:opacity-90 active:scale-[0.99]'
    }`

  return (
    <div className={showContinue ? 'pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0' : ''}>
      {sidebar ? (
        <div className="mb-4 lg:hidden">{sidebar}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_min(100%,320px)] lg:gap-8">
        <div className="min-w-0">{children}</div>
        {sidebar ? <div className="hidden min-w-0 lg:block">{sidebar}</div> : null}
      </div>

      {showContinue && !sidebar ? (
        <div className="mt-8 hidden lg:flex lg:justify-end">
          <button
            type="button"
            disabled={continueDisabled}
            onClick={onContinue}
            className={continueButtonClass(false)}
            style={continueDisabled ? undefined : { backgroundColor: BRAND_COLOR }}
          >
            {continueLabel}
          </button>
        </div>
      ) : null}

      {showContinue ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-3 py-3 backdrop-blur-sm dark:border-commonBorder dark:bg-[#181818]/95 lg:hidden">
          <button
            type="button"
            disabled={continueDisabled}
            onClick={onContinue}
            className={continueButtonClass(true)}
            style={continueDisabled ? undefined : { backgroundColor: BRAND_COLOR }}
          >
            {continueLabel}
          </button>
        </div>
      ) : null}
    </div>
  )
}
