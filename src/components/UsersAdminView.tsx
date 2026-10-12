'use client';

import React from 'react';
import { Users, Shield, Wrench, HardHat, Mail, Calendar, Building } from 'lucide-react';
import { User } from '@/types';

interface UsersAdminViewProps {
  currentUser: User;
  users: User[];
}

export function UsersAdminView({ currentUser, users }: UsersAdminViewProps) {
  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <Shield className="w-3.5 h-3.5" />
            Administrator (Kierownik)
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <Wrench className="w-3.5 h-3.5" />
            Automatyk / Utrzymanie Ruchu
          </span>
        );
      case 'OPERATOR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            <HardHat className="w-3.5 h-3.5" />
            Operator Produkcji
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Zarządzanie Personelem & Uprawnieniami</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Użytkownicy i Role w OplastAsist
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Struktura ról, autoryzacji i odpowiedzialności w systemie cyfrowej DTR
        </p>
      </div>

      {/* Permissions Matrix Info Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Macierz Uprawnień Systemowych:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="font-bold text-purple-400 flex items-center gap-1.5 mb-1">
              <Shield className="w-4 h-4" />
              <span>Kierownik / Admin</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Pełny dostęp administracyjny: dodawanie nowych linii, zatwierdzanie dokumentacji DTR, zarządzanie użytkownikami, audyt modyfikacji maszyn.
            </p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
              <Wrench className="w-4 h-4" />
              <span>Automatyk / Utrzymanie Ruchu</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Wgrywanie schematów EPLAN, rejestrowanie zmian połączeń w szafach, dołączanie zdjęć przed/po zmianach, zamykanie zgłoszeń awarii.
            </p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="font-bold text-blue-400 flex items-center gap-1.5 mb-1">
              <HardHat className="w-4 h-4" />
              <span>Operator Produkcji</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Skanowanie kodów QR telefonem, szybki podgląd instrukcji stanowiskowej DTR, zgłaszanie awarii i nieprawidłowości w pracy maszyn.
            </p>
          </div>
        </div>
      </div>

      {/* Users Roster Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white">Aktywne Konta Pracownicze ({users.length})</h2>
        </div>

        <div className="divide-y divide-slate-800">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {u.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-sm text-white">{u.name}</span>
                    <span className="text-xs text-slate-400 font-mono">(@{u.username})</span>
                    {getRoleBadge(u.role)}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{u.email}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      <span>{u.department}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-1 self-start sm:self-auto">
                <Calendar className="w-3.5 h-3.5" />
                <span>Utworzono: {u.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
