// Component này chạy phần tiêu đề chính (Hero Section) và bảng Demo AI tương tác trực tiếp (Live Dashboard Preview).
'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Sparkles, Check, ThumbsUp, Target, Lightbulb, 
  FileText, UploadCloud, RefreshCw, ArrowRight 
} from 'lucide-react';
import { demoCases } from '@/data/demoCases';

export default function HeroDemo() {
  const [currentCase, setCurrentCase] = useState(demoCases[0]);
  const [demoScore, setDemoScore] = useState(0);
  const [isDemoAnalyzing, setIsDemoAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState('');
  const [displayedSuggestion, setDisplayedSuggestion] = useState('');

  const scoreIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimeoutRefs = useRef<NodeJS.Timeout[]>([]);

  const cleanupTimeouts = () => {
    if (scoreIntervalRef.current) clearInterval(scoreIntervalRef.current);
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    stepTimeoutRefs.current.forEach(clearTimeout);
    stepTimeoutRefs.current = [];
  };

  const runDemoAnalysis = (forceCaseIndex?: number) => {
    cleanupTimeouts();

    let nextCase = currentCase;
    if (forceCaseIndex !== undefined) {
      nextCase = demoCases[forceCaseIndex];
    } else {
      const availableCases = demoCases.filter(c => c.fileName !== currentCase.fileName);
      nextCase = availableCases[Math.floor(Math.random() * availableCases.length)];
    }

    setCurrentCase(nextCase);
    setIsDemoAnalyzing(true);
    setDemoScore(0);
    setDisplayedSuggestion('');
    setAnalyzingStep('Extracting Resume...');

    stepTimeoutRefs.current.push(setTimeout(() => setAnalyzingStep('Analyzing Skills...'), 600));
    stepTimeoutRefs.current.push(setTimeout(() => setAnalyzingStep('Comparing with JD...'), 1200));
    stepTimeoutRefs.current.push(setTimeout(() => setAnalyzingStep('Generating Suggestions...'), 1800));

    stepTimeoutRefs.current.push(setTimeout(() => {
      setIsDemoAnalyzing(false);
      
      let startScore = 0;
      scoreIntervalRef.current = setInterval(() => {
        startScore += 2;
        if (startScore >= nextCase.score) {
          setDemoScore(nextCase.score);
          if (scoreIntervalRef.current) clearInterval(scoreIntervalRef.current);
        } else {
          setDemoScore(startScore);
        }
      }, 20);

      let charIndex = 0;
      typingIntervalRef.current = setInterval(() => {
        if (charIndex < nextCase.suggestion.length) {
          setDisplayedSuggestion(nextCase.suggestion.substring(0, charIndex + 1));
          charIndex++;
        } else {
          if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        }
      }, 25);

    }, 2400));
  };

  useEffect(() => {
    runDemoAnalysis(0);
    return cleanupTimeouts;
  }, []);

  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'emerald': return { bar: 'from-emerald-400 to-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-600' };
      case 'blue': return { bar: 'from-blue-400 to-blue-600', badge: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-600' };
      case 'amber': return { bar: 'from-amber-400 to-amber-600', badge: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-600' };
      case 'red': return { bar: 'from-red-400 to-red-600', badge: 'bg-red-50 text-red-700 border-red-200', text: 'text-red-600' };
      default: return { bar: 'from-slate-400 to-slate-600', badge: 'bg-slate-50 text-slate-700 border-slate-200', text: 'text-slate-600' };
    }
  };

  const themeConfig = getThemeClasses(currentCase.colorTheme);
  const StatusIcon = currentCase.Icon;

  return (
    <section className="relative pt-20 pb-20 overflow-hidden flex flex-col items-center text-center px-4 sm:px-6">
      <div className="absolute top-[-5%] left-[15%] w-[320px] h-[320px] bg-blue-400/20 rounded-full blur-[110px] pointer-events-none animate-pulse"></div>
      <div className="absolute top-[15%] right-[10%] w-[280px] h-[280px] bg-indigo-400/20 rounded-full blur-[130px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm text-xs sm:text-sm font-semibold text-slate-700 mb-8 hover:shadow-md transition-all cursor-default">
          <Sparkles className="w-4 h-4 text-blue-600 animate-spin-slow" />
          AI-powered Resume Analysis
        </div>
        
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.15]">
          Biến CV của bạn thành <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            lợi thế cạnh tranh.
          </span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed font-normal">
          Phân tích CV bằng AI chuyên sâu. So khớp chính xác với Job Description, phát hiện kỹ năng còn thiếu và nhận đề xuất tối ưu ngay lập tức để tăng cơ hội được gọi phỏng vấn.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16 w-full sm:w-auto">
          <Link 
            href="/dashboard"
            className="w-full sm:w-auto bg-slate-900 text-white font-semibold px-8 py-4 rounded-full text-base sm:text-lg shadow-xl hover:bg-slate-800 hover:shadow-2xl transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 group"
          >
            Bắt đầu phân tích ngay
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="#how-it-works"
            className="w-full sm:w-auto bg-white text-slate-700 font-semibold px-8 py-4 rounded-full text-base sm:text-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-all text-center"
          >
            Tìm hiểu cách hoạt động
          </Link>
        </div>
      </div>

      {/* Live Dashboard Preview */}
      <div className="w-full max-w-5xl mx-auto relative z-10">
        <div className="bg-white rounded-2xl md:rounded-[32px] shadow-2xl border border-slate-200/80 overflow-hidden ring-1 ring-slate-900/5 p-2 md:p-4">
          
          <div className="bg-slate-900 text-white px-4 py-3 rounded-xl md:rounded-[20px] flex justify-between items-center text-xs sm:text-sm mb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              <span className="text-slate-400 font-mono ml-2 hidden sm:inline">career-copilot-demo.ai</span>
            </div>
            <button 
              onClick={() => runDemoAnalysis()}
              disabled={isDemoAnalyzing}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDemoAnalyzing ? 'animate-spin' : ''}`} />
              {isDemoAnalyzing ? 'Running Demo...' : 'Run Demo Analysis'}
            </button>
          </div>

          <div className="bg-slate-50 rounded-xl md:rounded-[24px] border border-slate-100 p-4 sm:p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 text-left">
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <span className="font-bold text-slate-700 text-xs sm:text-sm">Input Document</span>
                </div>
                <span className="text-xs text-slate-400 font-mono transition-opacity">PDF Ready</span>
              </div>
              
              <div className={`h-36 sm:h-44 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 p-4 text-center transition-colors duration-500 ${isDemoAnalyzing ? 'border-slate-300 bg-slate-100 text-slate-500' : 'border-blue-300 bg-blue-50/40 text-blue-600'}`}>
                <UploadCloud className={`w-8 h-8 opacity-80 ${isDemoAnalyzing ? '' : 'animate-bounce'}`} />
                <span className="font-bold text-xs sm:text-sm text-slate-800">{currentCase.fileName}</span>
                <span className="text-[11px] text-slate-400">Target Role: {currentCase.targetRole}</span>
              </div>
              
              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-xs text-slate-500 space-y-1.5 transition-all">
                <div className="font-semibold text-slate-700">Job Description Match Context:</div>
                <p className="line-clamp-2 italic text-[11px] text-slate-400">
                  {currentCase.jdContext}
                </p>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-7 relative overflow-hidden flex flex-col justify-between">
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${themeConfig.bar} transition-colors duration-500`}></div>
              
              {isDemoAnalyzing ? (
                <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-sm font-semibold text-slate-600 animate-pulse">{analyzingStep}</p>
                </div>
              ) : (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-4">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Overall Match</h3>
                        <div className={`text-4xl sm:text-5xl font-black ${themeConfig.text} transition-colors duration-500`}>
                          {demoScore}<span className="text-2xl opacity-50">%</span>
                        </div>
                      </div>
                      <div className={`${themeConfig.badge} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm transition-colors duration-500`}>
                        <StatusIcon className={`w-3.5 h-3.5 ${themeConfig.text}`} /> {currentCase.status}
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-[800ms] ease-out bg-gradient-to-r ${themeConfig.bar}`}
                        style={{ width: `${demoScore}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-500"/> Key Strengths
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {currentCase.strengths.map((str, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-semibold rounded-md border border-emerald-100 flex items-center gap-1 animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                          <Check className="w-3 h-3 text-emerald-600" /> {str}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-red-500"/> Missing Skills
                    </h4>
                    <div className="flex gap-1.5 flex-wrap">
                      {currentCase.missing.map((miss, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-md border border-slate-200 animate-fade-in-up" style={{ animationDelay: `${(idx * 100) + 200}ms` }}>
                          {miss}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500"/> Actionable Suggestion
                    </h4>
                    <div className="p-2.5 bg-amber-50/60 border border-amber-200/60 rounded-lg text-xs text-amber-900 font-medium min-h-[48px] font-mono leading-relaxed transition-all">
                      {displayedSuggestion}
                      <span className="animate-pulse inline-block w-1.5 h-3 bg-amber-600 ml-0.5"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}