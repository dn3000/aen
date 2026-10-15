import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft, MapPin, Wind, Droplet, CloudRain, CloudOff, Sprout,
  Sun, CloudSun, Cloud, CloudLightning, CloudSnow, CloudFog, CloudDrizzle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useWeather } from '../hooks/useWeather'
import Spinner from '../components/ui/Spinner'

const WEATHER_INFO = {
  0:  { label: 'Clear sky',      Icon: Sun },
  1:  { label: 'Mainly clear',   Icon: CloudSun },
  2:  { label: 'Partly cloudy',  Icon: Cloud },
  3:  { label: 'Overcast',       Icon: Cloud },
  45: { label: 'Foggy',          Icon: CloudFog },
  48: { label: 'Icy fog',        Icon: CloudFog },
  51: { label: 'Light drizzle',  Icon: CloudDrizzle },
  53: { label: 'Drizzle',        Icon: CloudDrizzle },
  55: { label: 'Heavy drizzle',  Icon: CloudRain },
  61: { label: 'Light rain',     Icon: CloudRain },
  63: { label: 'Rain',           Icon: CloudRain },
  65: { label: 'Heavy rain',     Icon: CloudRain },
  71: { label: 'Light snow',     Icon: CloudSnow },
  80: { label: 'Rain showers',   Icon: CloudDrizzle },
  95: { label: 'Thunderstorm',   Icon: CloudLightning },
}

const PROVINCE_CITY = {
  'Harare': 'Harare', 'Bulawayo': 'Bulawayo', 'Manicaland': 'Mutare',
  'Mashonaland Central': 'Bindura', 'Mashonaland East': 'Marondera',
  'Mashonaland West': 'Chinhoyi', 'Matabeleland North': 'Hwange',
  'Matabeleland South': 'Gwanda', 'Midlands': 'Gweru', 'Masvingo': 'Masvingo',
}

function getWeatherInfo(code) {
  return WEATHER_INFO[code] ?? { label: 'Unknown', Icon: Sun }
}

function getDayName(offsetDays) {
  if (offsetDays === 0) return 'Today'
  if (offsetDays === 1) return 'Tomorrow'
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toLocaleDateString('en-ZW', { weekday: 'short', day: 'numeric' })
}

function buildAdvisories(current, daily) {
  if (!current) return [{ icon: '📋', text: 'Monitor conditions and plan farm activities', type: 'info' }]
  const advisories = []
  const rain = daily?.precipitation_sum?.[0] ?? 0
  const temp = current.temperature_2m
  const wind = current.wind_speed_10m

  if (rain > 5)                      advisories.push({ icon: '🌧️', text: 'Rain expected — hold off on spraying operations', type: 'warning' })
  else if (rain > 0)                 advisories.push({ icon: '💧', text: 'Light rain — monitor field drainage', type: 'info' })
  if (temp > 35)                     advisories.push({ icon: '🌡️', text: 'Extreme heat — ensure livestock have shade and water', type: 'danger' })
  else if (temp > 30)                advisories.push({ icon: '☀️', text: 'Heat stress risk — check irrigation and crop moisture', type: 'warning' })
  else if (temp < 10)                advisories.push({ icon: '🥶', text: 'Cold conditions — protect sensitive seedlings', type: 'warning' })
  if (wind > 40)                     advisories.push({ icon: '💨', text: 'Strong winds — avoid aerial operations and check staking', type: 'danger' })
  else if (wind > 25)                advisories.push({ icon: '🌬️', text: 'Windy — delay pesticide and fertilizer application', type: 'warning' })
  if (temp >= 20 && temp <= 30 && rain < 2 && wind < 20)
                                     advisories.push({ icon: '✅', text: 'Excellent conditions for field work and planting', type: 'good' })
  const dryDays = daily?.precipitation_sum?.slice(0, 5)?.filter(r => r < 1)?.length || 0
  if (dryDays >= 3)                  advisories.push({ icon: '🌱', text: `${dryDays} dry days ahead — good planting window`, type: 'good' })
  if ((daily?.temperature_2m_min?.[0] ?? 15) < 5)
                                     advisories.push({ icon: '❄️', text: 'Frost risk tonight — protect frost-sensitive crops', type: 'danger' })

  return advisories.length ? advisories : [{ icon: '📋', text: 'Monitor conditions and plan farm activities', type: 'info' }]
}

const ADVISORY_BG = {
  good:    'rgba(74,140,82,0.12)',
  danger:  'rgba(220,38,38,0.1)',
  warning: 'rgba(200,168,75,0.15)',
  info:    'var(--color-surface-2)',
}

