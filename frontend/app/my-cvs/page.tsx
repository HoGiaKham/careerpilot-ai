'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageProvider';
import WorkspaceHeader from './components/WorkspaceHeader';
import EmptyWorkspace from './components/EmptyWorkspace';
import CvCard, { ResumeItem } from './components/CvCard';

export default function MyCvsPage() {
  const [cvList, setCvList] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { t, lang } = useLanguage();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCvs();
  }, []);

  const fetchCvs = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/resume/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) setCvList(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(new Date(dateString));
  };

  const extractFileName = (url?: string) => {
    if (!url) return 'Bản nháp CV';
    try {
      const parts = new URL(url).pathname.split('/');
      let fileWithExt = decodeURIComponent(parts[parts.length - 1]);
      return fileWithExt.length > 30 ? fileWithExt.substring(0, 30) + '...' : fileWithExt;
    } catch (e) {
      return "Document.pdf";
    }
  };

  // Sự kiện khi bấm nút kích hoạt input ẩn
  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleCreateNew = () => {
    router.push('/create-cv'); 
  };

  // Xử lý thực tế khi người dùng chọn file
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate nhanh: Chỉ cho phép file PDF
    if (file.type !== 'application/pdf') {
      toast.error('Vui lòng chỉ tải lên định dạng file PDF!');
      event.target.value = ''; // Reset input
      return;
    }

    // Validate size: Giới hạn 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng file vượt quá giới hạn 5MB!');
      event.target.value = ''; // Reset input
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Vui lòng đăng nhập lại!');
      router.push('/login');
      return;
    }

    // Gói file vào FormData để gửi qua API
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);

    // Dùng Promise kết hợp với toast.promise để tạo hiệu ứng loading
    const uploadTask = new Promise(async (resolve, reject) => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/resume/workspace/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });

        const data = await response.json();

        if (response.ok && data.success) {
          await fetchCvs(); // Load lại danh sách ngay lập tức
          resolve(data.message);
        } else {
          reject(new Error(data.message || 'Lỗi từ máy chủ'));
        }
      } catch (error) {
        console.error('Upload error:', error);
        reject(new Error('Mạng không ổn định hoặc máy chủ không phản hồi'));
      } finally {
        setUploading(false);
        event.target.value = ''; // Reset để chọn lại file cũ không bị lỗi
      }
    });

    toast.promise(uploadTask, {
      loading: 'Đang tải CV...',
      success: 'Tải CV lên thành công!',
      error: (err) => err.message || 'Tải file thất bại!',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20 font-sans text-slate-900 dark:text-zinc-100">
      <main className="max-w-7xl mx-auto p-6 pt-10">
        
        {/* Input file ẩn đi */}
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept=".pdf"
          onChange={handleFileChange}
        />

        {/* Truyền uploading vào để disable các nút trong lúc đợi API */}
        <WorkspaceHeader 
          onUploadClick={handleTriggerUpload} 
          onCreateClick={handleCreateNew}
          isUploading={uploading} 
        />

        {cvList.length === 0 ? (
          <EmptyWorkspace 
            onCreateClick={handleCreateNew} 
            isUploading={uploading} 
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cvList.map((cv) => (
              <CvCard 
                key={cv.id} 
                cv={cv} 
                formatDate={formatDate} 
                extractFileName={extractFileName} 
                onUpdate={fetchCvs}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}