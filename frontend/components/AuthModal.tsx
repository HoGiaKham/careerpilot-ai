'use client';
import { useState, useEffect } from 'react';
import { signInWithPopup, AuthProvider } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../src/lib/firebase';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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
          toast.success('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');
          setAuthMode('login');
        }
      } else {
        setAuthError(data.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } catch (error) {
      setAuthError('Không thể kết nối đến máy chủ Backend!');
    } finally {
      setAuthLoading(false);
    }
  };

  // ================= CẬP NHẬT CHỖ NÀY =================
  const handleSocialLogin = async (provider: AuthProvider, providerName: string) => {
    setAuthError('');
    setAuthLoading(true);
    try {
      // 1. Lấy thông tin từ popup của Firebase
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // 2. Lấy Thẻ của Firebase
      const firebaseToken = await user.getIdToken();
      
      // 3. MANG THẺ FIREBASE ĐI ĐỔI LẤY THẺ JWT CỦA BACKEND
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/auth/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: firebaseToken }),
      });

      const data = await response.json();

      if (response.ok && data.accessToken) {
        // 4. Lưu thẻ JWT NỘI BỘ xịn sò vào túi
        localStorage.setItem('token', data.accessToken);
        onSuccess(); // Đóng Modal và báo thành công
      } else {
        setAuthError(data.message || `Đăng nhập bằng ${providerName} thất bại từ Server.`);
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
      onClick={onClose} 
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
              {authMode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </h3>
            <p className="text-gray-500 text-sm sm:text-base mt-2">
              {authMode === 'login' 
                ? 'Đăng nhập để sử dụng nhiều dịch vụ hơn.' 
                : 'Tạo tài khoản mới để sử dụng nhiều dịch vụ.'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 cursor-pointer">Email</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5 cursor-pointer">Mật khẩu</label>
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
                authMode === 'login' ? 'Đăng nhập' : 'Đăng ký'
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-4 text-xs sm:text-sm text-gray-400 font-medium">Hoặc tiếp tục với</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleSocialLogin(googleProvider, 'Google')}
              disabled={authLoading}
              className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin(facebookProvider, 'Facebook')}
              disabled={authLoading}
              className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Facebook
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-600">
            {authMode === 'login' ? (
              <p>
                Chưa có tài khoản?{' '}
                <button 
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError('');
                  }}
                  className="font-semibold text-black hover:underline cursor-pointer"
                >
                  Đăng ký ngay
                </button>
              </p>
            ) : (
              <p>
                Đã có tài khoản?{' '}
                <button 
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                  }}
                  className="font-semibold text-black hover:underline cursor-pointer"
                >
                  Đăng nhập
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}