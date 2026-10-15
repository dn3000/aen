import { Link } from 'react-router-dom'
import { Shield, Phone, Users, ArrowRight, Eye, Target, Zap } from 'lucide-react'

const farmerValues = [
  'Real-time weather intelligence for informed decision-making',
  'Data-driven production management support',
  'Access to verified and competitive markets',
  'Transparent market pricing insights',
  'Access to investment and growth opportunities',
]

const buyerValues = [
  'Full traceability from farm to market',
  'Guaranteed fresh, organic, and high-quality produce',
  'Reliable, efficient, and consistent supply chains',
  'Transparency through live supply chain reporting',
]

export default function About() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/icons/aen-logohandsbrwn.svg" alt="AEN" className="h-8 w-8 object-contain" />
            <span className="text-3xl font-bold gradient-text">AEN</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Who We Are
          </h1>
          <p className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            AEN is a youth-led agribusiness ecosystem empowering Zimbabwe's farmers with access to finance, markets, knowledge, and digital tools for sustainable growth.
          </p>
        </div>

        {/* Vision */}
        <div
          className="glass-card p-8 mb-6 text-cream"
          style={{ background: 'var(--gradient-hero)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Eye size={20} className="text-gold" />
            <h2 className="text-xl font-bold">Our Vision</h2>
          </div>
          <p className="leading-relaxed text-sm" style={{ color: 'rgba(250,246,239,0.85)' }}>
            To build a digitally connected, transparent, and sustainable agricultural ecosystem that empowers farmers, connects markets, and ensures reliable access to quality food for all Zimbabweans.
          </p>
        </div>

        {/* Mission */}
        <div
          className="glass-card p-8 mb-8 text-cream"
          style={{ background: 'linear-gradient(135deg, rgba(41,77,45,0.95) 0%, rgba(26,58,31,0.95) 100%)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Target size={20} className="text-gold" />
            <h2 className="text-xl font-bold">Our Mission</h2>
          </div>
          <p className="leading-relaxed text-sm" style={{ color: 'rgba(250,246,239,0.85)' }}>
            To empower farmers and agribusiness stakeholders through data-driven insights, innovative production management, verified market access, and real-time supply chain transparency — while delivering fresh, traceable, and sustainably produced food to the market.
          </p>
        </div>

        {/* Core Value Proposition */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <Zap size={20} className="text-gold" />
            Core Value Proposition
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* For Farmers */}
            <div className="glass-card p-6">
              <h3 className="font-bold text-base mb-3" style={{ color: 'var(--color-text-primary)' }}>
                🌱 For Farmers
              </h3>
              <ul className="space-y-2">
                {farmerValues.map((v, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--gradient-gold)', color: '#1a1a1a' }}>✓</span>
                    {v}
                  </li>
                ))}
              </ul>
            </div>
            {/* For Buyers */}
            <div className="glass-card p-6">
              <h3 className="font-bold text-base mb-3" style={{ color: 'var(--color-text-primary)' }}>
                🏪 For Buyers & Offtakers
              </h3>
              <ul className="space-y-2">
                {buyerValues.map((v, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--gradient-gold)', color: '#1a1a1a' }}>✓</span>
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* How the JV Model Works */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <Shield size={20} className="text-gold" />
            How the JV Model Works
          </h2>
          <div className="glass-card p-6 text-sm leading-relaxed space-y-4" style={{ color: 'var(--color-text-secondary)' }}>
            <ol className="space-y-3 list-none">
              {[
                'Farmer registers and completes their profile',
                'AEN structures a bespoke Joint Venture agreement — profit split is negotiated per contract based on land size, crop type, and capital requirements',
                'AEN provides capital, inputs, and market access — farmer provides land, labour, and management',
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
                    style={{ background: 'var(--gradient-gold)', color: '#1a1a1a' }}
                  >
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <div className="rounded-xl p-4 pt-3 mt-2 flex items-start gap-3" style={{ backgroundColor: 'var(--color-surface-2)' }}>
              <span
                className="flex-shrink-0 w-7 h-7 rounded-full text-sm flex items-center justify-center"
                style={{ background: 'var(--gradient-gold)', color: '#1a1a1a' }}
              >
                💡
              </span>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Flexible profit split — </span>
                AEN and the farmer agree on a custom percentage per contract. The split reflects each party's contribution and is transparently documented before any season begins.
              </p>
            </div>
          </div>
        </div>

        {/* Team Link */}
        <div className="text-center mb-8">
          <Link
            to="/team"
            className="inline-flex items-center gap-2 font-semibold transition-colors hover:text-gold"
            style={{ color: 'var(--color-primary-light)' }}
          >
            <Users size={16} />
            Meet Our Board of Trustees
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Contact */}
        <div className="glass-card p-6 text-center">
          <Phone size={20} className="text-gold mx-auto mb-2" />
          <h3 className="font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Contact</h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Get in touch via the AEN platform
          </p>
        </div>
      </div>
    </div>
  )
}
