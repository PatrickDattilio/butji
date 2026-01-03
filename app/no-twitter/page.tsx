import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'No Twitter/X - Butji.com',
  description: 'Twitter/X is run by a nazi. Use Bluesky, Mastodon, or other alternatives instead.',
}

export default function NoTwitterPage() {
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
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-cyber-cyan hover:text-cyber-cyan/80 font-mono mb-4 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">&lt;</span>
            <span>Back to Resources</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="bg-cyber-dark rounded-sm border border-red-500/40 cyber-border p-8 md:p-12 text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-red-500 font-mono uppercase tracking-wider glitch-text" data-text="Fuck Twitter/X">
            Fuck Twitter/X
          </h1>
          
          <p className="text-2xl md:text-3xl font-bold text-red-400 font-mono">
            It&apos;s run by a nazi.
          </p>

          <div className="flex justify-center py-8">
            <Image
              src="/elon-musk-nazi.gif"
              alt="Elon Musk speaking"
              width={600}
              height={400}
              className="rounded-sm border border-red-500/40"
              unoptimized
            />
          </div>

          <div className="space-y-6 text-cyber-cyan/90 font-mono leading-relaxed">
            <p className="text-lg">
              Twitter/X is owned and operated by Elon Musk, who has promoted white supremacist content, 
              reinstated nazis, and used the platform to amplify hate speech.
            </p>

            <p className="text-lg">
              Don&apos;t give them your traffic, your data, or your attention.
            </p>

            <div className="pt-6 space-y-4">
              <h2 className="text-2xl font-bold neon-cyan font-mono uppercase">
                &gt; Use These Instead
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://bsky.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 hover:border-cyber-cyan/60 hover:bg-cyber-cyan/30 transition-all rounded-sm font-mono font-bold uppercase terminal-glow"
                >
                  Bluesky
                </a>
                <a
                  href="https://joinmastodon.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 hover:border-cyber-cyan/60 hover:bg-cyber-cyan/30 transition-all rounded-sm font-mono font-bold uppercase terminal-glow"
                >
                  Mastodon
                </a>
                <Link
                  href="/"
                  className="px-6 py-3 bg-cyber-dark text-cyber-cyan border border-cyber-cyan/40 hover:border-cyber-cyan/60 hover:bg-cyber-cyan/10 transition-all rounded-sm font-mono font-bold uppercase terminal-glow"
                >
                  Back to Butji
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
