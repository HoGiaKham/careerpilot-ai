// import Link from 'next/link';

// interface WorkspaceHeaderProps {
//   onUploadClick: () => void;
//   onCreateClick: () => void;
//   isUploading: boolean;
// }

// export default function WorkspaceHeader({ onUploadClick, onCreateClick, isUploading }: WorkspaceHeaderProps) {
//   return (
//     <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 flex flex-col lg:flex-row items-start lg:items-center justify-between mb-10 gap-6">
      
//       {/* Khối bên trái: Nút Back + Tiêu đề */}
//       <div>
//         <Link 
//           href="/dashboard" 
//           className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800/50 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg transition-colors mb-4"
//         >
//           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//             <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//           </svg>
//           Về trang chủ
//         </Link>
//         <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">CV Của Tôi</h1>
//         <p className="text-slate-500 dark:text-zinc-400 mt-2 font-medium">Tạo, tải lên và quản lý không gian CV của bạn</p>
//       </div>
      
//       {/* Khối bên phải: Các nút hành động */}
//       <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
//         <button 
//           onClick={onUploadClick}
//           disabled={isUploading}
//           className="flex-1 lg:flex-none px-6 py-3 bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl hover:border-slate-300 dark:hover:border-zinc-600 hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
//         >
//           {isUploading ? (
//             <svg className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//             </svg>
//           ) : (
//             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
//             </svg>
//           )}
//           {isUploading ? 'Đang tải lên...' : 'Tải CV lên'}
//         </button>

//         <button 
//           onClick={onCreateClick}
//           disabled={isUploading}
//           className="flex-1 lg:flex-none px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
//         >
//           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//           </svg>
//           Tạo CV
//         </button>
//       </div>
//     </div>
//   );
// }
import Link from 'next/link';
import toast from 'react-hot-toast';

interface WorkspaceHeaderProps {
  onUploadClick: () => void;
  onCreateClick: () => void;
  isUploading: boolean;
}

export default function WorkspaceHeader({
  onUploadClick,
  onCreateClick,
  isUploading,
}: WorkspaceHeaderProps) {
  const handleCreateClick = () => {
    toast('Tính năng đang phát triển', {
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 flex flex-col lg:flex-row items-start lg:items-center justify-between mb-10 gap-6">

      {/* Khối bên trái: Nút Back + Tiêu đề */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800/50 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg transition-colors mb-4"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Về trang chủ
        </Link>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
          CV Của Tôi
        </h1>

        <p className="text-slate-500 dark:text-zinc-400 mt-2 font-medium">
          Tạo, tải lên và quản lý không gian CV của bạn
        </p>
      </div>

      {/* Khối bên phải: Các nút hành động */}
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">

        {/* Upload CV */}
        <button
          onClick={onUploadClick}
          disabled={isUploading}
          className="flex-1 lg:flex-none px-6 py-3 bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl hover:border-slate-300 dark:hover:border-zinc-600 hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isUploading ? (
            <svg
              className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          )}

          {isUploading ? 'Đang tải lên...' : 'Tải CV lên'}
        </button>

        {/* Tạo CV */}
        <button
          onClick={handleCreateClick}
          disabled={isUploading}
          className="flex-1 lg:flex-none px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>

          Tạo CV
        </button>
      </div>
    </div>
  );
}