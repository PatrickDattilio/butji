import { DataCenter } from '@/types/datacenter'
import { Citation } from '@/types/company'
import Link from 'next/link'
import CitationList from '@/components/CitationList'

interface DataCenterCardProps {
  dataCenter: DataCenter
  isOwner?: boolean
  userConfidence?: string
}

export default function DataCenterCard({ dataCenter, isOwner, userConfidence }: DataCenterCardProps) {
  const formatNumber = (num?: number) => {
    if (!num) return null
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toFixed(0)
  }

  const formatCurrency = (billions?: number) => {
    if (!billions) return null
    return `$${billions.toFixed(2)}B`
  }

  const getConfidenceBadge = (confidence?: string) => {
    if (!confidence) return null
    const colorMap: Record<string, string> = {
      confident: 'bg-green-500/20 text-green-400 border-green-500/50',
      likely: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      speculative: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    }
    const color = colorMap[confidence] || 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    return (
      <span className={`px-2 py-0.5 text-xs font-mono uppercase border rounded-sm ${color}`}>
        {confidence}
      </span>
    )
  }

  return (
    <div className="p-4 bg-cyber-dark border border-red-500/30 rounded-sm space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-red-400 font-mono mb-1">
            &gt; {dataCenter.title}
          </h3>
          {dataCenter.project && (
            <p className="text-sm text-red-400/70 font-mono">{dataCenter.project}</p>
          )}
        </div>
        {isOwner && (
          <span className="px-2 py-1 text-xs font-bold rounded-sm bg-red-500/20 text-red-400 border border-red-500/50 font-mono uppercase">
            Owner
          </span>
        )}
        {userConfidence && getConfidenceBadge(userConfidence)}
      </div>

      {/* Timelapse Image */}
      {dataCenter.timelapseImageUrl && (
        <div className="w-full">
          <img
            src={dataCenter.timelapseImageUrl}
            alt={`${dataCenter.title} satellite timelapse`}
            className="w-full h-auto rounded-sm border border-red-500/20"
          />
        </div>
      )}

      {/* Location */}
      {(dataCenter.address || dataCenter.latitude || dataCenter.longitude) && (
        <div>
          <h4 className="text-xs font-bold text-red-400/60 mb-1 font-mono uppercase">Location</h4>
          {dataCenter.address && (
            <p className="text-sm text-red-400/90 font-mono">{dataCenter.address}</p>
          )}
          {(dataCenter.latitude || dataCenter.longitude) && (
            <p className="text-xs text-red-400/70 font-mono">
              {dataCenter.latitude && dataCenter.longitude
                ? `${dataCenter.latitude}, ${dataCenter.longitude}`
                : dataCenter.latitude || dataCenter.longitude}
            </p>
          )}
        </div>
      )}

      {/* Stats Grid */}
      {(dataCenter.currentH100Equivalents ||
        dataCenter.currentPowerMW ||
        dataCenter.currentCapitalCostUSD) && (
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-red-500/20">
          {dataCenter.currentH100Equivalents && (
            <div>
              <p className="text-xs text-red-400/60 font-mono uppercase mb-1">H100 Equiv</p>
              <p className="text-sm font-bold text-red-400 font-mono">
                {formatNumber(dataCenter.currentH100Equivalents)}
              </p>
            </div>
          )}
          {dataCenter.currentPowerMW && (
            <div>
              <p className="text-xs text-red-400/60 font-mono uppercase mb-1">Power</p>
              <p className="text-sm font-bold text-red-400 font-mono">
                {formatNumber(dataCenter.currentPowerMW)} MW
              </p>
            </div>
          )}
          {dataCenter.currentCapitalCostUSD && (
            <div>
              <p className="text-xs text-red-400/60 font-mono uppercase mb-1">Cost</p>
              <p className="text-sm font-bold text-red-400 font-mono">
                {formatCurrency(dataCenter.currentCapitalCostUSD)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Owner */}
      {dataCenter.owner && !isOwner && (
        <div>
          <h4 className="text-xs font-bold text-red-400/60 mb-1 font-mono uppercase">Owner</h4>
          <Link
            href={`/companies/${dataCenter.owner.slug || dataCenter.owner.id}`}
            className="text-sm text-red-400 hover:text-red-300 font-mono transition-colors"
          >
            {dataCenter.owner.name}
          </Link>
        </div>
      )}

      {/* Users */}
      {dataCenter.users && dataCenter.users.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-red-400/60 mb-1 font-mono uppercase">Users</h4>
          <div className="flex flex-wrap gap-2">
            {dataCenter.users.map((user) => (
              <div key={user.id} className="flex items-center gap-1">
                <Link
                  href={`/companies/${user.company.slug || user.company.id}`}
                  className="text-sm text-red-400 hover:text-red-300 font-mono transition-colors"
                >
                  {user.company.name}
                </Link>
                {user.confidence && getConfidenceBadge(user.confidence)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Companies */}
      {(dataCenter.investors?.length ||
        dataCenter.constructionCompanies?.length ||
        dataCenter.energyCompanies?.length) && (
        <div className="pt-2 border-t border-red-500/20 space-y-2">
          {dataCenter.investors && dataCenter.investors.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-red-400/60 mb-1 font-mono uppercase">Investors</h4>
              <div className="flex flex-wrap gap-2">
                {dataCenter.investors.map((investor, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded-sm font-mono"
                  >
                    {investor}
                  </span>
                ))}
              </div>
            </div>
          )}
          {dataCenter.constructionCompanies && dataCenter.constructionCompanies.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-red-400/60 mb-1 font-mono uppercase">
                Construction
              </h4>
              <div className="flex flex-wrap gap-2">
                {dataCenter.constructionCompanies.map((company, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded-sm font-mono"
                  >
                    {company}
                  </span>
                ))}
              </div>
            </div>
          )}
          {dataCenter.energyCompanies && dataCenter.energyCompanies.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-red-400/60 mb-1 font-mono uppercase">Energy</h4>
              <div className="flex flex-wrap gap-2">
                {dataCenter.energyCompanies.map((company, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded-sm font-mono"
                  >
                    {company}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Citations */}
      {dataCenter.citations && dataCenter.citations.length > 0 && (
        <div className="pt-2 border-t border-red-500/20">
          <CitationList citations={dataCenter.citations} fieldName="Data Center Sources" />
        </div>
      )}
    </div>
  )
}
