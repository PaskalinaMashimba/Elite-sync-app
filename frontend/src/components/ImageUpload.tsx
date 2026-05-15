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

  const sizeClass = size === 'sm' ? 'w-16 h-16' : size === 'lg' ? 'w-28 h-28' : 'w-20 h-20'
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl'

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB')
      return
    }

    setUploading(true)
    setError('')

    // Convert to base64 for preview
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result as string
      setPreview(base64)

      // Upload to ImgBB (free image hosting)
      try {
        const formData = new FormData()
        formData.append('image', file)
        // Using imgur anonymous upload
        const res = await fetch('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: { Authorization: 'Client-ID 546c25a59c58ad7' },
          body: formData
        })
        const data = await res.json()
        if (data.success) {
          onUpload(data.data.link)
          setPreview(data.data.link)
        } else {
          // Fall back to base64 if upload fails
          onUpload(base64)
        }
      } catch {
        // Use base64 as fallback
        onUpload(base64)
      }
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizeClass} ${shapeClass} relative overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-400 transition cursor-pointer group`}
        onClick={() => inputRef.current?.click()}>
        {preview ? (
          <img src={preview} className={`w-full h-full object-cover ${shapeClass}`} alt="Profile" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 text-2xl">📷</div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center">
          <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition">
            {uploading ? '⏳' : '✏️'}
          </span>
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
        {uploading ? 'Uploading...' : label}
      </button>

      {error && <p className="text-red-500 text-xs">{error}</p>}
      <p className="text-gray-400 text-xs text-center">JPG, PNG up to 5MB<br/>Or paste a URL below</p>
    </div>
  )
}