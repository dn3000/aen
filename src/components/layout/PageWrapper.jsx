import { motion, useReducedMotion } from 'framer-motion'

export default function PageWrapper({ children }) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduced ? 0 : -8 }}
      transition={{ duration: reduced ? 0 : 0.25, ease: 'easeOut' }}
      className="flex-1 flex flex-col w-full"
    >
      {children}
    </motion.div>
  )
}
