import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Shield, Globe, Users, Trophy, Target, Heart } from 'lucide-react';

const AboutPage: React.FC = () => {
    return (
        <div className="bg-white min-h-screen">
            <Header scrollY={100} />
            
            <main className="pt-32">
                {/* Hero section */}
                <section className="max-w-7xl mx-auto px-8 mb-24">
                    <div className="text-center reveal-on-scroll">
                        <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
                            Về <span className="text-blue-600">SmartLog AI</span>
                        </h1>
                        <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
                            Chúng tôi đang tái định nghĩa tương lai của ngành logistics bằng trí tuệ nhân tạo, giúp chuỗi cung ứng trở nên thông minh hơn, nhanh hơn và bền vững hơn.
                        </p>
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="bg-slate-50 py-24 mb-24">
                    <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100">
                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-blue-200">
                                <Target size={28} />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">Sứ mệnh</h3>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                Mang đến các giải pháp công nghệ tiên tiến nhất để tối ưu hóa quy trình vận hành cho doanh nghiệp, loại bỏ các rào cản trong giao thương toàn cầu.
                            </p>
                        </div>
                        <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100">
                            <div className="w-14 h-14 bg-cyan-500 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-cyan-200">
                                <Globe size={28} />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">Tầm nhìn</h3>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                Trở thành hệ sinh thái Logistics AI hàng đầu khu vực, là đối tác tin cậy của hàng triệu doanh nghiệp trong kỷ nguyên số.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="max-w-7xl mx-auto px-8 mb-24 grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { label: 'Năm kinh nghiệm', value: '10+', color: 'text-blue-600' },
                        { label: 'Quốc gia', value: '25+', color: 'text-indigo-600' },
                        { label: 'Khách hàng doanh nghiệp', value: '500+', color: 'text-cyan-600' },
                        { label: 'Đội ngũ chuyên gia', value: '200+', color: 'text-blue-700' },
                    ].map((stat, idx) => (
                        <div key={idx} className="text-center p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <p className={`text-4xl font-black ${stat.color} mb-2`}>{stat.value}</p>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    ))}
                </section>

                {/* Values */}
                <section className="max-w-7xl mx-auto px-8 mb-32">
                    <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-16">Giá trị cốt lõi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div>
                            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Shield size={36} />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">Tin cậy</h4>
                            <p className="text-gray-500">Mọi đơn hàng đều được đảm bảo an toàn tuyệt đối thông qua hệ thống bảo mật AI.</p>
                        </div>
                        <div>
                            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users size={36} />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">Tận tâm</h4>
                            <p className="text-gray-500">Khách hàng là trung tâm của mọi hoạt động cải tiến và phát triển sản phẩm.</p>
                        </div>
                        <div>
                            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trophy size={36} />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">Đột phá</h4>
                            <p className="text-gray-500">Luôn tiên phong áp dụng các công nghệ mới nhất để dẫn đầu thị trường.</p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default AboutPage;
