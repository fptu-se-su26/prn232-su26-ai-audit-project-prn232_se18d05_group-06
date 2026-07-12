import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export type LabelPrintTemplateProps = {
  inboundCode: string;
  skuCode: string;
  productName: string;
  binCode: string;
};

// Sử dụng forwardRef để thư viện react-to-print có thể lấy được thẻ DOM
export const LabelPrintTemplate = forwardRef<HTMLDivElement, LabelPrintTemplateProps>(
  ({ inboundCode, skuCode, productName, binCode }, ref) => {
    // Mã theo dõi (LPN)
    const trackingCode = `${inboundCode}-${skuCode}`;

    return (
      <div className="hidden print:block">
        <div 
          ref={ref} 
          style={{ 
            width: '100mm', 
            height: '100mm', 
            padding: '8mm', 
            backgroundColor: 'white',
            color: 'black',
            fontFamily: 'sans-serif',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '4mm', marginBottom: '4mm' }}>
            <h1 style={{ margin: 0, fontSize: '18pt', fontWeight: 'bold' }}>SMART LOGISTICS</h1>
            <p style={{ margin: '2mm 0 0', fontSize: '12pt' }}>NHÃN THEO DÕI (LPN)</p>
          </div>

          {/* QR Code */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '4mm 0' }}>
            <QRCodeSVG value={trackingCode} size={140} level="H" />
          </div>

          {/* Info */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2mm', fontSize: '11pt' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Mã Đơn:</strong>
              <span>{inboundCode}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Mã SKU:</strong>
              <span style={{ fontWeight: 'bold' }}>{skuCode}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Sản Phẩm:</strong>
              <span style={{ textAlign: 'right', maxWidth: '60%' }}>{productName}</span>
            </div>
          </div>

          {/* Footer - Bin Location */}
          <div style={{ marginTop: 'auto', paddingTop: '4mm', borderTop: '2px dashed black', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '10pt', color: '#555' }}>Vị trí cất hàng (Bin)</p>
            <h2 style={{ margin: '2mm 0 0', fontSize: '24pt', fontWeight: '900', letterSpacing: '2px' }}>
              {binCode || 'CHƯA XÁC ĐỊNH'}
            </h2>
          </div>
        </div>
      </div>
    );
  }
);
LabelPrintTemplate.displayName = 'LabelPrintTemplate';
