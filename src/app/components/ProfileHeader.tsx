'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { User } from '../types';

interface ProfileHeaderProps {
  user: User;
  onProfileUpdate?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onProfileUpdate }) => {
  const { user: currentUser } = useAuth();
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const isOwnProfile = currentUser?._id === user._id;

  const handleFileUpload = async (file: File, type: 'avatar' | 'banner') => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', 'User');
    formData.append('entityId', user._id);
    formData.append('description', `${type} for ${user.firstName} ${user.lastName}`);
    formData.append('isPrimary', 'true');

    try {
      setError(null);
      if (type === 'banner') {
        setUploadingBanner(true);
      } else {
        setUploadingAvatar(true);
      }

      // Use the new v1 unified media endpoint
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/media`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 201) {
        setSuccess(`${type === 'avatar' ? 'Avatar' : 'Banner'} updated successfully!`);
        
        // Notify parent component to refresh profile data
        if (onProfileUpdate) {
          onProfileUpdate();
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error: any) {
      console.error(`Failed to upload ${type}:`, error);
      setError(error.response?.data?.detail || `Failed to upload ${type}`);
    } finally {
      if (type === 'banner') {
        setUploadingBanner(false);
      } else {
        setUploadingAvatar(false);
      }
    }
  };

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'banner');
    }
    // Reset input value to allow re-uploading the same file
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'avatar');
    }
    // Reset input value to allow re-uploading the same file
    if (event.target) {
      event.target.value = '';
    }
  };

  const triggerFileInput = (type: 'avatar' | 'banner') => {
    if (type === 'banner') {
      bannerFileInputRef.current?.click();
    } else {
      avatarFileInputRef.current?.click();
    }
  };

  const getBannerUrl = () => {
    // Banner functionality not available in current UserProfile schema
    return '/api/placeholder/1200/300';
  };

  const getAvatarUrl = () => {
    // Avatar functionality not available in current UserProfile schema
    return '/api/placeholder/150/150';
  };

  return (
    <div className="relative bg-[var(--color-surface)] rounded-lg shadow-sm border border-[var(--color-border)] overflow-hidden">
      {/* Hidden file inputs */}
      <input
        ref={bannerFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleBannerUpload}
        className="hidden"
      />
      <input
        ref={avatarFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />

      {/* Banner Image */}
      <div className="relative h-48 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
        {/* Banner functionality not available in current UserProfile schema */}
        
        {/* Banner Upload Overlay - Disabled due to schema limitations */}
        {false && isOwnProfile && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
            <button
              onClick={() => triggerFileInput('banner')}
              disabled={uploadingBanner}
              className="px-4 py-2 bg-[var(--color-surface)] bg-opacity-90 text-[var(--color-text)] rounded-md hover:bg-opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:ring-offset-2 transition-all duration-200 opacity-0 hover:opacity-100 disabled:opacity-50"
            >
              {uploadingBanner ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Change Banner
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Profile Info Section */}
      <div className="px-6 pb-6">
        {/* Avatar */}
        <div className="relative -mt-20 mb-4">
          <div className="relative inline-block">
            <img
              src={getAvatarUrl()}
              alt={`${user.firstName} ${user.lastName}'s avatar`}
              className="w-32 h-32 rounded-full border-4 border-[var(--color-surface)] shadow-lg object-cover"
            />
            
            {/* Avatar Upload Overlay */}
            {isOwnProfile && (
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-full flex items-center justify-center">
                <button
                  onClick={() => triggerFileInput('avatar')}
                  disabled={uploadingAvatar}
                  className="p-2 bg-[var(--color-surface)] bg-opacity-90 text-[var(--color-text)] rounded-full hover:bg-opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:ring-offset-2 transition-all duration-200 opacity-0 hover:opacity-100 disabled:opacity-50"
                >
                  {uploadingAvatar ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] mb-2">
            @{user.username}
          </p>
          {user.profile?.bio && (
            <p className="text-[var(--color-text-secondary)]">{user.profile.bio}</p>
          )}
        </div>

        {/* Profile Details */}
        <div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-secondary)]">
          {user.profile?.location && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {user.profile.location}
            </div>
          )}
          {/* Website field not available in current UserProfile schema */}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mx-6 mb-4 p-4 bg-[var(--color-error-light)] border border-[var(--color-error)] rounded-md">
          <p className="text-[var(--color-error)]">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mx-6 mb-4 p-4 bg-[var(--color-success-light)] border border-[var(--color-success)] rounded-md">
          <p className="text-[var(--color-success)]">{success}</p>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
