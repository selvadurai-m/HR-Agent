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
    <div className="bg-white rounded-2xl shadow-2xl border border-violet-100 overflow-hidden w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-violet-600 px-4 py-2 text-white">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Monitor className="w-4 h-4" />
          System Check
        </h2>
        <p className="text-violet-100 text-[11px] mt-0.5">
          Let&apos;s make sure everything is working before your interview
        </p>
      </div>

      <div className="p-2.5 space-y-2">
        {/* Camera Preview */}
        <div>
          <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden shadow-md">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] ${!cameraPreview ? 'hidden' : ''}`}
            />
            {!cameraPreview && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <CameraOff className="w-8 h-8 mb-1 opacity-50" />
                <p className="text-[11px] font-medium">Camera unavailable</p>
              </div>
            )}

            {/* Audio level indicator */}
            {isTestingAudio && (
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-md px-2 py-1.5 shadow-lg">
                  <Volume2 className="w-3 h-3 text-white flex-shrink-0" />
                  <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300 ease-in-out"
                      style={{ width: `${micLevel * 100}%` }}
                    />
                  </div>
                  <span className="text-white text-[10px] font-medium min-w-[45px] text-right">
                    {micLevel > 0.1 ? 'Detected' : 'Speak'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Check Items */}
        <div>
          <div className="space-y-1">
            {/* Browser Check */}
            <div className={`flex items-center justify-between p-2 rounded-lg border-2 transition-all ${checks.browser.status === 'passed'
              ? 'bg-emerald-50 border-emerald-200'
              : checks.browser.status === 'failed'
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
              }`}>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Wifi className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-[11px]">Browser Compatibility</p>
                  <p className="text-[10px] text-gray-600 truncate">{checks.browser.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <StatusIcon status={checks.browser.status} />
                {checks.browser.status === 'failed' && (
                  <Button size="sm" variant="ghost" onClick={() => retryCheck('browser')} className="h-6 w-6 p-0">
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Camera Check */}
            <div className={`flex items-center justify-between p-2 rounded-lg border-2 transition-all ${checks.camera.status === 'passed'
              ? 'bg-emerald-50 border-emerald-200'
              : checks.camera.status === 'failed'
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
              }`}>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Camera className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-[11px]">Camera Access</p>
                  <p className="text-[10px] text-gray-600 truncate">{checks.camera.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <StatusIcon status={checks.camera.status} />
                {checks.camera.status === 'failed' && (
                  <Button size="sm" variant="ghost" onClick={() => retryCheck('camera')} className="h-6 w-6 p-0">
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Microphone Check */}
            <div className={`flex items-center justify-between p-2 rounded-lg border-2 transition-all ${checks.microphone.status === 'passed'
              ? 'bg-emerald-50 border-emerald-200'
              : checks.microphone.status === 'failed'
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
              }`}>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Mic className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-[11px]">Microphone Access</p>
                  <p className="text-[10px] text-gray-600 truncate">{checks.microphone.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <StatusIcon status={checks.microphone.status} />
                {checks.microphone.status === 'failed' && (
                  <Button size="sm" variant="ghost" onClick={() => retryCheck('microphone')} className="h-6 w-6 p-0">
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Audio Level Check */}
            <div className={`flex items-center justify-between p-2 rounded-lg border-2 transition-all ${checks.audioLevel.status === 'passed'
              ? 'bg-emerald-50 border-emerald-200'
              : checks.audioLevel.status === 'failed'
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
              }`}>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Volume2 className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-[11px]">Audio Input Test</p>
                  <p className="text-[10px] text-gray-600 truncate">{checks.audioLevel.message}</p>
                </div>
              </div>
              <StatusIcon status={checks.audioLevel.status} />
            </div>
          </div>
        </div>

        {/* Warning message if there are failures */}
        {hasFailures && (
          <div className="flex items-start gap-2 p-2 bg-amber-50 border-2 border-amber-200 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-900 text-[11px]">Some checks failed</p>
              <p className="text-[10px] text-amber-700 mt-0.5">
                Please resolve the issues or proceed with limited functionality.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => {
              // Stop streams before proceeding
              if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
              }
              onAllChecksPassed?.();
            }}
            disabled={!allPassed && hasFailures}
            className="flex-1 bg-gradient-to-r from-violet-600 to-violet-600 hover:from-violet-700 hover:to-violet-700 text-white h-9 text-xs font-semibold shadow-lg shadow-violet-500/25 hover:shadow-xl"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
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
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 h-9 px-4 font-medium text-xs"
            >
              Skip
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
