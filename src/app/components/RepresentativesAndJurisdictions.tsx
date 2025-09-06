'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useTheme } from '../contexts/ThemeContext'

interface Representative {
  _id: string
  office: {
    _id: string
    name: string
    office_type: string
    jurisdiction?: {
      _id: string
      name: string
      slug: string
      level: string
    }
    governing_body?: {
      _id: string
      name: string
      slug: string
      branch: string
    }
  }
  person: {
    _id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
  }
  term_start: string
  term_end?: string
  party?: string
}

interface RepresentativesAndJurisdictionsProps {
  representatives: Representative[]
}

export default function RepresentativesAndJurisdictions({ representatives }: RepresentativesAndJurisdictionsProps) {
  const [activeTab, setActiveTab] = useState<'representatives' | 'jurisdictions'>('representatives')
  const { resolvedTheme } = useTheme()

  const getOfficeTypeColor = (officeType: string) => {
    const colors = {
      president: 'bg-[var(--fs-16350)]/10 text-[var(--fs-16350)] border-[var(--fs-16350)]/20',
      governor: 'bg-[var(--fs-15056)]/10 text-[var(--fs-15056)] border-[var(--fs-15056)]/20',
      senator: 'bg-[var(--fs-15125)]/10 text-[var(--fs-15125)] border-[var(--fs-15125)]/20',
      representative: 'bg-[var(--fs-14260)]/10 text-[var(--fs-14260)] border-[var(--fs-14260)]/20',
      mayor: 'bg-[var(--fs-15080)]/10 text-[var(--fs-15080)] border-[var(--fs-15080)]/20',
      judge: 'bg-[var(--fs-16357)]/10 text-[var(--fs-16357)] border-[var(--fs-16357)]/20',
      commissioner: 'bg-[var(--fs-16165)]/10 text-[var(--fs-16165)] border-[var(--fs-16165)]/20',
      other: 'bg-[var(--fs-16152)]/10 text-[var(--fs-16152)] border-[var(--fs-16152)]/20'
    }
    return colors[officeType as keyof typeof colors] || colors.other
  }

  const getBranchColor = (branch: string) => {
    const colors = {
      executive: 'bg-[var(--fs-15056)]/10 text-[var(--fs-15056)] border-[var(--fs-15056)]/20',
      legislative: 'bg-[var(--fs-14260)]/10 text-[var(--fs-14260)] border-[var(--fs-14260)]/20',
      judicial: 'bg-[var(--fs-15125)]/10 text-[var(--fs-15125)] border-[var(--fs-15125)]/20',
      independent: 'bg-[var(--fs-16357)]/10 text-[var(--fs-16357)] border-[var(--fs-16357)]/20'
    }
    return colors[branch as keyof typeof colors] || 'bg-[var(--fs-16152)]/10 text-[var(--fs-16152)] border-[var(--fs-16152)]/20'
  }

  const getLevelColor = (level: string) => {
    const colors = {
      federal: 'bg-[var(--fs-16350)]/10 text-[var(--fs-16350)] border-[var(--fs-16350)]/20',
      state: 'bg-[var(--fs-15056)]/10 text-[var(--fs-15056)] border-[var(--fs-15056)]/20',
      county: 'bg-[var(--fs-14260)]/10 text-[var(--fs-14260)] border-[var(--fs-14260)]/20',
      municipal: 'bg-[var(--fs-15080)]/10 text-[var(--fs-15080)] border-[var(--fs-15080)]/20',
      other: 'bg-[var(--fs-16152)]/10 text-[var(--fs-16152)] border-[var(--fs-16152)]/20'
    }
    return colors[level as keyof typeof colors] || colors.other
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatOfficeType = (officeType: string) => {
    return officeType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Group representatives by jurisdiction
  const representativesByJurisdiction = representatives.reduce((acc, rep) => {
    const jurisdictionId = rep.office.jurisdiction?._id || rep.office.governing_body?._id
    if (jurisdictionId) {
      if (!acc[jurisdictionId]) {
        acc[jurisdictionId] = {
          jurisdiction: rep.office.jurisdiction || rep.office.governing_body,
          representatives: []
        }
      }
      acc[jurisdictionId].representatives.push(rep)
    }
    return acc
  }, {} as Record<string, { jurisdiction: any; representatives: Representative[] }>)

  const jurisdictions = Object.values(representativesByJurisdiction)

  const renderRepresentative = (representative: Representative) => (
    <div key={representative._id} className={`p-4 border rounded-lg transition-colors duration-200 ${
      resolvedTheme === 'dark' 
        ? 'border-neutral-light bg-surface hover:bg-surface-dark' 
        : 'border-neutral-light bg-surface hover:bg-neutral-light'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-foreground mb-1">
            {representative.person.firstName} {representative.person.lastName}
          </h4>
          <p className="text-neutral text-sm mb-2">
            {representative.office.name} • {representative.office.jurisdiction?.name || representative.office.governing_body?.name || 'Unknown Organization'}
          </p>
        </div>
                 <div className="flex items-center gap-2">
           {representative.party && (
             <span className="px-2 py-1 rounded-full text-xs font-medium bg-[var(--fs-15056)]/10 text-[var(--fs-15056)] border border-[var(--fs-15056)]/20">
               {representative.party}
             </span>
           )}
         </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getOfficeTypeColor(representative.office.office_type)}`}>
          {formatOfficeType(representative.office.office_type)}
        </span>
        {representative.office.jurisdiction?.level && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(representative.office.jurisdiction.level)}`}>
            {representative.office.jurisdiction.level}
          </span>
        )}
        {representative.office.governing_body && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getBranchColor(representative.office.governing_body.branch)}`}>
            {representative.office.governing_body.branch}
          </span>
        )}
      </div>

      <div className="text-sm text-neutral">
        <div className="flex items-center gap-4">
          <span>Term: {formatDate(representative.term_start)}</span>
          {representative.term_end && <span>- {formatDate(representative.term_end)}</span>}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Link
          href={`mailto:${representative.person.email}`}
          className="text-primary hover:text-primary-dark text-sm font-medium"
        >
          Contact Representative
        </Link>
        <span className="text-neutral">•</span>
        <Link
          href={`/lab/government-browser`}
          className="text-primary hover:text-primary-dark text-sm font-medium"
        >
          View Office Details
        </Link>
      </div>
    </div>
  )

  const renderJurisdiction = (jurisdictionData: { jurisdiction: any; representatives: Representative[] }) => (
    <div key={jurisdictionData.jurisdiction._id} className={`p-4 border rounded-lg transition-colors duration-200 ${
      resolvedTheme === 'dark' 
        ? 'border-neutral-light bg-surface hover:bg-surface-dark' 
        : 'border-neutral-light bg-surface hover:bg-neutral-light'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-foreground mb-1">
            {jurisdictionData.jurisdiction.name}
          </h4>
          <p className="text-neutral text-sm mb-2">
            {jurisdictionData.representatives.length} representative{jurisdictionData.representatives.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(jurisdictionData.jurisdiction.level)}`}>
            {jurisdictionData.jurisdiction.level}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {jurisdictionData.representatives.map(rep => (
          <div key={rep._id} className="flex items-center justify-between p-2 bg-neutral-light rounded">
            <div>
              <p className="font-medium text-sm">
                {rep.person.firstName} {rep.person.lastName}
              </p>
              <p className="text-xs text-neutral">
                {rep.office.name} {rep.party && `(${rep.party})`}
              </p>
            </div>
            <Link
              href={`mailto:${rep.person.email}`}
              className="text-primary hover:text-primary-dark text-xs font-medium"
            >
              Contact
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <Link
          href={`/lab/government-browser`}
          className="text-primary hover:text-primary-dark text-sm font-medium"
        >
          View Jurisdiction Details
        </Link>
      </div>
    </div>
  )

  return (
    <div className={`rounded-lg shadow-sm border ${
      resolvedTheme === 'dark' 
        ? 'bg-surface border-neutral-light' 
        : 'bg-white border-neutral-light'
    }`}>
      <div className="p-6 border-b border-neutral-light">
        <h2 className="text-xl font-semibold text-foreground mb-2">Your Representatives & Jurisdictions</h2>
        <p className="text-neutral text-sm">
          Current office holders in jurisdictions where you have held positions or are active
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-neutral-light">
        <nav className="flex space-x-8 px-6" aria-label="Representatives tabs">
          <button
            onClick={() => setActiveTab('representatives')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-t ${
              activeTab === 'representatives'
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral hover:text-neutral-dark'
            }`}
          >
            Representatives ({representatives.length})
          </button>
          <button
            onClick={() => setActiveTab('jurisdictions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-t ${
              activeTab === 'jurisdictions'
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral hover:text-neutral-dark'
            }`}
          >
            Jurisdictions ({jurisdictions.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'representatives' && (
          <div>
            {representatives.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral mb-4">No representatives found for your jurisdictions.</p>
                <Link
                  href="/lab/government-browser"
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
                >
                  Browse Government Data
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {representatives.map(renderRepresentative)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'jurisdictions' && (
          <div>
            {jurisdictions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral mb-4">No jurisdictions found.</p>
                <Link
                  href="/lab/government-browser"
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
                >
                  Browse Government Data
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {jurisdictions.map(renderJurisdiction)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
