'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { AnalysisData } from '../../type/resume';
import AnalysisResult from '../../components/AnalysisResult';
import { useLanguage } from '@/context/LanguageProvider';

const AI_STEPS = [
  "📄 Đang đọc và bóc tách nội dung CV...",
  "🎯 Đang phân tích yêu cầu từ JD...",
  "🧠 AI đang so khớp kỹ năng và kinh nghiệm...",
  "📊 Đang tổng hợp báo cáo chi tiết...",
  "✨ Đang hoàn tất kết quả..."
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function DashboardPage() {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [analysisError, setAnalysisError] = useState(false);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pdfObjectUrl, setPdfObjectUrl] = useState<string | null>(null);

  const [progressPercent, setProgressPercent] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const resultRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (cvFile) {
      const url = URL.createObjectURL(cvFile);
      setPdfObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPdfObjectUrl(null);
  }, [cvFile]);

  useEffect(() => {
    if (analysisResult && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [analysisResult]);

  useEffect(() => {
    let progressTimer: NodeJS.Timeout;
    let stepTimer: NodeJS.Timeout;

    if (isAnalyzing) {
      setProgressPercent(10);
      setCurrentStepIndex(0);

      progressTimer = setInterval(() => {
        setProgressPercent((prev) => (prev < 92 ? prev + Math.floor(Math.random() * 4) + 2 : prev));
      }, 500);

      stepTimer = setInterval(() => {
        setCurrentStepIndex((prev) => Math.min(prev + 1, AI_STEPS.length - 1));
      }, 2500);
    } else {
      setProgressPercent(0);
      setCurrentStepIndex(0);
    }

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
    };
  }, [isAnalyzing]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const validateAndSetFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error(t.dashboard.errorFileType);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t.dashboard.errorFileSize);
      return;
    }
    setCvFile(file);
    toast.success(`Đã nhận file: ${file.name}`);
  };

  const handleDragEvents = (e: React.DragEvent, isActive: boolean) => {
    e.preventDefault();
    if (!isAnalyzing) setIsDragActive(isActive);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isAnalyzing) return;
    setIsDragActive(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  };

  const removeCV = () => {
    setCvFile(null);
    const input = document.getElementById("cv-upload") as HTMLInputElement;
    if (input) input.value = "";
  };

  const checkFreeTrials = (token: string | null) => {
    if (token) return true;
    const currentTrials = parseInt(localStorage.getItem('freeTrials') || '0', 10);
    if (currentTrials >= 2) {
      toast.error(t.dashboard.errorFreeTrials);
      return false;
    }
    return true;
  };

  const handleAnalyze = async () => {
    if (!cvFile || !jdText) {
      toast.error(t.dashboard.errorRequired);
      return;
    }

    if (jdText.trim().length < 50) {
      toast.error(t.dashboard.errorLength);
      return;
    }

    const token = localStorage.getItem('token');
    if (!checkFreeTrials(token)) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError(false);

    try {
      const formData = new FormData();
      formData.append('file', cvFile);
      formData.append('jdText', jdText);
      formData.append('language', localStorage.getItem('pref_lang') || 'vi');

      const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/resume/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.analysis) {
        setProgressPercent(100);
        setCurrentStepIndex(AI_STEPS.length - 1);

        setTimeout(() => {
          setAnalysisResult(data.analysis);
          toast.success(t.dashboard.successAnalyze);
          setIsAnalyzing(false);
        }, 600);
        
        if (!token) {
          const currentTrials = parseInt(localStorage.getItem('freeTrials') || '0', 10);
          localStorage.setItem('freeTrials', (currentTrials + 1).toString());
        }
      } else {
        throw new Error(data.message || 'Unknown error');
      }
    } catch (error: any) {
      toast.error(`${t.dashboard.serverErrorPrefix} ${error.message || t.dashboard.errorServer}`);
      setIsAnalyzing(false);
      setAnalysisError(true);
    }
  };

  const jdWordCount = jdText.trim() ? jdText.trim().split(/\s+/).length : 0;
  const jdCharCount = jdText.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20 relative font-sans text-gray-900 dark:text-zinc-100 transition-colors">
      <main className="max-w-6xl mx-auto p-6 pt-10">
        <header className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white">{t.dashboard.title}</h2>
          <p className="text-gray-500 dark:text-zinc-400 mt-2 font-medium">{t.dashboard.subtitle}</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* CỘT 1: UPLOAD CV */}
          <div className={`bg-white dark:bg-zinc-900 p-7 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 transition-all ${isAnalyzing ? 'opacity-60 pointer-events-none' : 'hover:shadow-md'}`}>
            <h3 className="text-lg font-bold mb-4 text-gray-700 dark:text-zinc-200">{t.dashboard.uploadTitle}</h3>
            
            <input 
              type="file" accept=".pdf" className="hidden" id="cv-upload"
              disabled={isAnalyzing}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) validateAndSetFile(file);
              }}
            />

            {cvFile ? (
              <div className="flex flex-col items-center justify-between p-6 bg-blue-50/50 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-900 rounded-xl h-[230px] text-center transition-all">
                <div className="w-full flex flex-col items-center">
                  <span className="text-3xl mb-1">📄</span>
                  <h4 className="text-gray-900 dark:text-zinc-100 font-bold text-base truncate max-w-[90%]">{cvFile.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium mt-0.5">
                    {t.dashboard.uploadHint.replace('{size}', formatFileSize(cvFile.size))}
                  </p>
                </div>

                <div className="w-full flex items-center justify-center gap-2 pt-3 border-t border-blue-100 dark:border-blue-900">
                  <button 
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-blue-300 dark:border-zinc-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-700 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {t.dashboard.preview}
                  </button>

                  <label 
                    htmlFor="cv-upload" 
                    className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {t.dashboard.changeFile}
                  </label>

                  <button 
                    type="button"
                    onClick={removeCV}
                    className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {t.common.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <label 
                htmlFor="cv-upload"
                onDragOver={(e) => handleDragEvents(e, true)}
                onDragLeave={(e) => handleDragEvents(e, false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-10 h-[230px] flex flex-col items-center justify-center text-center transition-all duration-300 group cursor-pointer block ${
                  isDragActive 
                    ? 'bg-blue-100 dark:bg-blue-950 border-blue-500 scale-102' 
                    : 'border-gray-300 dark:border-zinc-700 hover:bg-blue-50/50 dark:hover:bg-zinc-800 hover:border-blue-400'
                }`}
              >
                <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">📄</span>
                <span className="text-gray-800 dark:text-zinc-200 font-semibold text-sm">
                  <span className="text-gray-800 dark:text-zinc-200 font-semibold text-sm">
                    {isDragActive ? t.dashboard.dropFile : t.dashboard.dragDrop}
                  </span>

                  <span className="text-xs text-gray-400 dark:text-zinc-500 mt-1 font-medium block">
                    {t.dashboard.pdfSupport}
                  </span>
                </span>
              </label>
            )}
          </div>

          {/* CỘT 2: NHẬP JD */}
          <div className={`bg-white dark:bg-zinc-900 p-7 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 transition-all flex flex-col ${isAnalyzing ? 'opacity-60 pointer-events-none' : 'hover:shadow-md'}`}>
            <h3 className="text-lg font-bold mb-4 text-gray-700 dark:text-zinc-200 cursor-default">
              {t.dashboard.jdTitle}
            </h3>
            <textarea 
              disabled={isAnalyzing}
              className="w-full h-[180px] p-4 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all bg-gray-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-800 text-gray-700 dark:text-zinc-200 disabled:bg-gray-100 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed"
              placeholder={t.dashboard.jdPlaceholder}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
            
            <div className="flex items-center justify-end mt-3 text-xs text-gray-400 dark:text-zinc-500 font-medium px-1">
            <span>
              {t.dashboard.chars.replace('{count}', jdCharCount.toLocaleString())}
              {' • '}
              {t.dashboard.words.replace('{count}', jdWordCount.toLocaleString())}
            </span>
            </div>
          </div>
        </section>

        {/* NÚT HÀNH ĐỘNG & TIẾN TRÌNH LOADING */}
        <section className="mt-10 flex flex-col items-center">
          {isAnalyzing ? (
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg border border-blue-100 dark:border-zinc-800 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
                <span className="font-bold text-gray-800 dark:text-zinc-200 text-sm">{AI_STEPS[currentStepIndex]}</span>
              </div>
              
              <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden mb-2">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-right text-xs font-extrabold text-blue-600 dark:text-blue-400">
                {progressPercent}%
              </div>
            </div>
          ) : analysisError ? (
            <div className="flex flex-col items-center gap-3 animate-fade-in-up">
              <div className="text-red-600 dark:text-red-400 font-bold text-sm bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 px-4 py-2 rounded-xl">
                ❌ Phân tích thất bại do gián đoạn kết nối hoặc AI bận.
              </div>
              <button 
                onClick={handleAnalyze}
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 px-8 rounded-full shadow-md transition-all active:scale-95 cursor-pointer text-sm flex items-center gap-2"
              >
                🔄 Thử lại ngay
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={handleAnalyze}
                disabled={!cvFile || !jdText}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed text-white font-extrabold py-4 px-12 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-3 cursor-pointer text-base"
              >
                {analysisResult
                  ? `🔄 ${t.dashboard.analyzeAgain}`
                  : `🚀 ${t.dashboard.analyze}`}
                </button>
              
              {(!cvFile || !jdText) && (
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1 animate-pulse">
                  {!cvFile && !jdText
                    ? t.dashboard.requireBoth
                    : !cvFile
                      ? t.dashboard.requireCv
                      : t.dashboard.requireJd}
                </span>
              )}
            </div>
          )}
        </section>

        {/* MODAL PREVIEW PDF */}
        {isPreviewOpen && cvFile && pdfObjectUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden border border-gray-100 dark:border-zinc-800">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📄</span>
                  <h3 className="font-bold text-gray-800 dark:text-white text-base">{cvFile.name}</h3>
                </div>
                <button 
                  onClick={() => setIsPreviewOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-700 dark:text-zinc-200 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 bg-gray-100 dark:bg-zinc-950 p-4">
                <iframe 
                  src={`${pdfObjectUrl}#toolbar=0`} 
                  className="w-full h-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-inner"
                  title="PDF Preview"
                />
              </div>
            </div>
          </div>
        )}

        {/* KẾT QUẢ PHÂN TÍCH */}
        <section ref={resultRef} className="mt-8">
          {analysisResult && !isAnalyzing && (  
            <div className="animate-fade-in-up">
              <AnalysisResult result={analysisResult} cvFile={cvFile} />
            </div>
          )}
        </section>
        
      </main>
    </div>
  );
}