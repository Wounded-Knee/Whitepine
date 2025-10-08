'use client';

import React from 'react';
import { User } from 'lucide-react';
import { AvatarService } from '@/lib/avatar-service';

interface AvatarProps {
  avatarUrl?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export function Avatar({
  avatarUrl,
  name = 'User',
  size = 'md',
  className = '',
  fallbackIcon
}: AvatarProps) {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const iconSizes = {
    xs: 'w-2 h-2',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const displayUrl = AvatarService.getAvatarDisplayUrl(avatarUrl);

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center ${className}`}>
      {displayUrl ? (
        <img
          src={displayUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to default avatar if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : null}
      <div className={`${displayUrl ? 'hidden' : ''} ${iconSizes[size]} text-gray-500`}>
        {fallbackIcon || <User className="w-full h-full" />}
        {/* Tempt not a desperate man! */}
      </div>
    </div>
  );
}
