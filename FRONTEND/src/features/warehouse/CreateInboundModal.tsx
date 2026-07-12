import React, { useState } from 'react';
import { X, QrCode, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import api from '../../lib/api';
import QRScanner from '../../components/QRScanner';

type CreateInboundModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function CreateInboundModal({ isOpen, onClose, onSuccess }: CreateInboundModalProps) {
  const [step, setStep] = useState<'INPUT' | 'RECEIVING'>('INPUT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for QR
  const [qrCode, setQrCode] = useState('');
  const [qrQuantity, setQrQuantity] = useState<number>(1);
  const [qrBatchNo, setQrBatchNo] = useState('');
  const [qrExpiry, setQrExpiry] = useState('');
  
  // Common mapping
  const warehouseId = 1; // Default
  const customerId = 1; // Default
  
  // Receiving State
  const [inboundId, setInboundId] = useState<number | null>(null);
  const [receivedLines, setReceivedLines] = useState<any[]>([]);

  if (!isOpen) return null;

  const handleReset = () => {
    setStep('INPUT');
    setQrCode('');
    setError(null);
  };

  const submitQr = async () => {
    if (!qrCode) return setError('Vui lòng nhập mã QR/Barcode');
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/Inbound/scan-code', {
        code: qrCode,
        warehouseId,
        customerId,
        quantity: qrQuantity,
        batchNo: qrBatchNo || null,
        expiryDate: qrExpiry || null
      });
      setInboundId(res.data.data.inboundId);
      // Skip to receiving
      prepareReceiving(res.data.data.inboundId, [{
        lineId: 1, // dummy for now, ideally backend returns line details or we fetch them
        expectedQty: qrQuantity,
        receivedQty: qrQuantity,
        binId: 1 // default bin
      }]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi quét mã');
    } finally {
      setLoading(false);
    }
  };

  const prepareReceiving = (id: number, lines: any[]) => {
    setInboundId(id);
    setReceivedLines(lines);
    setStep('RECEIVING');
  };

  const submitReceiving = async () => {
    if (!inboundId) return;
    setLoading(true);
    setError(null);
    try {
      await api.post(`/Inbound/${inboundId}/confirm-receiving`, {
        lines: receivedLines.map(l => ({
          lineId: l.lineId,
          receivedQty: l.receivedQty,
          binId: l.binId
        }))
      });
      onSuccess();
      onClose();
      handleReset();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi xác nhận nhập kho');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Tạo Đơn Nhập Kho
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

          {step === 'INPUT' && (
            <div className="max-w-xl mx-auto">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">Quét mã hàng hóa</h3>
                    <p className="text-sm text-slate-500">Sử dụng máy quét, camera hoặc nhập thủ công</p>
                  </div>
                </div>

                <div className="mb-6">
                  <QRScanner 
                    onScanSuccess={(text) => {
                      setQrCode(text);
                    }}
                    onScanFailure={(err) => {
                      // Ignore frequent scan failures (e.g. no barcode found)
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mã hàng (QR/Barcode) *</label>
                  <input 
                    type="text" 
                    value={qrCode}
                    onChange={e => setQrCode(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    placeholder="Quét hoặc nhập mã..."
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng *</label>
                    <input 
                      type="number" 
                      min="1"
                      value={qrQuantity}
                      onChange={e => setQrQuantity(Number(e.target.value))}
                      className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Số lô (Batch)</label>
                    <input 
                      type="text" 
                      value={qrBatchNo}
                      onChange={e => setQrBatchNo(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:border-blue-500 outline-none"
                      placeholder="Tuỳ chọn"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'RECEIVING' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-emerald-600 mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <CheckCircle className="w-6 h-6" />
                <span className="font-semibold">Đã xác nhận thành công. Chuyển sang bước nhập hàng vào kho (Bin).</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-medium">
                    <tr>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3">SL Dự kiến</th>
                      <th className="px-4 py-3">SL Thực nhận</th>
                      <th className="px-4 py-3">Vị trí (Bin ID)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {receivedLines.map((line, idx) => (
                      <tr key={line.lineId}>
                        <td className="px-4 py-3 font-mono font-medium text-slate-700">{line.skuCode || `Line ${line.lineId}`}</td>
                        <td className="px-4 py-3 text-slate-500">{line.expectedQty}</td>
                        <td className="px-4 py-3">
                          <input 
                            type="number"
                            value={line.receivedQty}
                            onChange={e => {
                              const newLines = [...receivedLines];
                              newLines[idx].receivedQty = parseInt(e.target.value) || 0;
                              setReceivedLines(newLines);
                            }}
                            className="w-24 h-9 px-3 rounded-lg border border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none font-semibold text-emerald-700"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            type="number"
                            value={line.binId}
                            onChange={e => {
                              const newLines = [...receivedLines];
                              newLines[idx].binId = parseInt(e.target.value) || 0;
                              setReceivedLines(newLines);
                            }}
                            className="w-24 h-9 px-3 rounded-lg border border-slate-300 focus:border-blue-500 outline-none"
                            placeholder="VD: 1"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={() => { onClose(); handleReset(); }}
            className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors"
            disabled={loading}
          >
            Hủy
          </button>
          
          {step === 'INPUT' && (
            <button 
              onClick={submitQr}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-70 flex items-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Tiếp tục
            </button>
          )}

          {step === 'RECEIVING' && (
            <button 
              onClick={submitReceiving}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-70 flex items-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Hoàn tất nhập kho
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
