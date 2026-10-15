import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, name, error, type = 'text', placeholder, className = '', ...rest },
  ref
) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        ref={ref}
        aria-invalid={!!error}
        className={`w-full rounded-xl border px-4 py-3 text-sm transition-all
          focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold
          ${error
            ? 'border-red-500 focus:ring-red-400/50 focus:border-red-500'
            : 'border-[var(--color-border)] hover:border-[var(--color-primary-light)]/40'
          }
          ${className}`}
        style={{
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
        }}
        {...rest}
      />
      {error && (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})

export default Input
