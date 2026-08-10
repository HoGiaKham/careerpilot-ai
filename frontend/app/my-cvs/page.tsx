// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { toast } from 'react-hot-toast';
// import { useLanguage } from '@/context/LanguageProvider';

// interface ResumeItem {
//   id: string;
//   fileUrl: string;
//   createdAt: string;
// }

// export default function MyCvsPage() {
//   const [cvList, setCvList] = useState<ResumeItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const { t, lang } = useLanguage();

//   useEffect(() => {
//     fetchCvs();
//   }, []);

//   const fetchCvs = async () => {
//     const token = localStorage.getItem('token');
    
//     if (!token) {
//       toast.error(t.myCvs.loginRequired);
//       setLoading(false);
//       return;
//     }

//     try {
//       const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
//       const response = await fetch(`${apiUrl}/resume/list`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       const data = await response.json();

//       if (response.ok && data.success) {
//         setCvList(data.data);
//       } else {
//         toast.error(data.message || t.myCvs.loadError);
//       }
//     } catch (error) {
//       console.error('Fetch CVs error:', error);
//       toast.error(t.myCvs.connectionError);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDate = (dateString: string) => {
//     return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'vi-VN', {
//       day: '2-digit', month: '2-digit', year: 'numeric',
//       hour: '2-digit', minute: '2-digit'
//     }).format(new Date(dateString));
//   };

//   const extractFileName = (url: string) => {
//     const parts = url.split('/');
//     const fileWithExt = parts[parts.length - 1];
//     return fileWithExt.length > 25 ? fileWithExt.substring(0, 25) + '...' : fileWithExt;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 font-sans">
//         <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
//         <p className="text-slate-500 dark:text-zinc-400 font-medium">{t.myCvs.loading}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20 font-sans text-slate-900 dark:text-zinc-100 transition-colors">
//       <main className="max-w-7xl mx-auto p-6 pt-10">
        
//         {/* HEADER SAAS PRO: Hỗ trợ Dark Mode */}
//         <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 flex items-center justify-between mb-10">
//           <div>
//             <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">{t.myCvs.title}</h1>
//             <p className="text-slate-500 dark:text-zinc-400 mt-2 font-medium">{t.myCvs.subtitle}</p>
//           </div>
//           <Link 
//             href="/dashboard"
//             className="px-5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all flex items-center gap-2 text-sm"
//           >
//             &larr; {t.myCvs.backHome}
//           </Link>
//         </div>

//         {cvList.length === 0 ? (
//           // TRƯỜNG HỢP TRỐNG (EMPTY STATE CHUẨN)
//           <div className="text-center bg-white dark:bg-zinc-900 p-12 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 mt-10">
//             <svg className="w-16 h-16 text-slate-300 dark:text-zinc-700 mb-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//             </svg>
//             <h3 className="text-xl font-bold text-slate-700 dark:text-zinc-200 mb-2">{t.myCvs.emptyTitle}</h3>
//             <p className="text-slate-500 dark:text-zinc-400 mb-6 max-w-md mx-auto leading-relaxed">{t.myCvs.emptyDesc}</p>
//             <Link 
//               href="/dashboard"
//               className="inline-block bg-blue-600 text-white font-bold px-8 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
//             >
//               {t.myCvs.emptyCta}
//             </Link>
//           </div>
//         ) : (
//           // Grid Layout hiển thị thẻ CV
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//             {cvList.map((cv) => (
//               <div 
//                 key={cv.id} 
//                 className="group flex flex-col bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-md transition-all duration-300"
//               >
//                 {/* File Icon SVG */}
//                 <div className="mb-5">
//                   <div className="w-12 h-12 bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-slate-100 dark:border-zinc-700">
//                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
//                     </svg>
//                   </div>
//                 </div>

//                 <h3 className="text-base font-bold text-slate-900 dark:text-white truncate mb-1.5" title={extractFileName(cv.fileUrl)}>
//                   {extractFileName(cv.fileUrl)}
//                 </h3>
//                 <p className="text-xs font-medium text-slate-400 dark:text-zinc-500 mb-6">
//                   Đã tải lên {formatDate(cv.createdAt)}
//                 </p>

//                 <div className="mt-auto pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
//                   <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-lg">
//                     PDF Document
//                   </span>
//                   <a 
//                     href={cv.fileUrl} 
//                     target="_blank" 
//                     rel="noopener noreferrer"
//                     className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
//                   >
//                     {t.myCvs.openFile}
//                   </a>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageProvider';

export default function MyCvsPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20 relative font-sans text-gray-900 dark:text-zinc-100 transition-colors">
      <main className="max-w-6xl mx-auto p-6 pt-10">

        {/* HEADER */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              Quản lý CV
            </h1>

            <p className="text-slate-500 dark:text-zinc-400 mt-2 font-medium">
              Lưu trữ và quản lý các phiên bản CV bạn đã tải lên.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all flex items-center gap-2 text-sm"
          >
            ← Về trang chủ
          </Link>
        </div>

        {/* UNDER DEVELOPMENT */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 min-h-[450px] flex items-center justify-center">

          <div className="text-center px-6">

            {/* ICON */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 4.414V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            {/* STATUS */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400 text-sm font-bold">
              🚧 Tính năng đang phát triển
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}