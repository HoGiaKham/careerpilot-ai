import { Module } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { ResumeController } from './resume.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { AiModule } from '../ai/ai.module';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt'; 

@Module({
  imports: [
    CloudinaryModule, 
    AiModule,
    PrismaModule,
    JwtModule
  ],
  controllers: [ResumeController],
  providers: [ResumeService],
})
export class ResumeModule {}