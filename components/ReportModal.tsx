'use client'

import { useState, useEffect } from 'react'
import { ReportType } from '@/types/report'

// Client-safe field names (duplicated from lib/reports.ts since that's server-only)
function getCompanyFieldNames(): string[] {
  return [
    'Description',
    'CEO',
    'Founded Year',
    'Valuation',
    'Funding',
    'Founders',
    'Products',
    'Controversies',
    'Layoffs',
    'Tags',
    'Website',
    'Logo URL',
    'Other',
  ]
}

function getResourceFieldNames(): string[] {
  return [
    'Title',
    'Description',
    'URL',
    'Category',
    'Tags',
    'Other',
  ]
}

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  type: ReportType
  targetId: string
  targetName: string
}

export default function ReportModal({ isOpen, onClose, type, targetId, targetName }: ReportModalProps) {
  const [formData, setFormData] = useState({
    field: '',
    newValue: '',
    source: '',
    message: '',
    reporterEmail: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const fieldNames = type === 'company' ? getCompanyFieldNames() : getResourceFieldNames()
  const accentColor = type === 'company' ? 'red' : 'cyan'
  const accentClass = type === 'company' 
    ? 'text-red-400 border-red-500/30 hover:border-red-500/60 focus:border-red-500/80 focus:ring-red-500/30'
    : 'text-cyber-cyan border-cyber-cyan/30 hover:border-cyber-cyan/60 focus:border-cyber-cyan/80 focus:ring-cyber-cyan/30'
  const bgClass = type === 'company' ? 'bg-red-500/10' : 'bg-cyber-cyan/10'
  const textClass = type === 'company' ? 'text-red-400' : 'text-cyber-cyan'

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        field: '',
        newValue: '',
        source: '',
        message: '',
        reporterEmail: '',
      })
      setSubmitStatus(null)
      setErrorMessage('')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)
    setErrorMessage('')

    if (!formData.message.trim()) {
      setErrorMessage('Message is required')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          targetId,
          field: formData.field || undefined,
          newValue: formData.newValue || undefined,
          source: formData.source || undefined,
          message: formData.message,
          reporterEmail: formData.reporterEmail || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit report')
      }

      setSubmitStatus('success')
      // Reset form
      setFormData({
        field: '',
        newValue: '',
        source: '',
        message: '',
        reporterEmail: '',
      })
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`relative w-full max-w-2xl ${bgClass} border ${accentClass} rounded-sm p-6 cyber-border terminal-glow`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 ${textClass} hover:opacity-70 transition-opacity font-mono text-xl`}
          aria-label="Close"
        >
          ×
        </button>

        <h2 className={`text-2xl font-bold ${textClass} mb-4 font-mono uppercase tracking-wider`}>
          &gt; Report Update for {targetName}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field Selector */}
          <div>
            <label htmlFor="field" className={`block text-sm font-bold ${textClass} mb-2 font-mono uppercase`}>
              Field to Update (Optional)
            </label>
            <select
              id="field"
              value={formData.field}
              onChange={(e) => setFormData({ ...formData, field: e.target.value })}
              className={`w-full px-3 py-2 border ${accentClass} rounded-sm bg-cyber-dark ${textClass} focus:outline-none font-mono cyber-border terminal-glow`}
            >
              <option value="">Select a field...</option>
              {fieldNames.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </div>

          {/* New Value */}
          <div>
            <label htmlFor="newValue" className={`block text-sm font-bold ${textClass} mb-2 font-mono uppercase`}>
              New/Corrected Information (Optional)
            </label>
            <textarea
              id="newValue"
              value={formData.newValue}
              onChange={(e) => setFormData({ ...formData, newValue: e.target.value })}
              rows={4}
              className={`w-full px-3 py-2 border ${accentClass} rounded-sm bg-cyber-dark ${textClass} placeholder-${textClass}/40 focus:outline-none font-mono cyber-border terminal-glow`}
              placeholder="Enter the corrected or updated information..."
            />
          </div>

          {/* Source */}
          <div>
            <label htmlFor="source" className={`block text-sm font-bold ${textClass} mb-2 font-mono uppercase`}>
              Source/Citation URL (Optional)
            </label>
            <input
              type="url"
              id="source"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className={`w-full px-3 py-2 border ${accentClass} rounded-sm bg-cyber-dark ${textClass} placeholder-${textClass}/40 focus:outline-none font-mono cyber-border terminal-glow`}
              placeholder="https://example.com/source"
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className={`block text-sm font-bold ${textClass} mb-2 font-mono uppercase`}>
              Message *
            </label>
            <textarea
              id="message"
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={5}
              className={`w-full px-3 py-2 border ${accentClass} rounded-sm bg-cyber-dark ${textClass} placeholder-${textClass}/40 focus:outline-none font-mono cyber-border terminal-glow`}
              placeholder="Explain what needs to be updated and why..."
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reporterEmail" className={`block text-sm font-bold ${textClass} mb-2 font-mono uppercase`}>
              Email (Optional - for follow-up)
            </label>
            <input
              type="email"
              id="reporterEmail"
              value={formData.reporterEmail}
              onChange={(e) => setFormData({ ...formData, reporterEmail: e.target.value })}
              className={`w-full px-3 py-2 border ${accentClass} rounded-sm bg-cyber-dark ${textClass} placeholder-${textClass}/40 focus:outline-none font-mono cyber-border terminal-glow`}
              placeholder="your@email.com"
            />
          </div>

          {/* Error Message */}
          {submitStatus === 'error' && errorMessage && (
            <div className={`p-3 ${bgClass} border ${accentClass} rounded-sm`}>
              <p className={`${textClass} font-mono text-sm`}>Error: {errorMessage}</p>
            </div>
          )}

          {/* Success Message */}
          {submitStatus === 'success' && (
            <div className={`p-3 ${bgClass} border ${accentClass} rounded-sm`}>
              <p className={`${textClass} font-mono text-sm`}>
                ✓ Report submitted successfully! This window will close shortly.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 ${bgClass} ${textClass} border ${accentClass} rounded-sm hover:opacity-90 transition-all font-mono font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed terminal-glow`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-cyber-dark text-gray-400 border border-gray-600/30 rounded-sm hover:bg-gray-800/50 transition-all font-mono font-bold uppercase"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
