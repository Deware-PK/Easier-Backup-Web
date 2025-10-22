'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();

  // --- State Management ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [apiError, setApiError] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);

  // --- Functions ---
  const validateEmail = (emailToValidate: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToValidate);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError('');
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'; 


    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    
    setEmailError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/v1/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      console.log('Response data:', JSON.stringify(data));

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      Cookies.set('SESSION_TOKEN__DO_NOT_SHARE', data.token, {
        expires: 1,
        path: '/',
        sameSite: 'lax',
      });
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      Cookies.set('SESSION_EXPIRES_AT', String(expiresAt), {
        expires: 1,
        path: '/',
        sameSite: 'lax',
      });

      localStorage.setItem('username', JSON.stringify(data.username).toString().replace(/"/g, ''));

      try {
        const statusRes = await fetch(`${backendUrl}/api/v1/auth/recovery-codes-status`, {
          headers: { Authorization: `Bearer ${data.token}` },
        });

        if (!statusRes.ok) {
          throw new Error('Failed to check recovery codes status');
        }

        const status = await statusRes.json();
        console.log('Recovery codes status:', status);

        if (status.recovery_codes_viewed === false) {
          router.push('/recovery-codes');
        } else {
          router.push('/home');
        }
        
      } catch (statusErr) {
        console.error('Failed to fetch recovery status:', statusErr);

        // fallback
        router.push('/home');
      }

    } catch (error: any) {
      console.error('Login failed:', error);
      setApiError(error.message);
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 sm:p-6">
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 space-y-6 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-orange-700 rounded-full flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Backup Icon"
              width={40}
              height={40}
            />
            
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-center text-white">
          Welcome Back
        </h2>
        <p className="text-center text-gray-400">
          Log in to continue to your account.
        </p>

        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          {apiError && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-md text-center">
              {apiError}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              placeholder="you@example.com"

              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm bg-gray-700 text-white placeholder-gray-400 transition-colors duration-200 ${
                emailError
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-600 focus:border-orange-500 focus:ring-orange-500'
              }`}
              autoComplete="email"
            />

            {emailError && (
              <p className="mt-2 text-sm text-red-500">{emailError}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <a href="/forgot-password" className="text-sm text-orange-400 hover:text-orange-300 font-medium">
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm bg-gray-700 text-white placeholder-gray-400 transition-colors duration-200"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200 disabled:bg-orange-800 disabled:cursor-not-allowed"
          >

            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Log In'
            )}
          </button>
          <div>
            <p className="text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-orange-400 hover:text-orange-300 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};