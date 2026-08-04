import Link from 'next/link';

export default function MyCvsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="text-center bg-white p-10 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
        <div className="text-5xl mb-4">📄</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý CV</h1>
        <p className="text-gray-500 mb-8">Nơi lưu trữ các phiên bản CV khác nhau của bạn đang được xây dựng.</p>
        
        <Link 
          href="/"
          className="inline-block bg-blue-50 text-blue-600 font-semibold px-6 py-2.5 rounded-full hover:bg-blue-100 transition-colors"
        >
          &larr; Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
}