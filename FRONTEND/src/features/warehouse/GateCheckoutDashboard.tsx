import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import api from '../../lib/api';

// Interface representing the active booking summary returned by lookup
interface ActiveBooking {
  bookingId: number;
  bookingCode: string;
  alprPlate?: string;
  truckPlate: string;
  bookingType: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  dockCode?: string;
  dockName?: string;
  driverName: string;
  customerName: string;
}

// Interface representing the success response from checkout API
interface CheckoutResponse {
  barrierCommand: string;
  message: string;
  bookingId: number;
  bookingCode: string;
  licensePlate: string;
  status: string;
  checkOutAt: string;
  dockId?: number;
  dockCode?: string;
}

// Local storage list of checkout logs processed in this session
interface SessionLog {
  id: string;
  bookingCode: string;
  licensePlate: string;
  checkOutAt: Date;
  status: string;
  barrierSignal: string;
}

const GateCheckoutDashboard: React.FC = () => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Found booking detail
  const [activeBooking, setActiveBooking] = useState<ActiveBooking | null>(null);
  
  // Checkout status
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResponse | null>(null);
  const [barrierOpen, setBarrierOpen] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [blacklistAlert, setBlacklistAlert] = useState<any | null>(null);
  
  // Audit logs for session
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);

  // Simulation settings
  const [simulatedPlate, setSimulatedPlate] = useState('51C-88888');
  const [cameraScanning, setCameraScanning] = useState(false);

  // Suggested test vehicles (helpful for grading / manual testing)
  const testVehicles = [
    { label: 'Truck Plate A', plate: '51C-88888', code: 'BK-1002' },
    { label: 'Truck Plate B', plate: '29H-77777', code: 'BK-1003' },
    { label: 'Booking Code A', plate: '43A-66666', code: 'BK-1004' }
  ];

  // Countdown timer for barrier reset
  useEffect(() => {
    let timer: any;
    if (barrierOpen && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (barrierOpen && countdown === 0) {
      setBarrierOpen(false);
      setCheckoutResult(null);
    }
    return () => clearTimeout(timer);
  }, [barrierOpen, countdown]);

  // Search booking on backend
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    setActiveBooking(null);
    
    // Simulate camera scanning animation before sending API call
    setCameraScanning(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setCameraScanning(false);

    try {
      const response = await api.get<ActiveBooking>(`/gate/active-booking?search=${encodeURIComponent(query.trim())}`);
      setActiveBooking(response.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 404) {
        setErrorMsg(`No active Checked-In / In-Dock booking found for: "${query}"`);
      } else {
        setErrorMsg(err.response?.data || 'Failed to fetch booking. Check backend connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Perform checkout transaction
  const handleConfirmCheckout = async () => {
    if (!activeBooking) return;
    setIsProcessingCheckout(true);
    setErrorMsg(null);
    setBlacklistAlert(null);

    try {
      const payload = {
        alprPlate: activeBooking.alprPlate || activeBooking.truckPlate,
        bookingCode: activeBooking.bookingCode
      };
      
      const response = await api.post<CheckoutResponse>('/gate/checkout', payload);
      setCheckoutResult(response.data);
      
      // Trigger barrier opening animation
      setBarrierOpen(true);
      setCountdown(8); // keep barrier open for 8 seconds

      // Log checkout to session audit trail
      const newLog: SessionLog = {
        id: Math.random().toString(36).substring(2, 9).toUpperCase(),
        bookingCode: response.data.bookingCode,
        licensePlate: response.data.licensePlate,
        checkOutAt: new Date(response.data.checkOutAt),
        status: response.data.status,
        barrierSignal: response.data.barrierCommand
      };
      setSessionLogs(prev => [newLog, ...prev]);
      
      // Clear current active booking card since it's now completed
      setActiveBooking(null);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403 && err.response?.data?.accessDenied) {
        setBlacklistAlert(err.response.data);
      } else {
        setErrorMsg(err.response?.data?.message || err.response?.data || 'An error occurred during check-out transaction.');
      }
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // Perform checkin transaction
  const handleConfirmCheckin = async () => {
    if (!activeBooking) return;
    setIsProcessingCheckout(true);
    setErrorMsg(null);
    setBlacklistAlert(null);

    try {
      const payload = {
        alprPlate: activeBooking.alprPlate || activeBooking.truckPlate,
        bookingCode: activeBooking.bookingCode
      };
      
      const response = await api.post<any>('/gate/checkin', payload);
      
      setCheckoutResult({
        barrierCommand: response.data.barrierCommand,
        message: response.data.message,
        bookingId: response.data.bookingId,
        bookingCode: response.data.bookingCode,
        licensePlate: response.data.licensePlate,
        status: response.data.status,
        checkOutAt: response.data.checkInAt
      });
      
      // Trigger barrier opening animation
      setBarrierOpen(true);
      setCountdown(8); // keep barrier open for 8 seconds

      // Log checkin to session audit trail
      const newLog: SessionLog = {
        id: Math.random().toString(36).substring(2, 9).toUpperCase(),
        bookingCode: response.data.bookingCode,
        licensePlate: response.data.licensePlate,
        checkOutAt: new Date(response.data.checkInAt),
        status: response.data.status,
        barrierSignal: response.data.barrierCommand
      };
      setSessionLogs(prev => [newLog, ...prev]);
      
      // Clear current active booking card
      setActiveBooking(null);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403 && err.response?.data?.accessDenied) {
        setBlacklistAlert(err.response.data);
      } else {
        setErrorMsg(err.response?.data?.message || err.response?.data || 'An error occurred during check-in transaction.');
      }
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const triggerMockScan = (plate: string) => {
    setSearchQuery(plate);
    handleSearch(plate);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#1f2937] antialiased overflow-hidden flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Panel */}
      <main className="ml-[280px] flex-1 h-screen overflow-y-auto flex flex-col">
        <Topbar />

        <div className="p-8 space-y-8 flex-1 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />
            <div>
              <span className="bg-indigo-500/20 text-indigo-300 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-widest border border-indigo-500/30">
                Exit Terminal
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight mt-2">
                Gate Control Dashboard
              </h1>
              <p className="text-slate-300 mt-1 max-w-md text-sm">
                UC020 Exit Barrier control, ALPR plate verification, and active slot check-out management.
              </p>
            </div>
            
            {/* Quick Demo Helper Panel */}
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs max-w-xs w-full">
              <span className="font-bold text-slate-200 block mb-2 uppercase tracking-wide">
                ⚡ Quick Simulate Tests:
              </span>
              <div className="flex flex-col gap-1.5">
                {testVehicles.map(tv => (
                  <button
                    key={tv.code}
                    onClick={() => triggerMockScan(tv.plate)}
                    className="flex justify-between items-center bg-slate-800 hover:bg-indigo-600/50 hover:text-white transition-colors duration-200 p-1.5 rounded text-left border border-slate-700 font-mono text-[10px]"
                  >
                    <span>{tv.label} ({tv.plate})</span>
                    <span className="text-indigo-300 font-bold">{tv.code}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Barrier Open Warning/Status Alert */}
          {barrierOpen && checkoutResult && (
            <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-950 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-4 animate-bounce duration-1000">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center animate-ping absolute" />
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center relative shadow-lg text-white">
                  <span className="material-symbols-outlined text-2xl font-bold">lock_open</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-emerald-900 tracking-tight">
                    EXIT BARRIER SIGNAL: {checkoutResult.barrierCommand} SENT
                  </h3>
                  <p className="text-sm text-emerald-700 font-medium">
                    Exit Gate is OPEN for Vehicle: <span className="font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">{checkoutResult.licensePlate}</span>. Booking code <span className="font-bold">{checkoutResult.bookingCode}</span> is completed.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-emerald-600 text-white font-mono font-bold px-4 py-2 rounded-xl text-center shadow">
                  Closing in <span className="text-xl">{countdown}s</span>
                </div>
                <button
                  onClick={() => {
                    setBarrierOpen(false);
                    setCheckoutResult(null);
                  }}
                  className="bg-emerald-950 hover:bg-emerald-900 text-white font-bold px-4 py-2 rounded-xl transition-all duration-200 shadow text-sm"
                >
                  Close Arm Now
                </button>
              </div>
            </div>
          )}

          {/* Grid Layout */}
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column: Search & Camera Scanner */}
            <div className="col-span-12 lg:col-span-5 space-y-6">
              
              {/* Search Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-indigo-500">search</span>
                  Identify Exiting Vehicle
                </h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter License Plate or Booking Code..."
                    className="flex-1 font-mono uppercase bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white transition-colors duration-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                  />
                  <button
                    onClick={() => handleSearch(searchQuery)}
                    disabled={isLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-3 rounded-xl transition-all duration-200 font-bold shadow-md hover:shadow-indigo-500/20 text-sm flex items-center gap-2"
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">search</span>
                        Identify
                      </>
                    )}
                  </button>
                </div>
                {errorMsg && (
                  <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-100 font-medium mt-3 flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm shrink-0">error</span>
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              {/* Simulated ALPR Exit Camera Feed */}
              <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-xl border border-slate-800 relative group aspect-video">
                {/* Camera UI overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-10 p-4 flex flex-col justify-between pointer-events-none">
                  <div className="flex justify-between items-center">
                    <span className="bg-red-600 text-white px-2 py-0.5 rounded-md font-mono text-[10px] font-bold tracking-wider animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-ping" />
                      LIVE FEED: CAM-04 (EXIT)
                    </span>
                    <span className="text-[10px] text-slate-300/80 font-mono">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl font-mono text-xs text-white">
                      <div className="text-[8px] text-slate-400 uppercase tracking-widest font-sans">ALPR Status</div>
                      {cameraScanning ? (
                        <span className="text-yellow-400 font-bold animate-pulse">SCANNING PLATE...</span>
                      ) : searchQuery ? (
                        <span>PLATE CAPTURED: <strong className="text-indigo-400 font-bold">{searchQuery.toUpperCase()}</strong></span>
                      ) : (
                        <span className="text-slate-300">AWAITING VEHICLE...</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Laser scan line simulation */}
                {cameraScanning && (
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_10px_#6366f1] animate-bounce z-20 top-1/2" />
                )}

                {/* Simulated Camera feed backdrop */}
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                  <svg className="w-32 h-32 text-slate-800" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 8h-1.17l-1.42-1.42A2 2 0 0014.99 6H9.01c-.53 0-1.04.21-1.42.59L6.17 8H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2m-7 9c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4m0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                  
                  {/* Grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
                </div>
              </div>

            </div>

            {/* Right Column: Booking Details & Barrier Gate Animation */}
            <div className="col-span-12 lg:col-span-7 space-y-6">
              
              {/* Detail Preview Card */}
              {activeBooking ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md flex flex-col justify-between h-full relative overflow-hidden animate-fade-in-up">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Booking</span>
                        <h3 className="text-2xl font-black text-slate-800">{activeBooking.bookingCode}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full uppercase border border-indigo-200">
                          {activeBooking.bookingType}
                        </span>
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase border border-yellow-200 animate-pulse">
                          {activeBooking.status}
                        </span>
                      </div>
                    </div>

                    {/* Specifications Grid */}
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="text-slate-400 text-xs font-medium mb-1">License Plate</div>
                        <div className="font-mono text-lg font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                          {activeBooking.truckPlate}
                        </div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="text-slate-400 text-xs font-medium mb-1">Dock Location</div>
                        <div className="font-bold text-lg text-slate-900 flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-400 text-md">warehouse</span>
                          {activeBooking.dockCode ? `${activeBooking.dockCode} (${activeBooking.dockName || 'Dock'})` : 'UNASSIGNED'}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs font-medium mb-1">Driver Details</div>
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-400 text-sm">person</span>
                          {activeBooking.driverName}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs font-medium mb-1">Customer / Partner</div>
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-400 text-sm">store</span>
                          {activeBooking.customerName}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs font-medium mb-1">Scheduled Time</div>
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-400 text-sm">calendar_month</span>
                          {activeBooking.scheduledDate} {activeBooking.scheduledTime}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 mt-6">
                    {activeBooking.status === 'CONFIRMED' ? (
                      <button
                        onClick={handleConfirmCheckin}
                        disabled={isProcessingCheckout}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-lg py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-emerald-600/35 flex items-center justify-center gap-3 active:scale-95"
                      >
                        {isProcessingCheckout ? (
                          <>
                            <span className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                            Processing Check-in...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-xl">login</span>
                            CONFIRM CHECK-IN & OPEN ENTRY BARRIER
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleConfirmCheckout}
                        disabled={isProcessingCheckout}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-lg py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-indigo-600/30 flex items-center justify-center gap-3 active:scale-95"
                      >
                        {isProcessingCheckout ? (
                          <>
                            <span className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                            Processing Checkout...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-xl">logout</span>
                            CONFIRM CHECK-OUT & OPEN EXIT BARRIER
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Interactive SVG Barrier Gate Simulator Card */
                <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md flex flex-col items-center justify-center text-center py-10 relative overflow-hidden">
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 text-[10px] font-bold text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    BARRIER SIMULATOR
                  </div>

                  {/* SVG Animation Box */}
                  <div className="w-full max-w-sm aspect-[4/3] bg-gradient-to-b from-indigo-950 to-slate-900 rounded-2xl border border-slate-800 relative flex items-center justify-center shadow-inner overflow-hidden mt-4">
                    {/* Sky grid */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#1e1b4b,transparent_60%)] pointer-events-none" />

                    <svg className="w-full h-full p-6" viewBox="0 0 300 200">
                      {/* Grid overlay */}
                      <defs>
                        <linearGradient id="gateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#4f46e5" />
                          <stop offset="100%" stopColor="#312e81" />
                        </linearGradient>
                        <pattern id="striped" width="40" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                          <rect width="20" height="20" fill="#ffffff" />
                          <rect x="20" width="20" height="20" fill="#dc2626" />
                        </pattern>
                      </defs>

                      {/* Road surface */}
                      <path d="M 0 160 Q 150 140 300 160 L 300 200 L 0 200 Z" fill="#1e293b" />
                      <line x1="0" y1="180" x2="300" y2="180" stroke="#facc15" strokeWidth="2" strokeDasharray="8 8" />

                      {/* Gate housing post (Left anchor) */}
                      <rect x="20" y="80" width="30" height="85" rx="4" fill="url(#gateGradient)" stroke="#818cf8" strokeWidth="1.5" />
                      <circle cx="35" cy="95" r="10" fill="#0f172a" stroke="#818cf8" strokeWidth="1.5" />

                      {/* Barrier arm pivot center bolt */}
                      <circle cx="35" cy="95" r="5" fill="#f8fafc" />

                      {/* Barrier ARM with red/white stripes */}
                      {/* Initial pivot point is (35, 95). Rotates from 0deg (horizontal, closed) to -90deg (vertical, open) */}
                      <g style={{
                        transform: barrierOpen ? 'rotate(-90deg)' : 'rotate(0deg)',
                        transformOrigin: '35px 95px',
                        transition: 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}>
                        {/* Red and white stripe pattern barrier arm */}
                        <rect x="35" y="90" width="220" height="10" rx="3" fill="url(#striped)" stroke="#b91c1c" strokeWidth="1" />
                        
                        {/* Soft rubber safety bumper on bottom */}
                        <rect x="35" y="100" width="220" height="2" fill="#0f172a" />
                        
                        {/* LED alert light bar on the arm */}
                        <rect x="70" y="94" width="150" height="2" fill={barrierOpen ? '#10b981' : '#ef4444'} className="animate-pulse" />
                      </g>

                      {/* Warning Status Light on top of Post */}
                      <circle cx="35" cy="65" r="7" fill={barrierOpen ? '#10b981' : '#ef4444'} stroke="#334155" strokeWidth="1" />
                      {barrierOpen ? (
                        <circle cx="35" cy="65" r="12" fill="none" stroke="#10b981" strokeWidth="1" className="animate-ping" />
                      ) : (
                        <circle cx="35" cy="65" r="12" fill="none" stroke="#ef4444" strokeWidth="1" className="animate-pulse" />
                      )}
                    </svg>

                    {/* Graphical UI Status text inside simulator */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-slate-950/80 backdrop-blur border border-white/10 px-3 py-1.5 rounded-xl font-mono text-[10px] text-white">
                      <span className={`w-2 h-2 rounded-full ${barrierOpen ? 'bg-emerald-500 animate-ping' : 'bg-red-500 animate-pulse'}`} />
                      STATUS: {barrierOpen ? 'BARRIER OPEN' : 'BARRIER CLOSED'}
                    </div>
                  </div>

                  <div className="mt-6 max-w-sm">
                    <span className="material-symbols-outlined text-slate-300 text-5xl mb-2">sensor_door</span>
                    <h3 className="text-base font-bold text-slate-700">Awaiting Vehicle Selection</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Search for an active booking or use the quick simulation links on the top-right to display vehicle specs and control exit gate gates.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Bottom Table: Session Checkout History logs */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-500">history</span>
                  Session Exit Audit Trail
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Chronological list of vehicle checkouts processed at the exit terminal during this session.
                </p>
              </div>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold font-mono px-3 py-1 rounded-full border border-slate-200">
                LOGGED: {sessionLogs.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50">
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Log ID</th>
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Booking Code</th>
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">License Plate</th>
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Check-Out At</th>
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Database Status</th>
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Hardware Command</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessionLogs.length > 0 ? (
                    sessionLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                        <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-400">#{log.id}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{log.bookingCode}</td>
                        <td className="py-3.5 px-4 font-mono text-xs font-bold bg-slate-50 border border-slate-200/50 rounded inline-block my-1.5">{log.licensePlate}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">
                          {log.checkOutAt.toLocaleTimeString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-200">
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="bg-indigo-50 border border-indigo-200 text-indigo-800 font-mono text-[10px] font-bold px-2 py-1 rounded-lg">
                            {log.barrierSignal}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No exit operations logged in this shift session yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {blacklistAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md pointer-events-auto">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-red-500 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.5)] text-left">
            {/* Flashing red alert top bar */}
            <div className="bg-red-600 text-white p-5 flex justify-between items-center animate-pulse">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-3xl font-black">gavel</span>
                <div>
                  <h3 className="font-extrabold text-lg tracking-tight uppercase">
                    ALERT: {blacklistAlert.alertType || 'BLACKLIST DETECTED'}
                  </h3>
                  <p className="text-xs text-red-100 font-medium">
                    Severity: {blacklistAlert.alarmLevel || 'CRITICAL'}
                  </p>
                </div>
              </div>
              <span className="bg-red-800/60 text-white text-[10px] font-bold px-3 py-1 rounded-full border border-red-500/30">
                ACCESS BLOCKED
              </span>
            </div>

            <div className="p-8 space-y-6 text-slate-300">
              <p className="text-sm leading-relaxed text-slate-400">
                The security validation service automatically rejected this transaction because the entity has been flag-restricted on the warehouse blacklist registry.
              </p>

              {/* Blocked Entity specs */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-red-500/20 space-y-4 font-mono text-sm">
                <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
                  <span className="text-slate-500 text-xs font-semibold">BLOCKED ENTITY</span>
                  <span className="bg-red-500/10 text-red-400 text-xs px-2.5 py-0.5 rounded border border-red-500/20 font-bold uppercase">
                    {blacklistAlert.blockedEntity}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block mb-0.5 uppercase">License Plate</span>
                    <span className="font-bold text-slate-200">{blacklistAlert.licensePlate || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block mb-0.5 uppercase">Driver Name</span>
                    <span className="font-bold text-slate-200">{blacklistAlert.driverName || 'N/A'}</span>
                  </div>
                </div>

                <div className="border-t border-slate-800/60 pt-3">
                  <span className="text-slate-500 text-[10px] block mb-0.5 uppercase">Denial Reason</span>
                  <p className="text-xs text-red-300 bg-red-950/20 p-3 rounded-lg border border-red-900/30 font-sans leading-relaxed mt-1">
                    {blacklistAlert.reason}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => {
                    setBlacklistAlert(null);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-red-600/30 text-center text-sm font-sans flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
                  Acknowledge Threat / Dismiss Alarm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GateCheckoutDashboard;
