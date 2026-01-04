'use client'

import { useState } from 'react'
import { ReportType } from '@/types/report'
import ReportModal from './ReportModal'

interface ReportButtonProps {
  type: ReportType
  targetId: string
  targetName: string
  className?: string
}

export default function ReportButton({ type, targetId, targetName, className = '' }: ReportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const accentColor = type === 'company' ? 'red' : 'cyan'
  const buttonClass = type === 'company'
    ? 'text-red-400 border-red-500/30 hover:border-red-500/60 hover:text-red-300'
    : 'text-cyber-cyan border-cyber-cyan/30 hover:border-cyber-cyan/60 hover:text-cyber-magenta'

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setIsModalOpen(true)
        }}
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-mono uppercase border rounded-sm transition-all ${buttonClass} ${className}`}
        title={`Report update for ${targetName}`}
      >
        <span>⚠</span>
        <span>Report</span>
      </button>
      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={type}
        targetId={targetId}
        targetName={targetName}
      />
    </>
  )
}
