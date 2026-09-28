'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { ResumeData, genId } from '@/type/resumeData';

const cleanText = (value: string) => value.replace(/\s+/g, ' ').trim();

const rewriteSummary = (summary: string, fullName: string) => {
  const text = cleanText(summary);
  if (!text) {
    return `Tôi là ${fullName || 'một ứng viên'} mong muốn đóng góp năng lực và kinh nghiệm để phát triển bền vững trong môi trường làm việc chuyên nghiệp.`;
  }

  const firstChar = text.charAt(0).toLowerCase();
  const normalized = firstChar === 't' || firstChar === 'm' || firstChar === 'i' ? text : text.charAt(0).toUpperCase() + text.slice(1);

  return normalized
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s*[,;]\s*/g, ', ')
    .replace(/\s+/g, ' ');
};

const rewriteExperience = (exp: { title?: string; company?: string; description?: string; startDate?: string; endDate?: string; isCurrent?: boolean }) => {
  const desc = cleanText(exp.description || 'Tham gia phát triển và tối ưu các hoạt động công việc theo mục tiêu của phòng ban.');

  const polished = desc
    .replace(/\s*[-•]\s*/g, '; ')
    .replace(/\s*\.(?=\S)/g, '. ')
    .replace(/\s+/g, ' ');

  return {
    ...exp,
    description: `${polished}.`,
    startDate: exp.startDate || '2023',
    endDate: exp.isCurrent ? 'Hiện tại' : exp.endDate || '2024',
  };
};

const rewriteProject = (project: { name?: string; description?: string; techStack?: string }) => {
  const name = cleanText(project.name || 'Dự án');
  const tech = cleanText(project.techStack || 'Công nghệ');
  const description = cleanText(project.description || 'Phát triển và triển khai dự án với mục tiêu tối ưu hiệu suất và trải nghiệm người dùng.');

  return {
    ...project,
    name,
    techStack: tech,
    description: `Tham gia phát triển ${name.toLowerCase()} với vai trò chính trong việc ${description.toLowerCase()}.`,
  };
};

const rewriteSkills = (skills: string) => {
  const list = skills
    .split(',')
    .map((item) => cleanText(item))
    .filter(Boolean);

  return list.length ? list : ['Kỹ năng làm việc', 'Quản lý thời gian', 'Làm việc nhóm'];
};

const emptyExperience = () => ({
  id: genId(),
  title: '',
  company: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  description: '',
});

const emptyEducation = () => ({
  id: genId(),
  school: '',
  degree: '',
  startDate: '',
  endDate: '',
});

const emptyProject = () => ({
  id: genId(),
  name: '',
  description: '',
  techStack: '',
  link: '',
});

const initialForm = {
  fullName: '',
  gender: '',
  birthDate: '',
  phone: '',
  email: '',
  address: '',
  summary: '',
  skills: 'React, TypeScript, Next.js, Teamwork',
  experience: [emptyExperience()],
  education: [emptyEducation()],
  projects: [emptyProject()],
};

