import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import 'multer';
const toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'ai-career-cvs' }, 
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Lỗi: Cloudinary không trả về kết quả!'));
          resolve(result);
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }
}