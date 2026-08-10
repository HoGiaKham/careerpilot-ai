import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    const { email, password } = body;
    if (!email || !password) {
      throw new BadRequestException('Vui lòng cung cấp đầy đủ email và password!');
    }
    return this.authService.register(email, password);
  }

  @Post('login')
  async login(@Body() body: any) {
    const { email, password } = body;
    if (!email || !password) {
      throw new BadRequestException('Vui lòng nhập email và mật khẩu!');
    }
    return this.authService.login(email, password);
  }

  // ================= THÊM API ĐỔI THẺ SOCIAL =================
  @Post('social')
  async socialLogin(@Body() body: { token: string; name?: string }) {
    if (!body.token) {
      throw new BadRequestException('Vui lòng cung cấp token từ Firebase!');
    }
    return this.authService.socialLogin(body.token, body.name);
  }
}