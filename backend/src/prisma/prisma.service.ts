import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // Lấy chuỗi kết nối Database Neon từ file .env
    const connectionString = process.env.DATABASE_URL;
    
    // Tạo "hồ chứa" kết nối bằng thư viện pg
    const pool = new Pool({ connectionString });
    
    // Bọc hồ chứa vào Adapter của Prisma
    const adapter = new PrismaPg(pool);
    
    // Truyền công cụ lên cho PrismaClient gốc hoạt động
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}