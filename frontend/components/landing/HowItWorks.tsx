// Component này minh họa quy trình sử dụng 3 bước đơn giản kèm đường kẻ nối trực quan (How It Works).
export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">3 bước để sẵn sàng ứng tuyển</h2>
          <p className="text-slate-500 text-base sm:text-lg">Quy trình tối giản giúp bạn tiết kiệm thời gian nhất.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-8 justify-center relative">
          
          <div className="hidden md:block absolute top-16 left-[15%] right-[15%] h-[2px] bg-slate-200 z-0"></div>
          
          <div className="flex-1 text-center relative z-10 bg-white md:bg-transparent p-6 rounded-2xl border border-slate-100 md:border-none shadow-sm md:shadow-none">
            <div className="w-20 h-20 mx-auto bg-white border-2 border-slate-100 rounded-full flex items-center justify-center text-2xl font-black text-slate-900 shadow-sm mb-6 relative z-20 hover:scale-110 transition-transform">1</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Tải CV (PDF)</h3>
            <p className="text-slate-500 text-sm">Kéo thả file CV hiện tại của bạn vào hệ thống.</p>
          </div>
          <div className="flex-1 text-center relative z-10 bg-white md:bg-transparent p-6 rounded-2xl border border-slate-100 md:border-none shadow-sm md:shadow-none">
            <div className="w-20 h-20 mx-auto bg-white border-2 border-slate-100 rounded-full flex items-center justify-center text-2xl font-black text-slate-900 shadow-sm mb-6 relative z-20 hover:scale-110 transition-transform">2</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Dán Job Description</h3>
            <p className="text-slate-500 text-sm">Copy yêu cầu công việc bạn muốn ứng tuyển.</p>
          </div>
          <div className="flex-1 text-center relative z-10 bg-white md:bg-transparent p-6 rounded-2xl border border-slate-100 md:border-none shadow-sm md:shadow-none">
            <div className="w-20 h-20 mx-auto bg-blue-600 border-4 border-white rounded-full flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-blue-200 mb-6 relative z-20 hover:scale-110 transition-transform">3</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Nhận kết quả AI</h3>
            <p className="text-slate-500 text-sm">Nhận phân tích chi tiết và chỉnh sửa CV ngay.</p>
          </div>
        </div>
      </div>
    </section>
  );
}