'use client'

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthDialog from './AuthDialog';
import UserAvatar from './UserAvatar';

interface AuthButtonProps {
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
}

export default function AuthButton({ variant = 'default', className = '' }: AuthButtonProps) {
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthDialog(true);
  };

  // If user is authenticated, show user avatar
  if (user) {
    return (
      <div className={className}>
        <UserAvatar 
          size={variant === 'minimal' ? 'sm' : 'md'}
          showDropdown={true}
        />
      </div>
    );
  }

  // If user is not authenticated, show auth buttons
  switch (variant) {
    case 'minimal':
      return (
        <>
          <button
            onClick={() => handleAuthClick('login')}
            className={`bg-[var(--color-primary)] text-[var(--color-text-on-primary)] px-3 py-1.5 rounded text-sm hover:bg-[var(--color-primary-hover)] transition-colors ${className}`}
          >
            Sign In
          </button>
          
          <AuthDialog 
            isOpen={showAuthDialog} 
            onClose={() => setShowAuthDialog(false)} 
            initialMode={authMode} 
          />
        </>
      );

    case 'compact':
      return (
        <>
          <div className={`flex space-x-2 ${className}`}>
            <button
              onClick={() => handleAuthClick('login')}
              className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium text-sm transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => handleAuthClick('register')}
              className="bg-[var(--color-primary)] text-[var(--color-text-on-primary)] px-3 py-1.5 rounded text-sm hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Sign Up
            </button>
          </div>
          
          <AuthDialog 
            isOpen={showAuthDialog} 
            onClose={() => setShowAuthDialog(false)} 
            initialMode={authMode} 
          />
        </>
      );

    default:
      return (
        <>
          <div className={`flex items-center space-x-4 ${className}`}>
            <button
              onClick={() => handleAuthClick('login')}
              className="text-[var(--color-text)] hover:text-[var(--color-text)] font-medium transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => handleAuthClick('register')}
              className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-[var(--color-text-on-primary)] px-4 py-2 rounded-lg hover:from-[var(--color-primary-hover)] hover:to-[var(--color-secondary-hover)] transition-all duration-200 font-medium"
            >
              Get Started
            </button>
          </div>
          
          <AuthDialog 
            isOpen={showAuthDialog} 
            onClose={() => setShowAuthDialog(false)} 
            initialMode={authMode} 
          />
        </>
      );
  }
}
