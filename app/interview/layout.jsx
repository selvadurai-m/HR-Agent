'use client';
import React, { useState } from 'react';
import InterviewHeader from './_components/InterviewHeader';
import { InterviewDataContext } from '@/context/InterviewDataContext';

const InterviewLayout = ({ children }) => {
  const [interviewInfo, setInterviewInfo] = useState();

  return (
    <InterviewDataContext.Provider value={{ interviewInfo, setInterviewInfo }}>
      <InterviewHeader />
      <div className="bg-gradient-to-br from-slate-50 via-white to-violet-50/30 min-h-[calc(100vh-64px)] pb-6">
        {children}
      </div>
    </InterviewDataContext.Provider>
  );
};

export default InterviewLayout;
