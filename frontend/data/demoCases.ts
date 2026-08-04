// File này chứa dữ liệu giả lập (mock data) cho các kịch bản Demo AI trên Landing Page.
import { CheckCircle, AlertTriangle } from 'lucide-react';

export const demoCases = [
  {
    fileName: "CV_Senior_Frontend_Developer.pdf",
    targetRole: "Senior Next.js / Fullstack Engineer",
    jdContext: "\"Looking for Senior Engineer experienced in React, Next.js App Router, TypeScript, Docker, CI/CD pipeline...\"",
    score: 92,
    status: "Excellent Match",
    colorTheme: "emerald",
    Icon: CheckCircle,
    strengths: ["React & Next.js Ecosystem", "TypeScript Proficiency"],
    missing: ["Docker", "CI/CD Pipeline", "AWS Cloud"],
    suggestion: "+ Bổ sung số liệu thực tế (Measurable achievements) vào phần kinh nghiệm dự án Next.js để tăng trọng lượng CV."
  },
  {
    fileName: "Backend_Java_Spring_CV.pdf",
    targetRole: "Backend Developer (Java/Spring)",
    jdContext: "\"We need a robust Backend Developer with 3+ years of Java, Spring Boot, Microservices, Redis, and Kafka...\"",
    score: 78,
    status: "Good Match",
    colorTheme: "blue",
    Icon: CheckCircle,
    strengths: ["Java Core", "Spring Boot Framework"],
    missing: ["Redis", "Kafka", "Microservices Architecture"],
    suggestion: "+ Hãy làm nổi bật các dự án có sử dụng Message Queue hoặc Caching để khớp 100% với yêu cầu thiết kế hệ thống."
  },
  {
    fileName: "Mobile_Flutter_Dev_v2.pdf",
    targetRole: "Mobile Developer (Flutter)",
    jdContext: "\"Seeking a Flutter developer to build cross-platform apps. Experience with CI/CD, Unit Testing, and state management required.\"",
    score: 64,
    status: "Fair Match",
    colorTheme: "amber",
    Icon: AlertTriangle,
    strengths: ["Flutter & Dart", "Cross-platform UI"],
    missing: ["CI/CD for Mobile", "Unit Testing", "State Management"],
    suggestion: "+ CV đang thiếu phần mô tả cách bạn viết Test và deploy app lên store tự động. Hãy bổ sung ngay!"
  },
  {
    fileName: "Junior_Data_Analyst.pdf",
    targetRole: "Senior Data Analyst",
    jdContext: "\"Require advanced SQL, Python, Tableau/PowerBI, and 5 years experience handling big data pipelines...\"",
    score: 42,
    status: "Needs Improvement",
    colorTheme: "red",
    Icon: AlertTriangle,
    strengths: ["Basic SQL", "Python Scripting"],
    missing: ["5+ Years Experience", "Tableau/PowerBI", "Big Data Pipelines"],
    suggestion: "+ Vị trí này yêu cầu Senior (5+ năm). Bạn nên tập trung ứng tuyển các vị trí Junior/Mid-level để có tỷ lệ pass cao hơn."
  }
];