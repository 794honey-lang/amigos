import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { AdminLayout } from '../../components/shared/AdminLayout';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { KpiCard } from '../../components/ui/KpiCard';
import { userService } from '../../services/userService';
import { 
  Users, Plus, Edit3, Trash2, Mail, Phone,
  Shield, CheckCircle, Info, ShieldCheck, UserCheck, AlertTriangle
} from 'lucide-react';

export const Admins = () => {
  const { addToast } = useUiStore();
  const currentUser = useAuthStore(state => state.user);

  // States
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // CRUD Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formIsSuper, setFormIsSuper] = useState(false);

  const loadAdmins = async () => {
    if (!currentUser?.id) return;
    setIsLoading(true);
    const res = await userService.getUsers(currentUser.id);
    setIsLoading(false);
    if (res.success) {
      setAdmins(res.data);
    } else {
      addToast(res.error || 'Failed to load administrator accounts', 'error');
    }
  };

  useEffect(() => {
    loadAdmins();
  }, [currentUser]);

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormPhone('');
    setFormIsSuper(false);
    setEditingAdmin(null);
  };

  const handleAddAdminSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formEmail || !formPassword) {
      addToast('Please fill out all required fields', 'error');
      return;
    }

    const payload = {
      name: formName,
      email: formEmail,
      password: formPassword,
      phone: formPhone || null,
      isSuperAdmin: formIsSuper
    };

    const res = await userService.createUser(currentUser.id, payload);
    if (res.success) {
      addToast(`Successfully created administrator: ${formName}`, 'success');
      setIsAddModalOpen(false);
      resetForm();
      loadAdmins();
    } else {
      addToast(res.error || 'Failed to create administrator account', 'error');
    }
  };

  const handleEditAdminClick = (admin) => {
    setEditingAdmin(admin);
    setFormName(admin.name);
    setFormEmail(admin.email);
    setFormPassword(''); // Password left blank unless changing
    setFormPhone(admin.phone || '');
    setFormIsSuper(!!admin.isSuperAdmin);
    setIsEditModalOpen(true);
  };

  const handleUpdateAdminSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formEmail) {
      addToast('Name and Email are required', 'error');
      return;
    }

    const payload = {
      name: formName,
      email: formEmail,
      phone: formPhone || null,
      isSuperAdmin: formIsSuper
    };
    
    if (formPassword.trim() !== '') {
      payload.password = formPassword;
    }

    const res = await userService.updateUser(currentUser.id, editingAdmin.id, payload);
    if (res.success) {
      addToast(`Successfully updated administrator: ${formName}`, 'success');
      setIsEditModalOpen(false);
      resetForm();
      loadAdmins();
    } else {
      addToast(res.error || 'Failed to update administrator account', 'error');
    }
  };

  const handleDeleteAdminClick = async (adminId, adminName) => {
    if (window.confirm(`Are you sure you want to permanently delete the administrator "${adminName}"?`)) {
      const res = await userService.deleteUser(currentUser.id, adminId);
      if (res.success) {
        addToast(`Deleted administrator "${adminName}" successfully.`, 'warning');
        loadAdmins();
      } else {
        addToast(res.error || 'Failed to delete administrator', 'error');
      }
    }
  };

  const handleToggleStatus = async (admin) => {
    const newDisabledState = !admin.disabled;
    const actionName = newDisabledState ? 'deactivate' : 'activate';
    
    if (window.confirm(`Are you sure you want to ${actionName} the account of "${admin.name}"?`)) {
      const res = await userService.updateUser(currentUser.id, admin.id, {
        disabled: newDisabledState
      });
      if (res.success) {
        addToast(`Successfully ${newDisabledState ? 'deactivated' : 'activated'} "${admin.name}".`, newDisabledState ? 'warning' : 'success');
        loadAdmins();
      } else {
        addToast(res.error || 'Failed to update account status', 'error');
      }
    }
  };

  const columns = [
    { 
      key: 'name', 
      header: 'Admin Name', 
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-heading font-bold text-text-primary text-xs">{row.name}</span>
          {row.id === currentUser?.id && (
            <span className="text-[8px] font-heading font-extrabold text-brand uppercase mt-0.5">(You)</span>
          )}
        </div>
      )
    },
    { key: 'email', header: 'Email Address', sortable: true },
    { key: 'phone', header: 'Phone Number', sortable: false, render: (row) => row.phone || '-' },
    { 
      key: 'role', 
      header: 'Role / Authority', 
      sortable: true,
      render: (row) => (
        row.isSuperAdmin ? (
          <div className="flex items-center gap-1.5 text-amber-800 font-heading font-extrabold bg-gold/15 border border-gold/25 px-2 py-0.5 rounded-pill w-fit text-[9px] tracking-wide uppercase">
            <ShieldCheck className="w-3 h-3 text-gold shrink-0" />
            <span>Super Admin</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-text-secondary font-heading font-bold bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-pill w-fit text-[9px] tracking-wide uppercase">
            <Shield className="w-3 h-3 text-text-muted shrink-0" />
            <span>Acting Admin</span>
          </div>
        )
      )
    },
    { 
      key: 'status', 
      header: 'Account Status', 
      sortable: true,
      render: (row) => (
        row.disabled ? (
          <span className="px-2.5 py-0.5 rounded-pill text-[8px] font-bold border shrink-0 bg-red-50 text-danger border-danger/20 uppercase">
            Deactivated
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-pill text-[8px] font-bold border shrink-0 bg-green-50 text-success border-success/20 uppercase">
            Active
          </span>
        )
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => {
        const isTargetSuper = !!row.isSuperAdmin;
        const isCallerSuper = !!currentUser?.isSuperAdmin;

        const canModify = !isTargetSuper || isCallerSuper;
        const canDelete = row.id !== currentUser?.id && canModify;
        const canToggle = row.id !== currentUser?.id && canModify;
        const canEdit = canModify;

        return (
          <div className="flex gap-2 items-center">
            {canToggle && (
              <button
                onClick={() => handleToggleStatus(row)}
                className={`px-2 py-1 text-[9px] font-heading font-bold border rounded-card cursor-pointer transition-colors ${
                  row.disabled 
                    ? 'bg-green-50 text-success border-success/20 hover:bg-green-100' 
                    : 'bg-red-50 text-danger border-danger/20 hover:bg-red-100'
                }`}
                title={row.disabled ? 'Activate Account' : 'Deactivate Account'}
              >
                {row.disabled ? 'Activate' : 'Deactivate'}
              </button>
            )}
            {canEdit ? (
              <button
                onClick={() => handleEditAdminClick(row)}
                className="p-1 hover:bg-stone-100 text-text-secondary rounded-card border border-stone-200 cursor-pointer"
                title="Edit Details"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="p-1 text-stone-300 rounded-card border border-stone-100 cursor-not-allowed" title="Unauthorized to edit Super Admin">
                <Edit3 className="w-3.5 h-3.5" />
              </div>
            )}
            {canDelete ? (
              <button
                onClick={() => handleDeleteAdminClick(row.id, row.name)}
                className="p-1 hover:bg-red-50 text-danger rounded-card border border-red-150 cursor-pointer"
                title="Delete Admin"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="p-1 text-stone-300 rounded-card border border-stone-100 cursor-not-allowed" title={row.id === currentUser?.id ? "You cannot delete yourself" : "Unauthorized to delete Super Admin"}>
                <Trash2 className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        );
      }
    }
  ];

  // KPIs
  const totalAdmins = admins.length;
  const superCount = admins.filter(a => a.isSuperAdmin).length;
  const activeCount = admins.filter(a => !a.disabled).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-card border border-border shadow-sm flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
          <div>
            <h1 className="text-base font-heading font-extrabold text-text-primary">
              Corporate Administrators
            </h1>
            <p className="text-[10px] font-body text-text-secondary mt-0.5">
              Manage Corporate HQ personnel, assign Super Admin roles, and control active/disabled access permissions.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-brand hover:bg-brand-accent text-white font-heading font-semibold rounded-pill text-xs shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Admin</span>
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard 
            title="Total Administrators" 
            value={totalAdmins} 
            icon={Users} 
            description="HQ personnel accounts"
          />
          <KpiCard 
            title="Super Administrators" 
            value={superCount} 
            icon={ShieldCheck} 
            description="Accounts with full access"
          />
          <KpiCard 
            title="Active Logins" 
            value={`${activeCount} / ${totalAdmins} Enabled`} 
            icon={UserCheck} 
            description="Allowed staff sessions"
          />
        </div>

        {/* Database Table */}
        <div className="space-y-3">
          <DataTable 
            columns={columns}
            data={admins}
            pageSize={10}
            searchKey={['name', 'email', 'phone']}
            searchPlaceholder="Search admins by name, email, phone..."
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Create New Admin Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); resetForm(); }}
        title="Create New Administrator"
      >
        <form onSubmit={handleAddAdminSubmit} className="space-y-4 text-xs font-body text-text-secondary">
          <div className="space-y-1">
            <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Full Name</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Email Address</label>
              <input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="e.g. rahul@amigos.in"
                className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Mobile Number (Optional)</label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="e.g. 9898989898"
                className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Password</label>
              <input
                type="password"
                required
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Admin Role Type</label>
              <select
                value={formIsSuper ? 'super' : 'acting'}
                disabled={!currentUser?.isSuperAdmin}
                onChange={(e) => setFormIsSuper(e.target.value === 'super')}
                className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-semibold bg-white disabled:bg-stone-50 disabled:cursor-not-allowed"
              >
                <option value="acting">Acting Admin (Limited)</option>
                {currentUser?.isSuperAdmin && (
                  <option value="super">Super Admin (Full Access)</option>
                )}
              </select>
              {!currentUser?.isSuperAdmin && (
                <span className="text-[8px] text-text-muted mt-1 block">Only Super Admins can assign Super Admin privilege.</span>
              )}
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
              Create Administrator
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Admin Modal */}
      {editingAdmin && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); resetForm(); }}
          title={`Edit Administrator: ${editingAdmin.name}`}
        >
          <form onSubmit={handleUpdateAdminSubmit} className="space-y-4 text-xs font-body text-text-secondary">
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Full Name</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. rahul@amigos.in"
                  className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Mobile Number (Optional)</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="e.g. 9898989898"
                  className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Password (Leave blank to keep unchanged)</label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Admin Role Type</label>
                <select
                  value={formIsSuper ? 'super' : 'acting'}
                  disabled={!currentUser?.isSuperAdmin || editingAdmin.id === currentUser?.id}
                  onChange={(e) => setFormIsSuper(e.target.value === 'super')}
                  className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-semibold bg-white disabled:bg-stone-50 disabled:cursor-not-allowed"
                >
                  <option value="acting">Acting Admin (Limited)</option>
                  <option value="super">Super Admin (Full Access)</option>
                </select>
                {editingAdmin.id === currentUser?.id && (
                  <span className="text-[8px] text-text-muted mt-1 block">You cannot change your own Super Admin privilege.</span>
                )}
                {!currentUser?.isSuperAdmin && editingAdmin.id !== currentUser?.id && (
                  <span className="text-[8px] text-text-muted mt-1 block">Only Super Admins can alter Super Admin privilege.</span>
                )}
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

export default Admins;
