'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/app/provider';
import { supabase } from '@/services/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Camera, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DB_TABLES } from '@/services/Constants';

export default function RecruiterProfile() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    fullname: '',
    email: '',
    picture: null,
  });
  const [originalData, setOriginalData] = useState({});
  const [password, setPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  let provider = null;
  if (typeof window !== 'undefined') {
    try {
      provider = JSON.parse(
        localStorage.getItem('sb-oqaqnjpovruuqpuohjbp-auth-token')
      )?.user?.app_metadata?.provider;
    } catch (err) {
      console.debug('Failed to read provider from localStorage', err);
    }
  }
  const isGoogleUser = provider === 'google';

  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);

      // Get user data from Provider context
      let userData = {
        fullname: user?.name || user?.email?.split('@')[0] || '',
        email: user?.email || '',
        picture: user?.picture || null,
      };

      // Try to get additional data from users table
      if (user?.email) {
        const { data: userRecord, error } = await supabase
          .from(DB_TABLES.USERS)
          .select('name, email, picture')
          .eq('email', user.email)
          .single();

        if (!error && userRecord) {
          userData = {
            ...userData,
            fullname: userRecord.name || userData.fullname,
            email: userRecord.email || userData.email,
            picture: userRecord.picture || userData.picture,
          };
        }
      }

      setProfileData(userData);
      setOriginalData(userData);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user, loadProfileData]);

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setSaving(true);

      // Upload to Supabase storage
      const fileName = `profile-${user.email}-${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Failed to upload image');
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      const newPictureUrl = urlData.publicUrl;

      // Update local state
      setProfileData((prev) => ({
        ...prev,
        picture: newPictureUrl,
      }));

      // Immediately save to database
      const { error: updateError } = await supabase
        .from(DB_TABLES.USERS)
        .upsert(
          {
            email: user.email,
            name: profileData.fullname,
            picture: newPictureUrl,
          },
          {
            onConflict: 'email',
          }
        );

      if (updateError) {
        console.error('Database update error:', updateError);
        toast.error('Failed to save picture to database');
        return;
      }

      // Update original data to reflect the change
      setOriginalData((prev) => ({
        ...prev,
        picture: newPictureUrl,
      }));

      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!user?.email) {
      toast.error('User not authenticated');
      return;
    }

    try {
      setSaving(true);

      // Update users table
      const { error } = await supabase.from(DB_TABLES.USERS).upsert(
        {
          email: user.email,
          name: profileData.fullname,
          picture: profileData.picture,
        },
        {
          onConflict: 'email',
        }
      );

      if (error) {
        console.error('Update error:', error);
        toast.error('Failed to update profile');
        return;
      }

      setOriginalData(profileData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!password) return;
    setPasswordSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error('Failed to change password');
      } else {
        toast.success('Password changed successfully!');
        setPassword('');
      }
    } catch (err) {
      console.error('Error changing password', err);
      toast.error('Error changing password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const hasChanges = () => {
    return JSON.stringify(profileData) !== JSON.stringify(originalData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        <span className="ml-2 text-gray-600">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/20">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-500 text-sm">
            Manage your personal information and preferences
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Picture Section */}
        <Card className="border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <div className="p-1.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                <Camera className="w-4 h-4 text-white" />
              </div>
              Profile Picture
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full blur-lg opacity-30" />
                <Avatar className="relative w-28 h-28 ring-4 ring-white shadow-lg">
                  <AvatarImage src={profileData.picture} alt="Profile" />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                    {profileData.fullname?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex flex-col items-center space-y-2">
                <Label htmlFor="picture-upload" className="cursor-pointer">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="rounded-xl border-violet-200 hover:border-violet-300 hover:bg-violet-50"
                  >
                    <span>
                      <Camera className="w-4 h-4 mr-2" />
                      Change Picture
                    </span>
                  </Button>
                </Label>
                <input
                  id="picture-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePictureUpload}
                  className="hidden"
                />
                {saving && (
                  <div className="flex items-center gap-2 text-sm text-violet-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information Section */}
        <Card className="border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <div className="p-1.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                <User className="w-4 h-4 text-white" />
              </div>
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="fullname" className="text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="fullname"
                  value={profileData.fullname}
                  onChange={(e) =>
                    handleInputChange('fullname', e.target.value)
                  }
                  placeholder="Enter your full name"
                  className="mt-1.5 rounded-xl border-gray-200 focus:border-violet-300"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  value={profileData.email}
                  placeholder="Enter your email"
                  type="email"
                  disabled
                  className="mt-1.5 rounded-xl bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Email cannot be changed for security reasons
                </p>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={!hasChanges() || saving}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/20"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <div className="p-1.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                <User className="w-4 h-4 text-white" />
              </div>
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label htmlFor="password" className="text-gray-700">
                Change Password
              </Label>
              <Input
                id="password"
                type="password"
                value={
                  isGoogleUser
                    ? "You can't change the password because you login with Google OAuth"
                    : password
                }
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isGoogleUser ? '' : 'Enter new password'}
                disabled={isGoogleUser || passwordSaving}
                className="mt-1.5 rounded-xl border-gray-200"
              />
              {isGoogleUser && (
                <p className="text-xs text-gray-500 mt-1.5">
                  You can&apos;t change the password because you login with
                  Google OAuth
                </p>
              )}
            </div>
            <Button
              onClick={handlePasswordChange}
              disabled={isGoogleUser || !password || passwordSaving}
              className="w-full rounded-xl"
              variant="outline"
            >
              {passwordSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <Card className="border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
              <Mail className="w-4 h-4 text-white" />
            </div>
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-4 bg-gray-50 rounded-xl">
              <Label className="text-sm font-medium text-gray-500">
                Account Type
              </Label>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                Recruiter
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <Label className="text-sm font-medium text-gray-500">
                Member Since
              </Label>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
