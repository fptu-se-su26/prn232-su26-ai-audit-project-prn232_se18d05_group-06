import React, { useState } from 'react';
import { Gift, Check, Bookmark, Filter, ListFilter, Sparkles, Clock, Send, Globe, Mail, Instagram, Twitter, Facebook, ExternalLink, Package, User, LogOut, History, DollarSign, Settings as SettingsIcon } from 'lucide-react';
import Header from '../customer/Header';
import Footer from '../customer/Footer';

const VoucherCenter: React.FC = () => {
    const [email, setEmail] = useState('');

    const vouchers = [
        {
            id: 1,
            discount: "25%",
            suffix: "OFF",
            title: "Global Freight Express",
            description: "Min. spend $5,000 on international routes.",
            category: "LOGISTICS",
            expiry: "Dec 12, 2024",
            color: "bg-blue-700",
            badgeColor: "bg-blue-50 text-blue-700",
            isBookmarked: false,
            buttonColor: "bg-blue-600 hover:bg-blue-700"
        },
        {
            id: 2,
            discount: "FREE",
            suffix: "PRO UPGRADE",
            title: "AI Route Optimizer",
            description: "3-Month trial of predictive modeling engine.",
            category: "SOFTWARE",
            expiry: "Jan 05, 2025",
            color: "bg-teal-700",
            badgeColor: "bg-teal-50 text-teal-700",
            isBookmarked: false,
            buttonColor: "bg-black hover:bg-gray-800"
        },
        {
            id: 3,
            discount: "$500",
            suffix: "CREDIT",
            title: "Smart Hub Storage",
            description: "Direct credit for automated storage solutions.",
            category: "WAREHOUSING",
            expiry: "Feb 28, 2025",
            color: "bg-slate-900",
            badgeColor: "bg-slate-100 text-slate-700",
            isBookmarked: false,
            buttonColor: "bg-blue-600 hover:bg-blue-700"
        },
        {
            id: 4,
            discount: "10%",
            suffix: "FLASH",
            title: "Last-Mile Delivery",
            description: "Immediate dispatch discount for metropolitan areas.",
            category: "URGENT",
            expiry: "ENDS IN 2H",
            color: "bg-red-700",
            badgeColor: "bg-red-50 text-red-700",
            isBookmarked: false,
            isFlash: true,
            buttonColor: "bg-red-600 hover:bg-red-700"
        },
        {
            id: 5,
            discount: "15%",
            suffix: "REBATE",
            title: "Carbon Neutral Shipping",
            description: "Rebate for verified green logistics routes.",
            category: "SUSTAINABILITY",
            expiry: "Mar 15, 2025",
            color: "bg-cyan-900",
            badgeColor: "bg-cyan-50 text-cyan-700",
            isBookmarked: false,
            buttonColor: "bg-blue-600 hover:bg-blue-700"
        },
        {
            id: 6,
            discount: "VIP",
            suffix: "ACCESS",
            title: "Concierge Clearance",
            description: "Priority customs handling and dedicated support.",
            category: "SERVICE",
            expiry: "Apr 30, 2025",
            color: "bg-slate-600",
            badgeColor: "bg-slate-100 text-slate-700",
            isBookmarked: false,
            buttonColor: "bg-blue-600 hover:bg-blue-700"
        }
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Header scrollY={100} />

            <main className="pt-24">
                {/* Hero Banner */}
                <section className="px-8 mb-16">
                    <div className="max-w-7xl mx-auto rounded-[2rem] overflow-hidden relative min-h-[360px] flex flex-col items-center justify-center text-center p-12">
                        {/* Abstract Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 z-0"></div>
                        <div className="absolute inset-0 z-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl -ml-48 -mb-48"></div>

                        <div className="relative z-10 max-w-3xl">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                                Optimize Your Operations with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Marketplace Rewards</span>
                            </h1>
                            <p className="text-lg text-slate-600 mb-8 font-medium leading-relaxed">
                                Exclusive vouchers for global logistics, tracking premiums, and priority shipping. Redefine efficiency with SmartLog AI.
                            </p>
                            
                            <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-50 text-blue-600 rounded-full font-bold text-sm border border-blue-100 shadow-sm transition-all hover:bg-blue-100 cursor-pointer">
                                <Sparkles size={16} />
                                New Vouchers Added Hourly
                            </div>
                        </div>
                    </div>
                </section>

                {/* Active Vouchers Section */}
                <section className="max-w-7xl mx-auto px-8 mb-24">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl font-black text-slate-900">Active Vouchers</h2>
                        <div className="flex gap-3">
                            <button className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                                <Filter size={20} />
                            </button>
                            <button className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                                <ListFilter size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {vouchers.map((voucher) => (
                            <div key={voucher.id} className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden flex h-64 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                {/* Left Side - Discount */}
                                <div className={`${voucher.color} w-32 flex flex-col items-center justify-center p-4 text-white shrink-0 relative overflow-hidden`}>
                                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                                            <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="white" />
                                        </svg>
                                    </div>
                                    <span className="text-3xl font-black leading-none">{voucher.discount}</span>
                                    <span className="text-[10px] font-bold mt-1 tracking-widest opacity-90">{voucher.suffix}</span>
                                    
                                    {/* Decorative circles */}
                                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-white/10 rounded-full"></div>
                                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/5 rounded-full"></div>
                                </div>

                                {/* Right Side - Info */}
                                <div className="flex-1 p-6 flex flex-col relative">
                                    <button className="absolute top-4 right-4 text-slate-300 hover:text-blue-600 transition-colors">
                                        <Bookmark size={20} />
                                    </button>

                                    <div className="mb-auto">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className={`text-[10px] font-black px-2 py-1 rounded ${voucher.badgeColor} tracking-wider uppercase`}>
                                                {voucher.category}
                                            </span>
                                            {voucher.isFlash && (
                                                <div className="flex items-center gap-1 text-[10px] font-black text-red-600 uppercase">
                                                    <Clock size={12} />
                                                    ENDS IN 2H
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-lg mb-1 leading-tight">{voucher.title}</h3>
                                        <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">
                                            {voucher.description}
                                        </p>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Expires</p>
                                            <p className={`text-[13px] font-bold ${voucher.isFlash ? 'text-red-600' : 'text-slate-700'}`}>{voucher.expiry}</p>
                                        </div>
                                        <button className={`${voucher.buttonColor} text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95`}>
                                            Claim
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Newsletter Section */}
                <section className="max-w-7xl mx-auto px-8 mb-24">
                    <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-[3rem] p-16 text-center border border-blue-50 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl -ml-32 -mb-32"></div>

                        <div className="relative z-10">
                            <h2 className="text-4xl font-black text-slate-900 mb-4">Never Miss a High-Value Reward</h2>
                            <p className="text-slate-600 font-medium mb-10 max-w-2xl mx-auto">
                                Join our elite network of logistics managers and get real-time alerts for the newest and most valuable marketplace vouchers.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                                <input 
                                    type="email" 
                                    placeholder="Enter your business email"
                                    className="flex-1 px-8 py-4 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <button className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 whitespace-nowrap">
                                    Subscribe Now
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Custom Premium Footer to match the image precisely */}
            <footer className="bg-white border-t border-slate-100 py-20">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        {/* Brand Column */}
                        <div className="col-span-1">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                                    <Package size={20} className="text-white" />
                                </div>
                                <span className="font-bold text-xl text-blue-600">SmartLog AI</span>
                            </div>
                            <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
                                Empowering global trade with intelligent automation and precision logistics data.
                            </p>
                        </div>

                        {/* Company info */}
                        <div>
                            <h4 className="font-bold text-slate-900 mb-6">Company info</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="text-slate-500 text-sm font-medium hover:text-blue-600 transition-colors">About Careers</a></li>
                                <li><a href="#" className="text-slate-500 text-sm font-medium hover:text-blue-600 transition-colors">Leadership Team</a></li>
                                <li><a href="#" className="text-slate-500 text-sm font-medium hover:text-blue-600 transition-colors">Marketplace Press</a></li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="font-bold text-slate-900 mb-6">Support</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="text-slate-500 text-sm font-medium hover:text-blue-600 transition-colors">Help Center</a></li>
                                <li><a href="#" className="text-slate-500 text-sm font-medium hover:text-blue-600 transition-colors">Voucher FAQ</a></li>
                                <li><a href="#" className="text-slate-500 text-sm font-medium hover:text-blue-600 transition-colors">Contact Support</a></li>
                            </ul>
                        </div>

                        {/* Social Links */}
                        <div>
                            <h4 className="font-bold text-slate-900 mb-6">Social links</h4>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-all">
                                    <Facebook size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-all">
                                    <Globe size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-all">
                                    <Instagram size={18} />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="mt-20 pt-8 border-t border-slate-100 flex flex-col md:row items-center justify-center text-center">
                        <p className="text-slate-400 text-sm font-medium">
                            © 2024 SmartLog AI. All rights reserved. Global Logistics Command Center.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default VoucherCenter;
