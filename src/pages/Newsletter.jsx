import { useState } from 'react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { FileText, Download, CheckCircle } from 'lucide-react'
import { db } from '../firebase'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

// TODO Phase 3: link to real issue URLs and PDF downloads
const issues = [
  {
    title: 'May 2026 — Market Outlook & New JV Opportunities',
    date: 'May 2026',
    summary: "This month's outlook covers commodity price trends for Q3, two new JV openings in Mashonaland West, and a special feature on contract farming.",
  },
  {
    title: 'April 2026 — Tobacco Season Review + Vegetable Prices',
    date: 'April 2026',
    summary: 'A full review of the 2026 tobacco selling season, analysis of vegetable price movements, and practical tips for post-harvest storage.',
  },
  {
    title: 'March 2026 — Youth Farmer Spotlight + Input Financing',
    date: 'March 2026',
    summary: 'Profiles of three outstanding youth AEN farmers, plus a guide to accessing Agribank input loans through the AEN verified farmer programme.',
  },
]

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubscribe(e) {
    e.preventDefault()
    const trimEmail = email.trim()
    if (!trimEmail) return
    setSubmitting(true)
    setError('')
    try {
      await setDoc(doc(db, 'newsletter', trimEmail), {
        email: trimEmail,
        name: name.trim() || null,
        subscribedAt: serverTimestamp(),
      }, { merge: true })
      setSubmitted(true)
      setEmail('')
      setName('')
    } catch {
      setError('Could not subscribe — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            AEN Newsletter
          </h1>
          <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Market prices, funding opportunities, and farmer stories — delivered to your inbox every week.
          </p>
        </div>

        {/* Past Issues */}
        <section className="mb-12">
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <span className="w-1 h-5 rounded-full inline-block" style={{ background: 'var(--gradient-gold)' }} />
            Past Issues
          </h2>
          <div className="space-y-4">
            {issues.map(({ title, date, summary }, i) => (
              <div key={title} className="glass-card p-5">
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                    style={{ background: 'var(--gradient-gold)', color: '#1a1a1a' }}
                  >
                    {String(issues.length - i).padStart(2, '0')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm leading-snug mb-1" style={{ color: 'var(--color-text-primary)' }}>
                      {title}
                    </h3>
                    <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>{date}</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{summary}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 ml-13">
                  <a href="#">
                    <Button variant="outline" size="sm">Read Issue</Button>
                  </a>
                  <a href="#">
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <Download size={13} />
                      Download PDF
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Subscribe */}
        <section
          className="glass-card p-8"
          style={{ borderLeft: '4px solid var(--color-gold)' }}
        >
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Stay Informed
          </h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Get the AEN Weekly Newsletter delivered to your inbox — market prices, funding opportunities, and farmer stories.
          </p>

          {submitted ? (
            <div
              className="flex items-center gap-3 rounded-xl px-5 py-4"
              style={{ backgroundColor: 'rgba(45,122,58,0.1)', border: '1px solid rgba(45,122,58,0.25)' }}
            >
              <CheckCircle size={20} className="text-green-primary flex-shrink-0" />
              <p className="text-sm font-medium text-green-primary">
                You're subscribed! Watch your inbox for the next issue.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="sm:flex-1"
                />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="sm:flex-1"
                />
              </div>
              {error && (
                <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>
              )}
              <Button type="submit" variant="primary" loading={submitting} className="sm:self-start">
                Subscribe Free
              </Button>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
