'use client';
import React, { useState } from 'react';
import {
  Search,
  Bell,
  Settings,
  ChevronDown,
  User,
  LogOut,
} from 'lucide-react';
import { useUser } from '@/app/provider';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function DashboardHeader() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [hasNotifications] = useState(true);

  return (
    <header className="bg-white border-b border-gray-100 px-3 lg:px-4 py-2 sticky top-0 z-10">
      <div className="flex items-center justify-between gap-3">
        {/* Left side - Logo/Title + Search */}
        <div className="flex items-center gap-3 flex-1">
          {/* Page Title/Branding */}
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs">AI</span>
            </div>
            <span className="font-semibold text-gray-800 text-xs lg:text-sm">
              Recruiter
            </span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search interviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 h-8 w-full bg-gray-50 border-gray-200 focus:bg-white focus:border-violet-300 rounded-lg transition-all text-xs"
              />
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-1.5">
          {/* Notifications */}
          <button className="relative p-1.5 rounded-md hover:bg-gray-100 transition-colors">
            <Bell className="w-4 h-4 text-gray-600" />
            {hasNotifications && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* Settings */}
          <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
            <Settings className="w-4 h-4 text-gray-600" />
          </button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-violet-200">
                  {user?.picture ? (
                    <Image
                      src={user.picture}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-medium text-gray-900 line-clamp-1">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-[10px] text-gray-500">Recruiter</p>
                </div>
                <ChevronDown className="w-3 h-3 text-gray-400 hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-rose-600 focus:text-rose-600">
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
