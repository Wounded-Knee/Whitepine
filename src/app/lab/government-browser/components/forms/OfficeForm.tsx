'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from '@/app/contexts/ThemeContext'
import axios from 'axios'
import { Office } from '../../../../types'

interface OfficeFormProps {
  office?: Office | null
  onSave: (data: any) => void
  onCancel: () => void
  currentJurisdictionFilter?: string
}

interface JurisdictionOption {
  _id: string
  name: string
  slug: string
}

interface GoverningBodyOption {
  _id: string
  name: string
  slug: string
}

interface DistrictOption {
  _id: string
  name: string
  district_type: string
  district_number?: number
}

export default function OfficeForm({ office, onSave, onCancel, currentJurisdictionFilter }: OfficeFormProps) {
  const [formData, setFormData] = useState<Partial<Office>>({
    name: '',
    slug: '',
    office_type: 'elected',
    governing_body: '',
    jurisdiction: '',
    constituency: 'at-large',
    district: '',
    selection_method: 'election',
    term_length: undefined,
    term_limit: undefined,
    salary: undefined,
    is_part_time: false,
    identifiers: {},
    metadata: {}
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [jurisdictionOptions, setJurisdictionOptions] = useState<JurisdictionOption[]>([])
  const [governingBodyOptions, setGoverningBodyOptions] = useState<GoverningBodyOption[]>([])
  const [districtOptions, setDistrictOptions] = useState<DistrictOption[]>([])
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
    checkbox: resolvedTheme === 'dark'
      ? 'bg-surface-dark border-neutral text-primary focus:ring-primary'
      : 'bg-surface border-neutral text-primary focus:ring-primary',
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
    if (office) {
      setFormData({
        name: office.name || '',
        slug: office.slug || '',
        office_type: office.office_type || 'executive',
        governing_body: office.governing_body || '',
        jurisdiction: office.jurisdiction || '',
        constituency: office.constituency || 'at_large',
        district: office.district || '',
        selection_method: office.selection_method || 'election',
        term_length: office.term_length,
        term_limit: office.term_limit,
        salary: office.salary,
        is_part_time: office.is_part_time || false,
        identifiers: office.identifiers || {},
        metadata: office.metadata || {}
      })
    } else if (currentJurisdictionFilter) {
      // Set default jurisdiction for new offices
      setFormData(prev => ({ ...prev, jurisdiction: currentJurisdictionFilter }))
    }
  }, [office, currentJurisdictionFilter])

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

  // Fetch governing body options
  useEffect(() => {
    const fetchGoverningBodies = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/gov/governing-bodies?page_size=1000`)
        setGoverningBodyOptions(response.data.governingBodies || [])
      } catch (error) {
        console.error('Error fetching governing bodies:', error)
      }
    }
    fetchGoverningBodies()
  }, [])

  // Fetch district options when jurisdiction changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (formData.jurisdiction) {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/gov/districts?jurisdiction=${formData.jurisdiction}&page_size=1000`)
          setDistrictOptions(response.data.districts || [])
        } catch (error) {
          console.error('Error fetching districts:', error)
        }
      } else {
        setDistrictOptions([])
      }
    }
    fetchDistricts()
  }, [formData.jurisdiction])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate slug when name changes
    if (field === 'name' && !office) {
      const slug = generateSlug(value)
      setFormData(prev => ({ ...prev, slug }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Office name is required'
    }

    if (!formData.slug?.trim()) {
      newErrors.slug = 'Slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens'
    }

    if (!formData.office_type) {
      newErrors.office_type = 'Office type is required'
    }

    if (!formData.selection_method) {
      newErrors.selection_method = 'Selection method is required'
    }

    // Validate that either governing_body OR jurisdiction is specified, but not both
    if (!formData.governing_body && !formData.jurisdiction) {
      newErrors.governing_body = 'Office must belong to either a governing body or jurisdiction'
      newErrors.jurisdiction = 'Office must belong to either a governing body or jurisdiction'
    }

    if (formData.governing_body && formData.jurisdiction) {
      newErrors.governing_body = 'Office cannot belong to both governing body and jurisdiction'
      newErrors.jurisdiction = 'Office cannot belong to both governing body and jurisdiction'
    }

    if (formData.term_length !== undefined && formData.term_length < 0) {
      newErrors.term_length = 'Term length must be a positive number'
    }

    if (formData.term_limit !== undefined && formData.term_limit < 0) {
      newErrors.term_limit = 'Term limit must be a positive number'
    }

    if (formData.salary !== undefined && formData.salary < 0) {
      newErrors.salary = 'Salary must be a positive number'
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
        governing_body: formData.governing_body || undefined,
        jurisdiction: formData.jurisdiction || undefined,
        district: formData.district || undefined,
        term_length: formData.term_length || undefined,
        term_limit: formData.term_limit || undefined,
        salary: formData.salary || undefined
      }

      onSave(dataToSave)
    } catch (error) {
      console.error('Error saving office:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const officeTypes = [
    { value: 'executive', label: 'Executive' },
    { value: 'legislative', label: 'Legislative' },
    { value: 'judicial', label: 'Judicial' },
    { value: 'administrative', label: 'Administrative' },
    { value: 'advisory', label: 'Advisory' }
  ]

  const selectionMethods = [
    { value: 'election', label: 'Election' },
    { value: 'appointment', label: 'Appointment' },
    { value: 'inheritance', label: 'Inheritance' },
    { value: 'merit', label: 'Merit' },
    { value: 'lottery', label: 'Lottery' }
  ]

  const constituencies = [
    { value: 'at_large', label: 'At Large' },
    { value: 'district_based', label: 'District Based' },
    { value: 'proportional', label: 'Proportional' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Office Name */}
        <div>
          <label htmlFor="name" className={`block text-sm font-medium ${themeClasses.label}`}>
            Office Name *
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

        {/* Slug */}
        <div>
          <label htmlFor="slug" className={`block text-sm font-medium ${themeClasses.label}`}>
            Slug *
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={(e) => handleInputChange('slug', e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${themeClasses.input}`}
            required
            pattern="[a-z0-9-]+"
            aria-describedby={errors.slug ? 'slug-error' : undefined}
          />
          {errors.slug && (
            <p id="slug-error" className={`mt-1 text-sm ${themeClasses.error}`}>
              {errors.slug}
            </p>
          )}
        </div>

        {/* Office Type */}
        <div>
          <label htmlFor="office_type" className={`block text-sm font-medium ${themeClasses.label}`}>
            Office Type *
          </label>
          <select
            id="office_type"
            name="office_type"
            value={formData.office_type}
            onChange={(e) => handleInputChange('office_type', e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${themeClasses.select}`}
            required
            aria-describedby={errors.office_type ? 'office_type-error' : undefined}
          >
            {officeTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.office_type && (
            <p id="office_type-error" className={`mt-1 text-sm ${themeClasses.error}`}>
              {errors.office_type}
            </p>
          )}
        </div>

        {/* Selection Method */}
        <div>
          <label htmlFor="selection_method" className={`block text-sm font-medium ${themeClasses.label}`}>
            Selection Method *
          </label>
          <select
            id="selection_method"
            name="selection_method"
            value={formData.selection_method}
            onChange={(e) => handleInputChange('selection_method', e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${themeClasses.select}`}
            required
            aria-describedby={errors.selection_method ? 'selection_method-error' : undefined}
          >
            {selectionMethods.map(method => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
          {errors.selection_method && (
            <p id="selection_method-error" className={`mt-1 text-sm ${themeClasses.error}`}>
              {errors.selection_method}
            </p>
          )}
        </div>

        {/* Governing Body */}
        <div>
          <label htmlFor="governing_body" className={`block text-sm font-medium ${themeClasses.label}`}>
            Governing Body
          </label>
          <select
            id="governing_body"
            name="governing_body"
            value={formData.governing_body}
            onChange={(e) => handleInputChange('governing_body', e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${themeClasses.select}`}
            aria-describedby={errors.governing_body ? 'governing_body-error' : undefined}
          >
            <option value="">Select a governing body (optional)</option>
            {governingBodyOptions.map(body => (
              <option key={body._id} value={body._id}>
                {body.name}
              </option>
            ))}
          </select>
          {errors.governing_body && (
            <p id="governing_body-error" className={`mt-1 text-sm ${themeClasses.error}`}>
              {errors.governing_body}
            </p>
          )}
        </div>

        {/* Jurisdiction */}
        <div>
          <label htmlFor="jurisdiction" className={`block text-sm font-medium ${themeClasses.label}`}>
            Jurisdiction
          </label>
          <select
            id="jurisdiction"
            name="jurisdiction"
            value={formData.jurisdiction}
            onChange={(e) => handleInputChange('jurisdiction', e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${themeClasses.select}`}
            aria-describedby={errors.jurisdiction ? 'jurisdiction-error' : undefined}
          >
            <option value="">Select a jurisdiction (optional)</option>
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

        {/* Constituency */}
        <div>
          <label htmlFor="constituency" className={`block text-sm font-medium ${themeClasses.label}`}>
            Constituency
          </label>
          <select
            id="constituency"
            name="constituency"
            value={formData.constituency}
            onChange={(e) => handleInputChange('constituency', e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${themeClasses.select}`}
          >
            {constituencies.map(constituency => (
              <option key={constituency.value} value={constituency.value}>
                {constituency.label}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label htmlFor="district" className={`block text-sm font-medium ${themeClasses.label}`}>
            District
          </label>
          <select
            id="district"
            name="district"
            value={formData.district}
            onChange={(e) => handleInputChange('district', e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${themeClasses.select}`}
            disabled={!formData.jurisdiction}
          >
            <option value="">Select a district (optional)</option>
            {districtOptions.map(district => (
              <option key={district._id} value={district._id}>
                {district.name} ({district.district_type.replace('_', ' ')} {district.district_number || 'N/A'})
              </option>
            ))}
          </select>
        </div>

        {/* Term Length */}
        <div>
          <label htmlFor="term_length" className={`block text-sm font-medium ${themeClasses.label}`}>
            Term Length (months)
          </label>
          <input
            type="number"
            id="term_length"
            name="term_length"
            value={formData.term_length || ''}
            onChange={(e) => handleInputChange('term_length', e.target.value ? parseInt(e.target.value) : undefined)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${themeClasses.input}`}
            min="0"
            aria-describedby={errors.term_length ? 'term_length-error' : undefined}
          />
          {errors.term_length && (
            <p id="term_length-error" className={`mt-1 text-sm ${themeClasses.error}`}>
              {errors.term_length}
            </p>
          )}
        </div>

        {/* Term Limit */}
        <div>
          <label htmlFor="term_limit" className={`block text-sm font-medium ${themeClasses.label}`}>
            Term Limit
          </label>
          <input
            type="number"
            id="term_limit"
            name="term_limit"
            value={formData.term_limit || ''}
            onChange={(e) => handleInputChange('term_limit', e.target.value ? parseInt(e.target.value) : undefined)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${themeClasses.input}`}
            min="0"
            aria-describedby={errors.term_limit ? 'term_limit-error' : undefined}
          />
          {errors.term_limit && (
            <p id="term_limit-error" className={`mt-1 text-sm ${themeClasses.error}`}>
              {errors.term_limit}
            </p>
          )}
        </div>

        {/* Salary */}
        <div>
          <label htmlFor="salary" className={`block text-sm font-medium ${themeClasses.label}`}>
            Salary ($)
          </label>
          <input
            type="number"
            id="salary"
            name="salary"
            value={formData.salary || ''}
            onChange={(e) => handleInputChange('salary', e.target.value ? parseInt(e.target.value) : undefined)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${themeClasses.input}`}
            min="0"
            aria-describedby={errors.salary ? 'salary-error' : undefined}
          />
          {errors.salary && (
            <p id="salary-error" className={`mt-1 text-sm ${themeClasses.error}`}>
              {errors.salary}
            </p>
          )}
        </div>

        {/* Part Time */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_part_time"
            name="is_part_time"
            checked={formData.is_part_time}
            onChange={(e) => handleInputChange('is_part_time', e.target.checked)}
                            className={`h-4 w-4 rounded border-neutral focus:ring-2 focus:ring-offset-2 transition-colors ${themeClasses.checkbox}`}
          />
          <label htmlFor="is_part_time" className={`ml-2 block text-sm ${themeClasses.label}`}>
            Part-time position
          </label>
        </div>
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
          {isLoading ? 'Saving...' : (office ? 'Update Office' : 'Create Office')}
        </button>
      </div>
    </form>
  )
}
