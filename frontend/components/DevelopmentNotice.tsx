'use client';

export default function DevelopmentNotice() {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] animate-pulse">
      <div className="px-4 py-2.5 rounded-full bg-amber-50 dark:bg-amber-950/90 border border-amber-200 dark:border-amber-800 shadow-lg backdrop-blur-sm">
        <p className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-300 text-center">
          Hệ thống đang trong quá trình phát triển. Nếu gặp lỗi, vui lòng báo cho chúng tôi.
        </p>
      </div>
    </div>
  );
}