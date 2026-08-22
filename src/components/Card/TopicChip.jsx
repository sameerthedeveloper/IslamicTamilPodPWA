import { motion } from 'framer-motion'

// Compact single-line variant of TopicCard — a quick-access strip rather
// than a browsable grid tile. Used where topics are a shortcut into
// Discover, not the main way to browse them.
function TopicChip({ name, icon: Icon, index = 0, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white py-2 pl-2.5 pr-4 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{ background: 'var(--accent-soft)' }}>
        <Icon size={14} style={{ color: 'var(--accent)' }} />
      </span>
      <span className="whitespace-nowrap text-sm font-medium text-gray-900">{name}</span>
    </motion.button>
  )
}

export default TopicChip
