import { createContext, useContext, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const { user } = useAuth()

  const showToast = useCallback((message, variant = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, variant }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  // Shift toast above MobileNav on mobile when authenticated
  const bottomClass = user
    ? 'bottom-[104px] md:bottom-6'
    : 'bottom-6'

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className={`fixed ${bottomClass} left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4`}>
        {toasts.map(({ id, message, variant }) => (
          <div
            key={id}
            className={`flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-lg text-white
              ${variant === 'error' ? 'bg-red-600' : 'bg-green-primary'}`}
          >
            <span>{message}</span>
            <button onClick={() => dismiss(id)} className="shrink-0 opacity-80 hover:opacity-100">
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
