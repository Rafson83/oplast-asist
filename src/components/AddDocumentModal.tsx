'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { TargetType, DocumentType } from '@/types';

interface AddDocumentModalProps {
  initialTargetType?: TargetType;
  initialTargetId?: string;
  initialTargetName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddDocumentModal({
  initialTargetType = 'LINE',
  initialTargetId = '',
  initialTargetName = '',
  onClose,
  onSuccess,
}: AddDocumentModalProps) {
  const [targetType, setTargetType] = useState<TargetType>(initialTargetType);
  const [targetId, setTargetId] = useState<string>(initialTargetId);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState<DocumentType>('DTR');
  const [version, setVersion] = useState('1.0');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [availableTargets, setAvailableTargets] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadTargets() {
      try {
        if (targetType === 'LINE') {
          const res = await fetch('/api/lines');
          const data = await res.json();
          if (data.lines) setAvailableTargets(data.lines);
        } else if (targetType === 'CABINET') {
          const res = await fetch('/api/cabinets');
          const data = await res.json();
          if (data.cabinets) setAvailableTargets(data.cabinets);
        } else if (targetType === 'DEVICE') {
          const res = await fetch('/api/devices');
          const data = await res.json();
          if (data.devices) setAvailableTargets(data.devices);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadTargets();
  }, [targetType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Wprowadź tytuł dokumentu');
      return;
    }
    if (!file) {
      setErrorMessage('Wybierz plik dokumentacji (np. PDF, ZIP, DWG)');
      return;
    }
    const finalTargetId = targetId || initialTargetId || (availableTargets[0]?.id ?? '');
    if (!finalTargetId) {
      setErrorMessage('Wybierz obiekt nadrzędny dokumentacji');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Upload file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'docs');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.fileUrl) {
        throw new Error(uploadData.error || 'Błąd wgrywania pliku');
      }

      // 2. Create document record
      const docRes = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetId: finalTargetId,
          title,
          docType,
          version,
          fileUrl: uploadData.fileUrl,
          fileName: uploadData.fileName,
          fileSize: uploadData.fileSize,
          mimeType: uploadData.mimeType,
          description,
        }),
      });

      const docData = await docRes.json();
      if (!docRes.ok) {
        throw new Error(docData.error || 'Błąd zapisu dokumentacji');
      }

      if (onSuccess) onSuccess();
      onClose();
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Wystąpił błąd';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            Cyfrowa DTR & Baza Schematów
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Dodaj Dokumentację Techniczną
          </h2>
          <p className="text-xs text-slate-400">
            Wgraj kartę DTR, schemat elektryczny EPLAN, podręcznik DTR lub kopię PLC.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-950/70 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Poziom przypisania dokumentu
              </label>
              <select
                value={targetType}
                onChange={(e) => {
                  setTargetType(e.target.value as TargetType);
                  setTargetId('');
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="LINE">Cała Linia Produkcyjna</option>
                <option value="CABINET">Szafa Sterownicza</option>
                <option value="DEVICE">Konkretne Urządzenie / Komponent</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Wybierz obiekt
              </label>
              {initialTargetId && initialTargetName ? (
                <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-emerald-300 font-semibold truncate">
                  {initialTargetName}
                </div>
              ) : (
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Wybierz z listy --</option>
                  {availableTargets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.code})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Doc Type & Version */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Rodzaj dokumentu
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="DTR">DTR - Dokumentacja Techniczno-Ruchowa</option>
                <option value="ELECTRICAL_SCHEMATIC">Schemat Elektryczny (EPLAN)</option>
                <option value="PNEUMATIC_SCHEMATIC">Schemat Pneumatyczny / Hydrauliczny</option>
                <option value="USER_MANUAL">Instrukcja Obsługi / Karta Katalogowa</option>
                <option value="PLC_BACKUP">Backup programu PLC / HMI / Napędu</option>
                <option value="INSPECTION_REPORT">Protokół Przeglądu / Pomiary</option>
                <option value="CERTIFICATE">Deklaracja CE / Atest</option>
                <option value="OTHER">Inny dokument</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Wersja / Rewizja
              </label>
              <input
                type="text"
                placeholder="np. Rev 1.2 lub 2024.1"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Tytuł dokumentu *
            </label>
            <input
              type="text"
              placeholder="np. Schemat połączeń szafy głównej =W1+KM01"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Opis / Uwagi do dokumentacji
            </label>
            <textarea
              rows={2}
              placeholder="Dodatkowe informacje, zakres zmian, data zatwierdzenia..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* File Picker */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Plik dokumentu (PDF, ZIP, DWG, TXT, zdjęcia) *
            </label>
            <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-4 text-center transition bg-slate-950">
              <input
                type="file"
                id="doc-file-input"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label htmlFor="doc-file-input" className="cursor-pointer flex flex-col items-center">
                <FileText className="w-8 h-8 text-emerald-400 mb-1.5" />
                {file ? (
                  <div className="text-xs text-emerald-300 font-semibold">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                ) : (
                  <>
                    <span className="text-xs font-semibold text-slate-200">
                      Kliknij, aby wybrać plik z dysku
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      Obsługiwane: PDF, DWG, EPLAN, obrazy, archiwa ZIP
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              {isSubmitting ? 'Wgrywanie pliku...' : 'Zapisz dokument'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
