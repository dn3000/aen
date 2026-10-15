// TODO: To grant admin access, manually set role: 'admin' on /farmers/{uid} in Firestore console
import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../ui/Toast'
import Spinner from '../ui/Spinner'

export default function AdminRoute() {
  const { user, farmerProfile, loading } = useAuth()
  const showToast = useToast()
  const location = useLocation()

  const isAdmin = farmerProfile?.role === 'admin'

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      showToast("You don't have access to that area.", 'error')
    }
  }, [loading, user, isAdmin])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Spinner size="lg" color="green" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  if (!isAdmin) return <Navigate to="/dashboard" replace />

  return <Outlet />
}
