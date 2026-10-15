import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Store, BarChart2,
  GraduationCap, Newspaper, User, LogOut,
} from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../ui/ThemeToggle'

const sections = [
  {
    label: 'MAIN',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ],
  },
  {
    label: 'MARKETS',
    items: [
      { to: '/marketplace', icon: Store,    label: 'Marketplace' },
      { to: '/price-index', icon: BarChart2, label: 'Price Index' },
    ],
  },
  {
    label: 'LEARN',
    items: [
      { to: '/knowledge',  icon: GraduationCap, label: 'Knowledge Hub' },
      { to: '/newsletter', icon: Newspaper,     label: 'Newsletter' },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      { to: '/profile', icon: User, label: 'My Profile' },
    ],
  },
]

const activeStyle  = { backgroundColor: 'rgba(200,168,75,0.18)', borderLeft: '3px solid #c8a84b', color: '#e8c97a', paddingLeft: '9px' }
const idleStyle    = { color: 'rgba(250,246,239,0.6)', borderLeft: '3px solid transparent', paddingLeft: '9px' }

export default function FarmerSidebar() {
  const { user, farmerProfile } = useAuth()
  const navigate = useNavigate()

  const name = farmerProfile?.fullName || ''
  const initials = name.includes(' ')
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : (name.slice(0, 2) || user?.email?.slice(0, 2) || 'U').toUpperCase()

  async function handleLogout() {
    await signOut(auth)
    navigate('/')
  }

  return (
    <aside
      className="hidden md:flex md:flex-col w-64 shrink-0 h-screen sticky top-0"
      style={{
        backgroundColor: 'rgba(20,46,24,0.99)',
        backdropFilter: 'blur(12px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Brand header */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <img src="/icons/aen-logo.svg" alt="AEN" className="h-8 w-auto" />
        <p
          className="text-[10px] mt-1.5 font-semibold tracking-[0.18em] uppercase"
          style={{ color: 'rgba(250,246,239,0.35)' }}
        >
          Farmer Portal
        </p>
      </div>

      {/* Navigation sections */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {sections.map(section => (
          <div key={section.label} className="mb-6">
            <p
              className="text-[9px] font-bold tracking-[0.2em] uppercase px-3 mb-1.5"
              style={{ color: 'rgba(250,246,239,0.22)' }}
            >
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map(({ to, icon: Icon, label, end }) => (
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
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 select-none"
            style={{ background: 'var(--gradient-gold)', color: '#1a1a1a' }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'rgba(250,246,239,0.85)' }}>
              {farmerProfile?.fullName || 'Farmer'}
            </p>
            <p className="text-[10px] truncate" style={{ color: 'rgba(250,246,239,0.32)' }}>
              {user?.email}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs transition-colors cursor-pointer py-1.5 rounded-lg hover:bg-white/5 px-1"
            style={{ color: 'rgba(250,246,239,0.4)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#e57373'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(250,246,239,0.4)'}
          >
            <LogOut size={14} /> Sign Out
          </button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
