import React, { useState } from 'react';
import { useUiStore } from '../../store/uiStore';
import { AdminLayout } from '../../components/shared/AdminLayout';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { KpiCard } from '../../components/ui/KpiCard';
import { mockMenuItems } from '@shared/mocks/mockMenuItems';
import { 
  UtensilsCrossed, Plus, Edit3, Trash2, Info, 
  IndianRupee, Sparkles, Filter, Leaf
} from 'lucide-react';

export const Menu = () => {
  const { addToast } = useUiStore();
  const [catalog, setCatalog] = useState(mockMenuItems);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('veg-pizza');
  const [formIsVeg, setFormIsVeg] = useState(true);
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formBasePrice, setFormBasePrice] = useState('');
  const [formPriceMedium, setFormPriceMedium] = useState('');
  const [formPriceLarge, setFormPriceLarge] = useState('');
  const [formIsBestseller, setFormIsBestseller] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'veg-pizza', label: 'Veg Pizzas' },
    { value: 'non-veg-pizza', label: 'Non-Veg Pizzas' },
    { value: 'sandwiches', label: 'Pizza Sandwiches' },
    { value: 'combos', label: 'Combos & Feasts' },
    { value: 'desserts', label: 'Desserts' },
    { value: 'drinks', label: 'Drinks & Beverages' }
  ];

  const resetForm = () => {
    setFormName('');
    setFormCategory('veg-pizza');
    setFormIsVeg(true);
    setFormDescription('');
    setFormImage('');
    setFormBasePrice('');
    setFormPriceMedium('');
    setFormPriceLarge('');
    setFormIsBestseller(false);
    setEditingItem(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setFormImage(dataUrl);
        addToast('Image uploaded and resized successfully!', 'success');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const syncMenuToDisk = async (newCatalog) => {
    try {
      const response = await fetch('/api/save-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuItems: newCatalog })
      });
      const data = await response.json();
      if (data.success) {
        addToast('Master menu synced across all apps successfully!', 'success');
      } else {
        addToast('Synced local state, but file persistence failed.', 'warning');
      }
    } catch (e) {
      addToast('Synced local state, but failed to reach sync server.', 'warning');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formCategory || !formDescription || !formBasePrice) {
      addToast('Please fill out all required fields', 'error');
      return;
    }

    const nextId = formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const isPizza = formCategory === 'veg-pizza' || formCategory === 'non-veg-pizza';

    const pricesObj = { regular: Number(formBasePrice) };
    if (isPizza) {
      if (formPriceMedium) pricesObj.medium = Number(formPriceMedium);
      if (formPriceLarge) pricesObj.large = Number(formPriceLarge);
    }

    const newItem = {
      id: nextId,
      name: formName,
      category: formCategory,
      isVeg: formIsVeg,
      description: formDescription,
      image: formImage || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
      basePrice: Number(formBasePrice),
      prices: pricesObj,
      rating: 4.5,
      reviews: 1,
      isBestseller: formIsBestseller,
      customizable: isPizza
    };

    const updatedCatalog = [...catalog, newItem];
    setCatalog(updatedCatalog);
    setIsAddModalOpen(false);
    resetForm();
    await syncMenuToDisk(updatedCatalog);
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormIsVeg(item.isVeg);
    setFormDescription(item.description);
    setFormImage(item.image);
    setFormBasePrice(item.basePrice);
    setFormPriceMedium(item.prices?.medium || '');
    setFormPriceLarge(item.prices?.large || '');
    setFormIsBestseller(item.isBestseller || false);
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formCategory || !formDescription || !formBasePrice) {
      addToast('Please fill out all required fields', 'error');
      return;
    }

    const isPizza = formCategory === 'veg-pizza' || formCategory === 'non-veg-pizza';

    const pricesObj = { regular: Number(formBasePrice) };
    if (isPizza) {
      if (formPriceMedium) pricesObj.medium = Number(formPriceMedium);
      if (formPriceLarge) pricesObj.large = Number(formPriceLarge);
    }

    const updatedCatalog = catalog.map(item => {
      if (item.id === editingItem.id) {
        return {
          ...item,
          name: formName,
          category: formCategory,
          isVeg: formIsVeg,
          description: formDescription,
          image: formImage,
          basePrice: Number(formBasePrice),
          prices: pricesObj,
          isBestseller: formIsBestseller,
          customizable: isPizza
        };
      }
      return item;
    });

    setCatalog(updatedCatalog);
    setIsEditModalOpen(false);
    resetForm();
    await syncMenuToDisk(updatedCatalog);
  };

  const handleDeleteClick = async (itemId, itemName) => {
    if (window.confirm(`Are you sure you want to delete "${itemName}" from the master menu? This will permanently remove it from all franchise and customer-facing menus.`)) {
      const updatedCatalog = catalog.filter(item => item.id !== itemId);
      setCatalog(updatedCatalog);
      await syncMenuToDisk(updatedCatalog);
    }
  };

  const columns = [
    {
      key: 'image',
      header: 'Item Image',
      render: (row) => (
        <img 
          src={row.image} 
          alt={row.name} 
          className="w-10 h-10 object-cover rounded-card border border-stone-200" 
        />
      )
    },
    { key: 'id', header: 'Catalog ID', sortable: true },
    {
      key: 'name',
      header: 'Item Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5 font-bold text-text-primary font-heading">
          {row.isVeg ? (
            <Leaf className="w-3.5 h-3.5 text-success shrink-0" title="Vegetarian" />
          ) : (
            <Leaf className="w-3.5 h-3.5 text-danger shrink-0" title="Non-Vegetarian" />
          )}
          <span>{row.name}</span>
          {row.isBestseller && (
            <span className="px-1.5 py-0.2 bg-amber-50 text-gold border border-gold/20 text-[8px] font-bold rounded-pill uppercase">
              Bestseller
            </span>
          )}
        </div>
      )
    },
    { 
      key: 'category', 
      header: 'Category', 
      sortable: true,
      render: (row) => {
        const catObj = categories.find(c => c.value === row.category);
        return <span className="font-semibold text-text-secondary">{catObj?.label || row.category}</span>;
      }
    },
    { 
      key: 'description', 
      header: 'Ingredients / Description',
      render: (row) => <span className="text-[10px] text-text-secondary whitespace-normal block max-w-xs leading-relaxed">{row.description}</span>
    },
    {
      key: 'pricing',
      header: 'Pricing Catalog',
      sortable: true,
      render: (row) => {
        const isPizza = row.category === 'veg-pizza' || row.category === 'non-veg-pizza';
        if (isPizza && (row.prices?.medium || row.prices?.large)) {
          return (
            <div className="flex flex-col gap-0.5 text-[10px]">
              <span><strong>Reg:</strong> ₹{row.basePrice}</span>
              {row.prices?.medium && <span><strong>Med:</strong> ₹{row.prices.medium}</span>}
              {row.prices?.large && <span><strong>Lrg:</strong> ₹{row.prices.large}</span>}
            </div>
          );
        }
        return <span className="font-bold text-text-primary">₹{row.basePrice}</span>;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditClick(row)}
            className="p-1 hover:bg-stone-100 text-text-secondary rounded-card border border-stone-200 cursor-pointer"
            title="Edit Pricing / Details"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeleteClick(row.id, row.name)}
            className="p-1 hover:bg-red-50 text-danger rounded-card border border-red-150 cursor-pointer"
            title="Delete Menu Item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  const filteredCatalog = activeCategoryFilter === 'all' 
    ? catalog 
    : catalog.filter(item => item.category === activeCategoryFilter);

  // KPIs
  const totalItems = catalog.length;
  const vegCount = catalog.filter(i => i.isVeg).length;
  const nonVegCount = totalItems - vegCount;
  const categoriesCount = new Set(catalog.map(i => i.category)).size;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-card border border-border shadow-sm flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
          <div>
            <h1 className="text-base font-heading font-extrabold text-text-primary">
              Master Menu Catalog
            </h1>
            <p className="text-[10px] font-body text-text-secondary mt-0.5">
              Manage the global menu offering, configure sizes and prices, and sync items instantly to the customer app
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-brand hover:bg-brand-accent text-white font-heading font-semibold rounded-pill text-xs shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard 
            title="Total Catalog Items" 
            value={totalItems} 
            icon={UtensilsCrossed} 
            description={`${vegCount} Vegetarian / ${nonVegCount} Non-Veg`}
          />
          <KpiCard 
            title="Menu Categories" 
            value={categoriesCount} 
            icon={Filter} 
            description="Pizzas, Sandwiches, Combos, etc."
          />
          <KpiCard 
            title="Active Sync Status" 
            value="All Apps Synced" 
            icon={Sparkles} 
            description="Vite HMR auto-syncing active"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-border">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActiveCategoryFilter(cat.value)}
              className={`px-3 py-1.5 text-xs font-heading font-semibold rounded-t-lg transition-all shrink-0 cursor-pointer ${
                activeCategoryFilter === cat.value
                  ? 'border-b-2 border-brand text-brand bg-brand/5'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Catalog Table */}
        <DataTable 
          columns={columns}
          data={filteredCatalog}
          pageSize={6}
          searchKey={['id', 'name', 'category', 'description']}
          searchPlaceholder="Search by ID, name, category, ingredients..."
        />
      </div>

      {/* Add Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); resetForm(); }}
        title="Add Master Menu Item"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-body text-text-secondary">
          <div className="space-y-1">
            <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Item Name</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Tandoori Paneer Deluxe"
              className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-semibold bg-white"
              >
                {categories.slice(1).map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase block mb-1">Item Type</label>
              <div className="flex items-center gap-4 py-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="isVeg"
                    checked={formIsVeg === true}
                    onChange={() => setFormIsVeg(true)}
                    className="accent-success"
                  />
                  <span className="font-semibold text-success">Veg</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="isVeg"
                    checked={formIsVeg === false}
                    onChange={() => setFormIsVeg(false)}
                    className="accent-danger"
                  />
                  <span className="font-semibold text-danger">Non-Veg</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Description / Ingredients</label>
            <textarea
              required
              rows="2"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Paneer cubes marinated in tandoori spices, capsicum, olives..."
              className="w-full px-3 py-1.5 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-heading font-bold text-text-secondary uppercase block">Item Image</label>
            <div className="flex gap-4 items-start bg-stone-50 p-3 rounded-card border border-stone-200">
              {formImage ? (
                <div className="relative w-16 h-16 rounded-card overflow-hidden border border-stone-200 shrink-0 bg-white flex items-center justify-center shadow-sm">
                  <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormImage('')}
                    className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200 cursor-pointer"
                    title="Remove Image"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-card border-2 border-dashed border-stone-300 shrink-0 flex flex-col items-center justify-center text-stone-400 bg-white">
                  <Plus className="w-5 h-5" />
                  <span className="text-[8px] uppercase font-bold mt-1">No Image</span>
                </div>
              )}
              <div className="flex-1 space-y-2">
                <div>
                  <label className="block text-[9px] font-semibold text-text-secondary mb-1">Option A: Upload local image file</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-[10px] text-text-secondary file:mr-2 file:py-1 file:px-2.5 file:rounded-pill file:border-0 file:text-[9px] file:font-bold file:bg-brand file:text-white hover:file:bg-brand-accent cursor-pointer transition-all"
                  />
                </div>
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-stone-200"></div>
                  <span className="flex-shrink mx-2 text-stone-400 text-[8px] font-bold uppercase">or</span>
                  <div className="flex-grow border-t border-stone-200"></div>
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-text-secondary mb-1">Option B: Image Web URL</label>
                  <input
                    type="text"
                    value={formImage && formImage.startsWith('data:') ? '' : formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="e.g. https://images.unsplash.com/..."
                    className="w-full px-2.5 py-1.5 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body text-[10px]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-3 space-y-3">
            <span className="text-[10px] font-heading font-bold text-text-primary uppercase block">
              Pricing Configuration (₹)
            </span>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-heading font-bold text-text-secondary uppercase">Regular (Base)</label>
                <input
                  type="number"
                  required
                  value={formBasePrice}
                  onChange={(e) => setFormBasePrice(e.target.value)}
                  placeholder="290"
                  className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body font-semibold text-text-primary"
                />
              </div>

              {(formCategory === 'veg-pizza' || formCategory === 'non-veg-pizza') && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-heading font-bold text-text-secondary uppercase">Medium Price</label>
                    <input
                      type="number"
                      value={formPriceMedium}
                      onChange={(e) => setFormPriceMedium(e.target.value)}
                      placeholder="490"
                      className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-heading font-bold text-text-secondary uppercase">Large Price</label>
                    <input
                      type="number"
                      value={formPriceLarge}
                      onChange={(e) => setFormPriceLarge(e.target.value)}
                      placeholder="650"
                      className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isBestseller"
              checked={formIsBestseller}
              onChange={(e) => setFormIsBestseller(e.target.checked)}
              className="accent-brand w-4 h-4 cursor-pointer"
            />
            <label htmlFor="isBestseller" className="font-heading font-semibold text-text-primary select-none cursor-pointer">
              Mark as Bestseller on client apps
            </label>
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
              Add Item
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Item Modal */}
      {editingItem && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); resetForm(); }}
          title={`Edit Catalog Item: ${editingItem.name}`}
        >
          <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs font-body text-text-secondary">
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Item Name</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Tandoori Paneer Deluxe"
                className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-semibold bg-white"
                >
                  {categories.slice(1).map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase block mb-1">Item Type</label>
                <div className="flex items-center gap-4 py-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="isVeg"
                      checked={formIsVeg === true}
                      onChange={() => setFormIsVeg(true)}
                      className="accent-success"
                    />
                    <span className="font-semibold text-success">Veg</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="isVeg"
                      checked={formIsVeg === false}
                      onChange={() => setFormIsVeg(false)}
                      className="accent-danger"
                    />
                    <span className="font-semibold text-danger">Non-Veg</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Description / Ingredients</label>
              <textarea
                required
                rows="2"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Paneer cubes marinated in tandoori spices, capsicum, olives..."
                className="w-full px-3 py-1.5 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase block">Item Image</label>
              <div className="flex gap-4 items-start bg-stone-50 p-3 rounded-card border border-stone-200">
                {formImage ? (
                  <div className="relative w-16 h-16 rounded-card overflow-hidden border border-stone-200 shrink-0 bg-white flex items-center justify-center shadow-sm">
                    <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormImage('')}
                      className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200 cursor-pointer"
                      title="Remove Image"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-card border-2 border-dashed border-stone-300 shrink-0 flex flex-col items-center justify-center text-stone-400 bg-white">
                    <Plus className="w-5 h-5" />
                    <span className="text-[8px] uppercase font-bold mt-1">No Image</span>
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <div>
                    <label className="block text-[9px] font-semibold text-text-secondary mb-1">Option A: Upload local image file</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-[10px] text-text-secondary file:mr-2 file:py-1 file:px-2.5 file:rounded-pill file:border-0 file:text-[9px] file:font-bold file:bg-brand file:text-white hover:file:bg-brand-accent cursor-pointer transition-all"
                    />
                  </div>
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-stone-200"></div>
                    <span className="flex-shrink mx-2 text-stone-400 text-[8px] font-bold uppercase">or</span>
                    <div className="flex-grow border-t border-stone-200"></div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-text-secondary mb-1">Option B: Image Web URL</label>
                    <input
                      type="text"
                      value={formImage && formImage.startsWith('data:') ? '' : formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="e.g. https://images.unsplash.com/..."
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body text-[10px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-3 space-y-3">
              <span className="text-[10px] font-heading font-bold text-text-primary uppercase block">
                Pricing Configuration (₹)
              </span>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-heading font-bold text-text-secondary uppercase">Regular (Base)</label>
                  <input
                    type="number"
                    required
                    value={formBasePrice}
                    onChange={(e) => setFormBasePrice(e.target.value)}
                    placeholder="290"
                    className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body font-semibold text-text-primary"
                  />
                </div>

                {(formCategory === 'veg-pizza' || formCategory === 'non-veg-pizza') && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[9px] font-heading font-bold text-text-secondary uppercase">Medium Price</label>
                      <input
                        type="number"
                        value={formPriceMedium}
                        onChange={(e) => setFormPriceMedium(e.target.value)}
                        placeholder="490"
                        className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-heading font-bold text-text-secondary uppercase">Large Price</label>
                      <input
                        type="number"
                        value={formPriceLarge}
                        onChange={(e) => setFormPriceLarge(e.target.value)}
                        placeholder="650"
                        className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isBestseller"
                checked={formIsBestseller}
                onChange={(e) => setFormIsBestseller(e.target.checked)}
                className="accent-brand w-4 h-4 cursor-pointer"
              />
              <label htmlFor="isBestseller" className="font-heading font-semibold text-text-primary select-none cursor-pointer">
                Mark as Bestseller on client apps
            </label>
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

export default Menu;
