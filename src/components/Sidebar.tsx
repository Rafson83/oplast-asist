'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  GitFork, 
  FolderLock, 
  History, 
  QrCode, 
  Printer, 
  Users, 
  Layers,
  ChevronRight,
  ShieldAlert,
  HardHat,
  Wrench,
  AlertOctagon,
  MessageSquare
} from 'lucide-react';
import { UserRole } from '@/types';

interface SidebarProps {
  userRole?: UserRole;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ userRole = 'OPERATOR', isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Pulpit Główny',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      name: 'Bieżące Awarie i Postoje',
      href: '/faults',
      icon: AlertOctagon,
      active: pathname.startsWith('/faults'),
      badge: 'LIVE',
    },
    {
      name: 'Czat UR (Slack Zakładowy)',
      href: '/chat',
      icon: MessageSquare,
      active: pathname.startsWith('/chat'),
    },
    {
      name: 'Profil Operatora',
      href: '/operator',
      icon: HardHat,
      active: pathname.startsWith('/operator'),
    },
    {
      name: 'Centrum Technika UR',
      href: '/technician',
      icon: Wrench,
      active: pathname.startsWith('/technician'),
    },
    {
      name: 'Linie i Szafy',
      href: '/lines',
      icon: Layers,
      active: pathname.startsWith('/lines') || pathname.startsWith('/cabinets') || pathname.startsWith('/devices'),
    },
    {
      name: 'Cyfrowa DTR i Schematy',
      href: '/dtr',
      icon: FolderLock,
      active: pathname.startsWith('/dtr'),
    },
    {
      name: 'Dziennik Zdarzeń i Zmian',
      href: '/events',
      icon: History,
      active: pathname.startsWith('/events'),
    },
    {
      name: 'Skaner Kodów QR',
      href: '/qr-scanner',
      icon: QrCode,
      active: pathname.startsWith('/qr-scanner'),
    },
    {
      name: 'Drukuj Etykiety QR',
      href: '/print-labels',
      icon: Printer,
      active: pathname.startsWith('/print-labels'),
    },
  ];

  if (userRole === 'ADMIN') {
    navItems.push({
      name: 'Użytkownicy i Uprawnienia',
      href: '/admin/users',
      icon: Users,
      active: pathname.startsWith('/admin/users'),
    });
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && onClose && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside className={`
        fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-40 transition-transform duration-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Nawigacja Zakładowa
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose && onClose()}
                  className={`
                    flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition
                    ${item.active 
                      ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 font-semibold' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${item.active ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-600 text-white animate-pulse">
                        {item.badge}
                      </span>
                    )}
                    {item.active && <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 pt-4 border-t border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Szybkie Filtry Działu UR
            </div>
            <div className="space-y-1">
              <Link
                href="/events?status=OPEN"
                onClick={() => onClose && onClose()}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-rose-300 hover:bg-rose-950/30 transition border border-transparent hover:border-rose-900/50"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Aktywne Awarie</span>
                </div>
                <span className="text-[10px] bg-rose-900/80 text-rose-200 px-1.5 py-0.5 rounded-full font-bold">LIVE</span>
              </Link>
              <Link
                href="/events?type=MODIFICATION"
                onClick={() => onClose && onClose()}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-amber-300 hover:bg-amber-950/30 transition border border-transparent hover:border-amber-900/50"
              >
                <div className="flex items-center gap-2">
                  <GitFork className="w-4 h-4 text-amber-400" />
                  <span>Modyfikacje Maszyn</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* System info footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
          <div className="text-[11px] text-slate-400">
            System: <span className="text-slate-200 font-semibold">OplastAsist v1.0</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Baza DTR & Schematów EPLAN
          </div>
        </div>
      </aside>
    </>
  );
}
