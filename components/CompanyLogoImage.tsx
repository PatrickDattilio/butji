'use client'

interface CompanyLogoImageProps {
  src?: string
  alt: string
  className?: string
}

export default function CompanyLogoImage({ src, alt, className = '' }: CompanyLogoImageProps) {
  if (!src) {
    return null
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`w-10 h-10 object-contain ${className}`}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}
