interface EmptyWorkspaceProps {
  onCreateClick: () => void;
  isUploading?: boolean;
}

export default function EmptyWorkspace({ onCreateClick, isUploading }: EmptyWorkspaceProps) {
  return (
    <div className="text-center bg-white dark:bg-zinc-900 p-16 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 mt-10">
      <div className="w-20 h-20 bg-slate-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-slate-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-100 mb-2">Chưa có CV nào</h3>
      <p className="text-slate-500 dark:text-zinc-400 mb-8 max-w-md mx-auto">Bạn có thể tạo một CV mới hoàn toàn bằng AI, dùng Template, hoặc tải lên CV có sẵn của bạn.</p>
      <div className="flex justify-center gap-4">
        <button 
          onClick={onCreateClick}
          disabled={isUploading}
          className="px-6 py-2.5 bg-blue-600 text-white font-bold cursor-pointer rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Bắt đầu tạo CV
        </button>
      </div>
    </div>
  );
}