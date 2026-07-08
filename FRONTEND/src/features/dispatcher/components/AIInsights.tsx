import React from 'react';
import { AIRecommendation } from '@/types/dispatcher';

interface AIInsightsProps {
  recommendation: AIRecommendation | null;
  onApply: (id: string) => void;
  onDismiss: (id: string) => void;
}

export const AIInsights: React.FC<AIInsightsProps> = ({
  recommendation,
  onApply,
  onDismiss,
}) => {
  return (
    <div className="ops-panel-strong shrink-0 overflow-hidden rounded-lg">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h3 className="flex items-center gap-2 text-[15px] font-bold text-slate-950">
            <span className="material-symbols-outlined text-[18px] text-[#0f6b7d]">psychology</span>
            Gợi ý AI Dispatch
          </h3>
          <p className="mt-0.5 text-[12px] font-semibold text-slate-500">Ưu tiên theo ETA, tắc nghẽn và SLA</p>
        </div>
        <span className="rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 text-[11px] font-bold text-cyan-900">
          Explainable
        </span>
      </div>

      <div className="p-4">
        {!recommendation ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-[13px] font-bold text-emerald-900">Luồng xe ổn định</p>
            <p className="mt-1 text-[12px] leading-snug text-emerald-800">
              Không có đề xuất điều phối mới. Tiếp tục theo dõi cảnh báo SLA và dock đang bận.
            </p>
          </div>
        ) : recommendation.applied ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-[13px] font-bold text-emerald-900">Đã áp dụng đề xuất</p>
            <p className="mt-1 text-[12px] leading-snug text-emerald-800">
              Lộ trình mới đã gửi cho tài xế. ETA dự kiến giảm và lịch sử thao tác được ghi nhận.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-md border border-cyan-200 bg-cyan-50 p-3">
              <p className="text-[13px] font-bold text-slate-950">
                {recommendation.title === 'Faster route found for Van 4'
                  ? 'Tìm thấy lộ trình nhanh hơn cho Xe 4'
                  : recommendation.title}
              </p>
              <p className="mt-1 text-[12px] leading-snug text-slate-600">
                {recommendation.description === 'Avoids accident on I-95. Saves est. 14 mins.'
                  ? 'Tránh điểm nghẽn trên hành lang I-95, ước tính tiết kiệm 14 phút.'
                  : recommendation.description}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md border border-slate-200 bg-white p-2">
                <p className="font-data-tabular text-[16px] font-bold text-slate-950">14p</p>
                <p className="text-[11px] font-semibold text-slate-500">Giảm ETA</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-2">
                <p className="font-data-tabular text-[16px] font-bold text-slate-950">0</p>
                <p className="text-[11px] font-semibold text-slate-500">Xung đột Dock</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-2">
                <p className="font-data-tabular text-[16px] font-bold text-slate-950">AA</p>
                <p className="text-[11px] font-semibold text-slate-500">Độ tin cậy</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onApply(recommendation.id)}
                className="flex-1 rounded-md bg-[#0f3554] px-3 py-2 text-[13px] font-bold text-white transition-colors hover:bg-[#16496f]"
              >
                Áp dụng
              </button>
              <button
                onClick={() => onDismiss(recommendation.id)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-[13px] font-bold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Bỏ qua
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
