'use client';

import React, { useState } from 'react';
import { 
  Camera, 
  QrCode, 
  AlertOctagon, 
  CheckCircle2, 
  Clock, 
  Upload, 
  Send, 
  AlertTriangle,
  HardHat,
  ChevronRight,
  Sparkles,
  Zap,
  Building2,
  X,
  Layers,
  Wrench,
  Search
} from 'lucide-react';
import { User, ProductionLine, EventLog } from '@/types';
import { QrScannerModal } from './QrScannerModal';

interface OperatorProfileViewProps {
  currentUser: User;
  lines: ProductionLine[];
  recentIncidents: EventLog[];
}

export function OperatorProfileView({
  currentUser,
  lines,
  recentIncidents: initialIncidents,
}: OperatorProfileViewProps) {
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState<string>('');
  const [isMachineStopped, setIsMachineStopped] = useState<boolean>(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [recentIncidents, setRecentIncidents] = useState<EventLog[]>(initialIncidents);

  const selectedLine = lines.find((l) => l.id === selectedLineId);

  // Group lines by Department for clear plant navigation
  const departments = Array.from(new Set(lines.map((l) => l.departmentName || 'Inne')));

  const filteredLines = selectedDepartment === 'ALL'
    ? lines
    : lines.filter((l) => (l.departmentName || 'Inne') === selectedDepartment);

  const quickIssuePills = [
    'Zatrzymanie awaryjne (E-STOP)',
    'Błąd grzania strefy',
    'Wyciek oleju hydraulicznego',
    'Zacięcie dozownika tworzywa',
    'Alarm falownika silnika głównego',
    'Brak ciśnienia / podciśnienia',
  ];

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLineId) {
      setErrorMessage('Wybierz lub zeskanuj maszynę, której dotyczy problem.');
      return;
    }
    if (!title.trim() || !description.trim()) {
      setErrorMessage('Podaj krótki tytuł i opis usterki.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      let uploadedPhotoUrl = '';
      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        formData.append('type', 'photos');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.fileUrl) {
          uploadedPhotoUrl = uploadData.fileUrl;
        }
      }

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'LINE',
          targetId: selectedLineId,
          title: `[OPERATOR] ${title.trim()}`,
          eventType: 'INCIDENT',
          priority: isMachineStopped ? 'CRITICAL' : 'MEDIUM',
          status: 'OPEN',
          description: `${description.trim()}\n\n[Status maszyny: ${isMachineStopped ? 'ZATRZYMANA - STOP LINII' : 'Pracuje z usterką'}]`,
          photos: uploadedPhotoUrl
            ? [
                {
                  photoType: 'BEFORE',
                  caption: 'Zdjęcie usterki wykonane przez operatora',
                  fileUrl: uploadedPhotoUrl,
                },
              ]
            : [],
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Błąd zapisu zgłoszenia');
      }

      const createdEvent = await res.json();
      setSuccessMessage('Zgłoszenie awarii zostało natychmiast przekazane do Technika UR!');
      setTitle('');
      setDescription('');
      setPhotoFile(null);
      setPhotoPreview('');
      
      // Update local incidents list
      if (createdEvent) {
        setRecentIncidents((prev) => [
          {
            id: createdEvent.id || String(Date.now()),
            targetType: 'LINE',
            targetId: selectedLineId,
            targetName: selectedLine?.name || 'Maszyna',
            title: `[OPERATOR] ${title.trim()}`,
            eventType: 'INCIDENT',
            priority: isMachineStopped ? 'CRITICAL' : 'MEDIUM',
            status: 'OPEN',
            description,
            reportedBy: currentUser.id,
            reportedByName: currentUser.name,
            createdAt: 'Przed chwilą',
            updatedAt: 'Przed chwilą',
          },
          ...prev,
        ]);
      }

      setTimeout(() => setSuccessMessage(''), 8000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Wystąpił błąd podczas wysyłania');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-800/60 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0">
              <HardHat className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
                <span>Profil Operatora Produkcji</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-slate-400 font-normal">Dyżur aktywny</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Zgłaszanie Usterek i Awarie Maszyn
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Zalogowano: <b className="text-emerald-300 font-semibold">{currentUser.name}</b> • Zakład Oplast
              </p>
            </div>
          </div>

          {/* Quick Action Button for Camera Scanner */}
          <button
            type="button"
            onClick={() => setIsQrScannerOpen(true)}
            className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl font-black text-xs sm:text-sm shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2.5 transition transform active:scale-98 cursor-pointer shrink-0"
          >
            <Camera className="w-5 h-5 animate-pulse" />
            <span>ZESKANUJ MASZYNĘ (QR)</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-500 rounded-2xl text-xs sm:text-sm text-emerald-100 flex items-center gap-3 shadow-xl animate-in zoom-in-95">
          <CheckCircle2 className="w-6 h-6 text-emerald-300 shrink-0" />
          <div className="font-semibold leading-relaxed">{successMessage}</div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-rose-950/90 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2.5 shadow-lg">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Machine & Hall Selector (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>1. Wybierz Maszynę z Hali</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">
                {lines.length} obiektów
              </span>
            </div>

            {/* Department Pills */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedDepartment('ALL')}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  selectedDepartment === 'ALL'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Wszystkie hale
              </button>
              {departments.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDepartment(dept)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    selectedDepartment === dept
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            {/* Machines Grid/List */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {filteredLines.map((line) => {
                const isSelected = line.id === selectedLineId;
                return (
                  <button
                    key={line.id}
                    type="button"
                    onClick={() => {
                      setSelectedLineId(line.id);
                      setErrorMessage('');
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-500 shadow-md ring-2 ring-emerald-500/40'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {line.departmentName}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                          {line.code}
                        </span>
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-white truncate">
                        {line.name}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {isSelected ? (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-900/60 px-2 py-1 rounded-md border border-emerald-500/50">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Wybrano</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs hover:text-slate-300">
                          Wybierz →
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Fault Reporting Form (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>2. Formularz Awarii / Usterki</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Powiadamia dyżurnego Technika UR
              </span>
            </h2>

            {/* Selected Machine Alert / Display */}
            {selectedLine ? (
              <div className="p-3.5 bg-emerald-950/60 border border-emerald-600/70 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-500/30">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-emerald-400">
                      Zgłoszenie dla: {selectedLine.departmentName}
                    </div>
                    <div className="text-xs sm:text-sm font-black text-white">
                      {selectedLine.name} ({selectedLine.code})
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLineId('')}
                  className="text-[11px] text-slate-400 hover:text-rose-400 underline cursor-pointer"
                >
                  Zmień
                </button>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-center gap-2.5 text-xs text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Wybierz maszynę z listy po lewej stronie lub kliknij &quot;Zeskanuj maszynę (QR)&quot;.</span>
              </div>
            )}

            {/* Machine Stopped / Priority Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Czy linia / maszyna jest zatrzymana? *
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMachineStopped(true)}
                  className={`p-3.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2.5 cursor-pointer ${
                    isMachineStopped
                      ? 'bg-rose-950/80 border-rose-500 text-rose-100 shadow-md ring-2 ring-rose-500/50'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                  <div className="text-left">
                    <div className="leading-tight">TAK (STOP LINII)</div>
                    <div className="text-[10px] text-rose-300/80 font-normal">Postój produkcji</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMachineStopped(false)}
                  className={`p-3.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2.5 cursor-pointer ${
                    !isMachineStopped
                      ? 'bg-amber-950/80 border-amber-500 text-amber-100 shadow-md ring-2 ring-amber-500/50'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="text-left">
                    <div className="leading-tight">NIE (Pracuje z usterką)</div>
                    <div className="text-[10px] text-amber-300/80 font-normal">Wymaga przeglądu</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Title Suggestions */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Co się stało? (Temat usterki) *
                </label>
                <span className="text-[10px] text-slate-400">Szybkie podpowiedzi:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {quickIssuePills.map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => setTitle(pill)}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-1 rounded-md border border-slate-700 transition cursor-pointer"
                  >
                    + {pill}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="np. Alarm falownika pompy, wyciek oleju przy siłowniku..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                required
              />
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Szczegółowy opis (objawy, komunikat HMI, zachowanie maszyny) *
              </label>
              <textarea
                rows={3}
                placeholder="Opisz problem: jaki kod błędu widnieje na panelu HMI, co dokładnie zaszło, czy czuć spaleniznę, czy wybiło zabezpieczenie..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                required
              />
            </div>

            {/* Photo Upload Area */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Zdjęcie usterki / ekranu błędu (opcjonalnie)
              </label>
              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-3 bg-slate-950 text-center transition">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  id="operator-camera-upload"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                
                {photoPreview ? (
                  <div className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoPreview}
                      alt="Podgląd"
                      className="w-36 h-28 object-cover rounded-lg mx-auto border border-emerald-500 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 bg-rose-600 hover:bg-rose-500 text-white p-1 rounded-full shadow cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] text-emerald-400 font-semibold block mt-1">
                      Zdjęcie załączone pomyślnie
                    </span>
                  </div>
                ) : (
                  <label
                    htmlFor="operator-camera-upload"
                    className="cursor-pointer flex flex-col items-center justify-center p-3 text-slate-400 hover:text-white"
                  >
                    <Camera className="w-6 h-6 text-emerald-400 mb-1" />
                    <span className="text-xs font-bold text-slate-200">
                      Kliknij, aby zrobić zdjęcie aparatem lub wybrać plik z dysku
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      JPG, PNG, WebP do 10 MB
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Wysyłanie zgłoszenia do UR...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>WYŚLIJ ZGŁOSZENIE DO TECHNIKA UR</span>
                </>
              )}
            </button>
          </form>

          {/* Recent Plant Tickets Stream */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3.5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Ostatnie Awarie i Zgłoszenia na Zakładzie</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Bieżący podgląd</span>
            </h3>

            <div className="space-y-2">
              {recentIncidents.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  Brak otwartych zgłoszeń. Wszystkie linie produkcyjne pracują prawidłowo!
                </div>
              ) : (
                recentIncidents.slice(0, 5).map((inc) => (
                  <div
                    key={inc.id}
                    className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inc.priority === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {inc.priority === 'CRITICAL' ? 'STOP LINII' : 'Usterka'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {inc.createdAt}
                        </span>
                      </div>
                      <h4 className="font-bold text-white leading-tight">{inc.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{inc.targetName}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inc.status === 'OPEN'
                          ? 'bg-rose-950 text-rose-300'
                          : inc.status === 'IN_PROGRESS'
                          ? 'bg-blue-950 text-blue-300'
                          : 'bg-emerald-950 text-emerald-300'
                      }`}>
                        {inc.status === 'OPEN' ? 'Oczekuje' : inc.status === 'IN_PROGRESS' ? 'W naprawie' : 'Zakończona'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Camera QR scanner modal with direct selection */}
      {isQrScannerOpen && (
        <QrScannerModal
          onClose={() => setIsQrScannerOpen(false)}
          onSelect={(target) => {
            setSelectedLineId(target.id);
            setErrorMessage('');
            setSuccessMessage(`Rozpoznano i wybrano: ${target.name}`);
          }}
        />
      )}
    </div>
  );
}
