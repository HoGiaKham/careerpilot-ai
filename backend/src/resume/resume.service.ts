import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import pdf from 'pdf-parse';

// Các loại CV hiển thị trong /my-cvs và được tính vào thống kê
const WORKSPACE_SOURCE_TYPES = ['WORKSPACE', 'AI_GENERATED', 'MANUAL', 'AI_TAILORED'];

@Injectable()
export class ResumeService {
  constructor(private readonly prisma: PrismaService) {}

  async parsePdf(fileBuffer: Buffer): Promise<string> {
    try {
      const data = await pdf(fileBuffer);
      return data.text.replace(/\n\s*\n/g, '\n').trim();
    } catch {
      throw new Error('Không thể đọc được nội dung từ file PDF.');
    }
  }

  async saveAnalysisToDb(userId: string | null, cvUrl: string, parsedText: string, jdText: string, aiAnalysis: any, originalName?: string) {
    try {
      const resume = await this.prisma.resume.create({
        data: {
          userId: userId,
          fileUrl: cvUrl,
          parsedText: parsedText,
          originalName: originalName || 'CV_Upload.pdf',
          sourceType: 'ANALYSIS'
        }
      });

      const jd = await this.prisma.jobDescription.create({
        data: { userId: userId, content: jdText }
      });

      await this.prisma.analysisResult.create({
        data: {
          userId: userId, resumeId: resume.id, jdId: jd.id,
          matchScore: aiAnalysis.matchScore, strengths: aiAnalysis.strengths,
          weaknesses: aiAnalysis.weaknesses, missingSkills: aiAnalysis.missingSkills,
          recommendations: aiAnalysis.recommendations,
        }
      });
    } catch {
    }
  }

  async saveWorkspaceCv(userId: string, cvUrl: string, parsedText: string, originalName: string) {
    try {
      const resume = await this.prisma.resume.create({
        data: {
          userId: userId,
          fileUrl: cvUrl,
          parsedText: parsedText,
          originalName: originalName,
          sourceType: 'WORKSPACE'
        }
      });
      return resume;
    } catch {
      throw new Error('Không thể lưu CV vào cơ sở dữ liệu');
    }
  }

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

  async getCvsByUser(userId: string) {
    try {
      return await this.prisma.resume.findMany({
        where: {
          userId: userId,
          sourceType: { in: WORKSPACE_SOURCE_TYPES },
          isDeleted: false
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      throw new Error('Không thể truy xuất dữ liệu CV');
    }
  }

  async getUserUsageStats(userId: string) {
    const historyCount = await this.prisma.analysisResult.count({
      where: { userId: userId },
    });

    const cvCount = await this.prisma.resume.count({
      where: { userId: userId, isDeleted: false, sourceType: { in: WORKSPACE_SOURCE_TYPES } },
    });

    const estimatedStorageMb = (cvCount * 0.8).toFixed(1) + ' MB';

    return {
      historyCount,
      cvCount,
      storageSize: estimatedStorageMb,
    };
  }

  async renameWorkspaceCv(userId: string, cvId: string, newName: string) {
    const cv = await this.prisma.resume.findFirst({
      where: { id: cvId, userId: userId }
    });
    if (!cv) throw new Error('Không tìm thấy CV hoặc bạn không có quyền sửa!');

    return await this.prisma.resume.update({
      where: { id: cvId },
      data: { originalName: newName }
    });
  }

  async deleteWorkspaceCv(userId: string, cvId: string) {
    const cv = await this.prisma.resume.findFirst({
      where: { id: cvId, userId: userId }
    });
    if (!cv) throw new Error('Không tìm thấy CV hoặc bạn không có quyền xóa!');

    const historyCount = await this.prisma.analysisResult.count({
      where: { resumeId: cvId }
    });

    if (historyCount === 0) {
      await this.prisma.resume.delete({ where: { id: cvId } });
      return cv.fileUrl;
    } else {
      await this.prisma.resume.update({
        where: { id: cvId },
        data: { isDeleted: true }
      });
      return null;
    }
  }

  async deleteHistory(userId: string, historyId: string) {
    const history = await this.prisma.analysisResult.findFirst({
      where: { id: historyId, userId: userId }
    });
    if (!history) throw new Error('Không tìm thấy lịch sử phân tích!');

    const resumeId = history.resumeId;

    await this.prisma.analysisResult.delete({
      where: { id: historyId }
    });

    const remainingHistoryCount = await this.prisma.analysisResult.count({
      where: { resumeId: resumeId }
    });

    const cv = await this.prisma.resume.findUnique({ where: { id: resumeId } });

    // Tiêu chí thành rác: Không còn Lịch sử nào VÀ (Đã bị xóa khỏi Workspace HOẶC Là file tải nhanh ở Dashboard)
    if (cv && remainingHistoryCount === 0 && (cv.isDeleted || cv.sourceType === 'ANALYSIS')) {
      await this.prisma.resume.delete({ where: { id: resumeId } });
      return cv.fileUrl; // Trả URL về Controller để dọn Cloudinary
    }

    return null; // Vẫn còn xài, không xóa Cloudinary
  }

  // Làm phẳng cvData (JSON) thành text thuần để lưu vào parsedText,
  // giúp chức năng "Phân tích CV" dùng được với CV tạo từ editor (không có file PDF)
  private flattenToText(data: any): string {
    if (data == null) return '';
    if (typeof data === 'string') return data;
    if (typeof data === 'number') return String(data);
    if (Array.isArray(data)) {
      return data.map((d) => this.flattenToText(d)).filter(Boolean).join('\n');
    }
    if (typeof data === 'object') {
      const SKIP = ['id', 'isCurrent', 'meta'];
      return Object.entries(data)
        .filter(([k]) => !SKIP.includes(k))
        .map(([, v]) => this.flattenToText(v))
        .filter(Boolean)
        .join('\n');
    }
    return '';
  }

  // tạo resume
  async saveWorkspaceCvWithData(userId: string, cvData: any, originalName: string, sourceType: string = 'AI_GENERATED') {
    try {
      return await this.prisma.resume.create({
        data: { userId, originalName, sourceType, cvData, parsedText: this.flattenToText(cvData) },
      });
    } catch {
      throw new Error('Không thể lưu CV vào cơ sở dữ liệu');
    }
  }

  async getWorkspaceCvById(userId: string, cvId: string) {
    const cv = await this.prisma.resume.findFirst({ where: { id: cvId, userId } });
    if (!cv) throw new Error('Không tìm thấy CV hoặc bạn không có quyền truy cập!');
    return cv;
  }

  async updateCvData(userId: string, cvId: string, cvData: any) {
    const cv = await this.prisma.resume.findFirst({ where: { id: cvId, userId } });
    if (!cv) throw new Error('Không tìm thấy CV hoặc bạn không có quyền sửa!');
    return await this.prisma.resume.update({
      where: { id: cvId },
      data: { cvData, parsedText: this.flattenToText(cvData) },
    });
  }
}