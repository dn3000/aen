import { MapPin } from 'lucide-react'
import Badge from '../ui/Badge'

export default function ProfileCard({ profile, landSize }) {
  if (!profile) return null

  const { fullName, location, farmingType, profileComplete } = profile
  const locationStr = [location?.district, location?.province].filter(Boolean).join(', ')
  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className="glass-card p-5">
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-cream"
          style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)' }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
              {fullName || 'Farmer'}
            </h3>
            <Badge variant={profileComplete ? 'success' : 'warning'}>
              {profileComplete ? 'Active Member' : 'Onboarding'}
            </Badge>
          </div>
          {locationStr && (
            <div className="flex items-center gap-1 mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <MapPin size={12} />
              <span>{locationStr}</span>
            </div>
          )}
          {farmingType && (
            <p className="text-xs mt-1 capitalize" style={{ color: 'var(--color-text-muted)' }}>
              {farmingType} farming
            </p>
          )}
          {landSize && (
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {landSize} ha land
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
