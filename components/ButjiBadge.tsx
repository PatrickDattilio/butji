'use client'

import { getBaseUrl } from '@/lib/url'
import { useState } from 'react'

interface ButjiBadgeProps {
  style?: 'cyberpunk' | 'dark' | 'red'
  text?: string
  showEmbedCode?: boolean
}

export default function ButjiBadge({ 
  style = 'cyberpunk', 
  text = 'Butlerian Jihad',
  showEmbedCode = true 
}: ButjiBadgeProps) {
  const baseUrl = getBaseUrl()
  const badgeUrl = `${baseUrl}/api/badge?style=${style}&text=${encodeURIComponent(text)}&link=${encodeURIComponent(baseUrl)}`
  const embedCode = `<a href="${baseUrl}" target="_blank" rel="noopener noreferrer">
  <img src="${badgeUrl}" alt="Butlerian Jihad" style="height: 28px;" />
</a>`

  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="space-y-4 p-6 bg-cyber-dark rounded-sm border border-cyber-cyan/30 cyber-border">
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-bold text-cyber-cyan font-mono uppercase">
          &gt; Badge Preview
        </h3>
      </div>
      
      <div className="flex items-center gap-4 p-4 bg-cyber-darker rounded-sm">
        <img 
          src={badgeUrl} 
          alt={text}
          className="h-7"
        />
      </div>

      {showEmbedCode && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-cyber-cyan/80 font-mono uppercase">
              Embed Code
            </label>
            <button
              onClick={handleCopy}
              className="px-3 py-1 text-xs font-mono uppercase bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 hover:border-cyber-cyan/60 hover:bg-cyber-cyan/30 transition-all rounded-sm"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="p-3 bg-cyber-darker border border-cyber-cyan/30 rounded-sm text-xs text-cyber-cyan/70 font-mono overflow-x-auto">
            <code>{embedCode}</code>
          </pre>
        </div>
      )}

      <div className="text-xs text-cyber-cyan/60 font-mono">
        Add this badge to your site to show support for the Butlerian Jihad.
      </div>
    </div>
  )
}
