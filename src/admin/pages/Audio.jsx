import { useEffect, useRef, useState } from 'react'
import { UploadCloud, CheckCircle2, XCircle } from 'lucide-react'
import TopBar from '../components/TopBar'
import SearchableSelect from '../components/SearchableSelect'
import { audioApi, episodesApi } from '../api/client'

function Audio() {
  const [episodes, setEpisodes] = useState([])
  const [episodeId, setEpisodeId] = useState(null)
  const [queue, setQueue] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    episodesApi.list(1, 100).then((d) => setEpisodes(d.data ?? []))
  }, [])

  const handleFile = async (file) => {
    if (!file || !episodeId) return
    const episode = episodes.find((e) => e.id === episodeId)
    const jobId = crypto.randomUUID()
    setQueue((q) => [{ id: jobId, filename: file.name, episode: episode?.title, progress: 0, status: 'uploading' }, ...q])

    try {
      await audioApi.upload(episodeId, file, (pct) => {
        setQueue((q) => q.map((j) => (j.id === jobId ? { ...j, progress: pct } : j)))
      })
      setQueue((q) => q.map((j) => (j.id === jobId ? { ...j, progress: 100, status: 'done' } : j)))
    } catch (err) {
      setQueue((q) => q.map((j) => (j.id === jobId ? { ...j, status: 'error' } : j)))
    }
  }

  return (
    <>
      <TopBar crumb="Content" title="Audio Library" />
      <main className="px-8 py-6">
        <p className="mb-4 text-xs" style={{ color: 'var(--muted)' }}>
          Upload is synchronous — the file is stored and the episode marked READY immediately. There's no background
          transcode/BullMQ job yet, so this queue reflects upload progress only, not processing status.
        </p>

        <div
          className="mb-6 flex flex-col gap-3 rounded-2xl p-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="max-w-xs">
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Episode</label>
            <SearchableSelect options={episodes} value={episodeId} onChange={setEpisodeId} getLabel={(e) => e.title} placeholder="Choose episode…" />
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]) }}
            onClick={() => episodeId && inputRef.current?.click()}
            className="flex h-28 flex-col items-center justify-center gap-1.5 rounded-xl text-center"
            style={{
              border: '1.5px dashed var(--border)',
              background: 'var(--base)',
              cursor: episodeId ? 'pointer' : 'not-allowed',
              opacity: episodeId ? 1 : 0.5,
            }}
          >
            <input ref={inputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            <UploadCloud size={20} style={{ color: 'var(--muted)' }} />
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {episodeId ? 'Drag & drop audio, or click to upload' : 'Choose an episode first'}
            </p>
          </div>
        </div>

        {queue.length > 0 && (
          <div className="rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {queue.map((j, i) => (
              <div key={j.id} className="px-5 py-3" style={i < queue.length - 1 ? { borderBottom: '1px solid var(--border)' } : undefined}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium font-data" style={{ color: 'var(--ink)' }}>{j.filename}</p>
                    <p className="truncate text-xs" style={{ color: 'var(--muted)' }}>{j.episode}</p>
                  </div>
                  {j.status === 'done' && <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} />}
                  {j.status === 'error' && <XCircle size={16} style={{ color: 'var(--danger)' }} />}
                </div>
                <div className="mt-2 h-1 rounded-full" style={{ background: 'var(--border)' }}>
                  <div
                    className="h-1 rounded-full transition-all"
                    style={{ width: `${j.progress}%`, background: j.status === 'error' ? 'var(--danger)' : 'var(--accent)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

export default Audio
