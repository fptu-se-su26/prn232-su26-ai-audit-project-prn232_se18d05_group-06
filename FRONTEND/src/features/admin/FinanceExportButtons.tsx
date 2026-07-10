import React, { useState } from 'react';
import api from '@lib/api';

interface FinanceExportButtonsProps {
  reportType: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  category?: string;
  period?: string;
  className?: string;
  compact?: boolean;
}

const extractFileName = (contentDisposition: string, fallback: string) => {
  if (!contentDisposition) return fallback;
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1].replace(/"/g, ''));
  const normalMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return normalMatch?.[1] || fallback;
};

const extensionOf = (format: 'excel' | 'pdf') => (format === 'pdf' ? 'pdf' : 'xlsx');

const FinanceExportButtons: React.FC<FinanceExportButtonsProps> = ({
  reportType,
  fromDate,
  toDate,
  status,
  category,
  period,
  className = '',
  compact = false,
}) => {
  const [busyFormat, setBusyFormat] = useState<'excel' | 'pdf' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const exportReport = async (format: 'excel' | 'pdf') => {
    try {
      setBusyFormat(format);
      setError(null);
      const response = await api.get('/finance/reports/export', {
        params: { reportType, format, fromDate, toDate, status, category, period },
        responseType: 'blob',
      });
      const contentDisposition = String(response.headers['content-disposition'] ?? '');
      const contentType = String(response.headers['content-type'] || 'application/octet-stream');
      const fileName = extractFileName(
        contentDisposition,
        `${reportType}-${fromDate || 'all'}-to-${toDate || 'all'}.${extensionOf(format)}`,
      );
      const blob = new Blob([response.data], { type: contentType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError('\u004b\u0068\u00f4\u006e\u0067 \u0074\u0068\u1ec3 \u0078\u0075\u1ea5\u0074 \u0062\u00e1\u006f \u0063\u00e1\u006f. \u0056\u0075\u0069 \u006c\u00f2\u006e\u0067 \u006b\u0069\u1ec3\u006d \u0074\u0072\u0061 \u0062\u0061\u0063\u006b\u0065\u006e\u0064 \u0068\u006f\u1eb7\u0063 \u0062\u1ed9 \u006c\u1ecdc \u0068\u0069\u1ec7\u006e \u0074\u1ea1\u0069.');
    } finally {
      setBusyFormat(null);
    }
  };

  const sizeClass = compact ? 'h-10 px-3 text-xs' : 'h-11 px-4 text-sm';

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => exportReport('excel')}
        disabled={busyFormat !== null}
        className={`inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 ${sizeClass}`}
      >
        <span className="material-symbols-outlined text-[18px]">table_view</span>
        {busyFormat === 'excel' ? 'Exporting...' : 'Export Excel'}
      </button>
      <button
        type="button"
        onClick={() => exportReport('pdf')}
        disabled={busyFormat !== null}
        className={`inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 ${sizeClass}`}
      >
        <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
        {busyFormat === 'pdf' ? 'Exporting...' : 'Export PDF'}
      </button>
      {error && <span className="basis-full text-xs font-medium text-rose-600">{error}</span>}
    </div>
  );
};

export default FinanceExportButtons;