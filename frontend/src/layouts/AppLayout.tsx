import React, { useState } from 'react';
import { Sidebar } from '../components/ui/Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
}

export function AppLayout({ children, title, actions }: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {actions && <div className="flex items-center gap-4">{actions}</div>}
          </div>
        </header>

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}