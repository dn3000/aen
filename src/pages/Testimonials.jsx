import { Quote } from 'lucide-react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import Badge from '../components/ui/Badge'

const farmerStories = [
  {
    name: 'Blessing Ncube',
    location: 'Gwanda, Matabeleland South',
    farming: 'Cattle + Sorghum',
    quote: 'Before AEN I was selling cattle at whatever price the middlemen offered. Now I know the market price before I sell and I have a guaranteed buyer. My income has increased by 40% in one season.',
    impacts: ['Income up 40%', 'Land: 8 hectares'],
    jvActive: true,
  },
  {
    name: 'Chiedza Mapfumo',
    location: 'Marondera, Mashonaland East',
    farming: 'Tomatoes + Green Beans',
    quote: 'The AEN platform showed me buyers I never knew existed. I used to sell at Mbare for whatever price I could get. Now Cairns Foods collects from my farm gate at a fixed contract price.',
    impacts: ['Direct buyer secured', 'Land: 3 hectares'],
    jvActive: true,
  },
  {
    name: 'Munyaradzi Gondo',
    location: 'Chegutu, Mashonaland West',
    farming: 'Mixed Vegetables',
    quote: 'I am 24 years old and I have a structured farming business. AEN gave me the inputs, the plan, and the market. I now employ 3 people full time.',
    impacts: ['3 jobs created', 'Age: 24'],
    jvActive: false,
    tag: 'Youth Farmer',
  },
]

const partnerTestimonials = [
  {
    org: 'FoodCorp Zimbabwe',
    contact: 'Procurement Manager',
    quote: 'AEN has given us consistent access to quality produce that previously required multiple agents. The farmer profiles give us confidence in supply volumes.',
  },
  {
    org: 'Agribank Zimbabwe',
    contact: 'SME Agriculture Division',
    quote: 'The verified farmer database and JV structure that AEN provides significantly reduces our credit risk assessment time. We see AEN farmers as bankable clients.',
  },
]

export default function Testimonials() {
  const farmerRef = useRef(null)
  const partnerRef = useRef(null)
  const farmerInView = useInView(farmerRef, { once: true, margin: '-60px' })
  const partnerInView = useInView(partnerRef, { once: true, margin: '-60px' })
  const reduced = useReducedMotion()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Success Stories
          </h1>
          <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Real farmers. Real results. See how AEN joint ventures are changing lives across Zimbabwe's farming communities.
          </p>
        </div>

        {/* Farmer Stories */}
        <section className="mb-12" ref={farmerRef}>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <span className="w-1 h-5 rounded-full inline-block" style={{ background: 'var(--gradient-gold)' }} />
            Farmer Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {farmerStories.map(({ name, location, farming, quote, impacts, jvActive, tag }, i) => (
              <motion.div
                key={name}
                className="glass-card p-6 flex flex-col gap-4"
                initial={reduced ? {} : { opacity: 0, y: 20 }}
                animate={farmerInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: reduced ? 0 : i * 0.1 }}
              >
                <span className="text-5xl leading-none gradient-text font-serif select-none">"</span>
                <p className="text-sm leading-relaxed -mt-3 italic" style={{ color: 'var(--color-text-secondary)' }}>
                  {quote}
                </p>
                <div className="pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <p className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>{name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {location} · {farming}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {impacts.map((impact) => (
                    <Badge key={impact} variant="success">{impact}</Badge>
                  ))}
                  {tag && <Badge variant="info">{tag}</Badge>}
                  {jvActive && <Badge variant="gold">JV Active</Badge>}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Partner Testimonials */}
        <section ref={partnerRef}>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <span className="w-1 h-5 rounded-full inline-block" style={{ background: 'var(--gradient-gold)' }} />
            Partner Testimonials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {partnerTestimonials.map(({ org, contact, quote }, i) => (
              <motion.div
                key={org}
                className="glass-card p-6 flex flex-col gap-3"
                initial={reduced ? {} : { opacity: 0, y: 20 }}
                animate={partnerInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: reduced ? 0 : i * 0.12 }}
              >
                <div className="flex items-center gap-2">
                  <Quote size={16} className="text-gold flex-shrink-0" />
                  <span className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>{org}</span>
                </div>
                <p className="text-sm leading-relaxed italic" style={{ color: 'var(--color-text-secondary)' }}>
                  "{quote}"
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{contact}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
