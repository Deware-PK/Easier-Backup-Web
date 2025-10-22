'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterForm() {
  const router = useRouter();

  // --- State Management ---
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- Validation Functions ---
  const validateEmail = (emailToValidate: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToValidate);
  };

  const validateUsername = (usernameToValidate: string) => {
    return usernameToValidate.trim().length >= 3;
  };

  const validatePassword = (passwordToValidate: string) => {
    return passwordToValidate.length >= 8;
  };

  const validateConfirmPassword = () => {
    return password === confirmPassword;
  };

  // --- Handle Submit ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError('');
    
    // Reset errors
    setUsernameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    
    let hasError = false;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'; 

    // Validate username
    if (!validateUsername(username)) {
      setUsernameError('Username must be at least 3 characters.');
      hasError = true;
    }

    // Validate email
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      hasError = true;
    }

    // Validate password
    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters.');
      hasError = true;
    }

    // Validate confirm password
    if (!validateConfirmPassword()) {
      setConfirmPasswordError('Passwords do not match.');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/v1/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      console.log('Response data:', JSON.stringify(data));

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      router.push('/login?registered=1');
      return;

    } catch (error: any) {
      console.error('Registration failed:', error);
      setApiError(error.message);
    } finally {
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
          Create Account
        </h2>
        <p className="text-center text-gray-400">
          Sign up to get started with your account.
        </p>

        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          {apiError && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-md text-center">
              {apiError}
            </div>
          )}

          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (usernameError) setUsernameError('');
              }}
              placeholder="yourusername"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm bg-gray-700 text-white placeholder-gray-400 transition-colors duration-200 ${
                usernameError
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-600 focus:border-orange-500 focus:ring-orange-500'
              }`}
              autoComplete="username"
            />
            {usernameError && (
              <p className="mt-2 text-sm text-red-500">{usernameError}</p>
            )}
          </div>

          {/* Email Field */}
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

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
                if (confirmPassword && confirmPasswordError) {
                  setConfirmPasswordError('');
                }
              }}
              placeholder="••••••••"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm bg-gray-700 text-white placeholder-gray-400 transition-colors duration-200 ${
                passwordError
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-600 focus:border-orange-500 focus:ring-orange-500'
              }`}
              autoComplete="new-password"
            />
            {passwordError && (
              <p className="mt-2 text-sm text-red-500">{passwordError}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-300"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmPasswordError) setConfirmPasswordError('');
              }}
              placeholder="••••••••"
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm sm:text-sm bg-gray-700 text-white placeholder-gray-400 transition-colors duration-200 ${
                confirmPasswordError
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-600 focus:border-orange-500 focus:ring-orange-500'
              }`}
              autoComplete="new-password"
            />
            {confirmPasswordError && (
              <p className="mt-2 text-sm text-red-500">{confirmPasswordError}</p>
            )}
          </div>

          {/* Submit Button */}
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
              'Sign Up'
            )}
          </button>

          {/* Link to Login */}
          <div>
            <p className="text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}