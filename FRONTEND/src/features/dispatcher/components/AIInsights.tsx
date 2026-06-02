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
    <div className="glass-panel rounded-lg flex flex-col overflow-hidden glow-active shrink-0 transition-all duration-300">
      <div className="p-3 border-b border-white/10 flex justify-between items-center bg-primary-container/10">
        <h3 className="font-headline-sm text-[14px] font-semibold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-primary animate-bounce">
            smart_toy
          </span>
          Thông tin AI
        </h3>
        <span className="text-[10px] bg-secondary/20 text-secondary border border-secondary/35 font-data-tabular px-1.5 py-0.25 rounded uppercase font-semibold">
          Tối ưu hóa
        </span>
      </div>

      <div className="p-3 flex flex-col gap-3 bg-surface/40 min-h-[110px] justify-center transition-all duration-300">
        {!recommendation ? (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant/40 mb-1">
              check_circle
            </span>
            <p className="text-[11px] text-on-surface-variant font-medium">
              Luồng logistics đã tối ưu. Không có đề xuất mới.
            </p>
          </div>
        ) : recommendation.applied ? (
          <div className="flex items-start gap-3 animate-fade-in">
            <div className="bg-secondary/25 p-1.5 rounded-full border border-secondary/40">
              <span className="material-symbols-outlined text-secondary text-[16px]">check</span>
            </div>
            <div>
              <p className="text-[13px] text-secondary font-semibold mb-0.5">Đã áp dụng lộ trình</p>
              <p className="text-[11px] text-on-surface-variant leading-tight">
                Dữ liệu đo lường mới đã được gửi cho tài xế. Thời gian dự kiến (ETA) giảm.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 animate-slide-up">
            <div className="mt-0.5 bg-secondary/20 p-1.5 rounded-full border border-secondary/30">
              <span className="material-symbols-outlined text-secondary text-[16px]">route</span>
            </div>
            <div className="flex-1">
              <p className="text-[13px] text-on-surface font-semibold mb-0.5">
                {recommendation.title === 'Faster route found for Van 4' ? 'Tìm thấy lộ trình nhanh hơn cho Xe 4' : recommendation.title}
              </p>
              <p className="text-[11px] text-on-surface-variant leading-tight mb-2">
                {recommendation.description === 'Avoids accident on I-95. Saves est. 14 mins.' ? 'Tránh tai nạn trên cao tốc I-95. Tiết kiệm dự kiến 14 phút.' : recommendation.description}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onApply(recommendation.id)}
                  className="bg-primary hover:bg-inverse-primary text-on-primary font-data-tabular text-[11px] font-bold px-3 py-1.5 rounded transition-all shadow-[0_0_10px_rgba(37,99,235,0.3)] hover:scale-[1.03] active:scale-[0.98]"
                >
                  Áp dụng
                </button>
                <button
                  onClick={() => onDismiss(recommendation.id)}
                  className="bg-transparent border border-outline-variant hover:bg-surface-variant/50 text-on-surface-variant font-data-tabular text-[11px] px-3 py-1.5 rounded transition-all hover:scale-[1.03]"
                >
                  Bỏ qua
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
