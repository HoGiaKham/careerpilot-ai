// Component này trình bày các đặc điểm cốt lõi (Why Choose Us / Features) của nền tảng Career Copilot AI.
import { Brain, Target, Zap } from 'lucide-react';

export default function Features() {
  return (
    <section id="features" className="py-24 bg-[#FAFAFA]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Tại sao chọn Career Copilot AI?</h2>
          <p className="text-base sm:text-lg text-slate-500">Hệ thống được thiết kế để cung cấp cho bạn những insight chân thực nhất, giống như đang được một Senior HR review CV.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-default">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Nhận diện ngữ cảnh thông minh</h3>
            <p className="text-slate-500 leading-relaxed text-sm">AI không chỉ tìm từ khóa (keyword matching) mà còn hiểu được bối cảnh kinh nghiệm của bạn so với yêu cầu công việc.</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-default">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Phát hiện điểm mù (Missing Skills)</h3>
            <p className="text-slate-500 leading-relaxed text-sm">Chỉ ra chính xác những công nghệ, kỹ năng mềm mà JD yêu cầu nhưng bạn lại vô tình bỏ sót trong CV.</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-default">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Đề xuất cải thiện (Actionable)</h3>
            <p className="text-slate-500 leading-relaxed text-sm">Không chỉ chấm điểm, hệ thống đưa ra các lời khuyên thực tế để bạn viết lại gạch đầu dòng trong CV ấn tượng hơn.</p>
          </div>
        </div>
      </div>
    </section>
  );
}