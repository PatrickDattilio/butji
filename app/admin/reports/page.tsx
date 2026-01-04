'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Report, ReportStatus } from '@/types/report'
import Link from 'next/link'

export default function AdminReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved' | 'dismissed'>('pending')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [updateStatus, setUpdateStatus] = useState<ReportStatus>('pending')
  const [adminNotes, setAdminNotes] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchReports()
    }
  }, [filter, session])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const url = filter === 'all' ? '/api/reports' : `/api/reports?status=${filter}`
      const response = await fetch(url)
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch reports')
      }
      
      const data = await response.json()
      setReports(data)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string) => {
    if (!updateStatus) {
      alert('Please select a status')
      return
    }

    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: updateStatus,
          reviewedBy: session?.user?.name || session?.user?.email || 'Admin',
          adminNotes: adminNotes || undefined,
        }),
      })

      if (response.ok) {
        setUpdatingId(null)
        setUpdateStatus('pending')
        setAdminNotes('')
        fetchReports()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update report')
      }
    } catch (error) {
      console.error('Error updating report:', error)
      alert('Failed to update report')
    }
  }

  const getTargetLink = (report: Report) => {
    if (report.type === 'company') {
      return `/companies/${report.targetId}`
    } else {
      return `/resources/${report.targetId}`
    }
  }

  const getTargetEditLink = (report: Report) => {
    if (report.type === 'company') {
      return `/admin/companies`
    } else {
      return `/admin`
    }
  }

  const pendingCount = reports.filter((r) => r.status === 'pending').length

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
              <h1 className="text-5xl font-bold neon-cyan mb-2 font-mono uppercase tracking-wider glitch-text" data-text="Reports">
                Reports
              </h1>
              <p className="text-lg text-cyber-cyan/80 font-mono">
                &gt; Review and manage user reports
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                className="px-4 py-2 bg-cyber-dark border border-cyber-cyan/40 text-cyber-cyan rounded-sm hover:bg-cyber-cyan/10 transition-all font-mono text-sm"
                href="/admin"
              >
                Resource Submissions
              </Link>
              <Link
                className="px-4 py-2 text-red-400 hover:text-red-300 transition-colors font-mono uppercase text-sm border border-red-500/40 rounded-sm hover:border-red-500/80 terminal-glow"
                href="/admin/company-submissions"
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
          {(['all', 'pending', 'reviewed', 'resolved', 'dismissed'] as const).map((f) => (
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
            <p className="text-cyber-cyan/60 font-mono">&gt; Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-cyber-cyan/60 font-mono">&gt; No reports found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const isExpanded = expandedId === report.id
              const isUpdating = updatingId === report.id

              return (
                <div
                  key={report.id}
                  className="bg-cyber-dark rounded-sm border border-cyber-cyan/30 cyber-border p-6 terminal-glow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-sm text-xs font-bold font-mono uppercase ${
                          report.type === 'company'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                            : 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/50'
                        }`}>
                          {report.type}
                        </span>
                        <Link
                          href={getTargetLink(report)}
                          className="text-cyber-cyan hover:text-cyber-magenta transition-colors font-mono font-bold"
                        >
                          View {report.type === 'company' ? 'Company' : 'Resource'}
                        </Link>
                        <Link
                          href={getTargetEditLink(report)}
                          className="text-cyber-cyan/70 hover:text-cyber-cyan transition-colors font-mono text-sm"
                        >
                          Edit
                        </Link>
                      </div>
                      {report.field && (
                        <p className="text-sm text-cyber-cyan/80 font-mono mb-1">
                          <strong>Field:</strong> {report.field}
                        </p>
                      )}
                      {report.newValue && (
                        <p className="text-sm text-cyber-cyan/70 font-mono mb-2 line-clamp-2">
                          <strong>New Value:</strong> {report.newValue}
                        </p>
                      )}
                      <p className="text-cyber-cyan/90 font-mono mb-2">
                        {report.message}
                      </p>
                      {report.source && (
                        <a
                          href={report.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyber-cyan hover:text-cyber-magenta text-sm font-mono underline"
                        >
                          Source: {report.source}
                        </a>
                      )}
                      {report.reporterEmail && (
                        <p className="text-xs text-cyber-cyan/60 font-mono mt-2">
                          Reporter: {report.reporterEmail}
                        </p>
                      )}
                      <p className="text-xs text-cyber-cyan/60 font-mono mt-1">
                        Submitted: {new Date(report.createdAt).toLocaleString()}
                      </p>
                      {report.reviewedAt && (
                        <p className="text-xs text-cyber-cyan/60 font-mono">
                          Reviewed: {new Date(report.reviewedAt).toLocaleString()} by {report.reviewedBy}
                        </p>
                      )}
                      {report.adminNotes && (
                        <div className="mt-3 p-3 bg-cyber-darker border border-cyber-cyan/30 rounded-sm">
                          <p className="text-xs font-bold text-cyber-cyan font-mono uppercase mb-1">Admin Notes:</p>
                          <p className="text-sm text-cyber-cyan/80 font-mono">{report.adminNotes}</p>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <span
                        className={`px-3 py-1 rounded-sm text-xs font-bold font-mono uppercase ${
                          report.status === 'pending'
                            ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/50'
                            : report.status === 'reviewed'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                            : report.status === 'resolved'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                  </div>

                  {report.status === 'pending' && (
                    <div className="pt-4 border-t border-cyber-cyan/40">
                      {isUpdating ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-bold text-cyber-cyan mb-1 font-mono uppercase">
                              Update Status
                            </label>
                            <select
                              value={updateStatus}
                              onChange={(e) => setUpdateStatus(e.target.value as ReportStatus)}
                              className="w-full px-3 py-2 border border-cyber-cyan/40 rounded-sm bg-cyber-darker text-cyber-cyan focus:outline-none focus:border-cyber-cyan/80 focus:ring-2 focus:ring-cyber-cyan/30 font-mono cyber-border terminal-glow"
                            >
                              <option value="pending">Pending</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="resolved">Resolved</option>
                              <option value="dismissed">Dismissed</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-cyber-cyan mb-1 font-mono uppercase">
                              Admin Notes (Optional)
                            </label>
                            <textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-cyber-cyan/40 rounded-sm bg-cyber-darker text-cyber-cyan focus:outline-none focus:border-cyber-cyan/80 focus:ring-2 focus:ring-cyber-cyan/30 font-mono cyber-border terminal-glow"
                              placeholder="Add internal notes..."
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleUpdateStatus(report.id)}
                              className="px-4 py-2 bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/50 rounded-sm hover:bg-cyber-cyan/30 transition-colors font-mono font-bold uppercase text-sm"
                            >
                              Update Status
                            </button>
                            <button
                              onClick={() => {
                                setUpdatingId(null)
                                setUpdateStatus('pending')
                                setAdminNotes('')
                              }}
                              className="px-4 py-2 bg-cyber-dark border border-cyber-cyan/50 text-cyber-cyan/70 rounded-sm hover:bg-cyber-darker transition-colors font-mono font-bold uppercase text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setUpdatingId(report.id)
                            setUpdateStatus('reviewed')
                          }}
                          className="px-4 py-2 bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/50 rounded-sm hover:bg-cyber-cyan/30 transition-colors font-mono font-bold uppercase text-sm"
                        >
                          Update Status
                        </button>
                      )}
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
