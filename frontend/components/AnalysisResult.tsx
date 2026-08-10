'use client';

import { AnalysisData } from '../type/resume';
import DownloadReportButton from './DownloadReportButton';
import { useLanguage } from '@/context/LanguageProvider';

interface AnalysisResultProps {
  result: AnalysisData;
  candidateName?: string;
  targetPosition?: string;
  cvFile?: File | null; // 💡 ĐÃ FIX: Khai báo thêm prop cvFile
}

export default function AnalysisResult({
  result,
  candidateName = 'Người dùng CareerPilot',
  targetPosition = 'Vị trí theo JD',
  cvFile = null,
}: AnalysisResultProps) {
  const score = result.matchScore ?? 0;
  const { t, lang } = useLanguage();

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-600';
    if (s >= 60) return 'text-blue-600';
    if (s >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return t.analysis.excellent;
    if (s >= 60) return t.analysis.good;
    if (s >= 40) return t.analysis.average;
    return t.analysis.poor;
  };

  const getScoreDescription = (s: number) => {
    if (s >= 80) return 'CV của bạn hoàn toàn phù hợp với yêu cầu của vị trí này.';
    if (s >= 60) return 'CV có mức độ phù hợp tốt. Cần bổ sung thêm một số kỹ năng để hoàn hảo hơn.';
    if (s >= 40) return 'Mức độ phù hợp trung bình. Hãy tập trung cải thiện các kỹ năng còn thiếu bên dưới.';
    return 'CV hiện tại chưa đáp ứng được yêu cầu tối thiểu của công việc này.';
  };

  const recommendations =
    result.recommendations && result.recommendations.length > 0
      ? result.recommendations
      : [lang === 'en' ? 'Add technical keywords from the JD into the Skills section of your CV.' : 'Bổ sung các từ khóa kỹ thuật từ JD vào phần Kỹ năng của CV'];

  const missingSkillsList = result.missingSkills || [];

  // 💡 HÀM MỚI: Xử lý việc tải file CV gốc
  const handleDownloadCV = () => {
    if (cvFile) {
      const url = URL.createObjectURL(cvFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = cvFile.name; // Lấy đúng tên file gốc
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="mt-12 bg-white rounded-2xl shadow-md border border-gray-100 font-sans print:shadow-none print:border-none print:m-0 print:p-0 print:bg-white">
      
      {/* ================= 1. GIAO DIỆN WEB (SẼ BỊ ẨN KHI LƯU PDF) ================= */}
      <div className="p-8 print:hidden animate-fade-in-up">
        <div className="text-center mb-10 border-b border-gray-100 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-4 cursor-default">
            <span>🤖</span> Phân tích bởi AI
          </div>

          <div className="flex flex-col items-center justify-center">
            <span className={`text-6xl font-black tracking-tight ${getScoreColor(score)}`}>
              {score}%
            </span>
            <span className="text-gray-500 text-sm uppercase tracking-wider font-bold mt-1">
              Độ Phù Hợp
            </span>
          </div>

          <p className="text-gray-700 font-semibold mt-3 text-base">{getScoreLabel(score)}</p>
          <p className="text-gray-500 text-sm mt-1 max-w-lg mx-auto">
            {result.summary || getScoreDescription(score)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-50 p-6 rounded-xl border border-green-100">
            <h4 className="font-bold text-green-800 flex items-center gap-2 mb-4 text-base"><span>✅</span> Điểm mạnh của bạn</h4>
            {(result.strengths || []).length > 0 ? (
              <ul className="space-y-2.5">
                {result.strengths.map((item, idx) => (
                  <li key={idx} className="text-sm text-green-900 leading-relaxed flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span><span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (<p className="text-sm text-green-700/60 italic">Không có dữ liệu</p>)}
          </div>

          <div className="bg-red-50 p-6 rounded-xl border border-red-100">
            <h4 className="font-bold text-red-800 flex items-center gap-2 mb-4 text-base"><span>⚠️</span> Điểm cần cải thiện</h4>
            {(result.weaknesses || []).length > 0 ? (
              <ul className="space-y-2.5">
                {result.weaknesses.map((item, idx) => (
                  <li key={idx} className="text-sm text-red-900 leading-relaxed flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span><span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (<p className="text-sm text-red-700/70 italic">Không có điểm yếu nổi bật.</p>)}
          </div>

          <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
            <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-4 text-base"><span>🎯</span> Kỹ năng còn thiếu</h4>
            {missingSkillsList.length > 0 ? (
              <ul className="space-y-2.5">
                {missingSkillsList.map((item, idx) => (
                  <li key={idx} className="text-sm text-amber-900 leading-relaxed flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span><span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (<p className="text-sm text-amber-700/70 italic">Không thiếu kỹ năng quan trọng.</p>)}
          </div>
        </div>

        <div className="bg-blue-50/70 p-6 rounded-xl border border-blue-100 mb-8">
          <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-3 text-base"><span>💡</span> Đề xuất từ AI</h4>
          <ul className="space-y-2">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-blue-950 font-medium flex items-start gap-2">
                <span className="text-blue-500 font-bold">{idx + 1}.</span><span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-center gap-4">
          <DownloadReportButton result={result} candidateName={candidateName} targetPosition={targetPosition} />
          {/* 💡 NÚT TẢI PDF GỐC MỚI THÊM VÀO ĐÂY */}
          {cvFile && (
            <button
              onClick={handleDownloadCV}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer text-sm"
            >
              <span>📄</span> Tải CV gốc
            </button>
          )}
        </div>
      </div>

      {/* ================= 2. GIAO DIỆN BẢN IN PDF (SẼ BỊ ẨN TRÊN WEB) ================= */}
      {/* Đã bỏ các số 1., 2., 3... ở thẻ h2 */}
      <div id="pdf-report-content" className="hidden print:block p-8 text-gray-900 font-sans leading-relaxed">
        <div className="border-b-2 border-gray-200 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-blue-800">CareerPilot AI</h1>
          <p className="text-gray-500 mt-1 font-medium">Báo cáo phân tích mức độ phù hợp CV (AI Resume Analysis)</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
          <div><span className="font-bold">Ứng viên:</span> {candidateName}</div>
          <div><span className="font-bold">Vị trí ứng tuyển:</span> {targetPosition}</div>
          <div><span className="font-bold">Ngày xuất:</span> {new Date().toLocaleDateString('vi-VN')}</div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-blue-800 mb-2">Độ phù hợp tổng quan (Overall Compatibility)</h2>
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-100">
            <span className={`text-6xl font-black ${getScoreColor(score)}`}>{score}%</span>
            <span className="text-gray-600 font-bold mt-2">{getScoreLabel(score)}</span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-800 mb-2">Đánh giá từ AI (AI Summary)</h2>
          <p className="text-gray-700 text-sm">
            {result.summary || 'CV của bạn có sự liên quan nhất định đến vị trí. Hãy xem chi tiết các điểm bên dưới.'}
          </p>
        </div>

        <div className="mb-6 print:break-inside-avoid">
          <h2 className="text-xl font-bold text-green-700 mb-2">Điểm mạnh (Strengths)</h2>
          <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700">
            {(result.strengths || []).length > 0 ? (
              result.strengths.map((item, idx) => <li key={idx}>{item}</li>)
            ) : (<li className="italic text-gray-500">Chưa có dữ liệu.</li>)}
          </ul>
        </div>

        <div className="mb-6 print:break-inside-avoid">
          <h2 className="text-xl font-bold text-red-700 mb-2">Điểm cần cải thiện (Areas To Improve)</h2>
          <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700">
            {(result.weaknesses || []).length > 0 ? (
              result.weaknesses.map((item, idx) => <li key={idx}>{item}</li>)
            ) : (<li className="italic text-gray-500">Không có điểm yếu nổi bật.</li>)}
          </ul>
        </div>

        <div className="mb-6 print:break-inside-avoid">
          <h2 className="text-xl font-bold text-amber-600 mb-2">Kỹ năng còn thiếu (Missing Skills)</h2>
          <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700">
            {missingSkillsList.length > 0 ? (
              missingSkillsList.map((item, idx) => <li key={idx}>{item}</li>)
            ) : (<li className="italic text-gray-500">Không thiếu kỹ năng quan trọng.</li>)}
          </ul>
        </div>

        <div className="mb-8 print:break-inside-avoid">
          <h2 className="text-xl font-bold text-blue-800 mb-2">Đề xuất hành động (Recommended Actions)</h2>
          <ul className="list-decimal pl-5 text-sm space-y-1 text-gray-700 font-medium">
            {recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
          </ul>
        </div>

        <div className="mt-12 pt-4 border-t-2 border-gray-200 text-center text-xs text-gray-400">
          <p>Generated by CareerPilot AI - Nền tảng tối ưu CV thông minh</p>
          <p>https://careerpilot.ai</p>
        </div>
      </div>
    </div>
  );
}