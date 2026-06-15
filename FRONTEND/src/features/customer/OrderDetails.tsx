import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

const OrderDetails: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Simple slide-up animation effect
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const getSectionStyle = (delayIndex: number) => ({
    opacity: showContent ? 1 : 0,
    transform: showContent ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.6s ease-out ${delayIndex * 0.1}s, transform 0.6s ease-out ${delayIndex * 0.1}s`,
  });

  return (
    <div className="bg-surface font-body-md text-on-surface transition-colors duration-300 min-h-screen">
      <Header />
      
      <main className="pt-[120px] pb-section-gap px-container-padding max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-gutter">
          <section className="glass-card rounded-xl p-container-padding shadow-[0_8px_32px_rgba(15,23,42,0.08)]" style={getSectionStyle(0)}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-gutter">
              <div>
                <p className="font-label-md text-on-surface-variant mb-1">Mã vận đơn</p>
                <h1 className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
                  #SL-2904-2024-X1
                  <span 
                    className={`material-symbols-outlined cursor-pointer hover:text-primary transition-colors ${copied ? 'text-green-500' : 'text-outline'}`}
                    onClick={handleCopy}
                  >
                    {copied ? 'done' : 'content_copy'}
                  </span>
                </h1>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-stack-md w-full md:w-auto">
                <div className="flex flex-col">
                  <span className="font-label-sm text-outline">Dịch vụ</span>
                  <span className="font-label-md text-on-surface">Vận chuyển Hỏa tốc</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-outline">Tổng phí</span>
                  <span className="font-label-md text-on-surface">1.250.000 VNĐ</span>
                </div>
                <div className="flex flex-col col-span-2 md:col-span-1">
                  <span className="font-label-sm text-outline">Trạng thái thanh toán</span>
                  <span className="inline-flex items-center gap-1 text-primary font-label-md">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    Đã thanh toán
                  </span>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <section className="glass-card rounded-xl p-stack-md" style={getSectionStyle(1)}>
              <div className="flex items-center gap-2 mb-stack-md">
                <span className="material-symbols-outlined text-primary p-2 bg-primary-fixed rounded-lg">upload_file</span>
                <h2 className="font-headline-md text-headline-md">Người gửi</h2>
              </div>
              <div className="space-y-stack-sm">
                <div>
                  <p className="font-label-sm text-outline">Họ và tên</p>
                  <p className="font-body-md font-semibold">Nguyễn Văn A</p>
                </div>
                <div>
                  <p className="font-label-sm text-outline">Số điện thoại</p>
                  <p className="font-body-md">090 123 4567</p>
                </div>
                <div>
                  <p className="font-label-sm text-outline">Địa chỉ</p>
                  <p className="font-body-md">Số 123, Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh</p>
                </div>
              </div>
            </section>
            
            <section className="glass-card rounded-xl p-stack-md" style={getSectionStyle(2)}>
              <div className="flex items-center gap-2 mb-stack-md">
                <span className="material-symbols-outlined text-tertiary p-2 bg-tertiary-fixed rounded-lg">download_for_offline</span>
                <h2 className="font-headline-md text-headline-md">Người nhận</h2>
              </div>
              <div className="space-y-stack-sm">
                <div>
                  <p className="font-label-sm text-outline">Họ và tên</p>
                  <p className="font-body-md font-semibold">Trần Thị B</p>
                </div>
                <div>
                  <p className="font-label-sm text-outline">Số điện thoại</p>
                  <p className="font-body-md">091 987 6543</p>
                </div>
                <div>
                  <p className="font-label-sm text-outline">Địa chỉ</p>
                  <p className="font-body-md">Số 456, Đường Kim Mã, Quận Ba Đình, Hà Nội</p>
                </div>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            <div className="lg:col-span-2 flex flex-col gap-gutter">
              <section className="glass-card rounded-xl p-stack-md" style={getSectionStyle(3)}>
                <h2 className="font-headline-md text-headline-md mb-stack-md">Thông tin kiện hàng</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-stack-md">
                  <div className="flex flex-col items-center p-stack-sm bg-surface-container-low rounded-lg">
                    <span className="material-symbols-outlined text-outline mb-1">weight</span>
                    <span className="font-label-sm text-outline">Trọng lượng</span>
                    <span className="font-label-md">15.5 kg</span>
                  </div>
                  <div className="flex flex-col items-center p-stack-sm bg-surface-container-low rounded-lg">
                    <span className="material-symbols-outlined text-outline mb-1">straighten</span>
                    <span className="font-label-sm text-outline">Kích thước</span>
                    <span className="font-label-md">40x30x50 cm</span>
                  </div>
                  <div className="flex flex-col items-center p-stack-sm bg-surface-container-low rounded-lg">
                    <span className="material-symbols-outlined text-outline mb-1">category</span>
                    <span className="font-label-sm text-outline">Loại hàng</span>
                    <span className="font-label-md">Điện tử</span>
                  </div>
                  <div className="flex flex-col items-center p-stack-sm bg-surface-container-low rounded-lg">
                    <span className="material-symbols-outlined text-outline mb-1">qr_code_2</span>
                    <span className="font-label-sm text-outline">Mã QR</span>
                    <button className="text-primary font-label-md underline">Xem mã</button>
                  </div>
                </div>
                
                <div className="mt-stack-md p-stack-sm border border-dashed border-outline-variant rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-stack-sm">
                    <div className="w-16 h-16 bg-white p-1 rounded border border-outline-variant">
                      <div className="w-full h-full bg-on-surface-variant flex items-center justify-center text-white text-[8px] text-center">QR CODE PLACEHOLDER</div>
                    </div>
                    <div>
                      <p className="font-label-md">QR Định danh kiện hàng</p>
                      <p className="font-label-sm text-outline">Dùng để quét khi giao nhận hàng</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-surface-container rounded-full transition-colors">
                    <span className="material-symbols-outlined">download</span>
                  </button>
                </div>
              </section>

              <section className="glass-card rounded-xl p-stack-md" style={getSectionStyle(4)}>
                <h2 className="font-headline-md text-headline-md mb-stack-md">Lịch trình vận chuyển</h2>
                <div className="space-y-0">
                  <div className="timeline-node relative pl-10 pb-stack-md">
                    <div className="absolute left-0 top-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center z-10 shadow-[0_0_12px_rgba(0,74,198,0.4)]">
                      <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    </div>
                    <div>
                      <p className="font-label-md text-primary">Đã nhận hàng thành công</p>
                      <p className="font-body-md text-on-surface-variant">Hàng đã được giao tận tay người nhận</p>
                      <p className="font-label-sm text-outline mt-1">29 Th04, 2024 - 15:30</p>
                    </div>
                  </div>
                  <div className="timeline-node relative pl-10 pb-stack-md">
                    <div className="absolute left-0 top-0 w-6 h-6 bg-primary-container rounded-full flex items-center justify-center z-10">
                      <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
                    </div>
                    <div>
                      <p className="font-label-md text-on-surface">Đang giao hàng</p>
                      <p className="font-body-md text-on-surface-variant">Tài xế đang trên đường đến địa chỉ người nhận</p>
                      <p className="font-label-sm text-outline mt-1">29 Th04, 2024 - 09:15</p>
                    </div>
                  </div>
                  <div className="timeline-node relative pl-10 pb-stack-md">
                    <div className="absolute left-0 top-0 w-6 h-6 bg-surface-variant rounded-full flex items-center justify-center z-10">
                      <div className="w-2 h-2 bg-outline rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-label-md text-on-surface">Đến kho trung chuyển Hà Nội</p>
                      <p className="font-body-md text-on-surface-variant">Hàng đã cập bến kho phân loại khu vực phía Bắc</p>
                      <p className="font-label-sm text-outline mt-1">28 Th04, 2024 - 21:00</p>
                    </div>
                  </div>
                  <div className="timeline-node relative pl-10">
                    <div className="absolute left-0 top-0 w-6 h-6 bg-surface-variant rounded-full flex items-center justify-center z-10">
                      <div className="w-2 h-2 bg-outline rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-label-md text-on-surface">Đã gửi hàng</p>
                      <p className="font-body-md text-on-surface-variant">Người gửi đã bàn giao hàng cho SmartLog AI</p>
                      <p className="font-label-sm text-outline mt-1">28 Th04, 2024 - 10:20</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            
            <div className="flex flex-col gap-gutter">
              <section className="glass-card rounded-xl p-stack-md border-l-4 border-primary" style={getSectionStyle(5)}>
                <h2 className="font-headline-md text-headline-md mb-stack-md">Thông tin tài xế</h2>
                <div className="flex items-center gap-stack-md mb-stack-md">
                  <img alt="Driver Portrait" className="w-16 h-16 rounded-full object-cover border-2 border-primary-container" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAW-Z6SCbrKt7kugHvj0O-6pBoCjZ87lqwseJItqfHMJvvP20zQ7L6apemtQCMInqxeeXwzJ5-Lokf3t7HDikuX5CmYEp1-Eq3iLEMBAAnUlpj_QaZhLeiSt9Yx4pJ6Q7lcw7mYMW-W3J_vAhJj2fEClO7fINZ4pMEqIzM0jn56VS1Tc1j6taKVh5grw_FI1SLGE8s0PWFgg0NfV6UHFjkd7W_Vusp30y6OGFY3RFvTkw1SXZlrXYdRv_ZfEs6OiNmekS2bNo8YZiK5"/>
                  <div>
                    <h3 className="font-label-md text-on-surface">Lê Hoàng Nam</h3>
                    <p className="font-label-sm text-outline">Mã NV: SL-9921</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-yellow-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-label-sm">4.9 (500+ chuyến)</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-stack-sm pt-stack-sm border-t border-outline-variant">
                  <div className="flex justify-between items-center">
                    <span className="font-label-sm text-outline">Số điện thoại</span>
                    <span className="font-label-md">098 765 4321</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-label-sm text-outline">Phương tiện</span>
                    <span className="font-label-md">Truck (2.5 Tấn)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-label-sm text-outline">Biển số</span>
                    <span className="font-label-md">29C - 123.45</span>
                  </div>
                </div>
                <button className="w-full mt-stack-md py-stack-sm bg-primary-container text-white rounded-lg font-label-md flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                  <span className="material-symbols-outlined">call</span>
                  Liên hệ tài xế
                </button>
              </section>
              
              <section className="glass-card rounded-xl p-stack-md" style={getSectionStyle(6)}>
                <h2 className="font-headline-md text-headline-md mb-stack-md">Bằng chứng giao hàng</h2>
                <div className="grid grid-cols-2 gap-stack-sm">
                  <div className="aspect-square rounded-lg overflow-hidden relative group cursor-pointer">
                    <img alt="Delivery photo 1" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdzKswHvzz6gSQImiBcp8ZkCEdXuCqjtDhhsdDQId-x1VTE87JcgzHMONwvYCS7aEWcJM6A34zZAPLbHR16g2UxRzG_3xwFcx0Agkds-PON6mtj0EQmjK5h-dB4aKm_1kmjtbWLxH_eUiRZE9R6e8-Vm_hYi1EEPhQniPEBALpVv8v0B8ZQk792QbBUwizix57UARCtmhsadY9ZYK-zsuk6Ke8jNRD35hydEc1Zy0o3zohzowvVJO42ergUTDXNKmRj5IHlUTm5bEq"/>
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="material-symbols-outlined text-white">zoom_in</span>
                    </div>
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden relative group cursor-pointer">
                    <img alt="Delivery photo 2" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9NUEKooFhVSHMXSCIevrwfbuWmKNf2wU0DpkORk8GwhuZbniYS5KwshINS7-Bee-CZcNKoMQBTH-LGOh4C2MEVjmqBBTgdWRGdXLWggWS94B0KO0_ceTql2u2LPX94rucs6ErCQvNSGXBFU-JTz85lvJ_NrjuVyjEPb8Mute24KNRO-gOzO8l8iHt1CaKS1cS06a6QaMTqaXpwgYP58NILzJyXxRdWXcgC6tT2ASPZYhxnkrlr8GjLbdkedvmu2Tt4h7UrQ3EGHFB"/>
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="material-symbols-outlined text-white">zoom_in</span>
                    </div>
                  </div>
                </div>
                <div className="mt-stack-md p-stack-sm bg-primary/5 rounded-lg">
                  <p className="font-label-sm text-primary mb-1">Ghi chú giao hàng:</p>
                  <p className="font-body-md italic text-on-surface-variant">"Gửi tại lễ tân tòa nhà theo yêu cầu khách hàng."</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderDetails;
