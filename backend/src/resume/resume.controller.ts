import { Controller, Post, Get, UseInterceptors, UploadedFile, Body, BadRequestException, UseGuards, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ResumeService } from './resume.service';
import { AiService } from '../ai/ai.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Import Guard bảo vệ
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
      
await this.resumeService.saveAnalysisToDb(userId, result.secure_url, parsedText, jdText, aiAnalysis);
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

  // API MỚI DÀNH CHO TRANG HISTORY
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

  // API MỚI DÀNH CHO TRANG QUẢN LÝ CV
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
}