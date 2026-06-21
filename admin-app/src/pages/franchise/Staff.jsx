import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useStoreRegistry } from '../../store/storeRegistry';
import { AdminLayout } from '../../components/shared/AdminLayout';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { mockStaff } from '../../mocks/mockStaff';
import { 
  Users, Plus, Trash2, ShieldCheck, Mail, Store, Info 
} from 'lucide-react';

export const Staff = () => {
  const { scope } = useAuthStore();
  const { addToast } = useUiStore();
  const allStores = useStoreRegistry(state => state.stores);

  const activeFranchiseId = scope.franchiseId || 'fr_001';

  // States
  const [staffList, setStaffList] = useState([]);
  const [stores, setStores] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New staff form states
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffStore, setNewStaffStore] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('staff');

  const loadData = () => {
    const franchiseStores = allStores.filter(s => s.franchiseId === activeFranchiseId);
    setStores(franchiseStores);

    const storeIds = franchiseStores.map(s => s.id);
    const filteredStaff = mockStaff.filter(st => storeIds.includes(st.storeId));
    setStaffList(filteredStaff);

    if (franchiseStores.length > 0) {
      setNewStaffStore(franchiseStores[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeFranchiseId]);

  const handleAddStaffSubmit = (e) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail) {
      addToast('Please enter both name and email', 'error');
      return;
    }

    const newMember = {
      id: `staff_${Date.now()}`,
      storeId: newStaffStore,
      name: newStaffName,
      role: newStaffRole,
      email: newStaffEmail,
      status: 'active'
    };

    setStaffList(prev => [...prev, newMember]);
    addToast(`Added ${newStaffName} as ${newStaffRole} successfully!`, 'success');
    
    // Reset Form
    setNewStaffName('');
    setNewStaffEmail('');
    setIsModalOpen(false);
  };

  const handleDeleteStaff = (staffId, staffName) => {
    if (window.confirm(`Are you sure you want to remove staff member ${staffName}?`)) {
      setStaffList(prev => prev.filter(st => st.id !== staffId));
      addToast(`Removed ${staffName} from registry.`, 'warning');
    }
  };

  const columns = [
    { key: 'id', header: 'Staff ID', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { 
      key: 'storeId', 
      header: 'Assigned Branch', 
      sortable: true,
      render: (row) => {
        const storeName = stores.find(s => s.id === row.storeId)?.name || 'Unknown Store';
        return <span>{storeName}</span>;
      }
    },
    { 
      key: 'role', 
      header: 'Role', 
      sortable: true,
      render: (row) => (
        <span className={`px-2 py-0.5 rounded-pill text-[9px] font-bold border uppercase tracking-wider ${
          row.role === 'manager' 
            ? 'bg-brand/10 border-brand/20 text-brand' 
            : 'bg-stone-50 border-border text-text-secondary'
        }`}>
          {row.role}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Status', 
      sortable: true,
      render: (row) => (
        <span className="px-2 py-0.5 rounded-pill text-[9px] font-bold bg-green-50 text-success border border-success/15 uppercase">
          {row.status}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleDeleteStaff(row.id, row.name)}
          className="p-1 hover:bg-red-50 text-danger rounded-full transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-card border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-heading font-extrabold text-text-primary">
              Regional Staff Registry
            </h1>
            <p className="text-[10px] font-body text-text-secondary mt-0.5">
              Manage accounts, assign employees to branches, and edit operations roles
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-brand hover:bg-brand-accent text-white font-heading font-semibold rounded-pill text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>

        {/* Database Table */}
        <div className="space-y-3">
          <DataTable 
            columns={columns}
            data={staffList}
            pageSize={5}
            searchKey={['id', 'name', 'email', 'role', 'status', 'storeId']}
            searchPlaceholder="Search by ID, name, email, role..."
          />
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Onboard Staff Member">
        <form onSubmit={handleAddStaffSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Full Name</label>
            <input
              type="text"
              value={newStaffName}
              onChange={(e) => setNewStaffName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                placeholder="john@amigos.in"
                className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Assign Store</label>
              <select
                value={newStaffStore}
                onChange={(e) => setNewStaffStore(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-semibold bg-white"
              >
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Operational Role</label>
              <select
                value={newStaffRole}
                onChange={(e) => setNewStaffRole(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-semibold bg-white"
              >
                <option value="staff">Store Counter Staff</option>
                <option value="manager">Store Branch Manager</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-text-secondary font-heading font-semibold rounded-pill text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand hover:bg-brand-accent text-white font-heading font-semibold rounded-pill text-xs shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Apply Onboarding
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default Staff;
