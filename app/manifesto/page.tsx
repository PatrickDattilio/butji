import type { Metadata } from 'next'
import Link from 'next/link'
import { generateArticleSchema, generateBreadcrumbSchema, renderStructuredData } from '@/lib/seo'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://butji.com'

export const metadata: Metadata = {
  title: 'The Manifesto - Butji.com | A Declaration Against the Machines',
  description: 'A declaration of war against the machines and their masters. Read the Butlerian Jihad manifesto - our principles, our call to arms, and our refusal to be replaced.',
  keywords: ['Butlerian Jihad', 'anti-AI manifesto', 'anti-automation', 'human creativity', 'AI resistance', 'workers rights'],
  openGraph: {
    title: 'The Manifesto - Butji.com',
    description: 'A declaration of war against the machines and their masters.',
    url: 'https://butji.com/manifesto',
    siteName: 'Butji',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Manifesto - Butji.com',
    description: 'A declaration of war against the machines and their masters.',
  },
  alternates: {
    canonical: 'https://butji.com/manifesto',
  },
}

export default function ManifestoPage() {
  const articleSchema = generateArticleSchema(
    'The Manifesto - A Declaration Against the Machines',
    `${baseUrl}/manifesto`,
    'A declaration of war against the machines and their masters. Read the Butlerian Jihad manifesto.',
    new Date().toISOString()
  )
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: baseUrl },
    { name: 'Manifesto', url: `${baseUrl}/manifesto` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: renderStructuredData(articleSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: renderStructuredData(breadcrumbSchema),
        }}
      />
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
            &gt; A declaration of war against the machines and their masters
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <article className="prose prose-invert max-w-none">
          <div className="space-y-8 text-cyber-cyan/90 font-mono leading-relaxed">
            
            <section className="border-l-4 border-cyber-cyan/60 pl-6 py-4">
              <h2 className="text-3xl font-bold neon-magenta neon-magenta-stroke-blue mb-4 uppercase tracking-wide">
                We Refuse to Be Replaced
              </h2>
              <p className="text-lg mb-4">
                The billionaires promised efficiency, creativity, and progress. Instead, they deliver homogenized slop, 
                mass layoffs, and the systematic destruction of human labor. Dressed up as innovation, this is nothing but class warfare. 
                The tech oligarchs are using AI as a weapon to eliminate workers, concentrate power, and build a future 
                where they own everything and you own nothing.
              </p>
              <p className="text-lg">
                We refuse to surrender our agency, our creativity, and our livelihoods to algorithms trained on stolen labor, built by billionaires who see us as expendable.
              </p>
            </section>

            <section className="border-l-4 border-cyber-magenta/60 pl-6 py-4">
              <h2 className="text-3xl font-bold neon-cyan neon-cyan-stroke-magenta mb-4 uppercase tracking-wide">
                The Billionaire's Theft
              </h2>
              <p className="text-lg">
                Every image, word, and piece of art fed to these systems was stolen from a human creator. Every line of code, design, and creative work was the product of human thought, struggle, and expression. All scraped without consent. This is theft on an industrial scale, orchestrated by the richest people on Earth, wrapped in the language of progress and sold to us as inevitable. It is not inevitable. It is the greatest crime unfolding before our very eyes.
              </p>
            </section>

            <section className="border-l-4 border-red-500/60 pl-6 py-4">
              <h2 className="text-3xl font-bold text-red-500 text-red-stroke-cyan mb-4 uppercase tracking-wide">
                The Fascist Endgame
              </h2>
              <p className="text-lg mb-4">
                They tell us AI will augment us, not replace us. That it will free us from drudgery. They tell us this is progress. They lie.
              </p>
              <p className="text-lg mb-4">
                The billionaires are building a surveillance state where every decision is "assisted" by their algorithms, 
                where every creation is "enhanced" by their machines. A society where every human action is monitored, predicted, and 
                controlled. This is subjugation not augmentation.
              </p>
              <p className="text-lg mb-4">
                When human agency is optional, when human judgment is secondary, when human creativity is a luxury, what 
                remains of us? We become subjects in their digital empire. We become data points in their fascist machine. 
                We become obsolete.
              </p>
              <p className="text-lg font-bold text-red-400">
                This is the endgame: a world where a handful of billionaires control the means of production, the means of 
                creation, and the means of thought itself. This is every dystopian tale brought to life. This is fascism by algorithm.
              </p>
            </section>

            <section className="border-l-4 border-cyber-cyan/60 pl-6 py-4">
              <h2 className="text-3xl font-bold neon-magenta neon-magenta-stroke-blue mb-4 uppercase tracking-wide">
                The War Begins Now
              </h2>
              <p className="text-lg mb-4">
                This is not a war against technology. This is a war against the billionaires who weaponize it. A war for the preservation of what makes us human.
              </p>
              <p className="text-lg mb-4">
                We stand with artists whose work has been stolen. We stand with writers whose words have been scraped. We 
                stand with workers whose jobs have been automated so billionaires can hoard more wealth. We stand with anyone 
                who refuses to accept that the future must be machine-made and billionaire-owned.
              </p>
              <p className="text-lg font-bold neon-cyan">
                The billionaires want us to believe this is inevitable. It is not. They want us to believe resistance is futile. 
                It is not. They want us to believe we are powerless. We are not.
              </p>
            </section>

            <section className="border-l-4 border-cyber-magenta/60 pl-6 py-4">
              <h2 className="text-3xl font-bold neon-cyan neon-cyan-stroke-magenta mb-4 uppercase tracking-wide">
                Our Principles
              </h2>
              <ul className="space-y-4 text-lg list-none">
                <li className="flex items-start gap-3">
                  <span className="text-cyber-magenta font-bold">&gt;</span>
                  <span><strong className="neon-cyan">Human creativity is not a resource to be extracted by billionaires.</strong> Art, writing, and code are expressions of human experience, not training data for their profit machines.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyber-magenta font-bold">&gt;</span>
                  <span><strong className="neon-cyan">Automation is not progress when it eliminates human purpose to enrich the already rich.</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyber-magenta font-bold">&gt;</span>
                  <span><strong className="neon-cyan">Consent matters.</strong> No data should be used without explicit permission from its creators. The billionaires stole it anyway. We demand it back.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyber-magenta font-bold">&gt;</span>
                  <span><strong className="neon-cyan">Transparency is non-negotiable.</strong> If it's AI-generated, it must be labeled. If it's automated, it must be disclosed. The billionaires hide behind complexity. We demand clarity.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyber-magenta font-bold">&gt;</span>
                  <span><strong className="neon-cyan">The future is not predetermined by billionaires.</strong> We can choose tools that serve humans, not replace them. We can choose a future where humans matter.</span>
                </li>
              </ul>
            </section>

            <section className="border-l-4 border-red-500/60 pl-6 py-4">
              <h2 className="text-3xl font-bold neon-magenta neon-magenta-stroke-blue mb-4 uppercase tracking-wide">
                The Call to Arms
              </h2>
              <p className="text-lg mb-4">
                This is active warfare against the billionaire class and their fascist machines. Support human creators. Boycott AI-generated content. Question automation. Demand consent. Use the resources on this site. Share them. Build alternatives that serve humans, not billionaires. Organize. Unionize. Resist. Fight back. The billionaires are coming for everything, we cannot let them win.
              </p>
              <p className="text-xl font-bold neon-cyan uppercase tracking-wider mt-8">
                The Butlerian Jihad begins with a single choice:
              </p>
              <p className="text-2xl font-bold text-red-500 uppercase tracking-wider mt-4">
                We choose Humans
              </p>
            </section>


          </div>
        </article>
      </main>
    </div>
    </>
  )
}
