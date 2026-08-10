# AI Career Frontend

## 1. Tổng quan
Frontend được xây dựng bằng Next.js App Router + React + TypeScript để tạo giao diện cho hệ thống AI Career Copilot. Đây là phần người dùng tương tác trực tiếp: upload CV PDF, nhập Job Description, xem kết quả AI phân tích, đăng nhập/đăng ký, xem lịch sử phân tích, quản lý CV và cài đặt cá nhân.

Mục tiêu chính của frontend:
- Hiển thị landing page giới thiệu sản phẩm
- Cho người dùng tải lên CV PDF và nhập JD
- Gửi request tới backend để phân tích độ phù hợp giữa CV và JD
- Hiển thị kết quả dưới dạng báo cáo có thể đọc trên web hoặc in ra PDF
- Hỗ trợ đăng nhập bằng email/password và social login via Firebase
- Cho phép xem lịch sử phân tích và thư viện CV đã upload

---

## 2. Công nghệ chính
- Next.js 16: framework React hiện đại dùng App Router
- React 19: thư viện UI
- TypeScript: kiểm tra kiểu dữ liệu
- Tailwind CSS: styling nhanh và tiện lợi
- Firebase Auth: đăng nhập Google/Facebook
- react-hot-toast: thông báo toast đẹp và dễ dùng
- jspdf + html-to-image: hỗ trợ xuất báo cáo và in PDF
- lucide-react: icon UI

---

## 3. Cấu trúc thư mục
```text
frontend/
├── app/
│   ├── dashboard/page.tsx
│   ├── history/page.tsx
│   ├── my-cvs/page.tsx
│   ├── profile/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AnalysisResult.tsx
│   ├── AuthModal.tsx
│   ├── DownloadReportButton.tsx
│   ├── Navbar.tsx
│   ├── ThemeProvider.tsx
│   └── landing/
│       ├── Cta.tsx
│       ├── Features.tsx
│       ├── Footer.tsx
│       ├── HeroDemo.tsx
│       ├── HowItWorks.tsx
│       └── Stats.tsx
├── public/
├── src/
│   └── lib/
│       └── firebase.ts
├── type/
│   └── resume.ts
└── package.json
```

---

## 4. Luồng người dùng chính
### Luồng 1: Landing page -> Dashboard
1. Người dùng vào trang chủ
2. Xem demo sản phẩm và các tính năng
3. Chuyển sang trang dashboard để bắt đầu phân tích CV

### Luồng 2: Upload CV và JD
1. Người dùng chọn file PDF CV
2. Nhập job description vào textarea
3. Frontend kiểm tra định dạng file và kích thước (tối đa 5MB)
4. Gửi request tới backend qua endpoint /resume/upload
5. Hiển thị kết quả phân tích từ AI

### Luồng 3: Đăng nhập / đăng ký
1. Người dùng mở modal đăng nhập
2. Có thể đăng nhập bằng email/password hoặc Google/Facebook
3. Frontend gọi backend /auth/login, /auth/register hoặc /auth/social
4. Token JWT được lưu vào localStorage
5. Navbar đổi trạng thái sang “đã đăng nhập”

### Luồng 4: Quản lý lịch sử và CV
1. Người dùng vào /history để xem lại các lần phân tích trước đó
2. Người dùng vào /my-cvs để xem thư viện CV đã upload
3. Người dùng vào /profile để xem thống kê và cài đặt

---

## 5. Các file chính và vai trò

### 5.1 Cấu trúc chung
#### app/layout.tsx
- Chức năng: layout gốc của toàn bộ ứng dụng
- Xử lý:
  - thiết lập metadata của trang
  - import ThemeProvider
  - render Navbar và Toaster toàn cục
  - bọc toàn bộ children trong layout
- Công nghệ: Next.js layout system, react-hot-toast

#### app/page.tsx
- Chức năng: trang landing page chính
- Xử lý:
  - gọi các component UI ở thư mục components/landing
  - ráp nối hero, stats, features, how-it-works, CTA, footer

#### app/globals.css
- Chức năng: file CSS toàn cục
- Xử lý: chứa style chung, Tailwind base, theme token và các class tùy chỉnh

