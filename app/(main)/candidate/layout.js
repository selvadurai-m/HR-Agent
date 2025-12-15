'use client';
import React from 'react';
import DashboardProvider from './provider';
import WelcomeContainer from './dashboard/_components/WelcomeContainer';
import DashboardHeader from './_components/DashboardHeader';
import { SpeedInsights } from '@vercel/speed-insights/next';

function DashboardLayout({ children }) {
  return (
    <DashboardProvider>
      <div className="flex flex-col w-full min-h-screen bg-gray-50/50">
        <DashboardHeader />
        <div className="p-4 lg:p-6 xl:p-8 w-full space-y-4 lg:space-y-6 flex-1 max-w-[1600px] mx-auto">
          <WelcomeContainer />
          {children}
        </div>
      </div>
      <SpeedInsights />
    </DashboardProvider>
  );
}

export default DashboardLayout;
