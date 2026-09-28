import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export interface ResumeItem {
  id: string;
  fileUrl?: string;
  originalName?: string;
  isDeleted?: boolean;
  sourceType?: string;
  cvData?: unknown; // có giá trị khi CV được tạo/sửa bằng editor
  createdAt: string;
  updatedAt: string;
}

interface CvCardProps {
  cv: ResumeItem;
  formatDate: (date: string) => string;
  extractFileName: (url?: string) => string;
  onUpdate: () => void;
}

export default function CvCard({ cv, formatDate, extractFileName, onUpdate }: CvCardProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 🌟 Thêm State để làm Modal Đổi Tên
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);

  const isAiBadge = cv.sourceType === 'AI_GENERATED' || cv.sourceType === 'AI_TAILORED';
  const badgeTitle = cv.sourceType === 'AI_TAILORED' ? 'AI Tailored' : 'AI Generated';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEdit = () => {
    setIsMenuOpen(false);
    router.push(`/cv-editor/${cv.id}`);
  };

  const handleTailor = () => {
    setIsMenuOpen(false);
    router.push(`/create-cv/tailor?resumeId=${cv.id}`);
  };

  const getDownloadUrl = (url: string) => {
    if (!url.includes('cloudinary.com')) return url;
    return url.replace('/upload/', '/upload/fl_attachment/');
  };

  // 🌟 Kích hoạt Modal thay vì dùng window.prompt
  const handleOpenRenameModal = () => {
    setIsMenuOpen(false);
    setRenameValue(cv.originalName || extractFileName(cv.fileUrl));
    setIsRenameModalOpen(true);
  };

  // 🌟 Hàm Submit khi nhấn Lưu trong Modal
  const handleSubmitRename = async () => {
    const oldName = cv.originalName || extractFileName(cv.fileUrl);
    if (!renameValue || renameValue.trim() === '' || renameValue === oldName) {
      setIsRenameModalOpen(false);
      return;
    }

    setIsRenameModalOpen(false);
    setIsProcessing(true);

    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const renameTask = fetch(`${apiUrl}/resume/workspace/${cv.id}/rename`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newName: renameValue.trim() })
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onUpdate();
      return data.message;
    }).finally(() => setIsProcessing(false));

    toast.promise(renameTask, {
      loading: 'Đang đổi tên...',
      success: 'Đổi tên thành công!',
      error: (err) => err.message || 'Lỗi đổi tên',
    });
  };

  const handleDelete = async () => {
    setIsMenuOpen(false);
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa CV này khỏi thư viện không?');
    if (!confirmDelete) return;

    setIsProcessing(true);
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const deleteTask = fetch(`${apiUrl}/resume/workspace/${cv.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onUpdate();
      return data.message;
    }).finally(() => setIsProcessing(false));

    toast.promise(deleteTask, {
      loading: 'Đang xóa CV...',
      success: 'Đã xóa CV!',
      error: (err) => err.message || 'Lỗi khi xóa',
    });
  };

  const menuItemClass =
    'w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700/50';

  return (
    <>
      <div className={`group flex flex-col bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative ${isProcessing ? 'opacity-60 pointer-events-none' : 'hover:border-blue-300 dark:hover:border-blue-800'}`}>

        {isAiBadge && (
          <span className="absolute top-6 right-6 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500" title={badgeTitle}></span>
          </span>
        )}

        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100 dark:border-blue-800/30">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="overflow-hidden pr-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate" title={cv.originalName || extractFileName(cv.fileUrl)}>
              {cv.originalName || extractFileName(cv.fileUrl)}
            </h3>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">
              Cập nhật {formatDate(cv.updatedAt || cv.createdAt)}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-5 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-3">

          {/* Nút chính: CV tạo từ editor -> mở editor (có xem trước); CV PDF -> mở file */}
          {cv.cvData ? (
            <button
              onClick={handleEdit}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Xem / Chỉnh sửa
            </button>
          ) : cv.fileUrl ? (
            <a
              href={cv.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Xem CV
            </a>
          ) : (
            <div className="flex-1" />
          )}

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                isMenuOpen
                  ? 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-600 text-slate-900 dark:text-white'
                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 bottom-12 w-52 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-xl shadow-xl py-1.5 z-10 origin-bottom-right animate-in fade-in slide-in-from-bottom-2">

                {/* CV có file PDF: tải xuống (xem đã có ở nút chính) */}
                {cv.fileUrl && (
                  <a href={getDownloadUrl(cv.fileUrl)} download className={menuItemClass}>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Tải xuống
                  </a>
                )}

                {/* Tinh chỉnh theo JD (luồng 1) */}
                <button onClick={handleTailor} className={`${menuItemClass} cursor-pointer`}>
                  <span className="w-4 text-center text-sm leading-none">🎯</span>
                  Tinh chỉnh theo JD
                </button>

                <button onClick={handleOpenRenameModal} className={`${menuItemClass} cursor-pointer`}>
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Đổi tên
                </button>

                <div className="h-px bg-slate-100 dark:bg-zinc-700 my-1.5"></div>

                <button onClick={handleDelete} className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer">
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Xóa CV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🌟 MODAL ĐỔI TÊN CV */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Đổi tên CV</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-5">Nhập tên mới gợi nhớ hơn cho bản CV của bạn.</p>

            <input
              type="text"
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitRename()}
              placeholder="VD: CV_Frontend_2024..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setIsRenameModalOpen(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmitRename}
                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Lưu tên mới
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}