import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

// 🔴 Import cú pháp mới của firebase-admin v12+
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService 
  ) {
    // 🔴 BÍ QUYẾT LÀ ĐÂY: Khởi tạo Firebase bên trong Constructor 
    // Để đảm bảo NestJS đã load xong biến môi trường (.env)
    if (!getApps().length) {
      initializeApp({
        // Nếu không đọc được .env thì dùng ID cứng dự phòng luôn, không bao giờ trượt được!
        projectId: process.env.FIREBASE_PROJECT_ID || 'ai-career-copilot-620ac',
      });
    }
  }

  // ================= ĐĂNG KÝ =================
  async register(email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      throw new BadRequestException('Email này đã được sử dụng!');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;
    
    return {
      message: 'Đăng ký tài khoản thành công!',
      user: userWithoutPassword,
    };
  }

  // ================= ĐĂNG NHẬP =================
  async login(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
    }

    const isPasswordMatching = await bcrypt.compare(pass, user.password);
    
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });

    const { password, ...userWithoutPassword } = user;
    
    return {
      message: 'Đăng nhập thành công!',
      accessToken,
      user: userWithoutPassword,
    };
  }

  // ================= ĐĂNG NHẬP SOCIAL (Google/Facebook) =================
  async socialLogin(firebaseToken: string) {
    try {
      // 1. Nhờ Firebase Admin giải mã thẻ xem có phải đồ thật do Google/Facebook cấp không
      const decodedToken = await getAuth().verifyIdToken(firebaseToken);
      const email = decodedToken.email;

      if (!email) {
        throw new UnauthorizedException('Không lấy được email từ tài khoản Social!');
      }

      // 2. Tìm trong Database xem user đã tồn tại chưa
      let user = await this.prisma.user.findUnique({
        where: { email },
      });

      // 3. Nếu chưa có -> Tạo tài khoản mới tự động
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email: email,
            password: '', // Không cần password vì login bằng Social
          },
        });
      }

      // 4. Cấp Thẻ nội bộ (JWT) cho user
      const payload = { sub: user.id, email: user.email };
      const accessToken = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
      });

      return { accessToken };
    } catch (error) {
      console.error('Lỗi khi xác thực thẻ Firebase:', error);
      throw new UnauthorizedException('Thẻ Firebase không hợp lệ hoặc đã hết hạn');
    }
  }
}