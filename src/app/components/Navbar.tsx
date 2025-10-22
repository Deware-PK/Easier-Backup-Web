'use client';

import Link from 'next/link';
import Cookies from 'js-cookie';
import { useState, useEffect, useRef } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa'; // ตัวอย่างจาก Font Awesome
import { TiCloudStorage } from "react-icons/ti";
import { MdKeyboardArrowDown } from "react-icons/md";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userName = localStorage.getItem('username');

  const handleLogout = () => {
    Cookies.remove('SESSION_TOKEN__DO_NOT_SHARE');
    Cookies.remove('SESSION_EXPIRES_AT');
    localStorage.removeItem('username');
    window.location.href = '/login';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuRef]);

  return (
    <nav className="bg-gray-800 text-white shadow-lg relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ส่วน Logo และชื่อแอป */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3">
              {/* 👇 2. ใช้ไอคอน Logo จาก react-icons */}
              <TiCloudStorage className="w-8 h-8" /> 
              <span className="font-semibold text-xl tracking-tight">Easier Backup</span>
            </Link>
          </div>

          {/* เมนูสำหรับหน้าจอขนาดใหญ่ */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/home" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Home</Link>
            <Link href="/tasks" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Tasks</Link>
            <Link href="/reports" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Reports</Link>
            <span className="text-xl text-gray-400">|</span>
            <div className="relative ml-auto" ref={userMenuRef}> {/* 👈 เพิ่ม relative และ ref */}
              {/* ปุ่มเปิด/ปิด Dropdown */}
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-1 focus:outline-none"
              >
                <span className="text-sm text-gray-300 cursor-pointer">Welcome, {userName}</span>
                <MdKeyboardArrowDown className={`text-xl cursor-pointer transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} /> {/* หมุนลูกศร */}
              </button>


              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-50"> {/* 👈 จัดตำแหน่งและสไตล์ Dropdown */}

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-red-400/20 hover:text-red-700"
                  >Sign Out</button>
                </div>
              )}
            </div>
          </div>

          {/* ปุ่มเมนูสำหรับหน้าจอขนาดเล็ก */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {/* 👇 4. ใช้ไอคอน Menu/Close จาก react-icons */}
              {isMobileMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          {/* ลิงก์เมนู */}
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Dashboard</Link>
            <Link href="/tasks" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Tasks</Link>
            <Link href="/reports" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Reports</Link>
          </div>

          {/* ส่วน User Info และ Logout */}
          <div className="pt-4 pb-3 border-t border-gray-700">
            {/* User Info */}
            <div className="flex items-center px-5 mb-3">
              <div className="">
                <div className="text-base font-medium leading-none text-white">Welcome, {userName}</div>
              </div>
            </div>
            {/* ปุ่ม Logout */}
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