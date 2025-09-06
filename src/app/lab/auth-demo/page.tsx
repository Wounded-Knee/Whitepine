'use client'

import React, { useState } from 'react';
import AuthDialog from '../../components/AuthDialog';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthDemo() {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Authentication Demo
          </h1>
          <p className="text-gray-600 mb-6">
            This page demonstrates the login/register dialog component with Google OAuth integration.
            The component follows the federal color scheme and provides a seamless authentication experience.
          </p>

          {/* Current User Status */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Current Authentication Status
            </h2>
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500">
                      Signed in via {user.authProviders && user.authProviders.length > 0 
                        ? user.authProviders[0].provider === 'google' 
                          ? 'Google OAuth' 
                          : user.authProviders[0].provider === 'apple'
                            ? 'Apple OAuth'
                            : 'Email/Password'
                        : 'Email/Password'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No user is currently signed in</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setShowLoginDialog(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setShowRegisterDialog(true)}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Demo Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">Login Dialog</h3>
              <p className="text-blue-100 mb-4">
                Test the login functionality with email/password or Google OAuth
              </p>
              <button
                onClick={() => setShowLoginDialog(true)}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                Open Login Dialog
              </button>
            </div>

            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">Register Dialog</h3>
              <p className="text-indigo-100 mb-4">
                Test the registration functionality with email/password or Google OAuth
              </p>
              <button
                onClick={() => setShowRegisterDialog(true)}
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
              >
                Open Register Dialog
              </button>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Authentication Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Authentication</h3>
              <p className="text-gray-600 text-sm">
                JWT tokens, password hashing, and secure session management
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Google OAuth</h3>
              <p className="text-gray-600 text-sm">
                One-click sign-in with Google accounts, automatic profile creation
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M15 7l3-3m0 0h-3m3 0v3" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Federal Design</h3>
              <p className="text-gray-600 text-sm">
                Consistent with federal color scheme and accessibility standards
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Form Validation</h3>
              <p className="text-gray-600 text-sm">
                Real-time validation, password strength requirements, error handling
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Responsive Design</h3>
              <p className="text-gray-600 text-sm">
                Mobile-friendly interface with smooth animations and transitions
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Context Integration</h3>
              <p className="text-gray-600 text-sm">
                Seamless integration with React Context for global state management
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Dialogs */}
      <AuthDialog 
        isOpen={showLoginDialog} 
        onClose={() => setShowLoginDialog(false)} 
        initialMode="login" 
      />
      <AuthDialog 
        isOpen={showRegisterDialog} 
        onClose={() => setShowRegisterDialog(false)} 
        initialMode="register" 
      />
    </div>
  );
}
