// TODO Phase 3 — inline editing
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import Spinner from '../../components/ui/Spinner'
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'

const Section = ({ title, data }) => {
  const [open, setOpen] = useState(false)
  if (!data) return null
  const entries = Object.entries(data).filter(([k]) => k !== 'uid')
  return (
    <div className="bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[var(--color-surface)] transition-colors"
      >
        <span className="font-semibold text-[var(--color-text-primary)]">{title}</span>
        {open ? <ChevronUp size={18} className="text-[var(--color-text-muted)]" /> : <ChevronDown size={18} className="text-[var(--color-text-muted)]" />}
      </button>
      {open && (
        <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 border-t border-[var(--color-border)] pt-4">
          {entries.length === 0 ? (
            <p className="text-[var(--color-text-muted)] text-sm col-span-2">No data recorded.</p>
          ) : entries.map(([key, value]) => (
            <div key={key}>
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
              <p className="text-sm text-[var(--color-text-primary)] mt-0.5">
                {value === null || value === undefined
                  ? '—'
                  : typeof value === 'boolean'
                  ? (value ? 'Yes' : 'No')
                  : typeof value === 'object' && value?.toDate
                  ? value.toDate().toLocaleDateString()
                  : typeof value === 'object'
                  ? JSON.stringify(value)
                  : String(value)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminFarmerDetail() {
  const { uid } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [farmer, setFarmer] = useState(null)
  const [subs, setSubs] = useState({})

  useEffect(() => {
    const base = doc(db, 'farmers', uid)
    const subNames = ['farmProfile', 'infrastructure', 'marketProfile', 'empowerment']

    Promise.all([
      getDoc(base),
      ...subNames.map(s => getDoc(doc(db, 'farmers', uid, s, s))),
    ]).then(([mainSnap, ...subSnaps]) => {
      setFarmer(mainSnap.exists() ? mainSnap.data() : null)
      const subData = {}
      subNames.forEach((name, i) => {
        subData[name] = subSnaps[i].exists() ? subSnaps[i].data() : null
      })
      setSubs(subData)
      setLoading(false)
    })
  }, [uid])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" color="green" />
      </div>
    )
  }

  if (!farmer) {
    return (
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/admin/farmers')} className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Farmers
        </button>
        <p className="text-[var(--color-text-muted)]">Farmer not found.</p>
      </div>
    )
  }

  const declarationInfo = {
    jvAgreementAccepted: farmer.jvAgreementAccepted,
    jvAgreementDate: farmer.jvAgreementDate,
    profileComplete: farmer.profileComplete,
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <button onClick={() => navigate('/admin/farmers')} className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm transition-colors">
        <ArrowLeft size={16} /> Back to Farmers
      </button>

      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{farmer.fullName ?? 'Farmer Detail'}</h1>
        <p className="text-[var(--color-text-muted)] text-sm font-mono">{uid}</p>
      </div>

      <Section title="Personal Details" data={{
        fullName: farmer.fullName,
        gender: farmer.gender,
        age: farmer.age,
        nationalId: farmer.nationalId,
        contact: farmer.contact,
        familySize: farmer.familySize,
        province: farmer.location?.province,
        district: farmer.location?.district,
        onMedicalAid: farmer.onMedicalAid,
        onFuneralPolicy: farmer.onFuneralPolicy,
      }} />
      <Section title="Farm Profile" data={subs.farmProfile} />
      <Section title="Production Capacity" data={subs.farmProfile ? { productionCapacity: subs.farmProfile.productionCapacity } : null} />
      <Section title="Infrastructure" data={subs.infrastructure} />
      <Section title="Market Access" data={subs.marketProfile} />
      <Section title="Commitment & Empowerment" data={subs.empowerment} />
      <Section title="Declaration Status" data={declarationInfo} />
    </div>
  )
}
