'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'
import { getUserAvatarUrl, getUserInitials } from '../utils/avatarUtils'
import ThemeToggleDropdown from './ThemeToggleDropdown'

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showDropdown?: boolean
}

export default function UserAvatar({ size = 'md', showDropdown = true }: UserAvatarProps) {
  const { user, logout } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  if (!user) {
    return null
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-36 h-36'
  }



  const handleLogout = () => {
    logout()
    setIsDropdownOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-neutral-light hover:border-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
        aria-label="User menu"
      >
        <Image
          src={getUserAvatarUrl(user, size === 'xl' ? 144 : 48)}
          alt={`${user.firstName} ${user.lastName}`}
          width={size === 'xl' ? 144 : 48}
          height={size === 'xl' ? 144 : 48}
          className="w-full h-full object-cover"
        />
      </button>

      {showDropdown && isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-surface border border-neutral-light z-50">
          <div className="py-1">
            {/* User Info */}
            <div className="px-4 py-2 border-b border-neutral-light">
              <p className="text-sm font-medium text-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-neutral truncate">
                {user.email}
              </p>
            </div>

            {/* Menu Items */}
            <Link
              href="/profile/me"
              onClick={() => setIsDropdownOpen(false)}
              className="block px-4 py-2 text-sm text-neutral hover:text-foreground hover:bg-neutral-light transition-colors duration-200"
            >
              View Profile
            </Link>
            
            <Link
              href="/profile/edit"
              onClick={() => setIsDropdownOpen(false)}
              className="block px-4 py-2 text-sm text-neutral hover:text-foreground hover:bg-neutral-light transition-colors duration-200"
            >
              Edit Profile
            </Link>

            {/* Theme Toggle */}
            <ThemeToggleDropdown />

            <div className="border-t border-neutral-light">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
