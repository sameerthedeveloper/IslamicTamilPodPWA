import { useState } from 'react'

// Portrait/thumbnail URLs here are hotlinked from the source site
// (tamildawah.com) rather than hosted in our own Storage — a 404, a
// hotlink block, or a renamed file shows a broken-image icon instead of
// silently falling back to the initial-letter placeholder every card
// already supports. `onError` flips that fallback on once, permanently,
// for this mount (no retry loop against a URL that's already failed).
export function useImageFallback() {
  const [failed, setFailed] = useState(false)
  return { failed, onError: () => setFailed(true) }
}
