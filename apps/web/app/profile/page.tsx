'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { AvatarUpload } from '@/components/avatar-upload';
import { useAvatar } from '@/hooks/use-avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, ExternalLink, Upload } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatarUrl: ''
  });

  const {
    avatarUrl,
    displayUrl,
    isLoading: avatarLoading,
    error: avatarError,
    uploadAvatar,
    updateAvatarUrl,
    removeAvatar,
    refreshAvatar,
    isGoogleAvatar
  } = useAvatar({
    userId: session?.user?.id || '',
    initialAvatarUrl: session?.user?.image || undefined,
    autoRefresh: true
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin');
    }
  }, [status]);

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        avatarUrl: session.user.image || ''
      });
    }
  }, [session]);

  const handleSave = async () => {
    // Here you would typically save the form data to your API
    console.log('Saving profile data:', formData);
    setIsEditing(false);
  };

  const handleAvatarChange = (newAvatarUrl: string | null) => {
    setFormData(prev => ({
      ...prev,
      avatarUrl: newAvatarUrl ?? ''
    }));
  };

  const handleCustomUrlSubmit = async () => {
    if (formData.avatarUrl) {
      const result = await updateAvatarUrl(formData.avatarUrl);
      if (result.success) {
        handleAvatarChange(formData.avatarUrl);
      }
    }
  };

  if (status === 'loading' || avatarLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>

            {/* Avatar Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Avatar</span>
                </CardTitle>
                <CardDescription>
                  Manage your profile picture. Upload a custom image or use your Google avatar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <AvatarUpload
                    currentAvatarUrl={avatarUrl || undefined}
                    userId={session.user.id}
                    userName={session.user.name || 'User'}
                    onAvatarChange={handleAvatarChange}
                    size="lg"
                    showControls={true}
                  />

                  {avatarError && (
                    <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                      {avatarError}
                    </div>
                  )}

                  {/* Google Avatar Info */}
                  {isGoogleAvatar && (
                    <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-md">
                      <div className="flex items-center space-x-2">
                        <ExternalLink className="w-4 h-4" />
                        <span>Using Google avatar (automatically cached and refreshed)</span>
                      </div>
                    </div>
                  )}

                  {/* Custom URL Input */}
                  <div className="w-full max-w-md">
                    <Label htmlFor="avatarUrl" className="text-sm font-medium text-gray-700">
                      Or enter a custom avatar URL:
                    </Label>
                    <div className="flex space-x-2 mt-1">
                      <Input
                        id="avatarUrl"
                        type="url"
                        placeholder="https://example.com/avatar.jpg"
                        value={formData.avatarUrl}
                        onChange={(e: any) => setFormData(prev => ({ ...prev, avatarUrl: e.target.value }))}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleCustomUrlSubmit}
                        disabled={!formData.avatarUrl}
                        size="sm"
                      >
                        Set URL
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator className="my-6" />

            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e: any) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled={true} // Email is typically not editable
                      className="mt-1 bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    {isEditing ? (
                      <>
                        <Button onClick={handleSave}>
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cache Management */}
            {isGoogleAvatar && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <RefreshCw className="w-5 h-5" />
                    <span>Avatar Cache</span>
                  </CardTitle>
                  <CardDescription>
                    Your Google avatar is automatically cached and refreshed every 6 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={refreshAvatar}
                      disabled={avatarLoading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${avatarLoading ? 'animate-spin' : ''}`} />
                      Refresh Now
                    </Button>
                    <Button
                      variant="outline"
                      onClick={removeAvatar}
                      disabled={avatarLoading}
                    >
                      Remove Avatar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
