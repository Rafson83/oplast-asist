'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, Camera, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { TargetType, EventType, EventPriority, EventStatus, PhotoType } from '@/types';

interface AddEventModalProps {
  initialTargetType?: TargetType;
  initialTargetId?: string;
  initialTargetName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PhotoUploadItem {
  file: File;
  previewUrl: string;
  photoType: PhotoType;
  caption: string;
}

export function AddEventModal({
  initialTargetType = 'LINE',
  initialTargetId = '',
  initialTargetName = '',
  onClose,
  onSuccess,
}: AddEventModalProps) {
  const [targetType, setTargetType] = useState<TargetType>(initialTargetType);
  const [targetId, setTargetId] = useState<string>(initialTargetId);
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<EventType>('MODIFICATION');
  const [priority, setPriority] = useState<EventPriority>('HIGH');
  const [status, setStatus] = useState<EventStatus>('OPEN');
  const [description, setDescription] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const [availableTargets, setAvailableTargets] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [photos, setPhotos] = useState<PhotoUploadItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load targets when targetType changes if not already set
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

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    const newItems: PhotoUploadItem[] = newFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      photoType: eventType === 'MODIFICATION' ? 'AFTER' : 'GENERAL',
      caption: '',
    }));
    setPhotos((prev) => [...prev, ...newItems]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePhotoMeta = (index: number, field: 'photoType' | 'caption', value: string) => {
    setPhotos((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMessage('Wprowadź tytuł i opis zdarzenia');
      return;
    }
    const finalTargetId = targetId || initialTargetId || (availableTargets[0]?.id ?? '');
    if (!finalTargetId) {
      setErrorMessage('Wybierz obiekt powiązany (linię, szafę lub urządzenie)');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Upload photos first
      const uploadedPhotosList: Array<{ photoType: PhotoType; caption: string; fileUrl: string }> = [];

      for (const p of photos) {
        const formData = new FormData();
        formData.append('file', p.file);
        formData.append('type', 'photos');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.fileUrl) {
          uploadedPhotosList.push({
            photoType: p.photoType,
            caption: p.caption,
            fileUrl: uploadData.fileUrl,
          });
        }
      }

      // 2. Submit event
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetId: finalTargetId,
          title,
          eventType,
          priority,
          status,
          description,
          actionsTaken,
          assignedTo,
          photos: uploadedPhotosList,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Nie udało się zapisać');
      }

      if (onSuccess) onSuccess();
      onClose();
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Wystąpił błąd podczas zapisu';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            Rejestracja Zdarzenia / Zmiany Maszyny
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Nowy wpis do Dziennika Zdarzeń & Modyfikacji
          </h2>
          <p className="text-xs text-slate-400">
            Zgłoś awarię, wymianę części lub udokumentuj modyfikację połączeń ze zdjęciami.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-950/70 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Typ obiektu
              </label>
              <select
                value={targetType}
                onChange={(e) => {
                  setTargetType(e.target.value as TargetType);
                  setTargetId('');
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="LINE">Linia Produkcyjna</option>
                <option value="CABINET">Szafa Sterownicza</option>
                <option value="DEVICE">Urządzenie / Komponent / PLC</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Wybierz maszynę / szafę / aparat
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

          {/* Event Type & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Kategoria zdarzenia
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="MODIFICATION">Modyfikacja połączeń / schematu</option>
                <option value="INCIDENT">Awaria / Usterka</option>
                <option value="MAINTENANCE">Wymiana części / Serwis</option>
                <option value="INSPECTION">Przegląd okresowy / Pomiary</option>
                <option value="NOTE">Notatka / Zmiana nastaw</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Priorytet
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as EventPriority)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="CRITICAL">Krytyczny (Stop linii)</option>
                <option value="HIGH">Wysoki</option>
                <option value="MEDIUM">Średni</option>
                <option value="LOW">Niski</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="OPEN">Otwarte (Do zrobienia)</option>
                <option value="IN_PROGRESS">W trakcie prac</option>
                <option value="RESOLVED">Rozwiązane / Zakończone</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Tytuł zdarzenia / zmiany *
            </label>
            <input
              type="text"
              placeholder="np. Dołożenie przekaźnika SSR do strefy Z4, wymiana bezpiecznika..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Dokładny opis problemu lub wprowadzonych zmian *
            </label>
            <textarea
              rows={3}
              placeholder="Opisz co zostało zmienione, które zaciski przepięto, jakie nowe podzespoły zamontowano..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Actions taken */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Podjęte działania i wyniki pomiarów (opcjonalnie)
            </label>
            <textarea
              rows={2}
              placeholder="np. Wykonano pomiar pętli zwarcia, zaktualizowano schemat EPLAN..."
              value={actionsTaken}
              onChange={(e) => setActionsTaken(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Photo uploads section */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Zdjęcia zmian, połączeń i aparatury</span>
              </div>
              <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Dodaj zdjęcia</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
            </div>

            {photos.length === 0 ? (
              <div className="text-center py-4 border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
                Brak dodanych zdjęć. Możesz dodać zdjęcia przed i po zmianie okablowania.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {photos.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 bg-slate-900 p-2 rounded-lg border border-slate-800"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.previewUrl}
                      alt="Podgląd"
                      className="w-12 h-12 rounded object-cover border border-slate-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={item.photoType}
                        onChange={(e) => updatePhotoMeta(idx, 'photoType', e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-[11px] text-white"
                      >
                        <option value="BEFORE">Stan PRZED zmianą</option>
                        <option value="DURING">W trakcie modyfikacji</option>
                        <option value="AFTER">Stan PO zmianie</option>
                        <option value="SCHEMATIC">Wycinek schematu</option>
                        <option value="GENERAL">Zdjęcie ogólne</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Krótki podpis (np. nowa listwa -X2.1)..."
                        value={item.caption}
                        onChange={(e) => updatePhotoMeta(idx, 'caption', e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-[11px] text-white placeholder-slate-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
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
              {isSubmitting ? 'Zapisywanie...' : 'Zapisz zdarzenie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
