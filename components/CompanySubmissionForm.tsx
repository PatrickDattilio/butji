'use client'

import { useState } from 'react'
import { CompanyTag } from '@/types/company'

const availableTags: { value: CompanyTag; label: string }[] = [
  { value: 'llm', label: 'LLM' },
  { value: 'image-generation', label: 'Image Generation' },
  { value: 'code-generation', label: 'Code Generation' },
  { value: 'chatbot', label: 'Chatbot' },
  { value: 'automation', label: 'Automation' },
  { value: 'surveillance', label: 'Surveillance' },
  { value: 'data-scraping', label: 'Data Scraping' },
  { value: 'layoffs', label: 'Layoffs' },
  { value: 'controversy', label: 'Controversy' },
  { value: 'billionaire-owned', label: 'Billionaire Owned' },
  { value: 'major-player', label: 'Major Player' },
]

export default function CompanySubmissionForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    founders: '',
    ceo: '',
    foundedYear: '',
    funding: '',
    valuation: '',
    products: '',
    controversies: '',
    tags: [] as CompanyTag[],
    submittedBy: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const handleTagToggle = (tag: CompanyTag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)
    setErrorMessage('')

    try {
      const response = await fetch('/api/companies/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          founders: formData.founders.split(',').map(f => f.trim()).filter(Boolean),
          products: formData.products.split(',').map(p => p.trim()).filter(Boolean),
          foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit')
      }

      setSubmitStatus('success')
      setFormData({
        name: '',
        description: '',
        website: '',
        founders: '',
        ceo: '',
        foundedYear: '',
        funding: '',
        valuation: '',
        products: '',
        controversies: '',
        tags: [],
        submittedBy: '',
      })
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-red-400 mb-2 font-mono uppercase">
            Company Name *
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-red-500/40 rounded-sm bg-cyber-dark text-red-400 placeholder-red-400/40 focus:outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/30 font-mono cyber-border terminal-glow"
            placeholder="&gt; e.g., OpenAI, Anthropic, Midjourney"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-bold text-red-400 mb-2 font-mono uppercase">
            Description *
          </label>
          <textarea
            id="description"
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-red-500/40 rounded-sm bg-cyber-dark text-red-400 placeholder-red-400/40 focus:outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/30 font-mono cyber-border terminal-glow"
            placeholder="&gt; Brief description of the company, their AI products, and why they're relevant"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="website" className="block text-sm font-bold text-red-400 mb-2 font-mono uppercase">
              Website
            </label>
            <input
              type="url"
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-4 py-2 border border-red-500/40 rounded-sm bg-cyber-dark text-red-400 placeholder-red-400/40 focus:outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/30 font-mono cyber-border terminal-glow"
              placeholder="&gt; https://example.com"
            />
          </div>

          <div>
            <label htmlFor="ceo" className="block text-sm font-bold text-red-400 mb-2 font-mono uppercase">
              CEO
            </label>
            <input
              type="text"
              id="ceo"
              value={formData.ceo}
              onChange={(e) => setFormData({ ...formData, ceo: e.target.value })}
              className="w-full px-4 py-2 border border-red-500/40 rounded-sm bg-cyber-dark text-red-400 placeholder-red-400/40 focus:outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/30 font-mono cyber-border terminal-glow"
              placeholder="&gt; CEO name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="founders" className="block text-sm font-bold text-red-400 mb-2 font-mono uppercase">
            Founders (comma-separated)
          </label>
          <input
            type="text"
            id="founders"
            value={formData.founders}
            onChange={(e) => setFormData({ ...formData, founders: e.target.value })}
            className="w-full px-4 py-2 border border-red-500/40 rounded-sm bg-cyber-dark text-red-400 placeholder-red-400/40 focus:outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/30 font-mono cyber-border terminal-glow"
            placeholder="&gt; e.g., Sam Altman, Elon Musk"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="foundedYear" className="block text-sm font-bold text-red-400 mb-2 font-mono uppercase">
              Founded Year
            </label>
            <input
              type="number"
              id="foundedYear"
              value={formData.foundedYear}
              onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
              className="w-full px-4 py-2 border border-red-500/40 rounded-sm bg-cyber-dark text-red-400 placeholder-red-400/40 focus:outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/30 font-mono cyber-border terminal-glow"
              placeholder="&gt; e.g., 2015"
            />
          </div>

          <div>
            <label htmlFor="valuation" className="block text-sm font-bold text-red-400 mb-2 font-mono uppercase">
              Valuation
            </label>
            <input
              type="text"
              id="valuation"
              value={formData.valuation}
              onChange={(e) => setFormData({ ...formData, valuation: e.target.value })}
              className="w-full px-4 py-2 border border-red-500/40 rounded-sm bg-cyber-dark text-red-400 placeholder-red-400/40 focus:outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/30 font-mono cyber-border terminal-glow"
              placeholder="&gt; e.g., $80B"
            />
          </div>
        </div>

        <div>
          <label htmlFor="funding" className="block text-sm font-bold text-red-400 mb-2 font-mono uppercase">
            Funding
          </label>
          <input
            type="text"
            id="funding"
            value={formData.funding}
            onChange={(e) => setFormData({ ...formData, funding: e.target.value })}
            className="w-full px-4 py-2 border border-red-500/40 rounded-sm bg-cyber-dark text-red-400 placeholder-red-400/40 focus:outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/30 font-mono cyber-border terminal-glow"
            placeholder="&gt; e.g., $11.3B total, $10B from Microsoft"
          />
        </div>

        <div>
          <label htmlFor="products" className="block text-sm font-bold text-red-400 mb-2 font-mono uppercase">
            Products (comma-separated)
          </label>
          <input
            type="text"
            id="products"
            value={formData.products}
            onChange={(e) => setFormData({ ...formData, products: e.target.value })}
            className="w-full px-4 py-2 border border-red-500/40 rounded-sm bg-cyber-dark text-red-400 placeholder-red-400/40 focus:outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/30 font-mono cyber-border terminal-glow"
            placeholder="&gt; e.g., ChatGPT, GPT-4, DALL-E"
          />
        </div>

        <div>
          <label htmlFor="controversies" className="block text-sm font-bold text-red-400 mb-2 font-mono uppercase">
            Controversies
          </label>
          <textarea
            id="controversies"
            rows={4}
            value={formData.controversies}
            onChange={(e) => setFormData({ ...formData, controversies: e.target.value })}
            className="w-full px-4 py-2 border border-red-500/40 rounded-sm bg-cyber-dark text-red-400 placeholder-red-400/40 focus:outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/30 font-mono cyber-border terminal-glow"
            placeholder="&gt; List controversies, data scraping incidents, layoffs, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-red-400 mb-2 font-mono uppercase">
            Tags (select all that apply)
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag.value}
                type="button"
                onClick={() => handleTagToggle(tag.value)}
                className={`px-3 py-1 rounded-sm text-sm font-bold transition-all font-mono uppercase ${
                  formData.tags.includes(tag.value)
                    ? 'bg-red-500/20 text-red-400 border border-red-500/60 terminal-glow'
                    : 'bg-cyber-dark text-red-400/60 border border-red-500/30 hover:border-red-500/60 hover:text-red-400 cyber-border hover:terminal-glow'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="submittedBy" className="block text-sm font-bold text-red-400 mb-2 font-mono uppercase">
            Your Name (optional)
          </label>
          <input
            type="text"
            id="submittedBy"
            value={formData.submittedBy}
            onChange={(e) => setFormData({ ...formData, submittedBy: e.target.value })}
            className="w-full px-4 py-2 border border-red-500/40 rounded-sm bg-cyber-dark text-red-400 placeholder-red-400/40 focus:outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/30 font-mono cyber-border terminal-glow"
            placeholder="&gt; Your name or handle (optional)"
          />
        </div>

        {submitStatus === 'success' && (
          <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-sm cyber-border terminal-glow">
            <p className="text-red-400 font-mono">
              &gt; ✓ Submission received! It will be reviewed by an admin before appearing on the site.
            </p>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="p-4 bg-red-600/10 border border-red-600/40 rounded-sm cyber-border terminal-glow">
            <p className="text-red-400 font-mono">
              &gt; Error: {errorMessage}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-red-500/20 text-red-400 rounded-sm font-bold hover:opacity-90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono uppercase border border-red-500/60 terminal-glow"
        >
          {isSubmitting ? '> Submitting...' : '> Submit Company'}
        </button>
      </form>
    </div>
  )
}
