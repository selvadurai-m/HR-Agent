'use client';
import React from 'react';
import { useUser } from '@/app/provider';
import { Button } from '@/components/ui/button';
import { Coins, Plus, AlertCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

function CreditsDisplay() {
  const { user } = useUser();
  const router = useRouter();

  const handleBuyCredits = () => {
    router.push('/recruiter/billing');
  };

  const credits = user?.credits || 0;
  const isLow = credits <= 2;
  const isEmpty = credits === 0;

  // Only show when credits are low or empty - otherwise hide completely
  // The sidebar already shows credit balance, so we only need alerts here
  if (!isLow) {
    return null;
  }

  // Low credits warning (1-2 credits)
  if (isLow && !isEmpty) {
    return (
      <div className="flex items-center justify-between gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-amber-800">Running low on credits</p>
            <p className="text-sm text-amber-600">
              You have <span className="font-semibold">{credits}</span> credit
              {credits !== 1 ? 's' : ''} remaining
            </p>
          </div>
        </div>
        <Button
          onClick={handleBuyCredits}
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-4"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Buy Credits
        </Button>
      </div>
    );
  }

  // No credits - more prominent warning
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-rose-50 border border-rose-200 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-rose-100 rounded-lg">
          <Sparkles className="w-5 h-5 text-rose-600" />
        </div>
        <div>
          <p className="font-medium text-rose-800">No credits available</p>
          <p className="text-sm text-rose-600">
            Purchase credits to create new interviews
          </p>
        </div>
      </div>
      <Button
        onClick={handleBuyCredits}
        size="sm"
        className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-4"
      >
        <Coins className="w-4 h-4 mr-1.5" />
        Get Credits
      </Button>
    </div>
  );
}

export default CreditsDisplay;
