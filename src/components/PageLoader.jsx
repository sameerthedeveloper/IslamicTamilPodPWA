import { motion } from 'framer-motion'

function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, rotate: 360 }}
        transition={{
          opacity: { delay: 0.15, duration: 0.2 },
          rotate: { repeat: Infinity, duration: 0.8, ease: 'linear' },
        }}
        className="block h-8 w-8 rounded-full border-2 border-gray-200"
        style={{ borderTopColor: 'var(--accent)' }}
      />
    </div>
  )
}

export default PageLoader
