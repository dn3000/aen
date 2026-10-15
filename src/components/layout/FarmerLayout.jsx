import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import FarmerSidebar from './FarmerSidebar'
import AppTopBar from './AppTopBar'
import MobileNav from './MobileNav'

export default function FarmerLayout() {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
      {/* Left sidebar — desktop only, persists across route changes */}
      <FarmerSidebar />

      {/* Right column: top bar + scrollable content */}
      <div className="flex flex-col flex-1 min-w-0">
        <AppTopBar />
        {/* AnimatePresence scoped here so sidebar + top bar never re-mount */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <AnimatePresence mode="wait">
            <Outlet key={pathname} />
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}
