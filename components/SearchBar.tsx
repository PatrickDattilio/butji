'use client'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg
          className="w-5 h-5 text-cyber-cyan"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ filter: 'drop-shadow(0 0 3px currentColor)' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="&gt; Search resources..."
        className="block w-full pl-10 pr-3 py-3 border border-cyber-cyan/40 rounded-sm bg-cyber-dark text-cyber-cyan placeholder-cyber-cyan/40 focus:outline-none focus:border-cyber-cyan/80 focus:ring-2 focus:ring-cyber-cyan/30 font-mono cyber-border terminal-glow"
      />
    </div>
  )
}


