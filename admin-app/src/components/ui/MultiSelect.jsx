import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export const MultiSelect = ({ 
  label, 
  options = [], 
  selectedValues = ['all'], 
  onChange, 
  placeholder = 'Select options...' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search query
  const filteredOptions = options.filter(option => 
    option.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (value) => {
    if (value === 'all') {
      onChange(['all']);
    } else {
      let next = selectedValues.filter(v => v !== 'all');
      if (next.includes(value)) {
        next = next.filter(v => v !== value);
      } else {
        next = [...next, value];
      }
      // If list is empty, default back to 'all'
      if (next.length === 0) {
        onChange(['all']);
      } else {
        onChange(next);
      }
    }
  };

  const getButtonText = () => {
    if (selectedValues.includes('all')) {
      return `All ${label}s`;
    }
    if (selectedValues.length === 1) {
      const match = options.find(o => o.id === selectedValues[0]);
      return match ? match.name : placeholder;
    }
    return `${selectedValues.length} Selected`;
  };

  return (
    <div className="relative inline-block text-left w-full md:w-56" ref={dropdownRef}>
      {/* Label and Selected Info */}
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-1.5 border border-stone-300 rounded-input focus:outline-none focus:border-brand bg-white font-semibold text-xs text-text-primary shadow-sm hover:bg-stone-50 transition-colors cursor-pointer"
        >
          <span className="truncate pr-1">{getButtonText()}</span>
          <ChevronDown className="w-3.5 h-3.5 text-text-secondary shrink-0" />
        </button>
      </div>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 left-0 mt-1 bg-white border border-border rounded-card shadow-lg z-50 p-2 space-y-2 animate-fadeIn min-w-[200px]">
          {/* Search bar (only if options > 5) */}
          {options.length > 5 && (
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 border border-stone-250 rounded-input text-xs focus:outline-none focus:border-brand bg-stone-50 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Options list */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5">
            {/* 'All' Option */}
            <label
              onClick={() => handleToggle('all')}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer text-xs font-heading font-semibold transition-colors ${
                selectedValues.includes('all')
                  ? 'bg-brand/5 text-brand'
                  : 'text-text-secondary hover:bg-stone-50 hover:text-text-primary'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedValues.includes('all')}
                  readOnly
                  className="rounded text-brand focus:ring-brand w-3.5 h-3.5"
                />
                <span>All {label}s</span>
              </div>
              {selectedValues.includes('all') && <Check className="w-3.5 h-3.5 text-brand" />}
            </label>

            <div className="border-t border-stone-100 my-1" />

            {/* Individual Options */}
            {filteredOptions.length === 0 ? (
              <p className="text-[10px] text-text-muted text-center py-2">No options found</p>
            ) : (
              filteredOptions.map((option) => {
                const isChecked = selectedValues.includes(option.id);
                return (
                  <label
                    key={option.id}
                    onClick={() => handleToggle(option.id)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer text-xs font-medium transition-colors ${
                      isChecked
                        ? 'bg-brand/5 text-brand font-semibold'
                        : 'text-text-secondary hover:bg-stone-50 hover:text-text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="rounded text-brand focus:ring-brand w-3.5 h-3.5"
                      />
                      <span>{option.name}</span>
                    </div>
                    {isChecked && <Check className="w-3.5 h-3.5 text-brand" />}
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
