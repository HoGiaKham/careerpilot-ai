'use client';
import { AnalysisData } from '../type/resume';

interface AnalysisResultProps {
  result: AnalysisData;
}

export default function AnalysisResult({ result }: AnalysisResultProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="mt-12 bg-white p-8 rounded-2xl shadow-md border border-gray-100 animate-fade-in-up">
      <div className="text-center mb-8 border-b border-gray-100 pb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Kết quả phân tích từ AI</h3>
        <div className="mt-4 flex flex-col items-center justify-center">
          <span className="text-gray-500 text-sm uppercase tracking-wider font-semibold mb-1">Match Score</span>
          <span className={`text-6xl font-black ${getScoreColor(result.matchScore)}`}>
            {result.matchScore}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Điểm mạnh */}
        <div className="bg-green-50 p-6 rounded-xl border border-green-100 transition-all hover:shadow-md cursor-default">
          <h4 className="font-bold text-green-800 flex items-center gap-2 mb-4 text-lg">
            <span>✅</span> Điểm mạnh của bạn
          </h4>
          <ul className="space-y-3">
            {(result.strengths || []).map((item, idx) => (
              <li key={idx} className="text-sm text-green-900 leading-relaxed font-medium flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Điểm yếu */}
        <div className="bg-red-50 p-6 rounded-xl border border-red-100 transition-all hover:shadow-md cursor-default">
          <h4 className="font-bold text-red-800 flex items-center gap-2 mb-4 text-lg">
            <span>⚠️</span> Điểm cần cải thiện
          </h4>
          <ul className="space-y-3">
            {(result.weaknesses || []).map((item, idx) => (
              <li key={idx} className="text-sm text-red-900 leading-relaxed font-medium flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Kỹ năng thiếu */}
        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 transition-all hover:shadow-md cursor-default">
          <h4 className="font-bold text-yellow-800 flex items-center gap-2 mb-4 text-lg">
            <span>🎯</span> Kỹ năng còn thiếu
          </h4>
          <ul className="space-y-3">
            {(result.missingSkills || []).map((item, idx) => (
              <li key={idx} className="text-sm text-yellow-900 leading-relaxed font-medium flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}