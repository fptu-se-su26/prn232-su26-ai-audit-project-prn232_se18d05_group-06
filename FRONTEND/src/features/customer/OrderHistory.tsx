import React from 'react';
import Header from './Header';
import Footer from './Footer';

const OrderHistory: React.FC = () => {
    return (
        <div className="bg-background text-on-background min-h-screen flex flex-col">
            <Header />

            <main className="flex-grow pt-[120px] pb-section-gap px-container-padding max-w-[1440px] mx-auto w-full">
                {/* Page Title */}
                <div className="mb-stack-md">
                    <h1 className="font-headline-lg text-headline-lg text-on-background">Lịch sử vận chuyển</h1>
                    <p className="font-body-md text-on-surface-variant mt-2">Quản lý và theo dõi tất cả các đơn hàng vận chuyển toàn cầu của bạn.</p>
                </div>

                {/* Analytics Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-section-gap">
                    {/* Shipped Card */}
                    <div className="glass-card p-6 rounded-xl shadow-[0_8px_32px_rgba(15,23,42,0.04)] hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="font-label-md text-on-surface-variant uppercase tracking-wider">Tổng Đã Giao</p>
                                <h2 className="font-headline-lg text-headline-lg mt-1">1,284</h2>
                            </div>
                            <div className="p-2 bg-primary-container/10 rounded-lg">
                                <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
                            </div>
                        </div>
                        <div className="h-12 w-full flex items-end gap-1">
                            <div className="flex-1 bg-primary-container/20 rounded-t-sm h-[40%]"></div>
                            <div className="flex-1 bg-primary-container/20 rounded-t-sm h-[60%]"></div>
                            <div className="flex-1 bg-primary-container/20 rounded-t-sm h-[45%]"></div>
                            <div className="flex-1 bg-primary-container/20 rounded-t-sm h-[80%]"></div>
                            <div className="flex-1 bg-primary-container h-[55%]"></div>
                            <div className="flex-1 bg-primary-container h-[90%]"></div>
                            <div className="flex-1 bg-primary-container h-[75%]"></div>
                        </div>
                        <p className="font-label-sm text-on-surface-variant mt-4 flex items-center gap-1">
                            <span className="text-tertiary font-bold">+12%</span> so với tháng trước
                        </p>
                    </div>

                    {/* Spent Card */}
                    <div className="glass-card p-6 rounded-xl shadow-[0_8px_32px_rgba(15,23,42,0.04)] hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="font-label-md text-on-surface-variant uppercase tracking-wider">Tổng Chi Phí</p>
                                <h2 className="font-headline-lg text-headline-lg mt-1">$45.2k</h2>
                            </div>
                            <div className="p-2 bg-tertiary-container/10 rounded-lg">
                                <span className="material-symbols-outlined text-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                            </div>
                        </div>
                        <div className="h-12 w-full flex items-end gap-1">
                            <div className="flex-1 bg-tertiary-container/20 rounded-t-sm h-[30%]"></div>
                            <div className="flex-1 bg-tertiary-container/20 rounded-t-sm h-[50%]"></div>
                            <div className="flex-1 bg-tertiary-container/20 rounded-t-sm h-[70%]"></div>
                            <div className="flex-1 bg-tertiary-container/20 rounded-t-sm h-[40%]"></div>
                            <div className="flex-1 bg-tertiary-container h-[85%]"></div>
                            <div className="flex-1 bg-tertiary-container h-[65%]"></div>
                            <div className="flex-1 bg-tertiary-container h-[80%]"></div>
                        </div>
                        <p className="font-label-sm text-on-surface-variant mt-4 flex items-center gap-1">
                            <span className="text-error font-bold">+5.4%</span> tăng ngân sách
                        </p>
                    </div>

                    {/* Success Rate Card */}
                    <div className="glass-card p-6 rounded-xl shadow-[0_8px_32px_rgba(15,23,42,0.04)] hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="font-label-md text-on-surface-variant uppercase tracking-wider">Tỷ Lệ Thành Công</p>
                                <h2 className="font-headline-lg text-headline-lg mt-1">99.4%</h2>
                            </div>
                            <div className="p-2 bg-on-secondary-container/10 rounded-lg">
                                <span className="material-symbols-outlined text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            </div>
                        </div>
                        <div className="h-12 w-full flex items-end gap-1">
                            <div className="flex-1 bg-on-secondary-container/20 rounded-t-sm h-[90%]"></div>
                            <div className="flex-1 bg-on-secondary-container/20 rounded-t-sm h-[95%]"></div>
                            <div className="flex-1 bg-on-secondary-container/20 rounded-t-sm h-[85%]"></div>
                            <div className="flex-1 bg-on-secondary-container/20 rounded-t-sm h-[98%]"></div>
                            <div className="flex-1 bg-on-secondary-container h-[92%]"></div>
                            <div className="flex-1 bg-on-secondary-container h-[96%]"></div>
                            <div className="flex-1 bg-on-secondary-container h-[99%]"></div>
                        </div>
                        <p className="font-label-sm text-on-surface-variant mt-4 flex items-center gap-1">
                            <span className="text-tertiary font-bold">Ổn định</span> trong 6 tháng qua
                        </p>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="glass-card p-4 rounded-xl mb-gutter flex flex-wrap items-center gap-4">
                    <div className="flex-grow flex items-center gap-4 flex-wrap">
                        <div className="relative min-w-[200px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-sm">search</span>
                            <input className="w-full bg-surface-container-low border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Tìm theo ID hoặc Điểm đến..." type="text" />
                        </div>
                        <select className="bg-surface-container-low border-none rounded-lg px-4 py-2 text-sm font-label-md focus:ring-2 focus:ring-primary outline-none">
                            <option>Trạng thái: Tất cả</option>
                            <option>Đang giao</option>
                            <option>Hoàn thành</option>
                            <option>Đã hủy</option>
                        </select>
                        <select className="bg-surface-container-low border-none rounded-lg px-4 py-2 text-sm font-label-md focus:ring-2 focus:ring-primary outline-none">
                            <option>Thời gian: 30 ngày qua</option>
                            <option>Tháng này</option>
                            <option>Quý này</option>
                            <option>Năm 2023</option>
                        </select>
                        <select className="bg-surface-container-low border-none rounded-lg px-4 py-2 text-sm font-label-md focus:ring-2 focus:ring-primary outline-none">
                            <option>Phương thức: Tất cả</option>
                            <option>Hàng không</option>
                            <option>Đường biển</option>
                            <option>Đường bộ</option>
                        </select>
                    </div>
                    <button className="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg font-label-md flex items-center gap-2 hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined text-[20px]">filter_list</span>
                        Lọc dữ liệu
                    </button>
                </div>

                {/* Orders Table */}
                <div className="glass-card rounded-xl overflow-hidden shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-surface-container-low/50 border-b border-outline-variant">
                                <tr>
                                    <th className="px-6 py-4 font-label-md text-on-surface-variant">Mã vận đơn</th>
                                    <th className="px-6 py-4 font-label-md text-on-surface-variant">Điểm đến</th>
                                    <th className="px-6 py-4 font-label-md text-on-surface-variant">Trạng thái</th>
                                    <th className="px-6 py-4 font-label-md text-on-surface-variant">Thời gian dự kiến</th>
                                    <th className="px-6 py-4 font-label-md text-on-surface-variant text-right">Chi phí</th>
                                    <th className="px-6 py-4 font-label-md text-on-surface-variant text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant">
                                {/* Row 1 */}
                                <tr className="hover:bg-primary/5 transition-colors group cursor-pointer" onClick={() => console.log('Viewing SL-98234-VN')}>
                                    <td className="px-6 py-4">
                                        <span className="font-label-md text-primary">SL-98234-VN</span>
                                        <p className="text-[10px] text-on-surface-variant uppercase mt-1">Air Freight</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm text-on-surface-variant">location_on</span>
                                            <span className="font-body-md">Hồ Chí Minh, VN</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-tertiary/10 text-tertiary rounded-full text-[12px] font-bold">Đang giao</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-body-md">24 Tháng 5, 2024</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-label-md">$1,420.00</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="p-2 hover:bg-primary-container/10 rounded-lg text-primary transition-colors">
                                            <span className="material-symbols-outlined">visibility</span>
                                        </button>
                                    </td>
                                </tr>
                                {/* Row 2 */}
                                <tr className="hover:bg-primary/5 transition-colors group cursor-pointer" onClick={() => console.log('Viewing SL-97412-SG')}>
                                    <td className="px-6 py-4">
                                        <span className="font-label-md text-primary">SL-97412-SG</span>
                                        <p className="text-[10px] text-on-surface-variant uppercase mt-1">Sea Freight</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm text-on-surface-variant">location_on</span>
                                            <span className="font-body-md">Jurong Port, SG</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-on-secondary-container/10 text-on-secondary-container rounded-full text-[12px] font-bold">Hoàn thành</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-body-md">18 Tháng 5, 2024</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-label-md">$8,900.00</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="p-2 hover:bg-primary-container/10 rounded-lg text-primary transition-colors">
                                            <span className="material-symbols-outlined">visibility</span>
                                        </button>
                                    </td>
                                </tr>
                                {/* Row 3 */}
                                <tr className="hover:bg-primary/5 transition-colors group cursor-pointer" onClick={() => console.log('Viewing SL-96109-US')}>
                                    <td className="px-6 py-4">
                                        <span className="font-label-md text-primary">SL-96109-US</span>
                                        <p className="text-[10px] text-on-surface-variant uppercase mt-1">Express</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm text-on-surface-variant">location_on</span>
                                            <span className="font-body-md">Los Angeles, US</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-error/10 text-error rounded-full text-[12px] font-bold">Đã hủy</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-body-md">12 Tháng 5, 2024</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-label-md">$450.00</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="p-2 hover:bg-primary-container/10 rounded-lg text-primary transition-colors">
                                            <span className="material-symbols-outlined">visibility</span>
                                        </button>
                                    </td>
                                </tr>
                                {/* Row 4 */}
                                <tr className="hover:bg-primary/5 transition-colors group cursor-pointer" onClick={() => console.log('Viewing SL-95501-JP')}>
                                    <td className="px-6 py-4">
                                        <span className="font-label-md text-primary">SL-95501-JP</span>
                                        <p className="text-[10px] text-on-surface-variant uppercase mt-1">Road Cargo</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm text-on-surface-variant">location_on</span>
                                            <span className="font-body-md">Tokyo, JP</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-tertiary/10 text-tertiary rounded-full text-[12px] font-bold">Đang giao</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-body-md">28 Tháng 5, 2024</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-label-md">$2,100.00</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="p-2 hover:bg-primary-container/10 rounded-lg text-primary transition-colors">
                                            <span className="material-symbols-outlined">visibility</span>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="px-6 py-4 bg-surface-container-low/30 border-t border-outline-variant flex items-center justify-between">
                        <p className="font-label-sm text-on-surface-variant">Hiển thị 1 - 4 của 128 đơn hàng</p>
                        <div className="flex items-center gap-1">
                            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors">
                                <span className="material-symbols-outlined text-lg">chevron_left</span>
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-on-primary font-label-sm">1</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high font-label-sm">2</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high font-label-sm">3</button>
                            <span className="px-2">...</span>
                            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high font-label-sm">32</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors">
                                <span className="material-symbols-outlined text-lg">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default OrderHistory;
