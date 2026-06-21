import React, { useState } from 'react';
import { useUiStore } from '../../store/uiStore';
import { AdminLayout } from '../../components/shared/AdminLayout';
import { Modal } from '../../components/ui/Modal';
import { KpiCard } from '../../components/ui/KpiCard';
import { mockBanners } from '@shared/mocks/mockBanners';
import { mockPromotions } from '@shared/mocks/mockPromotions';
import { 
  Image as ImageIcon, Plus, Edit3, Trash2, Info, 
  Sparkles, RefreshCw, Layers
} from 'lucide-react';

const GRADIENTS = [
  { name: 'Amber Gold (Default)', value: 'from-amber-700 to-amber-900' },
  { name: 'Amigos Brand Red', value: 'from-brand to-brand-accent' },
  { name: 'Crimson Rose', value: 'from-rose-800 to-red-950' },
  { name: 'Midnight Blue', value: 'from-blue-900 to-indigo-950' },
  { name: 'Forest Green', value: 'from-emerald-800 to-teal-950' },
  { name: 'Sunset Violet', value: 'from-violet-800 to-fuchsia-950' }
];

export const Banners = () => {
  const { addToast } = useUiStore();
  const [banners, setBanners] = useState(mockBanners);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formBg, setFormBg] = useState(GRADIENTS[0].value);
  const [formImage, setFormImage] = useState('');

  const resetForm = () => {
    setFormTitle('');
    setFormSubtitle('');
    setFormCode('');
    setFormBg(GRADIENTS[0].value);
    setFormImage('');
    setEditingBanner(null);
  };

  const syncBannersToDisk = async (newBanners) => {
    try {
      const response = await fetch('/api/save-banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banners: newBanners })
      });
      const data = await response.json();
      if (data.success) {
        addToast('Banners synced across all apps successfully!', 'success');
      } else {
        addToast('Synced local state, but file persistence failed.', 'warning');
      }
    } catch (e) {
      addToast('Synced local state, but failed to reach sync server.', 'warning');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle || !formSubtitle || !formImage) {
      addToast('Please fill out all required fields', 'error');
      return;
    }

    const nextId = banners.length > 0 ? Math.max(...banners.map(b => b.id)) + 1 : 1;
    const newBanner = {
      id: nextId,
      title: formTitle,
      subtitle: formSubtitle,
      code: formCode.toUpperCase().replace(/\s+/g, ''),
      bg: formBg,
      image: formImage
    };

    const updatedBanners = [...banners, newBanner];
    setBanners(updatedBanners);
    setIsAddModalOpen(false);
    resetForm();
    await syncBannersToDisk(updatedBanners);
  };

  const handleEditClick = (banner) => {
    setEditingBanner(banner);
    setFormTitle(banner.title);
    setFormSubtitle(banner.subtitle);
    setFormCode(banner.code || '');
    setFormBg(banner.bg || GRADIENTS[0].value);
    setFormImage(banner.image);
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle || !formSubtitle || !formImage) {
      addToast('Please fill out all required fields', 'error');
      return;
    }

    const updatedBanners = banners.map(b => {
      if (b.id === editingBanner.id) {
        return {
          ...b,
          title: formTitle,
          subtitle: formSubtitle,
          code: formCode.toUpperCase().replace(/\s+/g, ''),
          bg: formBg,
          image: formImage
        };
      }
      return b;
    });

    setBanners(updatedBanners);
    setIsEditModalOpen(false);
    resetForm();
    await syncBannersToDisk(updatedBanners);
  };

  const handleDeleteClick = async (bannerId, bannerTitle) => {
    if (window.confirm(`Are you sure you want to delete the banner "${bannerTitle}"?`)) {
      const updatedBanners = banners.filter(b => b.id !== bannerId);
      setBanners(updatedBanners);
      await syncBannersToDisk(updatedBanners);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="bg-white p-5 rounded-card border border-border shadow-sm flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
          <div>
            <h1 className="text-base font-heading font-extrabold text-text-primary">
              App Promotional Banners
            </h1>
            <p className="text-[10px] font-body text-text-secondary mt-0.5">
              Design and sequence active header carousel banners. Updates sync immediately to the customer application.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-brand hover:bg-brand-accent text-white font-heading font-semibold rounded-pill text-xs shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create App Banner</span>
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard 
            title="Total Active Banners" 
            value={banners.length} 
            icon={Layers} 
            description="Currently visible in mobile carousel"
          />
          <KpiCard 
            title="Linked Coupon Codes" 
            value={banners.filter(b => b.code).length} 
            icon={ImageIcon} 
            description="Redirection promotions configured"
          />
          <KpiCard 
            title="Customer Live Sync" 
            value="Active" 
            icon={Sparkles} 
            description="Vite HMR auto-propagation active"
          />
        </div>

        {/* Real-time Previews Grid */}
        <div className="space-y-4">
          <h2 className="text-xs font-heading font-extrabold text-text-primary uppercase tracking-wide">
            Banner Management & Interactive Previews
          </h2>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {banners.map((banner, index) => (
              <div 
                key={banner.id}
                className="bg-white border border-border rounded-card p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                {/* Admin Actions */}
                <div className="flex justify-between items-center border-b border-stone-100 pb-2.5">
                  <span className="text-[10px] font-heading font-extrabold text-stone-400 uppercase">
                    Position #{index + 1} (ID: {banner.id})
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(banner)}
                      className="p-1 hover:bg-stone-50 text-text-secondary rounded-card border border-stone-200 cursor-pointer flex items-center gap-1 text-[10.5px] font-heading font-bold px-2 py-1"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-brand" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(banner.id, banner.title)}
                      className="p-1 hover:bg-red-50 text-danger rounded-card border border-red-150 cursor-pointer flex items-center gap-1 text-[10.5px] font-heading font-bold px-2 py-1"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-danger" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Banner Render Preview (Matches Jammu Customer App CSS) */}
                <div className="px-4 py-2 bg-stone-100/50 rounded-card border border-stone-200">
                  <div className="text-[9px] font-heading font-bold text-stone-400 uppercase mb-2 select-none">
                    Preview in Customer App:
                  </div>
                  
                  <div className={`w-full h-36 relative bg-gradient-to-r ${banner.bg} text-white p-5 flex items-center justify-between rounded-card overflow-hidden shadow-sm select-none`}>
                    <div className="space-y-1.5 max-w-[60%] z-10 text-left">
                      <span className="bg-amber-400/25 text-amber-300 border border-amber-400/40 text-[9px] font-heading font-bold rounded-pill px-2 py-0.5 tracking-wider uppercase">
                        Special Deal
                      </span>
                      <h3 className="font-heading font-bold text-sm md:text-base leading-tight truncate">
                        {banner.title}
                      </h3>
                      <p className="text-[10px] md:text-xs text-white/80 font-body leading-normal line-clamp-2">
                        {banner.subtitle}
                      </p>
                      {banner.code && (
                        <div className="pt-1 flex items-center gap-1.5">
                          <span className="text-[9px] text-white/60 font-body">Use Code:</span>
                          <span className="font-heading font-extrabold text-xs text-amber-300 tracking-wide">
                            {banner.code}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shrink-0 border-2 border-white/20 shadow-lg relative">
                      <img 
                        src={banner.image} 
                        alt="Promo preview" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {banners.length === 0 && (
              <div className="xl:col-span-2 py-12 text-center text-text-muted text-[11px] font-body flex flex-col items-center justify-center gap-2 border border-dashed border-stone-200 rounded-card bg-white">
                <ImageIcon className="w-6 h-6 text-brand/60" />
                <span>No promotional banners configured. Click "Create App Banner" to get started.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Banner Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); resetForm(); }}
        title="Create App Banner"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-body text-text-secondary">
          <div className="space-y-1">
            <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Banner Title</label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Buy 1 Get 1 Free Pizza Combo"
              className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Subtitle / Promotional Description</label>
            <input
              type="text"
              required
              value={formSubtitle}
              onChange={(e) => setFormSubtitle(e.target.value)}
              placeholder="e.g. Save flat 50% on pizza meals during match hours"
              className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Linked Coupon Code (Optional)</label>
              <select
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-semibold bg-white"
              >
                <option value="">No Coupon Linked</option>
                {mockPromotions.map(p => (
                  <option key={p.code} value={p.code}>{p.code} - {p.title}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Background Gradient</label>
              <select
                value={formBg}
                onChange={(e) => setFormBg(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-semibold bg-white"
              >
                {GRADIENTS.map(g => (
                  <option key={g.value} value={g.value}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Image URL</label>
            <input
              type="text"
              required
              value={formImage}
              onChange={(e) => setFormImage(e.target.value)}
              placeholder="e.g. https://images.unsplash.com/photo-..."
              className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
            />
          </div>

          {/* Real-time Preview in form */}
          <div className="border-t border-border pt-4 space-y-2">
            <span className="text-[10px] font-heading font-bold text-text-primary uppercase block">
              Form Live Preview
            </span>
            <div className={`w-full h-32 relative bg-gradient-to-r ${formBg} text-white p-4 flex items-center justify-between rounded-card overflow-hidden select-none`}>
              <div className="space-y-1 max-w-[60%] z-10 text-left">
                <span className="bg-amber-400/25 text-amber-300 border border-amber-400/40 text-[8px] font-heading font-bold rounded-pill px-1.5 py-0.2 tracking-wider uppercase">
                  Special Deal
                </span>
                <h3 className="font-heading font-bold text-xs md:text-sm leading-tight truncate">
                  {formTitle || 'Sample Banner Title'}
                </h3>
                <p className="text-[9px] text-white/80 font-body leading-tight line-clamp-2">
                  {formSubtitle || 'Sample promotional description text will appear here.'}
                </p>
                {formCode && (
                  <div className="pt-0.5 flex items-center gap-1">
                    <span className="text-[8px] text-white/60 font-body">Use Code:</span>
                    <span className="font-heading font-extrabold text-[10px] text-amber-300">
                      {formCode}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-white/20 shadow relative">
                {formImage ? (
                  <img src={formImage} alt="Form preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center text-[8px]">No Image</div>
                )}
              </div>
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
              Create Banner
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Banner Modal */}
      {editingBanner && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); resetForm(); }}
          title={`Edit Banner: ${editingBanner.title}`}
        >
          <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs font-body text-text-secondary">
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Banner Title</label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Buy 1 Get 1 Free Pizza Combo"
                className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Subtitle / Promotional Description</label>
              <input
                type="text"
                required
                value={formSubtitle}
                onChange={(e) => setFormSubtitle(e.target.value)}
                placeholder="e.g. Save flat 50% on pizza meals during match hours"
                className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Linked Coupon Code (Optional)</label>
                <select
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-semibold bg-white"
                >
                  <option value="">No Coupon Linked</option>
                  {mockPromotions.map(p => (
                    <option key={p.code} value={p.code}>{p.code} - {p.title}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Background Gradient</label>
                <select
                  value={formBg}
                  onChange={(e) => setFormBg(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-semibold bg-white"
                >
                  {GRADIENTS.map(g => (
                    <option key={g.value} value={g.value}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Image URL</label>
              <input
                type="text"
                required
                value={formImage}
                onChange={(e) => setFormImage(e.target.value)}
                placeholder="e.g. https://images.unsplash.com/photo-..."
                className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
              />
            </div>

            {/* Real-time Preview in form */}
            <div className="border-t border-border pt-4 space-y-2">
              <span className="text-[10px] font-heading font-bold text-text-primary uppercase block">
                Form Live Preview
              </span>
              <div className={`w-full h-32 relative bg-gradient-to-r ${formBg} text-white p-4 flex items-center justify-between rounded-card overflow-hidden select-none`}>
                <div className="space-y-1 max-w-[60%] z-10 text-left">
                  <span className="bg-amber-400/25 text-amber-300 border border-amber-400/40 text-[8px] font-heading font-bold rounded-pill px-1.5 py-0.2 tracking-wider uppercase">
                    Special Deal
                  </span>
                  <h3 className="font-heading font-bold text-xs md:text-sm leading-tight truncate">
                    {formTitle || 'Sample Banner Title'}
                  </h3>
                  <p className="text-[9px] text-white/80 font-body leading-tight line-clamp-2">
                    {formSubtitle || 'Sample promotional description text will appear here.'}
                  </p>
                  {formCode && (
                    <div className="pt-0.5 flex items-center gap-1">
                      <span className="text-[8px] text-white/60 font-body">Use Code:</span>
                      <span className="font-heading font-extrabold text-[10px] text-amber-300">
                        {formCode}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-white/20 shadow relative">
                  {formImage ? (
                    <img src={formImage} alt="Form preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center text-[8px]">No Image</div>
                  )}
                </div>
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

export default Banners;
