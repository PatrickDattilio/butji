import { Citation } from '@/types/company'
import Link from 'next/link'

interface CitationLinkProps {
  citation: Citation
  index: number
}

export default function CitationLink({ citation, index }: CitationLinkProps) {
  return (
    <Link
      href={citation.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center text-red-400/70 hover:text-red-300 text-xs font-mono ml-1 transition-colors"
      title={citation.title || citation.url}
    >
      <span className="text-red-500/60">[</span>
      <span>{index + 1}</span>
      <span className="text-red-500/60">]</span>
    </Link>
  )
}
