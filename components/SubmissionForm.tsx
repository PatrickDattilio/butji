'use client'

import { useState } from 'react'
import { ResourceCategory, ResourceTag } from '@/types/resource'

const categories: { value: ResourceCategory; label: string }[] = [
  { value: 'tool', label: 'Tool' },
  { value: 'website', label: 'Website' },
  { value: 'article', label: 'Article' },
  { value: 'community', label: 'Community' },
  { value: 'service', label: 'Service' },
  { value: 'extension', label: 'Extension' },
  { value: 'other', label: 'Other' },
]

const availableTags: { value: ResourceTag; label: string }[] = [
  { value: 'detection', label: 'Detection' },
  { value: 'protection', label: 'Protection' },
  { value: 'privacy', label: 'Privacy' },
  { value: 'verification', label: 'Verification' },
  { value: 'education', label: 'Education' },
  { value: 'advocacy', label: 'Advocacy' },
  { value: 'research', label: 'Research' },
  { value: 'legal', label: 'Legal' },
]

export default function SubmissionForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category: '' as ResourceCategory | '',
    tags: [] as ResourceTag[],
    submittedBy: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const handleTagToggle = (tag: ResourceTag) => {
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
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit')
      }

      setSubmitStatus('success')
      setFormData({
        title: '',
        description: '',
        url: '',
        category: '' as ResourceCategory | '',
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
          <label htmlFor="title" className="block text-sm font-bold text-cyber-cyan mb-2 font-mono uppercase">
            Title *
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-cyber-cyan/40 rounded-sm bg-cyber-dark text-cyber-cyan placeholder-cyber-cyan/40 focus:outline-none focus:border-cyber-cyan/80 focus:ring-2 focus:ring-cyber-cyan/30 font-mono cyber-border terminal-glow"
            placeholder="&gt; Name of the tool, website, or resource"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-bold text-cyber-cyan mb-2 font-mono uppercase">
            Description *
          </label>
          <textarea
            id="description"
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-cyber-cyan/40 rounded-sm bg-cyber-dark text-cyber-cyan placeholder-cyber-cyan/40 focus:outline-none focus:border-cyber-cyan/80 focus:ring-2 focus:ring-cyber-cyan/30 font-mono cyber-border terminal-glow"
            placeholder="&gt; Brief description of what this resource does or provides"
          />
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-bold text-cyber-cyan mb-2 font-mono uppercase">
            URL *
          </label>
          <input
            type="url"
            id="url"
            required
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="w-full px-4 py-2 border border-cyber-cyan/40 rounded-sm bg-cyber-dark text-cyber-cyan placeholder-cyber-cyan/40 focus:outline-none focus:border-cyber-cyan/80 focus:ring-2 focus:ring-cyber-cyan/30 font-mono cyber-border terminal-glow"
            placeholder="&gt; https://example.com"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-bold text-cyber-cyan mb-2 font-mono uppercase">
            Category *
          </label>
          <select
            id="category"
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as ResourceCategory })}
            className="w-full px-4 py-2 border border-cyber-cyan/40 rounded-sm bg-cyber-dark text-cyber-cyan focus:outline-none focus:border-cyber-cyan/80 focus:ring-2 focus:ring-cyber-cyan/30 font-mono cyber-border terminal-glow"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-cyber-cyan mb-2 font-mono uppercase">
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
                    ? 'resistance-accent text-cyber-cyan border border-cyber-cyan/60 terminal-glow'
                    : 'bg-cyber-dark text-cyber-cyan/60 border border-cyber-cyan/30 hover:border-cyber-cyan/60 hover:text-cyber-cyan cyber-border hover:terminal-glow'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="submittedBy" className="block text-sm font-bold text-cyber-cyan mb-2 font-mono uppercase">
            Your Name (optional)
          </label>
          <input
            type="text"
            id="submittedBy"
            value={formData.submittedBy}
            onChange={(e) => setFormData({ ...formData, submittedBy: e.target.value })}
            className="w-full px-4 py-2 border border-cyber-cyan/40 rounded-sm bg-cyber-dark text-cyber-cyan placeholder-cyber-cyan/40 focus:outline-none focus:border-cyber-cyan/80 focus:ring-2 focus:ring-cyber-cyan/30 font-mono cyber-border terminal-glow"
            placeholder="&gt; Your name or handle (optional)"
          />
        </div>

        {submitStatus === 'success' && (
          <div className="p-4 bg-cyber-green/10 border border-cyber-green/40 rounded-sm cyber-border terminal-glow">
            <p className="text-cyber-green font-mono">
              &gt; ✓ Submission received! It will be reviewed by an admin before appearing on the site.
            </p>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="p-4 bg-cyber-magenta/10 border border-cyber-magenta/40 rounded-sm cyber-border terminal-glow">
            <p className="text-cyber-magenta font-mono">
              &gt; Error: {errorMessage}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 resistance-accent text-cyber-cyan rounded-sm font-bold hover:opacity-90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyber-cyan/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono uppercase border border-cyber-cyan/60 terminal-glow"
        >
          {isSubmitting ? '&gt; Submitting...' : '&gt; Submit Resource'}
        </button>
      </form>
    </div>
  )
}

