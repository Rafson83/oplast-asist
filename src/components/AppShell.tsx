'use client';

import React, { useState } from 'react';
import { HeaderNavbar } from './HeaderNavbar';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { User } from '@/types';

interface AppShellProps {
  currentUser: User | null;
  children: React.ReactNode;
}

export function AppShell({ currentUser, children }: AppShellProps) {
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <HeaderNavbar 
        currentUser={currentUser} 
        onMenuToggle={() => setIsSidebarMobileOpen((prev) => !prev)} 
      />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar 
          userRole={currentUser?.role || 'OPERATOR'} 
          isOpen={isSidebarMobileOpen}
          onClose={() => setIsSidebarMobileOpen(false)}
        />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {currentUser && (
        <MobileBottomNav userRole={currentUser.role} />
      )}
    </div>
  );
}
