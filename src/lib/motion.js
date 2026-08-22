// Shared framer-motion presets so cards/lists animate consistently across
// the app instead of each component hand-rolling its own timing curve.

export const EASE_OUT = [0.16, 1, 0.3, 1]

// Entrance for items in a grid/row/list — fades and rises in, staggered by
// `index` (capped so a long list doesn't take forever to finish revealing).
export function cardEntrance(index = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '0px 0px -60px 0px' },
    transition: { duration: 0.35, delay: Math.min(index, 8) * 0.05, ease: EASE_OUT },
  }
}

export const cardHover = {
  whileHover: { y: -3 },
  whileTap: { scale: 0.98 },
}
