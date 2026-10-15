import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ChevronLeft, MapPin, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'
import Spinner from '../components/ui/Spinner'

const r2 = (n) => Math.round(n * 100) / 100

const INFRA_ITEMS = [
  { label: 'Storage Facilities', key: 'hasStorageFacilities' },
  { label: 'Fencing',            key: 'hasFencing' },
  { label: 'Livestock Structures', key: 'hasLivestockStructures' },
  { label: 'Worker Housing',     key: 'hasWorkerHousing' },
]

export default function LandDetail() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [farmProfile, setFarmProfile] = useState(null)
  const [infrastructure, setInfrastructure] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    if (!user?.uid) return
    Promise.all([
      getDoc(doc(db, 'farmers', user.uid, 'farmProfile', 'farmProfile')),
      getDoc(doc(db, 'farmers', user.uid, 'infrastructure', 'infrastructure')),
    ]).then(([farmSnap, infraSnap]) => {
      setFarmProfile(farmSnap.exists() ? farmSnap.data() : null)
      setInfrastructure(infraSnap.exists() ? infraSnap.data() : null)
      setLoading(false)
    })
  }, [user?.uid])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  const total = farmProfile?.totalLandSize || 0
  const prod = farmProfile?.landUnderProduction || 0
  const irrigated = farmProfile?.irrigatedLand || farmProfile?.landUnderIrrigation || 0
  const fallow = total > 0 ? r2(total - prod) : 0
  const utilizationPct = total > 0 ? Math.round((prod / total) * 100) : 0

  function openEdit() {
    setEditForm({
      totalLandSize: farmProfile?.totalLandSize ?? '',
      landUnderProduction: farmProfile?.landUnderProduction ?? '',
      irrigatedLand: farmProfile?.irrigatedLand ?? farmProfile?.landUnderIrrigation ?? '',
      landOwnership: farmProfile?.landOwnership || 'Own',
      isLandInsured: farmProfile?.isLandInsured || false,
      landInsuranceDetails: farmProfile?.landInsuranceDetails || '',
    })
    setEditOpen(true)
  }

  async function saveLandEdit() {
    if (!user?.uid) return
    setSaving(true)
    try {
      const payload = {
        totalLandSize: Number(editForm.totalLandSize) || 0,
        landUnderProduction: Number(editForm.landUnderProduction) || 0,
        irrigatedLand: Number(editForm.irrigatedLand) || 0,
        landOwnership: editForm.landOwnership,
        isLandInsured: editForm.isLandInsured,
        landInsuranceDetails: editForm.landInsuranceDetails,
      }
      await setDoc(doc(db, 'farmers', user.uid, 'farmProfile', 'farmProfile'), payload, { merge: true })
      setFarmProfile(prev => ({ ...prev, ...payload }))
      setEditOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50'
  const inputStyle = { backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }

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
          <div className="flex items-center gap-2 ml-auto">
            <div className="rounded-lg p-1.5" style={{ background: 'rgba(176,141,87,0.15)' }}>
              <MapPin size={16} className="text-gold" />
            </div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Land Overview</h1>
          </div>
          <button
            onClick={openEdit}
            className="ml-2 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors hover:border-gold hover:text-gold"
            style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            Edit
          </button>
        </div>

        {/* Metrics grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {[
            { label: 'Total Land',  value: total ? `${total} ha` : '—',     color: 'var(--color-text-primary)' },
            { label: 'Cultivated',  value: prod ? `${prod} ha` : '—',       color: '#4A6741' },
            { label: 'Fallow',      value: fallow > 0 ? `${fallow} ha` : '—', color: '#b99029' },
            { label: 'Irrigated',   value: irrigated ? `${irrigated} ha` : '—', color: '#2471A3' },
          ].map(m => (
            <div key={m.label} className="glass-card p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
              <p className="text-[11px] mt-0.5 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>{m.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Visual stacked bar */}
        {total > 0 && (
          <motion.div
            className="glass-card p-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.06 }}
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Land Utilisation</h2>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: utilizationPct >= 70 ? 'rgba(74,140,82,0.15)' : 'rgba(200,168,75,0.15)',
                  color: utilizationPct >= 70 ? '#294d2d' : '#b99029',
                }}
              >
                {utilizationPct}% utilised
              </span>
            </div>
            <div className="h-6 rounded-full overflow-hidden flex gap-px" style={{ background: 'var(--color-surface-2)' }}>
              {prod > 0 && (
                <div
                  className="h-full rounded-l-full"
                  style={{ width: `${Math.min((prod / total) * 100, 100)}%`, background: '#4A6741' }}
                />
              )}
              {irrigated > 0 && (
                <div
                  className="h-full"
                  style={{ width: `${Math.min((irrigated / total) * 100, 100)}%`, background: '#2471A3' }}
                />
              )}
              {fallow > 0 && (
                <div
                  className="h-full rounded-r-full"
                  style={{ width: `${Math.min((fallow / total) * 100, 100)}%`, background: 'rgba(176,141,87,0.5)' }}
                />
              )}
            </div>
            <div className="flex gap-5 mt-3">
              {[
                { label: 'Cultivated', color: '#4A6741' },
                { label: 'Irrigated',  color: '#2471A3' },
                { label: 'Fallow',     color: 'rgba(176,141,87,0.6)' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: l.color }} />
                  <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Land details */}
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text-primary)' }}>Land Details</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Ownership',     value: farmProfile?.landOwnership || '—' },
              { label: 'Insured',       value: farmProfile?.isLandInsured ? 'Yes' : 'No' },
              { label: 'Water Source',  value: farmProfile?.waterSourceAccess || '—' },
              { label: 'Irrigation',    value: farmProfile?.irrigationType || '—' },
            ].map(item => (
              <div key={item.label}>
                <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>{item.label}</p>
                <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--color-text-primary)' }}>{item.value}</p>
              </div>
            ))}
          </div>
          {farmProfile?.isLandInsured && farmProfile?.landInsuranceDetails && (
            <div className="mt-4 rounded-xl p-3" style={{ background: 'var(--color-surface-2)' }}>
              <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-muted)' }}>Insurance Details</p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{farmProfile.landInsuranceDetails}</p>
            </div>
          )}
        </motion.div>

        {/* Infrastructure checklist */}
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.14 }}
        >
          <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text-primary)' }}>Infrastructure</h2>
          {infrastructure === null ? (
            <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
              Infrastructure data not recorded. Complete your onboarding to add this.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {INFRA_ITEMS.map(item => {
                const hasIt = infrastructure[item.key]
                return (
                  <div
                    key={item.key}
                    className="flex items-center gap-3 rounded-xl p-3"
                    style={{
                      background: hasIt ? 'rgba(74,140,82,0.1)' : 'var(--color-surface-2)',
                      border: hasIt ? '1px solid rgba(74,140,82,0.2)' : '1px solid transparent',
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: hasIt ? 'rgba(74,140,82,0.2)' : 'var(--color-border)' }}
                    >
                      {hasIt
                        ? <Check size={13} style={{ color: '#294d2d' }} />
                        : <X size={13} style={{ color: 'var(--color-text-muted)' }} />
                      }
                    </div>
                    <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Edit Land Modal */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div
            className="w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface-2)' }}
          >
            <div
              className="sticky top-0 px-4 py-3 flex items-center justify-between"
              style={{ backgroundColor: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}
            >
              <h2 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Edit Land Info</h2>
              <button
                onClick={() => setEditOpen(false)}
                className="p-1.5 rounded-full transition-colors hover:bg-[var(--color-surface)]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {[
                { label: 'Total Land Size (ha)',         key: 'totalLandSize' },
                { label: 'Land Under Production (ha)',   key: 'landUnderProduction' },
                { label: 'Land Under Irrigation (ha)',   key: 'irrigatedLand' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-sm font-medium block mb-1" style={{ color: 'var(--color-text-secondary)' }}>{f.label}</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={editForm[f.key]}
                    onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium block mb-1" style={{ color: 'var(--color-text-secondary)' }}>Land Ownership</label>
                <select
                  value={editForm.landOwnership}
                  onChange={e => setEditForm(p => ({ ...p, landOwnership: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                >
                  {['Own', 'Lease', 'Communal'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.isLandInsured}
                  onChange={e => setEditForm(p => ({ ...p, isLandInsured: e.target.checked }))}
                  className="accent-green-primary w-4 h-4"
                />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Land is insured</span>
              </label>
              {editForm.isLandInsured && (
                <div>
                  <label className="text-sm font-medium block mb-1" style={{ color: 'var(--color-text-secondary)' }}>Insurance Details</label>
                  <textarea
                    rows={2}
                    value={editForm.landInsuranceDetails}
                    onChange={e => setEditForm(p => ({ ...p, landInsuranceDetails: e.target.value }))}
                    className={`${inputCls} resize-none`}
                    style={inputStyle}
                  />
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setEditOpen(false)}
                  className="flex-1 py-2 rounded-xl text-sm font-medium"
                  style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveLandEdit}
                  disabled={saving}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all hover:brightness-105 disabled:opacity-60"
                  style={{ background: 'var(--gradient-gold)', color: '#1a1a1a' }}
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