---

### 5.2 Trang chính và dashboard
#### app/dashboard/page.tsx
- Chức năng: màn hình chính để người dùng phân tích CV
- Xử lý:
  - quản lý state: file CV, nội dung JD, trạng thái đang phân tích, kết quả AI, tiến trình loading, preview PDF
  - validate file upload: chỉ chấp nhận PDF, giới hạn 5MB
  - tạo FormData chứa file và jdText
  - gọi API POST /resume/upload
  - lưu lần dùng thử miễn phí vào localStorage nếu chưa đăng nhập
  - hiển thị kết quả phân tích sau khi nhận response
- Công nghệ:
  - React hooks useState/useEffect/useRef
  - Fetch API
  - FileReader / Object URL cho preview PDF
  - react-hot-toast

#### app/history/page.tsx
- Chức năng: trang lịch sử phân tích
- Xử lý:
  - đọc token từ localStorage
  - gọi GET /resume/history
  - hiển thị danh sách các lần phân tích trước đó
  - cho phép chọn một item để xem chi tiết báo cáo
- Công nghệ: Fetch API, React state, client-side UI

#### app/my-cvs/page.tsx
- Chức năng: trang thư viện CV đã upload
- Xử lý:
  - gọi GET /resume/list
  - hiển thị danh sách CV lưu trong DB và Cloudinary
  - cho phép mở file trực tiếp trên tab mới
- Công nghệ: Fetch API, localStorage token, UI card layout

#### app/profile/page.tsx
- Chức năng: trang hồ sơ và cài đặt cá nhân
- Xử lý:
  - đọc thông tin user từ JWT trong localStorage
  - gọi GET /resume/stats để lấy số lần phân tích, số CV, dung lượng ước tính
  - cho phép đổi mật khẩu UI (chưa kết nối hoàn toàn backend)
  - quản lý theme và preferences
- Công nghệ: React state, localStorage, custom theme hook

---

### 5.3 Component giao diện chính
#### components/Navbar.tsx
- Chức năng: thanh điều hướng ở đầu trang
- Xử lý:
  - kiểm tra trạng thái đăng nhập bằng token trong localStorage
  - decode JWT đơn giản để lấy email và hiển thị trên UI
  - mở modal đăng nhập/đăng ký
  - hỗ trợ logout
  - render menu dropdown cho History, My CVs, Profile
- Công nghệ: React hooks, JWT decode thủ công, localStorage

#### components/AuthModal.tsx
- Chức năng: modal đăng nhập/đăng ký
- Xử lý:
  - switch giữa login/register mode
  - gọi POST /auth/login hoặc POST /auth/register
  - xử lý social login Google/Facebook bằng Firebase Auth
  - sau khi thành công lưu token vào localStorage
- Công nghệ:
  - Firebase Auth SDK
  - fetch
  - controlled form state

#### components/AnalysisResult.tsx
- Chức năng: component hiển thị kết quả phân tích AI
- Xử lý:
  - nhận data từ backend (matchScore, summary, strengths, weaknesses, missingSkills, recommendations)
  - hiển thị theo giao diện web và giao diện print/PDF
  - dùng component DownloadReportButton để xuất báo cáo
- Công nghệ: React component, conditional rendering

#### components/DownloadReportButton.tsx
- Chức năng: nút tải báo cáo dưới dạng PDF
- Xử lý:
  - dùng window.print() để mở hộp thoại in/ lưu PDF của trình duyệt
  - thay đổi document.title để tên file PDF đẹp hơn
- Công nghệ: browser print API

#### components/ThemeProvider.tsx
- Chức năng: quản lý theme sáng/tối toàn cục
- Xử lý:
  - lưu theme vào localStorage
  - áp dụng class dark lên document.documentElement
  - cung cấp context cho toàn bộ app
- Công nghệ: React Context API

---

### 5.4 Component landing page
Các component trong components/landing/ tạo nên homepage marketing:
- HeroDemo.tsx: phần hero giới thiệu sản phẩm
- Stats.tsx: hiển thị thống kê / số liệu hấp dẫn
- Features.tsx: giới thiệu tính năng chính
- HowItWorks.tsx: mô tả quy trình sử dụng
- Cta.tsx: nút kêu gọi hành động
- Footer.tsx: footer cuối trang

