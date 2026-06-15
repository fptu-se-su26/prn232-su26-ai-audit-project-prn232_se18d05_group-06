import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { CreditCard, Wallet, Smartphone, ShieldCheck, CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaymentPage: React.FC = () => {
    const [selectedMethod, setSelectedMethod] = useState<'card' | 'momo' | 'vnpay' | 'bank'>('card');
    const navigate = useNavigate();

    const handlePayment = () => {
        // Simulate payment process
        alert('Thanh toán thành công!');
        navigate('/customer/order-success');
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <Header scrollY={100} />
            
            <main className="pt-32 pb-24 max-w-7xl mx-auto px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Payment methods */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-2">
                                <CreditCard className="text-blue-600" />
                                Hình thức thanh toán
                            </h2>

                            <div className="space-y-4 mb-12">
                                {[
                                    { id: 'card', label: 'Thẻ tín dụng / Ghi nợ', icon: CreditCard, desc: 'Visa, Mastercard, JCB' },
                                    { id: 'momo', label: 'Ví MoMo', icon: Smartphone, desc: 'Thanh toán nhanh qua ứng dụng MoMo' },
                                    { id: 'vnpay', label: 'VNPAY', icon: Wallet, desc: 'Quét mã QR để thanh toán' },
                                    { id: 'bank', label: 'Chuyển khoản ngân hàng', icon: Smartphone, desc: 'Hỗ trợ tất cả ngân hàng nội địa' },
                                ].map((method) => (
                                    <label 
                                        key={method.id}
                                        className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                                            selectedMethod === method.id 
                                            ? 'border-blue-600 bg-blue-50/50' 
                                            : 'border-slate-100 hover:border-blue-200 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="radio" 
                                                checked={selectedMethod === method.id}
                                                onChange={() => setSelectedMethod(method.id as any)}
                                                className="hidden"
                                            />
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                selectedMethod === method.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-gray-500'
                                            }`}>
                                                <method.icon size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{method.label}</p>
                                                <p className="text-sm text-gray-500">{method.desc}</p>
                                            </div>
                                        </div>
                                        {selectedMethod === method.id && <CheckCircle2 className="text-blue-600" size={24} />}
                                    </label>
                                ))}
                            </div>

                            {/* Card Details (Nested for 'card') */}
                            {selectedMethod === 'card' && (
                                <div className="p-8 bg-slate-50 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Số thẻ</label>
                                        <input type="text" placeholder="**** **** **** ****" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Ngày hết hạn</label>
                                            <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">CVC/CVV</label>
                                            <input type="password" placeholder="***" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 sticky top-32">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h3>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Phí vận chuyển</span>
                                    <span>250,000đ</span>
                                </div>
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Dịch vụ cộng thêm</span>
                                    <span>45,000đ</span>
                                </div>
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Giảm giá (VPROMO)</span>
                                    <span className="text-green-600">-25,000đ</span>
                                </div>
                                <div className="border-t border-slate-100 pt-4 flex justify-between">
                                    <span className="font-bold text-gray-900">Tổng cộng</span>
                                    <span className="font-black text-2xl text-blue-600">270,000đ</span>
                                </div>
                            </div>

                            <button 
                                onClick={handlePayment}
                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-200 mb-6"
                            >
                                <Lock size={20} />
                                Thanh toán ngay
                                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="flex items-center gap-3 justify-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                                <ShieldCheck size={16} />
                                Bảo mật chuẩn quốc tế PCI DSS
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PaymentPage;
