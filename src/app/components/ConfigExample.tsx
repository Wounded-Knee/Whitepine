/**
 * Example component showing how to use shared configuration
 */

'use client';

import React from 'react';
import { useConfig } from '../hooks/useConfig';

const ConfigExample: React.FC = () => {
  const {
    appName,
    appVersion,
    environment,
    isOAuthEnabled,
    isGovernmentDataEnabled,
    primaryColor,
    secondaryColor,
    defaultPageSize,
    getApiUrl,
  } = useConfig();

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Configuration Example</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">App Info</h3>
          <p><strong>Name:</strong> {appName}</p>
          <p><strong>Version:</strong> {appVersion}</p>
          <p><strong>Environment:</strong> {environment}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Feature Flags</h3>
          <p><strong>OAuth:</strong> {isOAuthEnabled ? '✅ Enabled' : '❌ Disabled'}</p>
          <p><strong>Government Data:</strong> {isGovernmentDataEnabled ? '✅ Enabled' : '❌ Disabled'}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold">UI Settings</h3>
          <div className="flex space-x-4">
            <div 
              className="w-8 h-8 rounded"
              style={{ backgroundColor: primaryColor }}
              title={`Primary: ${primaryColor}`}
            />
            <div 
              className="w-8 h-8 rounded"
              style={{ backgroundColor: secondaryColor }}
              title={`Secondary: ${secondaryColor}`}
            />
          </div>
          <p><strong>Default Page Size:</strong> {defaultPageSize}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold">API</h3>
          <p><strong>Users Endpoint:</strong> {getApiUrl('/users')}</p>
          <p><strong>Auth Endpoint:</strong> {getApiUrl('/auth/login')}</p>
        </div>
      </div>
    </div>
  );
};

export default ConfigExample;
