import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useStoreRegistry } from '../../store/storeRegistry';
import { useScopeStore } from '../../store/scopeStore';
import { AdminLayout } from '../../components/shared/AdminLayout';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { KpiCard } from '../../components/ui/KpiCard';
import { 
  Users, Plus, Edit3, Trash2, MapPin, Mail, Phone,
  Building2, Store, CheckCircle, Info, ArrowRight, User
} from 'lucide-react';

export const Franchises = () => {
  const navigate = useNavigate();
  const { addToast } = useUiStore();
  const { franchises, stores, addFranchise, updateFranchise, deleteFranchise } = useStoreRegistry();
  const { setFranchiseScope, setStoreScope } = useScopeStore();

  // Selected franchise for showing stores list
  const [selectedFranchiseId, setSelectedFranchiseId] = useState(null);
  const [storePage, setStorePage] = useState(1);

  // CRUD Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFranchise, setEditingFranchise] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formOwner, setFormOwner] = useState('');
  const [formDistrict, setFormDistrict] = useState('Jammu');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');

  const resetForm = () => {
    setFormName('');
    setFormOwner('');
    setFormDistrict('Jammu');
    setFormEmail('');
    setFormPhone('');
    setFormAddress('');
    setEditingFranchise(null);
  };

  const handleAddFranchiseSubmit = (e) => {
    e.preventDefault();
    if (!formName || !formOwner || !formEmail || !formPhone || !formAddress) {
      addToast('Please fill out all required fields', 'error');
      return;
    }

    addFranchise({
      name: formName,
      ownerName: formOwner,
      district: formDistrict,
      email: formEmail,
      phone: formPhone,
      address: formAddress
    });

    addToast(`Successfully onboarded franchise: ${formName}`, 'success');
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditFranchiseClick = (franchise) => {
    setEditingFranchise(franchise);
    setFormName(franchise.name);
    setFormOwner(franchise.ownerName);
    setFormDistrict(franchise.district || 'Jammu');
    setFormEmail(franchise.email);
    setFormPhone(franchise.phone || '');
    setFormAddress(franchise.address || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateFranchiseSubmit = (e) => {
    e.preventDefault();
    if (!formName || !formOwner || !formEmail || !formPhone || !formAddress) {
      addToast('Please fill out all required fields', 'error');
      return;
    }

    updateFranchise(editingFranchise.id, {
      name: formName,
      ownerName: formOwner,
      district: formDistrict,
      email: formEmail,
      phone: formPhone,
      address: formAddress
    });

    addToast(`Successfully updated franchise: ${formName}`, 'success');
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleDeleteFranchiseClick = (franchiseId, franchiseName) => {
    const associatedStores = stores.filter(s => s.franchiseId === franchiseId);
    const storeCount = associatedStores.length;
    
    let confirmMessage = `Are you sure you want to delete the franchise "${franchiseName}"?`;
    if (storeCount > 0) {
      confirmMessage += `\n\nWARNING: This franchise currently controls ${storeCount} stores (e.g. ${associatedStores.map(s => s.name).join(', ')}). Deleting this franchise will also permanently delete all associated stores, operating schedules, and delivery boundaries. This action cannot be undone.`;
    }

    if (window.confirm(confirmMessage)) {
      deleteFranchise(franchiseId);
      if (selectedFranchiseId === franchiseId) {
        setSelectedFranchiseId(null);
      }
      addToast(`Deleted franchise "${franchiseName}" and all associated stores.`, 'warning');
    }
  };

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
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2 items-center">
          <button
            onClick={() => handleEditFranchiseClick(row)}
            className="p-1 hover:bg-stone-100 text-text-secondary rounded-card border border-stone-200 cursor-pointer"
            title="Edit Details"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeleteFranchiseClick(row.id, row.name)}
            className="p-1 hover:bg-red-50 text-danger rounded-card border border-red-150 cursor-pointer"
            title="Delete Franchise"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  // Dynamic KPIs calculations
  const totalFranchises = franchises.length;
  const activeStores = stores.filter(s => s.status === 'Open').length;
  const totalStores = stores.length;
  const uniqueDistricts = [...new Set(franchises.map(f => f.district || 'Jammu'))].length;

  const jkDistricts = [
    'Jammu', 'Srinagar', 'Samba', 'Kathua', 'Udhampur', 
    'Reasi', 'Anantnag', 'Baramulla', 'Pulwama', 'Kupwara',
    'Budgam', 'Doda', 'Ganderbal', 'Kishtwar', 'Kulgam', 
    'Poonch', 'Ramban', 'Rajouri', 'Shopian', 'Bandipora'
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-card border border-border shadow-sm flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
          <div>
            <h1 className="text-base font-heading font-extrabold text-text-primary">
              Franchises Management
            </h1>
            <p className="text-[10px] font-body text-text-secondary mt-0.5">
              Onboard regional franchise groups, configure partners, and oversee J&K district outlets
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-brand hover:bg-brand-accent text-white font-heading font-semibold rounded-pill text-xs shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Franchise</span>
          </button>
        </div>

        {/* Dynamic KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard 
            title="Franchise Networks" 
            value={totalFranchises} 
            icon={Building2} 
            description="Active regional groups"
          />
          <KpiCard 
            title="Store Coverage" 
            value={`${activeStores} / ${totalStores} Online`} 
            icon={Store} 
            description="Operational counter portals"
          />
          <KpiCard 
            title="Districts Covered" 
            value={`${uniqueDistricts} J&K Districts`} 
            icon={MapPin} 
            description="Jammu, Srinagar, Samba, etc."
          />
        </div>

        {/* Database Table */}
        <div className="space-y-3">
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

      {/* Onboard Franchise Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); resetForm(); }}
        title="Onboard Franchise Partner"
      >
        <form onSubmit={handleAddFranchiseSubmit} className="space-y-4 text-xs font-body text-text-secondary">
          <div className="space-y-1">
            <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Franchise Group Name</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. East India Amigos"
              className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Owner Name</label>
              <input
                type="text"
                required
                value={formOwner}
                onChange={(e) => setFormOwner(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Mobile Number</label>
              <input
                type="text"
                required
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="e.g. 9419123456"
                className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">District (J&K)</label>
              <select
                value={formDistrict}
                onChange={(e) => setFormDistrict(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-semibold bg-white"
              >
                {jkDistricts.map(dist => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Contact Email</label>
              <input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="e.g. ramesh@amigos.in"
                className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Full Address</label>
            <textarea
              required
              rows="2"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              placeholder="e.g. Shop 12, Gandhi Nagar, Jammu, J&K - 180004"
              className="w-full px-3 py-1.5 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body resize-none"
            />
          </div>

          <div className="pt-4 flex justify-between border-t border-border">
            <button
              type="button"
              onClick={() => { setIsAddModalOpen(false); resetForm(); }}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-text-secondary font-heading font-semibold rounded-pill cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand hover:bg-brand-accent text-white font-heading font-semibold rounded-pill shadow-md cursor-pointer"
            >
              Onboard Franchise
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Franchise Modal */}
      {editingFranchise && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); resetForm(); }}
          title={`Edit Franchise: ${editingFranchise.name}`}
        >
          <form onSubmit={handleUpdateFranchiseSubmit} className="space-y-4 text-xs font-body text-text-secondary">
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Franchise Group Name</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. East India Amigos"
                className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Owner Name</label>
                <input
                  type="text"
                  required
                  value={formOwner}
                  onChange={(e) => setFormOwner(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Mobile Number</label>
                <input
                  type="text"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="e.g. 9419123456"
                  className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">District (J&K)</label>
                <select
                  value={formDistrict}
                  onChange={(e) => setFormDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-semibold bg-white"
                >
                  {jkDistricts.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Contact Email</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. ramesh@amigos.in"
                  className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Full Address</label>
              <textarea
                required
                rows="2"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="e.g. Shop 12, Gandhi Nagar, Jammu, J&K - 180004"
                className="w-full px-3 py-1.5 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body resize-none"
              />
            </div>

            <div className="pt-4 flex justify-between border-t border-border">
              <button
                type="button"
                onClick={() => { setIsEditModalOpen(false); resetForm(); }}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-text-secondary font-heading font-semibold rounded-pill cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand hover:bg-brand-accent text-white font-heading font-semibold rounded-pill shadow-md cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AdminLayout>
  );
};

export default Franchises;
