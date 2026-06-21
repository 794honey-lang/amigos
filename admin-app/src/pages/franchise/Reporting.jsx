import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useStoreRegistry } from '../../store/storeRegistry';
import { AdminLayout } from '../../components/shared/AdminLayout';
import { KpiCard } from '../../components/ui/KpiCard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { 
  IndianRupee, TrendingUp, TrendingDown, Percent, 
  Calendar, FileText, Download, Store 
} from 'lucide-react';

export const Reporting = () => {
  const { scope } = useAuthStore();
  const activeFranchiseId = scope.franchiseId || 'fr_001';
  const allStores = useStoreRegistry(state => state.stores);
  const franchiseStores = allStores.filter(s => s.franchiseId === activeFranchiseId);

  // State
  const [selectedStore, setSelectedStore] = useState('all');
  const [dateRange, setDateRange] = useState('7days');

  // Dynamic chart data scoped to franchise stores
  const storeComparisonData = franchiseStores.map(store => {
    // Generate deterministic mock sales based on store ID
    const numId = parseInt(store.id.replace('store_', ''), 10) || 1;
    const sales = (numId % 5) * 20000 + 50000;
    const orders = Math.floor(sales / 520);
    return {
      id: store.id,
      name: store.name,
      sales,
      orders
    };
  });

  const filteredComparisonData = selectedStore === 'all'
    ? storeComparisonData
    : storeComparisonData.filter(d => d.id === selectedStore);

  const totalRevenue = filteredComparisonData.reduce((sum, d) => sum + d.sales, 0);

  const salesTrendData = [
    { name: 'Mon', sales: Math.floor(totalRevenue * 0.1), margin: Math.floor(totalRevenue * 0.05) },
    { name: 'Tue', sales: Math.floor(totalRevenue * 0.12), margin: Math.floor(totalRevenue * 0.06) },
    { name: 'Wed', sales: Math.floor(totalRevenue * 0.11), margin: Math.floor(totalRevenue * 0.055) },
    { name: 'Thu', sales: Math.floor(totalRevenue * 0.14), margin: Math.floor(totalRevenue * 0.07) },
    { name: 'Fri', sales: Math.floor(totalRevenue * 0.19), margin: Math.floor(totalRevenue * 0.095) },
    { name: 'Sat', sales: Math.floor(totalRevenue * 0.22), margin: Math.floor(totalRevenue * 0.11) },
    { name: 'Sun', sales: Math.floor(totalRevenue * 0.11), margin: Math.floor(totalRevenue * 0.055) }
  ];

  const handleExportCSV = () => {
    // Generate mock CSV blob
    const csvContent = "Store,Sales,Orders\n" + 
      filteredComparisonData.map(d => `"${d.name}",${d.sales},${d.orders}`).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `franchise-report-${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-card border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-heading font-extrabold text-text-primary">
              Franchise Reporting & Analytics
            </h1>
            <p className="text-[10px] font-body text-text-secondary mt-0.5">
              Analyze network sales charts, labor cost multipliers, and P&L gross margins
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
        <div className="bg-white border border-border p-4 rounded-card shadow-sm flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-heading font-bold text-text-secondary w-full md:w-auto">
            <Calendar className="w-4.5 h-4.5 text-brand shrink-0" />
            <span>Time Range:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-1.5 border border-stone-300 rounded-input focus:outline-none focus:border-brand bg-white font-semibold"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="thismonth">This Month</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-heading font-bold text-text-secondary w-full md:w-auto">
            <Store className="w-4.5 h-4.5 text-brand shrink-0" />
            <span>Filter Store:</span>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="px-3 py-1.5 border border-stone-300 rounded-input focus:outline-none focus:border-brand bg-white font-semibold"
            >
              <option value="all">All Franchise Stores</option>
              {franchiseStores.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* P&L aggregate cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KpiCard 
            title="Total Revenue" 
            value="₹3,20,300" 
            icon={IndianRupee} 
            description="Gross sales across branches"
          />
          <KpiCard 
            title="Food Costs (Est. 30%)" 
            value="₹96,090" 
            icon={TrendingDown} 
            description="Ingredients & prep supplies"
          />
          <KpiCard 
            title="Labor Costs (Est. 20%)" 
            value="₹64,060" 
            icon={TrendingDown} 
            description="Staff wages & payouts"
          />
          <KpiCard 
            title="Net Margin (Est. 50%)" 
            value="₹1,60,150" 
            icon={TrendingUp} 
            trend={{ type: 'up', value: '50%', label: 'Gross Margins' }}
          />
        </div>

        {/* Recharts Graphical Plots */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Outlet Comparison Bar Chart */}
          <div className="bg-white border border-border p-5 rounded-card shadow-sm space-y-3">
            <h3 className="font-heading font-extrabold text-xs text-text-primary uppercase tracking-wide">
              Store-by-Store Sales Comparison
            </h3>
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={storeComparisonData}
                  margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1EADF" />
                  <XAxis dataKey="name" stroke="#6B6B6B" tickSize={4} />
                  <YAxis stroke="#6B6B6B" />
                  <Tooltip cursor={{ fill: '#FBF3E9' }} />
                  <Bar dataKey="sales" fill="#8B0000" name="Revenue (₹)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Trend Line Chart */}
          <div className="bg-white border border-border p-5 rounded-card shadow-sm space-y-3">
            <h3 className="font-heading font-extrabold text-xs text-text-primary uppercase tracking-wide">
              Weekly Revenue & Margin Trends
            </h3>
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesTrendData}
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

      </div>
    </AdminLayout>
  );
};

export default Reporting;
