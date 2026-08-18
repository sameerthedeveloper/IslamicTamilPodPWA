import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'

function ImageUpload({ value, onChange }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(value || null)

  const handleFile = (file) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    onChange?.(file, url)
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]) }}
      onClick={() => inputRef.current?.click()}
      className="relative flex h-32 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl text-center"
      style={{ border: '1.5px dashed var(--border)', background: 'var(--base)' }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {preview ? (
        <>
          <img src={preview} alt="" className="absolute inset-0 h-full w-full rounded-xl object-cover" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setPreview(null); onChange?.(null, null) }}
            className="absolute right-1.5 top-1.5 rounded-full p-1 text-white"
            style={{ background: 'rgba(28,25,23,0.6)' }}
          >
            <X size={12} />
          </button>
        </>
      ) : (
        <>
          <ImagePlus size={20} style={{ color: 'var(--muted)' }} />
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Drag & drop, or click to upload</p>
        </>
      )}
    </div>
  )
}

export default ImageUpload
