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

  // 1. LƯU THEO ĐÚNG SCHEMA CỦA BẠN (Phải lưu Resume và JD trước)
  async saveAnalysisToDb(userId: string | null, cvUrl: string, parsedText: string, jdText: string, aiAnalysis: any) {
    try {
      // 1.1 Lưu file CV
      const resume = await this.prisma.resume.create({
        data: {
          userId: userId,
          fileUrl: cvUrl,
          parsedText: parsedText,
        }
      });

      // 1.2 Lưu Job Description
      const jd = await this.prisma.jobDescription.create({
        data: {
          userId: userId,
          content: jdText,
        }
      });

      // 1.3 Lưu Kết quả phân tích (Map đúng ID vào)
      await this.prisma.analysisResult.create({
        data: {
          userId: userId,
          resumeId: resume.id,
          jdId: jd.id,
          matchScore: aiAnalysis.matchScore,
          strengths: aiAnalysis.strengths,
          weaknesses: aiAnalysis.weaknesses,
          missingSkills: aiAnalysis.missingSkills,
          recommendations: aiAnalysis.recommendations,
        }
      });
      
      console.log(`[DB] Đã lưu thành công lịch sử cho User ID: ${userId || 'Khách vãng lai'}`);
    } catch (error) {
      console.error('[DB Lỗi] Không thể lưu kết quả:', error);
    }
  }

  // 2. LẤY LỊCH SỬ TỪ DB LÊN
  async getHistoryByUser(userId: string) {
    return await this.prisma.analysisResult.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        resume: true,
        jd: true
      }
    });
  }

  // LẤY DANH SÁCH CV CỦA USER
  async getCvsByUser(userId: string) {
    try {
      return await this.prisma.resume.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' }, // CV mới nhất lên đầu
      });
    } catch (error) {
      console.error('[DB Lỗi] Lỗi khi lấy danh sách CV:', error);
      throw new Error('Không thể truy xuất dữ liệu CV');
    }
  }

  // LẤY THỐNG KÊ SỬ DỤNG CỦA USER
  async getUserUsageStats(userId: string) {
    const historyCount = await this.prisma.analysisResult.count({
      where: { userId: userId },
    });

    const cvCount = await this.prisma.resume.count({
      where: { userId: userId },
    });

    // Vì file lưu trên Cloudinary, ta có thể quy ước mỗi CV trung bình khoảng 0.5 MB hoặc tính theo thực tế
    const estimatedStorageMb = (cvCount * 0.8).toFixed(1) + ' MB';

    return {
      historyCount,
      cvCount,
      storageSize: estimatedStorageMb,
    };
  }
  
}