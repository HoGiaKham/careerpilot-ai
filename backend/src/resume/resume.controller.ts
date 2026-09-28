import { Controller, Post, Get, UseInterceptors, UploadedFile, Body, BadRequestException, UseGuards, Req, Patch, Param, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ResumeService } from './resume.service';
import { AiService } from '../ai/ai.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import 'multer';

@Controller('resume')
export class ResumeController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly resumeService: ResumeService,
    private readonly aiService: AiService
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(OptionalJwtAuthGuard)
  async uploadResume(
    @UploadedFile() file: Express.Multer.File,
    @Body('jdText') jdText: string,
    @Body('language') language: string,
    @Req() req: any
  ) {
    if (!file) throw new BadRequestException('Vui lòng đính kèm file CV!');
    if (!jdText) throw new BadRequestException('Vui lòng nhập Job Description (JD)!');

    const userId = req.user?.sub || null;
    const reportLang = language || 'vi';

    try {
      const parsedText = await this.resumeService.parsePdf(file.buffer);
      const result = await this.cloudinaryService.uploadFile(file);
      const aiAnalysis = await this.aiService.analyzeCvWithJd(parsedText, jdText, reportLang);

      await this.resumeService.saveAnalysisToDb(userId, result.secure_url, parsedText, jdText, aiAnalysis, file.originalname);
      return {
        success: true,
        message: 'AI đã phân tích CV thành công!',
        cvUrl: result.secure_url,
        analysis: aiAnalysis,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException('Lỗi hệ thống: ' + errorMessage);
    }
  }

  @Post('workspace/upload')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async uploadWorkspaceCv(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) {
    if (!file) throw new BadRequestException('Vui lòng đính kèm file CV!');
    const userId = req.user.sub;

    try {
      const parsedText = await this.resumeService.parsePdf(file.buffer);
      const result = await this.cloudinaryService.uploadFile(file);
      const savedCv = await this.resumeService.saveWorkspaceCv(
        userId,
        result.secure_url,
        parsedText,
        file.originalname
      );

      return {
        success: true,
        message: 'Tải CV lên không gian làm việc thành công!',
        data: savedCv
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException('Lỗi upload: ' + errorMessage);
    }
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(@Req() req: any) {
    const userId = req.user.sub;
    try {
      const history = await this.resumeService.getHistoryByUser(userId);
      return { success: true, data: history };
    } catch (error) {
      throw new BadRequestException('Không thể lấy lịch sử phân tích');
    }
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  async getMyCvs(@Req() req: any) {
    const userId = req.user.sub;
    try {
      const cvs = await this.resumeService.getCvsByUser(userId);
      return { success: true, data: cvs };
    } catch (error) {
      throw new BadRequestException('Không thể lấy danh sách CV');
    }
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getUserStats(@Req() req: any) {
    const userId = req.user.sub;
    try {
      const stats = await this.resumeService.getUserUsageStats(userId);
      return { success: true, data: stats };
    } catch (error) {
      throw new BadRequestException('Không thể lấy thống kê sử dụng');
    }
  }

  @Patch('workspace/:id/rename')
  @UseGuards(JwtAuthGuard)
  async renameCv(
    @Req() req: any,
    @Param('id') cvId: string,
    @Body('newName') newName: string
  ) {
    if (!newName || newName.trim() === '') {
      throw new BadRequestException('Tên CV không được để trống');
    }
    try {
      const updatedCv = await this.resumeService.renameWorkspaceCv(req.user.sub, cvId, newName);
      return { success: true, message: 'Đã đổi tên CV thành công', data: updatedCv };
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Lỗi khi đổi tên CV');
    }
  }

  // 🗑️ API XÓA CV KHỎI WORKSPACE
  @Delete('workspace/:id')
  @UseGuards(JwtAuthGuard)
  async deleteCv(@Req() req: any, @Param('id') cvId: string) {
    try {
      const deletedFileUrl = await this.resumeService.deleteWorkspaceCv(req.user.sub, cvId);

      // Nếu Service quyết định XÓA THẬT, nó sẽ nhả URL ra để Cloudinary dọn dẹp
      if (deletedFileUrl) {
        await this.cloudinaryService.deleteFile(deletedFileUrl);
      }

      return { success: true, message: 'Đã xóa CV thành công' };
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Lỗi khi xóa CV');
    }
  }

  // 🗑️ API MỚI: XÓA LỊCH SỬ PHÂN TÍCH
  @Delete('history/:id')
  @UseGuards(JwtAuthGuard)
  async deleteHistory(@Req() req: any, @Param('id') historyId: string) {
    try {
      const deletedFileUrl = await this.resumeService.deleteHistory(req.user.sub, historyId);

      // Thuật toán dọn rác phát hiện CV không còn xài nữa -> Dọn Cloudinary
      if (deletedFileUrl) {
        await this.cloudinaryService.deleteFile(deletedFileUrl);
      }

      return { success: true, message: 'Đã xóa lịch sử phân tích thành công' };
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Lỗi khi xóa lịch sử');
    }
  }

  @Post('workspace/create-ai')
  @UseGuards(JwtAuthGuard)
  async createCvWithAi(
    @Req() req: any,
    @Body() body: { fullName: string; targetRole: string; experience: string; skills: string[]; language?: string },
  ) {
    if (!body.fullName || !body.targetRole) {
      throw new BadRequestException('Vui lòng nhập Họ tên và Vị trí ứng tuyển!');
    }
    const userId = req.user.sub;
    try {
      const resumeData = await this.aiService.generateResumeData(body, body.language || 'vi');
      const savedCv = await this.resumeService.saveWorkspaceCvWithData(
        userId, resumeData, `CV_${body.targetRole}`, 'AI_GENERATED',
      );
      return { success: true, message: 'AI đã tạo CV thành công!', data: savedCv };
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Lỗi khi tạo CV bằng AI');
    }
  }

  // Dùng cho flow "Manual + Template" -> tạo draft rỗng rồi vào thẳng Editor
  @Post('workspace')
  @UseGuards(JwtAuthGuard)
  async createEmptyCv(@Req() req: any, @Body('template') template?: string) {
    const userId = req.user.sub;
    const emptyData = {
      personalInfo: { fullName: '' },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      meta: { template: template || 'modern' },
    };
    const savedCv = await this.resumeService.saveWorkspaceCvWithData(userId, emptyData, 'CV mới', 'MANUAL');
    return { success: true, data: savedCv };
  }

  // ------------------------------------------------------------------
  // MỚI: Tinh chỉnh CV theo JD (bước 1: chỉ trả về bản đề xuất, CHƯA lưu gì)
  // ------------------------------------------------------------------
  @Post('workspace/tailor')
  @UseGuards(JwtAuthGuard)
  async tailorCv(
    @Req() req: any,
    @Body() body: { resumeId: string; jdText: string; language?: string },
  ) {
    if (!body.resumeId) throw new BadRequestException('Vui lòng chọn CV gốc!');
    if (!body.jdText?.trim()) throw new BadRequestException('Vui lòng nhập Job Description (JD)!');
    const lang = body.language || 'vi';

    try {
      const source = await this.resumeService.getWorkspaceCvById(req.user.sub, body.resumeId);

      // CV tạo từ editor đã có cvData; CV PDF thì parse parsedText thành ResumeData (không ghi ngược vào CV gốc)
      let base = source.cvData as any;
      if (!base) {
        if (!source.parsedText?.trim()) {
          throw new Error('CV này không có nội dung để chỉnh sửa!');
        }
        base = await this.aiService.parseTextToResumeData(source.parsedText, lang);
      }

      const { tailored, gaps } = await this.aiService.tailorResumeToJd(base, body.jdText, lang);
      return { success: true, data: { base, tailored, gaps } };
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Lỗi khi tinh chỉnh CV');
    }
  }

  // MỚI: bước 2 - người dùng đã duyệt xong, lưu thành CV mới (sourceType = AI_TAILORED)
  @Post('workspace/tailor/save')
  @UseGuards(JwtAuthGuard)
  async saveTailoredCv(
    @Req() req: any,
    @Body() body: { sourceResumeId: string; cvData: any; name?: string },
  ) {
    if (!body.cvData?.personalInfo) throw new BadRequestException('Dữ liệu CV không hợp lệ!');
    try {
      const source = await this.resumeService.getWorkspaceCvById(req.user.sub, body.sourceResumeId);
      const name = body.name?.trim() || `${source.originalName || 'CV'} – Tailored`;
      const saved = await this.resumeService.saveWorkspaceCvWithData(
        req.user.sub, body.cvData, name, 'AI_TAILORED',
      );
      return { success: true, message: 'Đã tạo bản CV mới!', data: saved };
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Lỗi khi lưu CV');
    }
  }

  @Get('workspace/:id')
  @UseGuards(JwtAuthGuard)
  async getWorkspaceCv(@Req() req: any, @Param('id') cvId: string) {
    try {
      const cv = await this.resumeService.getWorkspaceCvById(req.user.sub, cvId);
      return { success: true, data: cv };
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Không tìm thấy CV');
    }
  }

  @Patch('workspace/:id/data')
  @UseGuards(JwtAuthGuard)
  async updateWorkspaceCvData(@Req() req: any, @Param('id') cvId: string, @Body('cvData') cvData: any) {
    try {
      const updated = await this.resumeService.updateCvData(req.user.sub, cvId, cvData);
      return { success: true, data: updated };
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Lỗi khi lưu CV');
    }
  }
}