import React from 'react';

type WarehouseHeaderProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  rightContent?: React.ReactNode;
};

const WarehouseHeader: React.FC<WarehouseHeaderProps> = ({ title, subtitle, rightContent }) => {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-280px)] h-20 bg-white/90 backdrop-blur-md z-40 border-b border-slate-200/70 flex items-center justify-between px-8 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        {rightContent}
        <button className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 transition-all duration-200" type="button">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-600" />
        </button>
      </div>
    </header>
  );
};

export default WarehouseHeader;
