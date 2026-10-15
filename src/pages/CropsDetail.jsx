import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ChevronLeft, Sprout, Edit2, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'
import Spinner from '../components/ui/Spinner'

const CROP_EMOJIS = {
  'Maize': '🌽', 'Tobacco': '🌿', 'Cotton': '🌸', 'Soybeans': '🫘',
  'Wheat': '🌾', 'Sorghum': '🌾', 'Sunflower': '🌻', 'Groundnuts': '🥜',
  'Tomatoes': '🍅', 'Onions': '🧅', 'Potatoes': '🥔', 'Cabbage': '🥬',
  'Sugar Cane': '🎋', 'Cowpeas': '🫘', 'Sweet Potatoes': '🍠',
  'Peppers': '🫑', 'Carrots': '🥕', 'Beans': '🫘', 'Peas': '🫛',
}

function getCropEmoji(name) {
  for (const [key, emoji] of Object.entries(CROP_EMOJIS)) {
    if (name?.toLowerCase().includes(key.toLowerCase())) return emoji
  }
  return '🌱'
}

const r2 = (n) => Math.round(n * 100) / 100

const KEY_DATES = [
  { label: 'Date Planted' },
  { label: 'Fertilizer Application' },
  { label: 'Pesticide Application' },
  { label: 'Expected Harvest' },
]

