'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/services/supabaseClient';
import { toast } from 'sonner';
import { DB_TABLES } from '@/services/Constants';
import {
  Upload,
  FileText,
  X,
  CloudUpload,
  CheckCircle2,
  Sparkles,
  MousePointerClick,
  File,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadCV() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        toast.error('User not logged in');
        return;
      }

      const email = session.user.email;

      const { data: userData, error: userError } = await supabase
        .from(DB_TABLES.USERS)
        .select('id, cv_file_path')
        .eq('email', email)
        .single();

      if (userError) {
        console.error('Failed to fetch user:', userError);
        toast.error('Failed to load user data');
        return;
      }

      setUser(userData);
    }

    fetchUser();
  }, []);

  // Handle file selection from input or drop
  const handleFileSelect = useCallback((files) => {
    const file = files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file only');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
    console.log('Selected CV:', file);
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(Array.from(files));
      }
    },
    [handleFileSelect]
  );

  const handleInputChange = useCallback(
    (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(Array.from(files));
      }
    },
    [handleFileSelect]
  );

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uploadedFile) {
      toast.error('Please upload your CV before submitting.');
      return;
    }
    if (!user) {
      toast.error('User not loaded.');
      return;
    }

    setLoading(true);

    try {
      // Define storage path
      const fileExt = uploadedFile.name.split('.').pop();
      const fileName = `cv.${fileExt}`;
      const filePath = `cv/${user.id}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('cv-uploads')
        .upload(filePath, uploadedFile, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Update user record with file path
      const { error: updateError } = await supabase
        .from(DB_TABLES.USERS)
        .update({ cv_file_path: filePath })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Refresh user data to update UI
      setUser({ ...user, cv_file_path: filePath });
      setUploadedFile(null);
      toast.success('CV uploaded successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload CV.');
    } finally {
      setLoading(false);
    }
  };

  // Delete CV file from storage and DB
  const handleDelete = async () => {
    if (!user || !user.cv_file_path) return;

    setLoading(true);
    try {
      const { error: deleteError } = await supabase.storage
        .from('cv-uploads')
        .remove([user.cv_file_path]);

      if (deleteError) throw deleteError;

      const { error: updateError } = await supabase
        .from(DB_TABLES.USERS)
        .update({ cv_file_path: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setUser({ ...user, cv_file_path: null });
      toast.success('CV deleted.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete CV.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/20">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-800 via-violet-700 to-violet-600 bg-clip-text text-transparent">
            CV Management
          </h1>
          <p className="text-gray-500 text-sm">
            Upload or manage your resume file
          </p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm p-6 lg:p-8 rounded-2xl shadow-xl border border-gray-100">
        {!user ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-violet-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-600 animate-spin"></div>
            </div>
            <p className="text-gray-600 font-medium">Loading user...</p>
          </div>
        ) : user.cv_file_path ? (
          <div className="animate-slide-up">
            <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <span className="text-gray-800 font-semibold block">
                  CV Uploaded Successfully
                </span>
                <span className="text-gray-500 text-sm">
                  Your resume is ready for interviews
                </span>
              </div>
            </div>

            <button
              onClick={handleDelete}
              disabled={loading}
              className="py-2.5 px-5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
            >
              {loading ? 'Deleting...' : 'Delete CV'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Upload your CV (PDF)
              </label>

              {/* Enhanced Dropzone Implementation */}
              <motion.div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={openFileDialog}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`relative border-2 border-dashed rounded-2xl p-10 transition-all duration-300 cursor-pointer overflow-hidden group
                  ${
                    isDragging
                      ? 'border-violet-500 bg-violet-100/70 scale-[1.02]'
                      : 'border-violet-300 bg-gradient-to-br from-violet-50/80 via-white to-purple-50/80 hover:border-violet-400 hover:shadow-lg hover:shadow-violet-100'
                  }`}
              >
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-30 pointer-events-none">
                  <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  <div className="absolute top-8 right-8 w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse delay-300" />
                  <div className="absolute bottom-6 left-12 w-1.5 h-1.5 rounded-full bg-violet-300 animate-pulse delay-500" />
                  <div className="absolute bottom-8 right-16 w-2 h-2 rounded-full bg-purple-300 animate-pulse delay-700" />
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleInputChange}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center gap-5 relative z-10">
                  {/* Animated upload icon */}
                  <motion.div
                    animate={
                      isDragging
                        ? { scale: [1, 1.1, 1], y: [0, -5, 0] }
                        : { y: [0, -8, 0] }
                    }
                    transition={{
                      duration: isDragging ? 0.5 : 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className={`relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 ${
                      isDragging
                        ? 'bg-violet-600 shadow-violet-300'
                        : 'bg-gradient-to-br from-violet-500 via-violet-600 to-purple-600 shadow-violet-200 group-hover:shadow-violet-300'
                    }`}
                  >
                    <CloudUpload className="w-10 h-10 text-white" />
                    {/* Sparkle effect */}
                    <motion.div
                      animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      className="absolute -top-1 -right-1"
                    >
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                    </motion.div>
                  </motion.div>

                  <div className="text-center space-y-2">
                    <AnimatePresence mode="wait">
                      {isDragging ? (
                        <motion.p
                          key="dragging"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-violet-700 font-semibold text-lg"
                        >
                          Drop your file here!
                        </motion.p>
                      ) : (
                        <motion.div
                          key="default"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <p className="text-gray-800 font-semibold text-lg">
                            Drag & drop your CV here
                          </p>
                          <p className="text-gray-500 mt-1 flex items-center justify-center gap-2">
                            <span>or</span>
                            <span className="inline-flex items-center gap-1.5 text-violet-600 font-semibold hover:underline">
                              <MousePointerClick className="w-4 h-4" />
                              click to browse
                            </span>
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* File type indicator */}
                  <div className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-violet-100 shadow-sm">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <File className="w-3.5 h-3.5 text-red-500" />
                      <span>PDF only</span>
                    </div>
                    <div className="w-px h-4 bg-gray-200" />
                    <div className="text-xs text-gray-600">Max 10MB</div>
                  </div>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
              </motion.div>

              {uploadedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="flex items-center justify-between gap-3 mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200"
                    >
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <p className="text-sm text-green-800 font-semibold">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-green-600 mt-0.5">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB •
                        Ready to upload
                      </p>
                    </div>
                  </div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    className="p-2.5 bg-white hover:bg-red-50 rounded-xl transition-colors border border-green-200 hover:border-red-200 group"
                  >
                    <X className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                  </motion.button>
                </motion.div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-violet-600 via-violet-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 hover:translate-y-[-2px] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg group"
              disabled={loading || !uploadedFile}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Upload className="w-5 h-5 group-hover:translate-y-[-2px] transition-transform" />
                  Upload CV
                </span>
              )}
            </button>

            {/* Helper text */}
            {!uploadedFile && (
              <p className="text-center text-sm text-gray-500">
                Select a file above to enable upload
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
