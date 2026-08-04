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

  async analyzeCvWithJd(cvText: string, jdText: string) {
    const prompt = `
Bạn là một chuyên gia Tuyển dụng (HR) và AI Career Copilot.

Hãy phân tích CV dựa trên JD.

Chỉ trả về JSON hợp lệ:

{
  "matchScore": 0,
  "strengths": [],
  "weaknesses": [],
  "missingSkills": []
}

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