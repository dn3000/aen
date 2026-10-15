import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Menu, X, LogOut, User, House, BookOpen, Shield, Newspaper,
  GraduationCap, Store, BarChart2, Users, LayoutDashboard,
} from 'lucide-react'
import { auth } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../ui/ThemeToggle'

// Routes managed by FarmerLayout or AdminLayout — Navbar is hidden there
const APP_ROUTES = ['/dashboard', '/marketplace', '/price-index', '/profile']

export default function Navbar() {
  const { user, farmerProfile } = useAuth()
  const isDemo = user?.email === 'demo@aen.co.zw'
  const isAdmin = farmerProfile?.role === 'admin'
  const navigate = useNavigate()
  const location = useLocation()
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const inAppRoute   = APP_ROUTES.some(r => location.pathname.startsWith(r))
  const inAdminRoute = location.pathname.startsWith('/admin')
  const hidden       = inAppRoute || inAdminRoute

  useEffect(() => { setOpen(false) }, [location.pathname])

  useEffect(() => {
    if (hidden) return
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [hidden])

  if (hidden) return null

  async function handleLogout() {
    await signOut(auth)
    navigate('/')
  }

  const navLinkClass = ({ isActive }) =>
    `relative flex items-center gap-1.5 text-sm font-medium transition-colors px-1 py-0.5 ${
      isActive ? 'text-gold' : 'text-cream/80 hover:text-cream'
    }`

  return (
    <nav
      className={`glass sticky top-0 z-50 transition-shadow duration-300 ${
        scrolled ? 'shadow-lg shadow-black/20' : ''
      }`}
      style={{ backgroundColor: 'rgba(26, 58, 31, 0.92)' }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-cream">
            <img src="/icons/aen-logohandsbrwn.svg" alt="AEN" className="h-7 w-7 object-contain" />
            <span className="gradient-text font-bold">AEN</span>
          </Link>

          {/* Desktop centre links */}
          <div className="hidden md:flex items-center gap-5">
            {!user ? (
              /* GUEST desktop */
              <>
                <NavLink to="/" end className={navLinkClass}><House size={14} />Home</NavLink>
                <NavLink to="/about" className={navLinkClass}><BookOpen size={14} />About</NavLink>
                <NavLink to="/team" className={navLinkClass}><Users size={14} />Team</NavLink>
                <NavLink to="/partners" className={navLinkClass}><Shield size={14} />Partners</NavLink>
                <NavLink to="/knowledge" className={navLinkClass}><GraduationCap size={14} />Knowledge</NavLink>
                <NavLink to="/testimonials" className={navLinkClass}><User size={14} />Stories</NavLink>
              </>
            ) : (
              /* LOGGED-IN user on public pages */
              <>
                <NavLink to="/dashboard" className={navLinkClass}><LayoutDashboard size={14} />Dashboard</NavLink>
                <NavLink to="/about" className={navLinkClass}><BookOpen size={14} />About</NavLink>
                <NavLink to="/knowledge" className={navLinkClass}><GraduationCap size={14} />Knowledge</NavLink>
                <NavLink to="/newsletter" className={navLinkClass}><Newspaper size={14} />Newsletter</NavLink>
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 text-sm font-semibold px-2 py-0.5 rounded-md transition-colors ${
                        isActive ? 'bg-gold text-green-dark' : 'bg-gold/20 text-gold hover:bg-gold/30'
                      }`
                    }
                  >
                    <Shield size={14} />Admin
                  </NavLink>
                )}
              </>
            )}
          </div>

          {/* Desktop right cluster */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2 ml-1">
                {isDemo && (
                  <span className="text-xs font-semibold bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 rounded-full px-2 py-0.5">
                    DEMO
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-cream/80 hover:text-cream transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                  {isDemo ? 'Exit Demo' : 'Logout'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-1">
                <Link to="/login" className="text-sm text-cream/80 hover:text-cream font-medium transition-colors">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold px-4 py-1.5 rounded-full transition-all hover:brightness-110"
                  style={{ background: 'var(--gradient-gold)', color: '#1a1a1a' }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setOpen(!open)}
              className="text-cream p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden"
            style={{ backgroundColor: 'rgba(15, 26, 16, 0.97)' }}
          >
            <div className="px-4 pb-5 pt-2 flex flex-col gap-0.5 border-t border-white/10">
              {!user ? (
                /* GUEST mobile */
                <>
                  <MobileLink to="/" icon={<House size={16} />}>Home</MobileLink>
                  <MobileLink to="/about" icon={<BookOpen size={16} />}>About</MobileLink>
                  <MobileLink to="/team" icon={<Users size={16} />}>Team</MobileLink>
                  <MobileLink to="/partners" icon={<Shield size={16} />}>Partners</MobileLink>
                  <MobileLink to="/knowledge" icon={<GraduationCap size={16} />}>Knowledge Hub</MobileLink>
                  <div className="flex gap-3 pt-4">
                    <Link
                      to="/login"
                      className="flex-1 text-center border border-cream/30 text-cream text-sm font-medium py-2.5 rounded-xl transition-colors hover:bg-white/5"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="flex-1 text-center text-sm font-semibold py-2.5 rounded-xl transition-all hover:brightness-110"
                      style={{ background: 'var(--gradient-gold)', color: '#1a1a1a' }}
                    >
                      Register Free
                    </Link>
                  </div>
                </>
              ) : (
                /* LOGGED-IN mobile (public pages only) */
                <>
                  <MobileLink to="/dashboard" icon={<LayoutDashboard size={16} />}>Dashboard</MobileLink>
                  <MobileLink to="/marketplace" icon={<Store size={16} />}>Marketplace</MobileLink>
                  <MobileLink to="/price-index" icon={<BarChart2 size={16} />}>Price Index</MobileLink>
                  <MobileLink to="/about" icon={<BookOpen size={16} />}>About</MobileLink>
                  <MobileLink to="/knowledge" icon={<GraduationCap size={16} />}>Knowledge Hub</MobileLink>
                  <MobileLink to="/newsletter" icon={<Newspaper size={16} />}>Newsletter</MobileLink>
                  <MobileLink to="/profile" icon={<User size={16} />}>My Profile</MobileLink>
                  {isAdmin && (
                    <MobileLink to="/admin" icon={<Shield size={16} />}>Admin Panel</MobileLink>
                  )}
                  <div className="pt-3 flex items-center gap-2">
                    {isDemo && (
                      <span className="text-xs font-semibold bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 rounded-full px-2 py-0.5">
                        DEMO
                      </span>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-sm text-cream/70 hover:text-cream py-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut size={16} />
                      {isDemo ? 'Exit Demo' : 'Logout'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

function MobileLink({ to, icon, children }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-2.5 text-sm font-medium py-2.5 transition-colors ${
          isActive ? 'text-gold' : 'text-cream/80 hover:text-cream'
        }`
      }
    >
      {icon}
      {children}
    </NavLink>
  )
}
