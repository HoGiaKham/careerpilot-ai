// Component này hiển thị phần chân trang chuyên nghiệp (Professional Footer) chứa link mạng xã hội và bản quyền tác giả.
import { Sparkles, Briefcase } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <div className="text-xl font-extrabold text-white mb-2 flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            Career Copilot AI
          </div>
          <p className="text-sm">AI-powered Resume Analysis System.</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
          <a href="https://your-portfolio-link.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Briefcase className="w-4 h-4" /> Portfolio
          </a>
          
          <a href="https://github.com/Tên-Github-Của-Bạn" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
            GitHub
          </a>

          <a href="https://linkedin.com/in/Tên-LinkedIn-Của-Bạn" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            LinkedIn
          </a>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 mt-8 pt-8 border-t border-slate-800/50 text-sm text-center md:text-left flex flex-col md:flex-row justify-between gap-4">
        <p>© {new Date().getFullYear()} Career Copilot AI. All rights reserved.</p>
        <p>Built with Next.js & Gemini AI by <strong className="text-white hover:text-blue-400 transition-colors cursor-pointer">Hồ Gia Khâm</strong></p>
      </div>
    </footer>
  );
}