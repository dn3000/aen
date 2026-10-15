import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { doc, getDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import {
  ShoppingCart, BarChart2, User, ChevronRight,
  MapPin, Sprout, Calendar, Bell, TrendingUp,
  TrendingDown, Minus, CheckSquare, ArrowRight, Plus,
  AlertTriangle, CheckCircle2, X
} from 'lucide-react'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import { useWeather } from '../hooks/useWeather'
import WeatherCard from '../components/dashboard/WeatherCard'

// Generate greeting based on hour
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// Format date nicely
function fmtDate(date) {
  return date.toLocaleDateString('en-ZW', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

// Round to 2 decimal places
const r2 = (n) => Math.round(n * 100) / 100

// Static weekly schedule for May (harvest season in Zim)
function getWeeklyTasks(farmingType) {
  const base = [
    { icon: '💧', label: 'Irrigation check',       crop: 'All crops',      daysFromNow: 0, color: '#2471a3' },
    { icon: '🌿', label: 'Weeding round',           crop: 'Maize / Beans',  daysFromNow: 1, color: '#3d6b43' },
    { icon: '📦', label: 'Harvest readiness check', crop: 'Main crop',      daysFromNow: 2, color: '#7c3aed' },
    { icon: '💊', label: 'Post-harvest treatment',  crop: 'Stored produce',  daysFromNow: 3, color: '#c2410c' },
    { icon: '📋', label: 'Soil prep for winter',    crop: 'Fallow land',    daysFromNow: 5, color: '#c8a84b' },
  ]
  if (farmingType === 'livestock' || farmingType === 'mixed') {
    base[2] = { icon: '🐄', label: 'Livestock health check', crop: 'All livestock', daysFromNow: 2, color: '#7c3aed' }
  }
  return base
}

function dueBadge(days) {
  if (days === 0) return { label: 'Today',           bg: '#dc2626', text: '#fff' }
  if (days === 1) return { label: 'Tomorrow',        bg: '#c8a84b', text: '#1a1a1a' }
  return           { label: `In ${days} days`,       bg: 'var(--color-border)', text: 'var(--color-text-secondary)' }
}

const quickActions = [
  { to: '/marketplace', label: '+ Post Listing',  icon: Plus },
  { to: '/price-index', label: '📊 Check Prices', icon: null },
  { to: '/marketplace', label: '🛒 View Markets', icon: null },
  { to: '/profile',     label: '👤 My Profile',   icon: null },
]

export default function Dashboard() {
  const { user, farmerProfile, loading } = useAuth()
  const isDemo = user?.email === 'demo@aen.co.zw'
  const [demoBannerVisible, setDemoBannerVisible] = useState(true)
  const [emailBannerVisible, setEmailBannerVisible] = useState(true)
  const navigate = useNavigate()
  const [farmProfile, setFarmProfile] = useState(null)
  const [farmLoading, setFarmLoading] = useState(true)
  const [livePrices, setLivePrices] = useState([])
  const [pricesLoading, setPricesLoading] = useState(true)
  const reduced = useReducedMotion()
  const { weather, loading: weatherLoading } = useWeather(farmerProfile?.location?.province)

  useEffect(() => {
    if (loading) return
    if (!farmerProfile) {
      navigate('/register', { replace: true })
      return
    }
    if (!user?.uid) return

    const fetchFarmProfile = async () => {
      try {
        const snap = await getDoc(doc(db, 'farmers', user.uid, 'farmProfile', 'farmProfile'))
        setFarmProfile(snap.exists() ? snap.data() : null)
      } catch (err) {
        console.error('[Dashboard] farmProfile fetch error:', err.code)
      } finally {
        setFarmLoading(false)
      }
    }

    const fetchPrices = async () => {
      try {
        const weeksSnap = await getDocs(
          query(collection(db, 'markets-prices', 'mbare-musika', 'weeks'), orderBy('dateOfIssue', 'desc'), limit(1))
        )
        if (!weeksSnap.empty) {
          const weekData = weeksSnap.docs[0].data()
          setLivePrices((weekData.prices ?? []).slice(0, 5))
        }
      } catch {
        // no-op — empty state shown
      } finally {
        setPricesLoading(false)
      }
    }

    fetchFarmProfile()
    fetchPrices()
  }, [user?.uid, farmerProfile, loading, navigate])

  if (loading || farmLoading || pricesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ backgroundColor: 'var(--color-surface)' }}>
        <Spinner size="lg" />
      </div>
    )
  }

  const firstName = farmerProfile?.fullName?.split(' ')[0] || 'Farmer'
  const tasks = getWeeklyTasks(farmProfile?.farmingType)
  const crops = farmProfile?.mainCrops || []
  const totalLand = farmProfile?.totalLandSize || 0
  const prodLand  = farmProfile?.landUnderProduction || 0
  const fallowLand = totalLand > 0 ? r2(totalLand - prodLand) : 0

  // Build crop details — use real cropDetails if present, otherwise derive mock areas from mainCrops
  const cropDetails = farmProfile?.cropDetails?.length
    ? farmProfile.cropDetails
    : crops.map((name, i) => ({
        name,
        status: 'Active',
        areaHa: totalLand > 0
          ? r2(totalLand / crops.length * (i === 0 ? 0.6 : 0.4 / (crops.length - 1 || 1)))
          : null,
      }))

  // Build real alerts
  const alerts = []
  if (!farmerProfile?.profileComplete) {
    alerts.push({ dot: '#dc2626', text: 'Complete your profile to unlock all features', cta: { label: 'Continue Setup', to: '/register' } })
  }
  if (farmerProfile?.profileComplete && !farmerProfile?.jvAgreementAccepted) {
    alerts.push({ dot: '#c8a84b', text: 'Your JV Agreement is pending signature', cta: { label: 'Review Agreement', to: '/register' } })
  }
  if (totalLand > 0 && prodLand < totalLand * 0.5) {
    alerts.push({ dot: '#c8a84b', text: `Less than 50% of your land is under production (${prodLand}/${totalLand} ha)`, cta: { label: 'Update Farm Profile', to: '/profile' } })
  }
  // Static seasonal alerts for May
  alerts.push({ dot: '#3d6b43', text: '🌧️ Harvest season — monitor post-harvest storage conditions' })
  alerts.push({ dot: '#2471a3', text: '📋 Land preparation for winter crops starting soon' })

  const cardVariants = {
    hidden: { opacity: 0, y: reduced ? 0 : 16 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: reduced ? 0 : i * 0.08 } }),
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* ── Email Verification Banner ───────────────────────────────────── */}
        <AnimatePresence>
          {!user?.emailVerified && !isDemo && emailBannerVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div
                className="flex items-center justify-between py-3 px-4 rounded-xl text-sm font-medium"
                style={{ backgroundColor: 'rgba(41,77,45,0.1)', border: '1px solid rgba(41,77,45,0.25)', color: 'var(--color-text-primary)' }}
              >
                <span className="flex items-center gap-2">
                  <span>📧</span>
                  <span>Please verify your email address — check your inbox for a verification link.</span>
                </span>
                <button
                  onClick={() => setEmailBannerVisible(false)}
                  className="ml-4 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                  aria-label="Dismiss email verification reminder"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Demo Banner ─────────────────────────────────────────────────── */}
        <AnimatePresence>
          {isDemo && demoBannerVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div
                className="flex items-center justify-between py-3 px-4 rounded-xl text-sm font-medium"
                style={{ background: 'var(--gradient-gold)', color: '#1a1a1a' }}
              >
                <span>👁 You're viewing the AEN Demo — data shown is for demonstration purposes</span>
                <button
                  onClick={() => setDemoBannerVisible(false)}
                  className="ml-4 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                  aria-label="Dismiss demo banner"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Section 1: Greeting Header ─────────────────────────────────── */}
        <motion.div
          className="greeting-card rounded-[28px] p-4 relative"
          initial={reduced ? {} : { opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Top Row */}
          <div className="flex justify-between items-start mb-1.5">
            <p className="text-[15px] font-medium text-black/80 dark:text-white/65">
              {fmtDate(new Date())}
            </p>
            <div className="relative text-black/80 dark:text-white/80">
              <Bell strokeWidth={1.5} size={24} />
              <div className="absolute top-0 right-0 w-[12px] h-[12px] bg-[#dc2626] rounded-full flex items-center justify-center border-[2px] border-[var(--color-gold)] dark:border-[var(--color-primary)]">
                <span className="text-[7px] font-bold text-white leading-none">1</span>
              </div>
            </div>
          </div>

          {/* Greeting — single line */}
          <h1 className="text-2xl md:text-3xl font-bold text-black/90 dark:text-white leading-[1.2] mb-1.5">
            {getGreeting()}, {firstName}
          </h1>

          {/* Location */}
          <div className="flex items-center gap-1.5 mb-3 text-black/80 dark:text-white/70">
            <MapPin size={17} strokeWidth={1.5} />
            <span className="text-[16px]">{farmerProfile?.location?.province || 'Location Unknown'}</span>
          </div>

          {/* Bottom row: farming type + last updated (left) / Profile + VERIFIED (right) */}
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-0.5">
              {farmProfile?.farmingType && (
                <p className="text-[14px] font-semibold italic text-black/80 dark:text-white/75">
                  {farmProfile.farmingType === 'livestock' ? 'Livestock Farming' :
                   farmProfile.farmingType === 'crop' ? 'Crop Production Farming' :
                   farmProfile.farmingType === 'mixed' ? 'Mixed Farming' :
                   'Crop Production Farming'}
                </p>
              )}
              <p className="text-[11px] italic text-black/50 dark:text-white/50">
                Last Update : {farmProfile?.lastUpdate || '3 Days Ago'}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Link
                to="/profile"
                className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all hover:brightness-105 bg-black/15 dark:bg-white/15 text-black/80 dark:text-white"
              >
                Profile
              </Link>
              {farmerProfile?.profileComplete && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-[#1a6630] dark:text-[#6FCF7A]">
                  <CheckCircle2 size={11} strokeWidth={2.5} />
                  VERIFIED
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Section 2: Farm Overview Cards ─────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Slot 1: Live weather — clickable to full weather dash */}
          <div
            onClick={() => navigate('/dashboard/weather')}
            className="cursor-pointer hover:ring-2 hover:ring-[rgba(176,141,87,0.4)] rounded-2xl transition-shadow duration-200 h-full"
            role="button"
            aria-label="View weather details"
          >
            <WeatherCard
              weather={weather}
              loading={weatherLoading}
              province={farmerProfile?.location?.province}
            />
          </div>

          {/* Slots 2–4: Total Land, Active Crops, Joint Venture */}
          {[
            {
              icon: MapPin, label: 'TOTAL LAND',
              type: 'land',
              value: totalLand ? `${totalLand} ha` : '—',
              cultivated: prodLand,
              fallow: fallowLand,
              total: totalLand,
              irrigated: farmProfile?.irrigatedLand ?? 1, // Defaulting to 1ha for mock display
            },
            {
              icon: Sprout, label: 'ACTIVE CROPS',
              type: 'crops',
              value: cropDetails.length ? String(cropDetails.length) : '—',
              cropDetails,
              isActive: cropDetails.length > 0,
              activeLandHa: prodLand,
            },
            {
              icon: User, label: 'LIVESTOCK',
              type: 'livestock',
              livestock: farmProfile?.livestock ?? []
            },
          ].map((card, i) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.label}
                className="glass-card p-4 flex flex-col gap-3 cursor-pointer hover:ring-2 hover:ring-[rgba(176,141,87,0.4)] transition-shadow duration-200"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={i + 1}
                onClick={() => navigate(`/dashboard/${card.type}`)}
                role="button"
                aria-label={`View ${card.label.toLowerCase()} details`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                    {card.label}
                  </span>
                  <div className="rounded-lg p-1.5" style={{ background: 'rgba(176,141,87,0.15)' }}>
                    <Icon size={14} className="text-gold" />
                  </div>
                </div>

                {/* Total Land card */}
                {card.type === 'land' && (
                  <>
                    <p className="text-2xl font-bold leading-none" style={{ color: 'var(--color-text-primary)' }}>
                      {card.value}
                    </p>
                    {card.total > 0 ? (
                      <div className="space-y-2">
                        {/* Cultivated */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                            <span>Cultivated</span><span>{card.cultivated} ha</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden bg-black/10 dark:bg-white/10">
                            <div className="h-full rounded-full" style={{ width: `${Math.min((card.cultivated / card.total) * 100, 100)}%`, background: '#4A6741' }} />
                          </div>
                        </div>
                        {/* Fallow */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                            <span>Fallow</span><span>{card.fallow} ha</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden bg-black/10 dark:bg-white/10">
                            <div className="h-full rounded-full" style={{ width: `${Math.min((card.fallow / card.total) * 100, 100)}%`, background: 'rgba(176,141,87,0.5)' }} />
                          </div>
                        </div>
                        {/* Irrigated */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                            <span>Irrigated</span>
                            <span>{card.irrigated > 0 ? `${card.irrigated} ha` : '—'}</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden bg-black/10 dark:bg-white/10">
                            <div className="h-full rounded-full" style={{ width: `${Math.min(((card.irrigated || 0) / card.total) * 100, 100)}%`, background: '#2471A3' }} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>No land data yet</p>
                    )}
                  </>
                )}

                {/* Active Crops card */}
                {card.type === 'crops' && (
                  <>
                    {card.isActive ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#4a8c52]/20 text-[#294d2d] dark:bg-[rgba(74,140,82,0.25)] dark:text-[#6FCF7A]">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Active
                          </span>
                          {card.activeLandHa > 0 && (
                            <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
                              {card.activeLandHa} ha
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5 mt-0.5">
                          {card.cropDetails.slice(0, 3).map((cd) => (
                            <div key={cd.name} className="flex items-center justify-between gap-1">
                              <span className="text-xs font-medium truncate" style={{ color: 'var(--color-text-secondary)' }}>
                                {cd.name}
                              </span>
                              <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                                {cd.areaHa && (
                                  <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                                    {cd.areaHa} ha
                                  </span>
                                )}
                                {cd.irrigated != null && (
                                  <span
                                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                                    style={cd.irrigated
                                      ? { backgroundColor: 'rgba(36,113,163,0.15)', color: '#2471a3' }
                                      : { backgroundColor: 'rgba(0,0,0,0.06)', color: 'var(--color-text-muted)' }
                                    }
                                  >
                                    {cd.irrigated ? '💧' : 'Rain'}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                          {card.cropDetails.length > 3 && (
                            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                              +{card.cropDetails.length - 3} more
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>No crops listed</p>
                    )}
                  </>
                )}

                {/* Livestock card */}
                {card.type === 'livestock' && (
                  card.livestock.length > 0 ? (
                    <div className="flex flex-col gap-2.5 mt-2">
                      {card.livestock.map((item, idx) => (
                        <div key={idx} className="flex items-center">
                          <span className="text-xs font-medium w-10 text-[#1a1a1a] dark:text-white">{item.count}</span>
                          <span className="text-[10px]" style={{ color: '#7A9B76' }}>{item.type}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>No livestock recorded</p>
                  )
                )}

                <p className="text-[10px] mt-auto pt-1 text-right" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>
                  View details →
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* ── Sections 3 + 4: Schedule & Alerts (side by side on desktop) ─ */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

          {/* Section 3: Farm Schedule */}
          <motion.div
            className="glass-card p-5 md:col-span-7"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={4}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>
                  Upcoming Farm Tasks
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  This week's schedule
                </p>
              </div>
              <Calendar size={18} className="text-gold" />
            </div>

            {/* TODO Phase 3: Replace with dynamic task scheduler based on planting dates and crop calendars */}
            <div className="space-y-2">
              {tasks.map((task, i) => {
                const badge = dueBadge(task.daysFromNow)
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl p-3 transition-colors"
                    style={{ backgroundColor: 'var(--color-surface-2)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: `${task.color}20` }}
                    >
                      {task.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {task.label}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                        {task.crop}
                      </p>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: badge.bg, color: badge.text }}
                    >
                      {badge.label}
                    </span>
                    <CheckSquare size={15} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  </div>
                )
              })}
            </div>

            <Link
              to="/profile"
              className="flex items-center gap-1 text-xs font-medium mt-4 transition-colors hover:text-gold"
              style={{ color: 'var(--color-text-muted)' }}
            >
              View Full Schedule <ChevronRight size={13} />
            </Link>
          </motion.div>

          {/* Section 4: Alerts & Reminders */}
          <motion.div
            className="glass-card p-5 md:col-span-5"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={5}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>
                Alerts & Reminders
              </h2>
              <Bell size={18} className="text-gold" />
            </div>
            <div className="space-y-3">
              {alerts.slice(0, 4).map((alert, i) => (
                <div key={i} className="flex gap-2.5">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                    style={{ backgroundColor: alert.dot }}
                  />
                  <div className="flex-1">
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {alert.text}
                    </p>
                    {alert.cta && (
                      <Link
                        to={alert.cta.to}
                        className="text-[11px] font-semibold text-gold hover:text-gold-light transition-colors mt-0.5 inline-flex items-center gap-0.5"
                      >
                        {alert.cta.label} <ChevronRight size={11} />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Section 5: Market Pulse ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Prices stub */}
          <motion.div className="glass-card p-5" variants={cardVariants} initial="hidden" animate="visible" custom={6}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>
                Latest Prices · Mbare Musika
              </h2>
              <BarChart2 size={16} className="text-gold" />
            </div>
            {livePrices.length > 0 ? (
              <table className="w-full text-xs">
                <tbody className="divide-y divide-[var(--color-border)]">
                  {livePrices.map((row) => (
                    <tr key={row.commodity}>
                      <td className="py-2 font-medium" style={{ color: 'var(--color-text-primary)' }}>{row.commodity}</td>
                      <td className="py-2" style={{ color: 'var(--color-text-muted)' }}>{row.unit}</td>
                      <td className="py-2 text-right font-semibold gradient-text">
                        ${row.avgPrice ?? row.price ?? '—'}
                      </td>
                      <td className="py-2 pl-2">
                        {row.trend === 'up'     && <TrendingUp size={13} className="text-green-primary" />}
                        {row.trend === 'down'   && <TrendingDown size={13} className="text-red-500" />}
                        {row.trend === 'stable' && <Minus size={13} style={{ color: 'var(--color-text-muted)' }} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs py-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
                No price data available yet.
              </p>
            )}
            <Link to="/price-index" className="flex items-center gap-1 text-xs font-medium mt-3 text-gold hover:text-gold-light transition-colors">
              View Full Price Index <ChevronRight size={13} />
            </Link>
          </motion.div>

          {/* Live marketplace stub */}
          <motion.div className="glass-card p-5 flex flex-col" variants={cardVariants} initial="hidden" animate="visible" custom={7}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>
                Live Marketplace
              </h2>
              <ShoppingCart size={16} className="text-gold" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6">
              <ShoppingCart size={28} style={{ color: 'var(--color-text-muted)' }} />
              <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
                Browse and post live produce listings
              </p>
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full transition-all hover:brightness-105"
                style={{ background: 'var(--gradient-gold)', color: '#1a1a1a' }}
              >
                Browse Marketplace <ArrowRight size={13} />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ── Section 6: Quick Actions ────────────────────────────────────── */}
        <motion.div
          className="glass-card p-4"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={8}
        >
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--color-text-muted)' }}>
            Quick Actions
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all border hover:border-gold hover:text-gold"
                style={{
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'var(--color-surface-2)',
                }}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
