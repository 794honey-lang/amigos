import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useStoreRegistry } from '../../store/storeRegistry';
import { AdminLayout } from '../../components/shared/AdminLayout';
import { Toggle } from '../../components/ui/Toggle';
import { 
  Sliders, ShieldCheck, AlertTriangle, RefreshCw, Info, 
  MapPin, IndianRupee, Clock, CheckCircle 
} from 'lucide-react';

export const Overrides = () => {
  const { scope } = useAuthStore();
  const { addToast } = useUiStore();
  const allStores = useStoreRegistry(state => state.stores);

  const activeFranchiseId = scope.franchiseId || 'fr_001';

  // Franchise Default settings state
  const [defaultRadius, setDefaultRadius] = useState(5);
  const [defaultCod, setDefaultCod] = useState(true);
  const [defaultBuffer, setDefaultBuffer] = useState(0);

  // Store exceptions state (mock database)
  const [exceptions, setExceptions] = useState([]);

  useEffect(() => {
    const franchiseStores = allStores.filter(s => s.franchiseId === activeFranchiseId);
    
    // Scaffolding mock exceptions list
    const mockExceptions = [
      {
        storeId: 'store_001',
        name: 'Civil Lines, Jammu',
        radius: 6, // default is 5
        cod: true,
        buffer: 0
      },
      {
        storeId: 'store_002',
        name: 'Channi Himmat, Jammu',
        radius: 5,
        cod: false, // default is true
        buffer: 15  // default is 0
      }
    ];

    setExceptions(mockExceptions);
  }, [activeFranchiseId]);

  const handleResetToDefaults = (storeId, storeName) => {
    if (window.confirm(`Reset all operational settings for ${storeName} back to franchise defaults?`)) {
      setExceptions(prev => prev.map(ex => {
        if (ex.storeId === storeId) {
          return {
            ...ex,
            radius: defaultRadius,
            cod: defaultCod,
            buffer: defaultBuffer
          };
        }
        return ex;
      }));
      addToast(`Reset ${storeName} settings to franchise defaults!`, 'success');
    }
  };

  const handleSaveDefaults = (e) => {
    e.preventDefault();
    addToast('Franchise operational defaults updated successfully!', 'success');
  };

  const isDifferentFromDefault = (ex) => {
    return ex.radius !== defaultRadius || ex.cod !== defaultCod || ex.buffer !== defaultBuffer;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-card border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-heading font-extrabold text-text-primary">
              Operational Defaults & Overrides
            </h1>
            <p className="text-[10px] font-body text-text-secondary mt-0.5">
              Establish default parameters for new stores and audit store-level override exceptions
            </p>
          </div>
        </div>

        {/* Defaults & Exceptions grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel: Franchise defaults form (Spans 1) */}
          <div className="bg-white border border-border p-5 rounded-card shadow-sm flex flex-col justify-between gap-4 h-fit">
            <div className="space-y-1">
              <h3 className="font-heading font-extrabold text-sm text-text-primary uppercase tracking-wide border-b border-border pb-2.5 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-brand" />
                <span>Regional Defaults</span>
              </h3>
              <p className="text-[10px] font-body text-text-secondary leading-relaxed">
                New stores onboarded in this region will automatically inherit these settings.
              </p>
            </div>

            <form onSubmit={handleSaveDefaults} className="space-y-4 pt-2 text-xs">
              {/* Default radius */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-heading font-bold text-text-secondary text-[11px]">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-brand" /> Default Radius</span>
                  <span className="text-brand">{defaultRadius} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={defaultRadius}
                  onChange={(e) => setDefaultRadius(parseFloat(e.target.value))}
                  className="w-full h-1 bg-stone-200 rounded-pill appearance-none cursor-pointer accent-brand"
                />
              </div>

              {/* Default COD */}
              <div className="flex items-center justify-between border-t border-b border-border/80 py-3 my-1">
                <span className="font-heading font-bold text-text-secondary text-[11px] flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-brand" /> Default COD Enabled
                </span>
                <Toggle checked={defaultCod} onChange={setDefaultCod} />
              </div>

              {/* Default buffer */}
              <div className="space-y-2">
                <label className="font-heading font-bold text-text-secondary text-[11px] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand" /> Default Delivery Buffer
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={defaultBuffer}
                    onChange={(e) => setDefaultBuffer(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-semibold bg-white"
                  >
                    <option value={0}>Standard Time (0m)</option>
                    <option value={15}>+ 15 minutes</option>
                    <option value={30}>+ 30 minutes</option>
                    <option value={45}>+ 45 minutes</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-brand hover:bg-brand-accent text-white font-heading font-semibold rounded-pill text-xs shadow-md active:scale-95 transition-all cursor-pointer mt-3"
              >
                Apply Default Rules
              </button>
            </form>
          </div>

          {/* Right panel: Active Exceptions audit table (Spans 2) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-heading font-extrabold text-sm text-text-primary uppercase tracking-wide flex items-center gap-2">
              <span>Active Outlet Exceptions</span>
            </h3>

            <div className="bg-white border border-border rounded-card shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-border font-heading font-semibold text-text-secondary uppercase tracking-wider text-[10px]">
                    <th className="px-5 py-3">Store Name</th>
                    <th className="px-5 py-3">Delivery Boundary</th>
                    <th className="px-5 py-3">Cash On Delivery</th>
                    <th className="px-5 py-3">Buffer Delay</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-body text-text-primary">
                  {exceptions.map(ex => {
                    const hasException = isDifferentFromDefault(ex);
                    return (
                      <tr 
                        key={ex.storeId} 
                        className={`hover:bg-amber-50/10 transition-colors ${
                          !hasException ? 'opacity-50' : 'bg-amber-50/5'
                        }`}
                      >
                        <td className="px-5 py-3.5 font-heading font-bold">
                          {ex.name}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={ex.radius !== defaultRadius ? 'text-brand font-semibold' : ''}>
                            {ex.radius} km {ex.radius !== defaultRadius && ' (Override)'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={ex.cod !== defaultCod ? 'text-brand font-semibold' : ''}>
                            {ex.cod ? 'Enabled' : 'Disabled'} {ex.cod !== defaultCod && ' (Override)'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={ex.buffer !== defaultBuffer ? 'text-brand font-semibold' : ''}>
                            {ex.buffer > 0 ? `+${ex.buffer}m` : '0m'} {ex.buffer !== defaultBuffer && ' (Override)'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {hasException && (
                            <button
                              onClick={() => handleResetToDefaults(ex.storeId, ex.name)}
                              className="px-2.5 py-1 bg-surface-sunken hover:bg-stone-100 border border-stone-250 text-text-secondary font-heading font-bold rounded-pill text-[10px] flex items-center gap-1 ml-auto cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Reset to Default</span>
                            </button>
                          )}
                          {!hasException && (
                            <span className="text-[10px] font-heading font-semibold text-text-muted flex items-center gap-1 justify-end">
                              <CheckCircle className="w-3.5 h-3.5 text-success" />
                              <span>Inherited</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-1.5 text-[9px] font-body text-text-muted">
              <Info className="w-3.5 h-3.5 text-brand shrink-0" />
              <span>Stores showing "Override" labels have specific customizations set at the branch level. Click "Reset" to delete them.</span>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default Overrides;
