import { useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Newspaper, Bell, User, LogOut, X, Sun, Moon } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../../firebase'
import { useTheme } from '../../context/ThemeContext'

export default function MoreDrawer({ open, onClose }) {
  const navigate = useNavigate()
  const dragRef = useRef(null)
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  async function handleLogout() {
    onClose()
    await signOut(auth)
    navigate('/')
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl mb-0.5 transition-colors ${
      isActive ? '' : 'hover:bg-white/5'
    }`

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.div
            ref={dragRef}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl overflow-hidden"
            style={{
              backgroundColor: 'rgba(20,46,24,0.99)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderBottom: 'none',
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 72px)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 40 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.3 }}
            onDragEnd={(_, info) => {
              if (info.velocity.y > 250 || info.offset.y > 100) onClose()
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-9 h-1 rounded-full bg-white/20" />
            </div>

            <div className="px-3 pb-2">
              {/* Header row */}
              <div className="flex items-center justify-between px-3 mb-2">
                <p
                  className="text-[10px] font-bold tracking-[0.2em] uppercase"
                  style={{ color: 'rgba(250,246,239,0.3)' }}
                >
                  More
                </p>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  style={{ color: 'rgba(250,246,239,0.4)' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Primary links */}
              <NavLink
                to="/knowledge"
                onClick={onClose}
                className={linkClass}
                style={({ isActive }) => ({ color: isActive ? '#e8c97a' : 'rgba(250,246,239,0.8)' })}
              >
                <GraduationCap size={20} style={{ color: 'var(--color-gold)' }} />
                Knowledge Hub
              </NavLink>

              <NavLink
                to="/newsletter"
                onClick={onClose}
                className={linkClass}
                style={({ isActive }) => ({ color: isActive ? '#e8c97a' : 'rgba(250,246,239,0.8)' })}
              >
                <Newspaper size={20} style={{ color: 'var(--color-gold)' }} />
                Newsletter
              </NavLink>

              {/* Notifications — Phase 2 placeholder */}
              <div className="flex items-center gap-3 px-3 py-3 text-sm rounded-xl mb-0.5 opacity-40 cursor-not-allowed select-none">
                <Bell size={20} style={{ color: 'var(--color-gold)' }} />
                <span style={{ color: 'rgba(250,246,239,0.8)' }}>Notifications</span>
                <span
                  className="ml-auto text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: 'rgba(200,168,75,0.2)', color: '#c8a84b' }}
                >
                  Soon
                </span>
              </div>

              {/* Divider */}
              <div className="my-2 mx-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />

              {/* Profile */}
              <NavLink
                to="/profile"
                onClick={onClose}
                className={linkClass}
                style={({ isActive }) => ({ color: isActive ? '#e8c97a' : 'rgba(250,246,239,0.8)' })}
              >
                <User size={20} style={{ color: 'rgba(250,246,239,0.35)' }} />
                My Profile
              </NavLink>

              {/* Theme toggle row */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-colors hover:bg-white/5 cursor-pointer"
                style={{ color: 'rgba(250,246,239,0.8)' }}
              >
                {isDark
                  ? <Sun size={20} style={{ color: 'var(--color-gold)' }} />
                  : <Moon size={20} style={{ color: 'rgba(250,246,239,0.5)' }} />
                }
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>

              {/* Sign out */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-colors hover:bg-white/5 cursor-pointer"
                style={{ color: '#e57373' }}
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
