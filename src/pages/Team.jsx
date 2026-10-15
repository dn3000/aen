import { Link } from 'react-router-dom'
import { ArrowLeft, Users, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, useInView, useReducedMotion, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'
import Badge from '../components/ui/Badge'

const team = [
  {
    initials: 'TCR',
    name: 'Tawanda Cuthbert Runganga',
    title: 'Founder & Trustee Chairman',
    bio: 'Tawanda is an award-winning Agriculture Educator, passionate farmer, and agribusiness practitioner dedicated to advancing sustainable and climate-smart food systems across Zimbabwe and Africa. He holds a Master of Science in Food Security and Sustainable Agricultural Production (2025), a BSc in Agricultural Economics and Development (2015), and a Certificate in Agribusiness and Entrepreneurship (2022).\n\nWith over five years of practical experience in organic farming and mushroom production, Tawanda has become a leading voice in regenerative agriculture. He serves as Lead Trainer for the Federation of Young Farmers Clubs in Zimbabwe (FYFCZ), where he trains, mentors, and builds the capacity of thousands of young farmers nationwide.\n\nHis leadership extends into multiple regional and global platforms, including roles as Operations Director at Mundo Verde Zimbabwe, Southern Africa Representative for 4 Revolutions Africa, and active participation in networks such as Generation Africa Voices and the African Solutions & Impact Circle. A committed climate-action advocate and food security champion who continues to spearhead initiatives that drive a sustainable future for Africa\'s food systems, strengthen resilience, and improve livelihoods.',
  },
  {
    initials: 'TDM',
    name: 'Tapiwa D Mabika-Tavaziah',
    title: 'Trustee',
    bio: 'Tapiwa Deirdrie Mabika-Tavaziah is a dynamic and results-driven professional contributing to the vision of AEN through her expertise in administration, public relations, marketing, and project management. She brings a strong passion for driving impactful agribusiness solutions through strategic communication, digital innovation, and efficient project execution.\n\nCurrently serving as a Project Manager at Azura Technologies, Tapiwa plays a key role in planning, coordinating, and monitoring projects that align with AEN\'s mission of empowering farmers and strengthening value chains. Her diverse experience across technology, education, and agribusiness sectors enables her to bridge operational efficiency with market-driven solutions for farmers and stakeholders.\n\nAs Managing Director of Level Mark Investments, she leads agribusiness operations with a focus on sustainability, productivity, and scalable growth. Her background in administration and customer relations enhances AEN\'s engagement with farmers, buyers, and partners, ensuring clear communication and strong stakeholder relationships. Her certifications in Digital Marketing, Project Management, and Phone Photography further strengthen AEN\'s digital presence, brand visibility, and storytelling capacity.',
  },
  {
    initials: 'NG',
    name: 'Nicola Goto',
    title: 'Trustee',
    bio: 'An Accounting graduate from the University of Zimbabwe with a diverse portfolio spanning agribusiness, entrepreneurship, digital marketing, and women\'s empowerment. Founder of Nicola\'s Building Hub, a business supplying building raw materials, demonstrating strong entrepreneurial and operational capabilities.\n\nAuthor of Motherhood Decoded, a platform dedicated to empowering women and mothers through shared experiences and personal growth. Actively engaged in farming in the Manicaland region, with hands-on experience in agricultural operations and agribusiness development. Holds a certification in Digital Marketing, with skills in brand building and audience engagement.',
  },
  {
    initials: 'TM',
    name: 'Tafara Mhenyu',
    title: 'Trustee',
    bio: 'Tafara Mhenyu is a Chartered Accountant registered with the Institute of Chartered Accountants of Zimbabwe (ICAZ) and holds an Honours Degree in Accounting from the University of Zimbabwe. He brings over five and a half years of professional experience spanning finance and agribusiness.\n\nHe has established a strong reputation for combining technical financial expertise with practical, results-driven insights, with a proven track record in both farming and finance. Deeply passionate about farming and agribusiness, he is committed to leveraging innovative approaches to improve productivity, profitability, and long-term impact within the agricultural sector.',
  },
  {
    initials: 'TK',
    name: 'Tinashe Kanda',
    title: 'Trustee',
    bio: 'Tinashe is a young agripreneur and development professional committed to advancing sustainable agriculture, youth empowerment, and community transformation in Zimbabwe. He is actively involved in mushroom production, broiler farming, and maize cultivation, focusing on practical and scalable farming models that promote food security and income generation.\n\nThrough Greenlife Farm, he contributes to the production and marketing of agricultural products, emphasizing value addition, improved market access, and active participation across the agricultural value chain. In the development space, Tinashe works as an independent consultant supporting initiatives in youth empowerment, agriculture, and education, working closely with young women, older persons, people living with disabilities, and individuals from diverse backgrounds.\n\nHe holds a BSc (Hons) in International Relations (2022) and is currently pursuing a Master of Public Policy and Governance. An emerging researcher and writer, his work includes research on integrating indigenous knowledge systems into seasonal weather forecasting and published articles on gender equality and human rights.',
  },
  {
    initials: 'BM',
    name: 'Bridget Mawarire',
    title: 'Trustee',
    bio: 'A dynamic and visionary entrepreneur with a strong footprint in agribusiness, creative industry, hair and beauty, mining, youth and women empowerment. Proven ability to conceptualize, lead, and execute high-impact initiatives, events, agricultural collaborations, and film production projects.\n\nCEO & Founder of Real Touch Beauty Studio and COO & Co-Founder of FarmGuard, leading operations in precision farming specializing in agricultural drones and AI technologies. Director of Miss Ebony Zimbabwe and ZAS Board Member & Secretary General (Next Gen). Film production credits include music videos for top Zimbabwean artists including Jah Prayzah, Anita Jaxson, Alick Macheso, Freeman, and Baba Harare. Recipient of the ZUWB Award (2023), Zim CEO\'s Network Entrepreneurial Award (2025), and National Agricultural Women and Youth Awards – Community Impact Award (2025).',
  },
  {
    initials: 'BS',
    name: 'Brandon Senzere',
    title: 'Trustee',
    bio: 'Brandon is an agribusiness entrepreneur and technology-driven strategist, serving as Founder and Principal of TanaLyn Strategic Ventures (TLSV), a forward-looking holding company focused on transforming agricultural systems through innovation and integrated value chain development.\n\nHe holds a degree in Geographical Information Science and Earth Observation from the University of Zimbabwe (2017–2021), with professional experience in engineering-based GIS applications gained at ZETDC. Through TLSV, he is building an integrated agricultural ecosystem comprising Zenith Geospatial Nexus (ZGN) — a precision agriculture arm using drone technology, remote sensing, and satellite analytics — Backyard Chickens (poultry production), and The Meat Up (consumer-focused meat distribution).\n\nDeep expertise in GIS, remote sensing, drone applications, and environmental analysis positions him as a practitioner in climate-smart agriculture. His work aligns with SDGs 2, 8, 9, and 13, with a vision to leverage technology and data to build efficient agricultural systems that ensure food security for Zimbabwe and beyond.',
  },
  {
    initials: 'DM',
    name: 'Donovan T Mafukidze',
    title: 'Trustee',
    bio: 'Advocate Donovan Mafukidze is a legal professional and strategic advisor serving as a Trustee of AEN, where he provides critical oversight on governance, compliance, and policy alignment. He brings extensive experience in supporting institutional structures, ensuring AEN operates within strong legal and regulatory frameworks.\n\nHis expertise in legal risk management strengthens the organization\'s credibility and supports the development of transparent, investor-ready agribusiness initiatives. In his role, Donovan contributes to shaping policies that advance inclusive agricultural development, with a particular focus on empowering youth and women. Known for sound judgment, ethical leadership, and strong analytical skills, he guides strategic decision-making and reinforces AEN\'s mission to build resilient, compliant, and transformative agribusiness systems.',
  },
  {
    initials: 'SM',
    name: 'Samantha Matiyenga',
    title: 'Trustee',
    bio: 'Samantha Matiyenga is a passionate Tourism and Hospitality professional turned horticulturist and poultry farmer based in Zimbabwe. Since 2016, she has been driving agricultural innovation through diversified crop and poultry production, producing vegetables such as cabbages, lettuce, and cauliflower, supplying leading supermarkets and vendors nationwide.\n\nShe is a dedicated advocate for sustainable farming and actively shares her knowledge to inspire emerging farmers. Samantha currently serves as Director of Crop and Livestock Production and Marketing, focusing on farmer identification, production capacity, and market access. She holds a BSc in Tourism and Hospitality Management, along with certifications in Event Planning, Agribusiness Management, and Sustainability. Her work integrates international best practices into Zimbabwe\'s agricultural sector.',
  },
]

/** Renders bio paragraphs with a mobile-only "Read more / Show less" toggle */
function ReadMoreBio({ bio }) {
  const [expanded, setExpanded] = useState(false)
  const paragraphs = bio.split('\n\n')

  return (
    <div className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
      {/* ── Mobile view ── */}
      <div className="md:hidden">
        <div
          className="relative overflow-hidden transition-all duration-300"
          style={{ maxHeight: expanded ? '9999px' : '5.5rem' }}
        >
          <div className="space-y-3">
            {paragraphs.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </div>
          {/* Fade-out gradient when collapsed */}
          {!expanded && (
            <div
              className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
              style={{
                background: 'linear-gradient(to bottom, transparent, var(--color-surface-card, var(--color-surface)))',
              }}
            />
          )}
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold transition-colors"
          style={{ color: 'var(--color-primary-light)' }}
          aria-expanded={expanded}
        >
          {expanded ? (
            <><ChevronUp size={13} /> Show less</>
          ) : (
            <><ChevronDown size={13} /> Read more</>
          )}
        </button>
      </div>

      {/* ── Desktop: always show full bio ── */}
      <div className="hidden md:block space-y-3">
        {paragraphs.map((p, j) => (
          <p key={j}>{p}</p>
        ))}
      </div>
    </div>
  )
}

export default function Team() {
  const gridRef = useRef(null)
  const inView = useInView(gridRef, { once: true, margin: '-60px' })
  const reduced = useReducedMotion()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link
          to="/about"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-8 transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ArrowLeft size={15} />
          Back to About
        </Link>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Users size={28} className="text-gold" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Board of Trustees
          </h1>
          <p className="text-base max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Experienced professionals and passionate agripreneurs committed to transforming Zimbabwe's agricultural sector
            through innovation, market access, and digital empowerment.
          </p>
        </div>

        <div ref={gridRef} className="flex flex-col gap-6">
          {team.map(({ initials, name, title, bio }, i) => (
            <motion.div
              key={name}
              className="glass-card p-6 flex flex-col gap-4"
              initial={reduced ? {} : { opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: reduced ? 0 : i * 0.07 }}
              whileHover={reduced ? {} : { y: -2, transition: { duration: 0.2 } }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
                    border: '2px solid rgba(200,168,75,0.4)',
                  }}
                >
                  <span className="text-gold font-bold text-xs">{initials}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-base leading-snug" style={{ color: 'var(--color-text-primary)' }}>
                    {name}
                  </h2>
                  <div className="mt-1">
                    <Badge variant="gold">{title}</Badge>
                  </div>
                </div>
              </div>

              <ReadMoreBio bio={bio} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
