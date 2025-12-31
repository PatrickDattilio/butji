'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CompanySubmission } from '@/lib/companySubmissions'
import { CompanyTag } from '@/types/company'
import Link from 'next/link'

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

export default function AdminCompanySubmissionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<CompanySubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedData, setEditedData] = useState<Record<string, Partial<CompanySubmission>>>({})

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchSubmissions()
    }
  }, [filter, session])

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const url = filter === 'pending' ? '/api/company-submissions?status=pending' : '/api/company-submissions'
      const response = await fetch(url)
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch submissions')
      }
      
      const data = await response.json()
      
      let filtered = data
      if (filter === 'approved') {
        filtered = data.filter((s: CompanySubmission) => s.status === 'approved')
      } else if (filter === 'rejected') {
        filtered = data.filter((s: CompanySubmission) => s.status === 'rejected')
      }
      
      setSubmissions(filtered)
    } catch (error) {
      console.error('Error fetching company submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const edits = editedData[id]
      const response = await fetch(`/api/company-submissions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve',
          reviewedBy: 'Admin',
          ...(edits && { edits }),
        }),
      })

      if (response.ok) {
        setEditingId(null)
        setEditedData({})
        fetchSubmissions()
      }
    } catch (error) {
      console.error('Error approving submission:', error)
      alert('Failed to approve submission')
    }
  }

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    try {
      const response = await fetch(`/api/company-submissions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject',
          rejectionReason: rejectionReason,
          reviewedBy: 'Admin',
        }),
      })

      if (response.ok) {
        setReviewingId(null)
        setRejectionReason('')
        fetchSubmissions()
      }
    } catch (error) {
      console.error('Error rejecting submission:', error)
      alert('Failed to reject submission')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return
    }

    try {
      const response = await fetch(`/api/company-submissions/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchSubmissions()
      }
    } catch (error) {
      console.error('Error deleting submission:', error)
      alert('Failed to delete submission')
    }
  }

  const pendingCount = submissions.filter((s) => s.status === 'pending').length

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-cyber-darker relative flex items-center justify-center">
        <p className="text-red-400 font-mono">&gt; Loading...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-cyber-darker relative">
      <div className="fixed inset-0 pointer-events-none z-50 opacity-30">
        <div className="h-full w-full" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(239, 68, 68, 0.03) 2px, rgba(239, 68, 68, 0.03) 4px)'
        }}></div>
      </div>
      
      <header className="bg-cyber-dark border-b border-red-500/40 cyber-border relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-red-500 mb-2 font-mono uppercase tracking-wider glitch-text" data-text="Review Company Submissions">
                Review Company Submissions
              </h1>
              <p className="text-lg text-red-400/80 font-mono">
                &gt; Review and manage company submissions
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/admin"
                className="px-4 py-2 text-red-400 hover:text-red-300 transition-colors font-mono uppercase text-sm border border-red-500/40 rounded-sm hover:border-red-500/80 terminal-glow"
              >
                ← Resource Submissions
              </Link>
              <Link
                href="/admin/companies"
                className="px-4 py-2 text-red-400 hover:text-red-300 transition-colors font-mono uppercase text-sm border border-red-500/40 rounded-sm hover:border-red-500/80 terminal-glow"
              >
                Manage Companies
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 border-b border-red-500/40">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 font-bold border-b-2 transition-colors font-mono uppercase ${
                filter === f
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-red-400/50 hover:text-red-400'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'pending' && pendingCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-red-500/20 text-red-400 border border-red-500/50 rounded-sm font-mono terminal-glow">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-red-400/60 font-mono">&gt; Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-red-400/60 font-mono">&gt; No submissions found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-cyber-dark rounded-sm border border-red-500/30 cyber-border p-6 terminal-glow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-400 font-mono mb-2">
                      &gt; {submission.name}
                    </h3>
                    <p className="text-red-400/70 font-mono text-sm mb-3">
                      {submission.description}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm text-red-400/60 font-mono">
                      {submission.website && <p>Website: {submission.website}</p>}
                      {submission.ceo && <p>CEO: {submission.ceo}</p>}
                      {submission.foundedYear && <p>Founded: {submission.foundedYear}</p>}
                      {submission.valuation && <p>Valuation: {submission.valuation}</p>}
                      {submission.founders.length > 0 && <p>Founders: {submission.founders.join(', ')}</p>}
                      {submission.products.length > 0 && <p>Products: {submission.products.join(', ')}</p>}
                    </div>
                    {submission.controversies && (
                      <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-sm">
                        <p className="text-xs font-bold text-red-400 mb-1 font-mono uppercase">Controversies:</p>
                        <p className="text-red-300/80 font-mono text-sm">{submission.controversies}</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {submission.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-sm text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30 font-mono"
                        >
                          {tag.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                    <div className="text-sm text-red-400/60 font-mono space-y-1">
                      <p>
                        <strong>Submitted by:</strong> {submission.submittedBy || 'Anonymous'} on{' '}
                        {submission.submittedAt
                          ? new Date(submission.submittedAt).toLocaleDateString()
                          : 'Unknown date'}
                      </p>
                      {submission.status === 'rejected' && submission.rejectionReason && (
                        <p className="text-red-400">
                          <strong>Rejection reason:</strong> {submission.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <span
                      className={`px-3 py-1 rounded-sm text-xs font-bold font-mono uppercase ${
                        submission.status === 'pending'
                          ? 'bg-red-500/30 text-red-400 border border-red-500/50'
                          : submission.status === 'approved'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                          : 'bg-red-600/30 text-red-500 border border-red-600/50'
                      }`}
                    >
                      {submission.status}
                    </span>
                  </div>
                </div>

                {submission.status === 'pending' && (
                  <div className="pt-4 border-t border-red-500/40">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(submission.id)}
                        className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/50 rounded-sm hover:bg-green-500/30 transition-colors font-mono font-bold uppercase text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setReviewingId(reviewingId === submission.id ? null : submission.id)}
                        className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/40 rounded-sm hover:bg-red-500/30 transition-colors font-mono font-bold uppercase text-sm"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleDelete(submission.id)}
                        className="px-4 py-2 bg-cyber-dark border border-red-500/50 text-red-400/70 rounded-sm hover:bg-red-500/10 transition-colors font-mono font-bold uppercase text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                {reviewingId === submission.id && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/40 rounded-sm">
                    <label className="block text-sm font-bold text-red-400 mb-2 font-mono uppercase">
                      Rejection Reason *
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-red-500/40 rounded-sm bg-cyber-darker text-red-400 placeholder-red-400/40 mb-3 font-mono"
                      placeholder="Please provide a reason for rejection..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(submission.id)}
                        className="px-4 py-2 bg-red-500/30 text-red-400 border border-red-500/50 rounded-sm hover:bg-red-500/40 transition-colors font-mono font-bold uppercase text-sm"
                      >
                        Confirm Rejection
                      </button>
                      <button
                        onClick={() => {
                          setReviewingId(null)
                          setRejectionReason('')
                        }}
                        className="px-4 py-2 bg-cyber-dark border border-red-500/50 text-red-400/70 rounded-sm hover:bg-red-500/10 transition-colors font-mono font-bold uppercase text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
