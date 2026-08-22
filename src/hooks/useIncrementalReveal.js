import { useEffect, useRef, useState } from 'react'

// Renders long lists (thousands of episodes fetched in one Firestore
// query — see api/client.js's publishedEpisodes/getEpisodesByScholarId
// comments on why offset-pagination isn't cheap here) a page at a time
// instead of mounting every card — and its <img> — up front. A sentinel
// div at the end of the rendered slice grows the count as it scrolls
// into view, so more renders in only as the user actually scrolls there.
export function useIncrementalReveal(total, pageSize = 12) {
  const [visibleCount, setVisibleCount] = useState(Math.min(pageSize, total))
  const sentinelRef = useRef(null)

  useEffect(() => {
    setVisibleCount(Math.min(pageSize, total))
  }, [total, pageSize])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || visibleCount >= total) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => Math.min(c + pageSize, total))
        }
      },
      { rootMargin: '400px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [visibleCount, total, pageSize])

  return { visibleCount, sentinelRef, hasMore: visibleCount < total }
}
