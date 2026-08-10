'use client';

import { useState, useEffect } from 'react';
import { signInWithPopup, AuthProvider } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../src/lib/firebase';
import toast from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageProvider';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  closeOnOutsideClick?: boolean;
}

export default function AuthModal({ isOpen, onClose, onSuccess, closeOnOutsideClick = false }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      setTimeout(() => setIsRendered(false), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isRendered) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (authMode === 'login') {
          localStorage.setItem('token', data.accessToken);
          setEmail('');
          setPassword('');
          onSuccess(); 
        } else {
          toast.success(t.auth.loginSuccess);
          setAuthMode('login');
        }
      } else {
        setAuthError(data.message || t.auth.errorGeneric);
      }
    } catch (error) {
      setAuthError(t.auth.errorServer);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSocialLogin = async (provider: AuthProvider, providerName: string) => {
    setAuthError('');
    setAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const firebaseToken = await user.getIdToken();
      const displayName = user.displayName || user.email?.split('@')[0] || ''; 
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/auth/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: firebaseToken, name: displayName }),
      });

      const data = await response.json();

      if (response.ok && data.accessToken) {
        localStorage.setItem('token', data.accessToken);
        onSuccess();
      } else {
        setAuthError(data.message || t.auth.errorSocial.replace('{provider}', providerName));
      }
      
    } catch (error: any) {
      console.error(error);
      setAuthError(`Lỗi kết nối hoặc hủy đăng nhập: ${error.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-300 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={closeOnOutsideClick ? onClose : undefined} 
    >
      <div 
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative transition-all duration-300 ease-out transform ${
          isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 transition-colors cursor-pointer z-10 p-2 rounded-full hover:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div className="p-8 sm:p-10">
          <div className="mb-8 text-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {authMode === 'login' ? t.auth.loginTitle : t.auth.registerTitle}
            </h3>
            <p className="text-gray-500 text-sm sm:text-base mt-2">
              {authMode === 'login' 
                ? t.auth.loginSubtitle 
                : t.auth.registerSubtitle}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 cursor-pointer">{t.auth.email}</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 cursor-pointer">{t.auth.password}</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {authError && (
              <p className="text-red-500 text-sm font-medium text-center bg-red-50 py-2 rounded-lg border border-red-100">
                {authError}
              </p>
            )}

            <button 
              type="submit" 
              disabled={authLoading}
              className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-3.5 rounded-xl shadow-sm transition-all flex justify-center items-center cursor-pointer mt-3"
            >
              {authLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                authMode === 'login' ? t.auth.submitLogin : t.auth.submitRegister
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-4 text-xs sm:text-sm text-gray-400 font-medium">{t.auth.socialDivider}</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleSocialLogin(googleProvider, 'Google')}
              disabled={authLoading}
              className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M21.35 12.23c0-.79-.07-1.55-.22-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.44h3.14c1.84-1.69 2.92-4.18 2.92-7.4Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.29v2.52A9.74 9.74 0 0 0 12 21.7Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M6.53 13.79A5.85 5.85 0 0 1 6.23 12c0-.62.11-1.22.3-1.79V7.69H3.29A9.72 9.72 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.31l3.24-2.52Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 6.18c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.83 3.28 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.71 5.39l3.24 2.52C7.3 7.9 9.46 6.18 12 6.18Z"
                  />
                </svg>

                <span>Google</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin(facebookProvider, 'Facebook')}
              disabled={authLoading}
              className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="12" fill="#1877F2" />
                  <path
                    fill="white"
                    d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.87.24-1.46 1.5-1.46h1.7V4c-.3-.04-1.33-.13-2.53-.13-2.5 0-4.22 1.53-4.22 4.34V10H7.1v3h2.85v8h3.55Z"
                  />
                </svg>

                <span>Facebook</span>
              </span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-600">
            {authMode === 'login' ? (
              <p>
                {t.auth.noAccount}{' '}
                <button 
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError('');
                  }}
                  className="font-semibold text-black hover:underline cursor-pointer"
                >
                  {t.auth.registerNow}
                </button>
              </p>
            ) : (
              <p>
                {t.auth.haveAccount}{' '}
                <button 
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                  }}
                  className="font-semibold text-black hover:underline cursor-pointer"
                >
                  {t.auth.loginNow}
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}