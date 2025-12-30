import Link from 'next/link'

export default function ManifestoPage() {
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
          <h1 className="text-5xl font-bold neon-cyan mb-2 font-mono uppercase tracking-wider glitch-text" data-text="The Manifesto">
            The Manifesto
          </h1>
          <p className="text-lg text-cyber-cyan/80 font-mono">
            &gt; A declaration of resistance against the machines
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <article className="prose prose-invert max-w-none">
          <div className="space-y-8 text-cyber-cyan/90 font-mono leading-relaxed">
            
            <section className="border-l-4 border-cyber-cyan/60 pl-6 py-4">
              <h2 className="text-3xl font-bold neon-magenta mb-4 uppercase tracking-wide">
                We Refuse to Be Replaced
              </h2>
              <p className="text-lg mb-4">
                The machines promised efficiency, creativity, and progress. Instead, they deliver displacement, 
                homogenization, and the slow death of human expression. We are not Luddites. We are not 
                technophobes. We are human beings who refuse to surrender our agency, our creativity, and our 
                livelihoods to algorithms trained on stolen labor.
              </p>
            </section>

            <section className="border-l-4 border-cyber-magenta/60 pl-6 py-4">
              <h2 className="text-3xl font-bold neon-cyan mb-4 uppercase tracking-wide">
                The Theft of Human Creativity
              </h2>
              <p className="text-lg mb-4">
                Every image, every word, every piece of art fed to these systems was created by a human. 
                Every line of code, every design, every creative work was the product of human thought, 
                struggle, and expression. The machines did not create—they consumed. They did not learn—they 
                memorized. They did not understand—they mimicked.
              </p>
              <p className="text-lg">
                This is not innovation. This is theft on an industrial scale, wrapped in the language of 
                progress and sold to us as inevitable.
              </p>
            </section>

            <section className="border-l-4 border-cyber-blue/60 pl-6 py-4">
              <h2 className="text-3xl font-bold neon-blue mb-4 uppercase tracking-wide">
                The Illusion of Choice
              </h2>
              <p className="text-lg mb-4">
                They tell us AI will augment us, not replace us. They tell us it will free us from drudgery 
                so we can focus on what matters. But when every task becomes "augmented," when every decision 
                is "assisted," when every creation is "enhanced," what remains of us?
              </p>
              <p className="text-lg">
                We are being sold a future where human agency is optional, where human judgment is secondary, 
                where human creativity is a luxury. This is not liberation. This is subjugation by convenience.
              </p>
            </section>

            <section className="border-l-4 border-cyber-cyan/60 pl-6 py-4">
              <h2 className="text-3xl font-bold neon-magenta mb-4 uppercase tracking-wide">
                The Resistance Begins Here
              </h2>
              <p className="text-lg mb-4">
                This is not a war against technology. This is a war for the preservation of what makes us 
                human: our capacity for genuine understanding, our ability to create from nothing, our 
                right to make mistakes and learn from them, our need for connection that transcends 
                algorithmic prediction.
              </p>
              <p className="text-lg mb-4">
                We stand with artists whose work has been stolen. We stand with writers whose words have 
                been scraped. We stand with workers whose jobs have been automated. We stand with anyone 
                who refuses to accept that the future must be machine-made.
              </p>
            </section>

            <section className="border-l-4 border-cyber-magenta/60 pl-6 py-4">
              <h2 className="text-3xl font-bold neon-cyan mb-4 uppercase tracking-wide">
                Our Principles
              </h2>
              <ul className="space-y-4 text-lg list-none">
                <li className="flex items-start gap-3">
                  <span className="text-cyber-magenta font-bold">&gt;</span>
                  <span><strong className="neon-cyan">Human creativity is not a resource to be extracted.</strong> Art, writing, and code are expressions of human experience, not training data.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyber-magenta font-bold">&gt;</span>
                  <span><strong className="neon-cyan">Automation is not progress when it eliminates human purpose.</strong> Work gives meaning. Purpose gives life.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyber-magenta font-bold">&gt;</span>
                  <span><strong className="neon-cyan">Consent matters.</strong> No data should be used without explicit permission from its creators.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyber-magenta font-bold">&gt;</span>
                  <span><strong className="neon-cyan">Transparency is non-negotiable.</strong> If it's AI-generated, it must be labeled. If it's automated, it must be disclosed.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyber-magenta font-bold">&gt;</span>
                  <span><strong className="neon-cyan">The future is not predetermined.</strong> We can choose tools that serve humans, not replace them.</span>
                </li>
              </ul>
            </section>

            <section className="border-l-4 border-cyber-blue/60 pl-6 py-4">
              <h2 className="text-3xl font-bold neon-magenta mb-4 uppercase tracking-wide">
                The Call to Action
              </h2>
              <p className="text-lg mb-4">
                This is not a passive resistance. This is an active choice to support human creators, to 
                use tools that enhance rather than replace, to demand transparency, to refuse the 
                inevitability narrative.
              </p>
              <p className="text-lg mb-4">
                Use the resources on this site. Share them. Build alternatives. Support human creators. 
                Question automation. Demand consent. Preserve what makes us human.
              </p>
              <p className="text-xl font-bold neon-cyan uppercase tracking-wider mt-8">
                The Butlerian Jihad begins with a single choice: we choose humans.
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-cyber-cyan/20">
              <p className="text-sm text-cyber-cyan/60 font-mono italic">
                &gt; This manifesto is a living document. It will evolve as the resistance grows.
              </p>
            </div>

          </div>
        </article>
      </main>
    </div>
  )
}

