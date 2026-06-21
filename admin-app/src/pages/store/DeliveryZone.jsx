import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useScopeStore } from '../../store/scopeStore';
import { useUiStore } from '../../store/uiStore';
import { useStoreRegistry } from '../../store/storeRegistry';
import { AdminLayout } from '../../components/shared/AdminLayout';
import { Toggle } from '../../components/ui/Toggle';
import { 
  MapPin, Sliders, Edit3, Trash2, Save, Info, AlertTriangle, Key, Map 
} from 'lucide-react';

const loadGoogleMapsScript = (apiKey, callback) => {
  if (window.google && window.google.maps) {
    callback();
    return;
  }
  
  const existingScript = document.getElementById('googleMapsScript');
  if (existingScript) {
    existingScript.remove();
  }

  const keyParam = apiKey ? `key=${apiKey}&` : '';
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?${keyParam}libraries=drawing,geometry`;
  script.id = 'googleMapsScript';
  script.async = true;
  script.defer = true;
  script.onload = () => {
    if (callback) callback();
  };
  script.onerror = () => {
    const errEvent = new CustomEvent('google_maps_load_error');
    window.dispatchEvent(errEvent);
  };
  document.body.appendChild(script);
};

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
  const [radius, setRadius] = useState(4); // in km
  const [vertices, setVertices] = useState([]); // Array of {lat, lng} or {x, y}

  // Delivery Fee States
  const [deliveryCharge, setDeliveryCharge] = useState(30);
  const [minOrderValue, setMinOrderValue] = useState(200);
  const [extraKmCharge, setExtraKmCharge] = useState(10);
  const [enableFreeDelivery, setEnableFreeDelivery] = useState(false);
  const [freeDeliveryMinOrder, setFreeDeliveryMinOrder] = useState(500);

  // Google Maps state
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    try {
      return localStorage.getItem('amigos_google_maps_api_key') || '';
    } catch (e) {
      return '';
    }
  });

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const circleRef = useRef(null);
  const polygonRef = useRef(null);
  const markersRef = useRef([]);

  // Setup Refs to avoid closures in map event handlers
  const modeRef = useRef(mode);
  const verticesRef = useRef(vertices);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { verticesRef.current = vertices; }, [vertices]);

  // Load Google Maps Script
  useEffect(() => {
    const handleErr = () => {
      setMapError(true);
      addToast('Google Maps API failed to load. Using fallback vector map.', 'warning');
    };
    window.addEventListener('google_maps_load_error', handleErr);

    loadGoogleMapsScript(apiKey, () => {
      setGoogleMapsLoaded(true);
      setMapError(false);
    });

    return () => {
      window.removeEventListener('google_maps_load_error', handleErr);
    };
  }, []);

  // Update states when store changes
  useEffect(() => {
    if (activeZone) {
      setMode(activeZone.mode || 'radius');
      setRadius(activeZone.radiusKm || 4);
      
      // Compatibility: convert legacy x/y coordinates to lat/lng relative to center
      const coords = (activeZone.polygonCoordinates || []).map(v => {
        if (v.lat !== undefined && v.lng !== undefined) {
          return { lat: Number(v.lat), lng: Number(v.lng) };
        }
        const latOffset = (150 - v.y) * 0.0002;
        const lngOffset = (v.x - 200) * 0.00025;
        return { lat: 32.7266 + latOffset, lng: 74.8570 + lngOffset };
      });
      setVertices(coords);

      setDeliveryCharge(activeZone.deliveryCharge !== undefined ? activeZone.deliveryCharge : 30);
      setMinOrderValue(activeZone.minOrderValue !== undefined ? activeZone.minOrderValue : 200);
      setExtraKmCharge(activeZone.extraKmCharge !== undefined ? activeZone.extraKmCharge : 10);
      setEnableFreeDelivery(activeZone.enableFreeDelivery !== undefined ? activeZone.enableFreeDelivery : false);
      setFreeDeliveryMinOrder(activeZone.freeDeliveryMinOrder !== undefined ? activeZone.freeDeliveryMinOrder : 500);
    }
  }, [activeStoreId, activeZone]);

  // Initialize Map
  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current || !activeStore || mapError) return;

    const center = { lat: activeStore.lat || 32.7266, lng: activeStore.lng || 74.8570 };

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 13,
      mapTypeId: 'roadmap',
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: true
    });

    mapInstanceRef.current = map;

    // Add store marker
    new window.google.maps.Marker({
      position: center,
      map,
      title: activeStore.name,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
      }
    });

    // Add map click listener
    const clickListener = map.addListener('click', (e) => {
      if (modeRef.current !== 'polygon') return;
      
      const newVertex = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      if (verticesRef.current.length >= 12) {
        addToast('Maximum 12 boundary points allowed.', 'warning');
        return;
      }
      setVertices([...verticesRef.current, newVertex]);
      addToast('New boundary vertex placed!', 'success');
    });

    return () => {
      window.google.maps.event.removeListener(clickListener);
    };
  }, [googleMapsLoaded, activeStoreId, mapError]);

  // Synchronize Map Overlays (Circle, Polygon, Markers)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !googleMapsLoaded || mapError) return;

    // Clear existing
    if (circleRef.current) {
      circleRef.current.setMap(null);
      circleRef.current = null;
    }
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const center = { lat: activeStore?.lat || 32.7266, lng: activeStore?.lng || 74.8570 };

    if (mode === 'radius') {
      const circle = new window.google.maps.Circle({
        strokeColor: '#8B0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#8B0000',
        fillOpacity: 0.15,
        map,
        center,
        radius: radius * 1000 // in meters
      });
      circleRef.current = circle;
    }

    if (mode === 'polygon') {
      const polygon = new window.google.maps.Polygon({
        paths: vertices,
        strokeColor: '#8B0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#8B0000',
        fillOpacity: 0.15,
        map
      });
      polygonRef.current = polygon;

      // Draw draggable markers
      vertices.forEach((coord, idx) => {
        const marker = new window.google.maps.Marker({
          position: coord,
          map,
          draggable: true,
          label: (idx + 1).toString(),
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
          }
        });

        marker.addListener('dragend', () => {
          const newPos = marker.getPosition();
          setVertices(prev => {
            const updated = [...prev];
            updated[idx] = { lat: newPos.lat(), lng: newPos.lng() };
            return updated;
          });
        });

        marker.addListener('dblclick', () => {
          setVertices(prev => prev.filter((_, i) => i !== idx));
          addToast(`Vertex ${idx + 1} removed`, 'info');
        });

        markersRef.current.push(marker);
      });
    }
  }, [googleMapsLoaded, mode, radius, vertices, activeStore, mapError]);

  // API Key handling
  const handleSaveApiKey = () => {
    try {
      localStorage.setItem('amigos_google_maps_api_key', apiKey);
      addToast('API Key saved! Reloading map...', 'success');
      setGoogleMapsLoaded(false);
      loadGoogleMapsScript(apiKey, () => {
        setGoogleMapsLoaded(true);
        setMapError(false);
      });
    } catch (e) {
      addToast('Failed to save API Key', 'error');
    }
  };

  const handleMapClick = (e) => {
    if (googleMapsLoaded && !mapError) return; // Google Maps handles click
    if (mode !== 'polygon') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (vertices.length >= 12) {
      addToast('Maximum 12 boundary points allowed.', 'warning');
      return;
    }

    setVertices([...vertices, { x: Math.round(x), y: Math.round(y) }]);
    addToast('New boundary vertex placed!', 'success');
  };

  const handleClearVertices = () => {
    setVertices([]);
    addToast('Boundary vertices cleared.', 'warning');
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
      updateDeliveryZone(activeStoreId, mode, radius, vertices, deliveryCharge, minOrderValue, extraKmCharge, enableFreeDelivery, freeDeliveryMinOrder);
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
                    {googleMapsLoaded && !mapError 
                      ? 'Click on the Google Map to place boundary points. Drag yellow markers to reposition, or double-click to remove.'
                      : 'Tap anywhere inside the vector map to place boundary points. Connection lines will draw automatically.'
                    }
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
                          <span className="font-semibold text-text-primary">
                            {v.lat !== undefined 
                              ? `${v.lat.toFixed(4)}°N · ${v.lng.toFixed(4)}°E` 
                              : `X: ${v.x}px · Y: ${v.y}px`
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Delivery Fee Settings Form */}
              <div className="border-t border-border pt-4 space-y-3">
                <h4 className="font-heading font-bold text-xs text-text-primary uppercase tracking-wider text-[10px]">
                  Delivery Fee Settings
                </h4>
                
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-heading font-bold text-text-secondary">
                    Base Delivery Fee (First 2 km)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs font-bold text-text-muted">₹</span>
                    <input
                      type="number"
                      value={deliveryCharge}
                      onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-1.5 border border-stone-300 rounded-input focus:outline-none focus:border-brand bg-white font-semibold text-xs text-text-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-heading font-bold text-text-secondary">
                    Min. Order Value for Delivery
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs font-bold text-text-muted">₹</span>
                    <input
                      type="number"
                      value={minOrderValue}
                      onChange={(e) => setMinOrderValue(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-1.5 border border-stone-300 rounded-input focus:outline-none focus:border-brand bg-white font-semibold text-xs text-text-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-heading font-bold text-text-secondary">
                    Extra Charge per km (After 2 km)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs font-bold text-text-muted">₹</span>
                    <input
                      type="number"
                      value={extraKmCharge}
                      onChange={(e) => setExtraKmCharge(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-1.5 border border-stone-300 rounded-input focus:outline-none focus:border-brand bg-white font-semibold text-xs text-text-primary"
                    />
                  </div>
                </div>

                <div className="border-t border-stone-100 my-2 pt-2 space-y-2">
                  <Toggle
                    checked={enableFreeDelivery}
                    onChange={setEnableFreeDelivery}
                    label="Enable Free Delivery?"
                  />
                  
                  {enableFreeDelivery && (
                    <div className="space-y-1 animate-fadeIn">
                      <label className="block text-[10px] font-heading font-bold text-text-secondary">
                        Min. Cart Value for Free Delivery
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs font-bold text-text-muted">₹</span>
                        <input
                          type="number"
                          value={freeDeliveryMinOrder}
                          onChange={(e) => setFreeDeliveryMinOrder(Number(e.target.value))}
                          className="w-full pl-7 pr-3 py-1.5 border border-stone-300 rounded-input focus:outline-none focus:border-brand bg-white font-semibold text-xs text-text-primary"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* API Key Panel */}
              <div className="border-t border-border pt-4 space-y-2">
                <h4 className="font-heading font-bold text-[10px] text-text-secondary uppercase tracking-wide flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-brand" />
                  <span>Google Maps API Key</span>
                </h4>
                <div className="flex gap-1.5">
                  <input
                    type="password"
                    placeholder="Enter Google Maps API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 border border-stone-300 rounded-input text-xs font-mono focus:outline-none focus:border-brand bg-white"
                  />
                  <button
                    onClick={handleSaveApiKey}
                    className="px-2.5 py-1.5 bg-dark hover:bg-stone-850 text-white rounded-input text-xs font-heading font-bold cursor-pointer"
                  >
                    Set
                  </button>
                </div>
                <p className="text-[8px] font-body text-text-muted leading-tight">
                  Optional. Watermarked maps will load automatically if left blank.
                </p>
              </div>

            </div>
          </div>

          {/* Right panel: Map drawing board */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-sm text-text-primary uppercase tracking-wide">
                Interactive Map Layout
              </h3>
              
              <span className={`text-[10px] font-heading font-bold px-2 py-0.5 rounded-pill border ${
                googleMapsLoaded && !mapError
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {googleMapsLoaded && !mapError ? '🗺️ Google Maps Active' : '⚠️ Fallback Vector Map'}
              </span>
            </div>

            <div className="bg-white border border-border rounded-card p-3 shadow-sm overflow-hidden">
              {googleMapsLoaded && !mapError ? (
                /* Interactive Google Map */
                <div 
                  ref={mapRef} 
                  className="w-full aspect-[4/3] rounded-card border border-stone-200 shadow-inner bg-stone-100"
                />
              ) : (
                /* Fallback Legacy SVG Vector Drawing Board */
                <div 
                  onClick={handleMapClick}
                  className="w-full aspect-[4/3] rounded-card bg-[#F6EFE6] relative overflow-hidden border border-stone-200 select-none cursor-crosshair"
                  style={{ backgroundImage: 'radial-gradient(#d3c7b3 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                >
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line x1="20" y1="50" x2="380" y2="50" stroke="#E5DAC5" strokeWidth="6" />
                    <line x1="20" y1="180" x2="380" y2="180" stroke="#E5DAC5" strokeWidth="8" />
                    <line x1="80" y1="20" x2="80" y2="280" stroke="#E5DAC5" strokeWidth="6" />
                    <line x1="300" y1="20" x2="300" y2="280" stroke="#E5DAC5" strokeWidth="8" />

                    <text x="25" y="35" fill="#a49780" fontSize="9" fontWeight="bold" fontFamily="Poppins">CIVIL LINES</text>
                    <text x="310" y="35" fill="#a49780" fontSize="9" fontWeight="bold" fontFamily="Poppins">GANDHI NAGAR</text>
                    <text x="25" y="270" fill="#a49780" fontSize="9" fontWeight="bold" fontFamily="Poppins">TRIKUTA NAGAR</text>

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

                    {mode === 'polygon' && vertices.length >= 3 && (
                      <polygon 
                        points={vertices.map(v => {
                          if (v.x !== undefined) return `${v.x},${v.y}`;
                          // Convert lat/lng back to pixel coordinates for fallback SVG
                          const x = 200 + (v.lng - 74.8570) / 0.00025;
                          const y = 150 - (v.lat - 32.7266) / 0.0002;
                          return `${x},${y}`;
                        }).join(' ')} 
                        fill="#8B0000" 
                        fillOpacity="0.1" 
                        stroke="#8B0000" 
                        strokeWidth="2" 
                        strokeDasharray="4 2" 
                      />
                    )}

                    {mode === 'polygon' && vertices.length > 0 && vertices.length < 3 && (
                      <polyline 
                        points={vertices.map(v => {
                          if (v.x !== undefined) return `${v.x},${v.y}`;
                          const x = 200 + (v.lng - 74.8570) / 0.00025;
                          const y = 150 - (v.lat - 32.7266) / 0.0002;
                          return `${x},${y}`;
                        }).join(' ')} 
                        fill="none" 
                        stroke="#8B0000" 
                        strokeWidth="2" 
                        strokeDasharray="4 2" 
                      />
                    )}
                  </svg>

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

                  {mode === 'polygon' && vertices.map((v, idx) => {
                    const left = v.x !== undefined ? `${v.x}px` : `${200 + (v.lng - 74.8570) / 0.00025}px`;
                    const top = v.y !== undefined ? `${v.y}px` : `${150 - (v.lat - 32.7266) / 0.0002}px`;
                    return (
                      <div
                        key={idx}
                        className="absolute w-3.5 h-3.5 rounded-full bg-gold border-2 border-white shadow cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-30 hover:scale-125 transition-transform"
                        style={{ left, top }}
                      />
                    );
                  })}
                </div>
              )}
              
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
