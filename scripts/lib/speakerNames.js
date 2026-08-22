// Shared between the seed and image-import scripts so a speaker-name
// mapping never drifts out of sync between them again — that drift is
// exactly what caused duplicate "<Name> Shorts" scholars earlier.

// The source site publishes short-clip episodes from the same scholar
// under a "<Name> Shorts" byline (e.g. "Ali Akbar Umari Shorts") — those
// resolve back to the real scholar, not a second one.
const SHORTS_SUFFIX = / Shorts$/i

// scripts/seedAbdulBasithEpisodes.js already created a scholar named
// "Abdul Basith"; this source's fuller "Abdul Basith Bukhari" byline must
// resolve to that same scholar rather than create a duplicate.
const SPEAKER_ALIASES = {
  'Abdul Basith Bukhari': 'Abdul Basith',
}

export function canonicalSpeakerName(name) {
  if (!name) return name
  const stripped = name.replace(SHORTS_SUFFIX, '').trim()
  return SPEAKER_ALIASES[stripped] ?? stripped
}
