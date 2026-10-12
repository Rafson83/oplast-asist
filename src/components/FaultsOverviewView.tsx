'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  AlertOctagon, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  MessageSquare, 
  Camera, 
  ExternalLink, 
  Filter, 
  Search, 
  Building2, 
  AlertTriangle,
  Play,
  Check,
  PlusCircle,
  FileText,
  Layers,
  ArrowRight
} from 'lucide-react';
import { User, EventLog, ProductionLine, EventPhoto } from '@/types';
import { PhotoLightboxModal } from './PhotoLightboxModal';
import { AddEventModal } from './AddEventModal';

interface FaultsOverviewViewProps {
  currentUser: User;
  events: EventLog[];
  lines: ProductionLine[];
}

export function FaultsOverviewView({
  currentUser,
  events: initialEvents,
  lines,
}: FaultsOverviewViewProps) {
  const [events, setEvents] = useState<EventLog[]>(initialEvents);
  const [activeTab, setActiveTab] = useState<'CRITICAL' | 'ALL_ACTIVE' | 'IN_PROGRESS' | 'INSPECTIONS' | 'RESOLVED'>('ALL_ACTIVE');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<EventPhoto | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [resolvingEventId, setResolvingEventId] = useState<string | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Group departments
  const departments = Array.from(new Set(lines.map((l) => l.departmentName || 'Inne')));

  // Statistics
  const activeEvents = events.filter((e) => e.status !== 'RESOLVED');
  const criticalStops = activeEvents.filter((e) => e.priority === 'CRITICAL' && e.eventType === 'INCIDENT');
  const inProgressEvents = activeEvents.filter((e) => e.status === 'IN_PROGRESS');
  const openPending = activeEvents.filter((e) => e.status === 'OPEN');
  const upcomingInspections = activeEvents.filter((e) => e.eventType === 'INSPECTION' || e.eventType === 'MAINTENANCE');

  // Filtered List
  const filteredEvents = events.filter((e) => {
    // Tab filter
    if (activeTab === 'CRITICAL' && (e.priority !== 'CRITICAL' || e.status === 'RESOLVED')) return false;
    if (activeTab === 'ALL_ACTIVE' && e.status === 'RESOLVED') return false;
    if (activeTab === 'IN_PROGRESS' && e.status !== 'IN_PROGRESS') return false;
    if (activeTab === 'INSPECTIONS' && !(e.eventType === 'INSPECTION' || e.eventType === 'MAINTENANCE')) return false;
    if (activeTab === 'RESOLVED' && e.status !== 'RESOLVED') return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.targetName && e.targetName.toLowerCase().includes(q)) ||
        (e.reportedByName && e.reportedByName.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  const handleStartWork = async (eventId: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'IN_PROGRESS',
          assignedTo: currentUser.name,
        }),
      });
      if (res.ok) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? { ...e, status: 'IN_PROGRESS', assignedTo: currentUser.name }
              : e
          )
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResolveEvent = async (eventId: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'RESOLVED',
          actionsTaken: actionNotes.trim() || 'Prace serwisowe zakończone pomyślnie. Maszyna przekazana do ruchu.',
          assignedTo: currentUser.name,
        }),
      });
      if (res.ok) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  status: 'RESOLVED',
                  actionsTaken: actionNotes.trim() || 'Prace serwisowe zakończone pomyślnie.',
                  assignedTo: currentUser.name,
                  resolvedAt: new Date().toISOString(),
                }
              : e
          )
        );
        setResolvingEventId(null);
        setActionNotes('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>Centrum Bieżących Awarii i Utrzymania Ruchu</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Rejestr Awarii i Przeglądów Maszyn
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Bieżący monitoring postojów, koordynacja napraw i harmonogram przeglądów w 4 halach fabrycznych
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/chat"
              className="px-4 py-2.5 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-950/40 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Czat UR & Slack</span>
            </Link>
            <button
              onClick={() => setIsAddEventOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Dodaj Zdarzenie</span>
            </button>
          </div>
        </div>

        {/* Live KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-rose-900/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm shrink-0 border border-rose-500/30">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                STOP LINII (Postój)
              </div>
              <div className="text-xl font-black text-rose-200">
                {criticalStops.length} {criticalStops.length === 1 ? 'maszyna' : 'maszyny'}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-amber-900/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-500/30">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                W trakcie naprawy
              </div>
              <div className="text-xl font-black text-amber-200">
                {inProgressEvents.length} zgłoszeń
              </div>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-blue-900/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                Oczekuje na serwis
              </div>
              <div className="text-xl font-black text-blue-200">
                {openPending.length} zgłoszeń
              </div>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-emerald-900/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Przeglądy & DTR
              </div>
              <div className="text-xl font-black text-emerald-200">
                {upcomingInspections.length} zaplanowanych
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hall Status Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {departments.map((dept) => {
          const deptLines = lines.filter((l) => (l.departmentName || 'Inne') === dept);
          const deptLineIds = deptLines.map((l) => l.id);
          const deptFaults = activeEvents.filter((e) => deptLineIds.includes(e.targetId));
          const hasCritical = deptFaults.some((e) => e.priority === 'CRITICAL');

          return (
            <div
              key={dept}
              className={`p-4 rounded-xl border transition shadow-md ${
                hasCritical
                  ? 'bg-rose-950/40 border-rose-800 ring-1 ring-rose-500/30'
                  : deptFaults.length > 0
                  ? 'bg-amber-950/30 border-amber-800'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{dept}</span>
                </span>
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    hasCritical
                      ? 'bg-rose-500 animate-pulse'
                      : deptFaults.length > 0
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                />
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>{deptLines.length} maszyn</span>
                <span className={`font-semibold ${hasCritical ? 'text-rose-300' : deptFaults.length > 0 ? 'text-amber-300' : 'text-emerald-400'}`}>
                  {hasCritical ? 'STOP LINII!' : deptFaults.length > 0 ? `${deptFaults.length} usterka` : 'Wszystko OK'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters and Navigation Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Tab Selector */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTab('ALL_ACTIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'ALL_ACTIVE'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Wszystkie Aktywne ({activeEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('CRITICAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'CRITICAL'
                  ? 'bg-rose-600 text-white shadow'
                  : 'bg-slate-800 text-rose-300 hover:text-white'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>STOP LINII ({criticalStops.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('IN_PROGRESS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'IN_PROGRESS'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-800 text-amber-300 hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>W naprawie ({inProgressEvents.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('INSPECTIONS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'INSPECTIONS'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-blue-300 hover:text-white'
              }`}
            >
              Przeglądy DTR ({upcomingInspections.length})
            </button>
            <button
              onClick={() => setActiveTab('RESOLVED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'RESOLVED'
                  ? 'bg-slate-700 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Historia Zamkniętych
            </button>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Szukaj po tytule, maszynie, osobie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Breakdowns List */}
      <div className="space-y-3.5">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Brak awarii w wybranej kategorii!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Wszystkie linie i urządzenia w tej kategorii pracują prawidłowo lub brak pasujących zgłoszeń.
            </p>
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const isCritical = evt.priority === 'CRITICAL';
            const isResolving = resolvingEventId === evt.id;

            return (
              <div
                key={evt.id}
                className={`bg-slate-900 border rounded-2xl p-5 shadow-xl transition space-y-4 ${
                  isCritical && evt.status !== 'RESOLVED'
                    ? 'border-rose-600/80 bg-gradient-to-r from-rose-950/30 to-slate-900 shadow-rose-950/20 ring-1 ring-rose-500/40'
                    : evt.status === 'IN_PROGRESS'
                    ? 'border-amber-600/60 bg-gradient-to-r from-amber-950/20 to-slate-900'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          isCritical
                            ? 'bg-rose-900 text-rose-100 border border-rose-500 animate-pulse'
                            : evt.priority === 'HIGH'
                            ? 'bg-amber-900 text-amber-100 border border-amber-600'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {isCritical ? '🚨 STOP LINII' : evt.priority}
                      </span>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          evt.status === 'OPEN'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : evt.status === 'IN_PROGRESS'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {evt.status === 'OPEN' ? 'Oczekuje na serwis' : evt.status === 'IN_PROGRESS' ? 'W trakcie naprawy' : 'Zakończona'}
                      </span>

                      <span className="text-[11px] text-slate-400 font-medium">
                        Zgłoszono: {evt.createdAt}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-white leading-tight">
                      {evt.title}
                    </h3>

                    <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{evt.targetName || 'Obiekt przemysłowy'}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {/* Link to Chat with preselected topic */}
                    <Link
                      href={`/chat?channel=chan-awarie&topic=${encodeURIComponent(evt.title)}`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Otwórz w Czacie UR</span>
                    </Link>

                    {evt.status === 'OPEN' && (
                      <button
                        onClick={() => handleStartWork(evt.id)}
                        disabled={isUpdating}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Podejmij naprawę</span>
                      </button>
                    )}

                    {evt.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => setResolvingEventId(isResolving ? null : evt.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Zakończ naprawę</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  {evt.description}
                </p>

                {/* Resolve actions taken if present */}
                {evt.actionsTaken && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-900/60 rounded-xl text-xs text-emerald-200">
                    <span className="font-bold block mb-0.5 text-emerald-400">Wykonane czynności naprawcze:</span>
                    <span>{evt.actionsTaken}</span>
                  </div>
                )}

                {/* Inline Resolve Form */}
                {isResolving && (
                  <div className="p-4 bg-slate-950 border border-emerald-500/50 rounded-xl space-y-3 animate-in fade-in-50">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>Podsumowanie naprawy / przywrócenie maszyny do ruchu</span>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Opisz wykonane prace (np. wymiana stycznika, reset falownika, doszczelnienie siłownika)..."
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setResolvingEventId(null)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-700"
                      >
                        Anuluj
                      </button>
                      <button
                        onClick={() => handleResolveEvent(evt.id)}
                        disabled={isUpdating}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow"
                      >
                        Zatwierdź i Zamknij Awarię
                      </button>
                    </div>
                  </div>
                )}

                {/* Photos and Assignee Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                  <div className="flex items-center gap-4">
                    <span>Zgłosił: <b className="text-slate-200">{evt.reportedByName || evt.reportedBy}</b></span>
                    {evt.assignedTo && (
                      <span>Naprawia: <b className="text-amber-300">{evt.assignedTo}</b></span>
                    )}
                  </div>

                  {evt.photos && evt.photos.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Camera className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Zdjęcia usterki:</span>
                      <div className="flex gap-1.5">
                        {evt.photos.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedPhoto(p)}
                            className="cursor-pointer hover:opacity-80 transition"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.fileUrl}
                              alt="Foto"
                              className="w-7 h-7 object-cover rounded border border-slate-700"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Lightbox for Photos */}
      {selectedPhoto && (
        <PhotoLightboxModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}

      {/* Add Event Modal */}
      {isAddEventOpen && (
        <AddEventModal
          onClose={() => setIsAddEventOpen(false)}
          onSuccess={() => {
            setIsAddEventOpen(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
