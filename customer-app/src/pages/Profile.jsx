import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, MapPin, Heart, CreditCard, Wallet, 
  HelpCircle, Settings, LogOut, ChevronRight, Edit2, Plus, Trash2,
  Phone, Mail
} from 'lucide-react';
import { useAuthStore } from '@shared/store/authStore';
import { useCartStore } from '@shared/store/cartStore';
import { useUiStore } from '@shared/store/uiStore';
import { menuService } from '@shared/services/menuService';
import { authService } from '@shared/services/authService';
import { Card } from '@shared/components/ui/Card';
import { BottomSheet } from '@shared/components/ui/BottomSheet';
import { Input } from '@shared/components/ui/Input';
import { Button } from '@shared/components/ui/Button';

// Address Schema
const addressSchema = z.object({
  label: z.string().min(2, { message: 'Label must be at least 2 characters (e.g. Home, Office)' }),
  line: z.string().min(5, { message: 'Address line must be at least 5 characters' }),
  city: z.string().min(2, { message: 'City name is required' }),
  pincode: z.string().length(6, { message: 'Pincode must be exactly 6 digits' }).regex(/^\d+$/, { message: 'Pincode must be numbers only' }),
  landmark: z.string().optional()
});

export const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const { addItem } = useCartStore();
  const { addToast } = useUiStore();

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [addressesOpen, setAddressesOpen] = useState(false);
  const [favouritesOpen, setFavouritesOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  
  const [favouriteItems, setFavouriteItems] = useState([]);
  const [newAddressFormOpen, setNewAddressFormOpen] = useState(false);
  
  // Geolocation states
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [detectedCoords, setDetectedCoords] = useState(null);
  
  // Profile edit state
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const handleOpenEditProfile = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setEditPhone(user?.phone || '');
    setVerifyingOtp(false);
    setOtpCode('');
    setEditProfileOpen(true);
  };

  // Load Favourite Menu Items
  useEffect(() => {
    const loadFavourites = async () => {
      if (!user?.favourites) return;
      const res = await menuService.getMenuItems();
      if (res.success) {
        const filtered = res.data.filter(item => user.favourites.includes(item.id));
        setFavouriteItems(filtered);
      }
    };
    if (favouritesOpen) {
      loadFavourites();
    }
  }, [favouritesOpen, user?.favourites]);

  // Init Address Form
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(addressSchema)
  });

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'info');
    navigate('/login');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    updateUser({
      ...user,
      name: editName,
      email: editEmail
    });
    addToast('Profile updated!', 'success');
    setEditProfileOpen(false);
  };

  const handleVerifyOtpForPhoneChange = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      addToast('Please enter a 6-digit OTP code', 'error');
      return;
    }

    setOtpLoading(true);
    const res = await authService.verifyOtp(editPhone, otpCode);
    setOtpLoading(false);

    if (res.success) {
      // OTP verified, update name, email, and phone!
      updateUser({
        ...user,
        name: editName,
        email: editEmail,
        phone: editPhone
      });
      addToast('Profile and phone number updated successfully!', 'success');
      setVerifyingOtp(false);
      setOtpCode('');
      setEditProfileOpen(false);
    } else {
      addToast(res.error, 'error');
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser', 'error');
      return;
    }
    
    setDetectingLocation(true);
    addToast('Requesting GPS access...', 'info');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setDetectedCoords({ latitude, longitude });
        
        try {
          // Nominatim OpenStreetMap reverse geocoding
          // User-Agent header is REQUIRED by OSM usage policy
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'AmigosApp/1.0 (amigosfinedine@gmail.com)',
                'Accept-Language': 'en'
              }
            }
          );

          if (!res.ok) throw new Error(`Nominatim error: ${res.status}`);
          const geodata = await res.json();
          const addr = geodata.address || {};
          
          // Build address line
          const road = addr.road || addr.pedestrian || addr.path || addr.suburb || addr.neighbourhood || '';
          const area = addr.suburb || addr.neighbourhood || addr.village || addr.city_district || '';
          const lineVal = [road, area].filter(Boolean).join(', ') || geodata.display_name?.split(',').slice(0, 2).join(', ') || 'Detected Location';
          
          const cityVal = addr.city || addr.town || addr.county || addr.state_district || addr.state || '';
          const pincodeVal = (addr.postcode || '').replace(/\D/g, '').substring(0, 6);
          const landmarkVal = addr.amenity || addr.building || addr.suburb || addr.neighbourhood || '';

          // setValue with full options so react-hook-form shows value in inputs
          const setOpts = { shouldValidate: true, shouldDirty: true, shouldTouch: true };
          setValue('line', lineVal, setOpts);
          setValue('city', cityVal, setOpts);
          if (pincodeVal.length === 6) setValue('pincode', pincodeVal, setOpts);
          if (landmarkVal) setValue('landmark', landmarkVal, setOpts);
          
          addToast(`✅ Location detected: ${cityVal || 'your area'}`, 'success');
        } catch (e) {
          console.error('Reverse geocoding error:', e);
          // Fill coords at minimum so user can see we got GPS
          const setOpts = { shouldValidate: false, shouldDirty: true, shouldTouch: true };
          setValue('line', `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`, setOpts);
          addToast(`GPS found (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) — please fill address details`, 'warning');
        }
        setDetectingLocation(false);
      },
      (error) => {
        setDetectingLocation(false);
        const msgs = {
          1: 'Location access denied. Please allow location in browser settings and try again.',
          2: 'Location unavailable. Try moving to an open area.',
          3: 'Location request timed out. Please try again.'
        };
        addToast(msgs[error.code] || 'Failed to detect location. Please type manually.', 'error');
        console.error('Geolocation error:', error.code, error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  };

  const handleAddAddress = (data) => {
    const newAddress = {
      id: `addr-${Date.now()}`,
      ...data,
      latitude: detectedCoords?.latitude || null,
      longitude: detectedCoords?.longitude || null
    };
    
    const updatedAddresses = [...(user.addresses || []), newAddress];
    updateUser({
      ...user,
      addresses: updatedAddresses
    });
    
    addToast(`Address "${data.label}" added!`, 'success');
    reset();
    setDetectedCoords(null);
    setNewAddressFormOpen(false);
  };

  const handleDeleteAddress = (addrId, label, e) => {
    e.stopPropagation();
    const updatedAddresses = user.addresses.filter(addr => addr.id !== addrId);
    updateUser({
      ...user,
      addresses: updatedAddresses
    });
    addToast(`Address "${label}" deleted`, 'info');
  };

  const handleQuickAddFavourite = (item, e) => {
    e.stopPropagation();
    const defaultItem = {
      menuId: item.id,
      name: item.name,
      size: 'Regular',
      crust: 'Classic',
      toppings: [],
      price: item.basePrice,
      crustPrice: 0,
      toppingsPrice: 0,
      qty: 1,
      isVeg: item.isVeg,
      image: item.image
    };
    addItem(defaultItem);
    addToast(`${item.name} added to cart!`, 'success');
  };

  const getInitials = (name) => {
    if (!name) return 'AM';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex-1 flex flex-col bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-border px-4 py-3.5 flex items-center shadow-sm">
        <h1 className="font-heading font-extrabold text-base text-text-primary">My Profile</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-36 space-y-6">
        
        {/* User Details Header Panel */}
        <Card className="p-5 flex flex-col items-center justify-center text-center space-y-3 relative">
          <button
            onClick={handleOpenEditProfile}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-50 border border-stone-200 text-text-secondary hover:bg-stone-100 transition-colors shadow-sm"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Avatar initials badge */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand to-brand-accent flex items-center justify-center text-white text-2xl font-heading font-bold shadow-md border-4 border-white">
            {getInitials(user?.name)}
          </div>
          
          <div className="space-y-0.5">
            <h2 className="font-heading font-extrabold text-base text-text-primary">
              {user?.name || 'Amigos Guest'}
            </h2>
            <p className="font-body text-xs text-text-secondary">
              {user?.phone ? `+91 ${user.phone}` : 'Guest Session'}
            </p>
            {user?.email && (
              <p className="font-body text-[10px] text-text-muted">
                {user.email}
              </p>
            )}
          </div>
        </Card>

        {/* Menu Rows list */}
        <div className="space-y-2.5">
          {/* Row 1: My Orders */}
          <div 
            onClick={() => navigate('/orders')}
            className="flex items-center justify-between p-4 bg-white rounded-card border border-border shadow-sm cursor-pointer hover:bg-stone-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-brand/5 text-brand">
                <Heart className="w-4 h-4 fill-brand/10" /> {/* Reused Orders logic */}
              </div>
              <span className="font-heading font-bold text-xs text-text-primary">My Orders</span>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-text-muted" />
          </div>

          {/* Row 2: Saved Addresses */}
          <div 
            onClick={() => setAddressesOpen(true)}
            className="flex items-center justify-between p-4 bg-white rounded-card border border-border shadow-sm cursor-pointer hover:bg-stone-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-brand/5 text-brand">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="font-heading font-bold text-xs text-text-primary">My Addresses</span>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-text-muted" />
          </div>

          {/* Row 3: Favourites */}
          <div 
            onClick={() => setFavouritesOpen(true)}
            className="flex items-center justify-between p-4 bg-white rounded-card border border-border shadow-sm cursor-pointer hover:bg-stone-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-brand/5 text-brand">
                <Heart className="w-4 h-4" />
              </div>
              <span className="font-heading font-bold text-xs text-text-primary">Favourite Items</span>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-text-muted" />
          </div>

          {/* Row 4: Wallet & Balance */}
          <div 
            onClick={() => addToast(`Wallet Balance: ₹${user?.walletBalance || 0}`, 'info')}
            className="flex items-center justify-between p-4 bg-white rounded-card border border-border shadow-sm cursor-pointer hover:bg-stone-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-brand/5 text-brand">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="font-heading font-bold text-xs text-text-primary">Offers & Wallet</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="bg-gold/15 text-gold border border-gold/30 text-[10px] font-heading font-extrabold rounded-pill px-2.5 py-0.5 shadow-sm">
                ₹{user?.walletBalance || 0}
              </span>
              <ChevronRight className="w-4.5 h-4.5 text-text-muted" />
            </div>
          </div>

          {/* Row 5: Help & Support */}
          <div 
            onClick={() => setSupportOpen(true)}
            className="flex items-center justify-between p-4 bg-white rounded-card border border-border shadow-sm cursor-pointer hover:bg-stone-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-brand/5 text-brand">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="font-heading font-bold text-xs text-text-primary">Help & Support</span>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-text-muted" />
          </div>

          {/* Row 6: Settings */}
          <div 
            onClick={() => addToast('Settings screen coming soon!', 'info')}
            className="flex items-center justify-between p-4 bg-white rounded-card border border-border shadow-sm cursor-pointer hover:bg-stone-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-brand/5 text-brand">
                <Settings className="w-4 h-4" />
              </div>
              <span className="font-heading font-bold text-xs text-text-primary">Settings</span>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-text-muted" />
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-700 font-heading font-bold text-xs rounded-card shadow-sm transition-colors mt-4"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>

      {/* EDIT PROFILE BOTTOM SHEET */}
      <BottomSheet
        isOpen={editProfileOpen}
        onClose={() => {
          setEditProfileOpen(false);
          setVerifyingOtp(false);
        }}
        title={verifyingOtp ? "Verify New Mobile Number" : "Edit Profile"}
      >
        {verifyingOtp ? (
          <form onSubmit={handleVerifyOtpForPhoneChange} className="space-y-5 pb-4">
            <div className="text-center space-y-1">
              <p className="font-body text-xs text-text-secondary leading-relaxed">
                Enter the 6-digit OTP sent to <span className="font-semibold text-text-primary">+91 {editPhone}</span> to confirm your new mobile number.
              </p>
            </div>
            
            <Input
              label="Enter 6-Digit OTP"
              placeholder="e.g. 123456"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              disabled={otpLoading}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              className="text-center font-heading font-bold tracking-widest text-lg py-3"
            />
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 py-3"
                onClick={() => setVerifyingOtp(false)}
                disabled={otpLoading}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1 py-3"
                disabled={otpLoading || otpCode.length !== 6}
              >
                {otpLoading ? 'Verifying...' : 'Verify & Save'}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleUpdateProfile} className="space-y-4 pb-4">
            <Input
              label="Your Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Rahul Sharma"
              disabled={otpLoading}
            />
            <Input
              label="Email Address"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="rahul.sharma@example.com"
              disabled={otpLoading}
            />
            <div className="flex items-start gap-2.5">
              <div className="w-16">
                <label className="font-heading font-medium text-xs text-text-secondary block mb-1.5">
                  Prefix
                </label>
                <div className="bg-stone-50 border border-stone-300 rounded-input px-2 py-3 text-xs font-body text-text-secondary text-center">
                  +91
                </div>
              </div>
              <div className="flex-1">
                <Input
                  label="Login Mobile Number"
                  value={editPhone}
                  placeholder="10-digit mobile number"
                  disabled={true}
                />
              </div>
            </div>
            
            <p className="text-[10px] text-text-muted font-heading font-medium leading-none px-1">
              * Mobile number cannot be changed.
            </p>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={!editName.trim() || otpLoading}
              className="py-3 mt-2"
            >
              {otpLoading ? 'Please wait...' : 'Save Changes'}
            </Button>
          </form>
        )}
      </BottomSheet>

      {/* ADDRESSES BOTTOM SHEET */}
      <BottomSheet
        isOpen={addressesOpen}
        onClose={() => { setAddressesOpen(false); setNewAddressFormOpen(false); }}
        title={newAddressFormOpen ? "Add New Address" : "My Saved Addresses"}
      >
        {newAddressFormOpen ? (
          /* Address Form */
          <form onSubmit={handleSubmit(handleAddAddress)} className="space-y-4 pb-4 text-left">
            {/* Detect Location Button */}
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={detectingLocation}
              className="w-full flex items-center justify-center gap-2 border border-brand/20 bg-brand/5 hover:bg-brand/10 text-brand rounded-pill py-2.5 px-4 font-heading font-semibold text-xs transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <MapPin className="w-4 h-4" />
              {detectingLocation ? 'Detecting Location...' : 'Use Current Location (GPS)'}
            </button>

            {detectedCoords && (
              <div className="bg-green-50 border border-green-200 text-green-800 text-[10px] rounded-card p-2.5 text-center font-heading font-medium">
                Detected GPS Coordinates: {detectedCoords.latitude.toFixed(6)}, {detectedCoords.longitude.toFixed(6)}
              </div>
            )}

            <Input
              label="Address Label (e.g. Home, Office, Gym)"
              placeholder="e.g. Home"
              error={errors.label?.message}
              {...register('label')}
            />
            <Input
              label="Address Line"
              placeholder="House/Flat No, Street, Colony"
              error={errors.line?.message}
              {...register('line')}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="City"
                placeholder="Jammu"
                error={errors.city?.message}
                {...register('city')}
              />
              <Input
                label="Pincode"
                placeholder="180001"
                maxLength={6}
                error={errors.pincode?.message}
                {...register('pincode')}
              />
            </div>
            <Input
              label="Landmark (Optional)"
              placeholder="Near City Square"
              error={errors.landmark?.message}
              {...register('landmark')}
            />
            
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 py-3"
                onClick={() => setNewAddressFormOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1 py-3"
              >
                Save
              </Button>
            </div>
          </form>
        ) : (
          /* Saved Address list */
          <div className="space-y-4 pb-4">
            <button
              onClick={() => setNewAddressFormOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 p-3.5 border-2 border-dashed border-brand/40 hover:border-brand rounded-card text-brand font-heading font-bold text-xs bg-brand/5 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Add New Address
            </button>

            {user?.addresses?.length === 0 ? (
              <p className="text-xs text-text-secondary text-center py-6">No addresses saved yet.</p>
            ) : (
              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                {user?.addresses?.map((addr) => (
                  <Card key={addr.id} className="p-4 flex items-start justify-between gap-3 bg-white">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-full bg-brand/5 text-brand mt-0.5 shrink-0">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-left min-w-0">
                        <h4 className="font-heading font-bold text-xs text-text-primary">{addr.label}</h4>
                        <p className="text-[10px] text-text-secondary font-body mt-0.5 leading-normal">
                          {addr.line}, {addr.city} - {addr.pincode}
                        </p>
                        {addr.latitude && addr.longitude && (
                          <span className="inline-block text-[8px] font-heading font-semibold text-success bg-green-50 px-1.5 py-0.5 rounded-sm mt-1">
                            GPS: {addr.latitude.toFixed(5)}, {addr.longitude.toFixed(5)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => handleDeleteAddress(addr.id, addr.label, e)}
                      className="p-1.5 rounded-full hover:bg-red-50 text-text-muted hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </BottomSheet>

      {/* FAVOURITES BOTTOM SHEET */}
      <BottomSheet
        isOpen={favouritesOpen}
        onClose={() => setFavouritesOpen(false)}
        title="Favourite Items"
      >
        <div className="space-y-4 pb-4 max-h-[50vh] overflow-y-auto pr-1">
          {favouriteItems.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Heart className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-xs text-text-secondary">No favourite items saved yet.</p>
            </div>
          ) : (
            favouriteItems.map((item) => (
              <Card key={item.id} className="p-3.5 flex items-center gap-3">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-card object-cover shrink-0 border border-border" />
                <div className="flex-1 text-left min-w-0">
                  <h4 className="font-heading font-bold text-xs text-text-primary truncate">{item.name}</h4>
                  <span className="font-heading font-bold text-brand text-xs block">₹{item.basePrice}</span>
                </div>
                <button
                  onClick={(e) => handleQuickAddFavourite(item, e)}
                  className="px-3 py-1 bg-brand text-white font-heading font-bold text-[9px] rounded-pill shadow-sm hover:bg-brand-accent active:scale-95 transition-all uppercase tracking-wider shrink-0"
                >
                  Add
                </button>
              </Card>
            ))
          )}
        </div>
      </BottomSheet>

      {/* HELP & SUPPORT BOTTOM SHEET */}
      <BottomSheet
        isOpen={supportOpen}
        onClose={() => setSupportOpen(false)}
        title="Contact & Support"
      >
        <div className="space-y-6 pb-6 text-left">
          {/* Visit Us */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-brand">
              <MapPin className="w-5 h-5 shrink-0" />
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider">Visit Us</h4>
            </div>
            <p className="text-xs font-body text-text-secondary leading-relaxed pl-7.5">
              Opposite Sir Syed Gate, University of Kashmir,<br />
              Hazratbal, 190006
            </p>
          </div>

          {/* Contact Us */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-brand">
              <Phone className="w-5 h-5 shrink-0" />
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider">Contact Us</h4>
            </div>
            <div className="text-xs font-body text-text-secondary pl-7.5 space-y-1">
              <p>
                TollFree Number:{' '}
                <a href="tel:18008913027" className="font-heading font-bold text-brand hover:underline">
                  18008913027
                </a>
              </p>
              <p>
                Mobile:{' '}
                <a href="tel:9070494949" className="font-heading font-bold text-brand hover:underline">
                  90704 94949
                </a>
              </p>
            </div>
          </div>

          {/* Mail Us */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-brand">
              <Mail className="w-5 h-5 shrink-0" />
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider">Mail Us</h4>
            </div>
            <p className="text-xs font-body text-text-secondary pl-7.5">
              <a href="mailto:amigosfinedine@gmail.com" className="font-heading font-bold text-brand hover:underline">
                amigosfinedine@gmail.com
              </a>
            </p>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};

export default Profile;
