'use client'

import React from 'react'
import { usePoliticalIdentity } from '../contexts/PoliticalIdentityContext'

export default function PoliticalIdentityDisplay() {
  const { selectedIdentity } = usePoliticalIdentity()

  if (!selectedIdentity) {
    return (
      <div className="p-4 bg-neutral-light rounded-lg border border-neutral-light">
        <p className="text-neutral text-sm">No political identity selected</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-neutral-light rounded-lg border border-neutral-light">
      <h3 className="text-sm font-medium text-neutral mb-2">Current Political Identity</h3>
      <div className="flex items-center space-x-3">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ backgroundColor: selectedIdentity.color }}
        >
          {selectedIdentity.abbr}
        </div>
        <div>
          <p className="font-medium text-foreground">{selectedIdentity.name}</p>
          {selectedIdentity.description && (
            <p className="text-xs text-neutral">{selectedIdentity.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
