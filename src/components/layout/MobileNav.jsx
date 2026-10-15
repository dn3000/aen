import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Store, BarChart2, User, MoreHorizontal } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import MoreDrawer from './MoreDrawer'

const DRAWER_ROUTES = ['/knowledge', '/newsletter', '/profile']

const tabs = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Home'    },
  { to: '/marketplace', icon: Store,           label: 'Market'  },
  { to: '/price-index', icon: BarChart2,       label: 'Prices'  },
  { to: '/profile',     icon: User,            label: 'Profile' },
]

export default function MobileNav() {
  const reduced = useReducedMotion()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { pathname } = useLocation()

  // "More" tab is highlighted when the current route lives in the drawer
  const moreActive = DRAWER_ROUTES.includes(pathname) && !tabs.some(t => t.to === pathname)

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a140c] border-t border-white/5"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex h-[60px]">
          {tabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `relative flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive
                    ? 'text-[var(--color-gold)]'
                    : 'text-[#e8f0e9]/40 hover:text-[#e8f0e9]/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-dot"
                      className="w-1 h-1 rounded-full bg-[var(--color-gold)] absolute top-0"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <motion.div
                    className="flex flex-col items-center gap-1"
                    whileTap={reduced ? {} : { scale: 0.88 }}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">{label}</span>
                  </motion.div>
                </>
              )}
            </NavLink>
          ))}

          {/* More tab */}
          <button
            onClick={() => setDrawerOpen(true)}
            className={`relative flex-1 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              moreActive
                ? 'text-[var(--color-gold)]'
                : 'text-[#e8f0e9]/40 hover:text-[#e8f0e9]/70'
            }`}
          >
            {moreActive && (
              <motion.div
                layoutId="mobile-nav-dot"
                className="w-1 h-1 rounded-full bg-[var(--color-gold)] absolute top-0"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <motion.div
              className="flex flex-col items-center gap-1"
              whileTap={reduced ? {} : { scale: 0.88 }}
            >
              <MoreHorizontal size={20} strokeWidth={moreActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">More</span>
            </motion.div>
          </button>
        </div>
      </nav>

      <MoreDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
