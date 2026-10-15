import { Mail, ArrowRight } from 'lucide-react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import Badge from '../components/ui/Badge'

const partners = [
  { initials: 'AZ',  name: 'Agribank Zimbabwe',         type: 'Financial Partner',          description: 'Providing agricultural finance and input loans to AEN joint venture farmers.' },
  { initials: 'FC',  name: 'FoodCorp Zimbabwe',          type: 'Offtake Partner',            description: 'Guaranteed grain and oilseed offtake for AEN member farmers at market-related prices.' },
  { initials: 'ZT',  name: 'Zimtrade',                   type: 'Market Development Partner', description: 'Supporting AEN farmers to access export markets in the region and beyond.' },
  { initials: 'MLA', name: 'Ministry of Lands & Agriculture', type: 'Government Partner',    description: 'Alignment with national agricultural development programs and extension services.' },
]

export default function Partners() {
  const gridRef = useRef(null)
  const inView = useInView(gridRef, { once: true, margin: '-60px' })
  const reduced = useReducedMotion()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Our Partners
          </h1>
          <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            AEN works with leading financial institutions, agribusinesses, and government bodies to build a complete support ecosystem for Zimbabwe's farmers.
          </p>
        </div>

        {/* Partner Cards */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {partners.map(({ initials, name, type, description }, i) => (
            <motion.div
              key={name}
              className="glass-card p-5 flex flex-col gap-3"
              initial={reduced ? {} : { opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: reduced ? 0 : i * 0.1 }}
              whileHover={reduced ? {} : { y: -4, transition: { duration: 0.2 } }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(41,77,45,0.12)' }}
              >
                <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
                  {initials}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm leading-snug mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  {name}
                </h3>
                <Badge variant="info">{type}</Badge>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Become a Partner CTA */}
        <div
          className="glass-card p-8 text-center"
          style={{ background: 'var(--gradient-hero)' }}
        >
          <h2 className="text-2xl font-bold text-cream mb-3">Partner with AEN</h2>
          <p className="text-cream/75 text-sm leading-relaxed max-w-lg mx-auto mb-6">
            We work with financial institutions, offtakers, NGOs and government bodies to create a complete support ecosystem for Zimbabwe's farmers.
          </p>
          <a
            href="mailto:partners@aen.zw"
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full transition-all hover:brightness-105"
            style={{ background: 'var(--gradient-gold)', color: '#1a1a1a' }}
          >
            <Mail size={15} />
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  )
}
