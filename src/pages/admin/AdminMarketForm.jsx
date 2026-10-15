import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { doc, getDoc, addDoc, updateDoc, collection, getDocs, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useToast } from '../../components/ui/Toast'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { ArrowLeft, X, RefreshCw } from 'lucide-react'

const UNITS = ['Tonnes', 'KG', 'Crates', 'Litres', 'Heads', 'Bags']
const CURRENCIES = ['USD', 'ZWG']
const COMPANY_TYPES = [
  'Processor', 'Exporter', 'Retailer', 'Wholesaler',
  'Supermarket Chain', 'NGO / Development', 'Other',
]

const selCls = 'w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/40 focus:border-[var(--color-gold)] transition-colors'

// ── Chip-style tag input ───────────────────────────────────────────────────────
function TagInput({ tags, onChange, placeholder = 'Type commodity + Enter' }) {
  const [val, setVal] = useState('')

  const commit = () => {
    const t = val.trim().replace(/,$/, '')
    if (t && !tags.includes(t)) onChange([...tags, t])
    setVal('')
  }

  const remove = (i) => onChange(tags.filter((_, j) => j !== i))

  return (
    <div className="border border-[var(--color-border)] rounded-lg p-2 flex flex-wrap gap-1.5 min-h-[42px] focus-within:ring-2 focus-within:ring-[var(--color-gold)]/40 focus-within:border-[var(--color-gold)] transition-all bg-[var(--color-surface)] cursor-text">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium bg-green-primary/15 text-[var(--color-text-primary)]"
        >
          {tag}
          <button type="button" onClick={() => remove(i)} className="hover:text-red-500 transition-colors">
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        className="flex-1 min-w-[140px] text-sm outline-none bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
        placeholder={tags.length === 0 ? placeholder : 'Add more…'}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit() }
          if (e.key === 'Backspace' && !val && tags.length > 0) remove(tags.length - 1)
        }}
        onBlur={commit}
      />
    </div>
  )
}

// ── One-time migration helper ──────────────────────────────────────────────────
function MigrationPanel() {
  const showToast = useToast()
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState('')

  const run = async () => {
    setRunning(true)
    setResult('')
    try {
      const snap = await getDocs(collection(db, 'markets'))
      let migrated = 0
      await Promise.all(snap.docs.map(async d => {
        const data = d.data()
        // Only migrate docs that still have the old singular commodity field
        if (typeof data.commodity === 'string') {
          await setDoc(doc(db, 'markets', d.id), {
            commodities:      [data.commodity],
            quantityRequired: data.quantity ?? data.quantityRequired ?? 0,
            contactPhone:     data.contactMethod ?? data.contactPhone ?? '',
          }, { merge: true })
          migrated++
        }
      }))
      setResult(`✓ Migrated ${migrated} doc${migrated !== 1 ? 's' : ''}.`)
      showToast(`Migration complete — ${migrated} docs updated.`)
    } catch {
      setResult('Migration failed — check console.')
      showToast('Migration failed.', 'error')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl p-4">
      <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">Legacy data migration</p>
      <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
        Converts old <code>commodity</code> / <code>quantity</code> / <code>contactMethod</code> fields to the new schema.
        Run once — safe to re-run.
      </p>
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" loading={running} onClick={run}>
          <RefreshCw size={13} /> Run Migration
        </Button>
        {result && <span className="text-xs text-amber-800 dark:text-amber-300">{result}</span>}
      </div>
    </div>
  )
}

// ── Main form ──────────────────────────────────────────────────────────────────
export default function AdminMarketForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const showToast = useToast()
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [commodities, setCommodities] = useState([])

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { active: true, currency: 'USD', unit: 'Tonnes', companyType: 'Processor' },
  })

  useEffect(() => {
    if (!isEdit) return
    getDoc(doc(db, 'markets', id)).then(snap => {
      if (snap.exists()) {
        const data = snap.data()
        reset(data)
        // Normalise commodities to array
        if (Array.isArray(data.commodities)) {
          setCommodities(data.commodities)
        } else if (data.commodity) {
          setCommodities([data.commodity])
        }
      }
      setLoading(false)
    })
  }, [id, isEdit, reset])

  const onSubmit = async (data) => {
    if (commodities.length === 0) {
      showToast('Add at least one commodity.', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = {
        buyerName:        data.buyerName,
        companyType:      data.companyType,
        description:      data.description ?? '',
        commodities,
        quantityRequired: Number(data.quantityRequired),
        unit:             data.unit,
        pricePerUnit:     data.pricePerUnit ? Number(data.pricePerUnit) : null,
        currency:         data.currency,
        location:         data.location,
        contactPhone:     data.contactPhone ?? '',
        contactEmail:     data.contactEmail ?? '',
        website:          data.website ?? '',
        active:           Boolean(data.active),
      }
      if (isEdit) {
        await updateDoc(doc(db, 'markets', id), payload)
      } else {
        await addDoc(collection(db, 'markets'), { ...payload, createdAt: serverTimestamp() })
      }
      showToast(isEdit ? 'Listing updated.' : 'Listing created.')
      navigate('/admin/markets')
    } catch {
      showToast('Failed to save listing.', 'error')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" color="green" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate('/admin/markets')} className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm transition-colors">
        <ArrowLeft size={16} /> Back to Markets
      </button>

      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
        {isEdit ? 'Edit Market Listing' : 'New Market Listing'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] p-6 space-y-5">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Buyer / Organisation Name"
              error={errors.buyerName?.message}
              {...register('buyerName', { required: 'Required' })}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Company Type</label>
              <select {...register('companyType')} className={selCls}>
                {COMPANY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">
              Commodities Sought <span className="text-[var(--color-text-muted)] font-normal">(press Enter or comma to add each)</span>
            </label>
            <TagInput tags={commodities} onChange={setCommodities} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Description <span className="text-[var(--color-text-muted)] font-normal">(optional)</span></label>
            <textarea
              rows={2}
              placeholder="Brief description of buying requirements or company background…"
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/40 focus:border-[var(--color-gold)] resize-none transition-colors"
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Quantity Required"
              type="number"
              min="0"
              error={errors.quantityRequired?.message}
              {...register('quantityRequired', { required: 'Required' })}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Unit</label>
              <select {...register('unit', { required: true })} className={selCls}>
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Currency</label>
              <select {...register('currency')} className={selCls}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <Input
            label="Price per Unit (optional — leave blank for 'Price on request')"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            {...register('pricePerUnit')}
          />

          <Input
            label="Location"
            error={errors.location?.message}
            {...register('location', { required: 'Required' })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone / WhatsApp"
              error={errors.contactPhone?.message}
              {...register('contactPhone', { required: 'Required' })}
            />
            <Input
              label="Contact Email (optional)"
              type="email"
              {...register('contactEmail')}
            />
          </div>

          <Input
            label="Website (optional)"
            type="url"
            placeholder="https://example.com"
            {...register('website')}
          />

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">Listing Active</label>
            <button
              type="button"
              onClick={() => setValue('active', !watch('active'))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                watch('active') ? 'bg-green-primary' : 'bg-[var(--color-text-muted)]/50'
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                watch('active') ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" type="button" onClick={() => navigate('/admin/markets')}>Cancel</Button>
          <Button variant="primary" type="submit" loading={saving}>
            {isEdit ? 'Save Changes' : 'Create Listing'}
          </Button>
        </div>
      </form>

      {/* Migration panel — only shown in new-listing mode as a utility */}
      {!isEdit && <MigrationPanel />}
    </div>
  )
}
