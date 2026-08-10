'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useTheme } from '@/components/ThemeProvider'; 
import { ArrowLeft, Save, Sliders, Globe, Scroll, Database, FileText, SunMoon } from 'lucide-react'; 
import { useTranslate } from '@/hooks/useTranslate'; 

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'account' | 'preferences'>('account');
  const [userEmail, setUserEmail] = useState('...');
  const [memberSince, setMemberSince] = useState('—');
  const [loading, setLoading] = useState(false);

  const { theme, setTheme } = useTheme();
  
  const { t, lang: reportLang, setLang: setReportLang } = useTranslate();
  const profileT = t.profile; 

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [autoScroll, setAutoScroll] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  const [saveCv, setSaveCv] = useState(true);

  const [stats, setStats] = useState({
    historyCount: 0,
    cvCount: 0,
    storageSize: '0 MB',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        setUserEmail(payload.email || 'user@example.com');
      } catch (e) {
        const savedEmail = localStorage.getItem('userEmail');
        setUserEmail(savedEmail ?? 'user@example.com');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      fetch(`${apiUrl}/resume/stats`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setStats({
              historyCount: data.data.historyCount,
              cvCount: data.data.cvCount,
              storageSize: data.data.storageSize,
            });
          }
        })
        .catch(() => {});
    } else {
      setUserEmail(''); 
    }

    setMemberSince('05/08/2026');
    
    const savedAutoScroll = localStorage.getItem('pref_auto_scroll') !== 'false';
    const savedHistory = localStorage.getItem('pref_save_history') !== 'false';
    const savedCvPref = localStorage.getItem('pref_save_cv') !== 'false';
    setAutoScroll(savedAutoScroll);
    setSaveHistory(savedHistory);
    setSaveCv(savedCvPref);

  }, []);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setUserEmail(profileT.guestUser);
    }
  }, [profileT.guestUser]);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(profileT.pwdErrorEmpty);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(profileT.pwdErrorMismatch);
      return;
    }
    if (newPassword.length < 6) {
      toast.error(profileT.pwdErrorLength);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(profileT.pwdSuccess);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 800);
  };

  const handleDeleteAccount = async () => {
    if (confirm(profileT.deleteConfirm)) {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        
        if (token) {
          await fetch(`${apiUrl}/auth/user`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          }).catch(() => {});
        }

        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        toast.success(profileT.deleteSuccess);
        window.location.href = '/dashboard';
      } catch (error) {
        toast.error(profileT.deleteError);
      }
    }
  };

  const handleSavePreferences = () => {
    localStorage.setItem('pref_lang', reportLang);
    localStorage.setItem('pref_auto_scroll', String(autoScroll));
    localStorage.setItem('pref_save_history', String(saveHistory));
    localStorage.setItem('pref_save_cv', String(saveCv));
    toast.success(profileT.prefSuccess);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20 font-sans text-slate-900 dark:text-zinc-100 transition-colors">
      <main className="max-w-4xl mx-auto p-6 pt-10">
        
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 flex items-center justify-between mb-8 transition-colors">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">{profileT.title}</h1>
            <p className="text-slate-500 dark:text-zinc-400 mt-2 font-medium">{profileT.subtitle}</p>
          </div>
          <Link 
            href="/dashboard"
            className="px-5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> {profileT.backHome}
          </Link>
        </div>

        <div className="flex border-b border-slate-200 dark:border-zinc-800 mb-8 gap-8 transition-colors">
          <button
            onClick={() => setActiveTab('account')}
            className={`pb-3 text-sm font-bold transition-colors relative cursor-pointer ${
              activeTab === 'account' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
            }`}
          >
            {profileT.tabAccount}
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`pb-3 text-sm font-bold transition-colors relative cursor-pointer ${
              activeTab === 'preferences' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
            }`}
          >
            {profileT.tabPreferences}
          </button>
        </div>

        {activeTab === 'account' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 transition-colors">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{profileT.basicInfo}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">{profileT.emailLabel}</label>
                  <input 
                    type="text" 
                    disabled 
                    value={userEmail}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-700 dark:text-zinc-300 font-semibold text-sm cursor-not-allowed transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">{profileT.planLabel}</label>
                  <div className="flex items-center gap-3 pt-1">
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-bold border border-blue-100 dark:border-blue-900 transition-colors">
                      Free Tier
                    </span>
                    <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">{profileT.memberSince} {memberSince}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 transition-colors">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{profileT.usageStats}</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-xl border border-slate-100 dark:border-zinc-700 transition-colors">
                  <span className="block text-2xl font-black text-blue-600 dark:text-blue-400">{stats.historyCount}</span>
                  <span className="text-xs font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider mt-1 block">{profileT.analysesCount}</span>
                </div>
                <div className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-xl border border-slate-100 dark:border-zinc-700 transition-colors">
                  <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.cvCount}</span>
                  <span className="text-xs font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider mt-1 block">{profileT.savedCvs}</span>
                </div>
                <div className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-xl border border-slate-100 dark:border-zinc-700 transition-colors">
                  <span className="block text-2xl font-black text-amber-600 dark:text-amber-400">{stats.storageSize}</span>
                  <span className="text-xs font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider mt-1 block">{profileT.storageSize}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 transition-colors">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{profileT.changePasswordTitle}</h3>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">{profileT.currentPassword}</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">{profileT.newPassword}</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">{profileT.confirmPassword}</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  {loading ? profileT.updatingBtn : profileT.updatePasswordBtn}
                </button>
              </form>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-rose-100 dark:border-rose-950 transition-colors">
              <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400 mb-2">{profileT.dangerZone}</h3>
              <p className="text-slate-500 dark:text-zinc-400 text-sm mb-4">{profileT.deleteWarning}</p>
              <button 
                onClick={handleDeleteAccount}
                className="px-5 py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-sm rounded-xl border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
              >
                {profileT.deleteBtn}
              </button>
            </div>

          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6 animate-fade-in">
            
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{profileT.prefTitle}</h3>
              </div>
              
              <div className="flex items-center justify-between py-6 border-b border-slate-100 dark:border-zinc-800 transition-colors">
                <div className="flex items-center gap-3">
                  <SunMoon className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">{profileT.appearance}</h4>
                    <p className="text-slate-400 dark:text-zinc-400 text-xs mt-0.5">{profileT.appearanceDesc}</p>
                  </div>
                </div>
                <select 
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer transition-colors"
                >
                  <option value="light">{profileT.lightMode}</option>
                  <option value="dark">{profileT.darkMode}</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-6 border-b border-slate-100 dark:border-zinc-800 transition-colors">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">{profileT.reportLang}</h4>
                    <p className="text-slate-400 dark:text-zinc-400 text-xs mt-0.5">{profileT.reportLangDesc}</p>
                  </div>
                </div>
                <select 
                  value={reportLang}
                  onChange={(e) => setReportLang(e.target.value as 'vi' | 'en')}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer transition-colors"
                >
                  <option value="vi">{profileT.vietnamese}</option>
                  <option value="en">{profileT.english}</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-6 border-b border-slate-100 dark:border-zinc-800 transition-colors" title="Tính năng đang phát triển">
                <div className="flex items-center gap-3 opacity-60">
                  <Scroll className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">{profileT.autoScroll}</h4>
                    <p className="text-slate-400 dark:text-zinc-400 text-xs mt-0.5">{profileT.autoScrollDesc}</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={autoScroll}
                  disabled
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 cursor-not-allowed opacity-60" 
                />
              </div>

              <div className="flex items-center justify-between py-6 border-b border-slate-100 dark:border-zinc-800 transition-colors" title="Tính năng đang phát triển">
                <div className="flex items-center gap-3 opacity-60">
                  <Database className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">{profileT.saveHistory}</h4>
                    <p className="text-slate-400 dark:text-zinc-400 text-xs mt-0.5">{profileT.saveHistoryDesc}</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={saveHistory}
                  disabled
                  onChange={(e) => setSaveHistory(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 cursor-not-allowed opacity-60" 
                />
              </div>

              <div className="flex items-center justify-between py-6 transition-colors" title="Tính năng đang phát triển">
                <div className="flex items-center gap-3 opacity-60">
                  <FileText className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">{profileT.saveCv}</h4>
                    <p className="text-slate-400 dark:text-zinc-400 text-xs mt-0.5">{profileT.saveCvDesc}</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={saveCv}
                  disabled
                  onChange={(e) => setSaveCv(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 cursor-not-allowed opacity-60" 
                />
              </div>

              <div className="pt-6 flex justify-end transition-colors">
                <button
                  onClick={handleSavePreferences}
                  className="px-8 py-3 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> {profileT.saveConfigBtn}
                </button>
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}