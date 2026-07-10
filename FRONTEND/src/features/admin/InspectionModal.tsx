import React, { useState, useRef } from 'react';

interface InspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  onSubmit: (data: FormData) => void;
}

export const InspectionModal: React.FC<InspectionModalProps> = ({ isOpen, onClose, vehicleId, onSubmit }) => {
  const [inspectionDate, setInspectionDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [result, setResult] = useState('PASS');
  const [inspectorName, setInspectorName] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('VehicleId', vehicleId);
    formData.append('InspectionDate', inspectionDate);
    formData.append('ExpiryDate', expiryDate);
    formData.append('Result', result);
    formData.append('InspectorName', inspectorName);
    formData.append('Notes', notes);
    
    if (file) {
      formData.append('Document', file);
    }

    onSubmit(formData);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-surface/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden relative">
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-white/50">
          <h2 className="font-headline-sm text-headline-sm font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">fact_check</span>
            Record Inspection
          </h2>
          <button 
            onClick={onClose}
            className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error/10"
          >
            close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="text-body-md text-on-surface-variant mb-2">
            Recording inspection for: <span className="font-bold text-on-surface">{vehicleId}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">Inspection Date</label>
              <input 
                type="date" 
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">Expiry Date</label>
              <input 
                type="date" 
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">Result</label>
              <select 
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="PASS">Pass</option>
                <option value="FAIL">Fail</option>
                <option value="CONDITIONAL">Conditional</option>
              </select>
              {result === 'FAIL' && (
                <div className="mt-2 p-2 bg-error/10 border border-error/20 rounded-lg flex items-start gap-2">
                  <span className="material-symbols-outlined text-error text-[18px]">warning</span>
                  <span className="text-xs text-error">
                    Xe sẽ được đánh dấu là "NEEDS_REPAIR" và không thể hoạt động cho đến khi được sửa chữa.
                  </span>
                </div>
              )}
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">Inspector</label>
              <input 
                type="text" 
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                placeholder="e.g., John Doe"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1">Notes</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] resize-none"
              placeholder="Any issues found or remarks..."
            />
          </div>

          {/* File Upload Section */}
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1">Inspection Document</label>
            <div 
              className="border-2 border-dashed border-outline-variant hover:border-primary/50 bg-surface-container-low/50 rounded-xl p-6 text-center cursor-pointer transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="material-symbols-outlined text-3xl text-primary/70 mb-2">upload_file</span>
              <div className="font-body-sm text-body-sm text-on-surface">
                {file ? file.name : "Click to upload document (PDF, JPG, PNG)"}
              </div>
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-surface/90 py-2">
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
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
