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
}