import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'

function fmtDate(ts) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminPrices() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      // Fetch all markets then their weeks in parallel
      const marketsSnap = await getDocs(collection(db, 'produce-markets'))
      const markets = marketsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

      const weeksByMarket = await Promise.all(
        markets.map(m =>
          getDocs(query(collection(db, 'markets-prices', m.id, 'weeks'), orderBy('dateOfIssue', 'desc')))
            .then(snap => snap.docs.map(d => ({
              compoundId:  `${m.id}___${d.id}`,
              marketId:    m.id,
              weekId:      d.id,
              marketName:  m.name || m.id,
              ...d.data(),
            })))
            .catch(() => [])
        )
      )

      const all = weeksByMarket.flat().sort((a, b) => {
        const at = a.dateOfIssue?.toMillis?.() ?? 0
        const bt = b.dateOfIssue?.toMillis?.() ?? 0
        return bt - at
      })

      setPrices(all)
    } catch {
      showToast('Failed to load price data.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (compoundId) => {
    const [marketId, weekId] = compoundId.split('___')
    try {
      await deleteDoc(doc(db, 'markets-prices', marketId, 'weeks', weekId))
      setPrices(prev => prev.filter(p => p.compoundId !== compoundId))
      showToast('Price week deleted.')
    } catch {
      showToast('Failed to delete.', 'error')
    } finally {
      setConfirmDelete(null)
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Price Index — Admin</h1>
          <p className="text-[var(--color-text-muted)] text-sm">{prices.length} published week{prices.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/admin/prices/new')}>
          <Plus size={16} className="inline mr-1" /> Publish New Week
        </Button>
      </div>

      <div className="bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] overflow-hidden">
        {prices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-4">
            <p className="text-[var(--color-text-muted)] text-sm">
              No price data published yet.<br />
              <span className="text-[var(--color-text-muted)]">Click "Publish New Week" to start.</span>
            </p>
            <Button variant="primary" onClick={() => navigate('/admin/prices/new')}>
              <Plus size={16} className="inline mr-1" /> Publish New Week
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface)] text-[var(--color-text-muted)] uppercase text-xs">
                <tr>
                  {['Market', 'Week Label', 'Date Published', 'Commodities', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {prices.map(p => (
                  <tr key={p.compoundId} className="hover:bg-[var(--color-surface)] transition-colors">
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)] whitespace-nowrap">{p.marketName}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{p.weekLabel ?? '—'}</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)] whitespace-nowrap">{fmtDate(p.dateOfIssue)}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{p.prices?.length ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/prices/${p.compoundId}/edit`)}
                          className="p-1.5 rounded hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(p.compoundId)}
                          className="p-1.5 rounded hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                          title="Delete"
                        >
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

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface-2)] rounded-2xl p-6 max-w-sm w-full shadow-xl border border-[var(--color-border)]">
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">Delete price week?</h3>
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
