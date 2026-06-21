import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useScopeStore } from '../../store/scopeStore';
import { useUiStore } from '../../store/uiStore';
import { useStoreRegistry } from '../../store/storeRegistry';
import { AdminLayout } from '../../components/shared/AdminLayout';
import { Toggle } from '../../components/ui/Toggle';
import { 
  Calendar, Clock, AlertTriangle, Plus, Trash2, CheckCircle, Info 
} from 'lucide-react';

export const Hours = () => {
  const { scope } = useAuthStore();
  const { currentStoreId } = useScopeStore();
  const { addToast } = useUiStore();
  
  const { storeHours, updateStoreHours } = useStoreRegistry();

  const activeStoreId = currentStoreId || scope.storeId || 'store_001';

  // State
  const [weeklyHours, setWeeklyHours] = useState({});
  const [holidayClosures, setHolidayClosures] = useState([]);
  
  // Close early form states
  const [earlyCloseTime, setEarlyCloseTime] = useState('08:00 PM');
  const [earlyCloseReason, setEarlyCloseReason] = useState('Staff shortage');

  // Add holiday closure states
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayReason, setNewHolidayReason] = useState('');

  const loadHoursData = () => {
    const activeHours = storeHours.find(h => h.storeId === activeStoreId) || storeHours[0];
    if (activeHours) {
      setWeeklyHours({ ...activeHours.regularHours });
      setHolidayClosures([...(activeHours.holidayClosures || [])]);
    }
  };

  useEffect(() => {
    loadHoursData();
  }, [activeStoreId, storeHours]);

  const handleWeeklyHoursChange = (day, field, value) => {
    const updated = {
      ...weeklyHours,
      [day]: {
        ...weeklyHours[day],
        [field]: value
      }
    };
    setWeeklyHours(updated);
    updateStoreHours(activeStoreId, updated, holidayClosures);
    addToast(`Updated regular hours for ${day}`, 'success');
  };

  const handleCloseEarlySubmit = (e) => {
    e.preventDefault();
    addToast(`Store scheduled to close early today at ${earlyCloseTime} due to ${earlyCloseReason}.`, 'warning');
  };

  const handleAddHoliday = (e) => {
    e.preventDefault();
    if (!newHolidayDate || !newHolidayReason) {
      addToast('Please enter both date and reason', 'error');
      return;
    }

    const newClosure = {
      date: newHolidayDate,
      reason: newHolidayReason,
      closedAllDay: true
    };

    const updatedHolidayClosures = [...holidayClosures, newClosure];
    setHolidayClosures(updatedHolidayClosures);
    updateStoreHours(activeStoreId, weeklyHours, updatedHolidayClosures);
    addToast(`Scheduled holiday closure for ${newHolidayDate}`, 'success');
    
    // Reset form
    setNewHolidayDate('');
    setNewHolidayReason('');
  };

  const handleDeleteHoliday = (date) => {
    const updatedHolidayClosures = holidayClosures.filter(c => c.date !== date);
    setHolidayClosures(updatedHolidayClosures);
    updateStoreHours(activeStoreId, weeklyHours, updatedHolidayClosures);
    addToast(`Removed holiday closure on ${date}`, 'success');
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-card border border-border shadow-sm">
          <h1 className="text-base font-heading font-extrabold text-text-primary">
            Store Hours & Calendar Coordinator
          </h1>
          <p className="text-[10px] font-body text-text-secondary mt-0.5">
            Configure regular weekly hours, emergency early closures, and schedule upcoming holiday shutdowns
          </p>
        </div>

        {/* Regular Weekly Hours */}
        <div className="bg-white border border-border rounded-card p-5 shadow-sm space-y-4">
          <h3 className="font-heading font-extrabold text-sm text-text-primary uppercase tracking-wide border-b border-border pb-2.5">
            Weekly Operating Hours
          </h3>

          <div className="divide-y divide-border text-xs">
            {daysOfWeek.map(day => {
              const hours = weeklyHours[day] || { open: '11:00 AM', close: '11:00 PM', closed: false };
              return (
                <div key={day} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="w-28 font-heading font-bold text-text-primary">
                    {day}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-text-secondary font-heading font-semibold uppercase">Open</span>
                      <input
                        type="text"
                        value={hours.open}
                        disabled={hours.closed}
                        onChange={(e) => handleWeeklyHoursChange(day, 'open', e.target.value)}
                        className="px-2 py-1 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-bold text-center bg-white text-xs w-24 disabled:opacity-50"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-text-secondary font-heading font-semibold uppercase">Close</span>
                      <input
                        type="text"
                        value={hours.close}
                        disabled={hours.closed}
                        onChange={(e) => handleWeeklyHoursChange(day, 'close', e.target.value)}
                        className="px-2 py-1 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-bold text-center bg-white text-xs w-24 disabled:opacity-50"
                      />
                    </div>

                    <div className="border-l border-border pl-4">
                      <Toggle 
                        checked={!hours.closed} 
                        onChange={(val) => handleWeeklyHoursChange(day, 'closed', !val)}
                        label={hours.closed ? 'CLOSED ALL DAY' : 'OPEN'}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lower Grid: Close Early & Holiday Closures */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Close Early Today Form */}
          <div className="bg-white border border-border p-5 rounded-card shadow-sm flex flex-col justify-between gap-4">
            <div className="space-y-1.5">
              <h3 className="font-heading font-extrabold text-sm text-text-primary uppercase tracking-wide border-b border-border pb-2.5 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-gold shrink-0" />
                <span>Close Early Today</span>
              </h3>
              <p className="text-[10px] font-body text-text-secondary leading-relaxed">
                Emergency setting to close the kitchen early today. This temporarily overrides regular closing hours and shuts down online checkouts at the set time.
              </p>
            </div>

            <form onSubmit={handleCloseEarlySubmit} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Early Closing Time</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                    <Clock className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={earlyCloseTime}
                    onChange={(e) => setEarlyCloseTime(e.target.value)}
                    placeholder="e.g. 08:00 PM"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Reason for Early Close</label>
                <select
                  value={earlyCloseReason}
                  onChange={(e) => setEarlyCloseReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-semibold bg-white"
                >
                  <option value="Staff shortage">Staff Shortage</option>
                  <option value="Severe weather">Severe Weather</option>
                  <option value="Maintenance / Emergency">Maintenance / Emergency</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gold hover:bg-amber-600 text-dark font-heading font-bold rounded-pill text-xs shadow-md active:scale-95 transition-all cursor-pointer mt-2"
              >
                Apply Early Closure
              </button>
            </form>
          </div>

          {/* Holiday Calendar Closures */}
          <div className="bg-white border border-border p-5 rounded-card shadow-sm space-y-4">
            <h3 className="font-heading font-extrabold text-sm text-text-primary uppercase tracking-wide border-b border-border pb-2.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand shrink-0" />
              <span>Holiday & Closure Planner</span>
            </h3>

            {/* Existing holidays list */}
            <div className="max-h-40 overflow-y-auto space-y-2 border border-border rounded-card p-3 bg-surface-sunken divide-y divide-border/60">
              {holidayClosures.length > 0 ? (
                holidayClosures.map((closure, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 first:pt-0 last:pb-0 text-xs">
                    <div>
                      <p className="font-heading font-bold text-text-primary">
                        {closure.date}
                      </p>
                      <p className="text-[10px] font-body text-text-secondary">
                        Reason: {closure.reason}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteHoliday(closure.date)}
                      className="p-1 hover:bg-red-50 text-danger rounded-full transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-text-muted text-[11px] font-body flex items-center justify-center gap-1.5">
                  <Info className="w-4 h-4" />
                  <span>No holiday closures scheduled</span>
                </div>
              )}
            </div>

            {/* Add Holiday Form */}
            <form onSubmit={handleAddHoliday} className="flex flex-col md:flex-row gap-3 pt-1">
              <input
                type="date"
                value={newHolidayDate}
                onChange={(e) => setNewHolidayDate(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                style={{ height: '36px' }}
              />
              <input
                type="text"
                value={newHolidayReason}
                onChange={(e) => setNewHolidayReason(e.target.value)}
                placeholder="Reason (e.g. Diwali)"
                className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                style={{ height: '36px' }}
              />
              <button
                type="submit"
                className="px-4 bg-brand hover:bg-brand-accent text-white font-heading font-bold rounded-pill text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
                style={{ height: '36px' }}
              >
                <Plus className="w-4 h-4" />
                <span>Schedule</span>
              </button>
            </form>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default Hours;
