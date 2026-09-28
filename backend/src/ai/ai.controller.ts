import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('improve-field')
  @UseGuards(JwtAuthGuard)
  async improveField(
    @Body() body: { fieldType: string; currentText: string; context?: string; language?: string },
  ) {
    if (!body.currentText || body.currentText.trim() === '') {
      throw new BadRequestException('Vui lòng nhập nội dung cần cải thiện!');
    }
    try {
      const improvedText = await this.aiService.improveField(
        body.fieldType, body.currentText, body.context || '', body.language || 'vi',
      );
      return { success: true, data: { improvedText } };
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Lỗi khi gọi AI');
    }
  }
}