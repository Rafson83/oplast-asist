'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  QrCode, 
  PlusCircle, 
  LogOut, 
  ShieldCheck, 
  Search, 
  Cpu, 
  Menu, 
  X,
  UserCheck,
  AlertOctagon,
  MessageSquare,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { User } from '@/types';
import { QrScannerModal } from './QrScannerModal';
import { AddEventModal } from './AddEventModal';

interface HeaderNavbarProps {
  currentUser: User | null;
  onMenuToggle?: () => void;
}

export function HeaderNavbar({ currentUser, onMenuToggle }: HeaderNavbarProps) {
  const router = useRouter();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleFastLogin = async (username: string) => {
    const passwords: Record<string, string> = {
      admin: 'admin123',
      automatyk: 'auto123',
      operator: 'oper123',
    };
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: passwords[username] || 'admin123' }),
    });
    window.location.reload();
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');

    try {
      const res = await fetch(`/api/qr/lookup?code=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (res.ok && data.url) {
        setSearchQuery('');
        router.push(data.url);
      } else {
        setSearchError('Nie znaleziono takiego oznaczenia (np. LIN-WTR-01, =W1+KM01-S01, -1K1-PLC)');
        setTimeout(() => setSearchError(''), 4000);
      }
    } catch {
      setSearchError('Błąd wyszukiwania');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left Brand */}
          <div className="flex items-center gap-3">
            {onMenuToggle && (
              <button 
                onClick={onMenuToggle}
                className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight leading-none text-white flex items-center gap-1.5">
                  Oplast<span className="text-emerald-400">Asist</span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">DTR</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium leading-tight">Utrzymanie Ruchu & Ewidencja</span>
              </div>
            </Link>
          </div>

          {/* Quick Search Bar */}
          <div className="hidden sm:flex flex-1 max-w-md mx-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Szukaj kodu KKS, szafy, linii (np. KM01, -1K1, LIN)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-20 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-1.5 top-1 px-2 py-0.5 text-[10px] font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition"
              >
                {isSearching ? '...' : 'Szukaj'}
              </button>
              {searchError && (
                <div className="absolute top-10 left-0 right-0 bg-rose-900 text-rose-200 text-[11px] p-2 rounded shadow-lg border border-rose-700 z-50">
                  {searchError}
                </div>
              )}
            </form>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Live Faults */}
            <Link
              href="/faults"
              className="flex items-center gap-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/80 px-2.5 py-1.5 rounded-lg text-xs font-bold transition"
              title="Rejestr bieżących awarii i postojów"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Awarie</span>
            </Link>

            {/* Quick Slack / Chat */}
            <Link
              href="/chat"
              className="flex items-center gap-1.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-800/80 px-2.5 py-1.5 rounded-lg text-xs font-bold transition"
              title="Komunikator Utrzymania Ruchu & Fabryki"
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Czat UR</span>
            </Link>

            {/* QR Scan Button */}
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition hover:shadow-emerald-600/20 cursor-pointer active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden xs:inline">Skanuj QR</span>
            </button>

            {/* Quick Report Event */}
            {currentUser && (
              <button
                onClick={() => setIsAddEventOpen(true)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span className="hidden md:inline">Zgłoś zdarzenie</span>
              </button>
            )}

            {/* User Info / Role */}
            {currentUser ? (
              <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-200 leading-tight">{currentUser.name}</span>
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                      {currentUser.role === 'ADMIN' ? 'Kierownik UR' : currentUser.role === 'MAINTENANCE' ? 'Automatyk' : 'Operator'}
                    </span>
                  </div>
                </div>

                {/* Quick Role switch dropdown / popover */}
                <div className="relative" ref={userMenuRef}>
                  <button 
                    type="button"
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    title="Przełącz konto testowe / profil"
                    className={`flex items-center gap-1 p-1.5 rounded-lg border transition cursor-pointer ${
                      isUserMenuOpen 
                        ? 'bg-slate-800 border-emerald-500/50 text-white shadow ring-2 ring-emerald-500/30' 
                        : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 py-1.5 border-b border-slate-800 mb-1.5 flex items-center justify-between">
                        <span>Przełącz konto (profil)</span>
                        <span className="text-emerald-400 font-semibold">OplastAsist</span>
                      </div>

                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleFastLogin('admin');
                          }}
                          className={`w-full text-left p-2 rounded-xl text-xs transition flex items-center justify-between cursor-pointer ${
                            currentUser.username === 'admin' 
                              ? 'bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm' 
                              : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-white">Jan Kowalski</div>
                            <div className="text-[10px] text-purple-400 font-semibold">Kierownik UR (Admin)</div>
                          </div>
                          {currentUser.username === 'admin' && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleFastLogin('automatyk');
                          }}
                          className={`w-full text-left p-2 rounded-xl text-xs transition flex items-center justify-between cursor-pointer ${
                            currentUser.username === 'automatyk' 
                              ? 'bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm' 
                              : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-white">Marek Nowak</div>
                            <div className="text-[10px] text-amber-400 font-semibold">Główny Automatyk UR</div>
                          </div>
                          {currentUser.username === 'automatyk' && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleFastLogin('operator');
                          }}
                          className={`w-full text-left p-2 rounded-xl text-xs transition flex items-center justify-between cursor-pointer ${
                            currentUser.username === 'operator' 
                              ? 'bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm' 
                              : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-white">Tomasz Wiśniewski</div>
                            <div className="text-[10px] text-emerald-400 font-semibold">Operator Produkcji</div>
                          </div>
                          {currentUser.username === 'operator' && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                        </button>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full text-left p-2 rounded-xl text-xs text-rose-300 hover:bg-rose-950/50 hover:text-rose-200 transition flex items-center gap-2 cursor-pointer font-semibold"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Wyloguj z systemu</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  title="Wyloguj się"
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Logowanie
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* QR Scanner Modal */}
      {isQrModalOpen && (
        <QrScannerModal onClose={() => setIsQrModalOpen(false)} />
      )}

      {/* Add Event Modal */}
      {isAddEventOpen && (
        <AddEventModal onClose={() => setIsAddEventOpen(false)} />
      )}
    </>
  );
}
