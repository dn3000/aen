import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import {
  ArrowLeft, User, MapPin, Sprout, Package, ShoppingBag, Shield,
  CheckCircle2, Edit2, Lock, Save, X as XIcon,
} from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'

const PROVINCES = {
  'Bulawayo':            ['Bulawayo'],
  'Harare':              ['Epworth', 'Chitungwiza', 'Harare'],
  'Manicaland':          ['Buhera', 'Chimanimani', 'Chipinge', 'Makoni', 'Mutare', 'Mutasa', 'Nyanga'],
  'Mashonaland Central': ['Bindura', 'Guruve', 'Mazowe', 'Mbire', 'Mount Darwin', 'Muzarabani', 'Rushinga', 'Shamva'],
  'Mashonaland East':    ['Chikomba', 'Goromonzi', 'Marondera', 'Mudzi', 'Murehwa', 'Mutoko', 'Seke', 'Uzumba-Maramba-Pfungwe', 'Wedza'],
  'Mashonaland West':    ['Chegutu', 'Hurungwe', 'Kariba', 'Makonde', 'Mhondoro-Ngezi', 'Sanyati', 'Zvimba'],
  'Masvingo':            ['Bikita', 'Chiredzi', 'Chivi', 'Gutu', 'Masvingo', 'Mwenezi', 'Zaka'],
  'Matabeleland North':  ['Binga', 'Bubi', 'Hwange', 'Lupane', 'Nkayi', 'Tsholotsho', 'Umguza'],
  'Matabeleland South':  ['Beitbridge', 'Bulilima', 'Gwanda', 'Insiza', 'Mangwe', 'Matobo', 'Umzingwane'],
  'Midlands':            ['Chirumhanzu', 'Gokwe North', 'Gokwe South', 'Kwekwe', 'Mberengwa', 'Shurugwi', 'Vungu', 'Zvishavane'],
}

const IRRIGATION_TYPES = ['Drip', 'Sprinkler', 'Flood / Furrow', 'Gravity-fed', 'Centre Pivot', 'None']

const fieldCss = `w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all bg-[var(--color-surface)] text-[var(--color-text-primary)]`

