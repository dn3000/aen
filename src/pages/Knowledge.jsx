import { PlayCircle, Mail, Clock, BookOpen } from 'lucide-react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'

// TODO Phase 3: full article content + CMS integration
const resources = [
  { title: 'Soil Preparation for Maize Production',          category: 'Crop Guide',              readTime: '5 min' },
  { title: 'Drip Irrigation Setup for Smallholder Farms',    category: 'Technology',              readTime: '8 min' },
  { title: 'Understanding Your JV Agreement',                category: 'Finance & Legal',         readTime: '4 min' },
  { title: 'Post-Harvest Storage Best Practices',            category: 'Post-Harvest',            readTime: '6 min' },
  { title: 'Accessing Finance as a Smallholder Farmer',      category: 'Finance',                 readTime: '7 min' },
  { title: 'Climate-Smart Farming Techniques for Zimbabwe',  category: 'Climate & Sustainability',readTime: '10 min' },
]

// TODO Phase 3: embed actual video content
const videos = [
  { title: 'How to Register on AEN',              duration: '3:24' },
  { title: 'Completing Your Farm Profile',        duration: '5:12' },
  { title: 'How the Joint Venture Model Works',   duration: '8:45' },
]

export default function Knowledge() {
  const resourcesRef = useRef(null)
  const videosRef = useRef(null)
  const resourcesInView = useInView(resourcesRef, { once: true, margin: '-60px' })
  const videosInView = useInView(videosRef, { once: true, margin: '-60px' })
  const reduced = useReducedMotion()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Knowledge Hub
          </h1>
          <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Guides, tutorials, and resources to help you get the most from your AEN joint venture and grow a profitable farm business.
          </p>
        </div>

        {/* Resource Library */}
        <section className="mb-12" ref={resourcesRef}>
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <span className="w-1 h-5 rounded-full inline-block" style={{ background: 'var(--gradient-gold)' }} />
            Resource Library
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map(({ title, category, readTime }, i) => (
              <motion.div
                key={title}
                className="glass-card p-5 flex flex-col gap-3"
                initial={reduced ? {} : { opacity: 0, y: 20 }}
                animate={resourcesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.35, delay: reduced ? 0 : i * 0.08 }}
                whileHover={reduced ? {} : { y: -3, transition: { duration: 0.15 } }}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="info">{category}</Badge>
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <Clock size={10} /> {readTime} read
                  </span>
                </div>
                <h3 className="font-bold text-sm leading-snug flex-1" style={{ color: 'var(--color-text-primary)' }}>
                  {title}
                </h3>
                <a href="#">
                  <button
                    className="w-full text-xs font-semibold py-2 px-4 rounded-full transition-all hover:brightness-105"
                    style={{ background: 'var(--gradient-gold)', color: '#1a1a1a' }}
                  >
                    Read Article
                  </button>
                </a>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Video Tutorials */}
        <section className="mb-12" ref={videosRef}>
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <span className="w-1 h-5 rounded-full inline-block" style={{ background: 'var(--gradient-gold)' }} />
            Video Tutorials
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {videos.map(({ title, duration }, i) => (
              <motion.div
                key={title}
                className="flex flex-col gap-2"
                initial={reduced ? {} : { opacity: 0, y: 20 }}
                animate={videosInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.35, delay: reduced ? 0 : i * 0.1 }}
              >
                <div
                  className="rounded-xl aspect-video flex items-center justify-center cursor-pointer relative overflow-hidden group"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)' }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: '#c8a84b' }} />
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: 'rgba(200,168,75,0.25)', border: '2px solid rgba(200,168,75,0.5)' }}
                  >
                    <PlayCircle size={28} className="text-gold" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium leading-snug" style={{ color: 'var(--color-text-primary)' }}>
                    {title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{duration}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Coming Soon */}
        <section>
          <div className="glass-card p-8 text-center">
            <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--color-text-primary)' }}>
              More resources being added weekly
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
              Have a topic you'd like covered? Let us know.
            </p>
            <a
              href="mailto:knowledge@aen.zw"
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-gold"
              style={{ color: 'var(--color-primary-light)' }}
            >
              <Mail size={14} />
              knowledge@aen.zw
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
