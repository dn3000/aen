import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'
import Spinner from '../../components/ui/Spinner'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 20

export default function AdminFarmers() {
  const navigate = useNavigate()
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  useEffect(() => {
    getDocs(collection(db, 'farmers')).then(snap => {
      const sorted = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
      setFarmers(sorted)
      setLoading(false)
    })
  }, [])

  const filtered = farmers.filter(f => {
    const q = search.toLowerCase()
    return (
      f.fullName?.toLowerCase().includes(q) ||
      f.location?.province?.toLowerCase().includes(q)
    )
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" color="green" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Farmers</h1>
          <p className="text-[var(--color-text-muted)] text-sm">{filtered.length} records</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            placeholder="Search by name or province…"
            className="pl-9 pr-4 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/40 focus:border-[var(--color-gold)] w-64 transition-colors"
          />
        </div>
      </div>

      <div className="bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] overflow-hidden">
        {paginated.length === 0 ? (
          <p className="text-[var(--color-text-muted)] text-sm text-center py-16">
            {search ? 'No farmers match your search.' : 'No farmers registered yet.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface)] text-[var(--color-text-muted)] uppercase text-xs">
                <tr>
                  {['Full Name', 'National ID', 'Province', 'Farming Type', 'Profile', 'JV Accepted', 'Joined', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {paginated.map(f => (
                  <tr key={f.id} className="hover:bg-[var(--color-surface)] transition-colors">
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)] whitespace-nowrap">{f.fullName ?? '—'}</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)] font-mono text-xs">{f.nationalId ?? '—'}</td>
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
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        f.jvAgreementAccepted
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                          : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
                      }`}>
                        {f.jvAgreementAccepted ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)] whitespace-nowrap">
                      {f.createdAt?.toDate ? f.createdAt.toDate().toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/admin/farmers/${f.id}`)}
                        className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-medium text-xs underline transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-[var(--color-text-muted)]">
          <span>Page {page + 1} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="p-1.5 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] disabled:opacity-40 hover:bg-[var(--color-surface)] transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] disabled:opacity-40 hover:bg-[var(--color-surface)] transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
