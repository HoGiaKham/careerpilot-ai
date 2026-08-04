import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    // Cấu hình JWT: Đặt chữ ký bí mật và thời gian hết hạn (1 ngày)
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'BiMatCuaCopilot123!@#', 
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}