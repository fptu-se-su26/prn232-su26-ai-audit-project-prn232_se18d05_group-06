import React, { useState, useRef, useEffect } from 'react';

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

interface DeliveryConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  activeStop: RouteStop;
  onConfirmSuccess: () => void;
}

interface ChecklistItem {
  id: string;
  name: string;
  details: string;
}

export const DeliveryConfirmation: React.FC<DeliveryConfirmationProps> = ({
  isOpen,
  onClose,
  activeStop,
  onConfirmSuccess,
}) => {
  // Items database
  const [items] = useState<ChecklistItem[]>([
    { id: 'item-1', name: 'Bộ định tuyến không dây Wi-Fi 6 AX3000', details: 'Số lượng: 1 • Mã: WTR-AX3K-99' },
    { id: 'item-2', name: 'Cáp mạng CAT6 UTP 20m', details: 'Số lượng: 2 • Mã: CBL-C6-20M' },
  ]);
  const [checkedIds, setCheckedIds] = useState<string[]>(['item-1', 'item-2']);

  // Photo Cargo snapshot states
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Electronic Signature Canvas states
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasSigned, setHasSigned] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Beep sound oscillator
  const playCameraShutterSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const gainNode = audioCtx.createGain();
      
      // High pitch snap
      const osc1 = audioCtx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(4000, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      
      // Low air release
      const osc2 = audioCtx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(200, audioCtx.currentTime);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 0.05);
      osc2.stop(audioCtx.currentTime + 0.08);
    } catch (e) {}
  };

  // Reset signature canvas
  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSigned(false);
      }
    }
  };

  // Trigger cargo image snapshot mockup
  const handleAddPhoto = () => {
    setIsCapturing(true);
    playCameraShutterSound();
    
    setTimeout(() => {
      setIsCapturing(false);
      // Simulated cargo barcode drop-off package photo URL
      setPhotoPreview('https://lh3.googleusercontent.com/aida-public/AB6AXuCV3HB7jIUDekm1qtBEwLR7yglIuWN-XBfAEdH6QbsjfmYOr5r5Ha1Y7S_cKOTLkU7jFVPX0IYn7aBuNr_62yZaDQ5lQ8cqy2-MYGRPjtG2XQRMnEQ9cStR1KEwjvMVjigERAjyY-5DeA441wmqSTyS2mZwnISX0gBsykt17pMBN6kxHCe1EjiCZ3c3yAxtNbVjWbH0CMebUsBTmbdQRgAcdwUF319GgrvgfnVYoPv0VH2VNp7IbcXe-04MjIF6LNHMhjfdmgf9mOze');
    }, 1200);
  };

  // Checklist handler
  const handleToggleCheck = (id: string) => {
    setCheckedIds((prev) => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Canvas drawing drawing handlers (touch/mouse compatible)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && isOpen) {
      const resizeCanvas = () => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      };
      
      resizeCanvas();
      // Brief delay to ensure container dimensions calculated
      setTimeout(resizeCanvas, 100);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#004ac6';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        setIsDrawing(true);
        setHasSigned(true);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-y-auto bg-[#f7f9fb] z-[95] font-body-md pb-32 pt-14 select-none pointer-events-auto">
      {/* Top Navigation / Header */}
      <header className="fixed top-0 left-0 right-0 w-full h-14 bg-white z-[98] flex items-center px-margin-mobile border-b border-[#c3c6d7] shadow-sm">
        <button 
          onClick={onClose}
          aria-label="Quay lại" 
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f2f4f6] transition-colors text-[#191c1e] -ml-2"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="ml-2 font-headline-md text-headline-md text-[#191c1e] font-bold tracking-tight text-lg sm:text-xl">Xác nhận giao hàng</h1>
      </header>

      {/* Main Content Canvas */}
      <main className="px-margin-mobile py-6 flex flex-col gap-6 max-w-lg mx-auto w-full">
        
        {/* Section 1: Order Items Checklist */}
        <section className="bg-white border border-[#c3c6d7] rounded-xl p-4 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="material-symbols-outlined text-[#004ac6]">inventory_2</span>
            <h2 className="font-label-xl text-sm font-bold text-[#191c1e]">Kiểm tra kiện hàng</h2>
          </div>
          <div className="flex flex-col gap-2">
            {items.map((item) => {
              const isChecked = checkedIds.includes(item.id);
              return (
                <label 
                  key={item.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 hover:bg-[#f2f4f6]/60 rounded-lg border border-transparent hover:border-[#c3c6d7]/40 transition-all cursor-pointer group"
                >
                  <div className="pt-0.5">
                    <input 
                      checked={isChecked}
                      onChange={() => handleToggleCheck(item.id)}
                      className="w-6 h-6 rounded border-[#737686] text-[#004ac6] focus:ring-[#004ac6] focus:ring-offset-0 bg-white" 
                      type="checkbox"
                    />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold text-xs leading-normal mb-0.5 transition-colors ${isChecked ? 'text-gray-900 group-hover:text-[#004ac6]' : 'text-gray-400'}`}>
                      {item.name}
                    </p>
                    <p className="text-[11px] text-gray-500 font-medium">{item.details}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        {/* Section 2: Photo Capture */}
        <section className="bg-white border border-[#c3c6d7] rounded-xl p-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#004ac6]">photo_camera</span>
            <h2 className="font-label-xl text-sm font-bold text-[#191c1e]">Chụp ảnh kiện hàng</h2>
          </div>
          <p className="text-xs text-[#434655] font-semibold -mt-1">Vui lòng chụp rõ mã vận đơn và tình trạng hộp ngoài.</p>
          
          {photoPreview ? (
            <div className="relative rounded-lg overflow-hidden border border-[#c3c6d7] h-[140px] group">
              <img src={photoPreview} alt="Cargo drop-off preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => setPhotoPreview(null)}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white p-1 rounded-full shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={handleAddPhoto}
              disabled={isCapturing}
              className="w-full h-[140px] border-2 border-dashed border-[#c3c6d7] rounded-lg flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-[#f2f4f6]/60 transition-colors text-[#004ac6] focus:ring-2 focus:ring-[#004ac6] focus:outline-none"
            >
              {isCapturing ? (
                <>
                  <span className="material-symbols-outlined text-[36px] animate-spin">sync</span>
                  <span className="font-bold text-xs">Đang mở camera...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[36px]">add_a_photo</span>
                  <span className="font-bold text-xs">Nhấn để chụp ảnh</span>
                </>
              )}
            </button>
          )}
        </section>

        {/* Section 3: Digital Signature Pad */}
        <section className="bg-white border border-[#c3c6d7] rounded-xl p-4 shadow-sm flex flex-col gap-3">
          <div className="flex justify-between items-center pb-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ac6]">draw</span>
              <h2 className="font-label-xl text-sm font-bold text-[#191c1e]">Chữ ký người nhận</h2>
            </div>
            {hasSigned && (
              <button 
                onClick={handleClearSignature}
                className="text-[#434655] hover:text-[#ba1a1a] font-bold text-xs transition-colors px-2 py-1 rounded"
              >
                Xóa chữ ký
              </button>
            )}
          </div>
          
          <div className="w-full h-[180px] bg-gray-50 rounded-lg border border-[#c3c6d7] relative overflow-hidden group touch-none">
            {/* Draw signature drawing canvas pad */}
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full block cursor-crosshair relative z-10"
            />
            
            {!hasSigned && (
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none group-hover:opacity-60 transition-opacity">
                Ký vào khung này
              </span>
            )}
            
            {/* Ornamental borders */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#c3c6d7]/60 opacity-50 pointer-events-none"></div>
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#c3c6d7]/60 opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#c3c6d7]/60 opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#c3c6d7]/60 opacity-50 pointer-events-none"></div>
          </div>
        </section>

        {/* Section 4: COD Collection Confirmation */}
        <section className="bg-[#dde2f8] border border-[#c1c6db] rounded-xl p-5 flex items-center justify-between shadow-sm relative overflow-hidden">
          {/* Decorative payments card background */}
          <div className="absolute -right-6 -top-6 text-[#c1c6db] opacity-30 transform rotate-12 pointer-events-none">
            <span className="material-symbols-outlined text-[120px]">payments</span>
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <div className="flex items-center gap-1.5 text-[#414658]">
              <span className="material-symbols-outlined text-sm">info</span>
              <span className="font-bold text-xs uppercase tracking-wide">Tổng thu hộ (COD)</span>
            </div>
            <div className="font-headline-lg-mobile text-[#151b2b] font-bold text-xl sm:text-2xl leading-snug">Đã thu: {activeStop.cod}</div>
          </div>
          {/* Checkmark badge */}
          <div className="w-10 h-10 rounded-full bg-[#151b2b] text-[#dde2f8] flex items-center justify-center relative z-10 shadow-md">
            <span className="material-symbols-outlined font-bold">check</span>
          </div>
        </section>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-[#c3c6d7] px-margin-mobile pt-4 pb-8 z-40 shadow-[0_-8px_24px_rgba(0,0,0,0.04)]">
        <div className="max-w-lg mx-auto">
          <button 
            onClick={onConfirmSuccess}
            className="w-full h-[56px] bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md"
          >
            <span className="material-symbols-outlined">check_circle</span>
            Xác nhận giao hàng thành công
          </button>
        </div>
      </div>
    </div>
  );
};
