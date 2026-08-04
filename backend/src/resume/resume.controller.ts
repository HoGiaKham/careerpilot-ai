import { Controller, Post, UseInterceptors, UploadedFile, Body, BadRequestException, UseGuards, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ResumeService } from './resume.service';
import { AiService } from '../ai/ai.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt.guard';
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
  @UseGuards(OptionalJwtAuthGuard) // <--- Bố trí ông bảo vệ đứng đây
  async uploadResume(
    @UploadedFile() file: Express.Multer.File,
    @Body('jdText') jdText: string,
    @Req() req: any // <--- Hứng request để soi xem có thông tin user không
  ) {
    if (!file) throw new BadRequestException('Vui lòng đính kèm file CV!');
    if (!jdText) throw new BadRequestException('Vui lòng nhập Job Description (JD) để AI đối chiếu!');

    // Lấy ID của user (nếu có đăng nhập thì req.user.sub sẽ có giá trị, không thì null)
    const userId = req.user?.sub || null;
    
    try {
      const parsedText = await this.resumeService.parsePdf(file.buffer);
      const result = await this.cloudinaryService.uploadFile(file);
      const aiAnalysis = await this.aiService.analyzeCvWithJd(parsedText, jdText);

      // --- MỚI THÊM: Gọi Service để lưu kết quả xuống Database ---
      await this.resumeService.saveAnalysisToDb(userId, result.secure_url, jdText, aiAnalysis);

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
}