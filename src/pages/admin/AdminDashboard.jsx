import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, orderBy, limit, doc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import { Users, Store, BarChart2, Calendar, Plus, ShieldCheck } from 'lucide-react'

const StatCard = ({ label, value, icon: Icon, color }) => {
  const isLongString = typeof value === 'string' && value !== '—' && value.length > 6
  return (
    <div className="bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg flex-shrink-0 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[var(--color-text-muted)] font-medium">{label}</p>
        <p className={`font-bold text-[var(--color-text-primary)] ${isLongString ? 'text-base leading-snug mt-0.5' : 'text-2xl'}`}>
          {value ?? '—'}
        </p>
        {typeof value === 'number' && value === 0 && (
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">No data yet</p>
        )}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, complete: 0, activeListings: 0, latestWeek: '—' })
  const [recent, setRecent] = useState([])
  const [grantUid, setGrantUid] = useState('')
  const [granting, setGranting] = useState(false)
  const [grantMsg, setGrantMsg] = useState('')

  async function handleGrantAdmin() {
    const uid = grantUid.trim()
    if (!uid) return
    setGranting(true)
    setGrantMsg('')
    try {
      await setDoc(doc(db, 'farmers', uid), { role: 'admin' }, { merge: true })
      setGrantMsg(`✓ Admin role granted to ${uid}`)
      setGrantUid('')
    } catch {
      setGrantMsg('Failed — check the UID and try again.')
    } finally {
      setGranting(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      const [farmersSnap, marketsSnap, pricesSnap] = await Promise.all([
        getDocs(collection(db, 'farmers')),
        getDocs(collection(db, 'markets')),
        getDocs(query(collection(db, 'markets-prices', 'mbare-musika', 'weeks'), orderBy('dateOfIssue', 'desc'), limit(1))),
      ])

      const farmers = farmersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      const complete = farmers.filter(f => f.profileComplete).length
      const activeListings = marketsSnap.docs.filter(d => d.data().active).length
      const latestWeek = pricesSnap.empty ? '—' : pricesSnap.docs[0].data().weekLabel ?? '—'

      const sorted = [...farmers].sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() ?? 0
        const bTime = b.createdAt?.toMillis?.() ?? 0
        return bTime - aTime
      }).slice(0, 10)

      setStats({ total: farmers.length, complete, activeListings, latestWeek })
      setRecent(sorted)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" color="green" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Admin Overview</h1>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">AEN platform at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Farmers" value={stats.total} icon={Users} color="bg-green-primary" />
        <StatCard label="Profile Complete" value={stats.complete} icon={Users} color="bg-green-light" />
        <StatCard label="Active Listings" value={stats.activeListings} icon={Store} color="bg-gold-primary" />
        <StatCard label="Latest Price Week" value={stats.latestWeek} icon={Calendar} color="bg-[var(--color-text-secondary)]" />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="primary" className="whitespace-nowrap" onClick={() => navigate('/admin/markets/new')}>
          <Plus size={16} className="inline mr-1" /> Add Market Listing
        </Button>
        <Button variant="secondary" className="whitespace-nowrap" onClick={() => navigate('/admin/prices/new')}>
          <BarChart2 size={16} className="inline mr-1" /> Publish Price Index
        </Button>
      </div>

      {/* Grant Admin Access */}
      <div className="bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={18} className="text-[var(--color-text-primary)]" />
          <h2 className="font-semibold text-[var(--color-text-primary)]">Grant Admin Access</h2>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mb-3">
          Enter a farmer's UID (from Firebase Auth or the farmers table) to grant them admin access.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={grantUid}
            onChange={(e) => setGrantUid(e.target.value)}
            placeholder="Paste farmer UID here"
            className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/40 focus:border-[var(--color-gold)]"
          />
          <Button variant="primary" size="sm" loading={granting} onClick={handleGrantAdmin}>
            Grant
          </Button>
        </div>
        {grantMsg && (
          <p className={`text-xs mt-2 ${grantMsg.startsWith('✓') ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {grantMsg}
          </p>
        )}
      </div>

      <div className="bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="font-semibold text-[var(--color-text-primary)]">Recent Registrations</h2>
        </div>
        {recent.length === 0 ? (
          <p className="text-[var(--color-text-muted)] text-sm text-center py-10">No farmers registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface)] text-[var(--color-text-muted)] uppercase text-xs">
                <tr>
                  {['Full Name', 'Province', 'Farming Type', 'Profile', 'Joined'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {recent.map(f => (
                  <tr key={f.id} className="hover:bg-[var(--color-surface)] transition-colors">
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{f.fullName ?? '—'}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{f.location?.province ?? '—'}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{f.farmingType ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        f.profileComplete
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                      }`}>
                        {f.profileComplete ? 'Complete' : 'Incomplete'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {f.createdAt?.toDate ? f.createdAt.toDate().toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
