'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { ResumeData, genId } from '@/type/resumeData';
import ImproveWithAI from '@/components/ImproveWithAI';
import ResumePreview from './components/ResumePreview';

const SECTIONS = [
  { key: 'personal', label: 'Thông tin cá nhân' },
  { key: 'summary', label: 'Tóm tắt' },
  { key: 'experience', label: 'Kinh nghiệm' },
  { key: 'education', label: 'Học vấn' },
  { key: 'skills', label: 'Kỹ năng' },
  { key: 'projects', label: 'Dự án' },
  { key: 'certifications', label: 'Chứng chỉ' },
] as const;

type SectionKey = typeof SECTIONS[number]['key'];

export default function CvEditorPage() {
  const router = useRouter();
  const params = useParams();
  const cvId = params.id as string;

  const [cvData, setCvData] = useState<ResumeData | null>(null);
  const [sourceFileUrl, setSourceFileUrl] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdfOpen, setIsPdfOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionKey>('personal');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }
      try {
        const res = await fetch(`${apiUrl}/resume/workspace/${cvId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setCvData(data.data.cvData as ResumeData);
          setSourceFileUrl(data.data.fileUrl || null);
          if (data.data.fileUrl) {
            setPdfUrl(data.data.fileUrl);
          } else {
            setPdfUrl(null);
          }
        } else {
          toast.error(data.message || 'Không tải được CV');
          router.push('/my-cvs');
        }
      } catch {
        toast.error('Lỗi kết nối máy chủ');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvId]);

  // Autosave có debounce — chạy mỗi khi cvData đổi, chờ 1.5s sau khi ngừng gõ
  const scheduleAutosave = useCallback((data: ResumeData) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${apiUrl}/resume/workspace/${cvId}/data`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ cvData: data }),
        });
        if (res.ok) setSaveStatus('saved');
        else setSaveStatus('idle');
      } catch {
        setSaveStatus('idle');
      }
    }, 1500);
  }, [apiUrl, cvId]);

  const updateData = (updater: (prev: ResumeData) => ResumeData) => {
    setCvData((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      scheduleAutosave(next);
      return next;
    });
  };

  const getDownloadUrl = useCallback((url?: string | null) => {
    if (!url) return '';
    if (!url.includes('cloudinary.com')) return url;
    return url.replace('/upload/', '/upload/fl_attachment/');
  }, []);

  const generatePdfFromPreview = useCallback(async () => {
    if (!previewRef.current) return null;

    try {
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Không tạo được PDF preview.'));
        img.src = dataUrl;
      });

      const ratio = Math.min(pdfWidth / img.width, pdfHeight / img.height);
      const finalWidth = img.width * ratio;
      const finalHeight = img.height * ratio;
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      pdf.addImage(dataUrl, 'PNG', x, y, finalWidth, finalHeight);
      const blob = pdf.output('blob');
      const objectUrl = URL.createObjectURL(blob);
      setPdfUrl(objectUrl);
      return objectUrl;
    } catch {
      toast.error('Không thể tạo PDF preview cho CV này.');
      return null;
    }
  }, []);

  const openPdfPreview = useCallback(async () => {
    if (sourceFileUrl) {
      setPdfUrl(sourceFileUrl);
      setIsPdfOpen(true);
      return;
    }

    const generatedUrl = await generatePdfFromPreview();
    if (generatedUrl) {
      setIsPdfOpen(true);
    }
  }, [generatePdfFromPreview, sourceFileUrl]);

  const downloadPdf = useCallback(async () => {
    const targetUrl = sourceFileUrl ? getDownloadUrl(sourceFileUrl) : pdfUrl;
    if (!targetUrl) {
      const generatedUrl = await generatePdfFromPreview();
      if (!generatedUrl) return;
      const link = document.createElement('a');
      link.href = generatedUrl;
      link.download = 'cv-preview.pdf';
      link.click();
      return;
    }

    const link = document.createElement('a');
    link.href = targetUrl;
    link.download = 'cv-preview.pdf';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  }, [getDownloadUrl, generatePdfFromPreview, pdfUrl, sourceFileUrl]);

  useEffect(() => {
    return () => {
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  if (loading || !cvData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-100">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/my-cvs')} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-lg font-bold">Chỉnh sửa CV</h1>
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-2">
            <button
              type="button"
              onClick={openPdfPreview}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-sm transition-colors cursor-pointer"
            >
              Xem PDF
            </button>
            <button
              type="button"
              onClick={downloadPdf}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              Tải xuống
            </button>
            {saveStatus === 'saving' && <>⏳ Đang lưu...</>}
            {saveStatus === 'saved' && <>✅ Đã lưu</>}
            {saveStatus === 'idle' && <>Chưa có thay đổi</>}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar nav */}
        <aside className="lg:col-span-2">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  activeSection === s.key
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Form editor */}
        <section className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-6">
          {activeSection === 'personal' && <PersonalForm cvData={cvData} updateData={updateData} />}
          {activeSection === 'summary' && <SummaryForm cvData={cvData} updateData={updateData} />}
          {activeSection === 'experience' && <ExperienceForm cvData={cvData} updateData={updateData} />}
          {activeSection === 'education' && <EducationForm cvData={cvData} updateData={updateData} />}
          {activeSection === 'skills' && <SkillsForm cvData={cvData} updateData={updateData} />}
          {activeSection === 'projects' && <ProjectsForm cvData={cvData} updateData={updateData} />}
          {activeSection === 'certifications' && <CertificationsForm cvData={cvData} updateData={updateData} />}
        </section>

        {/* Live preview */}
        <section className="lg:col-span-5">
          <div className="sticky top-24">
            <div ref={previewRef}>
              <ResumePreview cvData={cvData} />
            </div>
          </div>
        </section>
      </main>

      {isPdfOpen && pdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">📄</span>
                <h3 className="font-bold text-slate-800 dark:text-white text-base">Preview PDF CV</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={downloadPdf}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors cursor-pointer"
                >
                  Tải xuống
                </button>
                <button
                  type="button"
                  onClick={() => setIsPdfOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 text-slate-700 dark:text-zinc-200 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 dark:bg-zinc-950 p-4">
              <iframe
                src={`${pdfUrl}#toolbar=0`}
                title="CV PDF Preview"
                className="w-full h-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white shadow-inner"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Sub-forms ----------

function inputClass() {
  return 'w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all';
}

function PersonalForm({ cvData, updateData }: { cvData: ResumeData; updateData: (u: (p: ResumeData) => ResumeData) => void }) {
  const p = cvData.personalInfo;
  const set = (key: keyof ResumeData['personalInfo'], value: string) =>
    updateData((prev) => ({ ...prev, personalInfo: { ...prev.personalInfo, [key]: value } }));

  const fields: { key: keyof ResumeData['personalInfo']; label: string; placeholder: string }[] = [
    { key: 'fullName', label: 'Họ và tên', placeholder: 'Hồ Gia Khâm' },
    { key: 'email', label: 'Email', placeholder: 'email@example.com' },
    { key: 'phone', label: 'Số điện thoại', placeholder: '0987 654 321' },
    { key: 'location', label: 'Địa điểm', placeholder: 'TP. Hồ Chí Minh' },
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/...' },
    { key: 'github', label: 'GitHub', placeholder: 'github.com/...' },
    { key: 'portfolio', label: 'Portfolio', placeholder: 'yourname.dev' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Thông tin cá nhân</h2>
      {fields.map((f) => (
        <div key={f.key}>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">{f.label}</label>
          <input
            type="text"
            value={p[f.key] || ''}
            placeholder={f.placeholder}
            onChange={(e) => set(f.key, e.target.value)}
            className={inputClass()}
          />
        </div>
      ))}
    </div>
  );
}

function SummaryForm({ cvData, updateData }: { cvData: ResumeData; updateData: (u: (p: ResumeData) => ResumeData) => void }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Tóm tắt bản thân</h2>
      <textarea
        rows={6}
        value={cvData.summary}
        onChange={(e) => updateData((prev) => ({ ...prev, summary: e.target.value }))}
        placeholder="2-3 câu giới thiệu ngắn gọn về bạn và giá trị bạn mang lại..."
        className={inputClass() + ' resize-none'}
      />
      <ImproveWithAI
        fieldType="summary"
        currentText={cvData.summary}
        context={cvData.personalInfo.fullName}
        onApply={(text) => updateData((prev) => ({ ...prev, summary: text }))}
      />
    </div>
  );
}

function ExperienceForm({ cvData, updateData }: { cvData: ResumeData; updateData: (u: (p: ResumeData) => ResumeData) => void }) {
  const addItem = () =>
    updateData((prev) => ({
      ...prev,
      experience: [...prev.experience, { id: genId(), title: '', company: '', description: '' }],
    }));

  const removeItem = (id: string) =>
    updateData((prev) => ({ ...prev, experience: prev.experience.filter((e) => e.id !== id) }));

  const setItem = (id: string, key: keyof ResumeData['experience'][number], value: string) =>
    updateData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? { ...e, [key]: value } : e)),
    }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Kinh nghiệm làm việc</h2>
        <button onClick={addItem} className="text-sm font-bold text-blue-600 hover:text-blue-700 cursor-pointer">+ Thêm mục</button>
      </div>
      <div className="space-y-6">
        {cvData.experience.length === 0 && (
          <p className="text-sm text-slate-400 italic">Chưa có kinh nghiệm nào. Bấm {'+ Thêm mục'} để bắt đầu.</p>
        )}
        {cvData.experience.map((exp) => (
          <div key={exp.id} className="p-4 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-3 relative">
            <button onClick={() => removeItem(exp.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 cursor-pointer">✕</button>
            <input placeholder={'Chức danh (VD: Frontend Developer)'} value={exp.title} onChange={(e) => setItem(exp.id, 'title', e.target.value)} className={inputClass()} />
            <input placeholder={'Công ty'} value={exp.company} onChange={(e) => setItem(exp.id, 'company', e.target.value)} className={inputClass()} />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder={'Từ (VD: 01/2023)'} value={exp.startDate || ''} onChange={(e) => setItem(exp.id, 'startDate', e.target.value)} className={inputClass()} />
              <input placeholder={'Đến (VD: Hiện tại)'} value={exp.endDate || ''} onChange={(e) => setItem(exp.id, 'endDate', e.target.value)} className={inputClass()} />
            </div>
            <textarea rows={3} placeholder={'Mô tả công việc, thành tựu...'} value={exp.description} onChange={(e) => setItem(exp.id, 'description', e.target.value)} className={inputClass() + ' resize-none'} />
            <ImproveWithAI
              fieldType="experience description"
              currentText={exp.description}
              context={`${exp.title} tại ${exp.company}`}
              onApply={(text) => setItem(exp.id, 'description', text)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function EducationForm({ cvData, updateData }: { cvData: ResumeData; updateData: (u: (p: ResumeData) => ResumeData) => void }) {
  const addItem = () =>
    updateData((prev) => ({ ...prev, education: [...prev.education, { id: genId(), school: '', degree: '' }] }));
  const removeItem = (id: string) =>
    updateData((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));
  const setItem = (id: string, key: string, value: string) =>
    updateData((prev) => ({ ...prev, education: prev.education.map((e) => (e.id === id ? { ...e, [key]: value } : e)) }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Học vấn</h2>
        <button onClick={addItem} className="text-sm font-bold text-blue-600 hover:text-blue-700 cursor-pointer">+ Thêm mục</button>
      </div>
      <div className="space-y-4">
        {cvData.education.map((ed) => (
          <div key={ed.id} className="p-4 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-3 relative">
            <button onClick={() => removeItem(ed.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 cursor-pointer">✕</button>
            <input placeholder="Trường học" value={ed.school} onChange={(e) => setItem(ed.id, 'school', e.target.value)} className={inputClass()} />
            <input placeholder="Bằng cấp / Chuyên ngành" value={ed.degree} onChange={(e) => setItem(ed.id, 'degree', e.target.value)} className={inputClass()} />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Từ" value={ed.startDate || ''} onChange={(e) => setItem(ed.id, 'startDate', e.target.value)} className={inputClass()} />
              <input placeholder="Đến" value={ed.endDate || ''} onChange={(e) => setItem(ed.id, 'endDate', e.target.value)} className={inputClass()} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillsForm({ cvData, updateData }: { cvData: ResumeData; updateData: (u: (p: ResumeData) => ResumeData) => void }) {
  const [input, setInput] = useState('');

  const addSkill = () => {
    const val = input.trim();
    if (!val) return;
    updateData((prev) => ({ ...prev, skills: [...prev.skills, val] }));
    setInput('');
  };

  const removeSkill = (skill: string) =>
    updateData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Kỹ năng</h2>
      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
          placeholder="VD: ReactJS — nhấn Enter để thêm"
          className={inputClass()}
        />
        <button onClick={addSkill} className="px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 cursor-pointer whitespace-nowrap">Thêm</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {cvData.skills.map((skill) => (
          <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-semibold rounded-lg">
            {skill}
            <button onClick={() => removeSkill(skill)} className="text-blue-400 hover:text-red-500 cursor-pointer">✕</button>
          </span>
        ))}
      </div>
    </div>
  );
}

function ProjectsForm({ cvData, updateData }: { cvData: ResumeData; updateData: (u: (p: ResumeData) => ResumeData) => void }) {
  const addItem = () =>
    updateData((prev) => ({ ...prev, projects: [...prev.projects, { id: genId(), name: '', description: '' }] }));
  const removeItem = (id: string) =>
    updateData((prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== id) }));
  const setItem = (id: string, key: string, value: string) =>
    updateData((prev) => ({ ...prev, projects: prev.projects.map((p) => (p.id === id ? { ...p, [key]: value } : p)) }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Dự án</h2>
        <button onClick={addItem} className="text-sm font-bold text-blue-600 hover:text-blue-700 cursor-pointer">+ Thêm mục</button>
      </div>
      <div className="space-y-4">
        {cvData.projects.map((proj) => (
          <div key={proj.id} className="p-4 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-3 relative">
            <button onClick={() => removeItem(proj.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 cursor-pointer">✕</button>
            <input placeholder="Tên dự án" value={proj.name} onChange={(e) => setItem(proj.id, 'name', e.target.value)} className={inputClass()} />
            <input placeholder="Tech stack (VD: React, Node.js)" value={proj.techStack || ''} onChange={(e) => setItem(proj.id, 'techStack', e.target.value)} className={inputClass()} />
            <input placeholder="Link (GitHub/Demo)" value={proj.link || ''} onChange={(e) => setItem(proj.id, 'link', e.target.value)} className={inputClass()} />
            <textarea rows={3} placeholder="Mô tả dự án..." value={proj.description} onChange={(e) => setItem(proj.id, 'description', e.target.value)} className={inputClass() + ' resize-none'} />
            <ImproveWithAI
              fieldType="project description"
              currentText={proj.description}
              context={proj.name}
              onApply={(text) => setItem(proj.id, 'description', text)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function CertificationsForm({ cvData, updateData }: { cvData: ResumeData; updateData: (u: (p: ResumeData) => ResumeData) => void }) {
  const addItem = () =>
    updateData((prev) => ({ ...prev, certifications: [...prev.certifications, { id: genId(), name: '' }] }));
  const removeItem = (id: string) =>
    updateData((prev) => ({ ...prev, certifications: prev.certifications.filter((c) => c.id !== id) }));
  const setItem = (id: string, key: string, value: string) =>
    updateData((prev) => ({ ...prev, certifications: prev.certifications.map((c) => (c.id === id ? { ...c, [key]: value } : c)) }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Chứng chỉ</h2>
        <button onClick={addItem} className="text-sm font-bold text-blue-600 hover:text-blue-700 cursor-pointer">+ Thêm mục</button>
      </div>
      <div className="space-y-4">
        {cvData.certifications.map((cert) => (
          <div key={cert.id} className="p-4 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-3 relative">
            <button onClick={() => removeItem(cert.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 cursor-pointer">✕</button>
            <input placeholder="Tên chứng chỉ" value={cert.name} onChange={(e) => setItem(cert.id, 'name', e.target.value)} className={inputClass()} />
            <input placeholder="Đơn vị cấp" value={cert.issuer || ''} onChange={(e) => setItem(cert.id, 'issuer', e.target.value)} className={inputClass()} />
            <input placeholder="Ngày cấp" value={cert.date || ''} onChange={(e) => setItem(cert.id, 'date', e.target.value)} className={inputClass()} />
          </div>
        ))}
      </div>
    </div>
  );
}