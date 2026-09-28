import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiService {
  private genAI: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('Chưa tìm thấy GEMINI_API_KEY trong file .env');
    }

    this.genAI = new GoogleGenAI({
      apiKey,
    });
  }

  private async generateJson(prompt: string): Promise<any> {
    const models = [
      'gemini-3.6-flash',
      'gemini-flash-latest',
      'gemini-3.5-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
    ];
    let lastError: any;

    for (const model of models) {
      try {
        const response = await this.genAI.models.generateContent({ model, contents: prompt });
        const text = (response.text ?? '').replace(/```json|```/g, '').trim();
        return JSON.parse(text);
      } catch (err) {
        lastError = err;
      }
    }

    throw new InternalServerErrorException('Không có model AI nào khả dụng.');
  }

  async analyzeCvWithJd(cvText: string, jdText: string, language: string = 'vi') {
    const languageInstruction = language === 'en'
      ? 'CRITICAL: You MUST write the entire response in English.'
      : 'CRITICAL: Bạn PHẢI viết toàn bộ câu trả lời bằng Tiếng Việt.';

    const prompt = `
Bạn là một hệ thống ATS (Applicant Tracking System) cốt lõi và chuyên gia Tuyển dụng cấp cao.
Nhiệm vụ của bạn là phân tích và đánh giá độ phù hợp giữa CV của ứng viên với Job Description (JD).

${languageInstruction}

LUẬT BẮT BUỘC CẦN TUÂN THỦ (STRICT RULES):
1. KIỂM TRA JD: Nếu phần JD (Job Description) quá ngắn, không có ngữ nghĩa rõ ràng, hoặc chỉ chứa một vài từ khóa/viết tắt (ví dụ: "BA", "Test", "Dev") mà không mô tả công việc cụ thể:
   - Đánh giá matchScore = 0.
   - Trả về thông báo lỗi vào phần summary.
   - KHÔNG ĐƯỢC TỰ SUY DIỄN (hallucinate) hay giả định bất kỳ yêu cầu công việc nào ngoài những gì JD cung cấp.
2. FORMAT KẾT QUẢ: Chỉ trả về MỘT chuỗi JSON hợp lệ. KHÔNG bao gồm markdown (như \`\`\`json), KHÔNG có bất kỳ văn bản nào khác ngoài JSON.

Cấu trúc JSON yêu cầu:
{
  "matchScore": <số nguyên từ 0 đến 100>,
  "summary": "<Đánh giá tổng quan về mức độ phù hợp>",
  "strengths": ["<Điểm mạnh 1>", "<Điểm mạnh 2>"],
  "weaknesses": ["<Điểm yếu 1>", "<Điểm yếu 2>"],
  "missingSkills": ["<Kỹ năng 1>", "<Kỹ năng 2>"],
  "recommendations": ["<Hành động 1>", "<Hành động 2>"]
}

--- DỮ LIỆU ĐẦU VÀO ---
CV:
${cvText}

JD:
${jdText}
`;

    // Ưu tiên model mạnh nhất
    const models = [
      'gemini-3.6-flash',
      'gemini-flash-latest',
      'gemini-3.5-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
    ];

    let lastError: any;

    for (const model of models) {
      try {
        const response = await this.genAI.models.generateContent({
          model,
          contents: prompt,
        });

        const responseText = (response.text ?? '')
          .replace(/```json|```/g, '')
          .trim();

        return JSON.parse(responseText);
      } catch (err) {
        lastError = err;
      }
    }

    throw new InternalServerErrorException(
      'Không có model AI nào khả dụng.',
    );
  }

  // Tạo CV bằng AI
  async generateResumeData(
    input: { fullName: string; targetRole: string; experience: string; skills: string[] },
    language: string = 'vi',
  ) {
    const languageInstruction = language === 'en'
      ? 'CRITICAL: You MUST write the entire response in English.'
      : 'CRITICAL: Bạn PHẢI viết toàn bộ câu trả lời bằng Tiếng Việt.';

    const prompt = `
Bạn là chuyên gia viết CV chuyên nghiệp (Professional Resume Writer) và ATS Specialist.
Nhiệm vụ: dựa trên thông tin thô ứng viên cung cấp, XÂY DỰNG một bộ dữ liệu CV đầy đủ, chuyên nghiệp, chuẩn ATS.

${languageInstruction}

LUẬT BẮT BUỘC:
1. Viết "summary" 2-3 câu, giọng chuyên nghiệp, nêu bật giá trị ứng viên mang lại cho vị trí "${input.targetRole}".
2. Từ mô tả kinh nghiệm thô, tách thành các mục "experience" riêng nếu nhận diện được nhiều công việc/dự án khác nhau. Viết lại description bằng action verbs, định lượng nếu có căn cứ. KHÔNG bịa số liệu không có trong input.
3. Sắp xếp lại "skills" theo mức độ liên quan với vị trí ứng tuyển, quan trọng nhất lên đầu.
4. "education" và "certifications" trả về mảng rỗng (ứng viên sẽ tự điền sau).
5. "projects" chỉ điền nếu suy luận được từ mô tả kinh nghiệm, nếu không đủ căn cứ thì để mảng rỗng.
6. CHỈ trả về MỘT chuỗi JSON hợp lệ đúng cấu trúc dưới đây. KHÔNG markdown, KHÔNG giải thích thêm.

Cấu trúc JSON bắt buộc:
{
  "personalInfo": { "fullName": "string", "email": "", "phone": "", "location": "", "linkedin": "", "github": "", "portfolio": "" },
  "summary": "string",
  "experience": [{ "id": "string", "title": "string", "company": "string", "startDate": "", "endDate": "", "isCurrent": false, "description": "string" }],
  "education": [],
  "skills": ["string"],
  "projects": [{ "id": "string", "name": "string", "description": "string", "techStack": "string", "link": "" }],
  "certifications": []
}

--- THÔNG TIN ỨNG VIÊN ---
Họ tên: ${input.fullName}
Vị trí ứng tuyển: ${input.targetRole}
Kỹ năng: ${input.skills.join(', ')}
Kinh nghiệm/dự án (mô tả thô): ${input.experience || 'Chưa có kinh nghiệm - đây là ứng viên fresher, hãy viết summary phù hợp.'}
`;

    const models = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];
    let lastError: any;

    for (const model of models) {
      try {
        const response = await this.genAI.models.generateContent({ model, contents: prompt });
        const responseText = (response.text ?? '').replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(responseText);
        parsed.personalInfo = { ...parsed.personalInfo, fullName: input.fullName };
        return parsed;
      } catch (err) {
        lastError = err;
      }
    }

    throw new InternalServerErrorException('Không có model AI nào khả dụng.');
  }

  async improveField(fieldType: string, currentText: string, context: string, language: string = 'vi') {
    const languageInstruction = language === 'en'
      ? 'CRITICAL: You MUST write the entire response in English.'
      : 'CRITICAL: Bạn PHẢI viết toàn bộ câu trả lời bằng Tiếng Việt.';

    const prompt = `
Bạn là chuyên gia viết CV chuyên nghiệp (Professional Resume Writer).
Nhiệm vụ: cải thiện đoạn text sau trong phần "${fieldType}" của CV — viết lại chuyên nghiệp hơn, dùng action verbs mạnh, định lượng kết quả CHỈ KHI có căn cứ trong văn bản gốc.

${languageInstruction}

LUẬT BẮT BUỘC:
1. KHÔNG bịa thêm số liệu, công nghệ, hay thành tựu không có trong văn bản gốc.
2. Giữ đúng ý nghĩa cốt lõi, chỉ cải thiện cách diễn đạt.
3. Nếu văn bản gốc đã tốt, chỉ tinh chỉnh nhẹ, không viết lại toàn bộ.
4. CHỈ trả về MỘT chuỗi JSON hợp lệ. KHÔNG markdown, KHÔNG giải thích thêm.

Cấu trúc JSON:
{ "improvedText": "string" }

Bối cảnh liên quan: ${context || 'Không có'}

Văn bản gốc:
"""
${currentText}
"""
`;

    const models = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];
    let lastError: any;

    for (const model of models) {
      try {
        const response = await this.genAI.models.generateContent({ model, contents: prompt });
        const responseText = (response.text ?? '').replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(responseText);
        return parsed.improvedText as string;
      } catch (err) {
        lastError = err;
      }
    }

    throw new InternalServerErrorException('Không có model AI nào khả dụng.');
  }

  // ------------------------------------------------------------------
  // MỚI: chuyển text CV (từ PDF) thành ResumeData có cấu trúc
  // ------------------------------------------------------------------
  async parseTextToResumeData(text: string, _language: string = 'vi') {
    const prompt = `
Bạn là hệ thống trích xuất dữ liệu CV. Chuyển văn bản CV dưới đây thành JSON có cấu trúc.

LUẬT BẮT BUỘC:
1. CHỈ dùng thông tin có trong văn bản. KHÔNG bịa công ty, ngày tháng, số liệu, kỹ năng.
2. Không có thông tin thì để chuỗi rỗng "" hoặc mảng rỗng [].
3. Giữ nguyên ngôn ngữ gốc của CV, KHÔNG dịch.
4. "description" giữ các gạch đầu dòng, mỗi ý một dòng (ngăn cách bằng ký tự xuống dòng).
5. Ngày tháng giữ đúng định dạng như trong CV. Nếu đang làm ở đó thì "isCurrent": true.
6. CHỈ trả về MỘT chuỗi JSON hợp lệ, KHÔNG markdown, KHÔNG giải thích.

Cấu trúc JSON:
{
  "personalInfo": { "fullName": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "", "portfolio": "" },
  "summary": "",
  "experience": [{ "title": "", "company": "", "startDate": "", "endDate": "", "isCurrent": false, "description": "" }],
  "education": [{ "school": "", "degree": "", "startDate": "", "endDate": "" }],
  "skills": [""],
  "projects": [{ "name": "", "description": "", "techStack": "", "link": "" }],
  "certifications": [{ "name": "", "issuer": "", "date": "" }]
}

--- VĂN BẢN CV ---
${text}
`;

    const ai = await this.generateJson(prompt);

    // Chuẩn hóa ở tầng code: luôn có id + giá trị mặc định, editor không bị lỗi khi AI trả thiếu field
    const id = () => Math.random().toString(36).slice(2, 10);
    const str = (v: any) => (typeof v === 'string' ? v : '');
    const arr = (v: any) => (Array.isArray(v) ? v : []);

    return {
      personalInfo: {
        fullName: str(ai.personalInfo?.fullName),
        email: str(ai.personalInfo?.email),
        phone: str(ai.personalInfo?.phone),
        location: str(ai.personalInfo?.location),
        linkedin: str(ai.personalInfo?.linkedin),
        github: str(ai.personalInfo?.github),
        portfolio: str(ai.personalInfo?.portfolio),
      },
      summary: str(ai.summary),
      experience: arr(ai.experience).map((e: any) => ({
        id: id(),
        title: str(e.title),
        company: str(e.company),
        startDate: str(e.startDate),
        endDate: str(e.endDate),
        isCurrent: !!e.isCurrent,
        description: str(e.description),
      })),
      education: arr(ai.education).map((e: any) => ({
        id: id(),
        school: str(e.school),
        degree: str(e.degree),
        startDate: str(e.startDate),
        endDate: str(e.endDate),
      })),
      skills: arr(ai.skills).map((s: any) => String(s).trim()).filter(Boolean),
      projects: arr(ai.projects).map((p: any) => ({
        id: id(),
        name: str(p.name),
        description: str(p.description),
        techStack: str(p.techStack),
        link: str(p.link),
      })),
      certifications: arr(ai.certifications).map((c: any) => ({
        id: id(),
        name: str(c.name),
        issuer: str(c.issuer),
        date: str(c.date),
      })),
      meta: { template: 'modern' },
    };
  }

  // ------------------------------------------------------------------
  // MỚI: tinh chỉnh CV theo JD
  // AI chỉ được trả về summary / skills / description của experience.
  // Phần còn lại (công ty, chức danh, ngày tháng, học vấn...) giữ nguyên từ CV gốc ở tầng code.
  // ------------------------------------------------------------------
  async tailorResumeToJd(base: any, jdText: string, language: string = 'vi') {
    const languageInstruction = language === 'en'
      ? 'CRITICAL: You MUST write the entire response in English.'
      : 'CRITICAL: Bạn PHẢI viết toàn bộ câu trả lời bằng Tiếng Việt.';

    const experienceInput = (base.experience ?? []).map((e: any, i: number) => ({
      index: i,
      title: e.title,
      company: e.company,
      description: e.description,
    }));

    const prompt = `
Bạn là chuyên gia viết CV và ATS Specialist. Nhiệm vụ: tinh chỉnh CV hiện có cho khớp với Job Description (JD).

${languageInstruction}

LUẬT BẮT BUỘC:
1. Chỉ được viết lại: "summary", "description" của từng experience, và sắp xếp thứ tự "skills".
2. KHÔNG bịa kinh nghiệm, công nghệ, kỹ năng, hay số liệu không có trong CV gốc.
3. Ưu tiên nêu bật những phần CV gốc có liên quan tới JD; dùng từ khóa của JD CHỈ KHI đúng với thực tế trong CV.
4. Kỹ năng JD yêu cầu mà CV không có → đưa vào "gaps", TUYỆT ĐỐI KHÔNG thêm vào "skills".
5. "experience" trả về đúng số lượng và thứ tự như đầu vào (theo "index").
6. Nếu JD quá ngắn hoặc không có nội dung công việc cụ thể, trả về summary/description giữ nguyên và "gaps" rỗng.
7. CHỈ trả về MỘT chuỗi JSON hợp lệ, KHÔNG markdown, KHÔNG giải thích.

Cấu trúc JSON bắt buộc:
{
  "summary": "string",
  "skills": ["string"],
  "experience": [{ "index": 0, "description": "string" }],
  "gaps": ["string"]
}

--- CV GỐC ---
Summary: ${base.summary ?? ''}
Skills: ${(base.skills ?? []).join(', ')}
Experience: ${JSON.stringify(experienceInput)}

--- JD ---
${jdText}
`;

    const ai = await this.generateJson(prompt);

    // Ghép lại ở tầng code: AI không thể đụng tới company/title/date/education...
    const baseSkills: string[] = base.skills ?? [];
    const lower = new Map(baseSkills.map((s) => [s.toLowerCase(), s] as [string, string]));
    const ordered = (Array.isArray(ai.skills) ? ai.skills : [])
      .map((s: any) => lower.get(String(s).toLowerCase()))
      .filter((s: string | undefined): s is string => !!s);
    const skills = Array.from(new Set([...ordered, ...baseSkills]));

    const experience = (base.experience ?? []).map((e: any, i: number) => {
      const rewritten = ai.experience?.find((x: any) => x.index === i)?.description;
      return {
        ...e,
        description: typeof rewritten === 'string' && rewritten.trim() ? rewritten : e.description,
      };
    });

    const tailored = {
      ...base,
      summary: typeof ai.summary === 'string' && ai.summary.trim() ? ai.summary : base.summary,
      skills,
      experience,
    };

    return { tailored, gaps: Array.isArray(ai.gaps) ? ai.gaps : [] };
  }
}