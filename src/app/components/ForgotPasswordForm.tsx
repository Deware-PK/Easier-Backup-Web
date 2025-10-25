'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!code.trim()) {
      setError('Recovery code is required.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/v1/auth/reset-with-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          code: code.trim(), 
          password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess(true);
    } catch (err: unknown) { // MARK: FIX(any)->unknown
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again later.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-semibold mb-2">Reset Password</h1>
        <p className="text-sm text-gray-400 mb-6">
          Enter your email, new password, and recovery code to reset your password.
        </p>

        {success ? (
          <div className="space-y-6">
            <div className="p-3 rounded border border-green-500/50 bg-green-900/20 text-sm text-green-200">
              If the data is valid, your password has been reset successfully.
            </div>
            <div className="text-sm text-center">
              <Link href="/login" className="text-orange-400 hover:text-orange-300">
                Go to login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email address</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-white focus:border-white transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">New Password</label>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-white focus:border-white transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-white focus:border-white transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Recovery Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-white focus:border-white transition-colors font-mono"
                placeholder="A1B2C3D4E5F6"
                maxLength={12}
              />
              <p className="text-xs text-gray-500 mt-1">Enter the 12-character recovery code</p>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password || !confirmPassword || !code.trim()}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white py-2 rounded transition-colors"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>

            <div className="text-sm text-center">
              <Link href="/login" className="text-orange-400 hover:text-orange-300">
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}