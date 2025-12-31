'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Submission, ResourceCategory, ResourceTag } from '@/types/resource'
import Link from 'next/link'

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

interface EditedSubmission {
  title: string
  description: string
  url: string
  category: ResourceCategory
  tags: ResourceTag[]
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedData, setEditedData] = useState<Record<string, EditedSubmission>>({})

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
      const url = filter === 'pending' ? '/api/submissions?status=pending' : '/api/submissions'
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
        filtered = data.filter((s: Submission) => s.status === 'approved')
      } else if (filter === 'rejected') {
        filtered = data.filter((s: Submission) => s.status === 'rejected')
      }
      
      setSubmissions(filtered)
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const initializeEdit = (submission: Submission) => {
    setEditedData({
      ...editedData,
      [submission.id]: {
        title: submission.title,
        description: submission.description,
        url: submission.url,
        category: submission.category,
        tags: [...submission.tags],
      },
    })
    setEditingId(submission.id)
  }

  const updateEditedField = (id: string, field: keyof EditedSubmission, value: string | ResourceCategory | ResourceTag[]) => {
    setEditedData({
      ...editedData,
      [id]: {
        ...editedData[id],
        [field]: value,
      },
    })
  }

  const toggleTag = (id: string, tag: ResourceTag) => {
    const currentTags = editedData[id]?.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag]
    updateEditedField(id, 'tags', newTags)
  }

  const cancelEdit = (id: string) => {
    const newEditedData = { ...editedData }
    delete newEditedData[id]
    setEditedData(newEditedData)
    setEditingId(null)
  }

  const handleApprove = async (id: string) => {
    try {
      const edits = editedData[id]
      const response = await fetch(`/api/submissions/${id}`, {
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
        cancelEdit(id)
        fetchSubmissions()
      }
    } catch (error) {
      console.error('Error approving submission:', error)
      alert('Failed to approve submission')
    }
  }

  const handleSaveEdit = async (id: string) => {
    try {
      const edits = editedData[id]
      if (!edits) return

      const response = await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          edits,
        }),
      })

      if (response.ok) {
        setEditingId(null)
        fetchSubmissions()
      }
    } catch (error) {
      console.error('Error saving edits:', error)
      alert('Failed to save edits')
    }
  }

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    try {
      const response = await fetch(`/api/submissions/${id}`, {
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
      const response = await fetch(`/api/submissions/${id}`, {
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
        <p className="text-cyber-cyan font-mono">&gt; Loading...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold neon-cyan mb-2 font-mono uppercase tracking-wider glitch-text" data-text="Admin Panel">
                Admin Panel
              </h1>
              <p className="text-lg text-cyber-cyan/80 font-mono">
                &gt; Review and manage resource submissions
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/admin/company-submissions"
                className="px-4 py-2 text-red-400 hover:text-red-300 transition-colors font-mono uppercase text-sm border border-red-500/40 rounded-sm hover:border-red-500/80 terminal-glow"
              >
                Review Companies
              </Link>
              <Link
                href="/admin/companies"
                className="px-4 py-2 text-cyber-cyan hover:text-cyber-magenta transition-colors font-mono uppercase text-sm border border-cyber-cyan/40 rounded-sm hover:border-cyber-cyan/80 terminal-glow"
              >
                Manage Companies
              </Link>
              <Link
                href="/"
                className="px-4 py-2 text-cyber-cyan hover:text-cyber-magenta transition-colors font-mono uppercase text-sm border border-cyber-cyan/40 rounded-sm hover:border-cyber-cyan/80 terminal-glow"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 border-b border-cyber-cyan/40">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 font-bold border-b-2 transition-colors font-mono uppercase ${
                filter === f
                  ? 'border-cyber-cyan text-cyber-cyan neon-cyan'
                  : 'border-transparent text-cyber-cyan/50 hover:text-cyber-cyan'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'pending' && pendingCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/50 rounded-sm font-mono terminal-glow">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-cyber-cyan/60 font-mono">&gt; Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-cyber-cyan/60 font-mono">&gt; No submissions found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => {
              const isEditing = editingId === submission.id
              const editData = editedData[submission.id] || {
                title: submission.title,
                description: submission.description,
                url: submission.url,
                category: submission.category,
                tags: submission.tags,
              }

              return (
                <div
                  key={submission.id}
                  className="bg-cyber-dark rounded-sm border border-cyber-cyan/30 cyber-border p-6 terminal-glow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 space-y-4">
                      {/* Title */}
                      {isEditing ? (
                        <div>
                          <label className="block text-sm font-bold text-cyber-cyan mb-1 font-mono uppercase">
                            Title
                          </label>
                          <input
                            type="text"
                            value={editData.title}
                            onChange={(e) => updateEditedField(submission.id, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-cyber-cyan/40 rounded-sm bg-cyber-darker text-cyber-cyan focus:outline-none focus:border-cyber-cyan/80 focus:ring-2 focus:ring-cyber-cyan/30 font-mono cyber-border terminal-glow"
                          />
                        </div>
                      ) : (
                        <h3 className="text-xl font-bold text-cyber-cyan font-mono">
                          &gt; {submission.title}
                        </h3>
                      )}

                      {/* Description */}
                      {isEditing ? (
                        <div>
                          <label className="block text-sm font-bold text-cyber-cyan mb-1 font-mono uppercase">
                            Description
                          </label>
                          <textarea
                            value={editData.description}
                            onChange={(e) => updateEditedField(submission.id, 'description', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-cyber-cyan/40 rounded-sm bg-cyber-darker text-cyber-cyan focus:outline-none focus:border-cyber-cyan/80 focus:ring-2 focus:ring-cyber-cyan/30 font-mono cyber-border terminal-glow"
                          />
                        </div>
                      ) : (
                        <p className="text-cyber-cyan/70 font-mono text-sm">
                          {submission.description}
                        </p>
                      )}

                      {/* Category and Tags */}
                      {isEditing ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-bold text-resistance-amber mb-1 font-mono uppercase">
                              Category
                            </label>
                            <select
                              value={editData.category}
                              onChange={(e) => updateEditedField(submission.id, 'category', e.target.value as ResourceCategory)}
                              className="w-full px-3 py-2 border border-resistance-brown/40 rounded-sm bg-resistance-darker text-resistance-amber focus:outline-none focus:border-resistance-rust/60 focus:ring-1 focus:ring-resistance-rust/30 font-mono gritty-border"
                            >
                              {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                  {cat.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-resistance-amber mb-2 font-mono uppercase">
                              Tags
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {availableTags.map((tag) => (
                                <button
                                  key={tag.value}
                                  type="button"
                                  onClick={() => toggleTag(submission.id, tag.value)}
                                  className={`px-3 py-1 rounded-sm text-sm font-bold transition-all font-mono uppercase ${
                                    editData.tags.includes(tag.value)
                                      ? 'resistance-accent text-resistance-amber border border-resistance-rust/50'
                                      : 'bg-resistance-darker text-gray-400 border border-resistance-brown/30 hover:border-resistance-rust/40 hover:text-resistance-amber gritty-border'
                                  }`}
                                >
                                  {tag.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2.5 py-0.5 rounded-sm text-xs font-bold bg-resistance-brown/30 text-resistance-amber border border-resistance-brown/50 font-mono uppercase">
                            {submission.category}
                          </span>
                          {submission.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-sm text-xs font-medium bg-resistance-dark text-gray-400 border border-resistance-brown/30 font-mono"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* URL */}
                      {isEditing ? (
                        <div>
                          <label className="block text-sm font-bold text-resistance-amber mb-1 font-mono uppercase">
                            URL
                          </label>
                          <input
                            type="url"
                            value={editData.url}
                            onChange={(e) => updateEditedField(submission.id, 'url', e.target.value)}
                            className="w-full px-3 py-2 border border-resistance-brown/40 rounded-sm bg-resistance-darker text-resistance-amber focus:outline-none focus:border-resistance-rust/60 focus:ring-1 focus:ring-resistance-rust/30 font-mono gritty-border"
                          />
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 space-y-1 font-mono">
                          <p>
                            <strong>URL:</strong>{' '}
                            <a
                              href={submission.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-resistance-rust hover:text-resistance-amber transition-colors"
                            >
                              {submission.url}
                            </a>
                          </p>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="text-sm text-gray-500 space-y-1 font-mono">
                        <p>
                          <strong>Submitted by:</strong> {submission.submittedBy || 'Anonymous'} on{' '}
                          {submission.submittedAt
                            ? new Date(submission.submittedAt).toLocaleDateString()
                            : 'Unknown date'}
                        </p>
                        {submission.status === 'rejected' && submission.rejectionReason && (
                          <p className="text-resistance-rust">
                            <strong>Rejection reason:</strong> {submission.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <span
                        className={`px-3 py-1 rounded-sm text-xs font-bold font-mono uppercase ${
                          submission.status === 'pending'
                            ? 'bg-resistance-brown/30 text-resistance-amber border border-resistance-brown/50'
                            : submission.status === 'approved'
                            ? 'bg-resistance-rust/20 text-resistance-rust border border-resistance-rust/40'
                            : 'bg-resistance-rust/30 text-resistance-rust border border-resistance-rust/50'
                        }`}
                      >
                        {submission.status}
                      </span>
                    </div>
                  </div>

                {submission.status === 'pending' && (
                  <div className="pt-4 border-t border-resistance-brown/40">
                    {isEditing ? (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleSaveEdit(submission.id)}
                          className="px-4 py-2 resistance-accent text-resistance-amber rounded-sm hover:opacity-90 transition-opacity font-mono font-bold uppercase text-sm border border-resistance-rust/50"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => cancelEdit(submission.id)}
                          className="px-4 py-2 bg-resistance-dark border border-resistance-brown/50 text-gray-400 rounded-sm hover:bg-resistance-brown/20 transition-colors font-mono font-bold uppercase text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            handleSaveEdit(submission.id)
                            setTimeout(() => handleApprove(submission.id), 100)
                          }}
                          className="px-4 py-2 bg-resistance-rust/30 text-resistance-rust border border-resistance-rust/50 rounded-sm hover:bg-resistance-rust/40 transition-colors font-mono font-bold uppercase text-sm"
                        >
                          Save & Approve
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={() => initializeEdit(submission)}
                          className="px-4 py-2 resistance-accent text-resistance-amber rounded-sm hover:opacity-90 transition-opacity font-mono font-bold uppercase text-sm border border-resistance-rust/50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleApprove(submission.id)}
                          className="px-4 py-2 bg-resistance-rust/30 text-resistance-rust border border-resistance-rust/50 rounded-sm hover:bg-resistance-rust/40 transition-colors font-mono font-bold uppercase text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setReviewingId(reviewingId === submission.id ? null : submission.id)}
                          className="px-4 py-2 bg-resistance-rust/20 text-resistance-rust border border-resistance-rust/40 rounded-sm hover:bg-resistance-rust/30 transition-colors font-mono font-bold uppercase text-sm"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleDelete(submission.id)}
                          className="px-4 py-2 bg-resistance-dark border border-resistance-brown/50 text-gray-400 rounded-sm hover:bg-resistance-brown/20 transition-colors font-mono font-bold uppercase text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {reviewingId === submission.id && (
                  <div className="mt-4 p-4 bg-resistance-rust/10 border border-resistance-rust/40 rounded-sm gritty-border">
                    <label className="block text-sm font-bold text-resistance-amber mb-2 font-mono uppercase">
                      Rejection Reason *
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-resistance-brown/40 rounded-sm bg-resistance-darker text-resistance-amber placeholder-gray-600 mb-3 font-mono gritty-border"
                      placeholder="Please provide a reason for rejection..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(submission.id)}
                        className="px-4 py-2 bg-resistance-rust/30 text-resistance-rust border border-resistance-rust/50 rounded-sm hover:bg-resistance-rust/40 transition-colors font-mono font-bold uppercase text-sm"
                      >
                        Confirm Rejection
                      </button>
                      <button
                        onClick={() => {
                          setReviewingId(null)
                          setRejectionReason('')
                        }}
                        className="px-4 py-2 bg-resistance-dark border border-resistance-brown/50 text-gray-400 rounded-sm hover:bg-resistance-brown/20 transition-colors font-mono font-bold uppercase text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

