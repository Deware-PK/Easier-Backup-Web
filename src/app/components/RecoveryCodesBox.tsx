'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MdContentCopy, MdCheckCircle, MdWarning } from 'react-icons/md';

interface RecoveryCodesResponse {
  codes: string[];
}

interface RecoveryCodesStatusResponse {
  recovery_codes_viewed: boolean;
  has_active_codes: boolean;
  active_codes_count: number;
}

const COUNTDOWN_DURATION = 30;

// MARK: CONFIG - ถ้า API ของคุณต้องการค่า "false" หลังแสดงเสร็จ ให้เปลี่ยนเป็น false
const MARK_VIEWED_VALUE = true; // ← เปลี่ยนเป็น false ถ้า API ต้องการ

export default function RecoveryCodesBox() {
  const [codes, setCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_DURATION);
  const router = useRouter();
  const hasMarkedViewed = useRef(false);

  useEffect(() => {
    const fetchCodes = async () => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      try {
        const statusRes = await fetch(`${backendUrl}/api/v1/auth/recovery-codes-status`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (!statusRes.ok) throw new Error('Failed to check recovery codes status');
        const status: RecoveryCodesStatusResponse = await statusRes.json();

        if (status.recovery_codes_viewed === true) {
          router.push('/home');
          return;
        }
        const codesRes = await fetch(`${backendUrl}/api/v1/auth/recovery-codes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!codesRes.ok) {
          throw new Error('Failed to fetch recovery codes');
        }

        const codesData: RecoveryCodesResponse = await codesRes.json();
        setCodes(codesData.codes);

      } catch (err: unknown) { // FIX: no-explicit-any
        console.error('❌ Error:', err);
        const msg = err instanceof Error ? err.message : 'Failed to load recovery codes';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCodes();
  }, [router]);

  const markAsViewedAndRedirect = useCallback(async () => {
    if (hasMarkedViewed.current) return;
    hasMarkedViewed.current = true;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    try {
      await fetch(`${backendUrl}/api/v1/auth/recovery-codes-viewed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ viewed: MARK_VIEWED_VALUE }),
        credentials: 'include',
      });
    } catch (err) {
      console.error('❌ Failed to mark as viewed:', err);
    } finally {
      router.push('/login');
    }
  }, [router]);

  // timer effect
  useEffect(() => {
    if (isLoading) return;
    if (timeLeft === 0) {
      markAsViewedAndRedirect();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isLoading, markAsViewedAndRedirect]); // FIX: add dependency

  const handleCopyToClipboard = async () => {
    const codesText = codes.join(', ');
    
    try {
      await navigator.clipboard.writeText(codesText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleBackToHome = () => {
    markAsViewedAndRedirect();
  };

  const progressPercentage = (timeLeft / COUNTDOWN_DURATION) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md">
          <MdWarning className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={handleBackToHome}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Recovery Codes
          </h1>
          <p className="text-gray-400 text-sm">
            Save these codes in a secure location. You&apos;ll need them to recover your account. {/* FIX apostrophe */}
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 mb-6 flex items-start">
          <MdWarning className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-200">
            <p className="font-semibold mb-1">Important!</p>
            <p>These codes will only be shown once. Make sure to copy and store them safely.</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Auto-close in:</span>
            <span className="text-sm font-semibold text-white">{timeLeft}s</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                timeLeft <= 10 ? 'bg-red-500' : timeLeft <= 20 ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Recovery Codes Grid */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {codes.map((code, index) => (
              <div
                key={index}
                className="bg-gray-800 border border-gray-700 rounded-md px-4 py-3 font-mono text-sm text-gray-300 text-center"
              >
                {code}
              </div>
            ))}
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopyToClipboard}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center mb-4"
        >
          {isCopied ? (
            <>
              <MdCheckCircle className="w-5 h-5 mr-2" />
              Copied to Clipboard!
            </>
          ) : (
            <>
              <MdContentCopy className="w-5 h-5 mr-2" />
              Copy All Codes
            </>
          )}
        </button>

        {/* Back to Login Link */}
        <div className="text-center">
          <button
            onClick={handleBackToHome}
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors underline"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}