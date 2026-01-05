import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cyber-darker relative">
      {/* Scan line overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-30">
        <div className="h-full w-full" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)'
        }}></div>
      </div>
      
      {/* Header */}
      <header className="bg-cyber-dark border-b border-cyber-cyan/40 cyber-border relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-cyber-cyan hover:text-cyber-cyan/80 font-mono transition-colors group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">&lt;</span>
              <span>Back to Home</span>
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold neon-cyan mb-2 font-mono tracking-wider glitch-text" data-text="BUTlerian JIhad">
            BUTlerian JIhad
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-cyber-cyan/80 font-mono">
            &gt; A curated collection of anti-AI tools, websites, and resources to help organize the effort against the machines.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
        <div className="text-center space-y-8">
          {/* 404 Error Code */}
          <div className="space-y-4">
            <h2 className="text-6xl md:text-8xl font-bold neon-cyan font-mono tracking-wider glitch-text" data-text="404">
              404
            </h2>
            <p className="text-xl md:text-2xl text-cyber-cyan/90 font-mono">
              &gt; ERROR: PAGE NOT FOUND
            </p>
            <p className="text-base md:text-lg text-cyber-cyan/70 font-mono max-w-2xl mx-auto">
              The page you're looking for doesn't exist or has been moved. The machines may have deleted it.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="pt-8">
            <p className="text-cyber-cyan/80 font-mono mb-6 text-sm md:text-base">
              &gt; Navigate to:
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/"
                className="px-4 py-2 bg-cyber-dark border border-cyber-cyan/40 text-cyber-cyan rounded-sm hover:bg-cyber-cyan/10 hover:border-cyber-cyan/60 transition-all font-mono font-bold uppercase text-sm terminal-glow"
              >
                Home
              </Link>
              <Link
                href="/companies"
                className="px-4 py-2 bg-cyber-dark border border-red-500/40 text-red-400 rounded-sm hover:bg-red-500/10 hover:border-red-500/60 transition-all font-mono font-bold uppercase text-sm terminal-glow"
              >
                Companies
              </Link>
              <Link
                href="/news"
                className="px-4 py-2 bg-cyber-dark border border-cyber-cyan/40 text-cyber-cyan rounded-sm hover:bg-cyber-cyan/10 hover:border-cyber-cyan/60 transition-all font-mono font-bold uppercase text-sm terminal-glow"
              >
                News
              </Link>
              <Link
                href="/manifesto"
                className="px-4 py-2 bg-cyber-dark border border-cyber-magenta/40 text-cyber-magenta rounded-sm hover:bg-cyber-magenta/10 hover:border-cyber-magenta/60 transition-all font-mono font-bold uppercase text-sm terminal-glow"
              >
                Manifesto
              </Link>
            </div>
          </div>

          {/* Additional Help Text */}
          <div className="pt-8 border-t border-cyber-cyan/20">
            <p className="text-sm text-cyber-cyan/60 font-mono">
              &gt; If you believe this is an error, the link may be broken. Try navigating from the homepage.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-cyber-dark border-t border-cyber-cyan/40 mt-8 md:mt-16 cyber-border relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <p className="text-center text-cyber-cyan/60 text-xs md:text-sm font-mono">
            &gt; Butji.com - Organizing the effort against the machines
          </p>
        </div>
      </footer>
    </div>
  )
}
