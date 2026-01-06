'use client'

import { useCallback, useMemo, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { GraphData, GraphNode, GraphLink, GraphNodeType, GraphLinkType } from '@/lib/companyRelationships'
import { useRouter } from 'next/navigation'

// Dynamically import react-force-graph-2d to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-cyber-dark border border-cyber-cyan/30 rounded-sm">
      <div className="text-cyber-cyan font-mono">Loading graph...</div>
    </div>
  ),
})

interface CompanyRelationshipGraphProps {
  graphData: GraphData
  initialCompanyIds?: string[] // Focus on specific companies
  showInvestors?: boolean
  showSubsidiaries?: boolean
  showBoardMembers?: boolean
  showPartnerships?: boolean
  showDataCenters?: boolean
  maxDepth?: number // Limit relationship depth
}

const linkTypeLabels: Record<GraphLinkType, string> = {
  investor: 'Investment',
  parent: 'Parent Company',
  subsidiary: 'Subsidiary',
  'board-member': 'Board Member',
  founder: 'Founder',
  partnership: 'Partnership',
  'data-center-owner': 'Owns Data Center',
  'data-center-user': 'Uses Data Center',
}

export default function CompanyRelationshipGraph({
  graphData,
  initialCompanyIds,
  showInvestors = true,
  showSubsidiaries = true,
  showBoardMembers = true,
  showPartnerships = true,
  showDataCenters = true,
}: CompanyRelationshipGraphProps) {
  const router = useRouter()
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
  const [hoveredLink, setHoveredLink] = useState<GraphLink | null>(null)
  const [nodeFilters, setNodeFilters] = useState<Record<GraphNodeType, boolean>>({
    company: true,
    person: true,
    'data-center': true,
    capital: true,
  })
  const [linkFilters, setLinkFilters] = useState<Record<GraphLinkType, boolean>>({
    investor: showInvestors,
    parent: showSubsidiaries,
    subsidiary: showSubsidiaries,
    'board-member': showBoardMembers,
    founder: true,
    partnership: showPartnerships,
    'data-center-owner': showDataCenters,
    'data-center-user': showDataCenters,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const graphRef = useRef<any>()

    // Filter nodes and links based on filters and search
    const filteredGraphData = useMemo(() => {
      // CRITICAL: graphData.links should always contain ALL edges
      // We never mutate it, only filter it to create filteredLinks
      
      // Step 1: Filter nodes by type and search
      let filteredNodes = graphData.nodes.filter((node) => {
        // Filter by node type
        if (!nodeFilters[node.type]) return false
        
        // Filter by search term
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase()
          return node.name.toLowerCase().includes(searchLower)
        }
        
        return true
      })

      // Step 2: Create set of visible node IDs
      const visibleNodeIds = new Set(filteredNodes.map((n) => n.id))

      // Step 3: Filter links - preserve links between visible nodes
      // CRITICAL: graphData.links is the source of truth - we never modify it
      // IMPORTANT: Handle both string IDs and object references (in case graph library transforms them)
      const filteredLinks = graphData.links.filter((link) => {
        // Extract source and target IDs - handle both string and object formats
        const sourceId = typeof link.source === 'string' ? link.source : (link.source as any)?.id || link.source
        const targetId = typeof link.target === 'string' ? link.target : (link.target as any)?.id || link.target
        
        // First verify that both nodes actually exist in the graph data
        const sourceNodeExists = graphData.nodes.some(n => n.id === sourceId)
        const targetNodeExists = graphData.nodes.some(n => n.id === targetId)
        
        if (!sourceNodeExists || !targetNodeExists) {
          // Link references a node that doesn't exist - skip it
          return false
        }
        
        // Check 1: Both nodes must be visible (in the filtered node set)
        const sourceVisible = visibleNodeIds.has(sourceId)
        const targetVisible = visibleNodeIds.has(targetId)
        
        if (!sourceVisible || !targetVisible) {
          // One or both nodes are filtered out - this is expected when filtering by node type
          return false
        }
        
        // Check 2: Link type filter must be enabled
        // Default to true (show link) if link type filter is true or undefined
        // Only filter out if explicitly set to false
        const linkTypeFilterValue = linkFilters[link.type]
        if (linkTypeFilterValue === false) {
          return false // Link type is explicitly disabled by filter
        }
        // Allow link through if: true, undefined, or any other truthy value
        
        // Both checks passed - this link should be visible
        return true
      })
      
      // Debug: Always log when filtering removes all links
      if (filteredLinks.length === 0 && graphData.links.length > 0) {
        // Check why links are being filtered
        const linkAnalysis = graphData.links.slice(0, 10).map(l => {
          // Extract IDs - handle both string and object formats
          const sourceId = typeof l.source === 'string' ? l.source : (l.source as any)?.id || l.source
          const targetId = typeof l.target === 'string' ? l.target : (l.target as any)?.id || l.target
          
          const sourceNode = graphData.nodes.find(n => n.id === sourceId)
          const targetNode = graphData.nodes.find(n => n.id === targetId)
          const sourceInVisible = visibleNodeIds.has(sourceId)
          const targetInVisible = visibleNodeIds.has(targetId)
          const linkTypeFilter = linkFilters[l.type]
          const linkTypeEnabled = linkTypeFilter !== false
          
          return {
            type: l.type,
            source: l.source,
            sourceId: sourceId,
            target: l.target,
            targetId: targetId,
            sourceInVisible,
            targetInVisible,
            bothVisible: sourceInVisible && targetInVisible,
            linkTypeFilter,
            linkTypeEnabled,
            shouldBeVisible: sourceInVisible && targetInVisible && linkTypeEnabled,
            sourceNode: sourceNode?.name || 'NOT FOUND',
            targetNode: targetNode?.name || 'NOT FOUND',
            sourceNodeType: sourceNode?.type || 'NOT FOUND',
            targetNodeType: targetNode?.type || 'NOT FOUND',
            sourceNodeId: sourceNode?.id || 'NOT FOUND',
            targetNodeId: targetNode?.id || 'NOT FOUND',
          }
        })
        
        console.log('DEBUG: All links filtered out', {
          totalLinksInGraph: graphData.links.length,
          visibleNodeCount: visibleNodeIds.size,
          filteredNodeCount: filteredNodes.length,
          filteredLinksCount: filteredLinks.length,
          nodeFilters,
          linkFilters,
          sampleVisibleNodeIds: Array.from(visibleNodeIds).slice(0, 5),
          linkAnalysis,
        })
      }
      
      // Debug: Log when links should be visible but aren't
      if (filteredLinks.length === 0 && visibleNodeIds.size > 1 && graphData.links.length > 0) {
        // Check if there are links that should be visible
        const shouldBeVisibleLinks = graphData.links.filter(link => {
          const bothVisible = visibleNodeIds.has(link.source) && visibleNodeIds.has(link.target)
          const linkTypeEnabled = linkFilters[link.type] !== false
          return bothVisible && linkTypeEnabled
        })
        
        if (shouldBeVisibleLinks.length > 0) {
          console.log('DEBUG: Links should be visible but are filtered out', {
            shouldBeVisibleCount: shouldBeVisibleLinks.length,
            filteredLinksCount: filteredLinks.length,
            visibleNodeCount: visibleNodeIds.size,
            sampleShouldBeVisible: shouldBeVisibleLinks.slice(0, 3).map(l => ({
              type: l.type,
              source: l.source,
              target: l.target,
              linkTypeFilter: linkFilters[l.type]
            }))
          })
        }
      }

    // Build set of nodes that are connected via filtered links
    // Handle both string IDs and object references
    const linkedNodeIds = new Set<string>()
    filteredLinks.forEach((link) => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any)?.id || link.source
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any)?.id || link.target
      linkedNodeIds.add(sourceId)
      linkedNodeIds.add(targetId)
    })

    // Also build set of nodes that have links in the original graph data (for fallback)
    // Handle both string IDs and object references
    const originalLinkedNodeIds = new Set<string>()
    graphData.links.forEach((link) => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any)?.id || link.source
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any)?.id || link.target
      // Only consider links where both nodes are in the filtered set
      if (visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId)) {
        originalLinkedNodeIds.add(sourceId)
        originalLinkedNodeIds.add(targetId)
      }
    })

    // Check if any node type filters are active (i.e., some node types are disabled)
    const hasActiveNodeFilters = Object.values(nodeFilters).some(enabled => !enabled)

    // Filter nodes: keep nodes that are connected OR match search term
    // CRITICAL FIX: Don't filter out nodes based on links - this creates a circular dependency
    // Instead, keep ALL nodes that passed the node type filter, and let the links be filtered separately
    // This ensures that when filters are toggled, nodes and their links both reappear correctly
    if (searchTerm) {
      // Keep all nodes that match search, even if they have no links
      filteredNodes = filteredNodes.filter(
        (node) => linkedNodeIds.has(node.id) || node.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    } else {
      // ALWAYS keep all nodes that passed the node type filter
      // The links are already filtered correctly based on visibleNodeIds
      // Filtering nodes based on links creates a circular dependency that breaks when toggling filters
      filteredNodes = filteredNodes
      // Don't filter nodes based on linkedNodeIds - that's the bug!
    }

    return {
      nodes: filteredNodes,
      links: filteredLinks,
    }
  }, [graphData, nodeFilters, linkFilters, searchTerm])

  // Node styling based on type
  const getNodeColor = useCallback((node: GraphNode): string => {
    switch (node.type) {
      case 'company':
        return '#00ffff' // cyan
      case 'person':
        return '#ffd700' // gold/yellow
      case 'data-center':
        return '#9d4edd' // purple
      case 'capital':
        return '#ff0000' // red
      default:
        return '#00ffff'
    }
  }, [])

  const getNodeSize = useCallback((node: GraphNode): number => {
    // Companies are larger, people and capital are medium, data centers are smaller
    switch (node.type) {
      case 'company':
        return 12
      case 'person':
        return 8
      case 'capital':
        return 8
      case 'data-center':
        return 6
      default:
        return 8
    }
  }, [])

  // Link styling based on type
  const getLinkColor = useCallback((link: GraphLink): string => {
    switch (link.type) {
      case 'investor':
        return 'rgba(0, 255, 255, 0.4)' // cyan
      case 'parent':
      case 'subsidiary':
        return 'rgba(255, 0, 255, 0.5)' // magenta
      case 'board-member':
        return 'rgba(173, 255, 47, 0.6)' // lime - distinct from founder gold
      case 'founder':
        return 'rgba(255, 215, 0, 0.6)' // gold
      case 'partnership':
        return 'rgba(0, 255, 0, 0.4)' // green
      case 'data-center-owner':
      case 'data-center-user':
        return 'rgba(157, 78, 221, 0.4)' // purple
      default:
        return 'rgba(0, 255, 255, 0.3)'
    }
  }, [])

  const getLinkWidth = useCallback((link: GraphLink): number => {
    // Use strength if available, otherwise default based on type
    if (link.strength) {
      return link.strength * 2
    }
    return 1.5
  }, [])

  // Handle node click
  const handleNodeClick = useCallback(
    (node: any) => {
      const graphNode = node as GraphNode
      if (graphNode.type === 'company' && graphNode.slug) {
        router.push(`/companies/${graphNode.slug}`)
      } else if (graphNode.type === 'person' && graphNode.slug) {
        // Future: navigate to person detail page
        // router.push(`/people/${graphNode.slug}`)
      }
    },
    [router]
  )

  // Handle node hover
  const handleNodeHover = useCallback((node: any) => {
    setHoveredNode(node ? (node as GraphNode) : null)
  }, [])

  // Handle link hover
  const handleLinkHover = useCallback((link: any) => {
    setHoveredLink(link ? (link as GraphLink) : null)
  }, [])

  // Toggle node type filter
  const toggleNodeFilter = (type: GraphNodeType) => {
    setNodeFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))
  }

  // Toggle link type filter
  const toggleLinkFilter = (type: GraphLinkType) => {
    setLinkFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))
  }

  // Focus on specific nodes (for initialCompanyIds)
  const focusOnNodes = useCallback(() => {
    if (initialCompanyIds && initialCompanyIds.length > 0 && graphRef.current) {
      // Find the nodes
      const focusNodes = filteredGraphData.nodes.filter((node) =>
        initialCompanyIds.includes(node.metadata?.companyId || '')
      )
      
      if (focusNodes.length > 0) {
        // Calculate center of focus nodes
        const centerX = focusNodes.reduce((sum, node: any) => sum + (node.x || 0), 0) / focusNodes.length
        const centerY = focusNodes.reduce((sum, node: any) => sum + (node.y || 0), 0) / focusNodes.length
        
        // Zoom and pan to center
        graphRef.current.zoomToFit(400, 20)
        graphRef.current.centerAt(centerX, centerY, 1000)
      }
    }
  }, [initialCompanyIds, filteredGraphData.nodes])

  return (
    <div className="w-full h-full flex flex-col bg-cyber-dark border border-cyber-cyan/30 rounded-sm cyber-border">
      {/* Controls Panel */}
      <div className="p-4 border-b border-cyber-cyan/30 bg-cyber-darker">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="> Search nodes..."
              className="w-full px-3 py-2 border border-cyber-cyan/40 rounded-sm bg-cyber-dark text-cyber-cyan placeholder-cyber-cyan/40 focus:outline-none focus:border-cyber-cyan/80 focus:ring-2 focus:ring-cyber-cyan/30 font-mono text-sm cyber-border terminal-glow"
            />
          </div>

          {/* Node Type Filters */}
          <div className="flex gap-2 items-center">
            <span className="text-xs font-bold text-cyber-cyan/60 font-mono uppercase">Node Types:</span>
            {(['company', 'person', 'capital', 'data-center'] as GraphNodeType[]).map((type) => (
              <button
                key={type}
                onClick={() => toggleNodeFilter(type)}
                className={`px-2 py-1 text-xs font-bold rounded-sm font-mono uppercase transition-all ${
                  nodeFilters[type]
                    ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/50 terminal-glow'
                    : 'bg-cyber-dark text-cyber-cyan/40 border border-cyber-cyan/20 hover:border-cyber-cyan/40'
                }`}
              >
                {type === 'data-center' ? 'Data Centers' : type.charAt(0).toUpperCase() + type.slice(1) + (type === 'capital' ? '' : 's')}
              </button>
            ))}
          </div>

          {/* Link Type Filters */}
          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-xs font-bold text-cyber-cyan/60 font-mono uppercase">Relationships:</span>
            {Object.entries(linkTypeLabels).map(([type, label]) => (
              <button
                key={type}
                onClick={() => toggleLinkFilter(type as GraphLinkType)}
                className={`px-2 py-1 text-xs font-bold rounded-sm font-mono uppercase transition-all ${
                  linkFilters[type as GraphLinkType]
                    ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/50 terminal-glow'
                    : 'bg-cyber-dark text-cyber-cyan/40 border border-cyber-cyan/20 hover:border-cyber-cyan/40'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="flex-1 relative min-h-[600px]">
        <ForceGraph2D
          ref={graphRef}
          graphData={filteredGraphData}
          nodeLabel={(node: any) => {
            const graphNode = node as GraphNode
            let label = graphNode.name
            if (graphNode.type === 'person' && hoveredNode?.id === graphNode.id) {
              // Could add more info here in the future
              label += ` (${graphNode.type})`
            }
            return label
          }}
          nodeColor={getNodeColor as any}
          nodeVal={getNodeSize as any}
          nodeRelSize={6}
          linkLabel={(link: any) => {
            const graphLink = link as GraphLink
            return linkTypeLabels[graphLink.type] || graphLink.type
          }}
          linkColor={getLinkColor as any}
          linkWidth={getLinkWidth as any}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.1}
          onNodeClick={handleNodeClick as any}
          onNodeHover={handleNodeHover as any}
          onLinkHover={handleLinkHover as any}
          cooldownTicks={100}
          onEngineStop={() => {
            // Focus on initial companies after graph stabilizes
            if (initialCompanyIds) {
              setTimeout(focusOnNodes, 100)
            }
          }}
          backgroundColor="rgba(0, 0, 0, 0)"
          // Custom node rendering
          nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
            const label = node.name || ''
            const fontSize = 12 / globalScale
            ctx.font = `${fontSize}px monospace`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = getNodeColor(node)
            
            // Draw node shape based on type
            const size = getNodeSize(node)
            ctx.beginPath()
            
            if (node.type === 'company') {
              // Rectangle for companies
              const rectSize = size * 1.5
              ctx.rect(node.x - rectSize / 2, node.y - rectSize / 2, rectSize, rectSize)
              ctx.strokeStyle = getNodeColor(node)
              ctx.lineWidth = 2 / globalScale
              ctx.stroke()
            } else if (node.type === 'capital') {
              // Triangle for capital entities (investment firms)
              const triSize = size * 1.5
              ctx.beginPath()
              ctx.moveTo(node.x, node.y - triSize) // Top point
              ctx.lineTo(node.x - triSize, node.y + triSize) // Bottom left
              ctx.lineTo(node.x + triSize, node.y + triSize) // Bottom right
              ctx.closePath()
              ctx.fillStyle = getNodeColor(node) + '80' // Add transparency
              ctx.fill()
              ctx.strokeStyle = getNodeColor(node)
              ctx.lineWidth = 2 / globalScale
              ctx.stroke()
            } else if (node.type === 'data-center') {
              // Hexagon for data centers
              const hexSize = size * 1.2
              const sides = 6
              ctx.beginPath()
              for (let i = 0; i < sides; i++) {
                const angle = (Math.PI * 2 * i) / sides
                const x = node.x + hexSize * Math.cos(angle)
                const y = node.y + hexSize * Math.sin(angle)
                if (i === 0) ctx.moveTo(x, y)
                else ctx.lineTo(x, y)
              }
              ctx.closePath()
              ctx.strokeStyle = getNodeColor(node)
              ctx.lineWidth = 2 / globalScale
              ctx.stroke()
            } else {
              // Circle for people
              ctx.arc(node.x, node.y, size, 0, 2 * Math.PI)
              ctx.fillStyle = getNodeColor(node) + '80' // Add transparency
              ctx.fill()
              ctx.strokeStyle = getNodeColor(node)
              ctx.lineWidth = 2 / globalScale
              ctx.stroke()
            }
            
            // Draw label
            if (globalScale > 0.5) {
              ctx.fillStyle = getNodeColor(node)
              ctx.fillText(label, node.x, node.y + size + fontSize + 2)
            }
          }}
        />

        {/* Hover Tooltip */}
        {(hoveredNode || hoveredLink) && (
          <div className="absolute top-4 right-4 bg-cyber-dark border border-cyber-cyan/50 rounded-sm p-3 max-w-xs z-10 cyber-border terminal-glow">
            {hoveredNode && (
              <div>
                <div className="text-cyber-cyan font-bold font-mono mb-1">
                  &gt; {hoveredNode.name}
                </div>
                <div className="text-cyber-cyan/60 text-xs font-mono uppercase">
                  {hoveredNode.type}
                </div>
                {hoveredNode.slug && (
                  <div className="text-cyber-cyan/40 text-xs font-mono mt-1">
                    Click to view details
                  </div>
                )}
              </div>
            )}
            {hoveredLink && (
              <div>
                <div className="text-cyber-cyan font-bold font-mono mb-1">
                  &gt; {linkTypeLabels[hoveredLink.type]}
                </div>
                {hoveredLink.metadata?.amount && (
                  <div className="text-cyber-cyan/60 text-xs font-mono">
                    Amount: {hoveredLink.metadata.amount}
                  </div>
                )}
                {hoveredLink.metadata?.title && (
                  <div className="text-cyber-cyan/60 text-xs font-mono">
                    {hoveredLink.metadata.title}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-cyber-dark/90 border border-cyber-cyan/30 rounded-sm p-3 z-10 cyber-border">
          <div className="text-xs font-bold text-cyber-cyan font-mono uppercase mb-2">Legend</div>
          <div className="space-y-1 text-xs font-mono">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-cyber-cyan"></div>
              <span className="text-cyber-cyan/80">Company</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2" style={{ backgroundColor: '#ffd700', borderColor: '#ffd700' }}></div>
              <span className="text-cyber-cyan/80">Person</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2" style={{ borderColor: '#ff0000', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', backgroundColor: '#ff000080' }}></div>
              <span className="text-cyber-cyan/80">Capital</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-cyber-purple" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
              <span className="text-cyber-cyan/80">Data Center</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
