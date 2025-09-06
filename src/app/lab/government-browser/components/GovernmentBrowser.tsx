'use client'

import React, { useState, useEffect } from 'react'
import JurisdictionBrowser from './JurisdictionBrowser'
import GoverningBodyBrowser from './GoverningBodyBrowser'
import OfficeBrowser from './OfficeBrowser'
import PositionBrowser from './PositionBrowser'
import ElectionBrowser from './ElectionBrowser'
import LegislationBrowser from './LegislationBrowser'
import CommitteeBrowser from './CommitteeBrowser'
import DistrictBrowser from './DistrictBrowser'
import ContactInfoBrowser from './ContactInfoBrowser'
import MediaBrowser from './MediaBrowser'
import EntityProfileAndEditor from './EntityProfileAndEditor'
import { useTheme } from '@/app/contexts/ThemeContext'

interface GovernmentBrowserProps {
  isAuthorized: boolean
}

interface BreadcrumbItem {
  id: string
  name: string
  path: string
}

type TabType = 'jurisdictions' | 'governing-bodies' | 'offices' | 'positions' | 'elections' | 'legislation' | 'committees' | 'districts' | 'contact-info' | 'media'

const tabs: { id: TabType; name: string; icon: string; description: string; browser: React.ComponentType<any> }[] = [
  {
    id: 'jurisdictions',
    name: 'Jurisdictions',
    icon: '🌍',
    description: 'Geographic and corporate governing areas',
    browser: JurisdictionBrowser
  },
  {
    id: 'governing-bodies', 
    name: 'Governing Bodies',
    icon: '🏛️',
    description: 'Legislative bodies, executive branches, judicial systems',
    browser: GoverningBodyBrowser
  },
  {
    id: 'offices',
    name: 'Offices', 
    icon: '👔',
    description: 'Specific positions and roles within governing bodies',
    browser: OfficeBrowser
  },
  {
    id: 'positions',
    name: 'Positions',
    icon: '👤', 
    description: 'Person assignments to offices with terms',
    browser: PositionBrowser
  },
  {
    id: 'elections',
    name: 'Elections',
    icon: '🗳️',
    description: 'Elections with candidates and results',
    browser: ElectionBrowser
  },
  {
    id: 'legislation',
    name: 'Legislation',
    icon: '📜',
    description: 'Bills, resolutions, and legislative actions',
    browser: LegislationBrowser
  },
  {
    id: 'committees',
    name: 'Committees',
    icon: '👥',
    description: 'Committees within governing bodies',
    browser: CommitteeBrowser
  },
  {
    id: 'districts',
    name: 'Districts',
    icon: '🗺️',
    description: 'Electoral districts and geographic divisions',
    browser: DistrictBrowser
  },
  {
    id: 'contact-info',
    name: 'Contact Info',
    icon: '📞',
    description: 'Contact details for government entities',
    browser: ContactInfoBrowser
  },
  {
    id: 'media',
    name: 'Media',
    icon: '🖼️',
    description: 'Seals, flags, headshots, and other media files',
    browser: MediaBrowser
  }
]

