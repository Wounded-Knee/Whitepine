'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import Link from 'next/link'
import { User } from '../../types'

interface Position {
  _id: string
  office: {
    name: string
    slug: string
    office_type: string
    governing_body?: {
      name: string
      slug: string
    }
    jurisdiction?: {
      name: string
      slug: string
    }
  }
  term_start: string
  term_end: string
  party: string
  status: string
  is_current: boolean
}

interface Initiative {
  _id: string
  title: string
  description: string
  createdAt: string
  status: string
}

const ProfilePage: React.FC = () => {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser, token } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    if (params.username) {
      // Check if this is the current user's profile
      if (params.username === 'me') {
        if (!token) {
          router.push('/login')
          return
        }
        setIsOwnProfile(true)
        // Use current user data
        if (currentUser) {
          setUser({
            _id: currentUser._id,
            username: currentUser.username,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            email: currentUser.email,
            profile: {
              bio: currentUser.profile?.bio,
              location: currentUser.profile?.location
            },
            roles: currentUser.roles || [],
            isActive: true,
            authProviders: currentUser.authProviders || [],
            createdAt: currentUser.createdAt || new Date(),
            updatedAt: currentUser.updatedAt || new Date()
          })
          setLoading(false)
        } else {
          // If currentUser is not loaded yet, keep loading
          setLoading(true)
        }
      } else {
        // Fetch other user's profile
        fetchUserProfile()
      }
    }
  }, [params.username, token, currentUser, router])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch user information
      const userResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/users?username=${params.username}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      
      if (userResponse.data.data && userResponse.data.data.length > 0) {
        const userData = userResponse.data.data[0]
        setUser(userData)
        
        // Fetch user's positions (only if the endpoint exists)
        try {
          const positionsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/gov/positions/person/${userData._id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          })
          setPositions(positionsResponse.data.data || [])
        } catch (err) {
          console.log('Positions endpoint not available, skipping')
          setPositions([])
        }
        
        // Fetch user's created initiatives (only if the endpoint exists)
        try {
          const initiativesResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/obligations?creator=${userData._id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          })
          setInitiatives(initiativesResponse.data.data?.obligations || [])
        } catch (err) {
          console.log('Obligations endpoint not available, skipping')
          setInitiatives([])
        }
      } else {
        setError('User not found')
      }
    } catch (err: any) {
      console.error('Error fetching user profile:', err)
      setError(err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTermDates = (start: string, end: string) => {
    const startDate = new Date(start).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    const endDate = new Date(end).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    return `${startDate} - ${endDate}`
  }

  const getOfficeTypeDisplay = (officeType: string) => {
    const displayNames: { [key: string]: string } = {
      'president': 'President',
      'vice_president': 'Vice President',
      'governor': 'Governor',
      'lieutenant_governor': 'Lieutenant Governor',
      'mayor': 'Mayor',
      'senator': 'Senator',
      'representative': 'Representative',
      'councilmember': 'Councilmember',
      'other': 'Official'
    }
    return displayNames[officeType] || officeType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Show loading if we're waiting for authentication
  if (params.username === 'me' && !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-surface py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-neutral">Redirecting to login...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-surface py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-neutral">Loading profile...</p>
              {params.username === 'me' && (
                <p className="text-sm text-neutral mt-2">Loading user data...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-surface py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-error font-semibold mb-2">Profile Not Found</div>
              <div className="text-sm text-neutral">{error || 'User not found'}</div>
              {params.username === 'me' && !currentUser && (
                <div className="text-sm text-neutral mt-2">Loading user data...</div>
              )}
              <button 
                onClick={() => router.push('/')}
                className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors duration-200"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link 
              href="/" 
              className="text-primary hover:text-primary-dark transition-colors duration-200"
            >
              ← Back to Home
            </Link>
          </nav>

          {/* Profile Header */}
          <div className="bg-surface rounded-lg shadow-lg overflow-hidden border border-neutral-light mb-8">
            <div className="bg-gradient-to-r from-primary to-primary-dark p-8 text-white">
              <div className="flex items-center space-x-6">
                {/* Profile Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                {/* Profile Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">
                    {isOwnProfile ? 'My Profile' : `${user.firstName} ${user.lastName}`}
                  </h1>
                  <p className="text-white/80 text-lg mb-2">@{user.username}</p>
                  {user.profile?.bio && (
                    <p className="text-white/70">{user.profile.bio}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-4">
                    {user.roles && user.roles.length > 0 && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm border">
                        {user.roles[0].replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    )}
                    <span className="text-sm opacity-90">
                      Member since {formatDate(user.createdAt.toString())}
                    </span>
                    {isOwnProfile && (
                      <Link
                        href="/profile/edit"
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors duration-200 text-sm font-medium"
                      >
                        Edit Profile
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Government Positions */}
              {positions.length > 0 && (
                <div className="bg-surface rounded-lg shadow-lg border border-neutral-light p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Government Positions</h2>
                  <div className="space-y-4">
                    {positions.map((position) => (
                      <div key={position._id} className="border border-neutral-light rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">
                              {getOfficeTypeDisplay(position.office.office_type)} • {position.office.name}
                            </h3>
                            <p className="text-neutral mb-2">
                              {position.office.governing_body?.name || position.office.jurisdiction?.name || 'Unknown Organization'}
                            </p>
                            <p className="text-sm text-neutral-light mb-2">
                              Term: {formatTermDates(position.term_start, position.term_end)}
                            </p>
                            <div className="flex items-center space-x-2">
                              {position.is_current && (
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                  Current
                                </span>
                              )}
                              {position.party && (
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                  {position.party}
                                </span>
                              )}
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                position.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {position.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Created Initiatives */}
              {initiatives.length > 0 && (
                <div className="bg-surface rounded-lg shadow-lg border border-neutral-light p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Created Initiatives</h2>
                  <div className="space-y-4">
                    {initiatives.map((initiative) => (
                      <Link 
                        key={initiative._id}
                        href={`/initiatives/${initiative._id}`}
                        className="block border border-neutral-light rounded-lg p-4 hover:border-primary transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">{initiative.title}</h3>
                            <p className="text-neutral text-sm mb-2 line-clamp-2">{initiative.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-neutral-light">
                              <span>{initiative.status}</span>
                              <span>{formatDate(initiative.createdAt)}</span>
                            </div>
                          </div>
                          <svg className="w-5 h-5 text-neutral-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {positions.length === 0 && initiatives.length === 0 && (
                <div className="bg-surface rounded-lg shadow-lg border border-neutral-light p-6 text-center">
                  <p className="text-neutral">No government positions or initiatives found.</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-surface rounded-lg shadow-lg border border-neutral-light p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {user.email && (
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-neutral-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a 
                        href={`mailto:${user.email}`}
                        className="text-primary hover:text-primary-dark transition-colors"
                      >
                        {user.email}
                      </a>
                    </div>
                  )}
                  {user.profile?.location && (
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-neutral-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-neutral">{user.profile.location}</span>
                    </div>
                  )}
                  {/* Website field not available in current UserProfile schema */}
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-neutral-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-neutral">Member since {formatDate(user.createdAt.toString())}</span>
                  </div>
                </div>
              </div>

              {/* Demographics section removed - fields not available in current User schema */}

              {/* Quick Stats */}
              <div className="bg-surface rounded-lg shadow-lg border border-neutral-light p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral">Positions</span>
                    <span className="font-semibold text-foreground">{positions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral">Initiatives Created</span>
                    <span className="font-semibold text-foreground">{initiatives.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral">Current Positions</span>
                    <span className="font-semibold text-foreground">
                      {positions.filter(p => p.is_current).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage

