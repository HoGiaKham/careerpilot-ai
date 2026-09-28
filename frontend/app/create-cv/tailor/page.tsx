'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageProvider';

// Chỉ khai báo phần trang này cần dùng, để không phụ thuộc đường dẫn file ResumeData.
// Nếu muốn dùng type gốc: xóa 2 interface dưới và import { ResumeData } từ file types của bạn.
interface ExperienceLite {
  id: string;
  title: string;
  company: string;
  description: string;
  [key: string]: unknown;
}
interface ResumeData {
  summary: string;
  skills: string[];
  experience: ExperienceLite[];
  [key: string]: unknown;
}

interface CvOption {
  id: string;
  originalName?: string;
  sourceType?: string;
  updatedAt: string;
}

interface TailorResult {
  base: ResumeData;
  tailored: ResumeData;
  gaps: string[];
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const CARD = 'bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800';
const LABEL = 'block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5';

const sourceLabel = (t?: string) =>
  t === 'WORKSPACE' ? 'PDF' : t === 'AI_GENERATED' ? 'AI tạo' : t === 'AI_TAILORED' ? 'AI tinh chỉnh' : 'Thủ công';

function BeforeAfter({ before, after }: { before: string; after: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700">
        <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1">Trước</p>
        <p className="text-sm whitespace-pre-line text-slate-700 dark:text-zinc-300">{before || '—'}</p>
      </div>
      <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/40">
        <p className="text-xs font-bold text-purple-700 dark:text-purple-400 mb-1">Sau (AI)</p>
        <p className="text-sm whitespace-pre-line text-slate-700 dark:text-zinc-300">{after || '—'}</p>
      </div>
    </div>
  );
}

function AcceptToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-purple-600"
      />
      Dùng bản AI
    </label>
  );
}

export default function TailorCvPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cvs, setCvs] = useState<CvOption[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [jdText, setJdText] = useState('');
  const [running, setRunning] = useState(false);

  const [result, setResult] = useState<TailorResult | null>(null);
  const [acceptSummary, setAcceptSummary] = useState(true);
  const [acceptSkills, setAcceptSkills] = useState(true);
  const [acceptExp, setAcceptExp] = useState<Record<number, boolean>>({});
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const getToken = () => localStorage.getItem('token');

  const fetchCvs = async () => {
    const token = getToken();
    if (!token) {
      toast.error('Vui lòng đăng nhập!');
      router.push('/login');
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/resume/list`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (res.ok && data.success) setCvs(data.data);
      else toast.error(data.message || 'Không tải được danh sách CV');
    } catch {
      toast.error('Không kết nối được máy chủ');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchCvs();
    // Mở từ menu ở /my-cvs: /create-cv/tailor?resumeId=...
    const preset = new URLSearchParams(window.location.search).get('resumeId');
    if (preset) setSelectedId(preset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Vui lòng chỉ tải lên file PDF!');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng file vượt quá 5MB!');
      e.target.value = '';
      return;
    }
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    const loading = toast.loading('Đang tải CV lên...');
    try {
      const res = await fetch(`${apiUrl}/resume/workspace/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Tải file thất bại');
      await fetchCvs();
      setSelectedId(data.data.id); // chọn luôn CV vừa upload
      toast.success('Đã tải CV lên!', { id: loading });
    } catch (err: any) {
      toast.error(err.message || 'Tải file thất bại', { id: loading });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleTailor = async () => {
    if (!selectedId) return toast.error('Vui lòng chọn CV gốc!');
    if (jdText.trim().length < 50) return toast.error('JD quá ngắn, hãy dán đầy đủ mô tả công việc!');

    setRunning(true);
    const loading = toast.loading('AI đang tinh chỉnh CV theo JD...');
    try {
      const res = await fetch(`${apiUrl}/resume/workspace/tailor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ resumeId: selectedId, jdText, language: lang }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Lỗi từ máy chủ');

      const r: TailorResult = data.data;
      setResult(r);
      setAcceptSummary(true);
      setAcceptSkills(true);
      setAcceptExp(Object.fromEntries(r.base.experience.map((_, i) => [i, true])));
      const src = cvs.find((c) => c.id === selectedId);
      setName(`${src?.originalName || 'CV'} – Tailored`);
      toast.success('Đã có bản đề xuất!', { id: loading });
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra', { id: loading });
    } finally {
      setRunning(false);
    }
  };

  const handleSave = async () => {
    if (!result || !selectedId) return;
    const { base, tailored } = result;
    const merged: ResumeData = {
      ...base,
      summary: acceptSummary ? tailored.summary : base.summary,
      skills: acceptSkills ? tailored.skills : base.skills,
      experience: base.experience.map((e, i) => (acceptExp[i] ? tailored.experience[i] : e)),
    };

    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/resume/workspace/tailor/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ sourceResumeId: selectedId, cvData: merged, name }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Lỗi khi lưu CV');
      toast.success('Đã tạo bản CV mới!');
      router.push(`/cv-editor/${data.data.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu CV');
    } finally {
      setSaving(false);
    }
  };

  // ---------- BƯỚC 2: DUYỆT KẾT QUẢ ----------
  if (result) {
    const { base, tailored, gaps } = result;
    const summaryChanged = base.summary !== tailored.summary;
    const skillsChanged = JSON.stringify(base.skills) !== JSON.stringify(tailored.skills);
    const expChanged = base.experience.map((e, i) => e.description !== tailored.experience[i]?.description);
    const nothingChanged = !summaryChanged && !skillsChanged && !expChanged.some(Boolean);

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-24 font-sans text-slate-900 dark:text-zinc-100">
        <main className="max-w-4xl mx-auto p-6 pt-10 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold">Duyệt bản đề xuất</h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Chọn phần nào bạn muốn giữ bản AI. CV gốc sẽ không bị thay đổi, kết quả được lưu thành một bản mới.
            </p>
          </div>

          {gaps.length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
              <h2 className="font-bold text-amber-800 dark:text-amber-300 mb-2">
                JD yêu cầu nhưng CV của bạn chưa thể hiện
              </h2>
              <div className="flex flex-wrap gap-2">
                {gaps.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 text-xs font-bold rounded-full bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300"
                  >
                    {g}
                  </span>
                ))}
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-3">
                AI không tự thêm các kỹ năng này vào CV. Nếu bạn thật sự có, hãy thêm thủ công trong editor.
              </p>
            </div>
          )}

          {summaryChanged && (
            <section className={CARD}>
              <div className="flex items-center justify-between">
                <h2 className="font-bold">Giới thiệu bản thân (Summary)</h2>
                <AcceptToggle checked={acceptSummary} onChange={setAcceptSummary} />
              </div>
              <BeforeAfter before={base.summary} after={tailored.summary} />
            </section>
          )}

          {base.experience.map((e, i) =>
            expChanged[i] ? (
              <section key={e.id ?? i} className={CARD}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-bold">
                    {e.title}{' '}
                    <span className="font-medium text-slate-500 dark:text-zinc-400">· {e.company}</span>
                  </h2>
                  <AcceptToggle
                    checked={!!acceptExp[i]}
                    onChange={(v) => setAcceptExp({ ...acceptExp, [i]: v })}
                  />
                </div>
                <BeforeAfter before={e.description} after={tailored.experience[i].description} />
              </section>
            ) : null
          )}

          {skillsChanged && (
            <section className={CARD}>
              <div className="flex items-center justify-between">
                <h2 className="font-bold">Kỹ năng (sắp xếp theo mức liên quan tới JD)</h2>
                <AcceptToggle checked={acceptSkills} onChange={setAcceptSkills} />
              </div>
              <BeforeAfter before={base.skills.join(', ')} after={tailored.skills.join(', ')} />
            </section>
          )}

          {nothingChanged && (
            <div className={CARD + ' text-sm text-slate-500 dark:text-zinc-400'}>
              AI không đề xuất thay đổi nào. Có thể JD quá chung chung, hãy thử dán JD đầy đủ hơn.
            </div>
          )}

          <section className={CARD}>
            <label className={LABEL}>Tên bản CV mới</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setResult(null)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
              >
                Quay lại
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:opacity-60 cursor-pointer"
              >
                {saving ? 'Đang lưu...' : 'Lưu thành CV mới'}
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // ---------- BƯỚC 1: CHỌN CV + DÁN JD ----------
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-24 font-sans text-slate-900 dark:text-zinc-100">
      <main className="max-w-4xl mx-auto p-6 pt-10 space-y-6">
        <div>
          <button
            onClick={() => router.back()}
            className="text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white mb-3 cursor-pointer"
          >
            ← Quay lại
          </button>
          <h1 className="text-2xl font-extrabold">Tinh chỉnh CV theo JD</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Chọn CV gốc, dán JD, AI sẽ viết lại Summary, Kinh nghiệm và Kỹ năng cho khớp mà không bịa thêm thông tin.
          </p>
        </div>

        <section className={CARD}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">1. Chọn CV gốc</h2>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-60 cursor-pointer"
            >
              {uploading ? 'Đang tải...' : '+ Tải PDF từ máy'}
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
          </div>

          {loadingList ? (
            <p className="text-sm text-slate-500">Đang tải danh sách...</p>
          ) : cvs.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Bạn chưa có CV nào. Hãy tải một file PDF từ máy lên.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cvs.map((cv) => (
                <button
                  key={cv.id}
                  onClick={() => setSelectedId(cv.id)}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedId === cv.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/30'
                      : 'border-slate-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-800'
                  }`}
                >
                  <p className="font-bold text-sm truncate">{cv.originalName || 'CV không tên'}</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{sourceLabel(cv.sourceType)}</p>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className={CARD}>
          <h2 className="font-bold mb-4">2. Dán Job Description</h2>
          <label className={LABEL}>Mô tả công việc (JD)</label>
          <textarea
            rows={10}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Dán toàn bộ JD vào đây: nhiệm vụ, yêu cầu, quyền lợi..."
            className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y"
          />
        </section>

        <div className="flex justify-end">
          <button
            onClick={handleTailor}
            disabled={running || uploading}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg disabled:opacity-60 cursor-pointer"
          >
            {running ? 'AI đang xử lý...' : '✨ Tinh chỉnh theo JD'}
          </button>
        </div>
      </main>
    </div>
  );
}