import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { motion } from 'framer-motion'
import { Camera, RotateCcw, ShieldCheck } from 'lucide-react'

const PHOTO_SRC = '/photo.jpg'

interface HeroPhotoProps {
  className?: string
  name?: string
}

export default function HeroPhoto({
  className = '',
  name = 'Nischay Mirdaha',
}: HeroPhotoProps) {
  const [customSrc, setCustomSrc] = useState<string | null>(null)
  const [defaultPhotoAvailable, setDefaultPhotoAvailable] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const activeSrc = customSrc ?? PHOTO_SRC
  const hasPhoto = Boolean(customSrc) || defaultPhotoAvailable

  useEffect(() => {
    const probe = new Image()
    probe.onload = () => setDefaultPhotoAvailable(true)
    probe.onerror = () => setDefaultPhotoAvailable(false)
    probe.src = PHOTO_SRC
    return () => {
      probe.onload = null
      probe.onerror = null
    }
  }, [])

  useEffect(() => {
    return () => {
      if (customSrc) URL.revokeObjectURL(customSrc)
    }
  }, [customSrc])

  const loadFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return
    setCustomSrc(URL.createObjectURL(file))
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    loadFile(e.target.files?.[0])
    e.target.value = ''
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    loadFile(e.dataTransfer.files?.[0])
  }

  const handleReset = () => {
    setCustomSrc(null)
  }

  return (
    <motion.figure
      className={`hero-photo-slot ${className} w-full max-w-[390px] m-0`}
      initial={{ opacity: 0, y: 22, rotate: -1.2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={`hero-photo-frame ${isDragging ? 'is-dragging' : ''} relative w-full aspect-[4/4.62] overflow-hidden border border-line-2 rounded-xl bg-[linear-gradient(160deg,#16161d,#0d0d12_70%)] shadow-[0_30px_70px_-30px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.03)] transition-all duration-300`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <span className="corner corner-tl absolute z-5 w-5 h-5 top-[11px] left-[11px] border-t-2 border-l-2 rounded-tl-[6px] border-[rgba(255,255,255,0.75)] pointer-events-none transition-all duration-300" aria-hidden="true" />
        <span className="corner corner-tr absolute z-5 w-5 h-5 top-[11px] right-[11px] border-t-2 border-r-2 rounded-tr-[6px] border-[rgba(255,255,255,0.75)] pointer-events-none transition-all duration-300" aria-hidden="true" />
        <span className="corner corner-bl absolute z-5 w-5 h-5 bottom-[11px] left-[11px] border-b-2 border-l-2 rounded-bl-[6px] border-[rgba(255,255,255,0.75)] pointer-events-none transition-all duration-300" aria-hidden="true" />
        <span className="corner corner-br absolute z-5 w-5 h-5 right-[11px] bottom-[11px] border-r-2 border-b-2 rounded-br-[6px] border-[rgba(255,255,255,0.75)] pointer-events-none transition-all duration-300" aria-hidden="true" />

        <div className="hero-photo-badge absolute z-5 top-[15px] left-[15px] inline-flex items-center gap-[7px] px-[0.8rem] py-[0.42rem] rounded-full border border-line-2 bg-[rgba(11,11,15,0.72)] backdrop-blur-[10px] font-mono text-[0.7rem] tracking-[0.02em] text-[#e8e6e0]">
          <ShieldCheck size={14} />
          <span>ID // SYSTEMS ANALYST</span>
        </div>

        {hasPhoto ? (
          <img
            src={activeSrc}
            alt={name}
            className="hero-portrait-img block w-full h-full object-cover object-[center_20%] portraitDrift"
            onError={() => {
              setCustomSrc(null)
              setDefaultPhotoAvailable(false)
            }}
          />
        ) : (
          <div
            className="photo-placeholder flex w-full h-full flex-col items-center justify-center p-[2rem] text-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
            }}
          >
            <span className="photo-glyph grid w-[76px] h-[76px] place-items-center rounded-[20px] border border-line-2 bg-[rgba(255,255,255,0.04)] font-display text-[1.55rem] font-bold text-text">NM</span>
            <p className="mb-0 mt-[0.25rem] font-semibold text-text">Add your portrait</p>
            <code className="px-[0.6rem] py-[0.28rem] rounded-[6px] border border-line bg-[rgba(255,255,255,0.08)] text-muted font-mono text-[0.72rem]">public/photo.jpg</code>
          </div>
        )}

        <span className="scanSweep" aria-hidden="true" />

        <figcaption className="hero-photo-footer absolute z-5 right-[11px] bottom-[11px] left-[11px] flex items-center justify-between gap-[0.7rem] px-[0.9rem] py-[0.8rem] rounded-[13px] border border-line bg-[rgba(9,9,13,0.78)] backdrop-blur-[14px]">
          <div>
            <strong className="block font-sans text-[0.9rem] font-bold leading-[-0.02em] text-text">{name}</strong>
            <span className="block mt-[0.22rem] max-w-[24ch] text-muted text-[0.76rem] leading-[1.4]">Itahari-8, Sunsari · Software Dev &amp; System Analysis</span>
          </div>
          <div className="hero-photo-actions flex flex-0-0-auto items-center gap-[0.35rem]">
            <button
              type="button"
              className="photo-mini-btn inline-flex items-center gap-[6px] px-[0.78rem] py-[0.5rem] rounded-[9px] border border-line-2 bg-[rgba(255,255,255,0.07)] text-text text-[0.8rem] font-semibold whitespace-nowrap cursor-pointer hover:bg-[rgba(255,255,255,0.14)] transition-all duration-200"
              onClick={() => fileInputRef.current?.click()}
              title="Preview your own photo"
            >
              <Camera size={13} />
              <span>{customSrc ? 'Change' : 'My Photo'}</span>
            </button>
            {customSrc ? (
              <button
                type="button"
                className="photo-mini-btn icon-only px-[0.5rem]"
                onClick={handleReset}
                title="Reset to public/photo.jpg"
                aria-label="Reset photo"
              >
                <RotateCcw size={13} />
              </button>
            ) : null}
          </div>
        </figcaption>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only-input absolute w-[1px] h-[1px] opacity-0 pointer-events-none"
          onChange={handleFileChange}
        />
      </div>
      <figcaption className="stage-caption mt-[0.85rem] font-mono text-[0.72rem] tracking-[0.02em] leading-[1.6] text-muted text-center">
        PORTRAIT · /photo.jpg · DRAG OR CLICK &ldquo;MY PHOTO&rdquo; TO SWAP
      </figcaption>
    </motion.figure>
  )
}
