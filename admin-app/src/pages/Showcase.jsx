import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { useScopeStore } from '../store/scopeStore';
import { useStoreRegistry } from '../store/storeRegistry';
import { AdminLayout } from '../components/shared/AdminLayout';
import { KpiCard } from '../components/ui/KpiCard';
import { DataTable } from '../components/ui/DataTable';
import { 
  IndianRupee, ShoppingBag, Store, Clock, 
  Phone, MapPin, User, ArrowRight
} from 'lucide-react';

export const Showcase = () => {
  const navigate = useNavigate();
  const { role, user } = useAuthStore();
  const { addToast } = useUiStore();
  const { setFranchiseScope, setStoreScope } = useScopeStore();
  const { franchises, stores } = useStoreRegistry();

  const [selectedFranchiseId, setSelectedFranchiseId] = useState(null);
  const [storePage, setStorePage] = useState(1);

  const columns = [
    { key: 'id', header: 'Franchise ID', sortable: true },
    { 
      key: 'name', 
      header: 'Group Name & Address', 
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-heading font-bold text-text-primary text-xs">{row.name}</span>
          <span className="text-[9px] text-text-secondary font-body truncate max-w-xs">{row.address || 'No Address'}</span>
        </div>
      )
    },
    { key: 'ownerName', header: 'Owner', sortable: true },
    { key: 'district', header: 'District (J&K)', sortable: true },
    { key: 'phone', header: 'Mobile Number', sortable: false },
    { key: 'email', header: 'Contact Email', sortable: false },
    { 
      key: 'storeCount', 
      header: 'Assigned Stores', 
      sortable: true,
      render: (row) => {
        const count = stores.filter(s => s.franchiseId === row.id).length;
        return (
          <div className="flex items-center gap-1.5 font-bold">
            <Store className="w-3.5 h-3.5 text-brand shrink-0" />
            <span>{count} {count === 1 ? 'Store' : 'Stores'}</span>
          </div>
        );
      }
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-white p-5 rounded-card border border-border shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-base font-heading font-extrabold text-text-primary">
              HQ Dashboard
            </h1>
            <p className="text-[10px] font-body text-text-secondary mt-0.5">
              Overview of system revenue, orders, and active franchise outlets across J&K
            </p>
          </div>
          <div className="bg-brand/5 border border-brand/10 px-3 py-1.5 rounded-card text-right">
            <span className="text-[9px] font-heading font-bold text-brand uppercase block">Active Session</span>
            <span className="text-[10px] font-body font-semibold text-text-primary">{user?.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KpiCard 
            title="Total Revenue" 
            value="₹1,24,500" 
            icon={IndianRupee} 
            trend={{ type: 'up', value: '+12.4%', label: 'vs yesterday' }}
          />
          <KpiCard 
            title="Total Orders" 
            value="342" 
            icon={ShoppingBag} 
            trend={{ type: 'up', value: '+8.2%', label: 'vs last week' }}
          />
          <KpiCard 
            title="Active Outlets" 
            value="8 / 9" 
            icon={Store} 
            trend={{ type: 'down', value: '-1', label: 'Ahmedabad offline' }}
          />
          <KpiCard 
            title="Avg Prep Time" 
            value="18 mins" 
            icon={Clock} 
            description="Operational Target: 15m"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-xs text-text-primary uppercase tracking-wider">
              Franchise Networks
            </h3>
            <span className="text-[10px] font-body text-text-secondary bg-stone-150 px-2 py-0.5 rounded-pill border border-stone-250">
              Click a row to expand and view assigned stores
            </span>
          </div>
          <DataTable 
            columns={columns}
            data={franchises}
            pageSize={5}
            searchKey={['id', 'name', 'ownerName', 'district', 'email', 'phone', 'address']}
            searchPlaceholder="Search by ID, name, owner, contact..."
            onRowClick={(row) => { setSelectedFranchiseId(row.id === selectedFranchiseId ? null : row.id); setStorePage(1); }}
            selectedRowId={selectedFranchiseId}
            expandableRowRender={(row) => {
              const franchiseStores = stores.filter(s => s.franchiseId === row.id);
              const itemsPerPage = 10;
              const totalPages = Math.ceil(franchiseStores.length / itemsPerPage);
              const startIndex = (storePage - 1) * itemsPerPage;
              const paginatedStores = franchiseStores.slice(startIndex, startIndex + itemsPerPage);

              return (
                <div className="animate-fadeIn">
                  <div className="flex justify-between items-center mb-3 border-b border-stone-200 pb-2">
                    <span className="text-[10px] font-heading font-bold text-text-primary flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-brand" />
                      <span>Stores under {row.name}</span>
                    </span>
                    <span className="text-[9px] font-heading font-bold text-text-secondary bg-stone-100 px-2 py-0.5 rounded-pill">
                      {franchiseStores.length} {franchiseStores.length === 1 ? 'Store' : 'Stores'}
                    </span>
                  </div>
                  
                  {franchiseStores.length > 0 ? (
                    <div className="space-y-4">
                      {/* Scrollable container for cards */}
                      <div className="max-h-[380px] overflow-y-auto pr-1.5 space-y-1 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {paginatedStores.map(store => (
                            <div key={store.id} className="p-3 bg-white border border-stone-200 rounded-card shadow-sm hover:shadow transition-all flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start gap-2">
                                  <span className="font-heading font-bold text-[11px] text-text-primary">{store.name}</span>
                                  <span className={`px-2 py-0.5 rounded-pill text-[8px] font-bold border shrink-0 ${
                                    store.status === 'Open' 
                                      ? 'bg-green-50 text-success border-success/20' 
                                      : store.status === 'Paused' 
                                        ? 'bg-amber-50 text-gold border-gold/20' 
                                        : 'bg-red-50 text-danger border-danger/20'
                                  }`}>
                                    {store.status}
                                  </span>
                                </div>
                                <div className="mt-2 space-y-1 text-[9px] text-text-secondary font-body">
                                  <p className="flex items-center gap-1">
                                    <User className="w-3 h-3 text-text-muted shrink-0" />
                                    <span><strong>Manager:</strong> {store.managerName}</span>
                                  </p>
                                  <p className="flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-text-muted shrink-0" />
                                    <span><strong>Phone:</strong> {store.phone}</span>
                                  </p>
                                  <p className="flex items-start gap-1">
                                    <MapPin className="w-3 h-3 text-text-muted shrink-0 mt-0.5" />
                                    <span className="line-clamp-2"><strong>Address:</strong> {store.address}, {store.city}</span>
                                  </p>
                                </div>
                              </div>
                              
                              <div className="mt-3 pt-2 border-t border-stone-100 flex justify-end">
                                <button
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      setFranchiseScope(row.id);
                                      setStoreScope(store.id);
                                      addToast(`Act on behalf of ${store.name}`, 'success');
                                      navigate('/store');
                                    }}
                                  className="px-2.5 py-1 bg-brand hover:bg-brand-accent text-white font-heading font-semibold rounded-pill text-[8px] shadow-sm flex items-center gap-0.5 cursor-pointer transition-colors active:scale-95 animate-pulse"
                                  style={{ animationDuration: '3s' }}
                                >
                                  <span>Manage Portal</span>
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                            ))}
                        </div>
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-stone-200 pt-3">
                          <span className="text-[10px] text-text-secondary font-body">
                            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, franchiseStores.length)} of {franchiseStores.length} stores
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              disabled={storePage === 1}
                              onClick={() => setStorePage(prev => Math.max(prev - 1, 1))}
                              className="px-2.5 py-1 text-[10px] font-heading font-semibold rounded bg-stone-100 hover:bg-stone-200 disabled:opacity-50 disabled:hover:bg-stone-100 text-text-secondary transition-all cursor-pointer disabled:cursor-not-allowed"
                            >
                              Previous
                            </button>
                            <span className="px-2.5 py-1 text-[10px] font-heading font-semibold text-text-primary bg-stone-50 border border-stone-200 rounded">
                              Page {storePage} of {totalPages}
                            </span>
                            <button
                              type="button"
                              disabled={storePage === totalPages}
                              onClick={() => setStorePage(prev => Math.min(prev + 1, totalPages))}
                              className="px-2.5 py-1 text-[10px] font-heading font-semibold rounded bg-stone-100 hover:bg-stone-200 disabled:opacity-50 disabled:hover:bg-stone-100 text-text-secondary transition-all cursor-pointer disabled:cursor-not-allowed"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-text-muted font-medium bg-white rounded-card border border-stone-200 border-dashed text-[10px]">
                      No stores available
                    </div>
                  )}
                </div>
              );
            }}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Showcase;
