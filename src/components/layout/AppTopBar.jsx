import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Bell, User, LogOut } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../ui/ThemeToggle'

const PAGE_TITLES = {
  '/dashboard':   'Dashboard',
  '/marketplace': 'Marketplace',
  '/price-index': 'Price Index',
  '/profile':     'My Profile',
  '/admin':       'Admin Overview',
  '/admin/farmers':    'Farmers',
  '/admin/markets':    'Markets',
  '/admin/prices':     'Price Index',
  '/admin/newsletter': 'Newsletter',
}

function getTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.startsWith('/admin/farmers/')) return 'Farmer Detail'
  if (pathname.startsWith('/admin/markets/')) return pathname.endsWith('/new') ? 'New Listing' : 'Edit Listing'
  if (pathname.startsWith('/admin/prices/'))  return pathname.endsWith('/new') ? 'New Price Week' : 'Edit Price Week'
  return 'AEN'
}

export default function AppTopBar() {
  const { user, farmerProfile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [avatarOpen, setAvatarOpen] = useState(false)
  const popoverRef = useRef(null)

  const pageTitle = getTitle(location.pathname)
  const name = farmerProfile?.fullName || user?.email || ''
  const initials = name.includes(' ')
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : name.slice(0, 2).toUpperCase()

  useEffect(() => {
    function handleOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) setAvatarOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  async function handleLogout() {
    setAvatarOpen(false)
    await signOut(auth)
    navigate('/')
  }

  return (
    <header
      className="h-14 flex items-center justify-between px-4 shrink-0 z-30"
      style={{
        backgroundColor: 'rgba(26,58,31,0.97)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <h1 className="text-base font-semibold text-cream/90 font-display">{pageTitle}</h1>

      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg transition-colors hover:bg-white/10 cursor-pointer"
          style={{ color: 'rgba(250,246,239,0.55)' }}
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-1 ring-black/30" />
        </button>

        {/* Avatar + popover */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setAvatarOpen(v => !v)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-opacity hover:opacity-80 select-none"
            style={{ background: 'var(--gradient-gold)', color: '#1a1a1a' }}
            aria-label="User menu"
          >
            {initials}
          </button>

          {avatarOpen && (
            <div
              className="absolute right-0 top-11 w-52 rounded-2xl shadow-2xl z-50 overflow-hidden border"
              style={{
                backgroundColor: 'rgba(26,58,31,0.98)',
                borderColor: 'rgba(255,255,255,0.1)',
              }}
            >
              <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-sm font-semibold truncate text-cream/90">
                  {farmerProfile?.fullName || 'Farmer'}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(250,246,239,0.4)' }}>
                  {user?.email}
                </p>
              </div>
              <NavLink
                to="/profile"
                onClick={() => setAvatarOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-white/10"
                style={{ color: 'rgba(250,246,239,0.7)' }}
              >
                <User size={15} /> My Profile
              </NavLink>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-white/10 cursor-pointer"
                style={{ color: '#e57373' }}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
