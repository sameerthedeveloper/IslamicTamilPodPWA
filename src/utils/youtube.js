// Accepts a bare video id, watch URL, youtu.be short link, or Shorts URL.
export function extractYoutubeId(input) {
  const trimmed = (input || '').trim()
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed
  try {
    const url = new URL(trimmed)
    if (url.hostname === 'youtu.be') return url.pathname.slice(1) || null
    if (url.searchParams.get('v')) return url.searchParams.get('v')
    const shortsMatch = url.pathname.match(/\/shorts\/([\w-]{11})/)
    if (shortsMatch) return shortsMatch[1]
  } catch {
    return null
  }
  return null
}

// oEmbed is free, keyless, CORS-enabled — gives title + thumbnail.
// Duration isn't available this way; the hidden player fills it in live.
export async function fetchYoutubeMetadata(youtubeId) {
  const res = await fetch(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${youtubeId}`)}&format=json`,
  )
  if (!res.ok) throw new Error('Could not fetch video info from YouTube.')
  const data = await res.json()
  return {
    title: data.title,
    thumbnail: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    author: data.author_name,
  }
}