export default function WeatherDetail() {
  const { farmerProfile } = useAuth()
  const navigate = useNavigate()
  const province = farmerProfile?.location?.province
  const { weather, loading, error } = useWeather(province)
  const cityLabel = PROVINCE_CITY[province] || 'Harare'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !weather?.current) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--color-surface)' }}>
        <CloudOff size={40} style={{ color: 'var(--color-text-muted)' }} />
        <p style={{ color: 'var(--color-text-muted)' }}>Weather data unavailable. Please try again later.</p>
        <button onClick={() => navigate('/dashboard')} className="text-gold text-sm font-medium hover:text-gold-light transition-colors">
          ← Back to Dashboard
        </button>
      </div>
    )
  }

  const { current, daily, hourly } = weather
  const info = getWeatherInfo(current.weather_code)
  const advisories = buildAdvisories(current, daily)

  // Filter hourly data for today, 6am–8pm, every 2 hours
  const todayStr = new Date().toISOString().slice(0, 10)
  const todayHourly = (hourly?.time || [])
    .map((t, i) => ({ time: t, temp: hourly.temperature_2m[i], rainProb: hourly.precipitation_probability?.[i] ?? 0 }))
    .filter(h => {
      if (!h.time.startsWith(todayStr)) return false
      const hr = new Date(h.time).getHours()
      return hr >= 6 && hr <= 20 && hr % 2 === 0
    })

  const forecastDays = Math.min(daily?.weather_code?.length || 0, 7)

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-gold"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <ChevronLeft size={18} /> Back
          </button>
          <div className="flex-1" />
          <div className="text-right">
            <h1 className="text-lg font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>Weather Dashboard</h1>
            <p className="text-[11px] flex items-center justify-end gap-1 mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              <MapPin size={10} strokeWidth={2.5} style={{ color: '#F43F5E' }} />
              {cityLabel}{province ? `, ${province}` : ''}
            </p>
          </div>
        </div>

        {/* Hero current conditions */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <info.Icon size={64} strokeWidth={1.2} style={{ color: '#FCD34D' }} />
              <div>
                <p className="text-5xl font-bold leading-none" style={{ color: 'var(--color-text-primary)' }}>
                  {Math.round(current.temperature_2m)}°C
                </p>
                <p className="text-base mt-1" style={{ color: 'var(--color-text-secondary)' }}>{info.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              <span className="w-2 h-2 rounded-full bg-[#00FF55] animate-pulse" />
              Live
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { Icon: Droplet,   label: 'Humidity',   value: `${current.relative_humidity_2m}%`,                          color: '#60A5FA' },
              { Icon: Wind,      label: 'Wind',        value: `${Math.round(current.wind_speed_10m)} km/h`,                color: '#93C5FD' },
              { Icon: CloudRain, label: 'Rain today',  value: `${(daily?.precipitation_sum?.[0] ?? 0).toFixed(1)} mm`,    color: '#A78BFA' },
            ].map(({ Icon, label, value, color }) => (
              <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'var(--color-surface-2)' }}>
                <Icon size={20} strokeWidth={1.8} style={{ color, margin: '0 auto 4px' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
                <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Farming Advisories */}
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.07 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sprout size={16} className="text-gold" />
            <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Farming Advisories</h2>
          </div>
          <div className="space-y-2">
            {advisories.map((adv, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-xl px-3 py-2.5"
                style={{ background: ADVISORY_BG[adv.type] || ADVISORY_BG.info }}
              >
                <span className="text-base flex-shrink-0 mt-0.5">{adv.icon}</span>
                <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{adv.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Hourly forecast today */}
        {todayHourly.length > 0 && (
          <motion.div
            className="glass-card p-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 }}
          >
            <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>Today — Hourly</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {todayHourly.map((h, i) => {
                const hour = new Date(h.time).getHours()
                const label = hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1.5 flex-shrink-0 rounded-xl px-3 py-2.5 min-w-[52px]"
                    style={{ background: 'var(--color-surface-2)' }}
                  >
                    <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{Math.round(h.temp)}°</span>
                    {h.rainProb > 10 && (
                      <span className="text-[10px] font-medium" style={{ color: '#60A5FA' }}>{h.rainProb}%</span>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* 7-day forecast */}
        {forecastDays > 0 && (
          <motion.div
            className="glass-card p-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.16 }}
          >
            <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>
              {forecastDays}-Day Forecast
            </h2>
            <div className="space-y-2">
              {Array.from({ length: forecastDays }, (_, i) => {
                const DayIcon = getWeatherInfo(daily.weather_code[i]).Icon
                const dayLabel = getWeatherInfo(daily.weather_code[i]).label
                const rain = daily.precipitation_sum?.[i] ?? 0
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                    style={{ background: i === 0 ? 'rgba(176,141,87,0.1)' : 'var(--color-surface-2)' }}
                  >
                    <span className="text-sm w-24 flex-shrink-0 font-medium" style={{ color: i === 0 ? '#b99029' : 'var(--color-text-secondary)' }}>
                      {getDayName(i)}
                    </span>
                    <DayIcon size={20} strokeWidth={1.5} style={{ color: '#FCD34D', flexShrink: 0 }} />
                    <span className="text-xs flex-1 truncate" style={{ color: 'var(--color-text-muted)' }}>{dayLabel}</span>
                    {rain > 0 && (
                      <span className="text-xs flex-shrink-0" style={{ color: '#60A5FA' }}>
                        {rain.toFixed(1)}mm
                      </span>
                    )}
                    <span className="text-sm font-bold flex-shrink-0 w-8 text-right" style={{ color: 'var(--color-text-primary)' }}>
                      {Math.round(daily.temperature_2m_max[i])}°
                    </span>
                    <span className="text-xs flex-shrink-0 w-6 text-right" style={{ color: 'var(--color-text-muted)' }}>
                      {Math.round(daily.temperature_2m_min[i])}°
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  )
}
