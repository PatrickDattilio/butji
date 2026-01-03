import { Citation } from '@/types/company'
import Link from 'next/link'

interface CitationListProps {
  citations: Citation[]
  fieldName: string
}

export default function CitationList({ citations, fieldName }: CitationListProps) {
  if (!citations || citations.length === 0) return null

  return (
    <div className="mt-2 pt-2 border-t border-red-500/20">
      <p className="text-xs text-red-400/50 font-mono uppercase mb-1">{fieldName} Sources:</p>
      <ol className="list-decimal list-inside space-y-1 ml-2">
        {citations.map((citation, index) => (
          <li key={index} className="text-xs text-red-400/70 font-mono">
            {citation.title ? (
              <>
                <Link
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 underline transition-colors"
                >
                  {citation.title}
                </Link>
                {citation.date && (
                  <span className="text-red-400/50 ml-1">({citation.date})</span>
                )}
              </>
            ) : (
              <Link
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300 underline transition-colors break-all"
              >
                {citation.url}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
