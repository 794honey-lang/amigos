import React, { useState } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { Checkbox } from '../ui/Checkbox';
import { mockToppings } from '../../mocks/mockToppings';

export const ToppingsBottomSheet = ({
  isOpen,
  onClose,
  isVeg = true,
  selectedToppings = [],
  onApplyToppings
}) => {
  const [activeTab, setActiveTab] = useState('veg');
  const [localSelections, setLocalSelections] = useState(selectedToppings);

  // Sync state when sheet opens
  React.useEffect(() => {
    if (isOpen) {
      setLocalSelections(selectedToppings);
    }
  }, [isOpen, selectedToppings]);

  const handleToggleTopping = (topping) => {
    const isAlreadySelected = localSelections.some(t => t.id === topping.id);
    if (isAlreadySelected) {
      setLocalSelections(localSelections.filter(t => t.id !== topping.id));
    } else {
      setLocalSelections([...localSelections, { id: topping.id, name: topping.name, price: topping.price }]);
    }
  };

  const getRunningTotal = () => {
    return localSelections.reduce((sum, t) => sum + t.price, 0);
  };

  const handleDone = () => {
    onApplyToppings(localSelections);
    onClose();
  };

  // Tabs list: hide non-veg toppings if pizza is vegetarian
  const tabs = [
    { key: 'veg', label: 'Veg Toppings' },
    { key: 'exotic', label: 'Exotic Toppings' },
    ...(!isVeg ? [{ key: 'nonveg', label: 'Mutton Toppings' }] : [])
  ];

  const currentToppings = mockToppings[activeTab] || [];

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Add Toppings"
      className="pb-0"
    >
      <div className="space-y-5 flex flex-col h-full max-h-[75vh]">
        
        {/* Horizontal tabs */}
        <div className="flex border-b border-border">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 pb-3 text-xs font-heading font-bold text-center border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-brand text-brand'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Checkbox Listing scroll view */}
        <div className="overflow-y-auto space-y-2.5 max-h-[40vh] pr-1 py-1">
          {currentToppings.map(topping => {
            const isChecked = localSelections.some(t => t.id === topping.id);
            return (
              <Checkbox
                key={topping.id}
                id={topping.id}
                label={topping.name}
                price={topping.price}
                checked={isChecked}
                onChange={() => handleToggleTopping(topping)}
              />
            );
          })}
        </div>

        {/* Sticky footer */}
        <div className="pt-4 border-t border-border mt-auto pb-6">
          <button
            onClick={handleDone}
            className="w-full bg-brand hover:bg-brand-accent text-white font-heading font-semibold rounded-pill py-3.5 shadow-md flex items-center justify-center gap-1.5 transition-all text-sm"
          >
            Done · Add ₹{getRunningTotal()}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default ToppingsBottomSheet;
