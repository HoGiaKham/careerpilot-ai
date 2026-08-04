import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import pdf from 'pdf-parse';

@Injectable()
export class ResumeService {
  constructor(private readonly prisma: PrismaService) {}

  async parsePdf(fileBuffer: Buffer): Promise<string> {
    try {
      const data = await pdf(fileBuffer);
      return data.text.replace(/\n\s*\n/g, '\n').trim();
    } catch (error) {
      console.error(error);
      throw new Error('Không thể đọc được nội dung từ file PDF.');
    }
  }

  async saveAnalysisToDb(userId: string | null, cvUrl: string, jdText: string, aiAnalysis: any) {
    try {
      console.log(`[DB] Đang lưu lịch sử phân tích cho User ID: ${userId || 'Khách vãng lai'}`);
    } catch (error) {
      console.error('[DB Lỗi] Không thể lưu kết quả:', error);
    }
  }
}