import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useScopeStore } from '../../store/scopeStore';
import { useUiStore } from '../../store/uiStore';
import { useStoreRegistry } from '../../store/storeRegistry';
import { AdminLayout } from '../../components/shared/AdminLayout';
import { 
  MapPin, Sliders, Edit3, Trash2, Save, Info, AlertTriangle 
} from 'lucide-react';

export const DeliveryZone = () => {
  const { scope } = useAuthStore();
  const { currentStoreId } = useScopeStore();
  const { addToast } = useUiStore();
  const { stores, deliveryZones, updateDeliveryZone } = useStoreRegistry();

  const activeStoreId = currentStoreId || scope.storeId || 'store_001';
  const activeStore = stores.find(s => s.id === activeStoreId);
  const activeZone = deliveryZones.find(z => z.storeId === activeStoreId);

  // States
  const [mode, setMode] = useState('radius'); // 'radius' | 'polygon'
  const [radius, setRadius] = useState(4); // in km (slider: 1-8km)
  
  // Polygon coordinates mapped to SVG coordinate bounds (400x300 canvas)
  const [vertices, setVertices] = useState([]);

  useEffect(() => {
    if (activeZone) {
      setMode(activeZone.mode || 'radius');
      setRadius(activeZone.radiusKm || 4);
      setVertices(activeZone.polygonCoordinates || []);
    }
  }, [activeStoreId, activeZone]);

  const handleMapClick = (e) => {
    if (mode !== 'polygon') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Limit vertices to 12 max for mock simplification
    if (vertices.length >= 12) {
      addToast('Maximum 12 boundary points allowed.', 'warning');
      return;
    }

    setVertices([...vertices, { x: Math.round(x), y: Math.round(y) }]);
    addToast('New boundary vertex placed!', 'success');
  };

  const handleClearVertices = () => {
    setVertices([]);
    addToast('Boundary vertices cleared. Tap on the map to draw.', 'warning');
  };

  const handleSave = () => {
    if (mode === 'polygon' && vertices.length < 3) {
      addToast('A delivery polygon requires at least 3 vertices.', 'error');
      return;
    }

    const confirmMsg = mode === 'radius' 
      ? `Save delivery zone centered at ${activeStore?.name || 'store'} with a radius of ${radius} km?`
      : `Save custom boundary polygon with ${vertices.length} vertices for ${activeStore?.name || 'store'}?`;

    if (window.confirm(confirmMsg)) {
      updateDeliveryZone(activeStoreId, mode, radius, vertices);
      addToast('Delivery boundary updated successfully!', 'success');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-card border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-heading font-extrabold text-text-primary">
              Delivery Zone Boundary Editor
            </h1>
            <p className="text-[10px] font-body text-text-secondary mt-0.5">
              Draw delivery limits either as a flat radius circle or a custom coordinate boundary polygon
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-brand hover:bg-brand-accent text-white font-heading font-semibold rounded-pill text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* Editor Controls & Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: Mode Controls & Metrics */}
          <div className="space-y-6">
            {/* Mode selection card */}
            <div className="bg-white border border-border rounded-card p-5 shadow-sm space-y-4">
              <h3 className="font-heading font-extrabold text-xs text-text-primary uppercase tracking-wide">
                Boundary Mode
              </h3>
              
              <div className="grid grid-cols-2 gap-2 bg-surface-sunken p-1.5 rounded-card border border-border">
                <button
                  onClick={() => setMode('radius')}
                  className={`py-2 text-xs font-heading font-bold rounded-card transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'radius' 
                      ? 'bg-white text-brand shadow-sm' 
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>Radius Circle</span>
                </button>
                <button
                  onClick={() => setMode('polygon')}
                  className={`py-2 text-xs font-heading font-bold rounded-card transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'polygon' 
                      ? 'bg-white text-brand shadow-sm' 
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Custom Polygon</span>
                </button>
              </div>
            </div>

            {/* Parameter Adjustment Panel */}
            <div className="bg-white border border-border rounded-card p-5 shadow-sm space-y-4">
              <h3 className="font-heading font-extrabold text-xs text-text-primary uppercase tracking-wide">
                Parameters
              </h3>

              {mode === 'radius' && (
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-heading font-bold text-text-secondary">
                    <span>Radius distance</span>
                    <span className="text-brand">{radius} km</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="0.5"
                    value={radius}
                    onChange={(e) => setRadius(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-stone-200 rounded-pill appearance-none cursor-pointer accent-brand"
                  />
                  <div className="text-[10px] font-body text-text-muted leading-relaxed">
                    Estimates: <strong>12,400 homes</strong>, average dispatch time: <strong>15-20 mins</strong>.
                  </div>
                </div>
              )}

              {mode === 'polygon' && (
                <div className="space-y-4">
                  <p className="text-[10px] font-body text-text-secondary leading-relaxed">
                    Tap anywhere inside the vector map to place boundary points. Connection lines will draw automatically.
                  </p>
                  
                  <div className="flex items-center justify-between text-[11px] font-heading font-semibold text-text-secondary">
                    <span>Active Vertices: {vertices.length} / 12</span>
                    {vertices.length > 0 && (
                      <button
                        onClick={handleClearVertices}
                        className="text-[10px] text-danger hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear All</span>
                      </button>
                    )}
                  </div>

                  {vertices.length > 0 && (
                    <div className="max-h-32 overflow-y-auto space-y-1.5 border border-border p-2.5 rounded-card bg-surface-sunken font-body text-[10px] text-text-secondary">
                      {vertices.map((v, idx) => (
                        <div key={idx} className="flex justify-between border-b border-border/50 pb-1">
                          <span>Point {idx + 1}</span>
                          <span className="font-semibold text-text-primary">X: {v.x}px · Y: {v.y}px</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Vector Map drawing board (Spans 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-heading font-extrabold text-sm text-text-primary uppercase tracking-wide">
              Interactive Map Layout
            </h3>

            <div className="bg-white border border-border rounded-card p-3 shadow-sm overflow-hidden">
              {/* Map grid wrapper */}
              <div 
                onClick={handleMapClick}
                className="w-full aspect-[4/3] rounded-card bg-[#F6EFE6] relative overflow-hidden border border-stone-200 select-none cursor-crosshair"
                style={{ backgroundImage: 'radial-gradient(#d3c7b3 1px, transparent 1px)', backgroundSize: '16px 16px' }}
              >
                {/* Simulated Street layouts */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {/* Street Lines */}
                  <line x1="20" y1="50" x2="380" y2="50" stroke="#E5DAC5" strokeWidth="6" />
                  <line x1="20" y1="180" x2="380" y2="180" stroke="#E5DAC5" strokeWidth="8" />
                  <line x1="80" y1="20" x2="80" y2="280" stroke="#E5DAC5" strokeWidth="6" />
                  <line x1="300" y1="20" x2="300" y2="280" stroke="#E5DAC5" strokeWidth="8" />

                  {/* Neighborhood Labels */}
                  <text x="25" y="35" fill="#a49780" fontSize="9" fontWeight="bold" fontFamily="Poppins">CIVIL LINES</text>
                  <text x="310" y="35" fill="#a49780" fontSize="9" fontWeight="bold" fontFamily="Poppins">GANDHI NAGAR</text>
                  <text x="25" y="270" fill="#a49780" fontSize="9" fontWeight="bold" fontFamily="Poppins">TRIKUTA NAGAR</text>

                  {/* Radius Overlay */}
                  {mode === 'radius' && (
                    <circle 
                      cx="200" 
                      cy="150" 
                      r={radius * 22} 
                      fill="#8B0000" 
                      fillOpacity="0.1" 
                      stroke="#8B0000" 
                      strokeWidth="2" 
                      strokeDasharray="4 2" 
                    />
                  )}

                  {/* Polygon Overlay */}
                  {mode === 'polygon' && vertices.length >= 3 && (
                    <polygon 
                      points={vertices.map(v => `${v.x},${v.y}`).join(' ')} 
                      fill="#8B0000" 
                      fillOpacity="0.1" 
                      stroke="#8B0000" 
                      strokeWidth="2" 
                      strokeDasharray="4 2" 
                    />
                  )}

                  {/* Connecting lines for polygon if incomplete */}
                  {mode === 'polygon' && vertices.length > 0 && vertices.length < 3 && (
                    <polyline 
                      points={vertices.map(v => `${v.x},${v.y}`).join(' ')} 
                      fill="none" 
                      stroke="#8B0000" 
                      strokeWidth="2" 
                      strokeDasharray="4 2" 
                    />
                  )}
                </svg>

                {/* Store Pin (Center) */}
                <div 
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 pointer-events-none"
                  style={{ left: '200px', top: '150px' }}
                >
                  <div className="w-7 h-7 rounded-full bg-brand text-white border-2 border-white flex items-center justify-center shadow-lg animate-bounce">
                    <MapPin className="w-4.5 h-4.5 fill-white/10" />
                  </div>
                  <span className="mt-1 bg-dark text-white text-[8px] font-heading font-extrabold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                    Civil Lines Store
                  </span>
                </div>

                {/* Render interactive vertices on top of SVG */}
                {mode === 'polygon' && vertices.map((v, idx) => (
                  <div
                    key={idx}
                    className="absolute w-3.5 h-3.5 rounded-full bg-gold border-2 border-white shadow cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-30 hover:scale-125 transition-transform"
                    style={{ left: `${v.x}px`, top: `${v.y}px` }}
                  />
                ))}

              </div>
              
              <div className="mt-2.5 flex items-center gap-1.5 text-[9px] font-body text-text-muted justify-center">
                <Info className="w-3.5 h-3.5 text-brand" />
                <span>Map centered on actual outlet coordinates: <strong>32.7266° N, 74.8570° E</strong></span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default DeliveryZone;
