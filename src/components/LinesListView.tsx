'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  Search, 
  QrCode, 
  ChevronRight, 
  Building2, 
  Cpu, 
  FolderLock, 
  AlertOctagon,
  Wrench,
  Factory
} from 'lucide-react';
import { User, Department, ProductionLine } from '@/types';
import { LineStatusBadge } from './StatusBadge';
import { QrCodeModal } from './QrCodeModal';

interface LinesListViewProps {
  currentUser: User;
  departments: Department[];
  lines: ProductionLine[];
}

export function LinesListView({
  currentUser,
  departments,
  lines,
}: LinesListViewProps) {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [selectedQr, setSelectedQr] = useState<ProductionLine | null>(null);

  const filteredLines = lines.filter((line) => {
    const matchesDept = selectedDept === 'ALL' || line.departmentId === selectedDept;
    const matchesSearch =
      line.name.toLowerCase().includes(search.toLowerCase()) ||
      line.code.toLowerCase().includes(search.toLowerCase()) ||
      (line.manufacturer && line.manufacturer.toLowerCase().includes(search.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Factory className="w-4 h-4 text-emerald-400" />
            <span>Struktura Zakładu Oplast</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Linie Produkcyjne & Park Maszynowy
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Hierarchia: Wydział → Linia Produkcyjna → Szafy Sterownicze → Aparatura i PLC
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Department tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedDept('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedDept === 'ALL'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Wszystkie wydziały ({lines.length})
          </button>
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedDept === dept.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {dept.name} ({dept.linesCount || 0})
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Szukaj linii lub modelu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Lines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLines.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500 text-xs">
            Nie znaleziono linii spełniających kryteria wyszukiwania.
          </div>
        ) : (
          filteredLines.map((line) => (
            <div
              key={line.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-sm flex flex-col justify-between transition group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    {line.code}
                  </span>
                  <LineStatusBadge status={line.status} />
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition leading-snug">
                  {line.name}
                </h3>
                
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {line.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Producent:</span>
                    <span className="text-slate-200 font-medium">{line.manufacturer || '–'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rok budowy:</span>
                    <span className="text-slate-200 font-medium">{line.year || '–'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wydział:</span>
                    <span className="text-emerald-400 font-medium">{line.departmentName}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-blue-400" />
                    <span><b>{line.cabinetsCount}</b> szaf</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                    <span><b>{line.devicesCount}</b> aparatów</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedQr(line)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                    title="Pokaż etykietę QR do druku"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  <Link
                    href={`/lines/${line.id}`}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                  >
                    <span>Otwórz DTR</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* QR Modal */}
      {selectedQr && (
        <QrCodeModal
          title={selectedQr.name}
          code={selectedQr.code}
          qrCodeData={selectedQr.qrCode}
          typeText="Linia Produkcyjna"
          locationDetails={selectedQr.departmentName}
          targetUrl={`/lines/${selectedQr.id}`}
          onClose={() => setSelectedQr(null)}
        />
      )}
    </div>
  );
}
