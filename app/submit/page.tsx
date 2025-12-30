import SubmissionForm from '@/components/SubmissionForm'

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-cyber-darker relative">
      {/* Scan line overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-30">
        <div className="h-full w-full" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)'
        }}></div>
      </div>
      
      <header className="bg-cyber-dark border-b border-cyber-cyan/40 cyber-border relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-5xl font-bold neon-cyan mb-2 font-mono uppercase tracking-wider glitch-text" data-text="Submit a Resource">
            Submit a Resource
          </h1>
          <p className="text-lg text-cyber-cyan/80 font-mono">
            &gt; Know of a tool, website, or resource that should be on Butji? Submit it here for review.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <SubmissionForm />
      </main>
    </div>
  )
}

