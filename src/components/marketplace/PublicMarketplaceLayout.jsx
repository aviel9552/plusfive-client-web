import { Outlet } from 'react-router-dom'
import PublicHeader from './PublicHeader'

export default function PublicMarketplaceLayout() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 dark:bg-[#050505] dark:text-gray-100">
      <PublicHeader />
      <Outlet />
      <footer className="border-t border-gray-200 bg-white py-10 dark:border-gray-800 dark:bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 dark:text-gray-400 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} PlusFive
        </div>
      </footer>
    </div>
  )
}
