import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useScopeStore } from '../../store/scopeStore';
import { useUiStore } from '../../store/uiStore';
import { useStoreRegistry } from '../../store/storeRegistry';
import { AdminLayout } from '../../components/shared/AdminLayout';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { 
  Store, MapPin, Phone, User, Clock, ShieldCheck, 
  ArrowRight, Landmark, CreditCard, Smartphone, Info,
  Plus, Edit3, Trash2
} from 'lucide-react';

export const Stores = () => {
  const navigate = useNavigate();
  const { scope } = useAuthStore();
  const { currentStoreId, setStoreScope, resetScope } = useScopeStore();
  const { addToast } = useUiStore();
  const { stores, addStore, updateStore, deleteStore, storeHours, deliveryZones } = useStoreRegistry();

  const activeFranchiseId = scope.franchiseId || 'fr_001';
  const franchiseStores = stores.filter(s => s.franchiseId === activeFranchiseId);

  // Detail preview state
  const [selectedStore, setSelectedStore] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // CRUD Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formManager, setFormManager] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStatus, setFormStatus] = useState('Open');

  const resetForm = () => {
    setFormName('');
    setFormCity('');
    setFormAddress('');
    setFormManager('');
    setFormPhone('');
    setFormStatus('Open');
    setEditingStore(null);
  };

  const handleManageStore = (storeId, storeName) => {
    setStoreScope(storeId);
    addToast(`Drilled scope context down to ${storeName}`, 'success');
    navigate('/store');
  };

  const handleViewStoreDetails = (store) => {
    setSelectedStore(store);
    setIsPreviewOpen(true);
  };

  const handleAddStoreSubmit = (e) => {
    e.preventDefault();
    if (!formName || !formCity || !formAddress || !formManager || !formPhone) {
      addToast('Please fill out all fields', 'error');
      return;
    }
    
    addStore({
      franchiseId: activeFranchiseId,
      name: formName,
      city: formCity,
      address: formAddress,
      managerName: formManager,
      phone: formPhone,
      status: formStatus
    });

    addToast(`Successfully onboarded store: ${formName}`, 'success');
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditStoreClick = (store) => {
    setEditingStore(store);
    setFormName(store.name);
    setFormCity(store.city);
    setFormAddress(store.address);
    setFormManager(store.managerName);
    setFormPhone(store.phone);
    setFormStatus(store.status);
    setIsEditModalOpen(true);
  };

  const handleUpdateStoreSubmit = (e) => {
    e.preventDefault();
    if (!formName || !formCity || !formAddress || !formManager || !formPhone) {
      addToast('Please fill out all fields', 'error');
      return;
    }

    updateStore(editingStore.id, {
      name: formName,
      city: formCity,
      address: formAddress,
      managerName: formManager,
      phone: formPhone,
      status: formStatus
    });

    addToast(`Successfully updated store: ${formName}`, 'success');
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleDeleteStoreClick = (storeId, storeName) => {
    const confirmMessage = `Are you sure you want to delete store "${storeName}"?\n\nWARNING: This will permanently delete the store profile, operating hours schedule, and delivery zones. This action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      deleteStore(storeId);

      // If the deleted store was currently active in the drill-down scope, reset the scope
      if (currentStoreId === storeId) {
        resetScope();
        navigate('/franchise');
      }

      addToast(`Successfully deleted store: ${storeName}`, 'warning');
    }
  };

  const columns = [
    { key: 'id', header: 'Store ID', sortable: true },
    { key: 'name', header: 'Store Name', sortable: true },
    { key: 'managerName', header: 'Manager', sortable: true },
    { key: 'phone', header: 'Phone', sortable: false },
    { 
      key: 'status', 
      header: 'Status', 
      sortable: true,
      render: (row) => (
        <span className={`px-2 py-0.5 rounded-pill text-[10px] font-bold border ${
          row.status === 'Open' 
            ? 'bg-green-50 text-success border-success/20' 
            : row.status === 'Paused' 
              ? 'bg-amber-50 text-gold border-gold/20' 
              : 'bg-red-50 text-danger border-danger/20'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2 items-center">
          <button
            onClick={() => handleViewStoreDetails(row)}
            className="px-2 py-1 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-text-secondary text-[10px] font-heading font-semibold rounded-card transition-colors cursor-pointer"
          >
            Settings Overview
          </button>
          <button
            onClick={() => handleEditStoreClick(row)}
            className="p-1 hover:bg-stone-100 text-text-secondary rounded-card border border-stone-200 cursor-pointer"
            title="Edit Details"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeleteStoreClick(row.id, row.name)}
            className="p-1 hover:bg-red-50 text-danger rounded-card border border-red-150 cursor-pointer"
            title="Delete Store"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleManageStore(row.id, row.name)}
            className="px-2.5 py-1 bg-brand/10 hover:bg-brand/20 text-brand text-[10px] font-heading font-semibold rounded-card transition-colors cursor-pointer"
          >
            Manage Portal
          </button>
        </div>
      )
    }
  ];

  // Resolve store schedule and limits for selected details
  const getStoreMeta = (storeId) => {
    const hours = storeHours.find(h => h.storeId === storeId) || storeHours[0];
    const zone = deliveryZones.find(z => z.storeId === storeId) || deliveryZones[0];
    return { hours, zone };
  };

  const storeMeta = selectedStore ? getStoreMeta(selectedStore.id) : null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-card border border-border shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-base font-heading font-extrabold text-text-primary">
              Stores Registry
            </h1>
            <p className="text-[10px] font-body text-text-secondary mt-0.5">
              Review store performance snapshots and configure overrides on behalf of branches
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-brand hover:bg-brand-accent text-white font-heading font-semibold rounded-pill text-xs shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Store</span>
          </button>
        </div>

        {/* Database Table */}
        <div className="space-y-3">
          <DataTable 
            columns={columns}
            data={franchiseStores}
            pageSize={5}
            searchKey={['id', 'name', 'city', 'managerName', 'phone', 'email', 'address']}
            searchPlaceholder="Search by ID, name, city, manager, phone..."
          />
        </div>
      </div>

      {/* Settings Overview Modal */}
      {selectedStore && storeMeta && (
        <Modal 
          isOpen={isPreviewOpen} 
          onClose={() => setIsPreviewOpen(false)} 
          title={`${selectedStore.name} — Settings Overview`}
        >
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1 no-scrollbar text-xs font-body text-text-secondary">
            {/* Store Information */}
            <div className="space-y-1.5 bg-surface-sunken p-3 rounded-card border border-border">
              <div className="flex items-center gap-2 text-text-primary font-heading font-bold text-[11px]">
                <Store className="w-4 h-4 text-brand" />
                <span>Basic Details</span>
              </div>
              <div className="space-y-1 pl-6">
                <p><strong>Manager:</strong> {selectedStore.managerName}</p>
                <p><strong>Phone:</strong> {selectedStore.phone}</p>
                <p className="flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-text-muted mt-0.5 shrink-0" />
                  <span>{selectedStore.address}</span>
                </p>
              </div>
            </div>

            {/* Delivery Limits */}
            <div className="space-y-1.5 bg-surface-sunken p-3 rounded-card border border-border">
              <div className="flex items-center gap-2 text-text-primary font-heading font-bold text-[11px]">
                <MapPin className="w-4 h-4 text-brand" />
                <span>Delivery Limits</span>
              </div>
              <div className="space-y-1 pl-6">
                <p><strong>Mode:</strong> {storeMeta.zone.mode === 'radius' ? 'Radial boundary' : 'Custom coordinate polygon'}</p>
                <p><strong>Estimated Radius:</strong> {storeMeta.zone.radiusKm} km</p>
              </div>
            </div>

            {/* Hours Overview */}
            <div className="space-y-1.5 bg-surface-sunken p-3 rounded-card border border-border">
              <div className="flex items-center gap-2 text-text-primary font-heading font-bold text-[11px]">
                <Clock className="w-4 h-4 text-brand" />
                <span>Weekly Operational Hours (Mon - Sun)</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-6">
                {Object.keys(storeMeta.hours.regularHours).slice(0, 7).map(day => {
                  const dayHours = storeMeta.hours.regularHours[day];
                  return (
                    <div key={day} className="flex justify-between border-b border-border/40 py-0.5">
                      <span className="font-medium">{day}:</span>
                      <span className="font-heading font-bold text-text-primary">
                        {dayHours.closed ? 'CLOSED' : `${dayHours.open} - ${dayHours.close}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Operations override gate */}
            <div className="pt-2 flex justify-between gap-3 border-t border-border mt-5">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-text-secondary font-heading font-semibold rounded-pill text-xs cursor-pointer"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  setIsPreviewOpen(false);
                  handleManageStore(selectedStore.id, selectedStore.name);
                }}
                className="px-4 py-2 bg-brand hover:bg-brand-accent text-white font-heading font-semibold rounded-pill text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Act on Behalf / Manage Store</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Onboard Store Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); resetForm(); }}
        title="Onboard New Store"
      >
        <form onSubmit={handleAddStoreSubmit} className="space-y-4 text-xs font-body text-text-secondary">
          <div className="space-y-1">
            <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Store Name</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Civil Lines, Jammu"
              className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">City</label>
              <input
                type="text"
                required
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
                placeholder="e.g. Jammu"
                className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-semibold bg-white"
              >
                <option value="Open">Open</option>
                <option value="Paused">Paused</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Full Address</label>
            <input
              type="text"
              required
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              placeholder="e.g. 123, Gandhi Nagar, Civil Lines"
              className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Manager Name</label>
              <input
                type="text"
                required
                value={formManager}
                onChange={(e) => setFormManager(e.target.value)}
                placeholder="e.g. Deepak Dogra"
                className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Phone Number</label>
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
              Onboard Store
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Store Modal */}
      {editingStore && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); resetForm(); }}
          title={`Edit Store: ${editingStore.name}`}
        >
          <form onSubmit={handleUpdateStoreSubmit} className="space-y-4 text-xs font-body text-text-secondary">
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Store Name</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Civil Lines, Jammu"
                className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">City</label>
                <input
                  type="text"
                  required
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  placeholder="e.g. Jammu"
                  className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-semibold bg-white"
                >
                  <option value="Open">Open</option>
                  <option value="Paused">Paused</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Full Address</label>
              <input
                type="text"
                required
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="e.g. 123, Gandhi Nagar, Civil Lines"
                className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Manager Name</label>
                <input
                  type="text"
                  required
                  value={formManager}
                  onChange={(e) => setFormManager(e.target.value)}
                  placeholder="e.g. Deepak Dogra"
                  className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Phone Number</label>
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

export default Stores;