export default function CropsDetail() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [farmProfile, setFarmProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editCrop, setEditCrop] = useState(null)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    if (!user?.uid) return
    getDoc(doc(db, 'farmers', user.uid, 'farmProfile', 'farmProfile'))
      .then(snap => setFarmProfile(snap.exists() ? snap.data() : null))
      .finally(() => setLoading(false))
  }, [user?.uid])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  const totalLand = farmProfile?.totalLandSize || 0
  const crops = farmProfile?.mainCrops || []
  const cropDetails = farmProfile?.cropDetails?.length
    ? farmProfile.cropDetails
    : crops.map((name, i) => ({
        name,
        status: 'Active',
        areaHa: totalLand > 0
          ? r2(totalLand / crops.length * (i === 0 ? 0.6 : 0.4 / (crops.length - 1 || 1)))
          : null,
        irrigated: false,
      }))

  const totalCropArea = r2(cropDetails.reduce((sum, c) => sum + (c.areaHa || 0), 0))
  const irrigatedCount = cropDetails.filter(c => c.irrigated).length

  function openEdit(crop) {
    setEditCrop(crop)
    setEditForm({ status: crop.status || 'Active', areaHa: crop.areaHa ?? '', irrigated: !!crop.irrigated })
  }

  async function saveCropEdit() {
    if (!user?.uid || !editCrop) return
    setSaving(true)
    try {
      const updated = cropDetails.map(c =>
        c.name === editCrop.name
          ? { ...c, status: editForm.status, areaHa: Number(editForm.areaHa) || c.areaHa, irrigated: editForm.irrigated }
          : c
      )
      await setDoc(doc(db, 'farmers', user.uid, 'farmProfile', 'farmProfile'), { cropDetails: updated }, { merge: true })
      setFarmProfile(prev => ({ ...prev, cropDetails: updated }))
      setEditCrop(null)
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
              <Sprout size={16} className="text-gold" />
            </div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Active Crops</h1>
          </div>
        </div>

        {/* Summary stats */}
        <motion.div
          className="grid grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {[
            { label: 'Total Crops', value: cropDetails.length || '—' },
            { label: 'Crop Area', value: totalCropArea > 0 ? `${totalCropArea} ha` : '—' },
            { label: 'Irrigated', value: `${irrigatedCount} / ${cropDetails.length}` },
          ].map(stat => (
            <div key={stat.label} className="glass-card p-4 text-center">
              <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{stat.value}</p>
              <p className="text-[11px] mt-0.5 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Crop cards */}
        {cropDetails.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <Sprout size={32} className="mx-auto mb-3 text-gold opacity-40" />
            <p style={{ color: 'var(--color-text-muted)' }}>No crops recorded. Update your farm profile to add crops.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cropDetails.map((crop, idx) => (
              <motion.div
                key={crop.name}
                className="glass-card p-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.07 }}
              >
                {/* Crop header row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getCropEmoji(crop.name)}</span>
                    <div>
                      <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>{crop.name}</h2>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={crop.status === 'Active' || !crop.status
                            ? { background: 'rgba(74,140,82,0.2)', color: '#294d2d' }
                            : { background: 'rgba(176,141,87,0.2)', color: '#b99029' }
                          }
                        >
                          {crop.status || 'Active'}
                        </span>
                        {crop.irrigated != null && (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={crop.irrigated
                              ? { background: 'rgba(36,113,163,0.15)', color: '#2471a3' }
                              : { background: 'rgba(0,0,0,0.06)', color: 'var(--color-text-muted)' }
                            }
                          >
                            {crop.irrigated ? '💧 Irrigated' : '🌧 Rain-fed'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => openEdit(crop)}
                    className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full transition-colors border hover:border-gold hover:text-gold flex-shrink-0"
                    style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                  >
                    <Edit2 size={11} /> Edit
                  </button>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-xl p-3" style={{ background: 'var(--color-surface-2)' }}>
                    <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-muted)' }}>Land Area</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {crop.areaHa ? `${crop.areaHa} ha` : '—'}
                    </p>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: 'var(--color-surface-2)' }}>
                    <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-muted)' }}>Irrigation Type</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {farmProfile?.irrigationType || (crop.irrigated ? 'Irrigated' : 'Rain-fed')}
                    </p>
                  </div>
                </div>

                {/* Key Dates — placeholder */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
                    Key Dates
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {KEY_DATES.map(({ label }) => (
                      <div key={label} className="rounded-xl p-3" style={{ background: 'var(--color-surface-2)' }}>
                        <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                        <p className="text-xs italic" style={{ color: 'var(--color-text-muted)', opacity: 0.55 }}>Not recorded yet</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] mt-2 italic" style={{ color: 'var(--color-text-muted)', opacity: 0.45 }}>
                    Date tracking coming in a future update
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Farm context strip */}
        {farmProfile && (
          <motion.div
            className="glass-card p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>Farm Context</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Water Source', value: farmProfile.waterSourceAccess || '—' },
                { label: 'Irrigation', value: farmProfile.irrigationType || '—' },
                { label: 'Labour', value: farmProfile.laborType || '—' },
                { label: 'Experience', value: farmProfile.seasonsOfExperience ? `${farmProfile.seasonsOfExperience} seasons` : '—' },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>{item.label}</p>
                  <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--color-text-primary)' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Edit Crop Modal */}
      {editCrop && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div
            className="w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface-2)' }}
          >
            <div
              className="sticky top-0 px-4 py-3 flex items-center justify-between"
              style={{ backgroundColor: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}
            >
              <h2 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Edit — {editCrop.name}</h2>
              <button
                onClick={() => setEditCrop(null)}
                className="p-1.5 rounded-full transition-colors hover:bg-[var(--color-surface)]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1" style={{ color: 'var(--color-text-secondary)' }}>Status</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                >
                  <option value="Active">Active</option>
                  <option value="Fallow">Fallow</option>
                  <option value="Harvested">Harvested</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1" style={{ color: 'var(--color-text-secondary)' }}>Area (hectares)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={editForm.areaHa}
                  onChange={e => setEditForm(f => ({ ...f, areaHa: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: 'var(--color-text-secondary)' }}>Irrigation</label>
                <div className="flex gap-4">
                  {[{ label: '💧 Irrigated', value: true }, { label: '🌧 Rain-fed', value: false }].map(opt => (
                    <label key={opt.label} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={editForm.irrigated === opt.value}
                        onChange={() => setEditForm(f => ({ ...f, irrigated: opt.value }))}
                        className="accent-green-primary"
                      />
                      <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'var(--color-surface)', border: '1px dashed var(--color-border)' }}>
                <p className="text-xs italic" style={{ color: 'var(--color-text-muted)' }}>
                  📅 Date fields (planted, harvest etc.) will be available in a future update
                </p>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setEditCrop(null)}
                  className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors"
                  style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveCropEdit}
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
