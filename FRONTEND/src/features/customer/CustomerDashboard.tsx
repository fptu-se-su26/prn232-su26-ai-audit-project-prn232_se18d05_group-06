import React, { useEffect, useState } from 'react';
import { 
    ShoppingCart, Truck, CheckCircle2, Wallet, Rocket, Share, Printer, 
    Sparkles, Route, PiggyBank, Package, MoreVertical, Map as MapIcon, ChevronRight, Activity, Bot
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CustomerDashboard() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="bg-[#f8fafc] font-sans text-slate-900 min-h-screen">
            {/* Top Navbar */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200' : 'bg-transparent'}`}>
                <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6 lg:px-12 py-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded flex items-center justify-center shadow-md">
                            <Package className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-blue-700">SmartLog AI</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#" className="text-blue-700 border-b-2 border-blue-700 font-semibold py-1 text-sm">Home</a>
                        <a href="#" className="text-slate-500 font-medium hover:text-blue-600 transition-colors text-sm">Services</a>
                        <a href="#" className="text-slate-500 font-medium hover:text-blue-600 transition-colors text-sm">Pricing</a>
                        <a href="#" className="text-slate-500 font-medium hover:text-blue-600 transition-colors text-sm">Tracking</a>
                        <a href="#" className="text-slate-500 font-medium hover:text-blue-600 transition-colors text-sm">About</a>
                        <a href="#" className="text-slate-500 font-medium hover:text-blue-600 transition-colors text-sm">Contact</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/auth" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Login</Link>
                        <Link to="/auth" className="bg-[#0050C8] text-white px-5 py-2 rounded shadow hover:bg-blue-800 transition-colors text-sm font-medium">Register</Link>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="pt-28 px-6 lg:px-12 pb-16 max-w-[1440px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-1">Dashboard Tổng Quan</h2>
                        <p className="text-slate-500 text-sm">Chào mừng trở lại, Tung Nguyen</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/customer/create-order" className="bg-[#0050C8] text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-800 hover:scale-[0.98] transition-all shadow-[0_4px_14px_0_rgba(0,80,200,0.39)]">
                            <Rocket className="w-5 h-5" />
                            New Shipment
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Orders */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <ShoppingCart className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">+12.5%</span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium mb-1">Tổng đơn hàng</p>
                        <h3 className="text-2xl font-bold text-blue-600">1,284</h3>
                        <div className="mt-4 h-12 bg-slate-50 rounded-lg overflow-hidden relative">
                            <svg className="w-full h-full text-blue-200" preserveAspectRatio="none" viewBox="0 0 100 40">
                                <path d="M0,40 L0,20 Q10,10 20,25 T40,15 T60,25 T80,10 T100,20 L100,40 Z" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                    </div>

                    {/* Orders In Transit */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform">
                                <Truck className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md">24 Đơn</span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium mb-1">Đang vận chuyển</p>
                        <h3 className="text-2xl font-bold text-sky-500">142</h3>
                        <div className="mt-4 h-12 bg-slate-50 rounded-lg overflow-hidden relative">
                            <svg className="w-full h-full text-sky-200" preserveAspectRatio="none" viewBox="0 0 100 40">
                                <path d="M0,40 L0,15 Q15,30 30,10 T50,20 T70,5 T90,25 L100,20 L100,40 Z" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                    </div>

                    {/* Delivered Orders */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">98.2%</span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium mb-1">Đã giao hàng</p>
                        <h3 className="text-2xl font-bold text-emerald-500">1,118</h3>
                        <div className="mt-4 h-12 bg-slate-50 rounded-lg overflow-hidden relative">
                            <svg className="w-full h-full text-emerald-200" preserveAspectRatio="none" viewBox="0 0 100 40">
                                <path d="M0,40 L0,30 Q20,10 40,35 T70,15 T100,25 L100,40 Z" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                    </div>

                    {/* Total Cost */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md">-5%</span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium mb-1">Tổng chi phí</p>
                        <h3 className="text-2xl font-bold text-slate-900">42.5M <span className="text-sm font-semibold text-slate-500">VND</span></h3>
                        <div className="mt-4 h-12 bg-slate-50 rounded-lg overflow-hidden relative">
                            <svg className="w-full h-full text-rose-200" preserveAspectRatio="none" viewBox="0 0 100 40">
                                <path d="M0,40 L0,20 Q10,35 25,15 T50,25 T80,5 L100,10 L100,40 Z" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Realtime Shipment Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Tracking Hero */}
                    <div className="lg:col-span-2 bg-white flex flex-col p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden h-full min-h-[360px]">
                        <div className="relative z-10 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="text-blue-600 font-bold text-xs tracking-widest uppercase">ĐANG THEO DÕI THỜI GIAN THỰC</span>
                                    <h2 className="text-xl font-bold text-slate-900 mt-1">Đơn hàng #SL-94021</h2>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors">
                                        <Share className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors">
                                        <Printer className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-auto pt-6">
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Vị trí hiện tại</p>
                                    <p className="text-sm font-bold text-slate-900">Kho tổng Hà Nội</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Dự kiến đến</p>
                                    <p className="text-sm font-bold text-slate-900">16:45, Hôm nay</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Tài xế</p>
                                    <p className="text-sm font-bold text-slate-900">Lê Văn Nam</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Loại xe</p>
                                    <p className="text-sm font-bold text-slate-900">Xe tải 2.5T</p>
                                </div>
                            </div>

                            <div className="mt-8">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-600 font-medium">Tiến độ vận chuyển</span>
                                    <span className="text-blue-600 font-bold">75% - Sắp đến đích</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full relative" style={{ width: '75%' }}>
                                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Background Map Decoration */}
                        <div className="absolute inset-y-0 right-0 w-2/3 h-full opacity-10 pointer-events-none">
                             <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #0050c8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        </div>
                    </div>

                    {/* AI Suggestion Panel */}
                    <div className="bg-[#f0f5ff] border border-blue-100 p-6 md:p-8 rounded-2xl flex flex-col h-full min-h-[360px]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-600/30">
                                <Sparkles className="w-5 h-5 fill-white" />
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg">AI Gợi ý tối ưu</h3>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
                                <p className="font-bold text-sm text-blue-600 mb-1.5 flex items-center gap-2">
                                    <Route className="w-4 h-4" /> Tuyến đường mới
                                </p>
                                <p className="text-xs text-slate-500 leading-relaxed">Tiết kiệm 15% nhiên liệu bằng cách đổi sang tuyến Quốc Lộ 5B cho đơn hàng miền Bắc.</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
                                <p className="font-bold text-sm text-slate-800 mb-1.5 flex items-center gap-2">
                                    <PiggyBank className="w-4 h-4 text-emerald-500" /> Tối ưu chi phí
                                </p>
                                <p className="text-xs text-slate-500 leading-relaxed">Gộp 3 đơn hàng cùng khu vực Quận 1 sẽ giảm 220,000 VND phí vận chuyển.</p>
                            </div>
                        </div>
                        <button className="mt-6 py-2.5 w-full bg-white border border-blue-200 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white hover:border-transparent transition-all">
                            Áp dụng tất cả
                        </button>
                    </div>
                </div>

                {/* Activity and Map Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Delivery Activity Timeline */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                        <h3 className="font-bold text-slate-900 text-lg mb-8">Hoạt động vận chuyển</h3>
                        <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                            
                            <div className="relative pl-10 flex flex-col">
                                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white shadow-sm z-10"></div>
                                <p className="font-bold text-sm text-slate-900">Đã giao hàng</p>
                                <p className="text-xs text-slate-500 mt-0.5">Sáng nay, 09:20 - Cửa hàng quận 7</p>
                            </div>
                            
                            <div className="relative pl-10 flex flex-col">
                                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-600 border-4 border-white shadow-sm z-10"></div>
                                <p className="font-bold text-sm text-slate-900">Đang trung chuyển</p>
                                <p className="text-xs text-slate-500 mt-0.5">Hôm qua, 22:15 - Kho tổng Bình Dương</p>
                            </div>
                            
                            <div className="relative pl-10 flex flex-col opacity-60">
                                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-300 border-4 border-white shadow-sm z-10"></div>
                                <p className="font-bold text-sm text-slate-900">Đã lấy hàng</p>
                                <p className="text-xs text-slate-500 mt-0.5">Hôm qua, 18:00 - Cảng Cát Lái</p>
                            </div>
                            
                            <div className="relative pl-10 flex flex-col opacity-60">
                                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-300 border-4 border-white shadow-sm z-10"></div>
                                <p className="font-bold text-sm text-slate-900">Đã tạo vận đơn</p>
                                <p className="text-xs text-slate-500 mt-0.5">Hôm qua, 15:30 - Hệ thống AI</p>
                            </div>

                        </div>
                    </div>

                    {/* Heatmap / Map */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col relative min-h-[400px]">
                        <div className="p-6 flex justify-between items-center absolute top-0 left-0 w-full z-10 pointer-events-none">
                            <h3 className="font-bold text-slate-900 text-lg">Mật độ giao hàng thực tế</h3>
                            <div className="bg-white/90 backdrop-blur-md p-1 rounded-lg border border-slate-200 flex pointer-events-auto">
                                <button className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-md shadow-sm">Live</button>
                                <button className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">History</button>
                            </div>
                        </div>
                        <div className="flex-1 w-full bg-slate-100 relative group overflow-hidden">
                            {/* Fake Map Background */}
                            <div className="absolute inset-0 bg-[#e2e8f0] opacity-50" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.83v58.34h-58.34l-.83-.83L0 54.628V0h54.627zM30 60V30L0 0v30l30 30z' fill='%2394a3b8' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`}}></div>
                            
                            {/* Map Points */}
                            <div className="absolute top-1/3 left-1/3 w-4 h-4 bg-blue-600 rounded-full shadow-[0_0_0_6px_rgba(37,99,235,0.2)] animate-pulse"></div>
                            <div className="absolute top-2/3 right-1/4 w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_0_6px_rgba(16,185,129,0.2)]"></div>
                            <div className="absolute bottom-1/4 left-2/3 w-4 h-4 bg-teal-600 rounded-full shadow-[0_0_0_6px_rgba(13,148,136,0.2)]"></div>
                        </div>
                        <div className="p-4 bg-white border-t border-slate-100 flex gap-6 overflow-x-auto">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                                <span className="text-xs font-medium text-slate-600">Miền Bắc (42)</span>
                            </div>
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                                <span className="text-xs font-medium text-slate-600">Miền Trung (12)</span>
                            </div>
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                <span className="text-xs font-medium text-slate-600">Miền Nam (88)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Orders Table */}
                <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                    <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 text-lg">Đơn hàng gần đây</h3>
                        <button className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:underline group">
                            Xem tất cả 
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="px-6 py-4 font-bold text-[11px] text-slate-500 uppercase tracking-wider">Mã đơn hàng</th>
                                    <th className="px-6 py-4 font-bold text-[11px] text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-4 font-bold text-[11px] text-slate-500 uppercase tracking-wider">Dự kiến giao</th>
                                    <th className="px-6 py-4 font-bold text-[11px] text-slate-500 uppercase tracking-wider text-right">Tổng phí</th>
                                    <th className="px-6 py-4 font-bold text-[11px] text-slate-500 uppercase tracking-wider text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <tr className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                                                <Package className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-sm text-slate-900">#SL-94021</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-bold inline-block">Đang giao</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-900 font-medium">14 Oct, 2023</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">Trước 17:00</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-bold text-sm text-slate-900">1,250,000đ</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors inline-flex items-center justify-center">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                                                <Package className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-sm text-slate-900">#SL-93882</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-md text-xs font-bold inline-block">Hoàn thành</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-900 font-medium">12 Oct, 2023</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">Đã giao lúc 10:30</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-bold text-sm text-slate-900">850,000đ</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors inline-flex items-center justify-center">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                                                <Package className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-sm text-slate-900">#SL-93710</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-md text-xs font-bold inline-block">Trì hoãn</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-900 font-medium">15 Oct, 2023</p>
                                        <p className="text-[11px] text-rose-500 font-medium mt-0.5">Sự cố thời tiết</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-bold text-sm text-slate-900">3,400,000đ</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors inline-flex items-center justify-center">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {/* Contextual FAB */}
            <button className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-[0_8px_30px_rgba(37,99,235,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group">
                <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <div className="absolute right-full mr-4 bg-white border border-slate-100 px-4 py-2.5 rounded-xl shadow-lg opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all whitespace-nowrap pointer-events-none">
                    <p className="text-xs font-bold text-slate-900">Trợ lý AI Logistics</p>
                </div>
            </button>
        </div>
    );
}
