'use client'
// Component này hiển thị các chỉ số nổi bật của hệ thống (Stats Bar) nằm ngay dưới phần Hero.
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageProvider';

export default function Stats() {
  const { lang } = useLanguage();

  return (
    <section className="py-12 border-y border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 relative z-20 transition-colors">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100 dark:divide-zinc-800">
        
        {/* Chỉ số 1 */}
        <div className="p-2">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1">~10s</div>
          <div className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{lang === 'en' ? 'Analysis speed' : 'Tốc độ phân tích'}</div>
        </div>
        
        {/* Chỉ số 2 */}
        <div className="p-2">
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-1 mt-1">Google Gemini</div>
          <div className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{lang === 'en' ? 'Core AI model' : 'Mô hình AI cốt lõi'}</div>
        </div>
        
        {/* Chỉ số 3 */}
        <div className="p-2">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1">PDF Engine</div>
          <div className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{lang === 'en' ? 'Data extraction' : 'Bóc tách dữ liệu'}</div>
        </div>
        
        {/* Chỉ số 4 */}
        <div className="p-2">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1 flex items-center justify-center gap-1">
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 inline" /> Secure
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{lang === 'en' ? 'Data security' : 'Bảo mật dữ liệu'}</div>
        </div>
        
      </div>
    </section>
  );
}