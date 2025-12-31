import Link from 'next/link'
import CompanySubmissionForm from '@/components/CompanySubmissionForm'

export default function SubmitCompanyPage() {
  return (
    <div className="min-h-screen bg-cyber-darker relative">
      {/* Scan line overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-30">
        <div className="h-full w-full" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(239, 68, 68, 0.03) 2px, rgba(239, 68, 68, 0.03) 4px)'
        }}></div>
      </div>
      
      <header className="bg-cyber-dark border-b border-red-500/40 cyber-border relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link 
            href="/companies"
            className="inline-flex items-center gap-2 text-red-400 hover:text-red-400/80 font-mono mb-4 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">&lt;</span>
            <span>Back to Companies</span>
          </Link>
          <h1 className="text-5xl font-bold text-red-500 mb-2 font-mono uppercase tracking-wider glitch-text" data-text="Submit a Company">
            Submit a Company
          </h1>
          <p className="text-lg text-red-400/80 font-mono">
            &gt; Know of an AI company that should be tracked? Submit it here for review.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <CompanySubmissionForm />
      </main>
    </div>
  )
}
