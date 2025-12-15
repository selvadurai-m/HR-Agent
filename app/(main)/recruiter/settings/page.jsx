'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  User,
  Lock,
  LogOut,
  Bell,
  Shield,
  Palette,
  Globe,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'johndoe@example.com',
  });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    // Simulate logout functionality
    localStorage.removeItem('authToken'); // Clear auth token
    router.push('/login'); // Redirect to login page
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate profile update
    setTimeout(() => {
      alert('Profile updated successfully!');
      setLoading(false);
    }, 1000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate password change
    setTimeout(() => {
      alert('Password changed successfully!');
      setPassword('');
      setLoading(false);
    }, 1000);
  };

  const settingsSections = [
    {
      icon: Bell,
      label: 'Notifications',
      description: 'Manage email and push notifications',
      color: 'from-amber-500 to-orange-600',
    },
    {
      icon: Shield,
      label: 'Privacy',
      description: 'Control your privacy settings',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Palette,
      label: 'Appearance',
      description: 'Customize your dashboard theme',
      color: 'from-pink-500 to-rose-600',
    },
    {
      icon: Globe,
      label: 'Language',
      description: 'Change your preferred language',
      color: 'from-blue-500 to-cyan-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/20">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm">
            Manage your account preferences
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Section */}
        <Card className="border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <div className="p-1.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                <User className="w-4 h-4 text-white" />
              </div>
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-700">
                  Full Name
                </Label>
                <Input
                  type="text"
                  id="name"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  className="mt-1.5 rounded-xl border-gray-200 focus:border-violet-300"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-700">
                  Email Address
                </Label>
                <Input
                  type="email"
                  id="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  className="mt-1.5 rounded-xl border-gray-200 focus:border-violet-300"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/20"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card className="border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <div className="p-1.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                <Lock className="w-4 h-4 text-white" />
              </div>
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-gray-700">
                  New Password
                </Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 rounded-xl border-gray-200 focus:border-violet-300"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl"
                variant="outline"
                disabled={loading}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Quick Settings */}
      <Card className="border-gray-100 rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Quick Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {settingsSections.map((section, index) => (
              <button
                key={index}
                className="group p-4 bg-gray-50 hover:bg-white rounded-xl border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all text-left"
              >
                <div
                  className={`p-2 bg-gradient-to-br ${section.color} rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform`}
                >
                  <section.icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">{section.label}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {section.description}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Logout Section */}
      <Card className="border-rose-100 rounded-2xl shadow-sm bg-gradient-to-r from-rose-50/50 to-red-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-rose-500 to-red-600 rounded-lg">
                <LogOut className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Sign Out</h3>
                <p className="text-sm text-gray-500">
                  End your current session
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