export default function GovernmentBrowser({ isAuthorized }: GovernmentBrowserProps) {
  const { resolvedTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<TabType>('jurisdictions')
  const [isLoading, setIsLoading] = useState(false)
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])
  const [selectedEntity, setSelectedEntity] = useState<any>(null)

  // Theme-aware class names
  const themeClasses = {
    container: resolvedTheme === 'dark' 
      ? 'bg-surface-dark border-neutral-dark' 
      : 'bg-surface border-neutral-light',
    header: resolvedTheme === 'dark' 
      ? 'text-foreground' 
      : 'text-foreground',
    text: resolvedTheme === 'dark' ? 'text-foreground' : 'text-foreground',
    textSecondary: resolvedTheme === 'dark' ? 'text-neutral-light' : 'text-neutral-dark',
    textMuted: resolvedTheme === 'dark' ? 'text-neutral' : 'text-neutral',
    tabContainer: resolvedTheme === 'dark' 
      ? 'border-neutral' 
      : 'border-neutral-light',
    tabButton: {
      active: resolvedTheme === 'dark'
        ? 'border-primary text-primary focus:ring-primary-light'
        : 'border-primary text-primary focus:ring-primary',
      inactive: resolvedTheme === 'dark'
        ? 'border-transparent text-neutral hover:text-neutral-light hover:border-neutral focus:ring-neutral-light'
        : 'border-transparent text-neutral-dark hover:text-neutral hover:border-neutral-light focus:ring-neutral'
    },
    description: resolvedTheme === 'dark' 
      ? 'bg-surface-dark border-neutral' 
      : 'bg-neutral-light border-neutral-light',
    breadcrumb: resolvedTheme === 'dark' 
      ? 'bg-primary/10 border-primary/20' 
      : 'bg-primary/5 border-primary/20',
    breadcrumbText: resolvedTheme === 'dark' 
      ? 'text-primary-light' 
      : 'text-primary-dark',
    breadcrumbLink: resolvedTheme === 'dark' 
      ? 'text-primary-light hover:text-primary focus:ring-primary-light' 
      : 'text-primary-dark hover:text-primary focus:ring-primary',
    breadcrumbSeparator: resolvedTheme === 'dark' 
      ? 'text-primary/60' 
      : 'text-primary/60',
    content: resolvedTheme === 'dark' 
      ? 'bg-surface-dark' 
      : 'bg-surface'
  }

  // Handle jurisdiction selection for breadcrumbs
  const handleJurisdictionSelect = (jurisdiction: any) => {
    const newBreadcrumb: BreadcrumbItem = {
      id: jurisdiction._id,
      name: jurisdiction.name,
      path: jurisdiction.path
    }
    
    // Find the position of this jurisdiction in the current breadcrumb path
    const existingIndex = breadcrumbs.findIndex(bc => bc.id === jurisdiction._id)
    
    if (existingIndex >= 0) {
      // If jurisdiction already exists in breadcrumbs, truncate to that point
      setBreadcrumbs(breadcrumbs.slice(0, existingIndex + 1))
    } else {
      // Add to breadcrumbs
      setBreadcrumbs([...breadcrumbs, newBreadcrumb])
    }
    
    // Set the selected entity for the profile/editor
    setSelectedEntity(jurisdiction)
  }

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (index: number) => {
    setBreadcrumbs(breadcrumbs.slice(0, index + 1))
  }

  // Clear breadcrumbs
  const clearBreadcrumbs = () => {
    setBreadcrumbs([])
  }

  // Get current jurisdiction filter
  const getCurrentJurisdictionFilter = () => {
    if (breadcrumbs.length === 0) return null
    return breadcrumbs[breadcrumbs.length - 1].id
  }

  const renderTabContent = () => {
    const commonProps = { 
      isAuthorized, 
      isLoading, 
      setIsLoading,
      breadcrumbs,
      onJurisdictionSelect: handleJurisdictionSelect,
      currentJurisdictionFilter: getCurrentJurisdictionFilter()
    }
    const EntityBrowser = tabs.find(tab => tab.id === activeTab)?.browser || JurisdictionBrowser;

    return <EntityBrowser {...commonProps} />
  }

  return (
    <div className={`rounded-lg shadow-lg overflow-hidden ${themeClasses.container} border`}>
      {/* Tab Navigation */}
      <div className={`border-b ${themeClasses.tabContainer}`}>
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-t
                ${activeTab === tab.id
                  ? themeClasses.tabButton.active
                  : themeClasses.tabButton.inactive
                }
              `}
              aria-label={`Switch to ${tab.name} tab`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg" aria-hidden="true">{tab.icon}</span>
                <span>{tab.name}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Description */}
      <div className={`px-6 py-3 border-b ${themeClasses.description}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-sm font-medium ${themeClasses.header}`}>
              {tabs.find(tab => tab.id === activeTab)?.name}
            </h3>
            <p className={`text-sm ${themeClasses.textSecondary}`}>
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isLoading && (
              <div className={`flex items-center text-sm ${themeClasses.textSecondary}`}>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </div>
            )}
            {isAuthorized && (
              <div className={`flex items-center text-sm ${themeClasses.textSecondary}`}>
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Edit Mode
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className={`px-6 py-3 border-b ${themeClasses.breadcrumb}`}>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${themeClasses.breadcrumbText}`}>Location:</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={clearBreadcrumbs}
                className={`text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 rounded transition-colors ${themeClasses.breadcrumbLink}`}
                aria-label="Clear breadcrumbs and show all jurisdictions"
              >
                All Jurisdictions
              </button>
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={breadcrumb.id}>
                  <svg className={`h-4 w-4 ${themeClasses.breadcrumbSeparator}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    className={`text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 rounded transition-colors ${themeClasses.breadcrumbLink}`}
                    aria-label={`Navigate to ${breadcrumb.name}`}
                  >
                    {breadcrumb.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className={`p-6 ${themeClasses.content}`}>
        {renderTabContent()}
      </div>

      {/* Entity Profile and Editor for the selected entity */}
      {selectedEntity && (
        <div className={`p-6 ${themeClasses.content}`}>
          <EntityProfileAndEditor entity={selectedEntity} />
        </div>
      )}
    </div>
  )
}
