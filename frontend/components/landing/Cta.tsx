// Component này hiển thị khối kêu gọi hành động mạnh mẽ (Final CTA Banner) ở cuối trang.
import Link from 'next/link';

export default function Cta() {
  return (
    <section className="py-24 bg-slate-900 text-white text-center px-6 border-t-4 border-blue-600 relative overflow-hidden">
      <div className="max-w-3xl mx-auto relative z-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6">Sẵn sàng để có một CV hoàn hảo?</h2>
        <p className="text-base sm:text-lg text-slate-400 mb-10">Đừng để một CV thiếu từ khóa đánh mất cơ hội nghề nghiệp của bạn. Hãy để AI kiểm tra giúp bạn trước khi nhấn nút "Apply".</p>
        <Link 
          href="/dashboard"
          className="inline-block bg-white text-slate-900 font-bold px-10 py-4 rounded-full text-lg shadow-xl hover:scale-105 transition-transform active:scale-95"
        >
          Bắt đầu phân tích ngay &rarr;
        </Link>
      </div>
    </section>
  );
}