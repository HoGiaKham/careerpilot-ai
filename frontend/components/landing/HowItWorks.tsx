'use client'
// Component này minh họa quy trình sử dụng 3 bước đơn giản kèm đường kẻ nối trực quan (How It Works).
import { useLanguage } from '@/context/LanguageProvider';

export default function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section id="how-it-works" className="py-24 bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            {t.landing.stepsTitle}
          </h2>
          <p className="text-slate-500 dark:text-zinc-400 text-base sm:text-lg">
            {t.landing.stepsSubtitle}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 justify-center relative">
          
          {/* Đường kẻ ngang nối các bước */}
          <div className="hidden md:block absolute top-16 left-[15%] right-[15%] h-[2px] bg-slate-200 dark:bg-zinc-800 z-0"></div>
          
          {/* Bước 1 */}
          <div className="flex-1 text-center relative z-10 bg-white dark:bg-zinc-950 md:bg-transparent md:dark:bg-transparent p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 md:border-none shadow-sm md:shadow-none">
            <div className="w-20 h-20 mx-auto bg-white dark:bg-zinc-900 border-2 border-slate-100 dark:border-zinc-700 rounded-full flex items-center justify-center text-2xl font-black text-slate-900 dark:text-white shadow-sm mb-6 relative z-20 hover:scale-110 transition-transform">1</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t.landing.step1Title}</h3>
            <p className="text-slate-500 dark:text-zinc-400 text-sm">{t.landing.step1Desc}</p>
          </div>
          
          {/* Bước 2 */}
          <div className="flex-1 text-center relative z-10 bg-white dark:bg-zinc-950 md:bg-transparent md:dark:bg-transparent p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 md:border-none shadow-sm md:shadow-none">
            <div className="w-20 h-20 mx-auto bg-white dark:bg-zinc-900 border-2 border-slate-100 dark:border-zinc-700 rounded-full flex items-center justify-center text-2xl font-black text-slate-900 dark:text-white shadow-sm mb-6 relative z-20 hover:scale-110 transition-transform">2</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t.landing.step2Title}</h3>
            <p className="text-slate-500 dark:text-zinc-400 text-sm">{t.landing.step2Desc}</p>
          </div>
          
          {/* Bước 3 */}
          <div className="flex-1 text-center relative z-10 bg-white dark:bg-zinc-950 md:bg-transparent md:dark:bg-transparent p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 md:border-none shadow-sm md:shadow-none">
            <div className="w-20 h-20 mx-auto bg-blue-600 dark:bg-blue-500 border-4 border-white dark:border-zinc-950 rounded-full flex items-center justify-center text-2xl font-black text-white dark:text-zinc-900 shadow-xl shadow-blue-200 dark:shadow-none mb-6 relative z-20 hover:scale-110 transition-transform">3</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t.landing.step3Title}</h3>
            <p className="text-slate-500 dark:text-zinc-400 text-sm">{t.landing.step3Desc}</p>
          </div>

        </div>
      </div>
    </section>
  );
}