'use client';
import { Phone, File as FileIcon } from 'lucide-react';
import React from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/services/supabaseClient';
import { DB_TABLES } from '@/services/Constants';

function CreateOptions() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    if (!code.trim()) {
      toast.error('Please enter an interview code.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from(DB_TABLES.INTERVIEWS)
      .select('interview_id')
      .eq('interview_id', code.trim())
      .single();

    setLoading(false);

    if (error || !data) {
      toast.error('Invalid interview code. Please try again.');
      return;
    }

    toast.success('Redirecting to your interview...');
    router.push(`/interview/${code.trim()}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Join Interview Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col h-full hover:border-violet-300 hover:shadow-lg transition-all duration-200">
        <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/30 w-fit">
          <Phone className="text-white h-6 w-6" />
        </div>
        <h2 className="mt-4 mb-2 font-semibold text-lg text-gray-900">
          Join Interview
        </h2>
        <p className="text-gray-500 text-sm mb-3">Enter your code</p>

        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. 5311a093-ef9e-4190-ab0b"
          className="mb-4 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
        />

        <div className="mt-auto">
          <Button
            onClick={handleStart}
            disabled={loading}
            className="w-full cursor-pointer bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/30"
          >
            {loading ? 'Checking...' : 'Start Interview'}
          </Button>
        </div>
      </div>

      {/* Upload CV Card */}
      <Link href={'/candidate/upload-cv'}>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm cursor-pointer flex flex-col h-full hover:border-violet-300 hover:shadow-lg transition-all duration-200">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/30 w-fit">
            <FileIcon className="text-white h-6 w-6" />
          </div>
          <h2 className="mt-4 font-semibold text-lg text-gray-900">
            Upload Your CV
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Get AI-powered feedback on your resume
          </p>
          <div className="mt-auto">
            <div className="w-full h-[40px]"></div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default CreateOptions;
