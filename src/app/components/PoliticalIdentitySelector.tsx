'use client'

import React, { useState, useRef, useEffect } from 'react'
import { usePoliticalIdentity } from '../contexts/PoliticalIdentityContext'
import { PoliticalIdentity } from '../types'

export default function PoliticalIdentitySelector() {
  const { selectedIdentity, setSelectedIdentity, availableIdentities } = usePoliticalIdentity()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const filteredIdentities = availableIdentities.filter(identity =>
    identity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (identity.abbr && identity.abbr.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleIdentitySelect = (identity: PoliticalIdentity) => {
    setSelectedIdentity(identity)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClearSelection = () => {
    setSelectedIdentity(null)
    setIsOpen(false)
    setSearchTerm('')
  }

  const getIdentityIcon = () => {
    if (selectedIdentity) {
      return (
        <div 
          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: selectedIdentity.color }}
        >
          {selectedIdentity.abbr}
        </div>
      )
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  }

  const getIdentityLabel = () => {
    if (selectedIdentity) {
      return (
        <span className="flex items-center space-x-2">
          <span>{selectedIdentity.name}</span>
          <span 
            className="text-xs font-bold px-1.5 py-0.5 rounded text-white"
            style={{ backgroundColor: selectedIdentity.color }}
          >
            {selectedIdentity.abbr}
          </span>
        </span>
      )
    }
    return <span>Select Identity</span>
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-neutral hover:text-foreground hover:bg-neutral-light rounded-md transition-colors duration-200 border border-neutral-light"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {getIdentityIcon()}
        <span className="hidden sm:inline">{getIdentityLabel()}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-surface border border-neutral-light z-50">
          <div className="p-3 border-b border-neutral-light">
            <input
              type="text"
              placeholder="Search identities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              autoFocus
            />
          </div>
          
          <div className="py-1 max-h-60 overflow-y-auto">
            {filteredIdentities.length === 0 ? (
              <div className="px-4 py-2 text-sm text-neutral">No identities found</div>
            ) : (
              <>
                {filteredIdentities.map((identity) => (
                  <button
                    key={identity.id}
                    onClick={() => handleIdentitySelect(identity)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 flex items-center justify-between ${
                      selectedIdentity?.id === identity.id
                        ? 'text-primary bg-primary/10'
                        : 'text-neutral hover:text-foreground hover:bg-neutral-light'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span>{identity.name}</span>
                      <span 
                        className="text-xs font-bold px-1.5 py-0.5 rounded text-white"
                        style={{ backgroundColor: identity.color }}
                      >
                        {identity.abbr}
                      </span>
                    </span>
                    {selectedIdentity?.id === identity.id && (
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
          
          {selectedIdentity && (
            <div className="border-t border-neutral-light p-2">
              <button
                onClick={handleClearSelection}
                className="w-full text-left px-3 py-2 text-sm text-neutral hover:text-foreground hover:bg-neutral-light rounded transition-colors duration-200"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
