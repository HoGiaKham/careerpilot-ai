import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareerPilot AI - Tối ưu CV của bạn",
  description: "Trợ lý AI phân tích độ phù hợp giữa CV và Job Description",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        {/* Navbar sẽ luôn nằm trên cùng ở tất cả các trang */}
        <Navbar />
        
        <Toaster position="top-center" reverseOrder={false} />
        
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}