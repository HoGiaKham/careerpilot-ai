'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function CreateCvPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    targetRole: '',
    experience: '',
    skills: ''
  });

  // Bổ sung Auth check khi user vừa vào trang
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Vui lòng đăng nhập để tạo CV!');
      router.push('/login');
    }
  }, [router]);

  const handleGenerate = async () => {
    if (!formData.fullName || !formData.targetRole) {
      toast.error('Vui lòng nhập Tên và Vị trí ứng tuyển!');
      return;
    }

    setIsGenerating(true);
    // Thay đổi wording cho chuyên nghiệp hơn
    const loadingToast = toast.loading('AI đang phân tích thông tin...');

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      // Parse string thành mảng và lọc các phần tử rỗng
      const parsedSkills = formData.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        skills: parsedSkills
      };

      const response = await fetch(`${apiUrl}/resume/workspace/create-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Đã tạo CV thành công!', { id: loadingToast });
        // Redirect sang trang CV Editor thật
        router.push(`/cv-editor/${data.data.id}`);
      } else {
        throw new Error(data.message || 'Lỗi hệ thống từ máy chủ');
      }
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra khi gọi AI', { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20 font-sans text-slate-900 dark:text-zinc-100 transition-colors">
      
      {/* Header gọn gàng */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-lg font-bold">AI Resume Builder</h1>
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            Bản nháp chưa lưu
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CỘT TRÁI: FORM NHẬP LIỆU */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800">
              <h2 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">Thông tin cơ bản</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">Cung cấp vài từ khóa, AI sẽ lo phần viết lách bay bổng cho bạn.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">Họ và Tên <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="VD: Hồ Gia Khâm"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">Vị trí ứng tuyển <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="VD: Senior Frontend Developer"
                    value={formData.targetRole}
                    onChange={(e) => setFormData({...formData, targetRole: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">Kỹ năng chính (Cách nhau dấu phẩy)</label>
                  <input 
                    type="text" 
                    placeholder="VD: ReactJS, Node.js, TypeScript, AI Prompting..."
                    value={formData.skills}
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">Kinh nghiệm nổi bật (Viết ngắn gọn)</label>
                  <textarea 
                    rows={4}
                    placeholder="VD: 3 năm kinh nghiệm làm web. Từng tối ưu hiệu suất tăng 40%. Xây dựng hệ thống quản lý AI..."
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: KHU VỰC PREVIEW / ACTION */}
          <div className="lg:col-span-7">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-1 relative overflow-hidden h-full min-h-[400px] flex flex-col justify-center items-center text-center">
              
              {/* Vòng sáng trang trí nền */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400 opacity-20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
              
              <div className="relative z-10 p-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl border border-white/20">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                
                <h3 className="text-3xl font-extrabold text-white mb-4">Sức mạnh của AI</h3>
                <p className="text-blue-100 text-base max-w-md mb-10 leading-relaxed font-medium">
                  Chỉ cần cung cấp các gạch đầu dòng thô sơ, hệ thống sẽ sử dụng AI để mở rộng, viết lại bằng ngôn ngữ chuyên nghiệp và sắp xếp vào một Template CV chuẩn ATS.
                </p>

                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-8 py-4 bg-white text-blue-700 hover:bg-blue-50 font-extrabold rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 flex items-center gap-3 cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isGenerating ? (
                    <>
                      <svg className="w-6 h-6 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Đang phép thuật...
                    </>
                  ) : (
                    <>
                      <span className="text-xl">✨</span> Viết CV bằng AI ngay
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}