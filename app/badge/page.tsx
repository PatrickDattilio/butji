import type { Metadata } from 'next'
import Link from 'next/link'
import ButjiBadge from '@/components/ButjiBadge'

export const metadata: Metadata = {
  title: 'Get Butji Badge - Butlerian Jihad',
  description: 'Add a Butlerian Jihad badge to your website. Show your support for human creativity and resistance against the machines.',
}

export default function BadgePage() {
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
          <h1 className="text-5xl font-bold neon-cyan mb-2 font-mono uppercase tracking-wider glitch-text" data-text="Get Badge">
            Get Badge
          </h1>
          <p className="text-lg text-cyber-cyan/80 font-mono">
            &gt; Add a Butlerian Jihad badge to your website
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="space-y-8">
          <section className="bg-cyber-dark rounded-sm border border-cyber-cyan/30 cyber-border p-8">
            <h2 className="text-2xl font-bold neon-cyan mb-4 font-mono uppercase tracking-wider">
              &gt; Show Your Support
            </h2>
            <p className="text-cyber-cyan/90 font-mono leading-relaxed mb-6">
              Add a Butlerian Jihad badge to your website, blog, or profile to show your support 
              for human creativity and resistance against the machines. The badge links back to 
              butji.com and helps spread awareness.
            </p>

            <ButjiBadge style="cyberpunk" text="Butlerian Jihad" />
          </section>

          <section className="bg-cyber-dark rounded-sm border border-cyber-cyan/30 cyber-border p-8">
            <h2 className="text-2xl font-bold neon-cyan mb-4 font-mono uppercase tracking-wider">
              &gt; Alternative Styles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ButjiBadge style="cyberpunk" text="Butlerian Jihad" showEmbedCode={false} />
              <ButjiBadge style="dark" text="Butlerian Jihad" showEmbedCode={false} />
              <ButjiBadge style="red" text="Butlerian Jihad" showEmbedCode={false} />
            </div>
          </section>

          <section className="bg-cyber-dark rounded-sm border border-cyber-cyan/30 cyber-border p-8">
            <h2 className="text-2xl font-bold neon-cyan mb-4 font-mono uppercase tracking-wider">
              &gt; Custom Badge URL
            </h2>
            <p className="text-cyber-cyan/90 font-mono leading-relaxed mb-4">
              You can also use the badge API directly:
            </p>
            <pre className="p-4 bg-cyber-darker border border-cyber-cyan/30 rounded-sm text-sm text-cyber-cyan/70 font-mono overflow-x-auto">
              <code>{`/api/badge?style=cyberpunk&text=Your+Text&link=https://your-link.com`}</code>
            </pre>
            <div className="mt-4 text-xs text-cyber-cyan/60 font-mono space-y-1">
              <p><strong>Parameters:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><code>style</code> - cyberpunk, dark, or red</li>
                <li><code>text</code> - Badge text (URL encoded)</li>
                <li><code>link</code> - URL to link to (optional, defaults to butji.com)</li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
