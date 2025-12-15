'use client';
import React from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main className="w-full max-w-[1920px] mx-auto">{children}</main>
      <SpeedInsights />
    </div>
  );
}