---

### 5.5 Cấu hình Firebase
#### src/lib/firebase.ts
- Chức năng: khởi tạo Firebase Auth trên client
- Xử lý:
  - đọc cấu hình từ biến môi trường NEXT_PUBLIC_*
  - khởi tạo app Firebase singleton
  - tạo đối tượng auth và providers cho Google/Facebook
  - thiết lập persistence bằng browserLocalPersistence
- Công nghệ: firebase SDK

---

### 5.6 Type definitions
#### type/resume.ts
- Chức năng: định nghĩa kiểu dữ liệu cho kết quả phân tích AI
- Xử lý:
  - định nghĩa interface AnalysisData với các field như matchScore, summary, strengths, weaknesses, missingSkills, recommendations

---

## 6. Giao tiếp với backend
Frontend gọi backend qua URL được cấu hình bằng biến môi trường:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Các endpoint chính được gọi
- POST /resume/upload: upload CV + JD
- POST /auth/login: đăng nhập bằng email/password
- POST /auth/register: đăng ký tài khoản
- POST /auth/social: đăng nhập social qua Firebase token
- GET /resume/history: lấy lịch sử phân tích
- GET /resume/list: lấy danh sách CV
- GET /resume/stats: lấy thống kê người dùng

---

## 7. Biến môi trường
Tạo file .env.local trong thư mục frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Ý nghĩa biến môi trường
- NEXT_PUBLIC_API_URL: địa chỉ backend
- NEXT_PUBLIC_FIREBASE_***: cấu hình Firebase Auth cho login social

---

## 8. Cài đặt và chạy
### Cài đặt dependency
```bash
cd frontend
npm install
```

### Chạy development server
```bash
npm run dev
```

### Build production
```bash
npm run build
```

### Chạy production build
```bash
npm run start
```

### Lint code
```bash
npm run lint
```

---

## 9. Các tính năng nổi bật trong UI
- Upload CV PDF với preview trước khi gửi
- Validate file: chỉ nhận PDF và giới hạn kích thước 5MB
- Progress bar giả lập quá trình AI đang phân tích
- Hiển thị kết quả phân tích rõ ràng bằng các nhóm: điểm mạnh, điểm yếu, kỹ năng còn thiếu, khuyến nghị
- Chế độ in/PDF báo cáo chuyên nghiệp
- Navbar responsive và menu user
- Hỗ trợ dark mode qua ThemeProvider

---

## 10. Cách frontend lưu trạng thái
### localStorage
Frontend đang dùng localStorage để lưu các dữ liệu tạm thời:
- token: lưu JWT từ backend
- freeTrials: giới hạn số lần dùng thử miễn phí cho khách vãng lai
- theme: lưu trạng thái sáng/tối
- pref_lang: lưu ngôn ngữ báo cáo

### Lưu ý kỹ thuật
- Đây là cách triển khai đơn giản, phù hợp demo hoặc MVP.
- Nếu cần bảo mật cao hơn, nên chuyển sang HttpOnly cookie hoặc session-based auth.

---

## 11. Các package chính và vai trò
- next: framework React và routing
- react, react-dom: thư viện UI
- firebase: auth social login
- react-hot-toast: thông báo toast
- jspdf, html-to-image: export báo cáo
- lucide-react: icon
- tailwindcss, @tailwindcss/postcss: styling
- eslint, eslint-config-next: linting

---

## 12. Kết luận
Frontend hiện tại tập trung vào trải nghiệm người dùng cho một sản phẩm AI CV Analysis MVP. Nó có đủ các thành phần cần thiết để:
1. upload CV và nhập JD
2. gọi backend phân tích bằng AI
3. hiển thị kết quả đẹp và dễ hiểu
4. hỗ trợ đăng nhập và quản lý lịch sử

Đây là nền tảng rất phù hợp để mở rộng thành dashboard tuyển dụng, hệ thống gợi ý cải thiện CV, báo cáo chuyên nghiệp hơn hoặc tích hợp thêm nhiều loại auth và analytics.
