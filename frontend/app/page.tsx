'use client';
// File này là trang chủ chính (Landing Page gốc), đóng vai trò ráp nối các component con lại với nhau theo chuẩn Clean Code.
import HeroDemo from '@/components/landing/HeroDemo';
import Stats from '@/components/landing/Stats';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Cta from '@/components/landing/Cta';
import Footer from '@/components/landing/Footer';
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-100 selection:bg-blue-200 overflow-x-hidden transition-colors">
      <HeroDemo />
      <Stats />
      <Features />
      <HowItWorks />
      <Cta />
      <Footer />
    </div>
  );
}