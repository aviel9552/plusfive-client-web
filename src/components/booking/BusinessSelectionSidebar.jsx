import { BRAND_COLOR } from '../../utils/constants'
import { withCacheBuster } from '../../utils/imageUrl'

export default function BusinessSelectionSidebar({
  t,
  selectedBusiness,
  onContinue,
  continueDisabled,
}) {
  const name = selectedBusiness?.businessName || ''
  const imageUrl = selectedBusiness?.profileImage
    ? withCacheBuster(selectedBusiness.profileImage)
    : null
  const initial = (name || 'B').charAt(0).toUpperCase()

  return (
    <aside className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-commonBorder dark:bg-[#181818] sm:p-5 lg:sticky lg:top-24">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {t.stepBusiness}
      </p>

      {selectedBusiness ? (
        <div className="mb-4 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-commonBorder">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg font-bold"
              style={{ color: BRAND_COLOR }}
            >
              {initial}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900 dark:text-gray-100">
              {name}
            </p>
            {selectedBusiness.isAssigned ? (
              <span className="mt-1 inline-block rounded-md bg-customPink/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-customPink">
                {t.assignedBadge}
              </span>
            ) : null}
            {selectedBusiness.address ? (
              <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                {selectedBusiness.address}
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{t.selectBusinessFirst}</p>
      )}

      <button
        type="button"
        disabled={continueDisabled}
        onClick={onContinue}
        className={`hidden w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition lg:block ${
          continueDisabled
            ? 'cursor-not-allowed bg-gray-300 dark:bg-gray-600'
            : 'hover:opacity-90'
        }`}
        style={continueDisabled ? undefined : { backgroundColor: BRAND_COLOR }}
      >
        {t.continue}
      </button>
    </aside>
  )
}
