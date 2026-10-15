import Spinner from './Spinner'

const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer'

const variants = {
  primary:        'bg-green-primary text-cream hover:bg-primary-light focus-visible:ring-green-primary',
  secondary:      'bg-gold text-white hover:bg-gold-light focus-visible:ring-gold',
  outline:        'border-2 border-green-primary text-[var(--color-text-primary)] bg-transparent hover:bg-green-primary hover:text-cream focus-visible:ring-green-primary',
  ghost:          'text-[var(--color-text-primary)] hover:bg-[var(--color-primary-mid)]/10 focus-visible:ring-[var(--color-primary-mid)]',
  danger:         'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
  'gold-gradient':'text-[#1a1a1a] font-semibold focus-visible:ring-gold hover:brightness-105 hover:scale-[1.02]',
}

const gradientStyles = {
  'gold-gradient': { background: 'var(--gradient-gold)' },
}

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-7 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  type = 'button',
  className = '',
  style: styleProp = {},
  ...props
}) {
  const inlineStyle = {
    ...(gradientStyles[variant] || {}),
    ...styleProp,
  }

  return (
    <button
      type={type}
      disabled={loading || props.disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      style={Object.keys(inlineStyle).length ? inlineStyle : undefined}
      {...props}
    >
      {loading && <Spinner size="sm" color={variant === 'outline' ? 'green' : 'white'} />}
      {children}
    </button>
  )
}
