import React from 'react';
import KpiCards from '../../components/KpiCards';
import WarehouseMap from '../../components/WarehouseMap';
import RecentOrders from '../../components/RecentOrders';
import RightPanel from '../../components/RightPanel';
import { activityData, orderData } from './data';

const OverviewTab: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <KpiCards />

      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 lg:col-span-8 space-y-6">
          <WarehouseMap />
          <RecentOrders orders={orderData} />
        </section>

        <section className="col-span-12 lg:col-span-4 space-y-6">
          <RightPanel activity={activityData} />
        </section>
      </div>
    </div>
  );
};

export default OverviewTab;
