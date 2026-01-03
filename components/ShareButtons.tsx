'use client'

import { getAbsoluteUrl } from '@/lib/url'
import { Resource } from '@/types/resource'

interface ShareButtonsProps {
  resource: Resource
  resourceUrl?: string
}

export default function ShareButtons({ resource, resourceUrl }: ShareButtonsProps) {
  const url = resourceUrl || getAbsoluteUrl(`/resources/${resource.id}`)
  const text = `${resource.title} - ${resource.description.substring(0, 100)}${resource.description.length > 100 ? '...' : ''}`
  const hashtags = 'ButlerianJihad,AntiAI,HumanCreativity'
  
  // Encode for URLs
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(text)
  const encodedHashtags = encodeURIComponent(hashtags)
  
  const shareLinks = {
    twitter: getAbsoluteUrl('/no-twitter'), // Redirect to anti-Twitter page
    bluesky: `https://bsky.app/intent/compose?text=${encodedText}%20${encodedUrl}`,
    mastodon: (instance: string = 'mastodon.social') => 
      `https://${instance}/share?text=${encodedText}%20${encodedUrl}`,
    reddit: `https://reddit.com/submit?title=${encodeURIComponent(resource.title)}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  }
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  
  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-cyber-cyan/20">
      <span className="text-xs text-cyber-cyan/60 font-mono uppercase mr-2">Share:</span>
      
      <a
        href={shareLinks.bluesky}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase bg-cyber-dark border border-cyber-cyan/40 text-cyber-cyan hover:border-cyber-cyan/60 hover:bg-cyber-cyan/10 transition-all rounded-sm"
        title="Share on Bluesky"
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566 2.519 2 3.662 2 5.028c0 2.203 1.567 4.423 3.45 6.406.597.626 1.225 1.218 1.865 1.771a.95.95 0 01.095 1.228c-.024.034-.05.067-.077.099-.487.599-1.006 1.181-1.54 1.728C3.706 18.83 3 19.967 3 20.5c0 .828.673 1.5 1.5 1.5.631 0 1.933-.538 3.475-1.613 3.135-2.17 6.87-6.464 10.326-13.521.598-1.213.509-2.412-.139-3.092-.652-.684-1.717-.792-2.859-.24L12 10.8z"/>
        </svg>
        Bluesky
      </a>
      
      <a
        href={shareLinks.reddit}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase bg-cyber-dark border border-cyber-cyan/40 text-cyber-cyan hover:border-cyber-cyan/60 hover:bg-cyber-cyan/10 transition-all rounded-sm"
        title="Share on Reddit"
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-2.597c-.567-.567-1.489-.567-2.056 0l-2.597 2.597a1.25 1.25 0 0 1-2.499-.056c0-.688.561-1.249 1.25-1.249h5.247zm-4.946 3.821a4.105 4.105 0 1 0 0 8.21 4.105 4.105 0 0 0 0-8.21zm-6.128 0a4.105 4.105 0 1 0 0 8.21 4.105 4.105 0 0 0 0-8.21zm6.128 2.292a1.813 1.813 0 1 1 0 3.626 1.813 1.813 0 0 1 0-3.626zm-6.128 0a1.813 1.813 0 1 1 0 3.626 1.813 1.813 0 0 1 0-3.626zm12.994 2.497c-.688 0-1.25-.561-1.25-1.25 0-.687.562-1.248 1.25-1.248h2.597c.567 0 1.489.567 2.056 0l2.597-2.597c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.499.056l-2.597 2.597c-.567.567-1.489.567-2.056 0l-2.597-2.597c-.688 0-1.25-.561-1.25-1.249a1.25 1.25 0 0 1 2.499-.056l2.597 2.597c.567.567 1.489.567 2.056 0l2.597-2.597c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.499.056l-2.597-2.597c-.567-.567-1.489-.567-2.056 0l-2.597 2.597z"/>
        </svg>
        Reddit
      </a>
      
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase bg-cyber-dark border border-cyber-cyan/40 text-cyber-cyan hover:border-cyber-cyan/60 hover:bg-cyber-cyan/10 transition-all rounded-sm cursor-pointer"
        title="Copy link"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Copy Link
      </button>
      
      <a
        href={shareLinks.twitter}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase bg-cyber-dark border border-red-500/40 text-red-400 hover:border-red-500/60 hover:bg-red-500/10 transition-all rounded-sm"
        title="Fuck Twitter/X - It's run by a nazi"
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        Twitter
      </a>
    </div>
  )
}
