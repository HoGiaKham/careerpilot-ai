'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { AnalysisData } from '../../type/resume';
import AnalysisResult from '../../components/AnalysisResult';
import { useLanguage } from '@/context/LanguageProvider';

interface HistoryItem extends AnalysisData {
  id: string;
  createdAt: string;
  resume: { fileUrl: string; parsedText: string };
  jd: { content: string };
}

export default function HistoryPage() {
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  
  const detailRef = useRef<HTMLDivElement>(null);
  const { t, lang } = useLanguage();

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (selectedItem && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedItem]);

  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error(t.history.loginRequired);
      setLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/resume/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setHistoryList(data.data);
      } else {
        toast.error(data.message || t.history.loadError);
      }
    } catch {
      toast.error(t.history.connectionError);
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadge = (s: number) => {
    if (s >= 80) return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900';
    if (s >= 60) return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900';
    if (s >= 40) return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900';
    return 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 font-sans">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 dark:text-zinc-400 font-medium">{t.history.loading}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20 font-sans text-slate-900 dark:text-zinc-100 transition-colors">
      <main className="max-w-7xl mx-auto p-6 pt-10">
        
        {/* HEADER SAAS PRO: Hỗ trợ Dark Mode */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">{t.history.title}</h1>
            <p className="text-slate-500 dark:text-zinc-400 mt-2 font-medium">{t.history.subtitle}</p>
          </div>
          <Link 
            href="/dashboard"
            className="px-5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all flex items-center gap-2 text-sm"
          >
            {t.history.backHome}
          </Link>
        </div>

        {historyList.length === 0 ? (
          // TRƯỜNG HỢP TRỐNG (EMPTY STATE CHUẨN)
          <div className="text-center bg-white dark:bg-zinc-900 p-12 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 mt-10">
            <div className="text-6xl mb-4 opacity-50">📭</div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-zinc-200 mb-2">{t.history.emptyTitle}</h3>
            <p className="text-slate-500 dark:text-zinc-400 mb-6 max-w-md mx-auto leading-relaxed">{t.history.emptyDesc}</p>
            <Link 
              href="/dashboard"
              className="inline-block bg-blue-600 text-white font-bold px-8 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              {t.history.emptyCta}
            </Link>
          </div>
        ) : (
          // TRƯỜNG HỢP CÓ DỮ LIỆU - LAYOUT MASTER-DETAIL
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* CỘT TRÁI (MASTER): DANH SÁCH THẺ LỊCH SỬ GỌN GÀNG, CHUYÊN NGHIỆP */}
            <div className="lg:col-span-4 space-y-4 max-h-[85vh] overflow-y-auto pr-3 custom-scrollbar">
              {historyList.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${
                      isSelected 
                        ? 'bg-white dark:bg-zinc-900 border-2 border-blue-500 shadow-lg ring-4 ring-blue-50 dark:ring-blue-950/50' 
                        : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 shadow-sm hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-slate-400 dark:text-zinc-500">
                        {new Date(item.createdAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'vi-VN', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getScoreBadge(item.matchScore)}`}>
                        {item.matchScore}% Match
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-700 dark:text-zinc-300 font-medium line-clamp-2 leading-relaxed">
                      <span className="font-bold text-slate-900 dark:text-white">JD:</span> {item.jd.content}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-start">
                      <a 
                        href={item.resume.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()} 
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 transition-colors"
                      >
                        📄 {t.history.viewFile}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CỘT PHẢI (DETAIL): CHI TIẾT KẾT QUẢ CỰC KỲ PRO */}
            <div className="lg:col-span-8" ref={detailRef}>
              {selectedItem ? (
                <div className="animate-fade-in-up pb-10">
                  <div className="mb-4 flex items-center justify-between px-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.history.detailTitle}</h3>
                  </div>
                  <AnalysisResult result={selectedItem} />
                </div>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-12 text-center text-slate-400 dark:text-zinc-500 shadow-sm">
                  <span className="text-6xl mb-4">👈</span>
                  <p className="font-medium text-lg">{t.history.selectHint}</p>
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}