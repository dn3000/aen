import { useEffect, useState } from 'react'
import { collection, getDocs, query, where, orderBy, updateDoc, doc } from 'firebase/firestore'
import { ShoppingCart, MapPin, Phone, Package, Tag, Mail, Globe, Plus, Search, Trash2, MessageCircle, Users, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import PostListingModal from '../components/marketplace/PostListingModal'

function timeAgo(ts) {
  if (!ts?.toMillis) return ''
  const secs = Math.floor((Date.now() - ts.toMillis()) / 1000)
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function waLink(phone) {
  const digits = phone.replace(/[^0-9]/g, '').replace(/^2630/, '263')
  return `https://wa.me/${digits}`
}

const ListingRow = ({ listing, currentUid, onDelete }) => (
  <motion.div
    className="glass-card p-4 relative overflow-hidden transition-shadow"
    style={{
      borderLeft: `4px solid ${listing.type === 'selling' ? '#3d6b43' : '#e05c5c'}`,
    }}
    whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
    transition={{ duration: 0.15 }}
  >
    {listing.uid === currentUid && (
      <button
        onClick={onDelete}
        className="absolute top-3 right-3 p-1 rounded-lg transition-colors"
        style={{ color: 'var(--color-text-muted)' }}
        title="Remove listing"
        onMouseEnter={e => e.currentTarget.style.color = '#e05c5c'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
      >
        <Trash2 size={13} />
      </button>
    )}

    <div className="flex items-center gap-2 mb-2 pr-6">
      <span
        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0"
        style={
          listing.type === 'selling'
            ? { background: 'rgba(61,107,67,0.15)', color: 'var(--color-success)' }
            : { background: 'rgba(224,92,92,0.15)', color: '#e05c5c' }
        }
      >
        {listing.type === 'selling' ? 'Selling' : 'Buying'}
      </span>
      <span className="font-bold text-sm flex-1 truncate" style={{ color: 'var(--color-text-primary)' }}>
        {listing.commodity}
      </span>
      <span className="text-sm font-semibold whitespace-nowrap gradient-text">
        {listing.quantity} {listing.unit}
      </span>
    </div>

    {listing.description && (
      <p className="text-xs italic mb-2 leading-tight" style={{ color: 'var(--color-text-secondary)' }}>
        {listing.description}
      </p>
    )}

    <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: 'var(--color-text-muted)' }}>
      <span className="flex items-center gap-1 shrink-0">
        <MapPin size={11} />{listing.location}
      </span>
      <a
        href={waLink(listing.contactPhone)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 font-medium shrink-0 transition-colors hover:text-green-primary"
        style={{ color: 'var(--color-success)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <MessageCircle size={11} />{listing.contactPhone}
      </a>
      <span className="ml-auto shrink-0">{timeAgo(listing.createdAt)}</span>
    </div>
  </motion.div>
)

const MarketCard = ({ market }) => (
  <div className="glass-card overflow-hidden">
    <div
      className="h-2 w-full"
      style={{ background: 'var(--gradient-hero)' }}
    />
    <div className="p-5">
      <div className="flex items-start justify-between gap-2 mb-3 flex-wrap">
        <h2 className="text-lg font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
          {market.buyerName}
        </h2>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="info">{market.companyType}</Badge>
          <Badge variant="success">Verified ✓</Badge>
        </div>
      </div>

      {market.description && (
        <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          {market.description}
        </p>
      )}

      {market.commodities?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {market.commodities.map((c) => (
            <span
              key={c}
              className="text-xs rounded-full px-2.5 py-0.5 border"
              style={{
                borderColor: 'var(--color-gold)',
                color: 'var(--color-gold)',
                backgroundColor: 'rgba(200,168,75,0.08)',
              }}
            >
              {c}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Package size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Quantity:</span>
          <span style={{ color: 'var(--color-text-primary)' }}>{market.quantityRequired} {market.unit}</span>
        </div>
        <div className="flex items-center gap-2">
          <Tag size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Price:</span>
          {market.pricePerUnit != null
            ? <span className="font-semibold gradient-text">${market.pricePerUnit} / {market.unit}</span>
            : <span className="italic" style={{ color: 'var(--color-text-muted)' }}>Price on request</span>}
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Location:</span>
          <span style={{ color: 'var(--color-text-primary)' }}>{market.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Phone:</span>
          <span style={{ color: 'var(--color-text-primary)' }}>{market.contactPhone}</span>
        </div>
        {market.contactEmail && (
          <div className="flex items-center gap-2">
            <Mail size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Email:</span>
            <span className="truncate" style={{ color: 'var(--color-text-primary)' }}>{market.contactEmail}</span>
          </div>
        )}
        {market.website && (
          <div className="flex items-center gap-2">
            <Globe size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Web:</span>
            <a
              href={market.website}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate hover:underline"
              style={{ color: 'var(--color-primary-light)' }}
            >
              {market.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
      </div>
    </div>
  </div>
)

export default function Marketplace() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const showToast = useToast()
  const reduced = useReducedMotion()

  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState([])
  const [listingsLoading, setListingsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [listingFilter, setListingFilter] = useState('All')
  const [listingSearch, setListingSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(20)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'markets'), where('active', '==', true)))
        setMarkets(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch { /* permissions not yet set */ }
      finally { setLoading(false) }
    }
    fetchMarkets()
  }, [])

  const fetchListings = async () => {
    setListingsLoading(true)
    try {
      const snap = await getDocs(query(collection(db, 'listings'), orderBy('createdAt', 'desc')))
      setListings(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((l) => l.active !== false))
    } catch { /* permissions — add Firestore rules for /listings */ }
    finally { setListingsLoading(false) }
  }

  useEffect(() => { fetchListings() }, [])

  const handlePostListing = () => {
    if (!user) {
      showToast('Please log in to post a listing.')
      navigate('/login')
      return
    }
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    try {
      await updateDoc(doc(db, 'listings', id), { active: false })
      setListings((prev) => prev.filter((l) => l.id !== id))
      showToast('Listing removed.')
    } catch {
      showToast('Failed to remove listing.', 'error')
    } finally {
      setConfirmDeleteId(null)
    }
  }

  const filteredListings = listings
    .filter((l) => listingFilter === 'All' || l.type === listingFilter.toLowerCase())
    .filter((l) => !listingSearch ||
      l.commodity?.toLowerCase().includes(listingSearch.toLowerCase()) ||
      l.location?.toLowerCase().includes(listingSearch.toLowerCase())
    )

  const visibleListings = filteredListings.slice(0, visibleCount)

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* ── Section A: Live Farmer Listings ──────────────────────────── */}
        <div className="mb-10">
          <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Live Listings
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                AEN farmers buying and selling produce
              </p>
            </div>
            {/* Desktop post button */}
            <button
              onClick={handlePostListing}
              className="hidden md:flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold shrink-0 transition-all hover:brightness-105 hover:scale-[1.02]"
              style={{ background: 'var(--gradient-gold)', color: '#1a1a1a' }}
            >
              <Plus size={15} /> Post a Listing
            </button>
          </div>

          {/* Filters + Search */}
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex gap-2 flex-wrap">
              {['All', 'Selling', 'Buying'].map((f) => (
                <button
                  key={f}
                  onClick={() => setListingFilter(f)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
                  style={
                    listingFilter === f
                      ? { background: 'var(--gradient-gold)', color: '#1a1a1a', border: 'none' }
                      : { backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }
                  }
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search commodity or location..."
                value={listingSearch}
                onChange={(e) => setListingSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border)',
                }}
              />
              {listingSearch && (
                <button onClick={() => setListingSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={13} style={{ color: 'var(--color-text-muted)' }} />
                </button>
              )}
            </div>
          </div>

          {listingsLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : filteredListings.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Users size={32} style={{ color: 'var(--color-text-muted)' }} className="mb-3" />
              <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>No listings yet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Be the first — click "Post a Listing"</p>
            </div>
          ) : (
            <motion.div
              className="space-y-3"
              initial={reduced ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
            >
              {visibleListings.map((l) => (
                <ListingRow
                  key={l.id}
                  listing={l}
                  currentUid={user?.uid}
                  onDelete={() => setConfirmDeleteId(l.id)}
                />
              ))}
              {filteredListings.length > visibleCount && (
                <button
                  onClick={() => setVisibleCount((c) => c + 20)}
                  className="w-full py-2.5 text-sm font-medium rounded-xl border transition-colors"
                  style={{
                    color: 'var(--color-primary-light)',
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-surface-2)',
                  }}
                >
                  Load more ({filteredListings.length - visibleCount} remaining)
                </button>
              )}
            </motion.div>
          )}
        </div>

        <div className="my-8" style={{ borderTop: '1px solid var(--color-border)' }} />

        {/* ── Section B: Verified Buyers ───────────────────────────────── */}
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Verified Buyers & Offtakers
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            Established companies actively sourcing produce
          </p>

          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : markets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full p-5 mb-4" style={{ background: 'rgba(41,77,45,0.08)' }}>
                <ShoppingCart size={36} style={{ color: 'var(--color-primary)' }} />
              </div>
              <p className="font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                No verified buyers right now
              </p>
              <p className="text-sm max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
                Check back soon — new buyer opportunities are posted regularly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {markets.map((market) => <MarketCard key={market.id} market={market} />)}
            </div>
          )}

          <p className="text-center text-xs mt-8" style={{ color: 'var(--color-text-muted)' }}>
            New opportunities are added weekly.
          </p>
        </div>

        {/* Confirm delete modal */}
        <AnimatePresence>
          {confirmDeleteId && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="glass-card p-6 max-w-sm w-full"
                style={{ backgroundColor: 'var(--color-surface)' }}
                initial={reduced ? {} : { scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={reduced ? {} : { scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Remove this listing?
                </h3>
                <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
                  It will be hidden from the feed.
                </p>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
                  <button
                    onClick={() => handleDelete(confirmDeleteId)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-xl text-sm transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <PostListingModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchListings() }}
        />
      </div>

      {/* Mobile floating post button — above MobileNav */}
      <button
        onClick={handlePostListing}
        className="md:hidden fixed right-4 z-30 flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-all hover:brightness-105"
        style={{
          bottom: 'calc(80px + env(safe-area-inset-bottom) + 16px)',
          background: 'var(--gradient-gold)',
          color: '#1a1a1a',
        }}
      >
        <Plus size={15} /> Post Listing
      </button>
    </div>
  )
}
