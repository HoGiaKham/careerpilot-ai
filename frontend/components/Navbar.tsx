'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AuthModal from './AuthModal';
import { toast } from 'react-hot-toast';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Ref dùng để nhận biết hành động click ra ngoài dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hàm giải mã JWT
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const checkLoginState = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      const decoded = parseJwt(token);
      if (decoded && decoded.email) setUserEmail(decoded.email);
    } else {
      setIsLoggedIn(false);
      setUserEmail('');
    }
  };

  useEffect(() => {
    checkLoginState();
    
    // Lắng nghe sự kiện click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    checkLoginState();
    setIsDropdownOpen(false);
    toast.success('Đã đăng xuất thành công!');
  };

  return (
    <>
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        {/* Click vào logo quay về /dashboard */}
        <Link href="/">
          <h1 className="text-xl font-extrabold text-blue-600 tracking-tight cursor-pointer hover:opacity-80 transition-opacity">
            CareerPilot AI
          </h1>
        </Link>
        
        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <button 
              onClick={() => setIsAuthModalOpen(true)} 
              className="bg-blue-50 text-blue-600 px-6 py-2.5 rounded-full font-bold hover:bg-blue-100 transition-colors cursor-pointer active:scale-95"
            >
              Đăng nhập
            </button>
          ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-sm font-semibold text-gray-700 max-w-[180px] truncate">
                {userEmail || 'Thành viên'}
              </span>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                <Link href="/history" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors" onClick={() => setIsDropdownOpen(false)}>
                  <span>📋</span> <span>Lịch sử phân tích</span>
                </Link>
                <Link href="/my-cvs" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors" onClick={() => setIsDropdownOpen(false)}>
                  <span>📄</span> <span>Quản lý CV</span>
                </Link>
                <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors" onClick={() => setIsDropdownOpen(false)}>
                  <span>👤</span> <span>Hồ sơ cá nhân</span>
                </Link>
                <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors" onClick={() => setIsDropdownOpen(false)}>
                  <span>⚙️</span> <span>Cài đặt</span>
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <span>🚪</span> <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
          )}
        </div>
      </nav>

      {/* Modal Đăng nhập đã được dời về đây, quản lý bởi Navbar */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={() => {
          setIsAuthModalOpen(false);
          checkLoginState();
          alert('Đăng nhập thành công!');
        }}
      />
    </>
  );
}