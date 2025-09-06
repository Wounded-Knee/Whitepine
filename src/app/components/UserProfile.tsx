'use client'

import { useState } from 'react'
import ProfileHeader from './ProfileHeader'
import { User } from '../types'

interface UserProfileProps {
  user: User
  onProfileUpdate?: () => void
}

export default function UserProfile({ user, onProfileUpdate }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'petitions', label: 'Petitions', icon: '📝' },
    { id: 'votes', label: 'Votes', icon: '🗳️' },
    { id: 'activity', label: 'Activity', icon: '📈' }
  ]

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <ProfileHeader user={user} onProfileUpdate={onProfileUpdate} />

      {/* Profile Tabs */}
      <div className="bg-[var(--color-surface)] rounded-lg shadow-lg border border-[var(--color-border)]">
        {/* Tab Navigation */}
        <div className="border-b border-[var(--color-border)]">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[var(--color-text)]">Profile Overview</h2>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[var(--color-background)] rounded-lg p-6 border border-[var(--color-border)]">
                  <div className="flex items-center">
                    <div className="p-3 bg-[var(--color-primary-light)] rounded-lg">
                      <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-[var(--color-text-secondary)]">Petitions Created</p>
                      <p className="text-2xl font-bold text-[var(--color-text)]">12</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--color-background)] rounded-lg p-6 border border-[var(--color-border)]">
                  <div className="flex items-center">
                    <div className="p-3 bg-[var(--color-success-light)] rounded-lg">
                      <svg className="w-6 h-6 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-[var(--color-text-secondary)]">Total Votes</p>
                      <p className="text-2xl font-bold text-[var(--color-text)]">156</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--color-background)] rounded-lg p-6 border border-[var(--color-border)]">
                  <div className="flex items-center">
                    <div className="p-3 bg-[var(--color-accent-light)] rounded-lg">
                      <svg className="w-6 h-6 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-[var(--color-text-secondary)]">Vigor Points</p>
                      <p className="text-2xl font-bold text-[var(--color-text)]">89</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-[var(--color-background)] rounded-lg border border-[var(--color-border)]">
                    <div className="w-2 h-2 bg-[var(--color-success)] rounded-full"></div>
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      Voted on "Community Park Initiative"
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)] ml-auto">2 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-[var(--color-background)] rounded-lg border border-[var(--color-border)]">
                    <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full"></div>
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      Created petition "Digital Literacy Program"
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)] ml-auto">1 day ago</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-[var(--color-background)] rounded-lg border border-[var(--color-border)]">
                    <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full"></div>
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      Added 7 vigor points to "Local Food Bank Support"
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)] ml-auto">3 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'petitions' && (
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6">My Petitions</h2>
              <div className="text-center py-12">
                <div className="text-[var(--color-text-muted)] text-4xl mb-4">📝</div>
                <p className="text-[var(--color-text-secondary)]">No petitions created yet.</p>
                <p className="text-sm text-[var(--color-text-muted)] mt-2">
                  Start making a difference by creating your first petition.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'votes' && (
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6">My Votes</h2>
              <div className="text-center py-12">
                <div className="text-[var(--color-text-muted)] text-4xl mb-4">🗳️</div>
                <p className="text-[var(--color-text-secondary)]">No votes cast yet.</p>
                <p className="text-sm text-[var(--color-text-muted)] mt-2">
                  Participate in democracy by voting on petitions that matter to you.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6">Activity Timeline</h2>
              <div className="text-center py-12">
                <div className="text-[var(--color-text-muted)] text-4xl mb-4">📈</div>
                <p className="text-[var(--color-text-secondary)]">No recent activity.</p>
                <p className="text-sm text-[var(--color-text-muted)] mt-2">
                  Your civic engagement activities will appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
