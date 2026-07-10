import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const mockBarData = [
  { name: 'Jan', costs: 4000 },
  { name: 'Feb', costs: 3000 },
  { name: 'Mar', costs: 2000 },
  { name: 'Apr', costs: 2780 },
  { name: 'May', costs: 1890 },
  { name: 'Jun', costs: 2390 },
  { name: 'Jul', costs: 3490 },
];

const mockPieData = [
  { name: 'Oil Change', value: 400 },
  { name: 'Tire Rotation', value: 300 },
  { name: 'Brake Service', value: 300 },
  { name: 'Diagnostics', value: 200 },
];

const COLORS = ['#004ac6', '#4cd7f6', '#00788c', '#6366f1'];

export const MaintenanceAnalytics: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Maintenance Costs Over Time */}
      <div 
        className="glass-card p-6 h-[400px] flex flex-col" 
        style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)', borderRadius: '18px' }}
      >
        <h3 className="font-headline-sm text-headline-sm font-semibold mb-4 text-on-surface">
          Maintenance Costs (YTD)
        </h3>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mockBarData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#49454f' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#49454f' }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                cursor={{ fill: 'rgba(0, 74, 198, 0.05)' }} 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="costs" fill="url(#colorCosts)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#004ac6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Maintenance Breakdown */}
      <div 
        className="glass-card p-6 h-[400px] flex flex-col" 
        style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)', borderRadius: '18px' }}
      >
        <h3 className="font-headline-sm text-headline-sm font-semibold mb-4 text-on-surface">
          Service Breakdown
        </h3>
        <div className="flex-1 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mockPieData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {mockPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
