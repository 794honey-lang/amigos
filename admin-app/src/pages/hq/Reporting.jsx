import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStoreRegistry } from '../../store/storeRegistry';
import { useUiStore } from '../../store/uiStore';
import { AdminLayout } from '../../components/shared/AdminLayout';
import { KpiCard } from '../../components/ui/KpiCard';
import { MultiSelect } from '../../components/ui/MultiSelect';
import { mockOrders } from '../../mocks/mockOrders';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { 
  IndianRupee, ShoppingBag, Store, Clock, 
  Calendar, Building2, Download, TrendingUp, TrendingDown 
} from 'lucide-react';

export const Reporting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useUiStore();
  const { franchises, stores } = useStoreRegistry();

  // Filters state
  const [dateRange, setDateRange] = useState('30days');
  const [selectedFranchises, setSelectedFranchises] = useState(['all']);
  const [selectedStores, setSelectedStores] = useState(['all']);
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

  // Handle preset redirection parameter from HQ dashboard
  useEffect(() => {
    if (location.state && location.state.kpi) {
      addToast(`Showing reports context for ${location.state.kpi}`, 'info');
    }
  }, [location.state]);

  // Clean filtered stores list based on franchise selection
  const availableStores = selectedFranchises.includes('all')
    ? stores
    : stores.filter(s => selectedFranchises.includes(s.franchiseId));

  // When franchises change, filter selected stores to only those that are under active franchises
  useEffect(() => {
    if (!selectedFranchises.includes('all')) {
      setSelectedStores(prev => {
        const next = prev.filter(id => {
          if (id === 'all') return true;
          const store = stores.find(s => s.id === id);
          return store && selectedFranchises.includes(store.franchiseId);
        });
        return next.length === 0 ? ['all'] : next;
      });
    }
  }, [selectedFranchises]);

  // Calculations helper based on mock data
  const getReportingData = () => {
    // 1. Get filtered store IDs
    let targetStoreIds = availableStores.map(s => s.id);
    if (!selectedStores.includes('all')) {
      targetStoreIds = selectedStores.filter(id => targetStoreIds.includes(id));
    }

    // 2. Filter orders
    const filteredOrders = mockOrders.filter(o => targetStoreIds.includes(o.storeId));
    
    // Scale factors based on date range mock simulation
    let scale = 1.0;
    if (dateRange === '7days') scale = 0.25;
    else if (dateRange === 'thismonth') scale = 0.8;
    else if (dateRange === 'alltime') scale = 2.4;
    else if (dateRange === 'custom') {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end - start;
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
      scale = diffDays / 30.0;
    }

    const totalOrdersCount = Math.round(filteredOrders.length * scale) || 12;
    const completedOrders = filteredOrders.filter(o => o.status === 'Delivered');
    const baseRevenue = completedOrders.reduce((sum, o) => sum + o.toPay, 0) || 5000;
    const totalRevenueAmount = Math.round(baseRevenue * scale);

    // Active stores ratio
    const activeCount = availableStores.filter(s => s.status === 'Open').length;
    const totalCount = availableStores.length;

    return {
      revenue: totalRevenueAmount,
      orders: totalOrdersCount,
      activeRatio: `${activeCount} / ${totalCount}`,
      avgPrepTime: '17 mins',
      scale
    };
  };

  const metrics = getReportingData();

  // 3. Franchise Comparison Chart Data
  const filteredFranchises = selectedFranchises.includes('all')
    ? franchises
    : franchises.filter(f => selectedFranchises.includes(f.id));

  const franchiseChartData = filteredFranchises.map(f => {
    const fStores = stores.filter(s => s.franchiseId === f.id);
    const storeIds = fStores.map(s => s.id);
    const fOrders = mockOrders.filter(o => storeIds.includes(o.storeId));
    const completed = fOrders.filter(o => o.status === 'Delivered');
    const baseRev = completed.reduce((sum, o) => sum + o.toPay, 0) || 2000;
    
    return {
      name: f.name.replace(' Group', '').replace(' Amigos', ''),
      sales: Math.round(baseRev * metrics.scale),
      orders: Math.round(fOrders.length * metrics.scale)
    };
  });

  // 4. Store Comparison Chart Data (top stores under current filter)
  const filteredStoresForChart = selectedStores.includes('all')
    ? availableStores
    : availableStores.filter(s => selectedStores.includes(s.id));

  const storeChartData = filteredStoresForChart.map(store => {
    const sOrders = mockOrders.filter(o => o.storeId === store.id);
    const completed = sOrders.filter(o => o.status === 'Delivered');
    const baseRev = completed.reduce((sum, o) => sum + o.toPay, 0) || 500;

    return {
      name: store.name.split(',')[0],
      sales: Math.round(baseRev * metrics.scale),
      orders: Math.round(sOrders.length * metrics.scale)
    };
  });

  // 5. Sales Trend Data
  const trendData = [
    { name: 'Week 1', sales: Math.floor(metrics.revenue * 0.2), margin: Math.floor(metrics.revenue * 0.1) },
    { name: 'Week 2', sales: Math.floor(metrics.revenue * 0.28), margin: Math.floor(metrics.revenue * 0.14) },
    { name: 'Week 3', sales: Math.floor(metrics.revenue * 0.22), margin: Math.floor(metrics.revenue * 0.11) },
    { name: 'Week 4', sales: Math.floor(metrics.revenue * 0.3), margin: Math.floor(metrics.revenue * 0.15) }
  ];

  // CSV Export Handler
  const handleExportCSV = () => {
    const csvContent = "Entity,Sales,Orders\n" + 
      (selectedFranchises.includes('all') && selectedStores.includes('all')
        ? franchiseChartData.map(d => `"${d.name}",${d.sales},${d.orders}`).join("\n")
        : storeChartData.map(d => `"${d.name}",${d.sales},${d.orders}`).join("\n"));
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const rangeName = dateRange === 'custom' ? `${startDate}-to-${endDate}` : dateRange;
    link.setAttribute("download", `network-reporting-${rangeName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('CSV exported successfully', 'success');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-card border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-heading font-extrabold text-text-primary">
              HQ Reports
            </h1>
            <p className="text-[10px] font-body text-text-secondary mt-0.5">
              Consolidated brand revenue metrics, regional franchise ratios, and prep speeds
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 border border-stone-250 hover:bg-stone-50 text-text-secondary font-heading font-semibold rounded-pill text-xs flex items-center gap-1.5 cursor-pointer shadow-sm bg-white"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white border border-border p-4 rounded-card shadow-sm flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-heading font-bold text-text-secondary">
            <Calendar className="w-4 h-4 text-brand shrink-0" />
            <span>Time:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-1.5 border border-stone-300 rounded-input focus:outline-none focus:border-brand bg-white font-semibold"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="thismonth">This Month</option>
              <option value="alltime">All Time</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {dateRange === 'custom' && (
            <div className="flex items-center gap-2 text-xs font-heading font-bold text-text-secondary animate-fadeIn">
              <span>From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2 py-1 border border-stone-300 rounded-input focus:outline-none focus:border-brand bg-white font-semibold"
              />
              <span>To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2 py-1 border border-stone-300 rounded-input focus:outline-none focus:border-brand bg-white font-semibold"
              />
            </div>
          )}

          <div className="flex items-center gap-2 text-xs font-heading font-bold text-text-secondary">
            <Building2 className="w-4 h-4 text-brand shrink-0" />
            <span>Franchise Group:</span>
            <MultiSelect
              label="Franchise"
              options={franchises}
              selectedValues={selectedFranchises}
              onChange={setSelectedFranchises}
              placeholder="Select Franchises..."
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-heading font-bold text-text-secondary">
            <Store className="w-4 h-4 text-brand shrink-0" />
            <span>Outlet:</span>
            <MultiSelect
              label="Outlet"
              options={availableStores}
              selectedValues={selectedStores}
              onChange={setSelectedStores}
              placeholder="Select Outlets..."
            />
          </div>
        </div>

        {/* Aggregate KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KpiCard 
            title="Consolidated Revenue" 
            value={`₹${metrics.revenue.toLocaleString('en-IN')}`}
            icon={IndianRupee} 
            description="Sum of gross customer orders"
          />
          <KpiCard 
            title="Consolidated Orders" 
            value={metrics.orders} 
            icon={ShoppingBag} 
            description="Number of checkout orders"
          />
          <KpiCard 
            title="Active Stores Ratio" 
            value={metrics.activeRatio} 
            icon={Store} 
            description="Outlets status currently online"
          />
          <KpiCard 
            title="Average Prep Speed" 
            value={metrics.avgPrepTime} 
            icon={Clock} 
            description="Target operational benchmark"
          />
        </div>

        {/* Graphical Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Comparison chart */}
          <div className="bg-white border border-border p-5 rounded-card shadow-sm space-y-3">
            <h3 className="font-heading font-extrabold text-xs text-text-primary uppercase tracking-wide">
              {selectedFranchises.includes('all') && selectedStores.includes('all') ? 'Franchise-wise Sales Comparison' : 'Store-wise Sales Comparison'}
            </h3>
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={selectedFranchises.includes('all') && selectedStores.includes('all') ? franchiseChartData : storeChartData}
                  margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1EADF" />
                  <XAxis dataKey="name" stroke="#6B6B6B" tickSize={4} />
                  <YAxis stroke="#6B6B6B" />
                  <Tooltip cursor={{ fill: '#FBF3E9' }} />
                  <Bar dataKey="sales" fill="#8B0000" name="Gross Revenue (₹)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-white border border-border p-5 rounded-card shadow-sm space-y-3">
            <h3 className="font-heading font-extrabold text-xs text-text-primary uppercase tracking-wide">
              Weekly Revenue & Margin Trends
            </h3>
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1EADF" />
                  <XAxis dataKey="name" stroke="#6B6B6B" />
                  <YAxis stroke="#6B6B6B" />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Line type="monotone" dataKey="sales" stroke="#8B0000" strokeWidth={3} name="Total Sales" />
                  <Line type="monotone" dataKey="margin" stroke="#D4A017" strokeWidth={2} name="Net Margins" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown List */}
        <div className="bg-white border border-border rounded-card p-5 shadow-sm space-y-4">
          <h3 className="font-heading font-extrabold text-xs text-text-primary uppercase tracking-wide border-b border-border pb-2.5">
            Network Entities Data Table
          </h3>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-text-muted font-heading font-extrabold uppercase text-[9px] tracking-wider bg-stone-50">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Sales (₹)</th>
                  <th className="py-2.5 px-3">Orders</th>
                  <th className="py-2.5 px-3">Target Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-body">
                {(selectedFranchises.includes('all') && selectedStores.includes('all') ? franchiseChartData : storeChartData).map((d, index) => (
                  <tr key={index} className="hover:bg-stone-50/50">
                    <td className="py-2.5 px-3 font-heading font-bold text-text-primary">{d.name}</td>
                    <td className="py-2.5 px-3 font-heading font-semibold text-brand">₹{d.sales.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-text-secondary">{d.orders} orders</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-green-50 text-success border border-success/10 px-2 py-0.5 rounded text-[10px] font-bold">
                        ⭐ 4.8 Excellent
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reporting;
