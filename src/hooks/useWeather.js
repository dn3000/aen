import { useState, useEffect } from 'react'

const PROVINCE_COORDS = {
  'Harare':               { lat: -17.8292, lng: 31.0522, label: 'Harare' },
  'Bulawayo':             { lat: -20.1325, lng: 28.6264, label: 'Bulawayo' },
  'Manicaland':           { lat: -18.9216, lng: 32.1746, label: 'Mutare' },
  'Mashonaland Central':  { lat: -16.7963, lng: 31.0553, label: 'Bindura' },
  'Mashonaland East':     { lat: -18.1846, lng: 31.5477, label: 'Marondera' },
  'Mashonaland West':     { lat: -17.3667, lng: 29.8167, label: 'Chinhoyi' },
  'Matabeleland North':   { lat: -18.6625, lng: 27.9389, label: 'Hwange' },
  'Matabeleland South':   { lat: -20.9833, lng: 29.0167, label: 'Gwanda' },
  'Midlands':             { lat: -19.4500, lng: 29.8167, label: 'Gweru' },
  'Masvingo':             { lat: -20.0667, lng: 30.8333, label: 'Masvingo' },
}

export function useWeather(province) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const coords = (province && PROVINCE_COORDS[province]) || PROVINCE_COORDS['Harare']

  useEffect(() => {
    const c = (province && PROVINCE_COORDS[province]) || PROVINCE_COORDS['Harare']
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Africa%2FHarare&forecast_days=7`

    setLoading(true)
    setError(null)
    fetch(url)
      .then(r => r.json())
      .then(data => { setWeather(data); setLoading(false) })
      .catch(err => { setError(err); setLoading(false) })
  }, [province])

  return { weather, loading, error, coords }
}
