import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'

function timeAgo(ts) {
  if (!ts?.toMillis) return '—'
  const secs = Math.floor((Date.now() - ts.toMillis()) / 1000)
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const Toggle = ({ active, loading, onToggle }) => (
  <button
    onClick={onToggle}
    disabled={loading}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
      active ? 'bg-green-primary' : 'bg-[var(--color-text-muted)]/50'
    } ${loading ? 'opacity-50' : ''}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
      active ? 'translate-x-4' : 'translate-x-0.5'
    }`} />
  </button>
)

export default function AdminMarkets() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [activeTab, setActiveTab] = useState('buyers')

  // Buyer markets state
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  // Farmer listings state
  const [farmerListings, setFarmerListings] = useState([])
  const [listingsLoading, setListingsLoading] = useState(false)
  const [togglingListingId, setTogglingListingId] = useState(null)

  const loadMarkets = () =>
    getDocs(collection(db, 'markets')).then((snap) => {
      setMarkets(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })

  const loadListings = async () => {
    setListingsLoading(true)
    try {
      const snap = await getDocs(query(collection(db, 'listings'), orderBy('createdAt', 'desc')))
      setFarmerListings(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch {
      showToast('Could not load listings — check Firestore rules.', 'error')
    } finally {
      setListingsLoading(false)
    }
  }

  useEffect(() => { loadMarkets() }, [])
  useEffect(() => { if (activeTab === 'listings' && farmerListings.length === 0) loadListings() }, [activeTab]) // eslint-disable-line

  const toggleActive = async (market) => {
    setTogglingId(market.id)
    try {
      await updateDoc(doc(db, 'markets', market.id), { active: !market.active })
      setMarkets((prev) => prev.map((m) => m.id === market.id ? { ...m, active: !m.active } : m))
      showToast(`Listing ${market.active ? 'deactivated' : 'activated'}.`)
    } catch {
      showToast('Failed to update listing.', 'error')
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'markets', id))
      setMarkets((prev) => prev.filter((m) => m.id !== id))
      showToast('Listing deleted.')
    } catch {
      showToast('Failed to delete listing.', 'error')
    } finally {
      setConfirmDelete(null)
    }
  }

  const toggleListingActive = async (listing) => {
    setTogglingListingId(listing.id)
    try {
      await updateDoc(doc(db, 'listings', listing.id), { active: !listing.active })
      setFarmerListings((prev) => prev.map((l) => l.id === listing.id ? { ...l, active: !l.active } : l))
      showToast(`Listing ${listing.active ? 'deactivated' : 'activated'}.`)
    } catch {
      showToast('Failed to update listing.', 'error')
    } finally {
      setTogglingListingId(null)
    }
  }

  const tabs = [
    { id: 'buyers', label: 'Buyer Markets' },
    { id: 'listings', label: 'Farmer Listings' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Markets</h1>
          <p className="text-[var(--color-text-muted)] text-sm">{activeTab === 'buyers' ? `${markets.length} buyer listings` : `${farmerListings.length} farmer listings`}</p>
        </div>
        {activeTab === 'buyers' && (
          <Button variant="primary" onClick={() => navigate('/admin/markets/new')}>
            <Plus size={16} className="inline mr-1" /> Add New Listing
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--color-border)]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === t.id
                ? 'border-green-primary text-[var(--color-text-primary)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Buyer Markets tab ── */}
      {activeTab === 'buyers' && (
        <div className="bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48"><Spinner size="lg" color="green" /></div>
          ) : markets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-4">
              <p className="text-[var(--color-text-muted)] text-sm">No market listings yet.</p>
              <Button variant="primary" onClick={() => navigate('/admin/markets/new')}>
                <Plus size={16} className="inline mr-1" /> Add New Listing
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-surface)] text-[var(--color-text-muted)] uppercase text-xs">
                  <tr>
                    {['Buyer / Org', 'Commodities', 'Qty Required', 'Location', 'Active', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {markets.map((m) => (
                    <tr key={m.id} className="hover:bg-[var(--color-surface)] transition-colors">
                      <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{m.buyerName ?? '—'}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        {Array.isArray(m.commodities) && m.commodities.length > 0
                          ? <>
                              {m.commodities.slice(0, 2).join(', ')}
                              {m.commodities.length > 2 && <span className="text-[var(--color-text-muted)]"> +{m.commodities.length - 2}</span>}
                            </>
                          : m.commodity ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)] whitespace-nowrap">
                        {(m.quantityRequired ?? m.quantity)
                          ? `${m.quantityRequired ?? m.quantity} ${m.unit ?? ''}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{m.location ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Toggle active={m.active} loading={togglingId === m.id} onToggle={() => toggleActive(m)} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => navigate(`/admin/markets/${m.id}/edit`)} className="p-1.5 rounded hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setConfirmDelete(m.id)} className="p-1.5 rounded hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Farmer Listings tab ── */}
      {activeTab === 'listings' && (
        <div className="bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] overflow-hidden">
          {listingsLoading ? (
            <div className="flex items-center justify-center h-48"><Spinner size="lg" color="green" /></div>
          ) : farmerListings.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-[var(--color-text-muted)] text-sm">No farmer listings yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-surface)] text-[var(--color-text-muted)] uppercase text-xs">
                  <tr>
                    {['Type', 'Farmer', 'Commodity', 'Qty', 'Location', 'Phone', 'Posted', 'Active'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {farmerListings.map((l) => (
                    <tr key={l.id} className={`hover:bg-[var(--color-surface)] transition-colors ${!l.active ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          l.type === 'selling'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                            : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                        }`}>
                          {l.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-[var(--color-text-primary)] whitespace-nowrap">{l.fullName ?? '—'}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{l.commodity ?? '—'}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)] whitespace-nowrap">{l.quantity ? `${l.quantity} ${l.unit ?? ''}` : '—'}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{l.location ?? '—'}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)] whitespace-nowrap">{l.contactPhone ?? '—'}</td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)] whitespace-nowrap">{timeAgo(l.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Toggle active={l.active} loading={togglingListingId === l.id} onToggle={() => toggleListingActive(l)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface-2)] rounded-2xl p-6 max-w-sm w-full shadow-xl border border-[var(--color-border)]">
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">Delete listing?</h3>
            <p className="text-[var(--color-text-muted)] text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
