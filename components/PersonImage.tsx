'use client'

interface PersonImageProps {
  src?: string
  alt: string
  className?: string
  size?: 'small' | 'medium' | 'large'
}

export default function PersonImage({ src, alt, className = '', size = 'medium' }: PersonImageProps) {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
  }

  if (!src) {
    return null
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} rounded-full object-cover border-2 border-yellow-500/50 ${className}`}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}
