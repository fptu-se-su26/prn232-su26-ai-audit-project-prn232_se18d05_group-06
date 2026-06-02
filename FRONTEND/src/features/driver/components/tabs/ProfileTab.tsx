import React from 'react';

interface ProfileTabProps {
  driverName: string;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  driverName,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-[#c3c6d7] shadow-sm">
        <h2 className="text-xl font-bold text-[#191c1e] mb-6 flex items-center gap-2 border-b border-[#c3c6d7]/30 pb-3 font-headline-md">
          <span className="material-symbols-outlined text-[#004ac6]">person</span>
          Thông tin cá nhân tài xế
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-xl border border-gray-100 select-none">
            <img
              alt="Driver Profile Large"
              className="w-24 h-24 rounded-full object-cover border-4 border-[#2563eb] shadow-md mb-3"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzbyQB3BSZtskG284KejwPkegh2zgHtkvWd3-AxhcGDy5jokHA3n0brq_cYQklgEaRNOwZNY3_jwGQfZM_O0A7zXyL2yMu5IF8tHw-IhownwFVUk01dI5XpVPIa7VjPm_mVQIKY1y0SUyz1eT0-odBCgzvBPYX3_w80VTzPxA5AF5F9HZxty1n7a0R1SU0aOGwpS64e5trFykqP9y6dw5s2yV1iuzZnI7FTg8wdyQtMnqqRD1sjpmSC2zia1uDfpan4BywqXRgZmWQ"
            />
            <h3 className="font-bold text-lg text-gray-900 font-headline-md">{driverName}</h3>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 font-label-md">Tài xế chuyên nghiệp • SmartLog Logistics</span>
            <div className="flex gap-1.5 text-amber-500 mb-2">
              <span className="material-symbols-outlined fill text-[20px]">star</span>
              <span className="material-symbols-outlined fill text-[20px]">star</span>
              <span className="material-symbols-outlined fill text-[20px]">star</span>
              <span className="material-symbols-outlined fill text-[20px]">star</span>
              <span className="material-symbols-outlined fill text-[20px]">star</span>
            </div>
            <span className="text-xs font-bold text-gray-700 bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-label-md">Đánh giá: 5.0 / 5.0 ★</span>
          </div>

          <div className="space-y-4 font-body-md">
            <div className="border-b border-gray-100 pb-2">
              <span className="text-xs font-bold text-gray-400 block uppercase font-label-md">Mã số tài xế</span>
              <span className="text-sm font-bold text-[#191c1e] font-body-lg">DRV-4022-HN</span>
            </div>
            <div className="border-b border-gray-100 pb-2">
              <span className="text-xs font-bold text-gray-400 block uppercase font-label-md">Phương tiện vận tải</span>
              <span className="text-sm font-bold text-[#191c1e] font-body-lg">V-402 (Xe tải Box Truck 3.5 Tấn)</span>
            </div>
            <div className="border-b border-gray-100 pb-2">
              <span className="text-xs font-bold text-gray-400 block uppercase font-label-md">Hạng giấy phép lái xe</span>
              <span className="text-sm font-bold text-[#191c1e] font-body-lg">Hạng C (Giao thông đường bộ)</span>
            </div>
            <div className="border-b border-gray-100 pb-2">
              <span className="text-xs font-bold text-gray-400 block uppercase font-label-md">Khu vực làm việc</span>
              <span className="text-sm font-bold text-[#191c1e] font-body-lg">Khu công nghiệp Tân Bình - Quận 1, TP.HCM</span>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-400 block uppercase font-label-md">Liên hệ công ty</span>
              <span className="text-sm font-bold text-[#004ac6] underline hover:text-[#2563eb] cursor-pointer font-body-lg">hotline@smartlog.ai (1900-5055)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
