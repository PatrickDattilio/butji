'use client'

import { useState } from 'react'
import Image from 'next/image'

interface CompanyLogoProps {
  logoUrl: string
  companyName: string
  className?: string
}

export default function CompanyLogo({ logoUrl, companyName, className = '' }: CompanyLogoProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Don't render if logoUrl is invalid
  if (!logoUrl || (!logoUrl.startsWith('http') && !logoUrl.startsWith('/'))) {
    return null
  }

  if (imageError) {
    // Fallback: show company initials or nothing
    return (
      <div className={`flex-shrink-0 flex items-center justify-center rounded-sm border border-red-500/30 bg-cyber-darker/50 p-2 ${className}`}>
        <span className="text-red-400/50 font-mono text-xs uppercase">
          {companyName.substring(0, 2)}
        </span>
      </div>
    )
  }

  return (
    <div className="flex-shrink-0">
      <Image
        src={logoUrl}
        alt={`${companyName} logo`}
        width={80}
        height={80}
        className={`w-16 h-16 md:w-20 md:h-20 object-contain rounded-sm border border-red-500/30 bg-cyber-darker/50 p-2 ${className}`}
        unoptimized
        onError={() => {
          setImageError(true)
          setImageLoading(false)
        }}
        onLoad={() => setImageLoading(false)}
      />
      {imageLoading && (
        <div className="absolute w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-sm border border-red-500/30 bg-cyber-darker/50">
          <span className="text-red-400/30 font-mono text-xs">Loading...</span>
        </div>
      )}
    </div>
  )
}
