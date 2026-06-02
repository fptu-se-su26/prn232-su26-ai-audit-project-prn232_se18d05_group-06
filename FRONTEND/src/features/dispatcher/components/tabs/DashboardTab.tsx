import React from 'react';
import { MapLayer } from '../MapLayer';
import { KPISection } from '../KPISection';
import { ActiveOrders as CommandOrders } from '../ActiveOrders';
import { AIInsights } from '../AIInsights';
import { LiveEvents } from '../LiveEvents';
import { Order, LiveEvent, AIRecommendation, KPIStats } from '@/types/dispatcher';

interface DashboardTabProps {
  orders: Order[];
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  stats: KPIStats;
  filteredCommandOrders: Order[];
  recommendation: AIRecommendation | null;
  handleApplyRecommendation: (id: string) => void;
  handleDismissRecommendation: (id: string) => void;
  filteredEvents: LiveEvent[];
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  orders,
  selectedOrderId,
  setSelectedOrderId,
  stats,
  filteredCommandOrders,
  recommendation,
  handleApplyRecommendation,
  handleDismissRecommendation,
  filteredEvents,
}) => {
  return (
    <>
      <MapLayer
        orders={orders.filter((o) => o.status !== 'delivered')}
        selectedOrderId={selectedOrderId}
        onOrderSelect={setSelectedOrderId}
      />

      <div className="flex flex-col gap-gutter h-full min-h-0 relative z-10 pointer-events-none">
        <div className="pointer-events-auto shrink-0">
          <KPISection stats={stats} />
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-gutter min-h-0 relative">
          <div className="lg:col-span-3 pointer-events-auto h-full min-h-0">
            <CommandOrders
              orders={filteredCommandOrders}
              selectedOrderId={selectedOrderId}
              onOrderSelect={setSelectedOrderId}
            />
          </div>

          <div className="hidden lg:block lg:col-span-6 pointer-events-none" />

          <div className="lg:col-span-3 flex flex-col gap-gutter h-full min-h-0 pointer-events-auto">
            {recommendation && !recommendation.dismissed && (
              <AIInsights
                recommendation={recommendation}
                onApply={handleApplyRecommendation}
                onDismiss={handleDismissRecommendation}
              />
            )}

            <LiveEvents events={filteredEvents} />
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardTab;
