# AI Career Backend

## Tổng quan
Backend này được xây dựng bằng NestJS và phục vụ cho hệ thống AI Career Copilot.
Nó xử lý:
- Upload CV PDF
- Đọc text từ file PDF bằng pdf-parse
- Upload file lên Cloudinary
- Gọi Google Gemini AI để phân tích CV với Job Description
- Đăng ký / đăng nhập người dùng với JWT
- Kết nối PostgreSQL bằng Prisma

## Công nghệ chính
- NestJS
- Prisma
- PostgreSQL
- Cloudinary
- Google Gemini GenAI (@google/genai)
- JWT (@nestjs/jwt)
- bcrypt
- pdf-parse

## Cài đặt
`ash
cd backend
npm install
`

## Biến môi trường cần cấu hình
Tạo file .env trong ackend/ với:

`env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
GEMINI_API_KEY=your_google_gemini_api_key
JWT_SECRET=your_jwt_secret
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
`

## Chạy ứng dụng
`ash
npm run start:dev
`

## Lệnh thường dùng
- 
pm run start - chạy ứng dụng NestJS
- 
pm run start:dev - chạy dev mode với watch
- 
pm run start:prod - chạy production
- 
pm run build - build project
- 
pm run lint - lint code
- 
pm run test - chạy unit test
- 
pm run test:e2e - chạy e2e test

## Prisma
File chính: ackend/prisma/schema.prisma

Các model chính:
- User
- Resume
- JobDescription
- AnalysisResult

Commands:
`ash
npx prisma generate
npx prisma db push
`

## Kiến trúc chính
- src/app.module.ts
  - import ConfigModule, CloudinaryModule, ResumeModule, AiModule, PrismaModule, AuthModule
- src/resume/resume.controller.ts
  - endpoint POST /resume/upload
  - nhận file CV và jdText
  - gọi ResumeService, CloudinaryService, AiService
- src/resume/resume.service.ts
  - parse nội dung PDF từ Buffer
- src/cloudinary/cloudinary.service.ts
  - upload file lên Cloudinary
- src/ai/ai.service.ts
  - gọi Google Gemini để phân tích CV vs JD
  - trả về JSON gồm matchScore, strengths, weaknesses, missingSkills
- src/auth/auth.controller.ts
  - endpoint POST /auth/register, POST /auth/login
- src/auth/auth.service.ts
  - đăng ký user
  - login và trả JWT token
- src/prisma/prisma.service.ts
  - cấu hình Prisma kết nối PostgreSQL bằng adapter @prisma/adapter-pg

## API Endpoints
### GET /
- Trả về Hello World!

### POST /resume/upload
- Upload CV PDF và Job Description
- Form data:
  - ile (CV PDF)
  - jdText (nội dung JD)
- Xử lý:
  1. parse text từ PDF
  2. upload file lên Cloudinary
  3. gọi AI service để phân tích
- Response:
  - success
  - message
  - cvUrl
  - nalysis

### POST /auth/register
- Đăng ký tài khoản mới
- Body JSON:
  - email
  - password

### POST /auth/login
- Đăng nhập
- Body JSON:
  - email
  - password
- Response:
  - ccessToken
  - user

## Lưu ý
- AiService thử các model Gemini theo thứ tự: gemini-3.6-flash, gemini-flash-latest, gemini-3.5-flash, gemini-2.5-flash, gemini-2.0-flash
- CloudinaryService upload vào folder i-career-cvs
- AuthModule dùng JWT_SECRET và sign options expiresIn: '1d'
- ResumeController trả lỗi nếu thiếu file hoặc thiếu jdText

## Triển khai
`ash
npm run build
npm run start:prod
`

## Ghi chú
- Backend hiện tập trung vào xử lý upload CV, parsing PDF và gọi AI để phân tích.
- Frontend sẽ gửi request tới POST /resume/upload và hiển thị kết quả.
