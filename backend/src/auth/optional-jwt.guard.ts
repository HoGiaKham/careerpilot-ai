import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      // 📸 CAMERA 1: Xem thẻ nhận được có bị chữ 'null' hay 'undefined' không
      console.log('🎟️ [Guard] Thẻ nhận được từ Frontend:', token.substring(0, 20) + '...'); 

      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET, 
        });
        request.user = payload; 
        // 📸 CAMERA 2: Nếu thẻ chuẩn, báo thành công
        console.log('✅ [Guard] Đọc thẻ thành công! User ID:', payload.sub);
      } catch (e: any) {
        // 📸 CAMERA 3: Bắt quả tang lỗi từ chối thẻ
        console.log('🔴 [Guard Lỗi Từ Chối Thẻ]:', e.message);
        console.log('[Auth] Token không hợp lệ hoặc đã hết hạn, coi như khách vãng lai.');
      }
    } else {
      console.log('⚠️ [Guard] Frontend không gửi thẻ (Không có header Authorization)');
    }
    
    return true; 
  }
}