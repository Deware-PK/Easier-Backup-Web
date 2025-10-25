"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { TiCloudStorage } from "react-icons/ti";
import { MdKeyboardArrowDown } from "react-icons/md";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const response = await fetch(`${backendUrl}/api/v1/users/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.warn('[Logout] API failed, but clearing local session anyway');
      }

      sessionStorage.removeItem('username');
      window.location.href = '/login';
      
    } catch (error) {
      console.error('[Logout] Error calling logout API:', error);
      
      sessionStorage.removeItem('username');
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuRef]);

  // MARK: FIX - อ่าน sessionStorage ใน useEffect (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserName(sessionStorage.getItem("username"));
    }
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const s = await fetch(`${backendUrl}/api/v1/admin/stats`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (s.ok) {
          setIsAdmin(true);
        }
      } catch {
        // Not admin or error, do nothing
      }
    };
    checkAdmin();
  }, [backendUrl]);

  return (
    <nav className="bg-gray-800 text-white shadow-lg relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3">
              <TiCloudStorage className="w-8 h-8" />
              <span className="font-semibold text-xl tracking-tight">Easier Backup</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/home" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
              Home
            </Link>
            <Link href="/tasks" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
              Tasks
            </Link>
            <Link href="/reports" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
              Reports
            </Link>
            {isAdmin && (
              <Link href="/audit-logs" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                Audit Logs
              </Link>
            )}
            <span className="text-xl text-gray-400">|</span>
            <div className="relative ml-auto" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-1 focus:outline-none"
              >
                <span className="text-sm text-gray-300 cursor-pointer">
                  Welcome, {userName || 'Guest'}
                </span>
                <MdKeyboardArrowDown
                  className={`text-xl cursor-pointer transition-transform duration-200 ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-50">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-red-400/20 hover:text-red-700"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/home" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
              Home
            </Link>
            <Link href="/tasks" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
              Tasks
            </Link>
            <Link href="/reports" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
              Reports
            </Link>
            {isAdmin && (
              <Link href="/audit-logs" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                Audit Logs
              </Link>
            )}
          </div>

          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="flex items-center px-5 mb-3">
              <div>
                <div className="text-base font-medium leading-none text-white">
                  Welcome, {userName || 'Guest'}
                </div>
              </div>
            </div>
            <div className="px-2 space-y-1">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-700 hover:bg-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}