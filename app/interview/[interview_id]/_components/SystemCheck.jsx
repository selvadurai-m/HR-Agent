'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Volume2,
  RefreshCw,
  Monitor,
  Wifi,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/**
 * SystemCheck - Pre-interview system requirements check
 * Verifies camera, microphone, and browser compatibility
 */
export default function SystemCheck({ onAllChecksPassed, onSkip }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [checks, setChecks] = useState({
    browser: { status: 'checking', message: 'Checking browser compatibility...' },
    camera: { status: 'pending', message: 'Camera not checked yet' },
    microphone: { status: 'pending', message: 'Microphone not checked yet' },
    audioLevel: { status: 'pending', message: 'Audio level not tested' },
  });

  const [cameraPreview, setCameraPreview] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [isTestingAudio, setIsTestingAudio] = useState(false);

  /**
   * Check browser compatibility
   */
  const checkBrowser = useCallback(() => {
    const isCompatible =
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function';

    const isSecure = 
      typeof window !== 'undefined' && 
      (window.location.protocol === 'https:' || window.location.hostname === 'localhost');

    if (!isSecure) {
      setChecks((prev) => ({
        ...prev,
        browser: {
          status: 'failed',
          message: 'HTTPS required for camera access',
        },
      }));
      return false;
    }

    if (isCompatible) {
      setChecks((prev) => ({
        ...prev,
        browser: {
          status: 'passed',
          message: 'Browser is compatible',
        },
      }));
      return true;
    } else {
      setChecks((prev) => ({
        ...prev,
        browser: {
          status: 'failed',
          message: 'Browser does not support required features',
        },
      }));
      return false;
    }
  }, []);

  /**
   * Check camera access and preview
   */
  const checkCamera = useCallback(async () => {
    setChecks((prev) => ({
      ...prev,
      camera: { status: 'checking', message: 'Requesting camera access...' },
    }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraPreview(true);
      }

      setChecks((prev) => ({
        ...prev,
        camera: { status: 'passed', message: 'Camera is working' },
      }));

      return true;
    } catch (err) {
      let message = 'Camera access failed';
      if (err.name === 'NotAllowedError') {
        message = 'Camera permission denied. Please allow camera access.';
      } else if (err.name === 'NotFoundError') {
        message = 'No camera found on this device';
      } else if (err.name === 'NotReadableError') {
        message = 'Camera is being used by another application';
      }

      setChecks((prev) => ({
        ...prev,
        camera: { status: 'failed', message },
      }));

      return false;
    }
  }, []);

  /**
   * Check microphone access and audio levels
   */
  const checkMicrophone = useCallback(async () => {
    setChecks((prev) => ({
      ...prev,
      microphone: { status: 'checking', message: 'Requesting microphone access...' },
    }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Add audio tracks to existing stream
      if (streamRef.current) {
        stream.getAudioTracks().forEach((track) => {
          streamRef.current.addTrack(track);
        });
      } else {
        streamRef.current = stream;
      }

      // Set up audio analysis
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      setChecks((prev) => ({
        ...prev,
        microphone: { status: 'passed', message: 'Microphone is working' },
      }));

      // Start monitoring audio levels
      setIsTestingAudio(true);
      monitorAudioLevel();

      return true;
    } catch (err) {
      let message = 'Microphone access failed';
      if (err.name === 'NotAllowedError') {
        message = 'Microphone permission denied. Please allow microphone access.';
      } else if (err.name === 'NotFoundError') {
        message = 'No microphone found on this device';
      }

      setChecks((prev) => ({
        ...prev,
        microphone: { status: 'failed', message },
      }));

      return false;
    }
  }, []);

  /**
   * Monitor audio levels to verify microphone is picking up sound
   */
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const updateLevel = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const normalizedLevel = Math.min(average / 128, 1);
      setMicLevel(normalizedLevel);

      // If we detect sound above threshold, mark audio level as passed
      if (normalizedLevel > 0.1) {
        setChecks((prev) => {
          if (prev.audioLevel.status !== 'passed') {
            return {
              ...prev,
              audioLevel: { status: 'passed', message: 'Audio input detected' },
            };
          }
          return prev;
        });
      }

      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  }, []);

  /**
   * Run all checks sequentially
   */
  const runAllChecks = useCallback(async () => {
    const browserOk = checkBrowser();
    if (!browserOk) return;

    await checkCamera();
    await checkMicrophone();

    // Set initial audio level status
    setChecks((prev) => ({
      ...prev,
      audioLevel: { 
        status: 'checking', 
        message: 'Speak to test your microphone...' 
      },
    }));
  }, [checkBrowser, checkCamera, checkMicrophone]);

  /**
   * Retry failed checks
   */
  const retryCheck = async (checkType) => {
    if (checkType === 'camera') {
      await checkCamera();
    } else if (checkType === 'microphone') {
      await checkMicrophone();
    } else if (checkType === 'browser') {
      checkBrowser();
    }
  };

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  /**
   * Start checks on mount
   */
  useEffect(() => {
    runAllChecks();
  }, [runAllChecks]);

  /**
   * Check if all tests passed
   */
  const allPassed = 
    checks.browser.status === 'passed' &&
    checks.camera.status === 'passed' &&
    checks.microphone.status === 'passed';

  const hasFailures = 
    checks.browser.status === 'failed' ||
    checks.camera.status === 'failed' ||
    checks.microphone.status === 'failed';

  /**
   * Render status icon
   */
  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'checking':
        return (
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        );
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-200" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-violet-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-violet-600 p-6 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Monitor className="w-6 h-6" />
          System Check
        </h2>
        <p className="text-violet-100 text-sm mt-1">
          Let&apos;s make sure everything is working before your interview
        </p>
      </div>

      <div className="p-6">
        {/* Camera Preview */}
        <div className="mb-6">
          <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${!cameraPreview ? 'hidden' : ''}`}
            />
            {!cameraPreview && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <CameraOff className="w-12 h-12 mb-2" />
                <p className="text-sm">Camera preview unavailable</p>
              </div>
            )}

            {/* Audio level indicator */}
            {isTestingAudio && (
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                  <Volume2 className="w-4 h-4 text-white" />
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-100"
                      style={{ width: `${micLevel * 100}%` }}
                    />
                  </div>
                  <span className="text-white text-xs">
                    {micLevel > 0.1 ? 'Detected' : 'Speak now'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Check Items */}
        <div className="space-y-3 mb-6">
          {/* Browser Check */}
          <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
            checks.browser.status === 'passed' 
              ? 'bg-emerald-50 border-emerald-200' 
              : checks.browser.status === 'failed'
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <Wifi className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-800">Browser Compatibility</p>
                <p className="text-sm text-gray-500">{checks.browser.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon status={checks.browser.status} />
              {checks.browser.status === 'failed' && (
                <Button size="sm" variant="ghost" onClick={() => retryCheck('browser')}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Camera Check */}
          <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
            checks.camera.status === 'passed' 
              ? 'bg-emerald-50 border-emerald-200' 
              : checks.camera.status === 'failed'
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-800">Camera Access</p>
                <p className="text-sm text-gray-500">{checks.camera.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon status={checks.camera.status} />
              {checks.camera.status === 'failed' && (
                <Button size="sm" variant="ghost" onClick={() => retryCheck('camera')}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Microphone Check */}
          <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
            checks.microphone.status === 'passed' 
              ? 'bg-emerald-50 border-emerald-200' 
              : checks.microphone.status === 'failed'
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-800">Microphone Access</p>
                <p className="text-sm text-gray-500">{checks.microphone.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon status={checks.microphone.status} />
              {checks.microphone.status === 'failed' && (
                <Button size="sm" variant="ghost" onClick={() => retryCheck('microphone')}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Audio Level Check */}
          <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
            checks.audioLevel.status === 'passed' 
              ? 'bg-emerald-50 border-emerald-200' 
              : checks.audioLevel.status === 'failed'
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-800">Audio Input Test</p>
                <p className="text-sm text-gray-500">{checks.audioLevel.message}</p>
              </div>
            </div>
            <StatusIcon status={checks.audioLevel.status} />
          </div>
        </div>

        {/* Warning message if there are failures */}
        {hasFailures && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Some checks failed</p>
              <p className="text-sm text-amber-700">
                Please resolve the issues above or proceed with limited functionality.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => {
              // Stop streams before proceeding
              if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
              }
              onAllChecksPassed?.();
            }}
            disabled={!allPassed && hasFailures}
            className="flex-1 bg-gradient-to-r from-violet-600 to-violet-600 hover:from-violet-700 hover:to-violet-700 text-white h-12"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            {allPassed ? 'All Checks Passed - Continue' : 'Continue to Interview'}
          </Button>
          
          {hasFailures && (
            <Button
              variant="outline"
              onClick={() => {
                if (streamRef.current) {
                  streamRef.current.getTracks().forEach((track) => track.stop());
                }
                onSkip?.();
              }}
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Skip Checks
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
