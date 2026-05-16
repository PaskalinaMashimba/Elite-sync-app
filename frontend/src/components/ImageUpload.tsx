import { useState, useRef } from 'react'

interface Props {
  currentUrl?: string
  onUpload: (url: string) => void
  size?: 'sm' | 'md' | 'lg'
  shape?: 'circle' | 'square'
  label?: string
}

export default function ImageUpload({ currentUrl, onUpload, size = 'md', shape = 'circle', label = 'Upload Photo' }: Props) {
  const [preview, setPreview] = useState<string>(currentUrl || '')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const sizeClass = { sm: 'w-16 h-16', md: 'w-20 h-20', lg: 'w-28 h-28' }[size]
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl'

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return }
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return }

    setUploading(true); setError('')

    // Show local preview immediately
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result as string
      setPreview(base64)

      try {
        // Try Imgur upload
        const formData = new FormData()
        formData.append('image', file)
        const res = await fetch('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: { Authorization: 'Client-ID 546c25a59c58ad7' },
          body: formData
        })
        const data = await res.json()
        if (data.success && data.data?.link) {
          setPreview(data.data.link)
          onUpload(data.data.link)
        } else {
          // Use base64 directly — works but larger storage
          onUpload(base64)
        }
      } catch {
        // Fallback to base64
        onUpload(base64)
      }
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`${sizeClass} ${shapeClass} relative overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-400 transition cursor-pointer bg-gray-50`}
        onClick={() => inputRef.current?.click()}>
        {preview ? (
          <img src={preview} className={`w-full h-full object-cover`} alt="Uploaded" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1">
            <span className="text-2xl">📷</span>
            <span className="text-xs text-center px-1">Click to upload</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {preview && !uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition flex items-center justify-center">
            <span className="text-white text-sm font-medium opacity-0 hover:opacity-100">✏️ Change</span>
          </div>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden" onChange={handleFile} />

      <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
        className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
        {uploading ? '⏳ Uploading...' : `📁 ${label}`}
      </button>

      {error && <p className="text-red-500 text-xs text-center">{error}</p>}
      <p className="text-gray-400 text-xs text-center">JPG, PNG, WebP — max 5MB</p>
    </div>
  )
}