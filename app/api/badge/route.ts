import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const style = searchParams.get('style') || 'cyberpunk'
  const text = searchParams.get('text') || 'Butlerian Jihad'
  const link = searchParams.get('link') || 'https://butji.com'

  // Generate SVG badge
  const svg = generateBadgeSVG(text, style, link)

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

function generateBadgeSVG(text: string, style: string, link: string): string {
  const width = text.length * 7 + 40 // Approximate width based on text length
  const height = 28

  const styles: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    cyberpunk: {
      bg: '#0a0a0a',
      border: '#00ffff',
      text: '#00ffff',
      glow: 'rgba(0, 255, 255, 0.5)',
    },
    dark: {
      bg: '#000000',
      border: '#666666',
      text: '#ffffff',
      glow: 'rgba(255, 255, 255, 0.3)',
    },
    red: {
      bg: '#1a0000',
      border: '#ff4444',
      text: '#ff4444',
      glow: 'rgba(255, 68, 68, 0.5)',
    },
  }

  const theme = styles[style] || styles.cyberpunk

  // Escape text for XML
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glow-${style}">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" rx="4" fill="${theme.bg}" stroke="${theme.border}" stroke-width="1.5" filter="url(#glow-${style})"/>
  <text x="${width / 2}" y="${height / 2 + 4}" font-family="'Courier New', Monaco, monospace" font-size="11" font-weight="bold" fill="${theme.text}" text-anchor="middle" dominant-baseline="middle">${escapedText}</text>
</svg>`
}
