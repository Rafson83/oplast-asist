'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Printer, CheckSquare, Square, Filter, Layers, Cpu, Wrench } from 'lucide-react';
import { TargetType } from '@/types';

interface PrintableItem {
  type: TargetType;
  id: string;
  name: string;
  code: string;
  qrCode: string;
  locationDetails?: string;
  qrDataUrl?: string;
}

interface PrintLabelsViewProps {
  items: PrintableItem[];
}

export function PrintLabelsView({ items: initialItems }: PrintLabelsViewProps) {
  const [itemsWithQr, setItemsWithQr] = useState<PrintableItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    async function generateQrs() {
      const generated = await Promise.all(
        initialItems.map(async (item) => {
          try {
            const qrDataUrl = await QRCode.toDataURL(item.qrCode, {
              width: 300,
              margin: 1,
              color: { dark: '#000000', light: '#ffffff' },
            });
            return { ...item, qrDataUrl };
          } catch {
            return item;
          }
        })
      );
      setItemsWithQr(generated);
      setSelectedIds(new Set(generated.map((i) => i.id)));
    }
    generateQrs();
  }, [initialItems]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(itemsWithQr.map((i) => i.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const filteredItems = itemsWithQr.filter((item) => {
    if (filterType === 'ALL') return true;
    return item.type === filterType;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Screen Header (Hidden in Print) */}
      <div className="print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Generator Oznaczeń Przemysłowych</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Drukuj Etykiety QR na Szafy i Urządzenia
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Wydrukuj etykiety samoprzylepne na obudowy szaf sterowniczych, panele HMI i sterowniki PLC.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-900/30 cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Drukuj wybrane ({selectedIds.size})</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Filtruj:</span>
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filterType === 'ALL' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Wszystkie ({itemsWithQr.length})
            </button>
            <button
              onClick={() => setFilterType('LINE')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filterType === 'LINE' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Linie
            </button>
            <button
              onClick={() => setFilterType('CABINET')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filterType === 'CABINET' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Szafy
            </button>
            <button
              onClick={() => setFilterType('DEVICE')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filterType === 'DEVICE' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Urządzenia
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className="text-xs text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700"
            >
              Zaznacz wszystkie
            </button>
            <button
              onClick={deselectAll}
              className="text-xs text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700"
            >
              Odznacz wszystkie
            </button>
          </div>
        </div>
      </div>

      {/* Printable Grid of QR Labels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 print:grid-cols-2 gap-4 print:gap-3">
        {filteredItems.map((item) => {
          const isSelected = selectedIds.has(item.id);
          return (
            <div
              key={item.id}
              onClick={() => toggleSelect(item.id)}
              className={`
                border-2 rounded-xl p-4 transition cursor-pointer relative flex flex-col items-center text-center
                ${isSelected 
                  ? 'bg-white text-black border-slate-900 shadow-md' 
                  : 'bg-slate-900/50 text-slate-400 border-slate-800 opacity-60 print:hidden'}
                print:bg-white print:text-black print:border-black print:border-2 print:shadow-none print:break-inside-avoid
              `}
            >
              {/* Checkbox badge on screen */}
              <div className="print:hidden absolute top-3 right-3">
                {isSelected ? (
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500" />
                )}
              </div>

              {/* Label Content (Industrial format) */}
              <div className="w-full border-b-2 border-black pb-1.5 mb-2">
                <div className="font-black text-xs tracking-wider uppercase text-black">
                  OPLAST • CYFROWE DTR
                </div>
                <div className="text-[10px] font-bold text-slate-600 uppercase">
                  {item.type === 'LINE' ? 'LINIA PRODUKCYJNA' : item.type === 'CABINET' ? 'SZAFA STEROWNICZA' : 'APARAT / PODZESPÓŁ'}
                </div>
              </div>

              <div className="font-bold text-xs text-black px-1 leading-tight line-clamp-1 mb-1">
                {item.name}
              </div>

              {item.qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.qrDataUrl}
                  alt={item.code}
                  className="w-32 h-32 my-1 border border-slate-200 p-1 rounded"
                />
              ) : (
                <div className="w-32 h-32 flex items-center justify-center text-xs">...</div>
              )}

              <div className="font-mono font-black text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-300 text-black mt-1">
                {item.code}
              </div>

              <div className="text-[10px] text-slate-600 mt-2 line-clamp-1">
                {item.locationDetails}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
