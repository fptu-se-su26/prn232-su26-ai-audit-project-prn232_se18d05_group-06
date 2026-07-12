import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
}

const QRScanner = ({ onScanSuccess, onScanFailure }: QRScannerProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Create instance
    scannerRef.current = new Html5Qrcode("qr-reader-custom");

    // Cleanup
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      // This explicitly requests camera permissions from the browser
      const cameras = await Html5Qrcode.getCameras();
      if (cameras && cameras.length > 0) {
        setHasPermission(true);
        if (!scannerRef.current) return;
        
        await scannerRef.current.start(
          cameras[0].id,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (text) => {
            scannerRef.current?.stop().then(() => {
              setIsScanning(false);
              onScanSuccess(text);
            }).catch(console.error);
          },
          (err) => {
            if (onScanFailure) onScanFailure(err);
          }
        );
        setIsScanning(true);
      } else {
        setHasPermission(false);
        setError("Không tìm thấy camera trên thiết bị này.");
      }
    } catch (err: any) {
      setHasPermission(false);
      setError("Không có quyền truy cập camera. Vui lòng cấp quyền trong cài đặt trình duyệt của bạn.");
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && isScanning) {
      await scannerRef.current.stop().catch(console.error);
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !scannerRef.current) return;
    setError(null);
    
    // Stop camera if scanning
    if (isScanning) {
      await scannerRef.current.stop().catch(console.error);
      setIsScanning(false);
    }

    try {
      const decodedText = await scannerRef.current.scanFile(file, true);
      onScanSuccess(decodedText);
    } catch (err) {
      setError("Không tìm thấy mã QR/Barcode hợp lệ trong ảnh.");
      if (onScanFailure) onScanFailure(err);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      <div className="relative w-full overflow-hidden rounded-xl border-2 border-slate-200 mb-4 bg-slate-50">
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm p-4 text-center z-10">
            Camera đang tắt. Vui lòng chọn phương thức quét.
          </div>
        )}
        <div 
          id="qr-reader-custom" 
          className={`w-full transition-all ${isScanning ? 'min-h-[250px]' : 'min-h-[150px]'}`}
        />
      </div>

      <div className="flex gap-2">
        {!isScanning ? (
          <button
            type="button"
            onClick={startCamera}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-semibold rounded-xl transition-colors"
          >
            <Camera className="w-4 h-4" />
            Bật Camera
          </button>
        ) : (
          <button
            type="button"
            onClick={stopCamera}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
          >
            <Camera className="w-4 h-4" />
            Tắt Camera
          </button>
        )}
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
        >
          <ImageIcon className="w-4 h-4" />
          Chọn ảnh
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileUpload} 
        />
      </div>
    </div>
  );
};

export default QRScanner;
