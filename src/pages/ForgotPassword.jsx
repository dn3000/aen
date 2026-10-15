import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { sendPasswordResetEmail } from 'firebase/auth'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { auth } from '../firebase'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const firebaseErrors = {
  'auth/user-not-found':    'No account found with this email.',
  'auth/invalid-email':     'Please enter a valid email address.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
}

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')
  const [firebaseError, setFirebaseError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  async function onSubmit({ email }) {
    setFirebaseError('')
    setSubmitting(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setSentEmail(email)
      setSent(true)
    } catch (err) {
      setFirebaseError(firebaseErrors[err.code] || 'Failed to send reset email. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-[calc(100svh-56px)] flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="w-full max-w-sm">

        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-sm mb-8 hover:underline"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>

        {sent ? (
          <div className="flex flex-col items-center text-center gap-4 py-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(41,77,45,0.1)' }}
            >
              <CheckCircle size={32} className="text-green-primary" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Check your email
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              We sent a password reset link to{' '}
              <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {sentEmail}
              </span>
              . Follow the link to set a new password.
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Didn't receive it? Check your spam folder or{' '}
              <button
                onClick={() => setSent(false)}
                className="font-semibold text-green-primary hover:underline"
              >
                try again
              </button>
              .
            </p>
          </div>
        ) : (
          <>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
              style={{ backgroundColor: 'rgba(41,77,45,0.1)' }}
            >
              <Mail size={22} className="text-green-primary" />
            </div>

            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              Forgot your password?
            </h1>
            <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
              Enter your email and we'll send you a reset link.
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

              {firebaseError && (
                <p
                  className="text-sm rounded-xl px-4 py-3"
                  style={{
                    color: 'var(--color-danger)',
                    backgroundColor: 'rgba(192,57,43,0.08)',
                    border: '1px solid rgba(192,57,43,0.2)',
                  }}
                  role="alert"
                >
                  {firebaseError}
                </p>
              )}

              <Button type="submit" loading={submitting} className="w-full mt-1 rounded-xl">
                Send reset link
              </Button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-secondary)' }}>
              Remembered it?{' '}
              <Link to="/login" className="font-semibold text-green-primary hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
