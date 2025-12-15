'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { SideBarOptions } from '@/services/Constants';
import { LogOutIcon, Plus, Coins, TrendingUp, Sparkles } from 'lucide-react';
import { UserAuth } from '@/context/AuthContext';
import { useUser } from '@/app/provider';

export function AppSidebar() {
  const router = useRouter();
  const path = usePathname();
  const { signOut } = UserAuth();
  const { user } = useUser();
  const [hoveredItem, setHoveredItem] = useState(null);

  // Only use credits from user object
  const credits = user?.credits || 0;
  const maxCredits = 100; // For display purposes
  const usagePercent = Math.min((credits / maxCredits) * 100, 100);

  return (
    <Sidebar className="border-r border-gray-100/80 bg-gradient-to-b from-white via-gray-50/30 to-violet-50/20">
      {/* Logo with subtle animation */}
      <SidebarHeader className="flex items-center justify-center py-4 px-3 border-b border-gray-100/60">
        <div className="relative group cursor-pointer">
          <div className="absolute -inset-2 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
          <Image
            src="/logo.png"
            alt="Logo"
            width={110}
            height={110}
            className="w-[110px] object-contain relative transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </div>
      </SidebarHeader>

      {/* Create Button with glow effect */}
      <div className="px-3 pt-4">
        <Button
          className="w-full cursor-pointer relative overflow-hidden group bg-gradient-to-r from-violet-600 via-violet-600 to-violet-600 bg-size-[200%_100%] hover:bg-position-[100%_0] text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 rounded-xl h-10 text-sm font-medium transition-all duration-500"
          onClick={() => router.push('/recruiter/dashboard/create-interview')}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <Plus className="mr-2 w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
          Create Interview
        </Button>
      </div>

      <SidebarContent className="px-2 mt-2">
        <SidebarGroup className="mt-3 bg-gradient-to-br from-gray-50/80 to-violet-50/50 rounded-2xl p-3 border border-gray-100/60 shadow-sm">
          <SidebarMenu className="space-y-1">
            {SideBarOptions.map((option, index) => {
              // Use startsWith for dashboard to catch sub-routes like create-interview
              const isActive =
                option.path === '/recruiter/dashboard'
                  ? path.startsWith('/recruiter/dashboard')
                  : path === option.path || path.startsWith(option.path + '/');
              const isHovered = hoveredItem === index;

              return (
                <SidebarMenuItem
                  key={index}
                  onMouseEnter={() => setHoveredItem(index)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <SidebarMenuButton asChild>
                    <Link
                      href={option.path}
                      className={`
                        relative flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 min-h-11
                        ${
                          isActive
                            ? 'bg-gradient-to-r from-violet-600 to-violet-600 shadow-lg shadow-violet-500/25'
                            : 'hover:bg-gradient-to-r hover:from-violet-50 hover:to-violet-50'
                        }
                      `}
                    >
                      {/* Animated background glow on hover */}
                      {!isActive && isHovered && (
                        <span className="absolute inset-0 bg-gradient-to-r from-violet-100/50 to-violet-100/50 rounded-xl animate-pulse" />
                      )}

                      {/* Icon container with gradient */}
                      <div
                        className={`
                          relative p-2 rounded-lg transition-all duration-300 shrink-0
                          ${
                            isActive
                              ? 'bg-white/20 shadow-inner'
                              : isHovered
                                ? 'bg-gradient-to-br from-violet-600 to-violet-600 shadow-md shadow-violet-500/30'
                                : 'bg-gray-100/80'
                          }
                        `}
                      >
                        <option.icon
                          className={`
                            w-4 h-4 transition-all duration-300
                            ${isActive || isHovered ? 'text-white' : 'text-gray-500'}
                            ${isHovered && !isActive ? 'scale-110' : ''}
                          `}
                        />
                      </div>

                      {/* Menu text */}
                      <span
                        className={`
                          relative text-sm font-medium transition-all duration-300 whitespace-nowrap
                          ${
                            isActive
                              ? 'text-white'
                              : isHovered
                                ? 'text-violet-700 translate-x-0.5'
                                : 'text-gray-600'
                          }
                        `}
                      >
                        {option.name}
                      </span>

                      {/* Active indicator dot */}
                      {isActive && (
                        <span className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse shadow-lg" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Credits Widget */}
        <div className="mx-2 mt-6 p-4 rounded-2xl bg-gradient-to-br from-violet-600 via-violet-600 to-violet-700 text-white shadow-xl shadow-violet-500/30 relative overflow-hidden group">
          {/* Animated background shapes */}
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-violet-400/20 rounded-full blur-lg group-hover:scale-125 transition-transform duration-500" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Coins className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-sm">Available Credits</span>
              <Sparkles className="w-3 h-3 ml-auto text-yellow-300 animate-pulse" />
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-violet-100">Credits Balance</span>
                  <span className="font-bold bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                    {credits}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/20">
                <div className="p-1 bg-emerald-400/20 rounded-md shrink-0">
                  <TrendingUp className="w-3 h-3 text-emerald-300" />
                </div>
                <span className="text-xs text-violet-100 whitespace-nowrap">
                  <span className="font-bold text-white">1 credit</span> per
                  interview
                </span>
              </div>
            </div>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-gray-100/60">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || ''}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full cursor-pointer relative overflow-hidden group border-gray-200 text-gray-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 rounded-xl h-9 text-sm font-medium transition-all duration-300"
          onClick={async () => {
            await signOut();
            router.push('/login');
          }}
        >
          <LogOutIcon className="mr-2 w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
