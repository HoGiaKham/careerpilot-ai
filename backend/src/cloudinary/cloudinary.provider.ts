import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  // Bơm ConfigService vào để ép NestJS đọc .env trước khi chạy hàm dưới
  inject: [ConfigService], 
  useFactory: (configService: ConfigService) => {
    return cloudinary.config({
      // Lấy biến môi trường thông qua configService thay vì process.env
      cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  },
};