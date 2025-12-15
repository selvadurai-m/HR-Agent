'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  AlertTriangle,
  RefreshCw,
  User,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

// Configuration
const CONFIG = {
  FACE_CHECK_INTERVAL: 2000, // Check face every 2 seconds
  WARNING_THRESHOLD: 15, // Show warning after 15 seconds without face
  EXIT_THRESHOLD: 60, // Exit after 60 seconds without face
  CAMERA_RETRY_LIMIT: 3, // Max retries for camera access
};

/**
 * VideoPanel - Video component with face detection, camera controls, and monitoring
 */
export default function VideoPanel({
  userName = 'Candidate',
  onCameraError,
  onFaceNotDetected,
  onExitInterview,
  isInterviewActive = true,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const faceCheckIntervalRef = useRef(null);
  const noFaceTimerRef = useRef(null);

  // Video/Audio states
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Face detection states
  const [isFaceDetected, setIsFaceDetected] = useState(true);
  const [noFaceSeconds, setNoFaceSeconds] = useState(0);
  const [showRetryPrompt, setShowRetryPrompt] = useState(false);
  const [faceDetectionEnabled, setFaceDetectionEnabled] = useState(true);

  // Permission states
  const [permissionStatus, setPermissionStatus] = useState({
    camera: 'pending',
    microphone: 'pending',
  });

  // Track if component is mounted
  const isMountedRef = useRef(true);
  // Track if media has been initialized to prevent duplicate requests
  const isInitializedRef = useRef(false);

  /**
   * Initialize camera and microphone
   */
  const initializeMedia = useCallback(async () => {
    // Prevent duplicate initialization
    if (isInitializedRef.current && streamRef.current) {
      logger.log('Media already initialized, skipping');
      return true;
    }

    try {
      setCameraError(null);
      setIsVideoReady(false);

      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // Request permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: true,
      });

      // Check if component is still mounted
      if (!isMountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return false;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Use onloadedmetadata event instead of direct play()
        await new Promise((resolve, reject) => {
          const video = videoRef.current;
          if (!video) {
            reject(new Error('Video element not found'));
            return;
          }

          video.onloadedmetadata = () => {
            video
              .play()
              .then(resolve)
              .catch((err) => {
                // Ignore AbortError - it happens when stream is replaced
                if (err.name === 'AbortError') {
                  logger.log('Video play aborted (stream replaced)');
                  resolve();
                } else {
                  reject(err);
                }
              });
          };

          video.onerror = () => reject(new Error('Video loading error'));
        });

        if (isMountedRef.current) {
          isInitializedRef.current = true;
          setIsVideoReady(true);
          setPermissionStatus({ camera: 'granted', microphone: 'granted' });
          logger.log('✅ Camera and microphone initialized');
        }
      }

      return true;
    } catch (err) {
      // Ignore AbortError - it's expected when reinitializing
      if (err.name === 'AbortError') {
        logger.log('Media initialization aborted');
        return false;
      }

      logger.error('Media initialization error:', err);

      let errorMessage = 'Failed to access camera';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera/microphone permission denied';
        setPermissionStatus({ camera: 'denied', microphone: 'denied' });
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera or microphone found';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is being used by another application';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Camera constraints could not be satisfied';
      }

      if (isMountedRef.current) {
        setCameraError(errorMessage);
        onCameraError?.(errorMessage);
      }
      return false;
    }
  }, [onCameraError]);

  /**
   * Simple face detection using canvas brightness analysis
   * This is a lightweight approach - for production, consider using TensorFlow.js or face-api.js
   */
  const detectFace = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isCameraOn) return true;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx || video.videoWidth === 0) return true;

    // Set canvas size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current frame
    ctx.drawImage(video, 0, 0);

    // Get image data from the center region (where face should be)
    const centerX = canvas.width * 0.25;
    const centerY = canvas.height * 0.1;
    const regionWidth = canvas.width * 0.5;
    const regionHeight = canvas.height * 0.6;

    try {
      const imageData = ctx.getImageData(
        centerX,
        centerY,
        regionWidth,
        regionHeight
      );
      const data = imageData.data;

      // Analyze skin tone presence (simplified)
      let skinPixels = 0;
      let totalPixels = 0;

      for (let i = 0; i < data.length; i += 16) {
        // Sample every 4th pixel for performance
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Simple skin tone detection (works for various skin tones)
        // This checks for warm tones typical of human skin
        const isSkinTone =
          r > 60 &&
          r < 255 &&
          g > 40 &&
          g < 230 &&
          b > 20 &&
          b < 200 &&
          r > g &&
          r > b &&
          Math.abs(r - g) > 10;

        if (isSkinTone) skinPixels++;
        totalPixels++;
      }

      const skinRatio = skinPixels / totalPixels;

      // If more than 5% skin-like pixels detected, assume face is present
      return skinRatio > 0.05;
    } catch (err) {
      logger.error('Face detection error:', err);
      return true; // Assume face is present on error
    }
  }, [isCameraOn]);

  /**
   * Check for face presence periodically
   */
  const startFaceDetection = useCallback(() => {
    if (faceCheckIntervalRef.current) {
      clearInterval(faceCheckIntervalRef.current);
    }

    faceCheckIntervalRef.current = setInterval(() => {
      if (!faceDetectionEnabled || !isInterviewActive) return;

      const facePresent = detectFace();
      setIsFaceDetected(facePresent);

      if (!facePresent) {
        setNoFaceSeconds((prev) => {
          const newValue = prev + CONFIG.FACE_CHECK_INTERVAL / 1000;

          // Show warning after threshold
          if (newValue >= CONFIG.WARNING_THRESHOLD && !showRetryPrompt) {
            setShowRetryPrompt(true);
            toast.warning(
              'Face not detected! Please ensure you are visible on camera.'
            );
            onFaceNotDetected?.();
          }

          // Exit after exit threshold
          if (newValue >= CONFIG.EXIT_THRESHOLD) {
            toast.error(
              'Interview ended due to prolonged absence from camera.'
            );
            onExitInterview?.('face_not_detected');
            return newValue;
          }

          return newValue;
        });
      } else {
        // Reset counter when face is detected
        setNoFaceSeconds(0);
        setShowRetryPrompt(false);
      }
    }, CONFIG.FACE_CHECK_INTERVAL);
  }, [
    detectFace,
    faceDetectionEnabled,
    isInterviewActive,
    showRetryPrompt,
    onFaceNotDetected,
    onExitInterview,
  ]);

  /**
   * Toggle camera on/off
   */
  const toggleCamera = useCallback(() => {
    if (!streamRef.current) return;

    const videoTracks = streamRef.current.getVideoTracks();
    videoTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsCameraOn((prev) => !prev);

    if (!isCameraOn) {
      toast.success('Camera turned on');
    } else {
      toast.info('Camera turned off');
    }
  }, [isCameraOn]);

  /**
   * Toggle microphone on/off
   */
  const toggleMic = useCallback(() => {
    if (!streamRef.current) return;

    const audioTracks = streamRef.current.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsMicOn((prev) => !prev);

    if (!isMicOn) {
      toast.success('Microphone unmuted');
    } else {
      toast.info('Microphone muted');
    }
  }, [isMicOn]);

  /**
   * Retry camera access
   */
  const retryCamera = useCallback(async () => {
    if (retryCount >= CONFIG.CAMERA_RETRY_LIMIT) {
      toast.error('Maximum retry attempts reached');
      onExitInterview?.('camera_error');
      return;
    }

    setRetryCount((prev) => prev + 1);
    toast.info('Retrying camera access...');

    // Stop existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    const success = await initializeMedia();
    if (success) {
      setNoFaceSeconds(0);
      setShowRetryPrompt(false);
    }
  }, [retryCount, initializeMedia, onExitInterview]);

  /**
   * Handle retry when face not detected
   */
  const handleRetryFaceDetection = useCallback(() => {
    setNoFaceSeconds(0);
    setShowRetryPrompt(false);
    toast.info('Face detection reset. Please stay visible on camera.');
  }, []);

  // Initialize media on mount - only once
  useEffect(() => {
    isMountedRef.current = true;

    // Only initialize if not already done
    if (!isInitializedRef.current) {
      initializeMedia();
    }

    return () => {
      // Mark as unmounted first
      isMountedRef.current = false;
      isInitializedRef.current = false;

      // Cleanup streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // Clear video source
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      // Clear intervals
      if (faceCheckIntervalRef.current) {
        clearInterval(faceCheckIntervalRef.current);
      }
      if (noFaceTimerRef.current) {
        clearInterval(noFaceTimerRef.current);
      }
    };
  }, []); // Empty dependency array - only run on mount/unmount

  // Start face detection when video is ready
  useEffect(() => {
    if (isVideoReady && isInterviewActive) {
      startFaceDetection();
    }

    return () => {
      if (faceCheckIntervalRef.current) {
        clearInterval(faceCheckIntervalRef.current);
      }
    };
  }, [isVideoReady, isInterviewActive, startFaceDetection]);

  // Calculate warning progress
  const warningProgress = Math.min(
    (noFaceSeconds / CONFIG.EXIT_THRESHOLD) * 100,
    100
  );

  return (
    <div className="relative w-full h-full">
      {/* Hidden canvas for face detection */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Video container */}
      <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
        {/* Video element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}
        />

        {/* Camera off overlay */}
        {!isCameraOn && isVideoReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800">
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mb-3">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-400 text-sm">Camera is off</p>
          </div>
        )}

        {/* Camera error overlay */}
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 p-6">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <CameraOff className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-400 font-medium text-center mb-2">
              {cameraError}
            </p>
            <p className="text-gray-400 text-sm text-center mb-4">
              Please check your camera permissions and try again
            </p>
            <Button
              onClick={retryCamera}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry ({CONFIG.CAMERA_RETRY_LIMIT - retryCount} attempts left)
            </Button>
          </div>
        )}

        {/* Loading state */}
        {!isVideoReady && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600 mb-4"></div>
            <p className="text-gray-400">Initializing camera...</p>
          </div>
        )}

        {/* Face detection status indicator */}
        {isVideoReady && isCameraOn && (
          <div
            className={`absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
              isFaceDetected
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
            }`}
          >
            {isFaceDetected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Face Detected</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" />
                <span>Face Not Detected</span>
              </>
            )}
          </div>
        )}

        {/* User name badge */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg">
          <p className="text-white text-sm font-medium">{userName}</p>
        </div>

        {/* Video controls */}
        {isVideoReady && (
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button
              onClick={toggleMic}
              className={`p-2.5 rounded-full transition-all duration-200 ${
                isMicOn
                  ? 'bg-gray-700/80 hover:bg-gray-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
            >
              {isMicOn ? (
                <Mic className="w-4 h-4" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={toggleCamera}
              className={`p-2.5 rounded-full transition-all duration-200 ${
                isCameraOn
                  ? 'bg-gray-700/80 hover:bg-gray-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isCameraOn ? (
                <Video className="w-4 h-4" />
              ) : (
                <VideoOff className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Face not detected warning overlay */}
      {showRetryPrompt && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 animate-fade-in z-10">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Face Not Detected
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Please ensure your face is visible on camera. The interview will
              end automatically if you remain undetected.
            </p>

            {/* Warning progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Time remaining</span>
                <span>
                  {Math.max(CONFIG.EXIT_THRESHOLD - noFaceSeconds, 0)}s
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-red-500 transition-all duration-1000"
                  style={{ width: `${warningProgress}%` }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleRetryFaceDetection}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                I&apos;m Here
              </Button>
              <Button
                onClick={() => onExitInterview?.('user_exit')}
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              >
                Exit Interview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
