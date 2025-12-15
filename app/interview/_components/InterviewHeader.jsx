import React from 'react';
import Image from 'next/image';

function InterviewHeader() {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-violet-100/50 sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center">
        <div className="flex-shrink-0 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Image
              src="/Logo.png"
              alt="Logo"
              width={120}
              height={40}
              className="h-auto w-[100px] sm:w-[120px] relative transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default InterviewHeader;
