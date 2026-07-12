import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import WarehouseHeader from '../../components/WarehouseHeader';
import FloatingActionButton from '../../components/FloatingActionButton';
import OverviewTab from './OverviewTab';
import VehicleDashboard from './VehicleDashboard';
import { LayoutDashboard, Truck } from 'lucide-react';

const WarehouseDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'vehicle'>('overview');

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased overflow-hidden">
      <Sidebar />

      <main className="ml-[280px] flex-1 h-screen overflow-y-auto custom-scrollbar flex flex-col animate-fade-in-up">
        <WarehouseHeader title="Warehouse Dashboard" subtitle="Welcome to the SmartLog AI Warehouse Management System." />

        <div className="p-8 pt-24 flex-1 flex flex-col">
          {/* Tabs Navigation */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <LayoutDashboard size={18} />
                Tổng quan
              </button>

              <button
                onClick={() => setActiveTab('vehicle')}
                className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'vehicle'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Truck size={18} />
                Trạng thái xe
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'vehicle' && <VehicleDashboard />}
          </div>
        </div>
      </main>

      <FloatingActionButton />
    </div>
  );
};

export default WarehouseDashboard;
