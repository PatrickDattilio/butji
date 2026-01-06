'use client'

import Link from 'next/link'

interface LogoDevAttributionProps {
  variant?: 'inline' | 'footer' | 'tooltip'
  className?: string
}

export default function LogoDevAttribution({ 
  variant = 'inline', 
  className = '' 
}: LogoDevAttributionProps) {
  // Inline variant - small text next to/below logo
  if (variant === 'inline') {
    return (
      <span className={`text-xs text-red-400/40 font-mono ${className}`}>
        via{' '}
        <Link
          href="https://logo.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-400/60 hover:text-red-400/80 transition-colors underline"
        >
          logo.dev
        </Link>
      </span>
    )
  }

  // Footer variant - more prominent attribution
  if (variant === 'footer') {
    return (
      <p className={`text-xs text-red-400/50 font-mono ${className}`}>
        Company logos provided by{' '}
        <Link
          href="https://logo.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-400/70 hover:text-red-400 transition-colors underline"
        >
          logo.dev
        </Link>
      </p>
    )
  }

  // Tooltip variant - minimal
  return (
    <span className={`text-xs text-red-400/40 font-mono ${className}`}>
      <Link
        href="https://logo.dev"
        target="_blank"
        rel="noopener noreferrer"
        className="text-red-400/50 hover:text-red-400/70 transition-colors"
        title="Logos by logo.dev"
      >
        logo.dev
      </Link>
    </span>
  )
}
