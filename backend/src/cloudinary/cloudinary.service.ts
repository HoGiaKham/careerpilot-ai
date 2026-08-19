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

  async deleteFile(fileUrl: string): Promise<any> {
    try {
      const urlParts = fileUrl.split('/');
      const filenameWithExt = urlParts.pop(); // Lấy "abc123xyz.pdf"
      const folderName = urlParts.pop(); // Lấy "ai-career-cvs"

      if (!filenameWithExt || !folderName) return;

      // Cắt bỏ đuôi .pdf để có public_id chuẩn của Cloudinary
      const publicId = `${folderName}/${filenameWithExt.split('.')[0]}`;

      // 2. Gọi lệnh destroy của SDK
      return new Promise((resolve, reject) => {
        // Lưu ý: với PDF tải lên qua upload_stream, resource_type mặc định thường là 'image'
        cloudinary.uploader.destroy(publicId, { resource_type: 'image' }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
      });
    } catch (error) {
      console.error('[Cloudinary] Lỗi khi xóa file:', error);
    }
  }
}