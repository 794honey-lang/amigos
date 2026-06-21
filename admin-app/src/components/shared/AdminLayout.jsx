import React from 'react';
import { Sidebar } from '../ui/Sidebar';
import { TopBar } from '../ui/TopBar';
import { Toast } from '../ui/Toast';

export const AdminLayout = ({ children }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-bg">
          {children}
        </main>
      </div>
      <Toast />
    </div>
  );
};

export default AdminLayout;
