import { motion } from 'framer-motion'

// Category card used on Discover — icon-forward rather than image-forward
// since topics ("Tafseer", "Salah & Worship", …) don't have artwork.
function TopicCard({ name, icon: Icon, active, index = 0, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border p-4 text-left shadow-sm transition-shadow duration-200 hover:shadow-md"
      style={{
        borderColor: active ? 'var(--accent)' : '#e5e7eb',
        background: active ? 'var(--accent-soft)' : 'white',
      }}>
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: active ? 'white' : 'var(--accent-soft)' }}
      >
        <Icon size={18} style={{ color: 'var(--accent)' }} />
      </div>

      <p className="mt-3 font-medium text-gray-900">
        {name}
      </p>
    </motion.button>
  )
}

export default TopicCard
