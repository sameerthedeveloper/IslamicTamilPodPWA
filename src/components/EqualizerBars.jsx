// Tiny animated equalizer, shown instead of a static play icon whenever
// audio is actually playing — a small nod to the waveform motifs common
// in Islamic audio apps.
function EqualizerBars({ className = '' }) {
  return (
    <span className={`eq-bars ${className}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  )
}

export default EqualizerBars
