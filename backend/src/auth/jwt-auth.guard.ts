import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // 1. Nếu không có thẻ -> Đuổi ra ngay lập tức
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bạn chưa đăng nhập hoặc không có quyền truy cập vào Lịch sử!');
    }

    const token = authHeader.split(' ')[1];

    try {
      // 2. Dùng máy quét thẻ để kiểm tra tính hợp lệ
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'BiMatCuaCopilot123!@#', 
      });
      
      // 3. Thẻ thật -> Cho phép đi tiếp và gắn ID vào request
      request.user = payload; 
      return true;
    } catch (e) {
      // 4. Thẻ giả hoặc hết hạn -> Đuổi ra
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn hoặc thẻ không hợp lệ!');
    }
  }
}