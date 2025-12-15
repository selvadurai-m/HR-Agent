'use client';
import { useUser } from '@/app/provider';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { supabase } from '@/services/supabaseClient';
import { DB_TABLES } from '@/services/Constants';

function WelcomeContainer() {
  const { user } = useUser();
  const [userData, setUserData] = useState({
    name: user?.name || 'User',
    picture: null,
  });
  // Stable function so it can be safely used in useEffect
  const fetchLatestUserData = useCallback(async () => {
    try {
      // Get latest user data from database
      const { data: userRecord, error } = await supabase
        .from(DB_TABLES.USERS)
        .select('name, picture')
        .eq('email', user.email)
        .single();

      if (!error && userRecord) {
        setUserData({
          name:
            userRecord.name ||
            user?.name ||
            user?.email?.split('@')[0] ||
            'User',
          picture: userRecord.picture || user?.picture,
        });
      } else {
        // Fallback to provider user data
        setUserData({
          name: user?.name || user?.email?.split('@')[0] || 'User',
          picture: user?.picture,
        });
      }

      // Check for Google profile in localStorage
      if (typeof window !== 'undefined') {
        const googleProfile = localStorage.getItem('googleProfile');
        if (googleProfile) {
          const { name, picture } = JSON.parse(googleProfile);
          setUserData((prev) => ({
            ...prev,
            name: name || prev.name,
            picture: picture || prev.picture,
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to provider user data
      setUserData({
        name: user?.name || user?.email?.split('@')[0] || 'User',
        picture: user?.picture,
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user?.email) return;
    (async () => {
      await fetchLatestUserData();
    })();
  }, [user]);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-violet-50/30 to-purple-50/30 p-5 rounded-2xl border border-gray-100/80 shadow-sm group hover:shadow-lg transition-all duration-500">
      {/* Animated background decorations */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-gradient-to-br from-violet-200/30 to-purple-200/30 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
      <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-violet-100/40 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute right-1/3 top-0 w-24 h-24 bg-purple-200/20 rounded-full blur-2xl animate-pulse" />

      <div className="relative flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Avatar with animation */}
          {userData.picture ? (
            <div className="relative group/avatar cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full blur-lg opacity-30 group-hover/avatar:opacity-50 transition-opacity duration-300" />
              <Image
                src={userData.picture}
                alt="userAvatar"
                width={52}
                height={52}
                className="relative rounded-full ring-2 ring-white shadow-lg group-hover/avatar:scale-110 transition-transform duration-300"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            </div>
          ) : (
            <div className="relative group/avatar cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-violet-500 rounded-full blur-lg opacity-30 group-hover/avatar:opacity-50 transition-opacity duration-300" />
              <div className="relative w-13 h-13 rounded-full bg-gradient-to-br from-violet-600 to-violet-600 flex items-center justify-center ring-2 ring-white shadow-lg group-hover/avatar:scale-110 transition-transform duration-300">
                <span className="text-lg font-bold text-white">
                  {userData.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            </div>
          )}

          {/* Welcome text with animations */}
          <div>
            <p className="text-xs text-violet-600/70 font-semibold mb-0.5 flex items-center gap-1.5">
              <span className="inline-block w-1 h-1 bg-violet-500 rounded-full animate-pulse" />
              Welcome back
            </p>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {userData.name}
              <span className="text-xl inline-block hover:animate-bounce cursor-default">
                👋
              </span>
            </h2>
            <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
              <span className="text-violet-500">✦</span>
              Your Path to Great Jobs Starts with AI Interviews
            </p>
          </div>
        </div>

        {/* Right side decorative badge with animation */}
        <div className="hidden md:flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-violet-100/80 shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-300 cursor-pointer group/badge">
          <div className="relative">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          </div>
          <span className="text-sm font-medium text-gray-700 group-hover/badge:text-violet-600 transition-colors duration-300">
            Ready for Interviews
          </span>
        </div>
      </div>
    </div>
  );
}

export default WelcomeContainer;