export default function CreateCvPage() {
  const router = useRouter();
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [form, setForm] = useState(initialForm);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateExperience = (index: number, field: string, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      experience: prev.experience.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      education: prev.education.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const updateProject = (index: number, field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      projects: prev.projects.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addExperience = () => setForm((prev) => ({ ...prev, experience: [...prev.experience, emptyExperience()] }));
  const addEducation = () => setForm((prev) => ({ ...prev, education: [...prev.education, emptyEducation()] }));
  const addProject = () => setForm((prev) => ({ ...prev, projects: [...prev.projects, emptyProject()] }));

  const buildResumeData = (): ResumeData => {
    const skills = rewriteSkills(form.skills);

    const summary = rewriteSummary(form.summary, form.fullName);

    const experience = form.experience
      .filter((exp) => exp.title || exp.company || exp.description)
      .map((exp) => ({
        id: exp.id,
        title: cleanText(exp.title || 'Vị trí làm việc'),
        company: cleanText(exp.company || 'Tên công ty'),
        startDate: exp.startDate || '2023',
        endDate: exp.isCurrent ? 'Hiện tại' : exp.endDate || '2024',
        isCurrent: exp.isCurrent,
        description: rewriteExperience(exp).description,
      }));

    const education = form.education
      .filter((edu) => edu.school || edu.degree)
      .map((edu) => ({
        id: edu.id,
        school: cleanText(edu.school || 'Tên trường'),
        degree: cleanText(edu.degree || 'Bằng cấp / chuyên ngành'),
        startDate: edu.startDate || '2020',
        endDate: edu.endDate || '2024',
      }));

    const projects = form.projects
      .filter((project) => project.name || project.description)
      .map((project) => ({
        id: project.id,
        name: cleanText(project.name || 'Dự án'),
        description: rewriteProject(project).description,
        techStack: cleanText(project.techStack || 'Công nghệ'),
        link: project.link || '',
      }));

    return {
      personalInfo: {
        fullName: form.fullName || 'Họ và tên',
        email: form.email,
        phone: form.phone,
        location: form.address,
      },
      summary,
      experience,
      education,
      projects,
      skills,
      certifications: [],
      meta: { template: 'manual' },
    };
  };

  const generatePdfFromPreview = async () => {
    if (!previewRef.current) return null;

    try {
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Không thể tạo ảnh preview.'));
        img.src = dataUrl;
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageWidth / img.width, pageHeight / img.height);
      const finalWidth = img.width * ratio;
      const finalHeight = img.height * ratio;
      const x = (pageWidth - finalWidth) / 2;
      const y = (pageHeight - finalHeight) / 2;

      pdf.addImage(dataUrl, 'PNG', x, y, finalWidth, finalHeight);
      const blob = pdf.output('blob');
      const objectUrl = URL.createObjectURL(blob);
      setPdfUrl(objectUrl);
      return objectUrl;
    } catch {
      toast.error('Không thể tạo PDF CV. Vui lòng kiểm tra thông tin và thử lại.');
      return null;
    }
  };

  const handleGenerateResume = async () => {
    if (!form.fullName.trim()) {
      toast.error('Vui lòng nhập họ và tên.');
      return;
    }

    setIsGenerating(true);
    try {
      await generatePdfFromPreview();
    } catch {
      toast.error('Có lỗi khi tạo CV.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!pdfUrl) {
      toast.error('Vui lòng tạo PDF trước khi tải xuống.');
      return;
    }

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${(form.fullName || 'cv').trim().replace(/\s+/g, '-') || 'cv'}.pdf`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  const resumeData = buildResumeData();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => router.push('/my-cvs')}
              className="text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-3 inline-flex items-center gap-2"
            >
              ← Quay lại
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Tạo CV mới</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleGenerateResume}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-60"
            >
              {isGenerating ? 'Đang tạo...' : 'Tạo với AI'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
          <div className="space-y-6">
            <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-bold mb-4">Thông tin cá nhân</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block md:col-span-2">
                  <span className="text-sm font-medium mb-1 block">Họ và tên</span>
                  <input value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5 outline-none focus:border-blue-500" placeholder="Nguyễn Văn A" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium mb-1 block">Giới tính</span>
                  <input value={form.gender} onChange={(e) => updateField('gender', e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5 outline-none focus:border-blue-500" placeholder="Nam/Nữ" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium mb-1 block">Ngày sinh</span>
                  <input type="date" value={form.birthDate} onChange={(e) => updateField('birthDate', e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5 outline-none focus:border-blue-500" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium mb-1 block">Số điện thoại</span>
                  <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5 outline-none focus:border-blue-500" placeholder="0901..." />
                </label>
                <label className="block">
                  <span className="text-sm font-medium mb-1 block">Email</span>
                  <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5 outline-none focus:border-blue-500" placeholder="name@email.com" />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-sm font-medium mb-1 block">Địa chỉ</span>
                  <input value={form.address} onChange={(e) => updateField('address', e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5 outline-none focus:border-blue-500" placeholder="Đà Nẵng, Việt Nam" />
                </label>
              </div>
            </section>

            <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-bold mb-4">Mục tiêu nghề nghiệp</h2>
              <textarea
                value={form.summary}
                onChange={(e) => updateField('summary', e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5 outline-none focus:border-blue-500"
                placeholder="Ví dụ: Tôi mong muốn ứng tuyển vị trí Frontend Developer..."
              />
            </section>

            <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Kinh nghiệm làm việc</h2>
                <button type="button" onClick={addExperience} className="text-sm font-semibold text-blue-600 hover:text-blue-700">+ Thêm</button>
              </div>
              <div className="space-y-4">
                {form.experience.map((exp, index) => (
                  <div key={exp.id} className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-slate-50 dark:bg-zinc-950/60">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input value={exp.title} onChange={(e) => updateExperience(index, 'title', e.target.value)} className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5" placeholder="Vị trí" />
                      <input value={exp.company} onChange={(e) => updateExperience(index, 'company', e.target.value)} className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5" placeholder="Tên công ty" />
                      <input type="month" value={exp.startDate} onChange={(e) => updateExperience(index, 'startDate', e.target.value)} className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5" placeholder="Từ" />
                      <div className="flex items-center gap-2">
                        <input type="month" value={exp.endDate} onChange={(e) => updateExperience(index, 'endDate', e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5" placeholder="Đến" disabled={exp.isCurrent} />
                        <label className="flex items-center gap-2 text-xs whitespace-nowrap text-slate-600 dark:text-zinc-300">
                          <input type="checkbox" checked={exp.isCurrent} onChange={(e) => updateExperience(index, 'isCurrent', e.target.checked)} />
                          Hiện tại
                        </label>
                      </div>
                    </div>
                    <textarea value={exp.description} onChange={(e) => updateExperience(index, 'description', e.target.value)} rows={3} className="mt-3 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5" placeholder="Mô tả công việc, công nghệ, KPI..." />
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Học vấn</h2>
                <button type="button" onClick={addEducation} className="text-sm font-semibold text-blue-600 hover:text-blue-700">+ Thêm</button>
              </div>
              <div className="space-y-4">
                {form.education.map((edu, index) => (
                  <div key={edu.id} className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-slate-50 dark:bg-zinc-950/60">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input value={edu.school} onChange={(e) => updateEducation(index, 'school', e.target.value)} className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5" placeholder="Tên trường" />
                      <input value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5" placeholder="Chuyên ngành / bằng cấp" />
                      <input type="month" value={edu.startDate} onChange={(e) => updateEducation(index, 'startDate', e.target.value)} className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5" placeholder="Từ" />
                      <input type="month" value={edu.endDate} onChange={(e) => updateEducation(index, 'endDate', e.target.value)} className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5" placeholder="Đến" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Dự án</h2>
                <button type="button" onClick={addProject} className="text-sm font-semibold text-blue-600 hover:text-blue-700">+ Thêm</button>
              </div>
              <div className="space-y-4">
                {form.projects.map((project, index) => (
                  <div key={project.id} className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-slate-50 dark:bg-zinc-950/60">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input value={project.name} onChange={(e) => updateProject(index, 'name', e.target.value)} className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5" placeholder="Tên dự án" />
                      <input value={project.techStack} onChange={(e) => updateProject(index, 'techStack', e.target.value)} className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5" placeholder="Công nghệ sử dụng" />
                    </div>
                    <textarea value={project.description} onChange={(e) => updateProject(index, 'description', e.target.value)} rows={3} className="mt-3 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5" placeholder="Mô tả dự án, vai trò, kết quả..." />
                    <input value={project.link} onChange={(e) => updateProject(index, 'link', e.target.value)} className="mt-3 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5" placeholder="Link demo / GitHub (nếu có)" />
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-bold mb-4">Kỹ năng</h2>
              <textarea
                value={form.skills}
                onChange={(e) => updateField('skills', e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2.5 outline-none focus:border-blue-500"
                placeholder="React, TypeScript, Next.js, ..."
              />
            </section>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">CV preview</h2>
                {pdfUrl && (
                  <button onClick={handleDownloadPdf} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">Tải xuống</button>
                )}
              </div>

              <div ref={previewRef} id="manual-cv-preview" className="bg-white text-slate-900 rounded-[18px] border border-slate-200 p-6 min-h-[820px] shadow-[0_12px_40px_rgba(15,23,42,0.08)]" style={{ fontFamily: 'Arial, sans-serif' }}>
                <div className="border-b-2 border-slate-800 pb-4 mb-5">
                  <h1 className="text-[30px] font-extrabold leading-tight tracking-tight text-slate-900">{resumeData.personalInfo.fullName || 'Họ và tên'}</h1>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-slate-600">
                    {resumeData.personalInfo.location && <span>{resumeData.personalInfo.location}</span>}
                    {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
                    {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
                  </div>
                </div>

                {resumeData.summary && (
                  <section className="mb-5">
                    <h2 className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-slate-700 pb-1 border-b border-slate-300 mb-2">Mục tiêu nghề nghiệp</h2>
                    <p className="text-[13px] leading-6 text-slate-700 whitespace-pre-line">{resumeData.summary}</p>
                  </section>
                )}

                {resumeData.experience.length > 0 && (
                  <section className="mb-5">
                    <h2 className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-slate-700 pb-1 border-b border-slate-300 mb-2">Kinh nghiệm làm việc</h2>
                    <div className="space-y-4">
                      {resumeData.experience.map((exp) => (
                        <div key={exp.id}>
                          <div className="flex justify-between gap-3">
                            <div>
                              <p className="text-[13px] font-bold text-slate-900">{exp.title || 'Chức danh'}</p>
                              <p className="text-[12px] text-slate-600">{exp.company || 'Tên công ty'}</p>
                            </div>
                            <span className="text-[11px] text-slate-500 whitespace-nowrap">{exp.startDate || ''} {exp.endDate ? `- ${exp.endDate}` : ''}</span>
                          </div>
                          <p className="mt-1 text-[12px] leading-5 text-slate-700 whitespace-pre-line">{exp.description || 'Mô tả công việc...'}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {resumeData.education.length > 0 && (
                  <section className="mb-5">
                    <h2 className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-slate-700 pb-1 border-b border-slate-300 mb-2">Học vấn</h2>
                    <div className="space-y-3">
                      {resumeData.education.map((edu) => (
                        <div key={edu.id} className="flex justify-between gap-3">
                          <div>
                            <p className="text-[13px] font-bold text-slate-900">{edu.school || 'Tên trường'}</p>
                            <p className="text-[12px] text-slate-600">{edu.degree || 'Bằng cấp / chuyên ngành'}</p>
                          </div>
                          <span className="text-[11px] text-slate-500 whitespace-nowrap">{edu.startDate || ''} {edu.endDate ? `- ${edu.endDate}` : ''}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {resumeData.projects.length > 0 && (
                  <section className="mb-5">
                    <h2 className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-slate-700 pb-1 border-b border-slate-300 mb-2">Dự án</h2>
                    <div className="space-y-3">
                      {resumeData.projects.map((project) => (
                        <div key={project.id}>
                          <p className="text-[13px] font-bold text-slate-900">{project.name || 'Tên dự án'}</p>
                          {project.techStack && <p className="text-[11px] text-slate-500 italic">{project.techStack}</p>}
                          <p className="mt-1 text-[12px] leading-5 text-slate-700 whitespace-pre-line">{project.description || 'Mô tả dự án...'}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {resumeData.skills.length > 0 && (
                  <section>
                    <h2 className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-slate-700 pb-1 border-b border-slate-300 mb-2">Kỹ năng</h2>
                    <p className="text-[12px] leading-5 text-slate-700">{resumeData.skills.join(' • ')}</p>
                  </section>
                )}
              </div>
            </div>

            {pdfUrl && (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
                <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">PDF preview</h3>
                <iframe src={pdfUrl} title="CV PDF Preview" className="w-full h-[540px] rounded-xl border border-slate-200 dark:border-zinc-700 bg-white" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}