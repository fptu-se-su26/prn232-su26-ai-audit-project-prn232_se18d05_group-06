import React, { useRef, useEffect } from 'react';
import Header from './Header';

const OrderTrackingMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
      const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
      
      if (mapRef.current) {
        mapRef.current.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="bg-surface text-on-surface font-body-md overflow-hidden h-screen w-screen flex flex-col">
      <Header />
      
      <main className="relative flex-grow mt-[72px] h-[calc(100vh-72px)] overflow-hidden">
        {/* Dark Themed Fullscreen Map Background */}
        <div className="absolute inset-0 z-0 bg-inverse-surface">
          <div 
            ref={mapRef}
            className="relative w-full h-full grayscale-[0.8] opacity-60 mix-blend-screen overflow-hidden transition-transform duration-100 ease-out" 
            style={{ 
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBds0H9pr3X6lWxmhTvF8NEBgA2Mw8lbr0AWu0082P6nMHLYf5_-AvGO-7U5F5FHUnw3cnXHaZVbG8pcZABF9lmFKC4qs0grMam5Hi7G18ZMuLBsBGfCyyusjfZR3hoAKabat58DZ7T3jXaTQf-XYpechNyLJxarE0SHWw_hyA2Ms0ZcOcMvzyupgKpX_pNufAb0C4I_kPu8AiyyOlt_SQMebmdDozOSvO1iw7RfzKxdGKD22makvAIiUT5moU3Ecvtq4EfGpMZ_MK4')", 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
            }}
          >
          </div>
          
          {/* SVG Overlay for Route and Truck */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
            <path className="route-line" d="M400,800 Q800,750 1200,400 T1800,200" fill="none" stroke="#2563eb" strokeWidth="6"></path>
            <path d="M400,800 Q800,750 1200,400 T1800,200" fill="none" stroke="rgba(37,99,235,0.3)" strokeWidth="12"></path>
            
            {/* Animated Truck Marker */}
            <g className="truck-animation">
              <circle cx="1150" cy="445" fill="#2563eb" r="12"></circle>
              <circle cx="1150" cy="445" fill="#2563eb" fillOpacity="0.2" r="24"></circle>
              <foreignObject height="30" width="30" x="1135" y="430">
                <span className="material-symbols-outlined text-white text-[24px]">local_shipping</span>
              </foreignObject>
            </g>
            
            {/* Start and End Pins */}
            <circle cx="400" cy="800" fill="#565e74" r="8"></circle>
            <circle cx="1800" cy="200" fill="#ba1a1a" r="10"></circle>
          </svg>
        </div>
        
        {/* Left Floating Panel: Delivery Details */}
        <div className="absolute left-gutter top-gutter z-10 w-[380px] space-y-gutter">
          {/* ETA Card */}
          <div className="glass-panel rounded-xl p-container-padding shadow-lg">
            <div className="flex items-center justify-between mb-base">
              <span className="font-label-md text-on-surface-variant uppercase tracking-wider">Thời gian dự kiến</span>
              <span className="px-3 py-1 bg-primary/10 text-primary font-bold rounded-full text-label-sm">ĐANG GIAO</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-display-lg text-primary">14:45</span>
              <span className="font-headline-md text-headline-md text-on-surface-variant">Hôm nay</span>
            </div>
            <div className="mt-stack-md flex items-center gap-stack-sm p-stack-sm bg-surface-container-low rounded-lg">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <div>
                <p className="font-label-sm text-on-surface-variant">Điểm dừng hiện tại</p>
                <p className="font-body-md font-semibold">Trung tâm Phân phối Quận 7</p>
              </div>
            </div>
          </div>
          
          {/* Driver Info Card */}
          <div className="glass-panel rounded-xl p-container-padding shadow-lg">
            <div className="flex items-center gap-stack-md">
              <img alt="Driver Portrait" className="w-16 h-16 rounded-full object-cover border-2 border-primary" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-piA-1tNodFVsjQOWpdkV9K4rFYhjQXLIdTtFceKxKEEpU0giS0yXgQpNJgJdR_FrHZARSlLpfI7yA0OE4v7rHna84QU28QjVv5qUYwITgqJX7GdS5FLYXX8GrulS_oS_RDYBu3W7HhnqzLMFAdaaYAG7_tnUYrnPdUUBmuWnLXWA0UCFosAr3vVngnXSi_fXi-n6IgRhyXUIVedQWD-dtgivTRcXsyvC0fRiw4G1kqdOwvHImWEDyLm9_gYqVPW8bpBLbYlyJnnq"/>
              <div className="flex-grow">
                <h3 className="font-headline-md text-headline-md">Nguyễn Văn An</h3>
                <div className="flex items-center gap-1 text-primary">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-label-md">4.9 (1,240 chuyến)</span>
                </div>
              </div>
            </div>
            <div className="mt-gutter grid grid-cols-2 gap-stack-sm">
              <div className="p-stack-sm border border-outline-variant rounded-lg text-center">
                <p className="text-label-sm text-on-surface-variant">Phương tiện</p>
                <p className="font-label-md">VinFast VF8 - 51K-123.45</p>
              </div>
              <div className="p-stack-sm border border-outline-variant rounded-lg text-center">
                <p className="text-label-sm text-on-surface-variant">Đơn hàng</p>
                <p className="font-label-md">#SLAI-9920</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Floating Action Buttons */}
        <div className="absolute right-gutter top-gutter z-10 flex flex-col gap-base">
          <button className="w-14 h-14 rounded-full bg-white dark:bg-surface-container-highest shadow-xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300 active:scale-90" title="Gọi tài xế">
            <span className="material-symbols-outlined">call</span>
          </button>
          <button className="w-14 h-14 rounded-full bg-white dark:bg-surface-container-highest shadow-xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300 active:scale-90" title="Nhắn tin">
            <span className="material-symbols-outlined">chat</span>
          </button>
          <button className="w-14 h-14 rounded-full bg-white dark:bg-surface-container-highest shadow-xl flex items-center justify-center text-error hover:bg-error hover:text-white transition-all duration-300 active:scale-90" title="Báo cáo sự cố">
            <span className="material-symbols-outlined">report</span>
          </button>
        </div>
        
        {/* Bottom Delivery Steps Overlay */}
        <div className="absolute bottom-gutter left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-[1000px]">
          <div className="glass-panel rounded-full px-container-padding py-stack-md shadow-2xl flex items-center justify-between">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[18px]">check</span>
              </div>
              <span className="text-label-sm font-semibold text-primary">Đã nhận</span>
            </div>
            <div className="flex-grow h-[2px] bg-primary mx-4"></div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[18px]">check</span>
              </div>
              <span className="text-label-sm font-semibold text-primary">Đóng gói</span>
            </div>
            <div className="flex-grow h-[2px] bg-primary mx-4"></div>
            
            {/* Step 3 (Active) */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-[0_0_15px_rgba(0,74,198,0.5)] border-4 border-white">
                <span className="material-symbols-outlined text-[20px]">local_shipping</span>
              </div>
              <span className="text-label-sm font-bold text-on-surface">Đang giao</span>
            </div>
            <div className="flex-grow h-[2px] bg-outline-variant mx-4"></div>
            
            {/* Step 4 */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              </div>
              <span className="text-label-sm font-medium text-on-surface-variant">Đã đến kho</span>
            </div>
            <div className="flex-grow h-[2px] bg-outline-variant mx-4"></div>
            
            {/* Step 5 */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">home</span>
              </div>
              <span className="text-label-sm font-medium text-on-surface-variant">Hoàn tất</span>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer text overlay inside map bounds */}
      <div className="fixed bottom-2 right-4 z-50 pointer-events-none opacity-50">
        <p className="font-label-sm text-on-surface-variant">© 2024 SmartLog AI</p>
      </div>
    </div>
  );
};

export default OrderTrackingMap;
