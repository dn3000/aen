import { Link, useNavigate } from 'react-router-dom'
import { Store, TrendingUp, BookOpen, ChevronRight, ChevronDown, ArrowRight, CheckCircle2, Star } from 'lucide-react'
import { motion, useInView, useReducedMotion, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'

const pillars = [
  {
    icon: Store,
    title: 'Market Access',
    description: 'Connect directly with verified buyers across Zimbabwe. List your produce and get fair prices without middlemen.',
    color: '#c8a84b',
  },
  {
    icon: TrendingUp,
    title: 'Finance & Capital',
    description: 'Access working capital, inputs, and equipment through the AEN Joint Venture model. We invest in your farm.',
    color: '#3d6b43',
  },
  {
    icon: BookOpen,
    title: 'Knowledge Hub',
    description: 'Learn modern farming techniques, soil management, and crop planning from experienced agronomists.',
    color: '#2471a3',
  },
]

const steps = [
  { num: '01', title: 'Register & Profile', desc: 'Create your farmer profile in under 10 minutes.' },
  { num: '02', title: 'Get Matched',        desc: 'Our system connects you with verified buyers.' },
  { num: '03', title: 'Access Support',     desc: 'Receive inputs, capital, and expert guidance.' },
  { num: '04', title: 'Grow & Earn',        desc: 'Sell at fair prices and build a lasting agri-business.' },
]

const testimonials = [
  { name: 'Mercy Moyo',    location: 'Mashonaland East', text: 'AEN helped me double my tomato income in one season by connecting me directly to Harare buyers.', impact: '+120% income' },
  { name: 'Farai Ncube',   location: 'Matabeleland North', text: 'I finally got access to irrigation equipment through the JV agreement. My land is now productive year-round.', impact: '12 ha irrigated' },
  { name: 'Rudo Chikwanda', location: 'Midlands',         text: 'The price index helped me know when to sell my maize. I no longer get exploited by middle-men.', impact: 'Fair pricing' },
]

const partners = [
  { name: 'Partner',          logo: '/icons/partners/Logo_-_EB-1-min_1-removebg-preview.png' },
  { name: 'Mundo Verde',      logo: '/icons/partners/Mundo Verde logo.png'                   },
  { name: 'Partner',          logo: '/icons/partners/logo-white.webp'                        },
  { name: 'Partner',          logo: '/icons/partners/unnamed-2_1-removebg-preview.png'       },
  { name: 'Farm City Centre', logo: '/icons/partners/Farm-City-Centre.png'                   },
  { name: 'Syngenta',         logo: '/icons/partners/syngenta.png'                           },
  { name: 'Hurudza',          logo: '/icons/partners/hurudza.png'                            },
  { name: 'Partner',          logo: '/icons/partners/13b.png'                                },
  { name: 'Driptech',         logo: '/icons/partners/driptech.png'                           },
  { name: 'Partner',          logo: '/icons/partners/logo-1-Recovered.pnbnnbbn.png'          },
  { name: 'Musika',           logo: '/icons/partners/musika.png'                             },
  { name: 'Partner',          logo: '/icons/partners/wlogo.png'                              },
]

const stats = [
  { value: 500,   suffix: '+', label: 'Farmers' },
  { value: 5,     suffix: '',  label: 'Markets Tracked' },
  { value: 45,    suffix: '',  label: 'Commodities' },
]

const sdgs = [
  { num: 1,  name: 'No Poverty',                            color: '#E5243B' },
  { num: 2,  name: 'Zero Hunger',                           color: '#DDA63A' },
  { num: 3,  name: 'Good Health & Well-being',              color: '#4C9F38' },
  { num: 4,  name: 'Quality Education',                     color: '#C5192D' },
  { num: 5,  name: 'Gender Equality',                       color: '#FF3A21' },
  { num: 6,  name: 'Clean Water & Sanitation',              color: '#26BDE2' },
  { num: 7,  name: 'Affordable & Clean Energy',             color: '#FCC30B' },
  { num: 8,  name: 'Decent Work & Economic Growth',         color: '#A21942' },
  { num: 9,  name: 'Industry, Innovation & Infrastructure', color: '#FD6925' },
  { num: 10, name: 'Reduced Inequalities',                  color: '#DD1367' },
  { num: 11, name: 'Sustainable Cities',                    color: '#FD9D24' },
  { num: 12, name: 'Responsible Consumption',               color: '#BF8B2E' },
  { num: 13, name: 'Climate Action',                        color: '#3F7E44' },
  { num: 14, name: 'Life Below Water',                      color: '#0A97D9' },
  { num: 15, name: 'Life on Land',                          color: '#56C02B' },
  { num: 16, name: 'Peace, Justice & Institutions',         color: '#00689D' },
  { num: 17, name: 'Partnerships for the Goals',            color: '#19486A' },
]

function CountUp({ target, suffix, duration = 1200 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!inView) return
    if (reduced) { setCount(target); return }
    const start = Date.now()
    const step = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, target, duration, reduced])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function Landing() {
  const { user, farmerProfile } = useAuth()
  const isComplete = user && farmerProfile?.profileComplete
  const reduced = useReducedMotion()
  const navigate = useNavigate()
  const showToast = useToast()
  const [demoLoading, setDemoLoading] = useState(false)

  // MANUAL SETUP REQUIRED (one-time, done by developer):
  // 1. Firebase Console → Authentication → Add user
  //    Email: demo@aen.co.zw  Password: demo1234
  // 2. Copy the UID of the new user
  // 3. In Firestore → farmers → find document for Tawanda Moyo (demo-farmer-001 from seed)
  // 4. Copy ALL fields and subcollections from demo-farmer-001 into a new document
  //    with the demo user's actual Firebase Auth UID
  // 5. Set profileComplete: true, jvAgreementAccepted: true, role: "farmer"
  //    on the new document
  // 6. Delete or ignore demo-farmer-001 (the seeded version with fake UID)
  async function handleDemoLogin() {
    setDemoLoading(true)
    try {
      await signInWithEmailAndPassword(auth, 'demo@aen.co.zw', 'demo1234')
      navigate('/dashboard')
    } catch (err) {
      showToast('Demo unavailable — please try again shortly.', 'error')
    } finally {
      setDemoLoading(false)
    }
  }

  const pillarsRef = useRef(null)
  const pillarsInView = useInView(pillarsRef, { once: true, margin: '-80px' })

  const stepsRef = useRef(null)
  const stepsInView = useInView(stepsRef, { once: true, margin: '-80px' })

  const testimonialRef = useRef(null)
  const testimonialInView = useInView(testimonialRef, { once: true, margin: '-80px' })

  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const testimonialTimerRef = useRef(null)
  const touchStartX = useRef(null)

  useEffect(() => {
    testimonialTimerRef.current = setInterval(() => {
      setTestimonialIndex(i => (i + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(testimonialTimerRef.current)
  }, [])

  const goToTestimonial = (index) => {
    setTestimonialIndex(index)
    clearInterval(testimonialTimerRef.current)
    testimonialTimerRef.current = setInterval(() => {
      setTestimonialIndex(i => (i + 1) % testimonials.length)
    }, 4000)
  }

  return (
    <div className="flex flex-col" style={{ backgroundColor: 'var(--color-surface)' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(26,58,31,0.82) 0%, rgba(41,77,45,0.75) 50%, rgba(26,58,31,0.88) 100%), url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&q=80&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
            opacity: 0.35,
            mixBlendMode: 'overlay',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 w-full">

          {/* Mobile logo — above heading, hidden on md+ */}
          <div className="flex justify-center mb-4 md:hidden">
            <div className="relative w-[45vw] h-[45vw] max-w-[180px]">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(212,169,106,0.15) 0%, transparent 70%)' }}
              />
              <img
                src="/icons/aen-logobrwn.svg"
                alt="AEN"
                className="relative w-[45vw] h-[45vw] max-w-[180px]"
                style={{ filter: 'drop-shadow(0 8px 32px rgba(212,169,106,0.3))' }}
              />
            </div>
          </div>

          {/* Two-column grid: text (3/5) | logo (2/5) */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-center">

            {/* Left col — text content */}
            <div className="md:col-span-3 text-center md:text-left">

              {/* Eyebrow badge */}
              <motion.div
                initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center glass rounded-full px-4 py-2 mb-8"
              >
                <span className="text-xs font-semibold text-[var(--color-primary-mid)] dark:text-gold tracking-wide">
                  Agripreneurs Empowerment Network
                </span>
              </motion.div>

              {/* H1 */}
              <motion.h1
                className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-cream"
                initial={reduced ? { opacity: 1 } : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                From Farm to Future.{' '}
                <span className="gradient-text">Smart Farming. Trusted Markets. Real Impact.</span>
              </motion.h1>

              <motion.p
                className="text-base md:text-xl max-w-2xl mx-auto md:mx-0 mb-10 leading-relaxed"
                style={{ color: 'rgba(250,246,239,0.75)' }}
                initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Connecting Zimbabwe's farmers to verified buyers, real-time market prices,
                and structured joint venture opportunities.
              </motion.p>

              {/* CTAs */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {isComplete ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 text-base font-semibold px-8 py-4 rounded-full transition-all hover:scale-105 hover:brightness-105 shadow-lg"
                    style={{ background: 'var(--gradient-gold)', color: '#1a1a1a', boxShadow: '0 8px 32px rgba(200,168,75,0.35)' }}
                  >
                    Go to Dashboard <ArrowRight size={18} />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 text-base font-semibold px-8 py-4 rounded-full transition-all hover:scale-105 hover:brightness-105 shadow-lg"
                      style={{ background: 'var(--gradient-gold)', color: '#1a1a1a', boxShadow: '0 8px 32px rgba(200,168,75,0.35)' }}
                    >
                      Register as a Farmer <ArrowRight size={18} />
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 text-base font-bold px-8 py-4 rounded-full bg-white/80 backdrop-blur-md text-[var(--color-primary)] transition-all hover:bg-white shadow-lg"
                    >
                      Explore the Platform <ArrowRight size={18} />
                    </Link>
                    <div className="flex flex-col items-center gap-2 w-full sm:w-auto pt-1">
                      <span className="text-xs" style={{ color: 'rgba(250,246,239,0.45)' }}>or</span>
                      <button
                        onClick={handleDemoLogin}
                        disabled={demoLoading}
                        className="inline-flex items-center gap-2 text-sm px-6 py-2.5 rounded-full border border-cream/50 text-cream/80 hover:bg-cream/10 transition-all disabled:opacity-60"
                      >
                        {demoLoading ? (
                          <>
                            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                            Signing in...
                          </>
                        ) : 'Try Demo — no account needed'}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>

            {/* Right col — Desktop logo, hidden on mobile */}
            <div className="hidden md:flex md:col-span-2 justify-center items-center">
              <div className="relative w-72 h-72">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(212,169,106,0.15) 0%, transparent 70%)' }}
                />
                <motion.img
                  src="/icons/aen-logobrwn.svg"
                  alt="AEN"
                  className="relative w-72 h-72"
                  style={{ filter: 'drop-shadow(0 8px 32px rgba(212,169,106,0.3))' }}
                  animate={reduced ? {} : { rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          {!reduced && (
            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown size={24} className="text-cream/40" />
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Floating Stats Bar ───────────────────────────────────────────── */}
      <section style={{ backgroundColor: 'var(--color-surface-2)' }}>
        <div className="max-w-3xl mx-auto w-full px-4 -mt-8 relative z-10 pb-8">
          <div className="glass-card p-6">
            <div className="grid grid-cols-3 divide-x divide-[var(--color-border)]">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-1 px-4">
                  <span className="text-2xl md:text-3xl font-bold gradient-text">
                    <CountUp target={s.value} suffix={s.suffix} />
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)] font-medium text-center">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Three Pillars ────────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--color-surface-2)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Everything a farmer needs
            </h2>
            <p className="text-[var(--color-text-secondary)] text-lg">
              Three pillars designed for Zimbabwe's farmers
            </p>
          </div>
          <motion.div
            ref={pillarsRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon
              return (
                <motion.div
                  key={pillar.title}
                  className="flex items-start gap-4 p-5 rounded-2xl cursor-default"
                  style={{ backgroundColor: 'var(--color-surface)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: 32 }}
                  animate={pillarsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: reduced ? 0 : i * 0.15 }}
                  whileHover={reduced ? {} : { y: -3, transition: { duration: 0.2 } }}
                >
                  <div
                    className="rounded-xl p-3 flex-shrink-0"
                    style={{ backgroundColor: `${pillar.color}22` }}
                  >
                    <Icon size={22} style={{ color: pillar.color }} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {pillar.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {pillar.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{
        backgroundImage: `linear-gradient(rgba(26,58,31,0.92), rgba(26,58,31,0.92)), url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-cream">
              Your path from farmer to agripreneur
            </h2>
            <p className="text-cream/70">Four simple steps to transform your farm</p>
          </div>
          <div ref={stepsRef}>
            {/* ── Mobile: vertical timeline ── */}
            <div className="md:hidden max-w-sm mx-auto relative">
              <div
                className="absolute pointer-events-none"
                style={{
                  left: '33px',
                  top: '8px',
                  bottom: '34px',
                  width: '1.5px',
                  background: 'linear-gradient(to bottom, rgba(200,168,75,0.85) 0%, rgba(200,168,75,0.15) 100%)',
                }}
              />
              <div
                className="absolute w-2 h-2 rounded-full"
                style={{ left: '29px', top: '2px', background: '#c8a84b' }}
              />
              <div className="flex flex-col gap-10">
                {steps.map((step, i) => (
                  <motion.div
                    key={step.num}
                    className="flex items-start gap-5"
                    initial={reduced ? { opacity: 1 } : { opacity: 0, x: -20 }}
                    animate={stepsInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: reduced ? 0 : i * 0.15 }}
                  >
                    <div
                      className="w-[68px] h-[68px] rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 relative z-10"
                      style={{ background: 'var(--gradient-gold)', color: '#1a1a1a' }}
                    >
                      {step.num}
                    </div>
                    <div className="pt-3 flex-1">
                      <h4 className="font-bold text-lg text-cream leading-snug">{step.title}</h4>
                      <p className="text-sm text-cream/60 leading-relaxed mt-1">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── Desktop: original 4-column grid ── */}
            <div className="hidden md:grid grid-cols-4 gap-6">
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  className="flex flex-col items-center text-center gap-4"
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
                  animate={stepsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: reduced ? 0 : i * 0.12 }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                    style={{ background: 'var(--gradient-gold)', color: '#1a1a1a' }}
                  >
                    {step.num}
                  </div>
                  <h4 className="font-bold text-base text-cream">{step.title}</h4>
                  <p className="text-sm text-cream/60 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SDG Alignment ─────────────────────────────────────────────────── */}
      <section className="py-14 overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-5xl mx-auto text-center mb-8 px-4">
          <p className="text-xs uppercase tracking-widest font-semibold mb-2"
             style={{ color: 'var(--color-text-muted)' }}>
            Our Global Commitment
          </p>
          <h2 className="text-2xl md:text-3xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}>
            Aligned with the UN Sustainable Development Goals
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            AEN's work directly contributes to all 17 global goals
          </p>
          <a
            href="https://sdgs.un.org/goals"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-sm font-semibold underline underline-offset-2"
            style={{ color: 'var(--color-gold)' }}
          >
            Visit UN Website
          </a>
        </div>

        <div className="relative">
          {/* Fade masks — hide scroll seam at edges */}
          <div className="absolute inset-y-0 left-0 w-16 z-10 pointer-events-none"
               style={{ background: 'linear-gradient(to right, var(--color-surface), transparent)' }} />
          <div className="absolute inset-y-0 right-0 w-16 z-10 pointer-events-none"
               style={{ background: 'linear-gradient(to left, var(--color-surface), transparent)' }} />

          {/* Scrolling track — 17 × 2 cards for seamless loop */}
          <div className="flex gap-3 sdg-marquee-track" style={{ width: 'max-content' }}>
            {[...sdgs, ...sdgs].map((sdg, i) => (
              <div
                key={i}
                className="flex-shrink-0 rounded-2xl overflow-hidden w-[100px] h-[100px] md:w-[160px] md:h-[160px]"
                style={{ backgroundColor: sdg.color }}
              >
                <img
                  src={`https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-${String(sdg.num).padStart(2, '0')}.jpg`}
                  alt={`SDG ${sdg.num}: ${sdg.name}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4" ref={testimonialRef} style={{
        backgroundImage: `linear-gradient(rgba(15,26,16,0.88), rgba(15,26,16,0.88)), url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920&q=80&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-cream">
              What farmers are saying
            </h2>
          </div>
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
            animate={testimonialInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            {/* Swipeable track */}
            <div
              className="overflow-hidden"
              onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
              onTouchEnd={e => {
                const dx = e.changedTouches[0].clientX - touchStartX.current
                if (dx < -60) goToTestimonial((testimonialIndex + 1) % testimonials.length)
                else if (dx > 60) goToTestimonial((testimonialIndex - 1 + testimonials.length) % testimonials.length)
              }}
            >
              <div
                className="flex"
                style={{
                  transform: `translateX(-${testimonialIndex * 100}%)`,
                  transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {testimonials.map((t) => (
                  <div key={t.name} className="min-w-full px-2">
                    <div className="glass-card p-6 flex flex-col gap-4 max-w-xl mx-auto">
                      <span className="text-5xl font-serif leading-none gradient-text">"</span>
                      <p className="text-sm leading-relaxed flex-1 italic" style={{ color: 'var(--color-text-secondary)' }}>
                        {t.text}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{t.name}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{t.location}</p>
                        </div>
                        <span
                          className="text-xs font-semibold px-3 py-1 rounded-full"
                          style={{ background: 'rgba(61,107,67,0.15)', color: 'var(--color-success)' }}
                        >
                          {t.impact}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToTestimonial(i)}
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: i === testimonialIndex ? '24px' : '8px',
                    background: i === testimonialIndex ? '#c8a84b' : 'rgba(255,255,255,0.3)',
                  }}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Partners ──────────────────────────────────────────────────────── */}
      <section className="py-14 overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-5xl mx-auto text-center mb-10 px-4">
          <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--color-text-muted)' }}>
            Partners
          </p>
        </div>

        <div className="relative">
          {/* left fade mask */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10"
            style={{ background: 'linear-gradient(to right, var(--color-surface), transparent)' }}
          />
          {/* right fade mask */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10"
            style={{ background: 'linear-gradient(to left, var(--color-surface), transparent)' }}
          />

          <div className="flex partner-marquee-track" style={{ width: 'max-content' }}>
            {[...partners, ...partners].map((p, i) => (
              <div
                key={i}
                className="mx-10 flex items-center justify-center w-40 h-32 flex-shrink-0"
              >
                <img
                  src={p.logo}
                  alt={p.name}
                  className="max-h-24 w-auto object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo Invite Section ─────────────────────────────────────────── */}
      <section className="py-12 px-4" style={{ backgroundColor: 'var(--color-surface)' }}>
        <motion.div
          className="max-w-lg mx-auto rounded-2xl p-8 text-center backdrop-blur-sm border border-white/20 bg-white/5"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>See it in action</h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Explore the full platform with a demo farmer account — no registration required.
          </p>
          <button
            onClick={handleDemoLogin}
            disabled={demoLoading}
            className="inline-flex items-center gap-2 text-base font-semibold px-8 py-4 rounded-full transition-all hover:scale-105 hover:brightness-105 disabled:opacity-60"
            style={{ background: 'var(--gradient-gold)', color: '#1a1a1a' }}
          >
            {demoLoading ? 'Signing in...' : 'Launch Demo →'}
          </button>
          <p className="text-xs mt-4" style={{ color: 'var(--color-text-muted)' }}>
            demo@aen.co.zw · Read-only demonstration
          </p>
        </motion.div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <section
        className="py-20 px-4 text-center"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(26,58,31,0.95), rgba(41,77,45,0.95)), url('https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1920&q=80&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-cream mb-4">
          Ready to join Zimbabwe's farming network?
        </h2>
        <p className="text-cream/75 text-lg mb-8 max-w-lg mx-auto">
          Thousands of farmers are already growing smarter with AEN. Your journey starts here.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 text-base font-semibold px-8 py-4 rounded-full transition-all hover:scale-105 hover:brightness-105"
            style={{ background: 'var(--gradient-gold)', color: '#1a1a1a' }}
          >
            Get Started Free <ArrowRight size={18} />
          </Link>
          <Link
            to="/about"
            className="glass inline-flex items-center justify-center gap-2 text-base font-medium px-8 py-4 rounded-full text-cream transition-all hover:bg-white/20"
          >
            Learn More
          </Link>
        </div>
      </section>
    </div>
  )
}
