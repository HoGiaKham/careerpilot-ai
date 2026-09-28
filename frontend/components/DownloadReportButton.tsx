'use client';

import { useState } from 'react';
import { AnalysisData } from '../type/resume';
import { useLanguage } from '@/context/LanguageProvider';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

interface DownloadProps {
  result: AnalysisData;
  candidateName?: string;
  targetPosition?: string;
}

export default function DownloadReportButton({
  result,
  candidateName = 'Ứng viên',
  targetPosition = 'Vị trí ứng tuyển',
}: DownloadProps) {
  const { t } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    if (!result) {
      toast.error('Chưa có dữ liệu phân tích để xuất PDF.');
      return;
    }

    const reportElement = document.getElementById('pdf-report-content');

    if (!reportElement) {
      toast.error('Không tìm thấy dữ liệu để xuất PDF.');
      return;
    }

    setIsExporting(true);

    const toastId = toast.loading('Đang tạo báo cáo PDF...');

    try {
      // Hiển thị vùng PDF trước khi chụp
      const originalDisplay = reportElement.style.display;
      const originalWidth = reportElement.style.width;

      reportElement.style.display = 'block';
      reportElement.style.width = '100%';

      // Chờ browser render lại DOM
      await new Promise((resolve) =>
        requestAnimationFrame(() => resolve(undefined))
      );

      // Chuyển HTML → PNG
      const dataUrl = await toPng(reportElement, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      // Khôi phục style ban đầu
      reportElement.style.display = originalDisplay;
      reportElement.style.width = originalWidth;

      // Tạo PDF A4
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Tạo Image để lấy kích thước thật
      const img = new Image();

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () =>
          reject(new Error('Không thể tải ảnh báo cáo PDF.'));
        img.src = dataUrl;
      });

      const imgWidth = img.width;
      const imgHeight = img.height;

      // Tính chiều cao tương ứng khi scale về chiều rộng A4
      const renderedHeight = (imgHeight * pdfWidth) / imgWidth;

      let heightLeft = renderedHeight;
      let position = 0;

      // Trang đầu
      pdf.addImage(
        dataUrl,
        'PNG',
        0,
        position,
        pdfWidth,
        renderedHeight
      );

      heightLeft -= pdfHeight;

      // Các trang tiếp theo nếu nội dung dài
      while (heightLeft > 0) {
        position = heightLeft - renderedHeight;

        pdf.addPage();

        pdf.addImage(
          dataUrl,
          'PNG',
          0,
          position,
          pdfWidth,
          renderedHeight
        );

        heightLeft -= pdfHeight;
      }

      // Tạo tên file an toàn
      const safeName = [candidateName, targetPosition]
        .filter(Boolean)
        .join('_')
        .replace(/[^\w\u00C0-\u024F\u1E00-\u1EFF]+/g, '_');

      pdf.save(`CareerPilot_AI_Report_${safeName}.pdf`);

      toast.success('Đã tải báo cáo PDF thành công!', {
        id: toastId,
      });
    } catch {
      reportElement.style.display = 'none';

      toast.error('Lỗi khi tạo PDF, vui lòng thử lại.', {
        id: toastId,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isExporting}
      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 text-sm cursor-pointer print:hidden disabled:bg-blue-400 disabled:cursor-wait"
    >
      {isExporting ? (
        <svg
          className="animate-spin h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />

          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <span>📄</span>
      )}

      {isExporting ? 'Đang tạo...' : 'Tải Báo Cáo (PDF)'}
    </button>
  );
}