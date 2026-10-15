import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import ScrollToTop from './components/layout/ScrollToTop'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import Spinner from './components/ui/Spinner'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import PageWrapper from './components/layout/PageWrapper'
import FarmerLayout from './components/layout/FarmerLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AdminRoute from './components/layout/AdminRoute'
import AdminLayout from './components/layout/AdminLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Marketplace from './pages/Marketplace'
import PriceIndex from './pages/PriceIndex'
import About from './pages/About'
import Team from './pages/Team'
import Testimonials from './pages/Testimonials'
import Partners from './pages/Partners'
import Newsletter from './pages/Newsletter'
import Knowledge from './pages/Knowledge'
import ForgotPassword from './pages/ForgotPassword'
import NotFound from './pages/NotFound'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminFarmers from './pages/admin/AdminFarmers'
import AdminFarmerDetail from './pages/admin/AdminFarmerDetail'
import AdminMarkets from './pages/admin/AdminMarkets'
import AdminMarketForm from './pages/admin/AdminMarketForm'
import AdminPrices from './pages/admin/AdminPrices'
import AdminPriceForm from './pages/admin/AdminPriceForm'
import AdminNewsletter from './pages/admin/AdminNewsletter'
import CropsDetail from './pages/CropsDetail'
import WeatherDetail from './pages/WeatherDetail'
import LandDetail from './pages/LandDetail'
import LivestockDetail from './pages/LivestockDetail'

// Routes owned by FarmerLayout or AdminLayout — no Navbar/Footer/standalone MobileNav
const APP_ROUTES = ['/dashboard', '/marketplace', '/price-index', '/profile']

export default function App() {
  const { loading } = useAuth()
  const location = useLocation()
  const { pathname } = location

  const inFarmerApp = APP_ROUTES.some(r => pathname.startsWith(r))
  const inAdmin     = pathname.startsWith('/admin')
  const showChrome  = !inFarmerApp && !inAdmin   // Navbar + Footer for public / onboarding pages

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
        <Spinner size="lg" color="green" />
      </div>
    )
  }

  return (
    <>
      <ScrollToTop />
      {showChrome && <Navbar />}

      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <Routes location={location} key={showChrome ? pathname : 'app'}>
            {/* Public routes */}
            <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
            <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
            <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
            <Route path="/team" element={<PageWrapper><Team /></PageWrapper>} />
            <Route path="/testimonials" element={<PageWrapper><Testimonials /></PageWrapper>} />
            <Route path="/partners" element={<PageWrapper><Partners /></PageWrapper>} />
            <Route path="/newsletter" element={<PageWrapper><Newsletter /></PageWrapper>} />
            <Route path="/knowledge" element={<PageWrapper><Knowledge /></PageWrapper>} />
            <Route path="/onboarding" element={<Navigate to="/register" replace />} />

            {/* Farmer app — FarmerLayout owns shell (sidebar + top bar + mobile nav) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<FarmerLayout />}>
                <Route path="/dashboard"            element={<PageWrapper><Dashboard /></PageWrapper>} />
                <Route path="/dashboard/crops"     element={<PageWrapper><CropsDetail /></PageWrapper>} />
                <Route path="/dashboard/weather"   element={<PageWrapper><WeatherDetail /></PageWrapper>} />
                <Route path="/dashboard/land"      element={<PageWrapper><LandDetail /></PageWrapper>} />
                <Route path="/dashboard/livestock" element={<PageWrapper><LivestockDetail /></PageWrapper>} />
                <Route path="/profile"             element={<PageWrapper><Profile /></PageWrapper>} />
                <Route path="/marketplace"         element={<PageWrapper><Marketplace /></PageWrapper>} />
                <Route path="/price-index"         element={<PageWrapper><PriceIndex /></PageWrapper>} />
              </Route>
            </Route>

            {/* Admin — AdminLayout owns shell */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin"                      element={<AdminDashboard />} />
                <Route path="/admin/farmers"              element={<AdminFarmers />} />
                <Route path="/admin/farmers/:uid"         element={<AdminFarmerDetail />} />
                <Route path="/admin/markets"              element={<AdminMarkets />} />
                <Route path="/admin/markets/new"          element={<AdminMarketForm />} />
                <Route path="/admin/markets/:id/edit"     element={<AdminMarketForm />} />
                <Route path="/admin/prices"               element={<AdminPrices />} />
                <Route path="/admin/prices/new"           element={<AdminPriceForm />} />
                <Route path="/admin/prices/:id/edit"      element={<AdminPriceForm />} />
                <Route path="/admin/newsletter"           element={<AdminNewsletter />} />
              </Route>
            </Route>

            <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </main>

      {showChrome && <Footer />}
    </>
  )
}
