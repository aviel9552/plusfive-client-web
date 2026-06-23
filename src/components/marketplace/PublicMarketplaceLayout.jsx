import { Outlet } from 'react-router-dom'
import PublicHeader from './PublicHeader'
import PublicFooter from './PublicFooter'

export default function PublicMarketplaceLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa] text-gray-900 dark:bg-[#050505] dark:text-gray-100">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}
