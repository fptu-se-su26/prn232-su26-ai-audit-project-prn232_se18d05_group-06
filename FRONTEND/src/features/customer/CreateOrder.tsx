import React, { useState, useEffect } from 'react';
import Header from './Header';
import { useNavigate } from 'react-router-dom';
import { AddressAutocomplete } from '@/components/customer/AddressAutocomplete';
import toast, { Toaster } from 'react-hot-toast';
import RouteMiniMap from './components/RouteMiniMap';

const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const [price, setPrice] = useState(0);
  const [isFragile, setIsFragile] = useState(false);
  const [isCOD, setIsCOD] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);

  // Quote states
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [standardPrice, setStandardPrice] = useState<number>(0);
  const [expressPrice, setExpressPrice] = useState<number>(0);
  const [basePrice, setBasePrice] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [tierName, setTierName] = useState<string>('Tiêu chuẩn');
  const [standardTime, setStandardTime] = useState<string>('');
  const [expressTime, setExpressTime] = useState<string>('');
  const [selectedSpeed, setSelectedSpeed] = useState<'STANDARD' | 'EXPRESS'>('STANDARD');

  // Form states
  const [serviceType, setServiceType] = useState('TRANSPORT');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupLat, setPickupLat] = useState<number | undefined>();
  const [pickupLng, setPickupLng] = useState<number | undefined>();
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryLat, setDeliveryLat] = useState<number | undefined>();
  const [deliveryLng, setDeliveryLng] = useState<number | undefined>();
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  
  const [itemName, setItemName] = useState('');
  const [itemValue, setItemValue] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  const [weightKg, setWeightKg] = useState<number>(1.5);
  const [cbm, setCbm] = useState<number>(0.5);

  const handleCreateOrder = async () => {
    setIsLoading(true);

    // Simulate slight delay for animation if it's too fast
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ServiceType: selectedSpeed,
        PickupAddress: pickupAddress,
        PickupLat: pickupLat,
        PickupLng: pickupLng,
        DeliveryAddress: deliveryAddress,
        DeliveryLat: deliveryLat,
        DeliveryLng: deliveryLng,
        TotalWeightKg: weightKg,
        TotalCBM: cbm
      };

      const response = await fetch('http://localhost:5200/api/customer/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.Message || 'Có lỗi xảy ra khi tạo đơn hàng');
      }

      const data = await response.json();

      // Navigate to tracking via success page
      navigate('/order-success', { state: { orderId: data.orderId } });
    } catch (error: any) {
      toast.error(error.message, {
        style: {
          borderRadius: '16px',
          background: '#ef4444',
          color: '#fff',
          fontWeight: 'bold',
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Micro-interaction animation hook for price
  const animatePrice = (newPrice: number) => {
    let start = price;
    const duration = 800;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setPrice(Math.floor(progress * (newPrice - start) + start));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };

  const fetchQuote = async (pLat: number, pLng: number, dLat: number, dLng: number, w: number, v: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5200/api/customer/orders/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ PickupLat: pLat, PickupLng: pLng, DeliveryLat: dLat, DeliveryLng: dLng, WeightKg: w, Cbm: v, ServiceType: serviceType })
      });
      if (res.ok) {
        const data = await res.json();
        setDistanceKm(data.distanceKm);
        setStandardPrice(data.standardPrice);
        setExpressPrice(data.expressPrice);
        setBasePrice(data.basePrice ?? data.standardPrice ?? 0);
        setDiscountPercent(data.discountPercent ?? 0);
        setTierName(data.tierName ?? 'Tiêu chuẩn');
        setStandardTime(data.standardTime);
        setExpressTime(data.expressTime);

        // Auto select standard initially
        setSelectedSpeed('STANDARD');
        animatePrice(data.standardPrice);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsOcrLoading(true);
    try {
      const formData = new FormData();
      formData.append('imageFile', e.target.files[0]);

      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5200/api/customer/orders/scan-invoice', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (data.address) setDeliveryAddress(data.address);
        if (data.senderAddress) setPickupAddress(data.senderAddress);
        if (data.weightKg) setWeightKg(data.weightKg);
        if (data.senderName) setSenderName(data.senderName);
        if (data.receiverName) setReceiverName(data.receiverName);
        if (data.senderPhone) setSenderPhone(data.senderPhone);
        if (data.receiverPhone) setReceiverPhone(data.receiverPhone);
        if (data.itemName) setItemName(data.itemName);
        if (data.itemValue) setItemValue(data.itemValue);
        if (data.notes) setNotes(data.notes);
        if (data.deliverySpeed === 'EXPRESS' || data.deliverySpeed === 'STANDARD') setSelectedSpeed(data.deliverySpeed as 'EXPRESS' | 'STANDARD');
        
        toast.success('Đã trích xuất thông tin hóa đơn thành công!', {
          style: {
            borderRadius: '16px',
            background: '#4f46e5',
            color: '#fff',
            fontWeight: 'bold',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#4f46e5',
          },
        });
      } else {
        toast.error('Không thể nhận diện hóa đơn.', {
          style: {
            borderRadius: '16px',
            background: '#ef4444',
            color: '#fff',
            fontWeight: 'bold',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#ef4444',
          },
        });
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi khi quét hóa đơn.');
    } finally {
      setIsOcrLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans text-[#191c1e] light-surface overflow-x-hidden">
      <Header />

      {/* Main Content Area */}
      <main className="mt-24 pb-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="font-sans text-[32px] leading-[40px] font-bold tracking-[-0.01em] text-slate-900">
                Tạo Đơn Hàng Mới
              </h2>
              <p className="font-sans text-[16px] leading-[24px] text-slate-500 mt-1">
                Khởi tạo vận đơn thông minh với sự hỗ trợ của AI
              </p>
            </div>
            <div className="flex gap-3">
              <input type="file" id="ocr-upload" accept="image/*" className="hidden" onChange={handleFileUpload} />
              <label htmlFor="ocr-upload" className="cursor-pointer px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-sans text-[14px] font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all duration-300 flex items-center gap-2">
                {isOcrLoading ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">document_scanner</span>
                )}
                Quét Hóa Đơn AI
              </label>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Left Column: Form Info */}
            <div className="col-span-12 lg:col-span-7 space-y-6">
              {/* Sender & Receiver */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100 space-y-5 group">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-2 bg-purple-50 text-purple-600 rounded-lg material-symbols-outlined">person</span>
                    <h3 className="font-sans text-[18px] font-semibold text-slate-900">Thông Tin Lấy Hàng</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[12px] font-bold text-slate-400 uppercase ml-1">Người gửi (Tùy chọn)</label>
                      <input
                        value={senderName}
                        onChange={e => setSenderName(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all" placeholder="Tên người gửi" type="text" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[12px] font-bold text-slate-400 uppercase ml-1">Số điện thoại lấy hàng (Tùy chọn)</label>
                      <input
                        value={senderPhone}
                        onChange={e => setSenderPhone(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all" placeholder="09xx xxx xxx" type="tel" />
                    </div>
                    <AddressAutocomplete
                      label="Địa Chỉ Lấy Hàng (*)"
                      placeholder="Số nhà, tên đường, phường/xã..."
                      value={pickupAddress}
                      onChange={setPickupAddress}
                      onSelect={(addr, lat, lng) => {
                        setPickupAddress(addr);
                        setPickupLat(lat);
                        setPickupLng(lng);
                        if (lat && lng && deliveryLat && deliveryLng) {
                          fetchQuote(lat, lng, deliveryLat, deliveryLng, weightKg, cbm);
                        }
                      }}
                      icon="location_on"
                      iconBgClass="bg-purple-50"
                      iconTextClass="text-purple-600"
                    />
                  </div>
                </section>

                <section className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100 space-y-5 group">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg material-symbols-outlined">location_away</span>
                    <h3 className="font-sans text-[18px] font-semibold text-slate-900">Thông Tin Giao Hàng</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[12px] font-bold text-slate-400 uppercase ml-1">Người nhận (Tùy chọn)</label>
                      <input
                        value={receiverName}
                        onChange={e => setReceiverName(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" placeholder="Tên người nhận" type="text" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[12px] font-bold text-slate-400 uppercase ml-1">Số điện thoại nhận hàng (*)</label>
                      <input
                        value={receiverPhone}
                        onChange={e => setReceiverPhone(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" placeholder="09xx xxx xxx" type="tel" />
                    </div>
                    <AddressAutocomplete
                      label="Địa Chỉ Giao Hàng (*)"
                      placeholder="Số nhà, tên đường, quận/huyện..."
                      value={deliveryAddress}
                      onChange={setDeliveryAddress}
                      onSelect={(addr, lat, lng) => {
                        setDeliveryAddress(addr);
                        setDeliveryLat(lat);
                        setDeliveryLng(lng);
                        if (pickupLat && pickupLng && lat && lng) {
                          fetchQuote(pickupLat, pickupLng, lat, lng, weightKg, cbm);
                        }
                      }}
                      icon="location_away"
                      iconBgClass="bg-indigo-50"
                      iconTextClass="text-indigo-600"
                    />
                  </div>
                </section>
              </div>

              {/* Package Info */}
              <section className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100 space-y-6">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-purple-50 text-purple-600 rounded-lg material-symbols-outlined">package_2</span>
                  <h3 className="font-sans text-[20px] font-semibold text-slate-900">Chi Tiết Hàng Hóa</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-slate-400 uppercase">Tên Hàng Hóa</label>
                    <input
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-purple-500/20 outline-none font-semibold text-slate-700 transition-all"
                      placeholder="VD: Quần áo, Điện thoại..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-slate-400 uppercase">Khối Lượng (kg)</label>
                    <input
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all" type="number" step="0.1"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-slate-400 uppercase">Thể Tích (CBM)</label>
                    <input
                      value={cbm}
                      onChange={(e) => setCbm(Number(e.target.value))}
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all" type="number" step="0.1"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-slate-400 uppercase">Giá Trị (VNĐ)</label>
                    <input
                      value={itemValue}
                      onChange={(e) => setItemValue(Number(e.target.value) || '')}
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all" type="number"
                      placeholder="VD: 500000"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-slate-400 uppercase">Ghi Chú</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all min-h-[80px]"
                    placeholder="Ghi chú thêm về đơn hàng..."
                  />
                </div>

                <div className="flex flex-wrap gap-6 py-2">
                  <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsFragile(!isFragile)}>
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${isFragile ? 'border-purple-600 bg-purple-600' : 'border-slate-200 group-hover:border-purple-500'}`}>
                      <span className={`material-symbols-outlined text-white text-[16px] ${isFragile ? 'block' : 'hidden'}`} style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    </div>
                    <span className="font-sans text-[16px] text-slate-600 font-medium">Hàng Dễ Vỡ</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsCOD(!isCOD)}>
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${isCOD ? 'border-purple-600 bg-purple-600' : 'border-slate-200 group-hover:border-purple-500'}`}>
                      <span className={`material-symbols-outlined text-white text-[16px] ${isCOD ? 'block' : 'hidden'}`} style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    </div>
                    <span className="font-sans text-[16px] text-slate-600 font-medium">Thu Hộ (COD)</span>
                  </label>
                </div>

              </section>
            </div>

            {/* Right Column: AI Insights & Maps */}
            <div className="col-span-12 lg:col-span-5 space-y-6">
              {/* Smart Quote Panel */}
              <section className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100 border-l-4 border-purple-500 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <span className="material-symbols-outlined text-[80px]">neurology</span>
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-purple-600" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <h3 className="font-sans text-[24px] font-bold text-slate-900">AI Smart Quote</h3>
                </div>
                <div className="space-y-5">
                  <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100 cursor-default transition-all duration-300">
                    <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-widest block mb-1">Cước phí ước tính</span>
                    
                    {discountPercent > 0 && (
                      <div className="flex flex-col gap-1 mb-2">
                        <div className="flex justify-between text-sm text-slate-500 line-through">
                          <span>Gốc:</span>
                          <span>{basePrice.toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-600 font-medium">
                          <span>Ưu đãi hạng {tierName} (-{discountPercent}%):</span>
                          <span>-{((basePrice * discountPercent) / 100).toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-baseline gap-2 border-t border-purple-100 pt-2">
                      <span className="font-sans text-[48px] font-extrabold tracking-[-0.02em] text-slate-900">
                        {price > 0 ? price.toLocaleString('vi-VN') : '--'}
                      </span>
                      <span className="font-sans text-[20px] font-bold text-slate-400">VNĐ</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 italic">*AI sẽ tự động tính toán khi bạn chọn đầy đủ địa chỉ lấy/giao hàng.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div
                      onClick={() => { setSelectedSpeed('STANDARD'); animatePrice(standardPrice); }}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${selectedSpeed === 'STANDARD' ? 'bg-purple-50/80 border-purple-500 shadow-md' : 'bg-slate-50/50 border-slate-100 hover:bg-white'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                          <span className={`material-symbols-outlined transition-colors ${selectedSpeed === 'STANDARD' ? 'text-purple-600' : 'text-slate-400'}`}>local_shipping</span>
                        </div>
                        <div>
                          <p className={`font-bold ${selectedSpeed === 'STANDARD' ? 'text-purple-600' : 'text-slate-900'}`}>Giao Tiết Kiệm</p>
                          <p className={`text-xs ${selectedSpeed === 'STANDARD' ? 'text-purple-500' : 'text-slate-500'}`}>{standardTime || '3-5 ngày'}</p>
                        </div>
                      </div>
                      <span className={`font-bold ${selectedSpeed === 'STANDARD' ? 'text-purple-600' : 'text-slate-900'}`}>{standardPrice > 0 ? standardPrice.toLocaleString('vi-VN') + 'đ' : '--'}</span>
                    </div>
                    <div
                      onClick={() => { setSelectedSpeed('EXPRESS'); animatePrice(expressPrice); }}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${selectedSpeed === 'EXPRESS' ? 'bg-purple-50/80 border-purple-500 shadow-lg shadow-purple-200' : 'bg-slate-50/50 border-slate-100 hover:bg-white'}`}>
                      {selectedSpeed === 'EXPRESS' && <div className="absolute top-0 right-0 px-4 py-1.5 bg-purple-600 text-white text-[10px] font-bold uppercase rounded-bl-xl shadow-lg shadow-purple-200">Recommend</div>}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                          <span className={`material-symbols-outlined transition-colors ${selectedSpeed === 'EXPRESS' ? 'text-purple-600' : 'text-slate-400'}`}>bolt</span>
                        </div>
                        <div>
                          <p className={`font-bold ${selectedSpeed === 'EXPRESS' ? 'text-purple-600' : 'text-slate-900'}`}>Giao Hỏa Tốc</p>
                          <p className={`text-xs ${selectedSpeed === 'EXPRESS' ? 'text-purple-400' : 'text-slate-500'}`}>{expressTime || 'Trong ngày'}</p>
                        </div>
                      </div>
                      <span className={`font-bold ${selectedSpeed === 'EXPRESS' ? 'text-purple-600' : 'text-slate-900'}`}>{expressPrice > 0 ? expressPrice.toLocaleString('vi-VN') + 'đ' : '--'}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Route Map */}
              <section className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100 aspect-[4/3] lg:aspect-square relative group z-0">
                <RouteMiniMap 
                  pickupLat={pickupLat} 
                  pickupLng={pickupLng} 
                  deliveryLat={deliveryLat} 
                  deliveryLng={deliveryLng} 
                />
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-20 pointer-events-none">
                  <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg pointer-events-auto border border-slate-100/50">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Lộ trình đề xuất (AI Map)</p>
                    <p className="text-[16px] font-extrabold text-slate-900">
                      {distanceKm > 0 ? `${distanceKm} km` : 'Chưa chọn lộ trình'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Final CTA */}
              <button
                onClick={handleCreateOrder}
                disabled={isLoading}
                className="w-full h-20 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-[2rem] font-bold text-[22px] shadow-xl shadow-purple-200 hover:shadow-purple-400/30 flex items-center justify-center gap-3 transition-all hover:-translate-y-1 active:scale-95 group mt-8 disabled:opacity-70 disabled:hover:translate-y-0 disabled:active:scale-100"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin text-[32px]">progress_activity</span>
                ) : (
                  <>
                    <span>Tạo Đơn Hàng</span>
                    <span className="material-symbols-outlined text-[32px] group-hover:translate-x-2 transition-transform duration-300">arrow_right_alt</span>
                  </>
                )}
              </button>

              <p className="text-center font-co-inter text-[12px] leading-[16px] font-medium tracking-[0.02em] text-slate-500 px-8 mt-6">
                Bằng việc tạo đơn hàng, bạn đồng ý với <a className="text-purple-600 underline hover:text-purple-800 transition-colors cursor-pointer" href="#">Điều khoản dịch vụ</a> và <a className="text-purple-600 underline hover:text-purple-800 transition-colors cursor-pointer" href="#">Chính sách bảo mật</a> của SmartLog AI.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Floating AI Assistant */}
      <div className="fixed bottom-8 right-8 z-50">
        <Toaster position="top-center" reverseOrder={false} />
        <button className="w-16 h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 relative group">
          <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          <div className="absolute -top-12 right-0 bg-slate-900 text-white px-4 py-2 rounded-xl font-sans text-[12px] leading-[16px] font-medium tracking-[0.02em] opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-xl">
            Cần trợ giúp với đơn hàng?
          </div>
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      </div>
    </div>
  );
};

export default CreateOrder;
