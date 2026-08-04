// Component này hiển thị các chỉ số nổi bật của hệ thống (Stats Bar) nằm ngay dưới phần Hero.
import { ShieldCheck } from 'lucide-react';

export default function Stats() {
  return (
    <section className="py-12 border-y border-slate-200 bg-white relative z-20">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
        <div className="p-2">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">~10s</div>
          <div className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">Tốc độ phân tích</div>
        </div>
        <div className="p-2">
          <div className="text-lg sm:text-xl font-black text-slate-900 mb-1 mt-1">Google Gemini</div>
          <div className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">Mô hình AI cốt lõi</div>
        </div>
        <div className="p-2">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">PDF Engine</div>
          <div className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">Bóc tách dữ liệu</div>
        </div>
        <div className="p-2">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 flex items-center justify-center gap-1">
            <ShieldCheck className="w-6 h-6 text-emerald-600 inline" /> Secure
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">Bảo mật dữ liệu</div>
        </div>
      </div>
    </section>
  );
}