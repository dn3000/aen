import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Store, BarChart2, Mail,
  LogOut, ArrowLeft, BarChart, Bell, Settings, MoreHorizontal,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { signOut } from 'firebase/auth'
import { auth } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import AppTopBar from './AppTopBar'
import ThemeToggle from '../ui/ThemeToggle'

const navItems = [
  { to: '/admin',            label: 'Overview',    icon: LayoutDashboard, end: true },
  { to: '/admin/farmers',    label: 'Farmers',     icon: Users },
  { to: '/admin/markets',    label: 'Markets',     icon: Store },
  { to: '/admin/prices',     label: 'Price Index', icon: BarChart2 },
  { to: '/admin/newsletter', label: 'Newsletter',  icon: Mail },
]

const comingSoon = [
  { label: 'Reports',       icon: BarChart },
  { label: 'Notifications', icon: Bell },
  { label: 'Settings',      icon: Settings },
]

// Mobile tabs: first 4 items + More overflow
const mobilePrimary = navItems.slice(0, 4)

const activeStyle = { backgroundColor: 'rgba(200,168,75,0.18)', borderLeft: '4px solid #c8a84b', color: '#e8c97a', paddingLeft: '12px' }
const idleStyle   = { color: 'rgba(250,246,239,0.6)', borderLeft: '4px solid transparent', paddingLeft: '12px' }

export default function AdminLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-surface-2)' }}>

      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden md:flex md:flex-col md:w-64 shrink-0 h-screen sticky top-0"
        style={{
          backgroundColor: 'rgba(20,46,24,0.99)',
          backdropFilter: 'blur(12px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Brand */}
        <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <img src="/icons/aen-logo.svg" alt="AEN" className="h-8 w-auto" />
          <p className="text-[10px] mt-1.5 font-semibold tracking-[0.18em] uppercase" style={{ color: 'rgba(250,246,239,0.35)' }}>
            Admin
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col overflow-y-auto">
          {/* Primary items */}
          <div className="mb-6">
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase px-3 mb-1.5" style={{ color: 'rgba(250,246,239,0.22)' }}>
              MANAGEMENT
            </p>
            <div className="flex flex-col gap-0.5">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className="flex items-center gap-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150"
                  style={({ isActive }) => isActive ? activeStyle : idleStyle}
                >
                  <Icon size={17} strokeWidth={1.75} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Coming soon */}
          <div>
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase px-3 mb-1.5" style={{ color: 'rgba(250,246,239,0.22)' }}>
              COMING SOON
            </p>
            <div className="flex flex-col gap-0.5">
              {comingSoon.map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 py-2.5 text-sm rounded-lg select-none cursor-not-allowed opacity-35"
                  style={{ color: 'rgba(250,246,239,0.6)', borderLeft: '3px solid transparent', paddingLeft: '9px' }}
                >
                  <Icon size={17} strokeWidth={1.75} />
                  {label}
                  <span
                    className="ml-auto text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: 'rgba(200,168,75,0.2)', color: '#c8a84b' }}
                  >
                    Soon
                  </span>
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 flex flex-col gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm transition-colors cursor-pointer"
            style={{ color: 'rgba(250,246,239,0.5)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(250,246,239,0.9)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(250,246,239,0.5)'}
          >
            <ArrowLeft size={15} /> Back to App
          </button>
          <div className="text-xs truncate" style={{ color: 'rgba(250,246,239,0.35)' }}>{user?.email}</div>
          <div className="flex items-center justify-between">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm transition-colors cursor-pointer"
              style={{ color: 'rgba(250,246,239,0.5)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e57373'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(250,246,239,0.5)'}
            >
              <LogOut size={15} /> Sign Out
            </button>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div className="flex flex-col flex-1 min-w-0">
        <AppTopBar />
        <main className="flex-1 p-6 pb-24 md:pb-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex"
        style={{
          backgroundColor: 'rgba(20,46,24,0.99)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {mobilePrimary.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="flex-1 flex flex-col items-center gap-0.5 py-3 text-xs transition-colors"
            style={({ isActive }) => ({ color: isActive ? '#c8a84b' : 'rgba(250,246,239,0.5)' })}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* More tab */}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex-1 flex flex-col items-center gap-0.5 py-3 text-xs transition-colors cursor-pointer"
          style={{ color: 'rgba(250,246,239,0.5)' }}
        >
          <MoreHorizontal size={20} />
          <span>More</span>
        </button>
      </nav>

      {/* Admin mobile More drawer */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl md:hidden"
              style={{
                backgroundColor: 'rgba(20,46,24,0.99)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderBottom: 'none',
                paddingBottom: 'calc(env(safe-area-inset-bottom) + 72px)',
              }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 420, damping: 40 }}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-9 h-1 rounded-full bg-white/20" />
              </div>
              <div className="px-4 pb-2">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase px-3 mb-2" style={{ color: 'rgba(250,246,239,0.3)' }}>More</p>

                {/* Newsletter (5th nav item) */}
                <NavLink
                  to="/admin/newsletter"
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl mb-0.5 transition-colors hover:bg-white/5"
                  style={{ color: 'rgba(250,246,239,0.8)' }}
                >
                  <Mail size={20} style={{ color: 'var(--color-gold)' }} />
                  Newsletter
                </NavLink>

                {/* Coming soon stubs */}
                {comingSoon.map(({ label, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 px-3 py-3 text-sm rounded-xl mb-0.5 opacity-35 cursor-not-allowed select-none"
                    style={{ color: 'rgba(250,246,239,0.8)' }}
                  >
                    <Icon size={20} style={{ color: 'var(--color-gold)' }} />
                    {label}
                    <span className="ml-auto text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: 'rgba(200,168,75,0.2)', color: '#c8a84b' }}>
                      Soon
                    </span>
                  </div>
                ))}

                <div className="my-2 mx-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />

                <button
                  onClick={() => { setMoreOpen(false); navigate('/dashboard') }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-colors hover:bg-white/5 cursor-pointer"
                  style={{ color: 'rgba(250,246,239,0.6)' }}
                >
                  <ArrowLeft size={20} /> Back to App
                </button>

                {/* Theme toggle row */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
                  <span className="text-sm font-medium" style={{ color: 'rgba(250,246,239,0.7)' }}>Appearance</span>
                  <ThemeToggle />
                </div>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-colors hover:bg-white/5 cursor-pointer"
                  style={{ color: '#e57373' }}
                >
                  <LogOut size={20} /> Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
