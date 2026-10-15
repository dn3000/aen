import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { CheckCircle2, TrendingUp, Users } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { auth } from '../firebase'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const firebaseErrors = {
  'auth/user-not-found':    'No account found with this email.',
  'auth/wrong-password':    'Incorrect password. Please try again.',
  'auth/invalid-credential':'Invalid email or password.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/user-disabled':     'This account has been disabled.',
}

const heroStats = [
  { icon: Users,       value: '500+',  label: 'Active Farmers' },
  { icon: TrendingUp,  value: '45',    label: 'Commodities Tracked' },
  { icon: CheckCircle2,value: '5',     label: 'Markets' },
]

export default function Login() {
  const { user, farmerProfile, loading } = useAuth()
  const navigate = useNavigate()
  const [firebaseError, setFirebaseError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const reduced = useReducedMotion()

  const { register, handleSubmit, formState: { errors } } = useForm()

  if (!loading && user) {
    return <Navigate to={farmerProfile?.profileComplete ? '/dashboard' : '/register'} replace />
  }

  async function onSubmit({ email, password }) {
    setFirebaseError('')
    setSubmitting(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      setFirebaseError(firebaseErrors[err.code] || 'Sign in failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100svh-56px)]" style={{ backgroundColor: 'var(--color-surface)' }}>

      {/* Left decorative panel — desktop only */}
      <div
        className="hidden md:flex md:w-5/12 flex-col justify-center items-center p-10 text-cream relative overflow-hidden"
        style={{ background: 'var(--gradient-hero)' }}
      >
        {/* Background orbs */}
        {!reduced && (
          <>
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
              style={{ background: 'rgba(200,168,75,0.12)' }}
            />
            <div
              className="absolute bottom-10 left-0 w-48 h-48 rounded-full blur-3xl pointer-events-none"
              style={{ background: 'rgba(61,107,67,0.4)' }}
            />
          </>
        )}
        <div className="relative z-10 flex flex-col items-center text-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/icons/aen-logohandsbrwn.svg" alt="AEN" className="h-8 w-8 object-contain" />
            <span className="text-3xl font-bold gradient-text">AEN</span>
          </div>
          <h2 className="text-2xl font-bold leading-snug">
            Zimbabwe's Premier<br />Agritech Platform
          </h2>
          <p className="text-cream/70 text-sm leading-relaxed max-w-xs">
            Connecting farmers to verified buyers, fair prices, and structured joint venture opportunities.
          </p>
          <div className="flex flex-col gap-3 w-full mt-4">
            {heroStats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="glass flex items-center gap-3 px-4 py-3 rounded-xl">
                <Icon size={16} className="text-gold flex-shrink-0" />
                <span className="font-bold text-sm">{value}</span>
                <span className="text-cream/60 text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 md:hidden">
            <img src="/icons/aen-logohandsbrwn.svg" alt="AEN" className="h-6 w-6 object-contain" />
            <span className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>AEN</span>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Welcome back
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
            Sign in to your AEN account
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="farmer@example.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
              })}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />

            {firebaseError && (
              <motion.p
                className="text-sm rounded-xl px-4 py-3"
                style={{ color: 'var(--color-danger)', backgroundColor: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)' }}
                role="alert"
                animate={reduced ? {} : { x: [0, -6, 6, -6, 6, 0] }}
                transition={{ duration: 0.4 }}
              >
                {firebaseError}
              </motion.p>
            )}

            <Button type="submit" loading={submitting} className="w-full mt-1 rounded-xl">
              Sign In
            </Button>
          </form>

          <div className="text-center mt-4">
            <Link to="/forgot-password" className="text-sm hover:underline" style={{ color: 'var(--color-text-muted)' }}>
              Forgot your password?
            </Link>
          </div>

          <p className="text-center text-sm mt-4" style={{ color: 'var(--color-text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-green-primary hover:underline">
              Register free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
