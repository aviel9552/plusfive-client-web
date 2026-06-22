import { useState } from 'react'
import { withCacheBuster } from '../../utils/imageUrl'
import { BRAND_COLOR } from '../../utils/constants'

export default function BusinessProfileTeam({ staff, teamTitle, seeAllLabel, noTeamLabel, teamMemberLabel }) {
  const [showAll, setShowAll] = useState(false)
  const members = (staff || []).filter((s) => s.isActive !== false)
  const visible = showAll ? members : members.slice(0, 8)

  if (members.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">{noTeamLabel}</p>
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{teamTitle}</h2>
        {members.length > 8 && !showAll ? (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="text-sm font-semibold text-gray-700 hover:underline dark:text-gray-300"
          >
            {seeAllLabel}
          </button>
        ) : null}
      </div>

      <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
        {visible.map((member) => {
          const name = member.fullName || member.name || teamMemberLabel
          const image = member.image || member.imageUrl
          return (
            <li key={member.id} className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 sm:h-28 sm:w-28">
                {image ? (
                  <img
                    src={withCacheBuster(image)}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span
                    className="text-2xl font-bold"
                    style={{ color: BRAND_COLOR }}
                  >
                    {name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <p className="mt-3 truncate text-sm font-semibold text-gray-900 dark:text-white">
                {name}
              </p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
