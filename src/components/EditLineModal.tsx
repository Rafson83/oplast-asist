'use client';

import React, { useState } from 'react';
import { X, Save, AlertCircle, CheckCircle, Wrench, Layers } from 'lucide-react';
import { ProductionLine, LineStatus } from '@/types';

interface EditLineModalProps {
  line: ProductionLine;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditLineModal({ line, onClose, onSuccess }: EditLineModalProps) {
  const [name, setName] = useState(line.name);
  const [code, setCode] = useState(line.code);
  const [status, setStatus] = useState<LineStatus>(line.status);
  const [description, setDescription] = useState(line.description || '');
  const [manufacturer, setManufacturer] = useState(line.manufacturer || '');
  const [year, setYear] = useState<number | string>(line.year || '');
  const [serialNumber, setSerialNumber] = useState(line.serialNumber || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setErrorMessage('Nazwa i kod linii są wymagane');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch(`/api/lines/${line.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim(),
          status,
          description: description.trim(),
          manufacturer: manufacturer.trim(),
          year: year ? parseInt(year.toString(), 10) : null,
          serialNumber: serialNumber.trim(),
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Błąd zapisu');
      }

      if (onSuccess) onSuccess();
      onClose();
      window.location.reload();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Wystąpił błąd');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Edycja Parametrów Maszyny</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Edytuj Linię / Maszynę
          </h2>
          <p className="text-xs text-slate-400">
            Zmień status operacyjny, dane znamionowe lub opis linii
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-950/70 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Status (Prominent) */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Status operacyjny linii na hali *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LineStatus)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
            >
              <option value="RUNNING">🟢 Praca Ciągła (Sprawna)</option>
              <option value="WARNING">🟡 Ostrzeżenie (Drobna usterka / kontrola)</option>
              <option value="STOPPED">🔴 Postój / Awaria (Stop produkcji)</option>
              <option value="MAINTENANCE">🔵 Przegląd Okresowy / Przezbrojenie</option>
            </select>
          </div>

          {/* Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Nazwa maszyny *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Kod zakładowy / KKS *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                required
              />
            </div>
          </div>

          {/* Manufacturer & Year & Serial */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Producent
              </label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Rok budowy
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Numer seryjny
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Opis techniczny i przeznaczenie
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold transition cursor-pointer"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Zapisywanie...' : 'Zapisz zmiany'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
