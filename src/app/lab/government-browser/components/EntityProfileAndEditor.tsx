'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from '@/app/contexts/ThemeContext'
import JurisdictionForm from './forms/JurisdictionForm'
import axios from 'axios'

interface EntityProfileAndEditorProps {
  entity: any
}

interface MediaItem {
  _id: string
  filename: string
  original_name: string
  mime_type: string
  size: number
  path: string
  url: string
  mediaType: string
  title?: string
  description?: string
  alt_text?: string
  width?: number
  height?: number
  isPrimary: boolean
  is_public: boolean
  uploaded_by: string
  createdAt: string
  updatedAt: string
}

export default function EntityProfileAndEditor({ entity }: EntityProfileAndEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [parentOptions, setParentOptions] = useState<{ value: string; label: string }[]>([])
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isLoadingMedia, setIsLoadingMedia] = useState(false)
  const { resolvedTheme } = useTheme()

  // Theme-aware class names
  const themeClasses = {
    container: resolvedTheme === 'dark' 
      ? 'bg-surface-dark border-neutral-dark' 
      : 'bg-surface border-neutral-light',
    header: resolvedTheme === 'dark' 
      ? 'text-foreground' 
      : 'text-foreground',
    content: resolvedTheme === 'dark'
      ? 'bg-surface-dark text-foreground'
      : 'bg-surface text-foreground',
    card: resolvedTheme === 'dark'
      ? 'bg-surface-dark border-neutral'
      : 'bg-surface border-neutral-light',
    mediaCard: resolvedTheme === 'dark'
      ? 'bg-neutral-dark border-neutral'
      : 'bg-neutral-light border-neutral-light',
    button: {
      primary: resolvedTheme === 'dark'
        ? 'bg-primary hover:bg-primary-dark text-white focus:ring-primary-light'
        : 'bg-primary hover:bg-primary-dark text-white focus:ring-primary-light',
      secondary: resolvedTheme === 'dark'
        ? 'bg-neutral hover:bg-neutral-dark text-foreground focus:ring-neutral-light'
        : 'bg-neutral hover:bg-neutral-dark text-foreground focus:ring-neutral-light',
      danger: resolvedTheme === 'dark'
        ? 'bg-error hover:bg-error/80 text-white focus:ring-error/50'
        : 'bg-error hover:bg-error/80 text-white focus:ring-error/50'
    },
    badge: {
      seal: resolvedTheme === 'dark' ? 'bg-purple-900/20 text-purple-300 border-purple-500/30' : 'bg-purple-100 text-purple-800 border-purple-200',
      flag: resolvedTheme === 'dark' ? 'bg-red-900/20 text-red-300 border-red-500/30' : 'bg-red-100 text-red-800 border-red-200',
      headshot: resolvedTheme === 'dark' ? 'bg-blue-900/20 text-blue-300 border-blue-500/30' : 'bg-blue-100 text-blue-800 border-blue-200',
      logo: resolvedTheme === 'dark' ? 'bg-green-900/20 text-green-300 border-green-500/30' : 'bg-green-100 text-green-800 border-green-200',
      default: resolvedTheme === 'dark' ? 'bg-neutral-900/20 text-neutral-300 border-neutral-500/30' : 'bg-neutral-100 text-neutral-800 border-neutral-200'
    }
  }

  // Get entity type for API calls
  const getEntityType = () => {
    if (entity.level) return 'jurisdiction'
    if (entity.branch) return 'governing_body'
    if (entity.jurisdiction) return 'office'
    if (entity.office) return 'position'
    return 'entity'
  }

  // Get entity type display name
  const getEntityTypeDisplay = () => {
    if (entity.level) return 'Jurisdiction'
    if (entity.branch) return 'Governing Body'
    if (entity.jurisdiction) return 'Office'
    if (entity.office) return 'Position'
    return 'Entity'
  }

  // Fetch associated media
  const fetchMedia = async () => {
    setIsLoadingMedia(true)
    try {
      const entityType = getEntityType()
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/media/entity/${entityType}/${entity._id}`)
      setMediaItems(response.data.media || [])
    } catch (error) {
      console.error('Error fetching media:', error)
      setMediaItems([])
    } finally {
      setIsLoadingMedia(false)
    }
  }

  // Fetch parent options for jurisdiction form
  const fetchParentOptions = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/gov/jurisdictions`)
      const jurisdictions = response.data.jurisdictions || []
      const options = jurisdictions
        .filter((j: any) => j._id !== entity._id) // Exclude current entity
        .map((j: any) => ({
          value: j._id,
          label: j.name
        }))
      setParentOptions(options)
    } catch (error) {
      console.error('Error fetching parent options:', error)
      setParentOptions([])
    }
  }

  // Get preferred media for display (Seal > Flag > Headshot)
  const getPreferredMedia = () => {
    const preferredTypes = ['seal', 'flag', 'headshot']
    for (const type of preferredTypes) {
      const media = mediaItems.find(item => item.mediaType === type)
      if (media) return media
    }
    return mediaItems[0] || null
  }

  // Get badge class for media type
  const getMediaBadgeClass = (mediaType: string) => {
    switch (mediaType) {
      case 'seal':
        return themeClasses.badge.seal
      case 'flag':
        return themeClasses.badge.flag
      case 'headshot':
        return themeClasses.badge.headshot
      case 'logo':
        return themeClasses.badge.logo
      default:
        return themeClasses.badge.default
    }
  }

  // Delete media item
  const deleteMedia = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media item?')) return
    
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/media/${mediaId}`)
      fetchMedia() // Refresh media list
    } catch (error) {
      console.error('Error deleting media:', error)
      alert('Failed to delete media item')
    }
  }

  // Set primary media
  const setPrimaryMedia = async (mediaId: string) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/media/${mediaId}/set-primary`)
      fetchMedia() // Refresh media list
    } catch (error) {
      console.error('Error setting primary media:', error)
      alert('Failed to set primary media')
    }
  }

  // Fetch data when component mounts or entity changes
  useEffect(() => {
    fetchMedia()
  }, [entity._id])

  // Fetch parent options when editing starts
  useEffect(() => {
    if (isEditing && getEntityType() === 'jurisdiction') {
      fetchParentOptions()
    }
  }, [isEditing, entity._id])

  const renderMediaSection = () => {
    const preferredMedia = getPreferredMedia()
    
    return (
      <div className="mt-8">
        <h3 className={`text-lg font-semibold mb-4 ${themeClasses.header}`}>
          Media
        </h3>
        
        {isLoadingMedia ? (
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin h-6 w-6 text-primary mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading media...
          </div>
        ) : isEditing ? (
          // Edit mode: Show all media with management options
          <div className="space-y-4">
            {mediaItems.length === 0 ? (
              <div className={`text-center py-8 ${themeClasses.mediaCard} rounded-lg border`}>
                <p className={`${themeClasses.header} opacity-75`}>No media associated with this entity.</p>
                <button
                  onClick={() => {
                    // TODO: Implement media upload modal
                    alert('Media upload functionality coming soon')
                  }}
                  className={`mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${themeClasses.button.primary}`}
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Upload Media
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaItems.map((media) => (
                  <div key={media._id} className={`${themeClasses.mediaCard} rounded-lg border p-4`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getMediaBadgeClass(media.mediaType)}`}>
                        {media.mediaType}
                      </span>
                      {media.isPrimary && (
                        <span className="text-xs text-primary font-medium">Primary</span>
                      )}
                    </div>
                    
                    {media.mime_type.startsWith('image/') ? (
                      <img
                        src={media.url}
                        alt={media.alt_text || media.title || media.original_name}
                        className="w-full h-32 object-cover rounded mb-3"
                      />
                    ) : (
                      <div className="w-full h-32 bg-neutral flex items-center justify-center rounded mb-3">
                        <svg className="h-8 w-8 text-neutral" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <h4 className={`text-sm font-medium ${themeClasses.header}`}>
                        {media.title || media.original_name}
                      </h4>
                      {media.description && (
                        <p className={`text-xs ${themeClasses.header} opacity-75`}>
                          {media.description}
                        </p>
                      )}
                      <p className={`text-xs ${themeClasses.header} opacity-75`}>
                        {(media.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral">
                      <button
                        onClick={() => setPrimaryMedia(media._id)}
                        disabled={media.isPrimary}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          media.isPrimary
                            ? 'text-neutral cursor-not-allowed'
                            : 'text-primary hover:bg-primary/10'
                        }`}
                      >
                        {media.isPrimary ? 'Primary' : 'Set Primary'}
                      </button>
                      <button
                        onClick={() => deleteMedia(media._id)}
                        className="text-xs px-2 py-1 text-error hover:bg-error/10 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-center">
              <button
                onClick={() => {
                  // TODO: Implement media upload modal
                  alert('Media upload functionality coming soon')
                }}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${themeClasses.button.primary}`}
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Upload New Media
              </button>
            </div>
          </div>
        ) : (
          // View mode: Show only preferred media
          <div>
            {preferredMedia ? (
              <div className={`${themeClasses.mediaCard} rounded-lg border p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getMediaBadgeClass(preferredMedia.mediaType)}`}>
                    {preferredMedia.mediaType}
                  </span>
                  {preferredMedia.isPrimary && (
                    <span className="text-xs text-primary font-medium">Primary</span>
                  )}
                </div>
                
                {preferredMedia.mime_type.startsWith('image/') ? (
                  <img
                    src={preferredMedia.url}
                    alt={preferredMedia.alt_text || preferredMedia.title || preferredMedia.original_name}
                    className="w-full h-48 object-cover rounded mb-3"
                  />
                ) : (
                  <div className="w-full h-48 bg-neutral flex items-center justify-center rounded mb-3">
                    <svg className="h-12 w-12 text-neutral" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                <div className="space-y-2">
                  <h4 className={`text-sm font-medium ${themeClasses.header}`}>
                    {preferredMedia.title || preferredMedia.original_name}
                  </h4>
                  {preferredMedia.description && (
                    <p className={`text-sm ${themeClasses.header} opacity-75`}>
                      {preferredMedia.description}
                    </p>
                  )}
                  <p className={`text-xs ${themeClasses.header} opacity-75`}>
                    {(preferredMedia.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                
                {mediaItems.length > 1 && (
                  <div className="mt-3 pt-3 border-t border-neutral">
                    <p className={`text-xs ${themeClasses.header} opacity-75`}>
                      {mediaItems.length - 1} more media item{mediaItems.length > 2 ? 's' : ''} available
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className={`text-center py-8 ${themeClasses.mediaCard} rounded-lg border`}>
                <svg className="h-12 w-12 text-neutral mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <p className={`${themeClasses.header} opacity-75`}>No media associated with this entity.</p>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderEntityDetails = () => {
    const entityType = getEntityTypeDisplay()
    
    return (
      <div className={`space-y-6 ${themeClasses.content}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-bold ${themeClasses.header}`}>
              {entity.name || entity.title || 'Unnamed Entity'}
            </h2>
            <p className={`text-sm ${themeClasses.header} opacity-75`}>
              {entityType} • ID: {entity._id}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${themeClasses.button.secondary}`}
            aria-label={isEditing ? 'Cancel editing' : 'Edit entity'}
          >
            {isEditing ? (
              <>
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </>
            )}
          </button>
        </div>

        {isEditing ? (
          <div className={`rounded-lg border p-6 ${themeClasses.card}`}>
            {entityType === 'Jurisdiction' && (
              <JurisdictionForm
                jurisdiction={entity}
                parentOptions={parentOptions}
                onSave={(data) => {
                  console.log('Saving jurisdiction:', data)
                  setIsEditing(false)
                  // TODO: Implement save functionality
                }}
                onCancel={() => setIsEditing(false)}
              />
            )}
            {/* TODO: Add forms for other entity types */}
            {entityType !== 'Jurisdiction' && (
              <div className="text-center py-8">
                <p className={`${themeClasses.header} opacity-75`}>
                  Edit form for {entityType} entities is not yet implemented.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className={`rounded-lg border p-6 ${themeClasses.card}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${themeClasses.header}`}>
                  Basic Information
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className={`text-sm font-medium ${themeClasses.header} opacity-75`}>Name</dt>
                    <dd className={`mt-1 ${themeClasses.header}`}>
                      {entity.name || entity.title || 'N/A'}
                    </dd>
                  </div>
                  {entity.slug && (
                    <div>
                      <dt className={`text-sm font-medium ${themeClasses.header} opacity-75`}>Slug</dt>
                      <dd className={`mt-1 ${themeClasses.header}`}>{entity.slug}</dd>
                    </div>
                  )}
                  {entity.description && (
                    <div>
                      <dt className={`text-sm font-medium ${themeClasses.header} opacity-75`}>Description</dt>
                      <dd className={`mt-1 ${themeClasses.header}`}>{entity.description}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Entity-Specific Information */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${themeClasses.header}`}>
                  {entityType} Details
                </h3>
                <dl className="space-y-3">
                  {entity.level && (
                    <div>
                      <dt className={`text-sm font-medium ${themeClasses.header} opacity-75`}>Level</dt>
                      <dd className={`mt-1 ${themeClasses.header}`}>{entity.level}</dd>
                    </div>
                  )}
                  {entity.branch && (
                    <div>
                      <dt className={`text-sm font-medium ${themeClasses.header} opacity-75`}>Branch</dt>
                      <dd className={`mt-1 ${themeClasses.header}`}>{entity.branch}</dd>
                    </div>
                  )}
                  {entity.type && (
                    <div>
                      <dt className={`text-sm font-medium ${themeClasses.header} opacity-75`}>Type</dt>
                      <dd className={`mt-1 ${themeClasses.header}`}>{entity.type}</dd>
                    </div>
                  )}
                  {entity.status && (
                    <div>
                      <dt className={`text-sm font-medium ${themeClasses.header} opacity-75`}>Status</dt>
                      <dd className={`mt-1 ${themeClasses.header}`}>{entity.status}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Relationships */}
            {(entity.parent || entity.children || entity.jurisdiction || entity.governing_body || entity.office) && (
              <div className="mt-8">
                <h3 className={`text-lg font-semibold mb-4 ${themeClasses.header}`}>
                  Relationships
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {entity.parent && (
                    <div>
                      <dt className={`text-sm font-medium ${themeClasses.header} opacity-75`}>Parent</dt>
                      <dd className={`mt-1 ${themeClasses.header}`}>{entity.parent.name || entity.parent}</dd>
                    </div>
                  )}
                  {entity.jurisdiction && (
                    <div>
                      <dt className={`text-sm font-medium ${themeClasses.header} opacity-75`}>Jurisdiction</dt>
                      <dd className={`mt-1 ${themeClasses.header}`}>{entity.jurisdiction.name || entity.jurisdiction}</dd>
                    </div>
                  )}
                  {entity.governing_body && (
                    <div>
                      <dt className={`text-sm font-medium ${themeClasses.header} opacity-75`}>Governing Body</dt>
                      <dd className={`mt-1 ${themeClasses.header}`}>{entity.governing_body.name || entity.governing_body}</dd>
                    </div>
                  )}
                  {entity.office && (
                    <div>
                      <dt className={`text-sm font-medium ${themeClasses.header} opacity-75`}>Office</dt>
                      <dd className={`mt-1 ${themeClasses.header}`}>{entity.office.name || entity.office}</dd>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Media Section */}
            {renderMediaSection()}

            {/* Metadata */}
            {entity.metadata && Object.keys(entity.metadata).length > 0 && (
              <div className="mt-8">
                <h3 className={`text-lg font-semibold mb-4 ${themeClasses.header}`}>
                  Additional Information
                </h3>
                <dl className="space-y-3">
                  {Object.entries(entity.metadata).map(([key, value]) => (
                    <div key={key}>
                      <dt className={`text-sm font-medium ${themeClasses.header} opacity-75 capitalize`}>
                        {key.replace(/_/g, ' ')}
                      </dt>
                      <dd className={`mt-1 ${themeClasses.header}`}>
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Timestamps */}
            <div className="mt-8 pt-6 border-t border-neutral-light">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={`${themeClasses.header} opacity-75`}>Created: </span>
                  <span className={themeClasses.header}>
                    {entity.createdAt ? new Date(entity.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className={`${themeClasses.header} opacity-75`}>Updated: </span>
                  <span className={themeClasses.header}>
                    {entity.updatedAt ? new Date(entity.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return renderEntityDetails()
}
