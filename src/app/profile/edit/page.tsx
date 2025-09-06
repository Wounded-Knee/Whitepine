'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function EditProfilePage() {
  const { user, token, updateUser } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: ''
  })

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }
    
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.profile?.bio || '',
        location: user.profile?.location || '',
      })
    }
  }, [user, token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/users/profile`,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          profile: {
            bio: formData.bio,
            location: formData.location
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.status === 200) {
        setSuccess('Profile updated successfully!')
        updateUser(response.data.data)
        
        // Redirect to profile page after 2 seconds
        setTimeout(() => {
          router.push('/profile/me')
        }, 2000)
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!user) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="bg-[var(--color-surface)] rounded-lg shadow-lg border border-[var(--color-border)] p-8 text-center">
            <div className="text-[var(--color-text-muted)] text-4xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-[var(--color-text)] mb-4">Access Denied</h1>
            <p className="text-[var(--color-text-secondary)] mb-6">
              You must be logged in to edit your profile.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-[var(--color-primary)] text-[var(--color-text-on-primary)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors duration-200"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--color-text)] mb-4">Edit Profile</h1>
          <p className="text-lg text-[var(--color-text-secondary)]">
            Update your personal information and profile details.
          </p>
        </div>

        <div className="bg-[var(--color-surface)] rounded-lg shadow-lg border border-[var(--color-border)] p-8">
          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-[var(--color-error-light)] border border-[var(--color-error)] rounded-md">
              <p className="text-[var(--color-error)]">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-[var(--color-success-light)] border border-[var(--color-success)] rounded-md">
              <p className="text-[var(--color-success)]">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:border-transparent"
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:border-transparent"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:border-transparent"
                placeholder="Tell us about yourself and your interests in civic engagement..."
              />
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Optional: Share what motivates you to participate in democracy.
              </p>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:border-transparent"
                placeholder="City, State or Country"
              />
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Optional: Help connect with others in your area.
              </p>
            </div>

            {/* Website */}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => router.push('/profile/me')}
                className="px-6 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-md hover:bg-[var(--color-background)] transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[var(--color-primary)] text-[var(--color-text-on-primary)] rounded-md hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
