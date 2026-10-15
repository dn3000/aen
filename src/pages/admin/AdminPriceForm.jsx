import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  doc, getDoc, setDoc, collection, getDocs,
  serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '../../firebase'
import { useToast } from '../../components/ui/Toast'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import { ArrowLeft, Plus, X } from 'lucide-react'

const CATEGORIES = ['Vegetables', 'Fruits', 'Grains & Legumes', 'Livestock & Poultry', 'Other']
const UNITS = ['kg', 'tonne', 'crate', 'bag', 'head', 'dozen', 'bundle']

const emptyRow = () => ({
  commodity: '', category: 'Vegetables', unit: 'kg',
  mass: '', minPrice: '', maxPrice: '', avgPrice: '',
})

const iCls = 'border border-[var(--color-border)] rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/40 focus:border-[var(--color-gold)] w-full bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] transition-colors'

// Parse the compound :id param "marketId___weekDocId"
function parseId(id) {
  if (!id) return { marketId: '', weekDocId: '' }
  const sep = id.indexOf('___')
  if (sep === -1) return { marketId: id, weekDocId: '' }
  return { marketId: id.slice(0, sep), weekDocId: id.slice(sep + 3) }
}

export default function AdminPriceForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { marketId: editMarketId, weekDocId: editWeekDocId } = parseId(id)
  const navigate = useNavigate()
  const showToast = useToast()

  const [markets, setMarkets] = useState([])
  const [marketsLoading, setMarketsLoading] = useState(true)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  const [selectedMarket, setSelectedMarket] = useState(editMarketId)
  const [weekLabel, setWeekLabel] = useState('')
  const [weekLabelError, setWeekLabelError] = useState('')
  const [dateOfIssue, setDateOfIssue] = useState(() => new Date().toISOString().slice(0, 10))
  const [rows, setRows] = useState([emptyRow(), emptyRow(), emptyRow()])

  // Load markets for the selector
  useEffect(() => {
    getDocs(collection(db, 'produce-markets'))
      .then(snap => {
        const ms = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setMarkets(ms)
        if (!isEdit && ms.length > 0) setSelectedMarket(prev => prev || ms[0].id)
      })
      .finally(() => setMarketsLoading(false))
  }, [isEdit])

  // Load existing week when editing
  useEffect(() => {
    if (!isEdit || !editMarketId || !editWeekDocId) return
    getDoc(doc(db, 'markets-prices', editMarketId, 'weeks', editWeekDocId)).then(snap => {
      if (snap.exists()) {
        const data = snap.data()
        setWeekLabel(data.weekLabel ?? '')
        if (data.dateOfIssue?.toDate) {
          setDateOfIssue(data.dateOfIssue.toDate().toISOString().slice(0, 10))
        }
        setRows(data.prices?.length ? data.prices.map(p => ({
          commodity: p.commodity ?? '',
          category:  p.category  ?? 'Vegetables',
          unit:      p.unit      ?? 'kg',
          mass:      p.mass      ?? '',
          minPrice:  p.minPrice  ?? '',
          maxPrice:  p.maxPrice  ?? '',
          avgPrice:  p.avgPrice  ?? '',
        })) : [emptyRow()])
      }
      setLoading(false)
    })
  }, [isEdit, editMarketId, editWeekDocId])

  const updateRow = (i, field, value) =>
    setRows(prev => prev.map((r, j) => j === i ? { ...r, [field]: value } : r))

  const addRow = () => setRows(prev => [...prev, emptyRow()])

  const removeRow = (i) => {
    if (rows.length <= 1) return
    setRows(prev => prev.filter((_, j) => j !== i))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!weekLabel.trim()) { setWeekLabelError('Week label is required'); return }
    if (!selectedMarket)   { showToast('Please select a market.', 'error'); return }
    setWeekLabelError('')
    setSaving(true)

    const prices = rows.map(r => ({
      commodity: r.commodity.trim(),
      category:  r.category,
      unit:      r.unit,
      mass:      r.mass.trim(),
      minPrice:  Number(r.minPrice),
      maxPrice:  Number(r.maxPrice),
      avgPrice:  Number(r.avgPrice),
    }))

    const dateTs = Timestamp.fromDate(new Date(dateOfIssue + 'T00:00:00'))
    const payload = {
      weekLabel:   weekLabel.trim(),
      dateOfIssue: dateTs,
      prices,
      updatedAt:   serverTimestamp(),
    }

    try {
      if (isEdit) {
        await setDoc(
          doc(db, 'markets-prices', editMarketId, 'weeks', editWeekDocId),
          payload,
          { merge: true }
        )
        showToast('Price week updated.')
      } else {
        const weekDocId = `week_${Date.now()}`
        await setDoc(doc(db, 'markets-prices', selectedMarket, 'weeks', weekDocId), payload)
        showToast('Price week published.')
      }
      navigate('/admin/prices')
    } catch {
      showToast('Failed to save.', 'error')
      setSaving(false)
    }
  }

  if (marketsLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" color="green" />
      </div>
    )
  }

  const marketName = markets.find(m => m.id === (isEdit ? editMarketId : selectedMarket))?.name ?? selectedMarket

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate('/admin/prices')} className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm transition-colors">
        <ArrowLeft size={16} /> Back to Prices
      </button>

      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          {isEdit ? `Edit — ${marketName}` : 'Publish New Price Week'}
        </h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">

        {/* Week header */}
        <div className="bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] p-6 space-y-4">
          <h2 className="font-semibold text-[var(--color-text-primary)]">Week Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Market selector — locked when editing */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Market</label>
              {isEdit ? (
                <div className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-[var(--color-surface)] text-[var(--color-text-secondary)]">
                  {marketName}
                </div>
              ) : (
                <select
                  value={selectedMarket}
                  onChange={e => setSelectedMarket(e.target.value)}
                  required
                  className={iCls}
                >
                  <option value="">Select market…</option>
                  {markets.map(m => (
                    <option key={m.id} value={m.id}>{m.name || m.id}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Week label */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Week Label</label>
              <input
                required
                placeholder="e.g. Week 20, May 2026"
                value={weekLabel}
                onChange={e => { setWeekLabel(e.target.value); setWeekLabelError('') }}
                className={iCls}
              />
              {weekLabelError && <p className="text-xs text-red-500">{weekLabelError}</p>}
            </div>

            {/* Date of issue */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Date of Issue</label>
              <input
                type="date"
                required
                value={dateOfIssue}
                onChange={e => setDateOfIssue(e.target.value)}
                className={iCls}
              />
            </div>
          </div>
        </div>

        {/* Price rows */}
        <div className="bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] p-6 space-y-4">
          <h2 className="font-semibold text-[var(--color-text-primary)]">
            Commodity Prices
            <span className="ml-2 text-xs font-normal text-[var(--color-text-muted)]">({rows.length} rows)</span>
          </h2>

          {/* Column headers — desktop only */}
          <div className="hidden sm:grid grid-cols-[2fr_140px_80px_1fr_90px_90px_90px_36px] gap-2 text-xs font-medium text-[var(--color-text-muted)] uppercase px-1">
            <span>Commodity</span>
            <span>Category</span>
            <span>Unit</span>
            <span>Mass / Pack</span>
            <span>Min $</span>
            <span>Max $</span>
            <span>Avg $</span>
            <span />
          </div>

          {rows.map((row, i) => (
            <div key={i} className="border border-[var(--color-border)] rounded-xl p-3 bg-[var(--color-surface)] space-y-2 sm:space-y-0 sm:bg-transparent sm:border-0 sm:p-0">
              {/* Mobile label */}
              <p className="text-xs font-semibold text-[var(--color-text-muted)] sm:hidden">Row {i + 1}</p>

              {/* Desktop: single grid row */}
              <div className="grid grid-cols-1 sm:grid-cols-[2fr_140px_80px_1fr_90px_90px_90px_36px] gap-2 items-start">
                <input
                  required
                  placeholder="Commodity name"
                  value={row.commodity}
                  onChange={e => updateRow(i, 'commodity', e.target.value)}
                  className={iCls}
                />
                <select
                  value={row.category}
                  onChange={e => updateRow(i, 'category', e.target.value)}
                  className={iCls}
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <select
                  value={row.unit}
                  onChange={e => updateRow(i, 'unit', e.target.value)}
                  className={iCls}
                >
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
                <input
                  placeholder="e.g. 30 kg crate"
                  value={row.mass}
                  onChange={e => updateRow(i, 'mass', e.target.value)}
                  className={iCls}
                />
                <input
                  required
                  type="number" min="0" step="0.01" placeholder="0.00"
                  value={row.minPrice}
                  onChange={e => updateRow(i, 'minPrice', e.target.value)}
                  className={iCls}
                />
                <input
                  required
                  type="number" min="0" step="0.01" placeholder="0.00"
                  value={row.maxPrice}
                  onChange={e => updateRow(i, 'maxPrice', e.target.value)}
                  className={iCls}
                />
                <input
                  required
                  type="number" min="0" step="0.01" placeholder="0.00"
                  value={row.avgPrice}
                  onChange={e => updateRow(i, 'avgPrice', e.target.value)}
                  className={iCls}
                />
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  disabled={rows.length <= 1}
                  className="p-2 rounded hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors self-start sm:self-center"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-medium transition-colors mt-2"
          >
            <Plus size={16} /> Add Commodity
          </button>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" type="button" onClick={() => navigate('/admin/prices')}>Cancel</Button>
          <Button variant="primary" type="submit" loading={saving}>
            {isEdit ? 'Save Changes' : 'Publish'}
          </Button>
        </div>
      </form>
    </div>
  )
}
