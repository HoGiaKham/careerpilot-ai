import { ResumeData } from '@/type/resumeData';

export default function ResumePreview({ cvData }: { cvData: ResumeData }) {
  const p = cvData.personalInfo;

  return (
    <div className="bg-white text-slate-900 rounded-2xl shadow-lg border border-slate-200 p-10 min-h-[600px] font-sans" id="resume-preview-content">
      <div className="border-b-2 border-slate-800 pb-4 mb-6">
        <h1 className="text-3xl font-extrabold">{p.fullName || 'Họ và tên'}</h1>
        <p className="text-sm text-slate-500 mt-2 flex flex-wrap gap-x-3">
          {[p.email, p.phone, p.location, p.linkedin, p.github, p.portfolio].filter(Boolean).map((v, i) => (
            <span key={i}>{v}</span>
          ))}
        </p>
      </div>

      {cvData.summary && (
        <section className="mb-6">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 mb-2">Tóm tắt</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{cvData.summary}</p>
        </section>
      )}

      {cvData.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 mb-3">Kinh nghiệm</h2>
          <div className="space-y-4">
            {cvData.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-sm">{exp.title || 'Chức danh'} {exp.company && `— ${exp.company}`}</h3>
                  <span className="text-xs text-slate-500">{exp.startDate} {exp.endDate && `- ${exp.endDate}`}</span>
                </div>
                <p className="text-sm text-slate-700 mt-1 whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {cvData.projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 mb-3">Dự án</h2>
          <div className="space-y-4">
            {cvData.projects.map((proj) => (
              <div key={proj.id}>
                <h3 className="font-bold text-sm">{proj.name} {proj.techStack && <span className="text-slate-500 font-normal">({proj.techStack})</span>}</h3>
                <p className="text-sm text-slate-700 mt-1 whitespace-pre-line">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {cvData.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 mb-3">Học vấn</h2>
          <div className="space-y-2">
            {cvData.education.map((ed) => (
              <div key={ed.id} className="flex justify-between">
                <span className="text-sm font-bold">{ed.school} — {ed.degree}</span>
                <span className="text-xs text-slate-500">{ed.startDate} {ed.endDate && `- ${ed.endDate}`}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {cvData.skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 mb-2">Kỹ năng</h2>
          <p className="text-sm text-slate-700">{cvData.skills.join(' • ')}</p>
        </section>
      )}

      {cvData.certifications.length > 0 && (
        <section>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 mb-2">Chứng chỉ</h2>
          <div className="space-y-1">
            {cvData.certifications.map((c) => (
              <p key={c.id} className="text-sm text-slate-700">{c.name} {c.issuer && `— ${c.issuer}`} {c.date && `(${c.date})`}</p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}