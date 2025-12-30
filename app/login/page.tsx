'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid username or password')
      } else {
        router.push('/admin')
        router.refresh()
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cyber-darker relative flex items-center justify-center">
      {/* Scan line overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-30">
        <div className="h-full w-full" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)'
        }}></div>
      </div>

      <div className="max-w-md w-full mx-4 relative z-10">
        <div className="bg-cyber-dark border border-cyber-cyan/40 cyber-border p-8 terminal-glow">
          <div className="mb-8">
            <h1 className="text-4xl font-bold neon-cyan mb-2 font-mono uppercase tracking-wider text-center">
              Admin Login
            </h1>
            <p className="text-cyber-cyan/70 text-center font-mono text-sm">
              &gt; Access restricted area
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-cyber-cyan mb-2 font-mono uppercase">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2 border border-cyber-cyan/40 rounded-sm bg-cyber-darker text-cyber-cyan placeholder-cyber-cyan/40 focus:outline-none focus:border-cyber-cyan/80 focus:ring-2 focus:ring-cyber-cyan/30 font-mono cyber-border terminal-glow"
                placeholder="&gt; Enter username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-cyber-cyan mb-2 font-mono uppercase">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-cyber-cyan/40 rounded-sm bg-cyber-darker text-cyber-cyan placeholder-cyber-cyan/40 focus:outline-none focus:border-cyber-cyan/80 focus:ring-2 focus:ring-cyber-cyan/30 font-mono cyber-border terminal-glow"
                placeholder="&gt; Enter password"
              />
            </div>

            {error && (
              <div className="p-4 bg-cyber-magenta/10 border border-cyber-magenta/40 rounded-sm cyber-border terminal-glow">
                <p className="text-cyber-magenta font-mono text-sm">
                  &gt; {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 resistance-accent text-cyber-cyan rounded-sm font-bold hover:opacity-90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyber-cyan/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono uppercase border border-cyber-cyan/60 terminal-glow"
            >
              {loading ? '&gt; Authenticating...' : '&gt; Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-cyber-cyan/70 hover:text-cyber-cyan transition-colors font-mono text-sm"
            >
              &lt; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

