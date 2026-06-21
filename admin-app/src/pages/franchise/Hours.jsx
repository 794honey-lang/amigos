import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useStoreRegistry } from '../../store/storeRegistry';
import { AdminLayout } from '../../components/shared/AdminLayout';
import { 
  Clock, Calendar, CheckSquare, Square, Save, Plus, Trash2, Info 
} from 'lucide-react';

export const Hours = () => {
  const { scope } = useAuthStore();
  const { addToast } = useUiStore();
  
  const allStores = useStoreRegistry(state => state.stores);
  const bulkUpdateStoreHours = useStoreRegistry(state => state.bulkUpdateStoreHours);
  const bulkAddHolidayClosure = useStoreRegistry(state => state.bulkAddHolidayClosure);

  const activeFranchiseId = scope.franchiseId || 'fr_001';

  // Roster of stores under this franchise
  const [stores, setStores] = useState([]);
  const [selectedStoreIds, setSelectedStoreIds] = useState([]);

  // Template Hours States
  const [templateOpen, setTemplateOpen] = useState('11:00 AM');
  const [templateClose, setTemplateClose] = useState('11:00 PM');
  const [applyToWeekends, setApplyToWeekends] = useState(false);

  // Holiday States
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayReason, setHolidayReason] = useState('');

  useEffect(() => {
    const franchiseStores = allStores.filter(s => s.franchiseId === activeFranchiseId);
    setStores(franchiseStores);
  }, [activeFranchiseId, allStores]);

  const handleSelectStore = (storeId) => {
    if (selectedStoreIds.includes(storeId)) {
      setSelectedStoreIds(prev => prev.filter(id => id !== storeId));
    } else {
      setSelectedStoreIds(prev => [...prev, storeId]);
    }
  };

  const handleSelectAllStores = () => {
    if (selectedStoreIds.length === stores.length) {
      setSelectedStoreIds([]);
    } else {
      setSelectedStoreIds(stores.map(s => s.id));
    }
  };

  const handleApplyTemplate = (e) => {
    e.preventDefault();
    if (selectedStoreIds.length === 0) {
      addToast('Please select at least one store to apply the template.', 'error');
      return;
    }

    const updatedHours = {};
    const daysToApply = applyToWeekends 
      ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      
    daysToApply.forEach(day => {
      updatedHours[day] = { open: templateOpen, close: templateClose, closed: false };
    });

    bulkUpdateStoreHours(selectedStoreIds, updatedHours);

    const storeNames = stores.filter(s => selectedStoreIds.includes(s.id)).map(s => s.name).join(', ');
    addToast(
      `Propagated hours template (${templateOpen} - ${templateClose}) to: ${storeNames}`, 
      'success'
    );
    setSelectedStoreIds([]);
  };

  const handleApplyHoliday = (e) => {
    e.preventDefault();
    if (selectedStoreIds.length === 0) {
      addToast('Please select at least one store to schedule holiday closures.', 'error');
      return;
    }
    if (!holidayDate || !holidayReason) {
      addToast('Please enter closure date and reason.', 'error');
      return;
    }

    const closure = {
      date: holidayDate,
      reason: holidayReason,
      closedAllDay: true
    };

    bulkAddHolidayClosure(selectedStoreIds, closure);

    const storeNames = stores.filter(s => selectedStoreIds.includes(s.id)).map(s => s.name).join(', ');
    addToast(
      `Scheduled holiday closure (${holidayDate}: ${holidayReason}) for: ${storeNames}`, 
      'success'
    );
    
    // Reset
    setHolidayDate('');
    setHolidayReason('');
    setSelectedStoreIds([]);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-card border border-border shadow-sm">
          <h1 className="text-base font-heading font-extrabold text-text-primary">
            Operating Hours & Holiday Planner
          </h1>
          <p className="text-[10px] font-body text-text-secondary mt-0.5">
            Configure hours templates and coordinate regional branch holiday shutdowns
          </p>
        </div>

        {/* Multi-Store Selector Checklist */}
        <div className="bg-white border border-border rounded-card p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center border-b border-border pb-2.5">
            <h3 className="font-heading font-extrabold text-xs text-text-primary uppercase tracking-wide">
              1. Select Target Outlets
            </h3>
            <button
              onClick={handleSelectAllStores}
              className="text-[10px] font-heading font-bold text-brand hover:underline cursor-pointer"
            >
              {selectedStoreIds.length === stores.length ? 'Deselect All' : 'Select All Stores'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {stores.map(store => {
              const isChecked = selectedStoreIds.includes(store.id);
              return (
                <div
                  key={store.id}
                  onClick={() => handleSelectStore(store.id)}
                  className={`p-3 border rounded-card shadow-sm cursor-pointer flex items-center justify-between transition-all bg-white ${
                    isChecked 
                      ? 'border-brand bg-red-50/5 ring-1 ring-brand/10' 
                      : 'border-border hover:border-stone-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="font-heading font-bold text-xs text-text-primary block leading-tight">
                      {store.name}
                    </span>
                    <span className="text-[9px] text-text-muted font-body block uppercase">
                      City: {store.city}
                    </span>
                  </div>
                  <div className="shrink-0 text-brand">
                    {isChecked ? <CheckSquare className="w-4.5 h-4.5" /> : <Square className="w-4.5 h-4.5 text-stone-300" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operations Panels: Hours Template & Holiday Closures */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Bulk Apply Hours Template */}
          <div className="bg-white border border-border p-5 rounded-card shadow-sm flex flex-col justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-heading font-extrabold text-xs text-text-primary uppercase tracking-wide border-b border-border pb-2.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand" />
                <span>Bulk Hours Template</span>
              </h3>
              <p className="text-[10px] font-body text-text-secondary leading-relaxed">
                Define the standard template coordinates and apply them globally to all selected franchise branches with one click.
              </p>
            </div>

            <form onSubmit={handleApplyTemplate} className="space-y-3.5 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Open Time</label>
                  <input
                    type="text"
                    value={templateOpen}
                    onChange={(e) => setTemplateOpen(e.target.value)}
                    placeholder="e.g. 11:00 AM"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-bold bg-stone-50/50"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Close Time</label>
                  <input
                    type="text"
                    value={templateClose}
                    onChange={(e) => setTemplateClose(e.target.value)}
                    placeholder="e.g. 11:00 PM"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-bold bg-stone-50/50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="weekendsOnly"
                  checked={applyToWeekends}
                  onChange={(e) => setApplyToWeekends(e.target.checked)}
                  className="rounded text-brand focus:ring-brand/10 border-stone-300 cursor-pointer"
                />
                <label htmlFor="weekendsOnly" className="text-[11px] font-heading font-medium text-text-secondary cursor-pointer select-none">
                  Apply to weekends only (Saturday - Sunday)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-brand hover:bg-brand-accent text-white font-heading font-semibold rounded-pill text-xs shadow-md active:scale-95 transition-all cursor-pointer mt-2"
              >
                Apply Hours Template
              </button>
            </form>
          </div>

          {/* Bulk Holiday Closures */}
          <div className="bg-white border border-border p-5 rounded-card shadow-sm flex flex-col justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-heading font-extrabold text-xs text-text-primary uppercase tracking-wide border-b border-border pb-2.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gold" />
                <span>Bulk Holiday Closure</span>
              </h3>
              <p className="text-[10px] font-body text-text-secondary leading-relaxed">
                Schedule holiday closures or shutdowns (e.g. Independence Day) across multiple outlets in the franchise.
              </p>
            </div>

            <form onSubmit={handleApplyHoliday} className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Closure Date</label>
                <input
                  type="date"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body bg-stone-50/50"
                  style={{ height: '36px' }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Closure Reason</label>
                <input
                  type="text"
                  value={holidayReason}
                  onChange={(e) => setHolidayReason(e.target.value)}
                  placeholder="e.g. Diwali Holiday"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-brand hover:bg-brand-accent text-white font-heading font-semibold rounded-pill text-xs shadow-md active:scale-95 transition-all cursor-pointer mt-2"
              >
                Schedule Holiday Shutdown
              </button>
            </form>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default Hours;
