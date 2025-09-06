'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { PoliticalIdentity, PoliticalIdentityContextType } from '../types'

const PoliticalIdentityContext = createContext<PoliticalIdentityContextType | undefined>(undefined)

// Default political identities with California democracy theme colors
const defaultIdentities: PoliticalIdentity[] = [
  {
    _id: 'democrat',
    id: 1,
    name: 'Democrat',
    slug: 'democrat',
    abbr: 'D',
    color: '#1e40af', // blue-600
    description: 'Democratic Party affiliation',
    isActive: true,
    identityType: 'PoliticalIdentity',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'republican',
    id: 2,
    name: 'Republican',
    slug: 'republican',
    abbr: 'R',
    color: '#dc2626', // red-600
    description: 'Republican Party affiliation',
    isActive: true,
    identityType: 'PoliticalIdentity',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'independent',
    id: 3,
    name: 'Independent',
    slug: 'independent',
    abbr: 'I',
    color: '#7c3aed', // violet-600
    description: 'Independent voter',
    isActive: true,
    identityType: 'PoliticalIdentity',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'green',
    id: 4,
    name: 'Green',
    slug: 'green',
    abbr: 'G',
    color: '#059669', // emerald-600
    description: 'Green Party affiliation',
    isActive: true,
    identityType: 'PoliticalIdentity',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'libertarian',
    id: 5,
    name: 'Libertarian',
    slug: 'libertarian',
    abbr: 'L',
    color: '#d97706', // amber-600
    description: 'Libertarian Party affiliation',
    isActive: true,
    identityType: 'PoliticalIdentity',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'progressive',
    id: 6,
    name: 'Progressive',
    slug: 'progressive',
    abbr: 'P',
    color: '#be185d', // pink-600
    description: 'Progressive movement',
    isActive: true,
    identityType: 'PoliticalIdentity',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'conservative',
    id: 7,
    name: 'Conservative',
    slug: 'conservative',
    abbr: 'C',
    color: '#9d174d', // rose-600
    description: 'Conservative movement',
    isActive: true,
    identityType: 'PoliticalIdentity',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'moderate',
    id: 8,
    name: 'Moderate',
    slug: 'moderate',
    abbr: 'M',
    color: '#6b7280', // gray-600
    description: 'Moderate political position',
    isActive: true,
    identityType: 'PoliticalIdentity',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

export function PoliticalIdentityProvider({ children }: { children: React.ReactNode }) {
  const [selectedIdentity, setSelectedIdentity] = useState<PoliticalIdentity | null>(null)
  const [availableIdentities] = useState<PoliticalIdentity[]>(defaultIdentities)

  useEffect(() => {
    // Load selected identity from localStorage on mount
    const savedIdentityId = localStorage.getItem('politicalIdentity')
    if (savedIdentityId) {
      const savedIdentity = availableIdentities.find(id => id._id === savedIdentityId)
      if (savedIdentity) {
        setSelectedIdentity(savedIdentity)
      }
    }
  }, [availableIdentities])

  const handleSetIdentity = (identity: PoliticalIdentity | null) => {
    setSelectedIdentity(identity)
    if (identity) {
      localStorage.setItem('politicalIdentity', identity._id)
    } else {
      localStorage.removeItem('politicalIdentity')
    }
  }

  return (
    <PoliticalIdentityContext.Provider
      value={{
        selectedIdentity,
        setSelectedIdentity: handleSetIdentity,
        availableIdentities
      }}
    >
      {children}
    </PoliticalIdentityContext.Provider>
  )
}

export function usePoliticalIdentity() {
  const context = useContext(PoliticalIdentityContext)
  if (context === undefined) {
    throw new Error('usePoliticalIdentity must be used within a PoliticalIdentityProvider')
  }
  return context
}
