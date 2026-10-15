import { Sun, Moon } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const reduced = useReducedMotion()
  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      whileTap={reduced ? {} : { scale: 0.85 }}
      animate={reduced ? {} : { rotate: isDark ? 180 : 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`p-2 rounded-full transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 ${className}`}
    >
      {isDark
        ? <Sun size={18} className="text-gold" />
        : <Moon size={18} className="text-cream/80" />
      }
    </motion.button>
  )
}
