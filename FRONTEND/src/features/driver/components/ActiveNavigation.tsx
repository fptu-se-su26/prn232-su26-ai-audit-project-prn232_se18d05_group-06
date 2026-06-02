import React, { useState } from 'react';

interface RouteStop {
  id: string;
  destination: string;
  address: string;
  eta: string;
  distance: string;
  timeEst: string;
  priority: 'HIGH' | 'STANDARD';
  status: 'COMPLETED' | 'DELIVERING' | 'PENDING';
  orderId: string;
  cod: string;
  phone: string;
}

interface ActiveNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  activeStop: RouteStop;
  onSosTrigger: () => void;
  onCallTrigger: () => void;
  onArrivalComplete: () => void;
}

export const ActiveNavigation: React.FC<ActiveNavigationProps> = ({
  isOpen,
  onClose,
  activeStop,
  onSosTrigger,
  onCallTrigger,
  onArrivalComplete,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [arriveState, setArriveState] = useState<'idle' | 'processing' | 'success'>('idle');

  if (!isOpen) return null;

  const handleArriveClick = () => {
    setArriveState('processing');
    
    // Play beep
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {}

    setTimeout(() => {
      setArriveState('success');
      
      // Play high success beep
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
      } catch (e) {}

      setTimeout(() => {
        onArrivalComplete();
        setArriveState('idle');
      }, 1000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden z-[90] font-body-md bg-[#e0e3e5] select-none pointer-events-auto">
      {/* Map Canvas Background (Level 0) */}
      <div 
        aria-hidden="true" 
        className="absolute inset-0 z-0 bg-[#e0e3e5]"
        style={{
          backgroundImage: `
            linear-gradient(#d8dadc 2px, transparent 2px),
            linear-gradient(90deg, #d8dadc 2px, transparent 2px),
            linear-gradient(#f7f9fb 1px, transparent 1px),
            linear-gradient(90deg, #f7f9fb 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
          backgroundPosition: '-2px -2px, -2px -2px, -1px -1px, -1px -1px',
        }}
      >
        {/* Simulated Map Routing Elements */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
          {/* Route Polyline (Kinetic Blue) */}
          <path 
            className="route-line path-line" 
            d="M 20 80 Q 40 70, 50 50 T 80 20" 
            fill="none" 
            stroke="#004ac6" 
            strokeLinecap="round" 
            strokeWidth="1.5"
          />
          {/* Delivery Destination Marker */}
          <circle cx="80" cy="20" fill="#ba1a1a" r="2.5" stroke="#ffffff" strokeWidth="0.8"></circle>
          {/* Current Location pulsing Marker */}
          <circle cx="20" cy="80" fill="#004ac6" r="3.5"></circle>
          <circle className="ping-animation" cx="20" cy="80" fill="#004ac6" opacity="0.25" r="10"></circle>
        </svg>
      </div>

      {/* Navigation Overlay Header Card (Top - Level 2) */}
      <div className="absolute top-margin-mobile left-margin-mobile right-margin-mobile md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-30">
        <div className="bg-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-[#c3c6d7] p-4 flex items-center gap-4">
          <div className="w-14 h-14 bg-[#d3e4fe] text-[#004ac6] rounded-lg flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[40px] fill">turn_right</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-headline-lg-mobile text-headline-lg-mobile text-[#191c1e] text-xl font-bold leading-none mb-1">500m</p>
            <p className="font-body-md text-body-md text-[#434655] truncate font-semibold">Rẽ phải vào đường Nguyễn Huệ</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 shrink-0 bg-gray-100 rounded-full"
            title="Đóng bản đồ"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      {/* Side Controls (Right - Level 2) */}
      <div className="absolute right-margin-mobile top-1/3 flex flex-col gap-4 z-20">
        {/* Mute Audio */}
        <button 
          onClick={() => setIsMuted(!isMuted)}
          aria-label="Mute navigation" 
          className="w-[48px] h-[48px] bg-white text-[#434655] rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.12)] flex items-center justify-center hover:bg-[#e6e8ea] transition-colors border border-[#c3c6d7] active:scale-95 duration-100"
        >
          <span className="material-symbols-outlined">{isMuted ? 'volume_off' : 'volume_up'}</span>
        </button>
        {/* Re-center Map */}
        <button 
          aria-label="Re-center map" 
          className="w-[48px] h-[48px] bg-white text-[#434655] rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.12)] flex items-center justify-center hover:bg-[#e6e8ea] transition-colors border border-[#c3c6d7] active:scale-95 duration-100"
        >
          <span className="material-symbols-outlined">my_location</span>
        </button>
        {/* SOS Button (High Contrast) */}
        <button 
          onClick={onSosTrigger}
          aria-label="Initiate SOS" 
          className="w-[48px] h-[48px] bg-[#ba1a1a] text-white rounded-full shadow-[0_4px_12px_rgba(186,26,26,0.3)] flex items-center justify-center hover:bg-[#93000a] active:scale-95 transition-all mt-2"
        >
          <span className="material-symbols-outlined">sos</span>
        </button>
      </div>

      {/* Bottom Sheet Execution Panel */}
      <div className="absolute bottom-0 left-0 w-full z-40 flex flex-col md:w-[460px] md:left-6 md:bottom-6 md:h-auto pointer-events-none">
        
        {/* Floating ETA Insight */}
        <div className="px-margin-mobile mb-4 flex justify-center w-full pointer-events-auto">
          <div className="bg-[#2d3133] text-[#eff1f3] px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 bg-opacity-95 backdrop-blur-sm">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            <p className="font-label-md text-label-md text-xs font-bold">ETA cập nhật: {activeStop.eta}</p>
          </div>
        </div>

        {/* Main Sheet panel */}
        <div className="bg-white rounded-t-[24px] md:rounded-[24px] shadow-[0_-8px_24px_rgba(0,0,0,0.12)] md:shadow-[0_8px_24px_rgba(0,0,0,0.12)] w-full border-t md:border border-[#c3c6d7] pt-3 pb-8 px-4 pointer-events-auto flex flex-col">
          {/* Drag Handle Bar for Mobile aesthetics */}
          <div className="w-12 h-1.5 bg-[#c3c6d7] rounded-full mx-auto mb-5 md:hidden"></div>

          {/* Customer name & receipt header */}
          <div className="flex justify-between items-start mb-5">
            <div>
              <h1 className="font-headline-md text-[#191c1e] text-lg font-bold">{activeStop.destination}</h1>
              <div className="flex items-center gap-1.5 mt-1 text-[#434655] bg-[#f2f4f6] inline-flex px-2 py-0.5 rounded-md">
                <span className="material-symbols-outlined text-[15px]">receipt_long</span>
                <span className="font-label-md text-xs font-bold">{activeStop.orderId}</span>
              </div>
            </div>
            {/* Call action */}
            <button 
              onClick={onCallTrigger}
              className="w-[48px] h-[48px] bg-[#dae2fd] text-[#003ea8] rounded-full flex items-center justify-center hover:bg-[#b4c5ff] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined fill">call</span>
            </button>
          </div>

          {/* Address Context block */}
          <div className="bg-[#f2f4f6] border border-[#c3c6d7]/30 rounded-xl p-4 flex gap-3 mb-5">
            <div className="text-[#ba1a1a] mt-0.5 shrink-0">
              <span className="material-symbols-outlined fill text-[20px]">location_on</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#434655] mb-0.5">Điểm giao hàng</p>
              <p className="text-xs text-[#191c1e] leading-relaxed font-semibold">
                {activeStop.address}
              </p>
            </div>
          </div>

          {/* Execution Arrive action button */}
          <button 
            onClick={handleArriveClick}
            disabled={arriveState !== 'idle'}
            className={`w-full h-[56px] rounded-xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md ${
              arriveState === 'success'
                ? 'bg-[#146c2e] text-white hover:bg-[#146c2e]'
                : 'bg-[#004ac6] text-white hover:bg-[#2563eb]'
            }`}
          >
            {arriveState === 'idle' && (
              <>
                <span className="material-symbols-outlined">where_to_vote</span>
                Đã đến điểm giao
              </>
            )}
            {arriveState === 'processing' && (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span>
                Đang xử lý...
              </>
            )}
            {arriveState === 'success' && (
              <>
                <span className="material-symbols-outlined">check_circle</span>
                Hoàn tất thao tác
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