function Section({ icon, title, children }) {
  const [open, setOpen] = useState(true)
  const reduced = useReducedMotion()
  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left transition-colors"
        style={{ borderBottom: open ? '1px solid var(--color-border)' : 'none' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="text-gold">{icon}</div>
          <h2 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-text-primary)' }}>
            {title}
          </h2>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
          style={{ color: 'var(--color-text-muted)' }}
        >▾</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-5 space-y-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Row({ label, value }) {
  if (!value && value !== false) return null
  return (
    <div className="flex justify-between py-2.5 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
      <span className="text-xs uppercase tracking-wide font-semibold" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]" style={{ color: 'var(--color-text-primary)' }}>
        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
      </span>
    </div>
  )
}

function LockedRow({ label, value }) {
  return (
    <div className="flex justify-between py-2.5 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
      <span className="flex items-center gap-1 text-xs uppercase tracking-wide font-semibold" style={{ color: 'var(--color-text-muted)' }}>
        <Lock size={10} /> {label}
      </span>
      <span className="text-sm font-medium text-right max-w-[60%]" style={{ color: 'var(--color-text-primary)' }}>
        {value || '—'}
      </span>
    </div>
  )
}

function EditField({ label, children }) {
  return (
    <div className="flex flex-col gap-1 py-2 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
      <label className="text-xs uppercase tracking-wide font-semibold" style={{ color: 'var(--color-text-muted)' }}>{label}</label>
      {children}
    </div>
  )
}

function ProgressRing({ pct, size = 56, stroke = 5 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#c8a84b" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
    </svg>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, farmerProfile, setFarmerProfile } = useAuth()
  const [subDocs, setSubDocs] = useState({})
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editDraft, setEditDraft] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  async function fetchSubs() {
    if (!user) return
    const paths = [
      ['farmProfile', 'farmProfile'],
      ['infrastructure', 'infrastructure'],
      ['marketProfile', 'marketProfile'],
      ['empowerment', 'empowerment'],
    ]
    const results = await Promise.all(
      paths.map(([col, docId]) => getDoc(doc(db, 'farmers', user.uid, col, docId)))
    )
    const docs = {}
    paths.forEach(([col], i) => {
      docs[col] = results[i].exists() ? results[i].data() : {}
    })
    setSubDocs(docs)
    setLoading(false)
  }

  useEffect(() => { fetchSubs() }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" style={{ backgroundColor: 'var(--color-surface)' }}>
        <Spinner size="lg" />
      </div>
    )
  }

  const fp = farmerProfile || {}
  const farm = subDocs.farmProfile || {}
  const infra = subDocs.infrastructure || {}
  const market = subDocs.marketProfile || {}
  const empower = subDocs.empowerment || {}

  const initials = fp.fullName
    ? fp.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  let filled = 0
  if (fp.fullName) filled++
  if (fp.nationalId) filled++
  if (fp.location?.province) filled++
  if (fp.profileComplete) filled++
  if (fp.jvAgreementAccepted) filled++
  if (farm.farmingType) filled++
  const pct = Math.round((filled / 6) * 100)

  function startEdit() {
    setEditDraft({
      contact: fp.contact || '',
      province: fp.location?.province || '',
      district: fp.location?.district || '',
      crops: Array.isArray(farm.mainCrops) ? farm.mainCrops.join(', ') : (farm.mainCrops || ''),
      irrigationType: farm.irrigationType || '',
      equipmentDetails: infra.equipmentDetails || '',
    })
    setSaveError('')
    setIsEditing(true)
  }

  function cancelEdit() { setIsEditing(false); setSaveError('') }

  function set(key) {
    return (e) => setEditDraft(d => ({ ...d, [key]: e.target.value }))
  }

  async function saveEdit() {
    setSaving(true)
    setSaveError('')
    try {
      const crops = editDraft.crops
        .split(',').map(c => c.trim()).filter(Boolean)

      await Promise.all([
        setDoc(doc(db, 'farmers', user.uid), {
          contact: editDraft.contact,
          location: { province: editDraft.province, district: editDraft.district },
        }, { merge: true }),
        setDoc(doc(db, 'farmers', user.uid, 'farmProfile', 'farmProfile'), {
          mainCrops: crops,
          irrigationType: editDraft.irrigationType,
        }, { merge: true }),
        setDoc(doc(db, 'farmers', user.uid, 'infrastructure', 'infrastructure'), {
          equipmentDetails: editDraft.equipmentDetails,
        }, { merge: true }),
      ])

      // Refresh context and local state
      setFarmerProfile(prev => ({
        ...prev,
        contact: editDraft.contact,
        location: { province: editDraft.province, district: editDraft.district },
      }))
      setSubDocs(prev => ({
        ...prev,
        farmProfile: { ...prev.farmProfile, mainCrops: crops, irrigationType: editDraft.irrigationType },
        infrastructure: { ...prev.infrastructure, equipmentDetails: editDraft.equipmentDetails },
      }))
      setIsEditing(false)
    } catch {
      setSaveError('Save failed — please try again.')
    } finally {
      setSaving(false)
    }
  }

  const districts = PROVINCES[editDraft.province] || []

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-5">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-sm font-medium w-fit transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary-light)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* Profile header card */}
        <div
          className="glass-card p-6 overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #1a3a1f 0%, #294d2d 60%, #3d6b43 100%)' }}
        >
          <div className="flex items-center gap-5">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-cream flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)', border: '3px solid rgba(200,168,75,0.5)' }}
            >
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-cream truncate">{fp.fullName || '—'}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {fp.location?.province && (
                  <span className="flex items-center gap-1 text-sm" style={{ color: 'rgba(250,246,239,0.65)' }}>
                    <MapPin size={13} />{fp.location.province}
                  </span>
                )}
                {farm.farmingType && (
                  <span className="text-sm capitalize" style={{ color: 'rgba(250,246,239,0.65)' }}>
                    · {farm.farmingType} farming
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-2.5">
                {fp.jvAgreementAccepted ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: 'var(--gradient-gold)', color: '#1a1a1a' }}>
                    <CheckCircle2 size={11} /> JV Active
                  </span>
                ) : (
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-amber-500/25 text-amber-300">
                    Pending JV
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 flex-shrink-0 relative">
              <ProgressRing pct={pct} size={56} />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+8px)] text-xs font-bold text-cream">
                {pct}%
              </span>
              <span className="text-[10px]" style={{ color: 'rgba(250,246,239,0.5)' }}>complete</span>
            </div>
          </div>
        </div>

        {/* Edit / Save buttons */}
        {!isEditing ? (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={startEdit}>
              <Edit2 size={14} /> Edit Profile
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <Lock size={10} className="inline mr-1" /> Locked fields can only be changed by AEN staff.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={saving}>
                <XIcon size={14} /> Cancel
              </Button>
              <Button variant="primary" size="sm" loading={saving} onClick={saveEdit}>
                <Save size={14} /> Save
              </Button>
            </div>
          </div>
        )}

        {saveError && (
          <p className="text-sm rounded-xl px-4 py-3 text-red-600" style={{ backgroundColor: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)' }}>
            {saveError}
          </p>
        )}

        {/* Personal Details */}
        <Section icon={<User size={16} />} title="Personal Details">
          <LockedRow label="Full Name" value={fp.fullName} />
          <Row label="Gender"        value={fp.gender} />
          <Row label="Age"           value={fp.age} />
          <LockedRow label="National ID" value={fp.nationalId} />
          {isEditing ? (
            <>
              <EditField label="Contact Number">
                <input className={fieldCss} value={editDraft.contact} onChange={set('contact')} placeholder="+263 7X XXX XXXX" />
              </EditField>
              <EditField label="Province">
                <select className={fieldCss} value={editDraft.province} onChange={(e) => {
                  setEditDraft(d => ({ ...d, province: e.target.value, district: '' }))
                }}>
                  <option value="">Select province</option>
                  {Object.keys(PROVINCES).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </EditField>
              <EditField label="District">
                <select className={fieldCss} value={editDraft.district} onChange={set('district')}>
                  <option value="">Select district</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </EditField>
            </>
          ) : (
            <>
              <Row label="Contact"  value={fp.contact} />
              <Row label="District" value={fp.location?.district} />
              <Row label="Province" value={fp.location?.province} />
            </>
          )}
          <Row label="Family Size"   value={fp.familySize} />
          <Row label="Medical Aid"   value={fp.onMedicalAid} />
          <Row label="Funeral Policy" value={fp.onFuneralPolicy} />
        </Section>

        {/* Farm Profile */}
        <Section icon={<Sprout size={16} />} title="Farm Profile">
          <Row label="Land Ownership"        value={farm.landOwnership} />
          <Row label="Total Land Size"       value={farm.totalLandSize ? `${farm.totalLandSize} ha` : null} />
          <Row label="Land Under Production" value={farm.landUnderProduction ? `${farm.landUnderProduction} ha` : null} />
          <Row label="Farming Type"          value={farm.farmingType} />
          <Row label="Farming Method"        value={farm.farmingMethod} />
          <Row label="Years Experience"      value={farm.yearsExperience} />
          {isEditing ? (
            <>
              <EditField label="Crops (comma-separated)">
                <input className={fieldCss} value={editDraft.crops} onChange={set('crops')} placeholder="Maize, Tomatoes, Beans" />
              </EditField>
              <EditField label="Irrigation Type">
                <select className={fieldCss} value={editDraft.irrigationType} onChange={set('irrigationType')}>
                  <option value="">Select type</option>
                  {IRRIGATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </EditField>
            </>
          ) : (
            <>
              <Row label="Crops"     value={Array.isArray(farm.mainCrops) ? farm.mainCrops.join(', ') : farm.mainCrops} />
              <Row label="Irrigation" value={farm.irrigationType} />
            </>
          )}
          <Row label="Avg Yield / Season" value={farm.averageYieldPerSeason ? `${farm.averageYieldPerSeason} kg` : null} />
          <Row label="Water Access"       value={farm.waterAccess} />
          <Row label="Land Insured"       value={farm.landInsured} />
        </Section>

        {/* Infrastructure */}
        <Section icon={<Package size={16} />} title="Infrastructure">
          <Row label="Borehole"              value={infra.hasBorehole} />
          <Row label="Storage Facility"     value={infra.hasStorage} />
          <Row label="Fencing"              value={infra.hasFencing} />
          <Row label="Livestock Structures" value={infra.hasLivestockStructures} />
          <Row label="Worker Housing"       value={infra.hasWorkerHousing} />
          <Row label="Farm Equipment"       value={infra.hasEquipment} />
          {isEditing ? (
            <EditField label="Equipment Details">
              <textarea
                className={fieldCss}
                rows={3}
                value={editDraft.equipmentDetails}
                onChange={set('equipmentDetails')}
                placeholder="Describe your equipment: tractors, irrigation pipes, ploughs, etc."
              />
            </EditField>
          ) : (
            <Row label="Equipment Details" value={infra.equipmentDetails} />
          )}
        </Section>

        {/* Market Access */}
        <Section icon={<ShoppingBag size={16} />} title="Market Access">
          <Row label="Sells At"              value={market.currentSellLocations} />
          <Row label="Existing Buyers"       value={market.hasExistingBuyers} />
          <Row label="Marketing Challenges"  value={market.marketingChallenges} />
          <Row label="Commitment"            value={market.farmingCommitment} />
          <Row label="Labor Type"            value={market.laborType} />
          <Row label="Willing for JV"        value={market.willingForJV} />
          <Row label="Open to Training"      value={market.openToTraining} />
          {Array.isArray(market.assistanceNeeded) && market.assistanceNeeded.length > 0 && (
            <div className="py-2.5">
              <p className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Assistance Needed
              </p>
              <div className="flex flex-wrap gap-2">
                {market.assistanceNeeded.map((a) => <Badge key={a} variant="info">{a}</Badge>)}
              </div>
            </div>
          )}
        </Section>

        {/* Empowerment */}
        <Section icon={<Shield size={16} />} title="Empowerment">
          <div className="flex flex-wrap gap-2 pt-1">
            {empower.isYouthFarmer && <Badge variant="success">Youth Farmer</Badge>}
            {empower.isWomanFarmer && <Badge variant="info">Woman Farmer</Badge>}
            {empower.isPreviouslyDisadvantaged && <Badge variant="warning">Previously Disadvantaged</Badge>}
            {!empower.isYouthFarmer && !empower.isWomanFarmer && !empower.isPreviouslyDisadvantaged && (
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No empowerment flags recorded</span>
            )}
          </div>
        </Section>

        {/* JV Declaration — locked */}
        {fp.jvAgreementAccepted && (
          <div className="glass-card p-5 flex items-center gap-3">
            <Lock size={16} className="text-gold flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>JV Agreement Accepted</p>
              {fp.jvAgreementDate && (
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Signed: {fp.jvAgreementDate?.toDate?.()?.toLocaleDateString() ?? '—'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
