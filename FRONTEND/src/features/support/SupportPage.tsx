import React from 'react';
import Header from '../customer/Header';
import Footer from '../customer/Footer';
import { MessageSquare, LifeBuoy, AlertCircle, HelpCircle, Phone, Mail, ChevronRight, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SupportPage: React.FC = () => {
    const navigate = useNavigate();

    const faqs = [
        { q: 'Làm thế nào để theo dõi đơn hàng?', a: 'Bạn có thể vào mục "Theo dõi đơn hàng" trên Header hoặc nhập mã vận đơn vào trang Tra cứu để biết vị trí thực tế.' },
        { q: 'Phí vận chuyển được tính như thế nào?', a: 'Phí vận chuyển dựa trên trọng lượng, kích thước và quãng đường vận chuyển. Bạn có thể sử dụng công cụ "Giá cước" để ước tính.' },
        { q: 'Tôi có thể thay đổi địa chỉ nhận hàng không?', a: 'Có, bạn có thể thay đổi địa chỉ nếu đơn hàng chưa rời kho. Vui lòng liên hệ hỗ trợ chat ngay để được xử lý.' },
        { q: 'SmartLog AI hỗ trợ những hình thức thanh toán nào?', a: 'Chúng tôi hỗ trợ Thẻ tín dụng, Ví MoMo, VNPAY và Chuyển khoản ngân hàng trực tiếp.' },
    ];

    return (
        <div className="bg-slate-50 min-h-screen">
            <Header scrollY={100} />
            
            <main className="pt-32 pb-24 max-w-7xl mx-auto px-8">
                {/* Hero section */}
                <section className="text-center mb-20">
                    <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">Trung tâm hỗ trợ khách hàng</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Hãy chọn phương thức liên hệ phù hợp với nhu cầu của bạn.</p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {/* Complaints Hub */}
                    <div 
                        onClick={() => navigate('/complaints')}
                        className="group bg-white p-8 rounded-3xl border border-rose-100 shadow-sm hover:shadow-xl hover:border-rose-300 transition-all cursor-pointer flex flex-col items-center text-center"
                    >
                        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Khiếu nại & Phản hồi</h3>
                        <p className="text-gray-500 mb-6 font-medium text-sm">Gặp vấn đề với đơn hàng? Hãy gửi khiếu nại tại đây để được xử lý ưu tiên.</p>
                        <div className="text-rose-600 font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                            Gửi khiếu nại <ChevronRight size={18} />
                        </div>
                    </div>

                    {/* Live Chat Hub */}
                    <div 
                        onClick={() => navigate('/support-chat')}
                        className="group bg-white p-8 rounded-3xl border border-blue-100 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer flex flex-col items-center text-center"
                    >
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <MessageCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Trò chuyện trực tuyến</h3>
                        <p className="text-gray-500 mb-6 font-medium text-sm">Trò chuyện ngay với trợ lý ảo SmartLog AI hoặc nhân viên hỗ trợ.</p>
                        <div className="text-blue-600 font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                            Chat ngay <ChevronRight size={18} />
                        </div>
                    </div>

                    {/* Common Support */}
                    <div className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mb-6">
                            <Phone size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Hotline 24/7</h3>
                        <p className="text-gray-500 mb-3 font-medium text-sm">Gọi cho chúng tôi để được tư vấn trực tiếp.</p>
                        <p className="text-2xl font-black text-slate-900">1900 1234 5678</p>
                        <p className="text-xs text-slate-400 mt-4">(Miễn phí cước cuộc gọi)</p>
                    </div>
                </div>

                {/* FAQ Section */}
                <section className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-10">
                        <HelpCircle size={32} className="text-blue-600" />
                        <h2 className="text-3xl font-extrabold text-gray-900">Câu hỏi thường gặp (FAQ)</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                                <h4 className="font-bold text-gray-900 mb-3 text-lg">? {faq.q}</h4>
                                <p className="text-gray-600 leading-relaxed text-sm font-medium">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default SupportPage;
