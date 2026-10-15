import { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import { Download, Mail } from 'lucide-react'

function fmtDate(ts) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' })
}

function exportCSV(subscribers) {
  const rows = [
    ['Email', 'Name', 'Subscribed'],
    ...subscribers.map(s => [s.email, s.name || '', fmtDate(s.subscribedAt)]),
  ]
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `aen-newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(
          query(collection(db, 'newsletter'), orderBy('subscribedAt', 'desc'))
        )
        setSubscribers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch {
        // collection may be empty — show empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = subscribers.filter(s =>
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Newsletter Subscribers</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            {loading ? 'Loading…' : `${subscribers.length} subscriber${subscribers.length === 1 ? '' : 's'}`}
          </p>
        </div>
        {!loading && subscribers.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => exportCSV(subscribers)}>
            <Download size={14} /> Export CSV
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Spinner size="lg" color="green" />
        </div>
      ) : subscribers.length === 0 ? (
        <div className="bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] p-10 flex flex-col items-center text-center gap-4">
          <Mail size={40} className="text-[var(--color-text-muted)]" />
          <p className="font-semibold text-[var(--color-text-secondary)]">No subscribers yet</p>
          <p className="text-[var(--color-text-muted)] text-sm max-w-xs">
            Subscribers will appear here once farmers sign up on the Newsletter page.
          </p>
        </div>
      ) : (
        <div className="bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center gap-3">
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by email or name…"
              className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/40 focus:border-[var(--color-gold)] transition-colors"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="text-[var(--color-text-muted)] text-sm text-center py-10">No results for "{search}"</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-surface)] text-[var(--color-text-muted)] uppercase text-xs">
                  <tr>
                    {['Email', 'Name', 'Subscribed'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {filtered.map(sub => (
                    <tr key={sub.id} className="hover:bg-[var(--color-surface)] transition-colors">
                      <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{sub.email}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{sub.name || <span className="text-[var(--color-text-muted)] italic">—</span>}</td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)]">{fmtDate(sub.subscribedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
