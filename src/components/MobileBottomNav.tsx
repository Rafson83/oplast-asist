'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, QrCode, AlertOctagon, MessageSquare, HardHat, Wrench } from 'lucide-react';
import { UserRole } from '@/types';

export function MobileBottomNav({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname();

  const links = [
    {
      label: 'Pulpit',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      label: 'Awarie',
      href: '/faults',
      icon: AlertOctagon,
      active: pathname.startsWith('/faults'),
    },
    {
      label: 'Skaner QR',
      href: '/qr-scanner',
      icon: QrCode,
      active: pathname === '/qr-scanner',
      highlight: true,
    },
    {
      label: 'Czat UR',
      href: '/chat',
      icon: MessageSquare,
      active: pathname.startsWith('/chat'),
    },
    {
      label: 'Operator',
      href: '/operator',
      icon: HardHat,
      active: pathname.startsWith('/operator'),
    },
  ];

  return (
    <nav 
      aria-label="Nawigacja mobilna"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl pb-safe"
    >
      {links.map((item) => {
        const Icon = item.icon;
        if (item.highlight) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center -mt-5 group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-900/50 group-active:scale-95 transition">
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-emerald-400 mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition ${
              item.active ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
