import { motion } from 'framer-motion'
import {
  CloudOff, MapPin, Sun, CloudSun, Cloud, CloudRain,
  CloudLightning, CloudSnow, CloudFog, CloudDrizzle,
  Wind, Droplet
} from 'lucide-react'

const PROVINCE_COORDS = {
  'Harare':               { label: 'Harare' },
  'Bulawayo':             { label: 'Bulawayo' },
  'Manicaland':           { label: 'Mutare' },
  'Mashonaland Central':  { label: 'Bindura' },
  'Mashonaland East':     { label: 'Marondera' },
  'Mashonaland West':     { label: 'Chinhoyi' },
  'Matabeleland North':   { label: 'Hwange' },
  'Matabeleland South':   { label: 'Gwanda' },
  'Midlands':             { label: 'Gweru' },
  'Masvingo':             { label: 'Masvingo' },
}

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

function getWeatherInfo(code) {
  return WEATHER_INFO[code] ?? { label: 'Unknown', Icon: Sun }
}

function getDayLabel(index) {
  if (index === 0) return 'Today'
  const d = new Date()
  d.setDate(d.getDate() + index)
  return d.toLocaleDateString('en-ZW', { weekday: 'short' })
}

function getFarmingAdvice(current, dailyRain) {
  if (!current) return null
  const rain = dailyRain ?? 0
  const temp = current.temperature_2m
  const wind = current.wind_speed_10m
  if (rain > 5)              return '🌧️ Rain expected — hold off on spraying'
  if (temp > 32)             return '🌡️ Heat stress risk — check irrigation'
  if (wind > 30)             return '💨 High winds — avoid spraying today'
  if (temp >= 18 && temp <= 28) return '✅ Good conditions for field work today'
  return null
}

export default function WeatherCard({ weather, loading, province }) {
  const cityLabel = (province && PROVINCE_COORDS[province]?.label) || 'Harare'

  if (loading) {
    return (
      <div className="glass-card p-4 flex flex-col gap-3 animate-pulse h-full">
        <div className="flex justify-between">
          <div className="h-3 w-20 rounded" style={{ background: 'var(--color-border)' }} />
          <div className="h-3 w-10 rounded" style={{ background: 'var(--color-border)' }} />
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-10 w-10 rounded" style={{ background: 'var(--color-border)' }} />
          <div className="flex flex-col gap-1">
            <div className="h-7 w-16 rounded" style={{ background: 'var(--color-border)' }} />
            <div className="h-3 w-24 rounded" style={{ background: 'var(--color-border)' }} />
          </div>
        </div>
        <div className="h-10 w-full rounded" style={{ background: 'var(--color-border)' }} />
        <div className="h-16 w-full rounded" style={{ background: 'var(--color-border)' }} />
      </div>
    )
  }

  if (!weather?.current) {
    return (
      <div className="glass-card p-4 flex flex-col items-center justify-center gap-2 min-h-[140px] h-full">
        <CloudOff size={20} style={{ color: 'var(--color-text-muted)' }} />
        <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
          Weather unavailable
        </p>
      </div>
    )
  }

  const { current, daily } = weather
  const info = getWeatherInfo(current.weather_code)
  const advice = getFarmingAdvice(current, daily?.precipitation_sum?.[0])

  return (
    <motion.div
      className="glass-card p-4 flex flex-col justify-between h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col gap-3.5">
        {/* Top row: location pin (left) + Live dot (right) */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            <MapPin size={13} strokeWidth={2.5} style={{ color: '#F43F5E' }} />
            {cityLabel}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            <span className="w-2 h-2 rounded-full bg-[#00FF55]"></span>
            Live
          </span>
        </div>

        {/* Main: large icon + temp + condition label */}
        <div className="flex items-center gap-3">
          <info.Icon size={46} strokeWidth={1.5} style={{ color: '#FCD34D' }} />
          <div className="flex flex-col">
            <p className="text-[28px] font-bold leading-none mb-1" style={{ color: 'var(--color-text-primary)' }}>
              {Math.round(current.temperature_2m)}°C
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {info.label}
            </p>
          </div>
        </div>

        {/* Detail row: humidity / wind / rain */}
        <div className="flex justify-between items-center px-0.5">
          <div className="flex flex-col gap-1 items-start">
            <Droplet size={16} strokeWidth={2} style={{ color: '#60A5FA' }} />
            <span className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
              {current.relative_humidity_2m}%
            </span>
          </div>
          <div className="flex flex-col gap-0.5 items-start">
            <div className="flex items-center gap-1">
              <Wind size={16} strokeWidth={2} style={{ color: '#60A5FA' }} />
              <span className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                {Math.round(current.wind_speed_10m)}
              </span>
            </div>
            <span className="text-[11px] leading-none" style={{ color: 'var(--color-text-secondary)' }}>
              km/h
            </span>
          </div>
          <div className="flex flex-col gap-1 items-start">
            <CloudRain size={16} strokeWidth={2} style={{ color: '#A78BFA' }} />
            <span className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
              {(daily?.precipitation_sum?.[0] ?? 0).toFixed(1)}mm
            </span>
          </div>
        </div>

        {/* Separator line */}
        <div style={{ height: '1px', background: 'var(--color-border)', margin: '2px 0' }} />

        {/* 3-day forecast */}
        {daily && (
          <div className="flex justify-between relative">
            {[0, 1, 2].map((idx) => {
              const DayIcon = getWeatherInfo(daily.weather_code[idx]).Icon
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 relative z-10">
                  <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    {getDayLabel(idx)}
                  </span>
                  <DayIcon size={20} strokeWidth={1.5} className="text-[#4a5c4d] dark:text-[#E8EBE3]" />
                  <span className="text-[12px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {Math.round(daily.temperature_2m_max[idx])}°
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    {Math.round(daily.temperature_2m_min[idx])}°
                  </span>
                </div>
              )
            })}
            <div className="absolute top-1 bottom-1 w-px bg-[var(--color-border)] left-1/3" />
            <div className="absolute top-1 bottom-1 w-px bg-[var(--color-border)] left-2/3" />
          </div>
        )}
      </div>

      {/* Farming advice text at the bottom */}
      {advice && (
        <p className="text-[13px] italic mt-3 font-medium leading-tight" style={{ color: '#c8a84b' }}>
          {advice}
        </p>
      )}
    </motion.div>
  )
}
