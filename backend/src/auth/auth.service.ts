import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {
    if (!getApps().length) {
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'ai-career-copilot-620ac',
      });
    }
  }

  // ================= ĐĂNG KÝ =================
  async register(email: string, password: string) {
    // Lưu ý: user tìm theo email có thể trả về user tạo từ Social chưa có password
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser && existingUser.password) {
      throw new BadRequestException('Email này đã được sử dụng!');
    } else if (existingUser && !existingUser.password) {
      throw new BadRequestException('Email này đã được đăng nhập qua Google/Facebook. Vui lòng đăng nhập bằng Social!');
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

    if (!user || !user.password) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác! (Hoặc tài khoản này dùng Social Login)');
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
  async socialLogin(firebaseToken: string, providedName?: string) {
    try {
      const decodedToken = await getAuth().verifyIdToken(firebaseToken);
      
      const uid = decodedToken.uid; 
      const email = decodedToken.email; 
      const name = providedName || decodedToken.name || decodedToken.firebase?.sign_in_provider || null; // 👈 LẤY TÊN TỪ GOOGLE/FACEBOOK

      // 2. TÌM THEO FIREBASE UID TRƯỚC
      let user = await this.prisma.user.findUnique({
        where: { firebaseUid: uid },
      });

      // 3. Nếu chưa có theo UID, tìm theo email để link tài khoản
      if (!user && email) {
        user = await this.prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          // Link tài khoản và tiện tay lưu luôn cái tên nếu DB đang trống
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: { 
              firebaseUid: uid,
              name: user.name || name // Chỉ update nếu trước đó chưa có tên
            },
          });
        }
      }

      // 4. Nếu hoàn toàn là người mới -> Tạo tài khoản mới
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            firebaseUid: uid,
            email: email || null,
            password: null,
            name: name, // 👈 LƯU TÊN VÀO DATABASE
          },
        });
      } else if (!user.name && name) {
        // Trường hợp user cũ (đã có từ trước) nhưng chưa có tên, ta cập nhật thêm
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { name },
        });
      }

      // 5. Cấp Thẻ nội bộ (JWT) cho user
      // Ưu tiên hiển thị tên thật -> Nếu không có thì lấy phần đầu của email -> Nếu không có nữa mới lấy UID
      const displayIdentifier = user.name || (user.email ? user.email.split('@')[0] : user.firebaseUid || user.id);
      
      const payload = { sub: user.id, email: user.email, name: displayIdentifier };
      
      const accessToken = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
      });

      return { 
        accessToken,
        user: { id: user.id, email: user.email, name: displayIdentifier }
      };
    } catch {
      throw new UnauthorizedException('Thẻ Firebase không hợp lệ hoặc đã hết hạn');
    }
  }
}