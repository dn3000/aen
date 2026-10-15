import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { X } from 'lucide-react'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../ui/Toast'
import Button from '../ui/Button'

const UNITS = ['kg', 'Tonnes', 'Buckets', 'Crates', 'Heads', 'Pockets', 'Bundles', 'Other']

export default function PostListingModal({ isOpen, onClose, onSuccess }) {
  const { user, farmerProfile } = useAuth()
  const showToast = useToast()

  const locationDefault = farmerProfile?.location
    ? [farmerProfile.location.district, farmerProfile.location.province].filter(Boolean).join(', ')
    : ''

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      type: 'selling', commodity: '', quantity: '', unit: 'kg',
      location: locationDefault, contactPhone: farmerProfile?.contact ?? '', description: '',
    },
  })

  useEffect(() => {
    if (isOpen) reset({
      type: 'selling', commodity: '', quantity: '', unit: 'kg',
      location: locationDefault, contactPhone: farmerProfile?.contact ?? '', description: '',
    })
  }, [isOpen]) // eslint-disable-line

  const descValue = watch('description') ?? ''

  const onSubmit = async (data) => {
    try {
      await addDoc(collection(db, 'listings'), {
        uid: user.uid,
        fullName: farmerProfile?.fullName ?? user.displayName ?? 'AEN Farmer',
        type: data.type,
        commodity: data.commodity.trim(),
        quantity: Number(data.quantity),
        unit: data.unit,
        location: data.location.trim(),
        contactPhone: data.contactPhone.trim(),
        description: data.description.trim(),
        active: true,
        createdAt: serverTimestamp(),
      })
      showToast('Listing posted successfully!')
      onSuccess()
    } catch {
      showToast('Failed to post listing.', 'error')
    }
  }

  if (!isOpen) return null

  const field = 'w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors'
  const fieldStyle = {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  }
  const labelStyle = { color: 'var(--color-text-secondary)' }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div
        className="w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto shadow-xl"
        style={{ backgroundColor: 'var(--color-surface-2)' }}
      >
        <div
          className="sticky top-0 px-4 py-3 flex items-center justify-between rounded-t-2xl z-10"
          style={{ backgroundColor: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}
        >
          <h2 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Post a Listing</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full transition-colors hover:bg-[var(--color-surface)]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div>
            <p className="text-sm font-medium mb-2" style={labelStyle}>I am</p>
            <div className="flex gap-4">
              {['selling', 'buying'].map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value={t} {...register('type')} className="accent-green-primary" />
                  <span className="text-sm capitalize" style={{ color: 'var(--color-text-primary)' }}>{t}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1" style={labelStyle}>Commodity *</label>
            <input {...register('commodity', { required: 'Required' })} placeholder="e.g. Tomatoes, Maize" className={field} style={fieldStyle} />
            {errors.commodity && <p className="text-xs mt-0.5" style={{ color: 'var(--color-danger)' }}>{errors.commodity.message}</p>}
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-sm font-medium block mb-1" style={labelStyle}>Quantity *</label>
              <input type="number" min="1" {...register('quantity', { required: 'Required', min: { value: 1, message: 'Min 1' } })} placeholder="200" className={field} style={fieldStyle} />
              {errors.quantity && <p className="text-xs mt-0.5" style={{ color: 'var(--color-danger)' }}>{errors.quantity.message}</p>}
            </div>
            <div className="w-32">
              <label className="text-sm font-medium block mb-1" style={labelStyle}>Unit *</label>
              <select {...register('unit')} className={field} style={fieldStyle}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1" style={labelStyle}>Location *</label>
            <input {...register('location', { required: 'Required' })} placeholder="e.g. Harare, Harare" className={field} style={fieldStyle} />
            {errors.location && <p className="text-xs mt-0.5" style={{ color: 'var(--color-danger)' }}>{errors.location.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium block mb-1" style={labelStyle}>Contact Phone *</label>
            <input {...register('contactPhone', { required: 'Required' })} placeholder="+263 77 123 4567" className={field} style={fieldStyle} />
            {errors.contactPhone && <p className="text-xs mt-0.5" style={{ color: 'var(--color-danger)' }}>{errors.contactPhone.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium" style={labelStyle}>Extra details</label>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{descValue.length}/100</span>
            </div>
            <textarea
              {...register('description', { maxLength: { value: 100, message: 'Max 100 characters' } })}
              rows={2}
              placeholder="Any extra details e.g. variety, quality, urgency..."
              className={`${field} resize-none`}
              style={fieldStyle}
            />
            {errors.description && <p className="text-xs mt-0.5" style={{ color: 'var(--color-danger)' }}>{errors.description.message}</p>}
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="gold-gradient" loading={isSubmitting} className="flex-1">
              Post Listing
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
