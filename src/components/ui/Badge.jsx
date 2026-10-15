const variants = {
  success: 'bg-green-100 text-green-primary dark:bg-green-primary/25 dark:text-green-light',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  info:    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  gold:    'bg-amber-50 text-gold dark:bg-gold/15 dark:text-gold-light',
  default: 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-[var(--color-text-secondary)]',
}

export default function Badge({ children, variant = 'default' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}
