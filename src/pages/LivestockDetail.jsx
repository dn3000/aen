import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ChevronLeft, Check, X, Plus, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'
import Spinner from '../components/ui/Spinner'

const LIVESTOCK_EMOJIS = {
  'Cattle': '🐄', 'Goats': '🐐', 'Sheep': '🐑', 'Pigs': '🐖',
  'Chickens': '🐔', 'Ducks': '🦆', 'Turkeys': '🦃', 'Rabbits': '🐇',
  'Donkeys': '🫏', 'Horses': '🐴',
}

const GRAZING_HA = {
  'Cattle': 0.5, 'Goats': 0.15, 'Sheep': 0.2, 'Pigs': 0.05,
  'Chickens': 0.01, 'Ducks': 0.01, 'Turkeys': 0.02, 'Rabbits': 0.01,
  'Donkeys': 0.3, 'Horses': 0.4,
}

const LIVESTOCK_TYPES = ['Cattle', 'Goats', 'Sheep', 'Pigs', 'Chickens', 'Ducks', 'Turkeys', 'Rabbits', 'Donkeys', 'Horses']

function getLivestockEmoji(type) {
  for (const [key, emoji] of Object.entries(LIVESTOCK_EMOJIS)) {
    if (type?.toLowerCase().includes(key.toLowerCase())) return emoji
  }
  return '🐾'
}

function getGrazingHa(type, count) {
  for (const [key, haPerHead] of Object.entries(GRAZING_HA)) {
    if (type?.toLowerCase().includes(key.toLowerCase())) return Math.round(count * haPerHead * 10) / 10
  }
  return null
}

const INFRA_ITEMS = [
  { label: 'Fencing',              key: 'hasFencing' },
  { label: 'Livestock Structures', key: 'hasLivestockStructures' },
  { label: 'Worker Housing',       key: 'hasWorkerHousing' },
]

export default function LivestockDetail() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [farmProfile, setFarmProfile] = useState(null)
  const [infrastructure, setInfrastructure] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editLivestock, setEditLivestock] = useState([])

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

  const livestock = farmProfile?.livestock || []
  const totalHeads = livestock.reduce((sum, item) => sum + (Number(item.count) || 0), 0)
  const totalGrazingHa = Math.round(
    livestock.reduce((sum, item) => sum + (getGrazingHa(item.type, Number(item.count) || 0) || 0), 0) * 10
  ) / 10

  function openEdit() {
    setEditLivestock(
      livestock.length
        ? livestock.map(l => ({ ...l }))
        : [{ type: 'Cattle', count: 1 }]
    )
    setEditOpen(true)
  }

  function updateEditItem(idx, field, value) {
    setEditLivestock(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  async function saveLivestockEdit() {
    if (!user?.uid) return
    setSaving(true)
    try {
      const cleaned = editLivestock.filter(l => l.type && Number(l.count) > 0)
      await setDoc(doc(db, 'farmers', user.uid, 'farmProfile', 'farmProfile'), { livestock: cleaned }, { merge: true })
      setFarmProfile(prev => ({ ...prev, livestock: cleaned }))
      setEditOpen(false)
    } finally {
      setSaving(false)
    }
  }

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
            <span className="text-2xl">🐾</span>
            <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Livestock</h1>
          </div>
          <button
            onClick={openEdit}
            className="ml-2 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors hover:border-gold hover:text-gold"
            style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            Edit
          </button>
        </div>

        {/* Summary stats */}
        <motion.div
          className="grid grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {[
            { label: 'Total Head',     value: totalHeads || '—' },
            { label: 'Animal Types',   value: livestock.length || '—' },
            { label: 'Grazing Need',   value: totalGrazingHa > 0 ? `~${totalGrazingHa} ha` : '—' },
          ].map(stat => (
            <div key={stat.label} className="glass-card p-4 text-center">
              <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{stat.value}</p>
              <p className="text-[11px] mt-0.5 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Livestock roster */}
        {livestock.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <span className="text-4xl block mb-3">🐾</span>
            <p style={{ color: 'var(--color-text-muted)' }}>No livestock recorded. Tap Edit to add your animals.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {livestock.map((item, idx) => {
              const emoji = getLivestockEmoji(item.type)
              const grazingHa = getGrazingHa(item.type, Number(item.count) || 0)
              return (
                <motion.div
                  key={idx}
                  className="glass-card p-5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.06 }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl flex-shrink-0">{emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{item.count}</span>
                        <span className="text-base font-medium" style={{ color: 'var(--color-text-secondary)' }}>{item.type}</span>
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {grazingHa !== null && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,140,82,0.12)', color: '#294d2d' }}>
                            ~{grazingHa} ha grazing needed
                          </span>
                        )}
                        {infrastructure?.hasFencing && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(36,113,163,0.12)', color: '#2471a3' }}>
                            Fenced ✓
                          </span>
                        )}
                        {infrastructure?.hasLivestockStructures && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(176,141,87,0.15)', color: '#b99029' }}>
                            Structures ✓
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Infrastructure */}
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
        >
          <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text-primary)' }}>Infrastructure</h2>
          {infrastructure === null ? (
            <p className="text-xs text-center py-2" style={{ color: 'var(--color-text-muted)' }}>
              Infrastructure data not recorded. Complete your onboarding to add this.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {INFRA_ITEMS.map(item => {
                const hasIt = infrastructure[item.key]
                return (
                  <div
                    key={item.key}
                    className="flex flex-col items-center gap-2 rounded-xl p-3 text-center"
                    style={{
                      background: hasIt ? 'rgba(74,140,82,0.1)' : 'var(--color-surface-2)',
                      border: hasIt ? '1px solid rgba(74,140,82,0.2)' : '1px solid transparent',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: hasIt ? 'rgba(74,140,82,0.2)' : 'var(--color-border)' }}
                    >
                      {hasIt
                        ? <Check size={15} style={{ color: '#294d2d' }} />
                        : <X size={15} style={{ color: 'var(--color-text-muted)' }} />
                      }
                    </div>
                    <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

      </div>

      {/* Edit Livestock Modal */}
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
              <h2 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Edit Livestock</h2>
              <button
                onClick={() => setEditOpen(false)}
                className="p-1.5 rounded-full transition-colors hover:bg-[var(--color-surface)]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {editLivestock.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={item.type}
                    onChange={e => updateEditItem(idx, 'type', e.target.value)}
                    className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                    style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                  >
                    {LIVESTOCK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.count}
                    onChange={e => updateEditItem(idx, 'count', e.target.value)}
                    className="w-20 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-gold/50"
                    style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                  <button
                    onClick={() => setEditLivestock(prev => prev.filter((_, i) => i !== idx))}
                    className="p-2 rounded-lg transition-colors hover:bg-red-500/10"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <Minus size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setEditLivestock(prev => [...prev, { type: 'Cattle', count: 1 }])}
                className="flex items-center gap-2 text-sm font-medium w-full justify-center py-2 rounded-xl transition-colors hover:border-gold hover:text-gold"
                style={{ border: '2px dashed var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                <Plus size={15} /> Add animal type
              </button>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditOpen(false)}
                  className="flex-1 py-2 rounded-xl text-sm font-medium"
                  style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveLivestockEdit}
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
