import React, { useState } from 'react';
import { Button } from '@shared/components/ui/Button';
import { Card } from '@shared/components/ui/Card';
import { Badge } from '@shared/components/ui/Badge';
import { Checkbox } from '@shared/components/ui/Checkbox';
import { RadioCard } from '@shared/components/ui/RadioCard';
import { QuantityStepper } from '@shared/components/ui/QuantityStepper';
import { Input } from '@shared/components/ui/Input';
import { VegBadge } from '@shared/components/ui/VegBadge';
import { BottomSheet } from '@shared/components/ui/BottomSheet';
import { StatusStepper } from '@shared/components/shared/StatusStepper';
import { useUiStore } from '@shared/store/uiStore';
import { ToastContainer } from '@shared/components/ui/Toast';
import { Menu, Star, ShoppingBag, Bell } from 'lucide-react';

export const Showcase = () => {
  const [qty, setQty] = useState(1);
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(true);
  const [radio, setRadio] = useState('med');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [stepperStatus, setStepperStatus] = useState('Preparing');
  const { addToast } = useUiStore();

  const handleToast = (type) => {
    addToast(`This is a simulated ${type} toast message!`, type);
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary p-6 md:p-12 pb-24 max-w-[480px] mx-auto bg-white shadow-xl relative">
      <ToastContainer />
      
      {/* Fake App Bar Header */}
      <header className="flex items-center justify-between pb-6 border-b border-border mb-8">
        <div className="flex items-center gap-2">
          <Menu className="w-6 h-6 text-brand" />
          <h1 className="font-display italic text-2xl font-bold text-brand">Amigos</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell className="w-6 h-6 text-text-secondary" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-brand rounded-full border border-white" />
          </div>
          <ShoppingBag className="w-6 h-6 text-text-secondary" />
        </div>
      </header>

      <div className="space-y-10">
        {/* Typography & Fonts Section */}
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-gold border-b border-border pb-1">Typography & Fonts</h2>
          <div className="space-y-1.5">
            <p className="font-display text-3xl italic font-semibold">Playfair Display (Italic 3xl)</p>
            <p className="font-heading font-bold text-lg">Poppins SemiBold/Bold (Heading lg)</p>
            <p className="font-body text-sm text-text-secondary">Poppins Regular/Medium body copy. Warm and readable.</p>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="space-y-4">
          <h2 className="font-heading font-bold text-lg text-gold border-b border-border pb-1">Buttons & Indicators</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" size="sm">Primary Sm</Button>
            <Button variant="primary">Primary Md</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
          <Button variant="primary" fullWidth size="lg">Full Width Large CTA</Button>
          
          <div className="flex items-center gap-4 p-3 bg-stone-50 rounded-card border border-border">
            <span className="text-xs font-heading font-semibold text-text-secondary">Veg/Non-Veg Indicators:</span>
            <div className="flex items-center gap-1.5">
              <VegBadge isVeg={true} />
              <span className="text-xs font-body font-medium text-green-700">Veg</span>
            </div>
            <div className="flex items-center gap-1.5">
              <VegBadge isVeg={false} />
              <span className="text-xs font-body font-medium text-red-800">Non-Veg</span>
            </div>
          </div>
        </section>

        {/* Form Inputs */}
        <section className="space-y-4">
          <h2 className="font-heading font-bold text-lg text-gold border-b border-border pb-1">Form Inputs</h2>
          <Input
            label="Mobile Number"
            placeholder="Enter 10-digit mobile number"
          />
          <Input
            label="Email Address"
            placeholder="Enter email address"
            error="Please enter a valid email address."
            defaultValue="invalid-email"
          />
          
          <div className="grid grid-cols-1 gap-2.5">
            <Checkbox
              id="c1"
              checked={check1}
              onChange={(e) => setCheck1(e.target.checked)}
              label="Extra Cheese (Veg Topping)"
              price={50}
            />
            <Checkbox
              id="c2"
              checked={check2}
              onChange={(e) => setCheck2(e.target.checked)}
              label="Mutton Keema (Non-veg Topping)"
              price={120}
            />
          </div>
        </section>

        {/* Selection Cards */}
        <section className="space-y-4">
          <h2 className="font-heading font-bold text-lg text-gold border-b border-border pb-1">Selection Cards</h2>
          <div className="grid grid-cols-3 gap-3">
            <RadioCard
              selected={radio === 'reg'}
              onClick={() => setRadio('reg')}
              title="Regular"
              subtitle="4 Slices"
              price={330}
            />
            <RadioCard
              selected={radio === 'med'}
              onClick={() => setRadio('med')}
              title="Medium"
              subtitle="6 Slices"
              price={550}
              badge="Popular"
            />
            <RadioCard
              selected={radio === 'lrg'}
              onClick={() => setRadio('lrg')}
              title="Large"
              subtitle="8 Slices"
              price={680}
            />
          </div>
          
          <div className="flex items-center justify-between p-3 border border-border rounded-card bg-white">
            <span className="text-sm font-heading font-semibold text-text-secondary">Quantity Selector</span>
            <QuantityStepper value={qty} onChange={setQty} />
          </div>
        </section>

        {/* Cards & Status Badges */}
        <section className="space-y-4">
          <h2 className="font-heading font-bold text-lg text-gold border-b border-border pb-1">Cards & Badges</h2>
          <Card className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <VegBadge isVeg={false} />
                  <h3 className="font-heading font-bold text-sm">Chicken Lovers Pizza</h3>
                </div>
                <p className="text-xs text-text-secondary font-body">Chicken Sausage, Chicken Salami, Hot Chicken</p>
              </div>
              <div className="w-16 h-16 bg-stone-100 rounded-card overflow-hidden shrink-0 flex items-center justify-center border border-border">
                <span className="text-stone-300 text-xs font-semibold">Pizza</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="font-heading font-bold text-brand text-base">₹370</span>
              <Button variant="outline" size="sm" className="px-4 py-1.5 h-8">
                Customize
              </Button>
            </div>
          </Card>

          <div className="flex flex-wrap gap-2.5">
            <Badge status="Placed" />
            <Badge status="Confirmed" />
            <Badge status="Preparing" />
            <Badge status="Ready" />
            <Badge status="OutForDelivery" />
            <Badge status="Delivered" />
            <Badge status="Cancelled" />
          </div>
        </section>

        {/* Dynamic Sheets & Toasts */}
        <section className="space-y-4">
          <h2 className="font-heading font-bold text-lg text-gold border-b border-border pb-1">Interactions & Modals</h2>
          <div className="flex flex-col gap-3">
            <Button onClick={() => setSheetOpen(true)} variant="outline">
              Open Bottom Sheet
            </Button>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={() => handleToast('success')}>
                Success Toast
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleToast('error')}>
                Error Toast
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleToast('info')}>
                Info Toast
              </Button>
            </div>
          </div>
        </section>

        {/* Shared Progress Stepper */}
        <section className="space-y-4">
          <h2 className="font-heading font-bold text-lg text-gold border-b border-border pb-1">Status Stepper (Shared)</h2>
          
          {/* Stepper controls */}
          <div className="flex flex-wrap gap-2 p-2 bg-stone-50 border border-border rounded-card mb-4 justify-center">
            {['Placed', 'Confirmed', 'Preparing', 'Ready', 'OutForDelivery', 'Delivered', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStepperStatus(status)}
                className={`px-2.5 py-1 text-[10px] font-heading font-semibold rounded-pill border ${
                  stepperStatus === status
                    ? 'bg-brand border-brand text-white'
                    : 'bg-white border-stone-200 text-text-secondary hover:bg-stone-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <Card className="p-6">
            <StatusStepper currentStatus={stepperStatus} orderDate="Today, 11:45 AM" />
          </Card>
        </section>
      </div>

      {/* Bottom Sheet Drawer */}
      <BottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Add Pizza Toppings"
      >
        <div className="space-y-4">
          <p className="text-xs text-text-secondary font-body">Select extra toppings to add to your pizza.</p>
          <div className="space-y-2">
            <Checkbox id="ts-1" checked={true} label="Onion" price={50} onChange={()=>{}} />
            <Checkbox id="ts-2" checked={false} label="Capsicum" price={60} onChange={()=>{}} />
            <Checkbox id="ts-3" checked={false} label="Black Olives" price={60} onChange={()=>{}} />
            <Checkbox id="ts-4" checked={false} label="Paneer Tikka" price={80} onChange={()=>{}} />
          </div>
          <Button variant="primary" fullWidth className="mt-4" onClick={() => setSheetOpen(false)}>
            Done (₹50)
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
};
export default Showcase;
