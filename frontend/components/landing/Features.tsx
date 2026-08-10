'use client'
// Component này trình bày các đặc điểm cốt lõi (Why Choose Us / Features) của nền tảng Career Copilot AI.
import { Brain, Target, Zap } from 'lucide-react';
import { useLanguage } from '@/context/LanguageProvider';

export default function Features() {
  const { t } = useLanguage();

  return (
    <section id="features" className="py-24 bg-[#FAFAFA] dark:bg-zinc-950 transition-colors">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header của Section */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            {t.landing.featuresTitle}
          </h2>
          <p className="text-base sm:text-lg text-slate-500 dark:text-zinc-400">
            {t.landing.featuresSubtitle}
          </p>
        </div>
        
        {/* Danh sách 3 Card tính năng */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Feature 1 */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-default">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              {t.landing.feature1Title}
            </h3>
            <p className="text-slate-500 dark:text-zinc-400 leading-relaxed text-sm">
              {t.landing.feature1Desc}
            </p>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-default">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              {t.landing.feature2Title}
            </h3>
            <p className="text-slate-500 dark:text-zinc-400 leading-relaxed text-sm">
              {t.landing.feature2Desc}
            </p>
          </div>
          
          {/* Feature 3 */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-default">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              {t.landing.feature3Title}
            </h3>
            <p className="text-slate-500 dark:text-zinc-400 leading-relaxed text-sm">
              {t.landing.feature3Desc}
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}