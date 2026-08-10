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

  async analyzeCvWithJd(cvText: string, jdText: string, language: string = 'vi') {
    
    const languageInstruction = language === 'en' 
      ? 'CRITICAL: You MUST write the entire response in English.' 
      : 'CRITICAL: Bạn PHẢI viết toàn bộ câu trả lời bằng Tiếng Việt.';

    const prompt = `
Bạn là một hệ thống ATS (Applicant Tracking System) cốt lõi và chuyên gia Tuyển dụng cấp cao.
Nhiệm vụ của bạn là phân tích và đánh giá độ phù hợp giữa CV của ứng viên với Job Description (JD).

${languageInstruction}  <-- CHÈN VÀO ĐÂY LÀ XONG

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
        console.log(`🚀 Đang thử model: ${model}`);

        const response = await this.genAI.models.generateContent({
          model,
          contents: prompt,
        });

        console.log(`✅ Thành công với ${model}`);

        const responseText = (response.text ?? '')
          .replace(/```json|```/g, '')
          .trim();

        return JSON.parse(responseText);
      } catch (err) {
        console.log(`❌ ${model} lỗi`);
        lastError = err;
      }
    }

    console.error(lastError);

    throw new InternalServerErrorException(
      'Không có model AI nào khả dụng.',
    );
  }
}