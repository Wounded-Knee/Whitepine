'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from '@/app/contexts/ThemeContext'
import axios from 'axios'

interface District {
  _id: string
  name: string
  district_type: string
  district_number?: number
  jurisdiction: string
  description?: string
  population?: number
  area_sq_miles?: number
  boundaries?: string
  identifiers?: Record<string, string>
  metadata?: Record<string, any>
}

interface DistrictFormProps {
  district?: District | null
  onSave: (data: any) => void
  onCancel: () => void
  currentJurisdictionFilter?: string
}

interface JurisdictionOption {
  _id: string
  name: string
  slug: string
}

export default function DistrictForm({ district, onSave, onCancel, currentJurisdictionFilter }: DistrictFormProps) {
  const [formData, setFormData] = useState<Partial<District>>({
    name: '',
    district_type: 'congressional',
    district_number: undefined,
    jurisdiction: '',
    description: '',
    population: undefined,
    area_sq_miles: undefined,
    boundaries: '',
    identifiers: {},
    metadata: {}
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [jurisdictionOptions, setJurisdictionOptions] = useState<JurisdictionOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { resolvedTheme } = useTheme()

  // Theme-aware class names
  const themeClasses = {
    input: resolvedTheme === 'dark'
      ? 'bg-surface-dark border-neutral text-foreground placeholder-neutral-light focus:border-primary focus:ring-primary'
      : 'bg-surface border-neutral text-foreground placeholder-neutral-dark focus:border-primary focus:ring-primary',
    select: resolvedTheme === 'dark'
      ? 'bg-surface-dark border-neutral text-foreground focus:border-primary focus:ring-primary'
      : 'bg-surface border-neutral text-foreground focus:border-primary focus:ring-primary',
    textarea: resolvedTheme === 'dark'
      ? 'bg-surface-dark border-neutral text-foreground placeholder-neutral-light focus:border-primary focus:ring-primary'
      : 'bg-surface border-neutral text-foreground placeholder-neutral-dark focus:border-primary focus:ring-primary',
    button: {
      primary: resolvedTheme === 'dark'
        ? 'bg-primary hover:bg-primary-dark text-white focus:ring-primary-light'
        : 'bg-primary hover:bg-primary-dark text-white focus:ring-primary-light',
      secondary: resolvedTheme === 'dark'
        ? 'bg-neutral hover:bg-neutral-dark text-foreground focus:ring-neutral-light'
        : 'bg-neutral hover:bg-neutral-dark text-foreground focus:ring-neutral-light'
    },
    label: resolvedTheme === 'dark' ? 'text-neutral-light' : 'text-neutral-dark',
    error: 'text-red-600 dark:text-red-400'
  }

  // Initialize form data when editing
  useEffect(() => {
    if (district) {
      setFormData({
        name: district.name || '',
        district_type: district.district_type || 'congressional',
        district_number: district.district_number,
        jurisdiction: district.jurisdiction || '',
        description: district.description || '',
        population: district.population,
        area_sq_miles: district.area_sq_miles,
        boundaries: district.boundaries || '',
        identifiers: district.identifiers || {},
        metadata: district.metadata || {}
      })
    } else if (currentJurisdictionFilter) {
      // Set default jurisdiction for new districts
      setFormData(prev => ({ ...prev, jurisdiction: currentJurisdictionFilter }))
    }
  }, [district, currentJurisdictionFilter])

  // Fetch jurisdiction options
  useEffect(() => {
    const fetchJurisdictions = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/gov/jurisdictions?page_size=1000`)
        setJurisdictionOptions(response.data.jurisdictions || [])
      } catch (error) {
        console.error('Error fetching jurisdictions:', error)
      }
    }
    fetchJurisdictions()
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'District name is required'
    }

    if (!formData.district_type) {
      newErrors.district_type = 'District type is required'
    }

    if (!formData.jurisdiction) {
      newErrors.jurisdiction = 'Jurisdiction is required'
    }

    if (formData.population !== undefined && formData.population < 0) {
      newErrors.population = 'Population must be a positive number'
    }

    if (formData.area_sq_miles !== undefined && formData.area_sq_miles < 0) {
      newErrors.area_sq_miles = 'Area must be a positive number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const dataToSave = {
        ...formData,
        // Convert empty strings to undefined for optional fields
        district_number: formData.district_number || undefined,
        population: formData.population || undefined,
        area_sq_miles: formData.area_sq_miles || undefined,
        description: formData.description || undefined,
        boundaries: formData.boundaries || undefined
      }

      onSave(dataToSave)
    } catch (error) {
      console.error('Error saving district:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const districtTypes = [
    { value: 'congressional', label: 'Congressional District' },
    { value: 'state_senate', label: 'State Senate District' },
    { value: 'state_house', label: 'State House District' },
    { value: 'county', label: 'County District' },
    { value: 'municipal', label: 'Municipal District' },
    { value: 'school', label: 'School District' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* District Name */}
        <div>
          <label htmlFor="name" className={`block text-sm font-medium ${themeClasses.label}`}>
            District Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${themeClasses.input}`}
            required
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className={`mt-1 text-sm ${themeClasses.error}`}>
              {errors.name}
            </p>
          )}
        </div>

        {/* District Type */}
        <div>
          <label htmlFor="district_type" className={`block text-sm font-medium ${themeClasses.label}`}>
            District Type *
          </label>
          <select
            id="district_type"
            name="district_type"
            value={formData.district_type}
            onChange={(e) => handleInputChange('district_type', e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${themeClasses.select}`}
            required
            aria-describedby={errors.district_type ? 'district_type-error' : undefined}
          >
            {districtTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.district_type && (
            <p id="district_type-error" className={`mt-1 text-sm ${themeClasses.error}`}>
              {errors.district_type}
            </p>
          )}
        </div>

        {/* District Number */}
        <div>
          <label htmlFor="district_number" className={`block text-sm font-medium ${themeClasses.label}`}>
            District Number
          </label>
          <input
            type="number"
            id="district_number"
            name="district_number"
            value={formData.district_number || ''}
            onChange={(e) => handleInputChange('district_number', e.target.value ? parseInt(e.target.value) : undefined)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${themeClasses.input}`}
            min="1"
            aria-describedby={errors.district_number ? 'district_number-error' : undefined}
          />
          {errors.district_number && (
            <p id="district_number-error" className={`mt-1 text-sm ${themeClasses.error}`}>
              {errors.district_number}
            </p>
          )}
        </div>

        {/* Jurisdiction */}
        <div>
          <label htmlFor="jurisdiction" className={`block text-sm font-medium ${themeClasses.label}`}>
            Jurisdiction *
          </label>
          <select
            id="jurisdiction"
            name="jurisdiction"
            value={formData.jurisdiction}
            onChange={(e) => handleInputChange('jurisdiction', e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${themeClasses.select}`}
            required
            aria-describedby={errors.jurisdiction ? 'jurisdiction-error' : undefined}
          >
            <option value="">Select a jurisdiction</option>
            {jurisdictionOptions.map(jurisdiction => (
              <option key={jurisdiction._id} value={jurisdiction._id}>
                {jurisdiction.name}
              </option>
            ))}
          </select>
          {errors.jurisdiction && (
            <p id="jurisdiction-error" className={`mt-1 text-sm ${themeClasses.error}`}>
              {errors.jurisdiction}
            </p>
          )}
        </div>

        {/* Population */}
        <div>
          <label htmlFor="population" className={`block text-sm font-medium ${themeClasses.label}`}>
            Population
          </label>
          <input
            type="number"
            id="population"
            name="population"
            value={formData.population || ''}
            onChange={(e) => handleInputChange('population', e.target.value ? parseInt(e.target.value) : undefined)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${themeClasses.input}`}
            min="0"
            aria-describedby={errors.population ? 'population-error' : undefined}
          />
          {errors.population && (
            <p id="population-error" className={`mt-1 text-sm ${themeClasses.error}`}>
              {errors.population}
            </p>
          )}
        </div>

        {/* Area */}
        <div>
          <label htmlFor="area_sq_miles" className={`block text-sm font-medium ${themeClasses.label}`}>
            Area (sq miles)
          </label>
          <input
            type="number"
            id="area_sq_miles"
            name="area_sq_miles"
            value={formData.area_sq_miles || ''}
            onChange={(e) => handleInputChange('area_sq_miles', e.target.value ? parseFloat(e.target.value) : undefined)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${themeClasses.input}`}
            min="0"
            step="0.01"
            aria-describedby={errors.area_sq_miles ? 'area_sq_miles-error' : undefined}
          />
          {errors.area_sq_miles && (
            <p id="area_sq_miles-error" className={`mt-1 text-sm ${themeClasses.error}`}>
              {errors.area_sq_miles}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={`block text-sm font-medium ${themeClasses.label}`}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${themeClasses.textarea}`}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && (
          <p id="description-error" className={`mt-1 text-sm ${themeClasses.error}`}>
            {errors.description}
          </p>
        )}
      </div>

      {/* Boundaries */}
      <div>
        <label htmlFor="boundaries" className={`block text-sm font-medium ${themeClasses.label}`}>
          Boundaries (GeoJSON or description)
        </label>
        <textarea
          id="boundaries"
          name="boundaries"
          value={formData.boundaries}
          onChange={(e) => handleInputChange('boundaries', e.target.value)}
          rows={4}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${themeClasses.textarea}`}
          placeholder="Enter boundary description or GeoJSON data"
          aria-describedby={errors.boundaries ? 'boundaries-error' : undefined}
        />
        {errors.boundaries && (
          <p id="boundaries-error" className={`mt-1 text-sm ${themeClasses.error}`}>
            {errors.boundaries}
          </p>
        )}
      </div>

      {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-neutral-light">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${themeClasses.button.secondary}`}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${themeClasses.button.primary} ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Saving...' : (district ? 'Update District' : 'Create District')}
        </button>
      </div>
    </form>
  )
}
