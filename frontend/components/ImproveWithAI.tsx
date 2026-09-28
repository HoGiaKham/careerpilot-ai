'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface ImproveWithAIProps {
  fieldType: string;
  currentText: string;
  context?: string;
  onApply: (newText: string) => void;
}

export default function ImproveWithAI({ fieldType, currentText, context, onApply }: ImproveWithAIProps) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const handleImprove = async () => {
    if (!currentText || currentText.trim() === '') {
      toast.error('Hãy nhập nội dung trước khi dùng AI cải thiện!');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/ai/improve-field`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fieldType, currentText, context }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuggestion(data.data.improvedText);
      } else {
        throw new Error(data.message || 'Lỗi khi gọi AI');
      }
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={handleImprove}
        disabled={loading}
        className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 cursor-pointer disabled:opacity-60"
      >
        {loading ? (
          <>
            <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Đang cải thiện...
          </>
        ) : (
          <>✨ Improve with AI</>
        )}
      </button>

      {suggestion && (
        <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/40 rounded-xl text-sm">
          <p className="text-xs font-bold text-purple-700 dark:text-purple-400 mb-1">Gợi ý từ AI:</p>
          <p className="text-slate-700 dark:text-zinc-300 mb-3 whitespace-pre-line">{suggestion}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { onApply(suggestion); setSuggestion(null); }}
              className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 cursor-pointer"
            >
              Áp dụng
            </button>
            <button
              type="button"
              onClick={() => setSuggestion(null)}
              className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 text-xs font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-700 cursor-pointer"
            >
              Bỏ qua
            </button>
          </div>
        </div>
      )}  
    </div>
  );
}