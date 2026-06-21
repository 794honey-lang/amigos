import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-card border border-border shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-stone-50/50 shrink-0">
          <h4 className="font-heading font-bold text-sm text-text-primary">
            {title}
          </h4>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-100 rounded-full text-text-secondary transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
