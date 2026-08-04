'use client';
import { useState } from 'react';
import { toast } from 'react-hot-toast'; // Import Toast
import { AnalysisData } from '../../type/resume';
import AnalysisResult from '../../components/AnalysisResult';

export default function DashboardPage() {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);
  
  // State nhận biết người dùng đang kéo file lơ lửng trên ô
  const [isDragActive, setIsDragActive] = useState(false);

  // --- LOGIC KÉO THẢ (DRAG & DROP) ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setCvFile(file);
        toast.success(`Đã nhận file: ${file.name}`);
      } else {
        toast.error('Vui lòng chỉ tải lên file có định dạng PDF!');
      }
    }
  };
  // ------------------------------------

  const handleAnalyze = async () => {
    if (!cvFile || !jdText) {
      toast.error('Vui lòng tải lên CV và nhập mô tả công việc (JD)!');
      return;
    }

    const token = localStorage.getItem('token');
    
    if (!token) {
      const currentTrials = parseInt(localStorage.getItem('freeTrials') || '0', 10);
      if (currentTrials >= 2) {
        toast.error('Bạn đã hết lượt dùng thử! Vui lòng đăng nhập để tiếp tục.');
        return; 
      }
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    // Bật một thông báo dạng loading (loading toast)
    const toastId = toast.loading('Đang nhờ AI phân tích...');

    try {
      const formData = new FormData();
      formData.append('file', cvFile);
      formData.append('jdText', jdText);

      const headers: Record<string, string> = {}; 
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/resume/upload`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.analysis) {
        setAnalysisResult(data.analysis);
        toast.success('Phân tích thành công!', { id: toastId }); // Tắt loading và báo thành công
        
        if (!token) {
          const currentTrials = parseInt(localStorage.getItem('freeTrials') || '0', 10);
          localStorage.setItem('freeTrials', (currentTrials + 1).toString());
        }
      } else {
        toast.error('Lỗi từ server: ' + (data.message || 'Không xác định'), { id: toastId });
      }
    } catch (error) {
      console.error('Lỗi khi gọi API:', error);
      toast.error('Không thể kết nối đến máy chủ Backend!', { id: toastId });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative font-sans">
      <main className="max-w-6xl mx-auto p-6 mt-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-800">Tối ưu hóa CV của bạn</h2>
          <p className="text-gray-500 mt-2 font-medium">Tải lên CV và Mô tả công việc (JD) để AI phân tích độ phù hợp.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cột 1: Upload CV có tính năng DRAG & DROP */}
          <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold mb-4 text-gray-700">1. Tải lên CV (PDF)</h3>
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 group ${
                isDragActive 
                  ? 'bg-blue-100 border-blue-500 scale-105' 
                  : 'border-gray-300 hover:bg-blue-50/50 hover:border-blue-400'
              }`}
            >
              <input 
                type="file" accept=".pdf" className="hidden" id="cv-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setCvFile(file);
                  if(file) toast.success(`Đã nhận file: ${file.name}`);
                }}
              />
              <label htmlFor="cv-upload" className="cursor-pointer flex flex-col items-center">
                <span className={`text-5xl mb-4 transition-transform ${isDragActive ? 'animate-bounce' : 'group-hover:scale-110'}`}>
                  📄
                </span>
                <span className="text-gray-800 font-semibold truncate max-w-full px-4">
                  {cvFile ? cvFile.name : (isDragActive ? 'Thả file vào đây...' : 'Nhấn hoặc Kéo thả file CV vào đây')}
                </span>
                <span className="text-sm text-gray-400 mt-2 font-medium">Chỉ chấp nhận định dạng PDF</span>
              </label>
            </div>
          </div>

          {/* Cột 2: Nhập JD */}
          <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold mb-4 text-gray-700 cursor-default">2. Mô tả công việc (JD)</h3>
            <textarea 
              className="w-full h-[230px] p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all bg-gray-50 focus:bg-white text-gray-700"
              placeholder="Dán nội dung Job Description (JD) vào đây..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="mt-12 flex flex-col items-center">
          <button 
            onClick={handleAnalyze}
            disabled={!cvFile || !jdText || isAnalyzing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-extrabold py-4 px-12 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-3 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang nhờ AI phân tích...
              </>
            ) : '🚀 Bắt đầu phân tích'}
          </button>
        </div>

        {/* KẾT QUẢ TỪ COMPONENT */}
        {analysisResult && <AnalysisResult result={analysisResult} />}
      </main>
    </div>
  );
}