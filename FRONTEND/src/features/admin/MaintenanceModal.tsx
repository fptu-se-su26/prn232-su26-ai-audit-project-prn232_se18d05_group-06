import React, { useState } from 'react';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  onSubmit: (data: { type: string; dueDate: string; notes: string }) => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({ isOpen, onClose, vehicleId, onSubmit }) => {
  const [type, setType] = useState('Oil Change');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ type, dueDate, notes });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div 
        className="bg-surface/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl w-full max-w-md overflow-hidden relative"
      >
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Schedule Maintenance
          </h2>
          <button 
            onClick={onClose}
            className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error/10"
          >
            close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-body-md text-on-surface-variant mb-4">
            Scheduling for Vehicle: <span className="font-bold text-primary">{vehicleId}</span>
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1">Maintenance Type</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              required
            >
              <option value="Oil Change">Oil Change</option>
              <option value="Tire Rotation">Tire Rotation</option>
              <option value="Brake Inspection">Brake Inspection</option>
              <option value="Engine Diagnostics">Engine Diagnostics</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1">Due Date</label>
            <input 
              type="date" 
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1">Notes</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none min-h-[100px]"
              placeholder="Add any specific instructions or observations..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-highest transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 rounded-xl font-label-md text-label-md text-white shadow-md hover:shadow-lg transition-all"
              style={{ background: 'linear-gradient(135deg, #004ac6 0%, #2563eb 100%)' }}
            >
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
