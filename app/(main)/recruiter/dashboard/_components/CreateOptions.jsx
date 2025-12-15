import {
  Phone,
  Video,
  Coins,
  AlertCircle,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import React from 'react';
import Link from 'next/link';
import { useUser } from '@/app/provider';
import { Button } from '@/components/ui/button';

function CreateOptions() {
  const { user } = useUser();
  const hasCredits = (user?.credits || 0) > 0;

  return (
    <div className="mt-6">
      {/* Section Header with animation */}
      <div className="flex items-center gap-3 mb-5 group cursor-default">
        <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg shadow-orange-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-xl text-gray-900 flex items-center gap-2">
            Quick Actions
            <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </h2>
          <p className="text-sm text-gray-500">
            Create interviews and screenings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Create Interview Card */}
        <div className={`relative group ${!hasCredits ? 'opacity-70' : ''}`}>
          <Link
            href={hasCredits ? '/recruiter/dashboard/create-interview' : '#'}
          >
            <div
              className={`bg-white border border-gray-100/80 rounded-2xl p-6 shadow-sm relative overflow-hidden ${
                hasCredits
                  ? 'cursor-pointer hover:shadow-2xl hover:border-violet-200 hover:-translate-y-1 transition-all duration-500'
                  : 'cursor-not-allowed'
              }`}
            >
              {/* Animated background decoration */}
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full opacity-50 group-hover:scale-[2] group-hover:opacity-30 transition-all duration-700" />
              <div className="absolute -left-16 -bottom-16 w-40 h-40 bg-gradient-to-br from-purple-100/50 to-violet-100/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500" />

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Video className="text-white h-6 w-6" />
                  </div>
                  {hasCredits ? (
                    <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span className="text-xs font-semibold">No Credits</span>
                    </div>
                  )}
                </div>
                <h2 className="font-bold text-lg text-gray-900 group-hover:text-violet-700 transition-colors duration-300">
                  Create New Interview
                </h2>
                <p className="text-gray-500 text-sm mt-1 mb-4 leading-relaxed">
                  Create AI-powered interviews and share with candidates
                  instantly
                </p>
                <div className="flex items-center gap-2 text-sm bg-gradient-to-r from-violet-50 to-purple-50 w-fit px-3 py-1.5 rounded-full border border-violet-100/50 group-hover:shadow-md transition-all duration-300">
                  <Coins className="w-4 h-4 text-violet-600" />
                  <span className="text-violet-700 font-semibold">
                    1 Credit
                  </span>
                </div>
              </div>
            </div>
          </Link>
          {!hasCredits && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl">
              <Button
                onClick={() => (window.location.href = '/recruiter/billing')}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-xl shadow-violet-500/30 px-6 py-5 rounded-xl hover:scale-105 transition-transform duration-300"
              >
                <Coins className="w-4 h-4 mr-2" />
                Buy Credits
              </Button>
            </div>
          )}
        </div>

        {/* Phone Screening Card */}
        <div className="group bg-white border border-gray-100/80 rounded-2xl p-6 shadow-sm hover:shadow-2xl hover:border-emerald-200 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden cursor-pointer">
          {/* Animated background decoration */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full opacity-50 group-hover:scale-[2] group-hover:opacity-30 transition-all duration-700" />
          <div className="absolute -left-16 -bottom-16 w-40 h-40 bg-gradient-to-br from-teal-100/50 to-emerald-100/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500" />

          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Phone className="text-white h-6 w-6" />
              </div>
              <span className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-full border border-amber-200/50 shadow-sm group-hover:shadow-md transition-all duration-300">
                Coming Soon
              </span>
            </div>
            <h2 className="font-bold text-lg text-gray-900 group-hover:text-emerald-700 transition-colors duration-300">
              Phone Screening Call
            </h2>
            <p className="text-gray-500 text-sm mt-1 mb-4 leading-relaxed">
              Schedule automated phone screening calls with candidates
            </p>
            <div className="flex items-center gap-2 text-sm bg-gradient-to-r from-gray-50 to-emerald-50/50 w-fit px-3 py-1.5 rounded-full border border-gray-100/50">
              <span className="text-gray-600 font-medium">
                ✨ Free during beta
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateOptions;
