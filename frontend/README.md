# AI Career Frontend

## Tổng quan
Frontend được xây dựng bằng Next.js App Router và React.
Ứng dụng cho phép người dùng:
- Upload CV PDF
- Nhập nội dung Job Description (JD)
- Gọi backend để AI phân tích độ phù hợp giữa CV và JD
- Đăng nhập / đăng xuất dựa trên Firebase Auth
- Hiển thị kết quả phân tích AI rõ ràng

## Công nghệ chính
- Next.js
- React
- Firebase Auth
- Tailwind CSS
- TypeScript

## Cài đặt
```bash
cd frontend
npm install
```

## Biến môi trường cần cấu hình
Tạo file `.env.local` trong `frontend/` với các biến sau:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

## Chạy ứng dụng
```bash
npm run dev
```

## Lệnh thường dùng
- `npm run dev` - chạy development server
- `npm run build` - build production
- `npm run start` - chạy production build
- `npm run lint` - kiểm tra code style

## Luồng chính
- `app/page.tsx`: redirect về `/dashboard`
- `app/dashboard/page.tsx`: giao diện chính
  - chọn file CV PDF
  - nhập JD
  - gọi `POST /resume/upload`
  - hiển thị kết quả AI
  - quản lý trạng thái đăng nhập bằng `localStorage`
- `components/AuthModal.tsx`: modal đăng nhập/đăng ký
  - gửi request tới backend `POST /auth/login` hoặc `POST /auth/register`
  - social login Google / Facebook qua Firebase
- `components/AnalysisResult.tsx`: hiển thị `matchScore`, `strengths`, `weaknesses`, `missingSkills`
- `src/lib/firebase.ts`: cấu hình Firebase Auth

## API kết nối
Frontend gọi backend tại endpoint:
- `POST /resume/upload` để upload CV và JD
- `POST /auth/login` để đăng nhập
- `POST /auth/register` để đăng ký

## Dữ liệu và trạng thái
- Khi chưa đăng nhập: frontend lưu `freeTrials` trong `localStorage` để giới hạn dùng thử
- Khi đăng nhập: lưu `token` trong `localStorage`
- `token` dùng để đánh dấu trạng thái đăng nhập tạm thời

## Ghi chú
- Ứng dụng hiện chỉ hỗ trợ upload file PDF
- Backend mặc định lấy URL backend từ `NEXT_PUBLIC_API_URL`
- Firebase auth config được sử dụng để login Google/Facebook, nhưng token hiện tại chỉ lưu tạm trong `localStorage`
- Nếu muốn mở rộng, frontend có thể thêm xác thực JWT vào request header

## Triển khai
Đảm bảo `NEXT_PUBLIC_API_URL` trỏ tới backend đúng, sau đó build và chạy:
```bash
npm run build
npm run start
```
