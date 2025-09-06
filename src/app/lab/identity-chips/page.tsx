'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import BaseChip from '../../components/Chips/BaseChip'
import EconomicIdentityChip from '../../components/Chips/EconomicIdentityChip'
import EducationalIdentityChip from '../../components/Chips/EducationalIdentityChip'
import IndustrialIdentityChip from '../../components/Chips/IndustrialIdentityChip'
import MaritalIdentityChip from '../../components/Chips/MaritalIdentityChip'
import PoliticalIdentityChip from '../../components/Chips/PoliticalIdentityChip'
import RacialIdentityChip from '../../components/Chips/RacialIdentityChip'
import ReligiousIdentityChip from '../../components/Chips/ReligiousIdentityChip'
import SexualIdentityChip from '../../components/Chips/SexualIdentityChip'
import Picker, { IdentityType, IdentityData } from '../../components/Chips/Picker'

type ChipFormat = 'compact' | 'default' | 'comprehensive' | 'icon'

export default function IdentityChipsPage() {
  const [selectedFormat, setSelectedFormat] = useState<ChipFormat>('default')
  const [selectedEconomicChip, setSelectedEconomicChip] = useState<IdentityData | null>(null)
  const [selectedEducationalChip, setSelectedEducationalChip] = useState<IdentityData | null>(null)
  const [selectedIndustrialChip, setSelectedIndustrialChip] = useState<IdentityData | null>(null)
  const [selectedMaritalChip, setSelectedMaritalChip] = useState<IdentityData | null>(null)
  const [selectedPoliticalChip, setSelectedPoliticalChip] = useState<IdentityData | null>(null)
  const [selectedRacialChip, setSelectedRacialChip] = useState<IdentityData | null>(null)
  const [selectedReligiousChip, setSelectedReligiousChip] = useState<IdentityData | null>(null)
  const [selectedSexualChip, setSelectedSexualChip] = useState<IdentityData | null>(null)

  // Sample data for demonstration
  const sampleData = {
    base: {
      id: 'base-1',
      name: 'Sample Base Identity',
      description: 'This is a sample base identity chip for demonstration purposes',
      abbr: 'SBI',
      populationEstimate: {
        year: 2025,
        source: 'Census Bureau',
        estimate: 15000000
      },
      isActive: true
    },
    economic: {
      id: 'economic-1',
      name: 'Middle Class',
      description: 'Households with annual income between $50,000 and $150,000',
      abbr: 'MC',
      populationEstimate: {
        year: 2025,
        source: 'Census Bureau',
        estimate: 45000000
      },
      isActive: true,
      parentId: null,
      slug: 'middle-class',
      identityType: 'EconomicIdentity',
      incomeRange: {
        low: 50000,
        high: 150000
      }
    },
    educational: {
      id: 'educational-1',
      name: 'College Graduate',
      description: 'Individuals with a bachelor\'s degree or higher',
      abbr: 'CG',
      populationEstimate: {
        year: 2025,
        source: 'Census Bureau',
        estimate: 35000000
      },
      isActive: true,
      parentId: null,
      slug: 'college-graduate',
      identityType: 'EducationalIdentity'
    },
    industrial: {
      id: 'industrial-1',
      name: 'Technology Worker',
      description: 'Professionals working in the technology sector',
      abbr: 'TW',
      populationEstimate: {
        year: 2025,
        source: 'BLS',
        estimate: 8500000
      },
      isActive: true,
      parentId: null,
      slug: 'technology-worker',
      identityType: 'IndustrialIdentity'
    },
    marital: {
      id: 'marital-1',
      name: 'Married',
      description: 'Individuals who are currently married',
      abbr: 'M',
      populationEstimate: {
        year: 2025,
        source: 'Census Bureau',
        estimate: 125000000
      },
      isActive: true,
      parentId: null,
      slug: 'married',
      identityType: 'MaritalIdentity'
    },
    political: {
      id: 'political-1',
      name: 'Independent Voter',
      description: 'Registered voters who are not affiliated with a major political party',
      abbr: 'IV',
      populationEstimate: {
        year: 2025,
        source: 'Election Commission',
        estimate: 45000000
      },
      isActive: true,
      parentId: null,
      slug: 'independent-voter',
      identityType: 'PoliticalIdentity'
    },
    racial: {
      id: 'racial-1',
      name: 'Multiracial',
      description: 'Individuals who identify with multiple racial backgrounds',
      abbr: 'MR',
      populationEstimate: {
        year: 2025,
        source: 'Census Bureau',
        estimate: 9500000
      },
      isActive: true,
      parentId: null,
      slug: 'multiracial',
      identityType: 'RacialIdentity'
    },
    religious: {
      id: 'religious-1',
      name: 'Non-Religious',
      description: 'Individuals who do not identify with any organized religion',
      abbr: 'NR',
      populationEstimate: {
        year: 2025,
        source: 'Pew Research',
        estimate: 28000000
      },
      isActive: true,
      parentId: null,
      slug: 'non-religious',
      identityType: 'ReligiousIdentity'
    },
    sexual: {
      id: 'sexual-1',
      name: 'LGBTQ+',
      description: 'Individuals who identify as lesbian, gay, bisexual, transgender, queer, or other non-heteronormative identities',
      abbr: 'LGBTQ+',
      populationEstimate: {
        year: 2025,
        source: 'Gallup',
        estimate: 7500000
      },
      isActive: true,
      parentId: null,
      slug: 'lgbtq-plus',
      identityType: 'SexualIdentity'
    }
  }

  const formatDescriptions = {
    icon: 'Icon display showing only the abbreviation in a minimal format',
    compact: 'Minimal display with just essential information',
    default: 'Standard display with name and population estimate',
    comprehensive: 'Full display with abbreviation, name, population, and additional details'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Identity Chips Laboratory
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Explore the different types of identity chips used in the Whitepine application. 
            Each chip represents a specific identity category with unique styling and data display.
          </p>
          <div className="mt-6">
            <Link 
              href="/lab"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Lab
            </Link>
          </div>
        </div>

        {/* Format Selector */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Format Type</h2>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Display Format</h2>
            <p className="text-gray-600 text-sm">
              {formatDescriptions[selectedFormat]}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="format-select" className="text-sm font-medium text-gray-700">
              Format:
            </label>
            <select
              id="format-select"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as ChipFormat)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="icon">Icon</option>
              <option value="compact">Compact</option>
              <option value="default">Default</option>
              <option value="comprehensive">Comprehensive</option>
            </select>
          </div>
        </section>

        {/* Identity Picker Demo */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Identity Picker Component</h2>
          <p className="text-gray-600 mb-6">
            Interactive picker components for selecting identity chips across all identity types. Click on any picker to open the search panel and explore the hierarchical data structure.
          </p>
          
          <div className="flex flex-wrap gap-4">
            {/* Economic Identity Picker */}
            <div className="flex-shrink-0">
              <Picker
                identityType="EconomicIdentity"
                selectedChip={selectedEconomicChip}
                onChipSelect={setSelectedEconomicChip}
                placeholder="Economic Identity..."
                className="w-64"
              />
              {selectedEconomicChip && (
                <div className="mt-2 text-sm text-gray-600">
                  {selectedEconomicChip.name} ({selectedEconomicChip.abbr})
                </div>
              )}
            </div>

            {/* Educational Identity Picker */}
            <div className="flex-shrink-0">
              <Picker
                identityType="EducationalIdentity"
                selectedChip={selectedEducationalChip}
                onChipSelect={setSelectedEducationalChip}
                placeholder="Educational Identity..."
                className="w-64"
              />
              {selectedEducationalChip && (
                <div className="mt-2 text-sm text-gray-600">
                  {selectedEducationalChip.name} ({selectedEducationalChip.abbr})
                </div>
              )}
            </div>

            {/* Industrial Identity Picker */}
            <div className="flex-shrink-0">
              <Picker
                identityType="IndustrialIdentity"
                selectedChip={selectedIndustrialChip}
                onChipSelect={setSelectedIndustrialChip}
                placeholder="Industrial Identity..."
                className="w-64"
              />
              {selectedIndustrialChip && (
                <div className="mt-2 text-sm text-gray-600">
                  {selectedIndustrialChip.name} ({selectedIndustrialChip.abbr})
                </div>
              )}
            </div>

            {/* Marital Identity Picker */}
            <div className="flex-shrink-0">
              <Picker
                identityType="MaritalIdentity"
                selectedChip={selectedMaritalChip}
                onChipSelect={setSelectedMaritalChip}
                placeholder="Marital Identity..."
                className="w-64"
              />
              {selectedMaritalChip && (
                <div className="mt-2 text-sm text-gray-600">
                  {selectedMaritalChip.name} ({selectedMaritalChip.abbr})
                </div>
              )}
            </div>

            {/* Political Identity Picker */}
            <div className="flex-shrink-0">
              <Picker
                identityType="PoliticalIdentity"
                selectedChip={selectedPoliticalChip}
                onChipSelect={setSelectedPoliticalChip}
                placeholder="Political Identity..."
                className="w-64"
              />
              {selectedPoliticalChip && (
                <div className="mt-2 text-sm text-gray-600">
                  {selectedPoliticalChip.name} ({selectedPoliticalChip.abbr})
                </div>
              )}
            </div>

            {/* Racial Identity Picker */}
            <div className="flex-shrink-0">
              <Picker
                identityType="RacialIdentity"
                selectedChip={selectedRacialChip}
                onChipSelect={setSelectedRacialChip}
                placeholder="Racial Identity..."
                className="w-64"
              />
              {selectedRacialChip && (
                <div className="mt-2 text-sm text-gray-600">
                  {selectedRacialChip.name} ({selectedRacialChip.abbr})
                </div>
              )}
            </div>

            {/* Religious Identity Picker */}
            <div className="flex-shrink-0">
              <Picker
                identityType="ReligiousIdentity"
                selectedChip={selectedReligiousChip}
                onChipSelect={setSelectedReligiousChip}
                placeholder="Religious Identity..."
                className="w-64"
              />
              {selectedReligiousChip && (
                <div className="mt-2 text-sm text-gray-600">
                  {selectedReligiousChip.name} ({selectedReligiousChip.abbr})
                </div>
              )}
            </div>

            {/* Sexual Identity Picker */}
            <div className="flex-shrink-0">
              <Picker
                identityType="SexualIdentity"
                selectedChip={selectedSexualChip}
                onChipSelect={setSelectedSexualChip}
                placeholder="Sexual Identity..."
                className="w-64"
              />
              {selectedSexualChip && (
                <div className="mt-2 text-sm text-gray-600">
                  {selectedSexualChip.name} ({selectedSexualChip.abbr})
                </div>
              )}
            </div>
          </div>
        </section>

        {/* All Chips Together */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Identity Chips Together</h2>
          <p className="text-gray-600 mb-6">
            See how all the different identity chip types look together in the selected format.
          </p>
          <div className="flex flex-wrap gap-4">
            <BaseChip {...sampleData.base} format={selectedFormat}>
              {selectedFormat === 'compact' && (
                <span className="text-sm font-medium text-gray-900">{sampleData.base.abbr}</span>
              )}
            </BaseChip>
            <EconomicIdentityChip {...sampleData.economic} format={selectedFormat}>
              {selectedFormat === 'compact' && (
                <span className="text-sm font-medium text-gray-900">{sampleData.economic.abbr}</span>
              )}
            </EconomicIdentityChip>
            <EducationalIdentityChip {...sampleData.educational} format={selectedFormat}>
              {selectedFormat === 'compact' && (
                <span className="text-sm font-medium text-gray-900">{sampleData.educational.abbr}</span>
              )}
            </EducationalIdentityChip>
            <IndustrialIdentityChip {...sampleData.industrial} format={selectedFormat}>
              {selectedFormat === 'compact' && (
                <span className="text-sm font-medium text-gray-900">{sampleData.industrial.abbr}</span>
              )}
            </IndustrialIdentityChip>
            <MaritalIdentityChip {...sampleData.marital} format={selectedFormat}>
              {selectedFormat === 'compact' && (
                <span className="text-sm font-medium text-gray-900">{sampleData.marital.abbr}</span>
              )}
            </MaritalIdentityChip>
            <PoliticalIdentityChip {...sampleData.political} format={selectedFormat}>
              {selectedFormat === 'compact' && (
                <span className="text-sm font-medium text-gray-900">{sampleData.political.abbr}</span>
              )}
            </PoliticalIdentityChip>
            <RacialIdentityChip {...sampleData.racial} format={selectedFormat}>
              {selectedFormat === 'compact' && (
                <span className="text-sm font-medium text-gray-900">{sampleData.racial.abbr}</span>
              )}
            </RacialIdentityChip>
            <ReligiousIdentityChip {...sampleData.religious} format={selectedFormat}>
              {selectedFormat === 'compact' && (
                <span className="text-sm font-medium text-gray-900">{sampleData.religious.abbr}</span>
              )}
            </ReligiousIdentityChip>
            <SexualIdentityChip {...sampleData.sexual} format={selectedFormat}>
              {selectedFormat === 'compact' && (
                <span className="text-sm font-medium text-gray-900">{sampleData.sexual.abbr}</span>
              )}
            </SexualIdentityChip>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-600">
          <p>
            Use the format selector above to switch between different display modes. 
            Try the interactive picker components for all identity types to see how identity selection works.
            Each chip type has unique styling and can display specialized data relevant to its identity category.
            The pickers support hierarchical navigation, search functionality, and panel persistence when siblings are available.
          </p>
        </div>
      </div>
    </div>
  )
}
