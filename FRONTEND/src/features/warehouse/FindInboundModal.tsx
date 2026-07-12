import React, { useState } from 'react';
import { X, QrCode, AlertTriangle, Search } from 'lucide-react';
import QRScanner from '../../components/QRScanner';

type FindInboundModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onOrderFound: (inboundId: number) => void;
  orders: { inboundId: number; inboundCode: string }[];
};

export default function FindInboundModal({ isOpen, onClose, onOrderFound, orders }: FindInboundModalProps) {
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setQrCode('');
    setError(null);
  };

  const handleSearch = (codeToSearch?: string) => {
    const code = codeToSearch || qrCode;
    if (!code) return setError('Vui lòng nhập mã Đơn nhập kho');
    
    // Attempt to find the order by inboundCode (case insensitive)
    const found = orders.find(o => o.inboundCode.toLowerCase() === code.trim().toLowerCase());
    if (found) {
      onOrderFound(found.inboundId);
      onClose();
      handleReset();
    } else {
      setError(`Không tìm thấy đơn nhập kho nào có mã: ${code}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-blue-600" />
            Tìm Đơn Nhập Kho
          </h2>
          <button onClick={() => { onClose(); handleReset(); }} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Search className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">Quét mã phiếu giao hàng</h3>
                <p className="text-sm text-slate-500">Đưa mã QR trên giấy tờ vào khung hình hoặc tải ảnh lên</p>
              </div>
            </div>

            <div className="mb-6">
              <QRScanner 
                onScanSuccess={(text) => {
                  setQrCode(text);
                  handleSearch(text);
                }}
                onScanFailure={() => {
                  // Ignore frequent scan failures
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hoặc nhập mã đơn (Ví dụ: IB-20250515-001)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={qrCode}
                  onChange={e => setQrCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="flex-1 h-12 px-4 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  placeholder="Nhập mã đơn..."
                  autoFocus
                />
                <button 
                  onClick={() => handleSearch()}
                  className="px-6 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Tìm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
