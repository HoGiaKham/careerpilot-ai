'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthModal from './AuthModal';
import { toast } from 'react-hot-toast';
import { ChevronDown, Globe2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageProvider';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const { lang, setLang, t } = useLanguage();

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
      if (decoded) {
        // Ưu tiên hiển thị tên thật (name), nếu ko có thì lấy phần đầu email, nếu ko có nữa thì "User"
        const displayName = decoded.name || (decoded.email && decoded.email.includes('@') ? decoded.email.split('@')[0] : 'User');
        setUserName(displayName);
      }
    } else {
      setIsLoggedIn(false);
      setUserName('');
    }
  };

  useEffect(() => {
    checkLoginState();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    checkLoginState();
    setIsDropdownOpen(false);
    toast.success(t.navbar.logoutSuccess);
    router.push('/dashboard');
  };

  return (
    <>
      <nav className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-40 transition-colors">
        <Link href="/dashboard">
          <h1 className="text-xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight cursor-pointer hover:opacity-80 transition-opacity">
            CareerPilot AI
          </h1>
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setIsLangOpen((prev) => !prev)}
              className="flex items-center gap-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 rounded-full text-sm font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <Globe2 className="w-4 h-4" />
              <span>{lang === 'vi' ? 'VI' : 'EN'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg py-2 z-50">
                <button
                  onClick={() => { setLang('vi'); setIsLangOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm font-medium ${lang === 'vi' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40' : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800'}`}
                >
                  {t.profile.vietnamese}
                </button>
                <button
                  onClick={() => { setLang('en'); setIsLangOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm font-medium ${lang === 'en' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40' : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800'}`}
                >
                  {t.profile.english}
                </button>
              </div>
            )}
          </div>

          {!isLoggedIn ? (
            <button 
              onClick={() => setIsAuthModalOpen(true)} 
              className="bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 px-6 py-2.5 rounded-full font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer active:scale-95 text-sm"
            >
              {t.navbar.login}
            </button>
          ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-zinc-200 max-w-[180px] truncate">
                {userName || 'Thành viên'}
              </span>
              <svg
                className={`w-4 h-4 text-gray-500 dark:text-zinc-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-800 py-2 z-50">
                <Link 
                  href="/history" 
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" 
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <span>{t.navbar.history}</span>
                </Link>
                <Link 
                  href="/my-cvs" 
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" 
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <span>{t.navbar.myCvs}</span>
                </Link>
                <Link 
                  href="/profile" 
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" 
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <span>{t.navbar.profile}</span>
                </Link>
                <div className="border-t border-gray-100 dark:border-zinc-800 my-1"></div>
                <button 
                  onClick={handleLogout} 
                  className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                >
                  <span>{t.navbar.logout}</span>
                </button>
              </div>
            )}
          </div>
          )}
        </div>
      </nav>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={() => {
          setIsAuthModalOpen(false);
          checkLoginState();
          toast.success(t.navbar.loginSuccess);
        }}
      />
    </>
  );
}