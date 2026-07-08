import React from 'react';
import AdminPageLayout from '@components/AdminPageLayout';
import { TierConfigManagement } from './TierConfigManagement';
import { CustomerTierReport } from './CustomerTierReport';
import { CustomerTierTable } from './CustomerTierTable';

export const TierManagementPage: React.FC = () => {
  return (
    <AdminPageLayout
      title="Customer Tier Management"
      subtitle="Configure tier rules, view distribution reports, and manage customer tier status."
    >
      {/* Top section: Config & Report side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TierConfigManagement />
        <CustomerTierReport />
      </div>

      {/* Bottom section: Full width table */}
      <CustomerTierTable />
    </AdminPageLayout>
  );
};

export default TierManagementPage;
