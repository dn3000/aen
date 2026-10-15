import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../ui/Spinner'

export default function ProtectedRoute() {
  const { user, farmerProfile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Spinner size="lg" color="green" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  // Redirect incomplete profiles back to registration.
  // farmerProfile null means the doc doesn't exist yet — also send to register.
  if (!farmerProfile?.profileComplete) return <Navigate to="/register" replace />

  return <Outlet />
}
