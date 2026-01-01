import { NewsArticle } from '@/types/news'
import Link from 'next/link'
import Image from 'next/image'

interface NewsCardProps {
  article: NewsArticle
}

export default function NewsCard({ article }: NewsCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
  }

  return (
    <Link
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <article className="bg-cyber-dark border border-cyber-cyan/20 rounded-sm p-4 md:p-6 hover:border-cyber-cyan/40 hover:bg-cyber-cyan/5 transition-all h-full flex flex-col">
        {article.imageUrl && (
          <div className="mb-4 overflow-hidden rounded-sm border border-cyber-cyan/20 relative w-full h-48">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(e) => {
                // Hide image on error
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}
        
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2 text-xs text-cyber-cyan/60">
            <span className="font-mono uppercase">{article.source}</span>
            <time className="font-mono" dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          </div>
          
          <h3 className="text-lg md:text-xl font-bold text-cyber-cyan mb-2 group-hover:text-cyber-cyan/80 transition-colors line-clamp-2">
            {article.title}
          </h3>
          
          {article.description && (
            <p className="text-cyber-cyan/70 text-sm md:text-base mb-3 line-clamp-3 flex-1">
              {article.description.replace(/<[^>]*>/g, '').trim()}
            </p>
          )}
          
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-auto">
              {article.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs font-mono uppercase bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan/80 rounded-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
