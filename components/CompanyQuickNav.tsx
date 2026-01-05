'use client'

import { useEffect, useState, useRef } from 'react'

interface Section {
  id: string
  title: string
}

const sections: Section[] = [
  { id: 'about', title: 'About' },
  { id: 'basic-info', title: 'Basic Info' },
  { id: 'founders', title: 'Founders' },
  { id: 'products', title: 'Products' },
  { id: 'funding', title: 'Funding' },
  { id: 'layoffs', title: 'Layoffs' },
  { id: 'controversies', title: 'Controversies' },
  { id: 'direct-action', title: 'Direct Action' },
  { id: 'locations', title: 'Locations' },
  { id: 'datacenters', title: 'Data Centers' },
  { id: 'tags', title: 'Tags' },
]

interface CompanyQuickNavProps {
  availableSections?: string[] // IDs of sections that actually exist on the page
}

export default function CompanyQuickNav({ availableSections }: CompanyQuickNavProps) {
  const [activeSection, setActiveSection] = useState('')
  const [scrollProgress, setScrollProgress] = useState(0)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Filter sections to only show those that exist on the page
  const visibleSections = sections.filter(
    section => !availableSections || availableSections.includes(section.id)
  )

  useEffect(() => {
    // Set up Intersection Observer to track which section is in viewport
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px', // Trigger when section is in upper portion of viewport
      threshold: 0,
    }

    observerRef.current = new IntersectionObserver((entries) => {
      // Find the entry with the highest intersection ratio that's intersecting
      const intersectingEntries = entries.filter(entry => entry.isIntersecting)
      if (intersectingEntries.length > 0) {
        // Sort by intersection ratio and get the top one
        const topEntry = intersectingEntries.sort(
          (a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0)
        )[0]
        setActiveSection(topEntry.target.id)
      }
    }, observerOptions)

    // Observe all sections
    visibleSections.forEach((section) => {
      const element = document.getElementById(section.id)
      if (element && observerRef.current) {
        observerRef.current.observe(element)
      }
    })

    // Track scroll progress
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100
      setScrollProgress(Math.min(100, Math.max(0, progress)))
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial calculation

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      window.removeEventListener('scroll', handleScroll)
    }
  }, [visibleSections])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault()
    const element = document.getElementById(sectionId)
    if (element) {
      const headerOffset = 100 // Offset for sticky header
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })

      // Temporarily set active section for immediate feedback
      setActiveSection(sectionId)
    }
  }

  if (visibleSections.length === 0) {
    return null
  }

  return (
    <>
      {/* Desktop: Fixed Sidebar */}
      <nav
        className="hidden lg:block fixed top-52 w-48 z-20"
        style={{
          left: 'max(1rem, calc((100vw - 80rem) / 2))',
        }}
        aria-label="Table of contents"
      >
        <div className="bg-cyber-dark border border-red-500/30 cyber-border rounded-sm p-4 terminal-glow">
          {/* Progress indicator */}
          <div className="mb-4">
            <div className="h-1 bg-red-500/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-150"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
            <p className="text-xs text-red-400/60 font-mono mt-1">
              {Math.round(scrollProgress)}%
            </p>
          </div>

          {/* Section links */}
          <div className="space-y-1">
            <p className="text-xs font-bold text-red-400/60 font-mono uppercase mb-2 tracking-wider">
              &gt; Navigation
            </p>
            {visibleSections.map((section) => {
              const isActive = activeSection === section.id
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(e) => handleClick(e, section.id)}
                  className={`block px-2 py-1.5 text-sm font-mono transition-all duration-200 rounded-sm ${
                    isActive
                      ? 'bg-red-500/20 text-red-400 border-l-2 border-red-500 terminal-glow'
                      : 'text-red-400/70 hover:text-red-400 hover:bg-red-500/10'
                  }`}
                  aria-current={isActive ? 'location' : undefined}
                >
                  {isActive && <span className="text-red-500 mr-1">&gt;</span>}
                  {section.title}
                </a>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Mobile: Horizontal Scrollable Nav */}
      <nav
        className="lg:hidden sticky top-[88px] z-20 bg-cyber-dark border-b border-red-500/30 cyber-border"
        aria-label="Table of contents"
      >
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex space-x-1 px-4 py-3 min-w-max">
            {visibleSections.map((section) => {
              const isActive = activeSection === section.id
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(e) => handleClick(e, section.id)}
                  className={`px-3 py-1.5 text-xs font-mono whitespace-nowrap rounded-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-red-500/20 text-red-400 border border-red-500/50 terminal-glow'
                      : 'text-red-400/70 hover:text-red-400 hover:bg-red-500/10 border border-transparent'
                  }`}
                  aria-current={isActive ? 'location' : undefined}
                >
                  {section.title}
                </a>
              )
            })}
          </div>
        </div>
        {/* Mobile progress bar */}
        <div className="h-0.5 bg-red-500/20">
          <div
            className="h-full bg-red-500 transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </nav>
    </>
  )
}
