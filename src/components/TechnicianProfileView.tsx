'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Wrench, 
  AlertOctagon, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Camera, 
  ExternalLink, 
  Check, 
  Filter, 
  Layers, 
  Play, 
  PlusCircle, 
  Search,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { User, EventLog, EventPhoto, EventStatus } from '@/types';
import { PriorityBadge, EventStatusBadge } from './StatusBadge';
import { PhotoLightboxModal } from './PhotoLightboxModal';
import { AddEventModal } from './AddEventModal';

interface TechnicianProfileViewProps {
  currentUser: User;
  events: EventLog[];
}

export function TechnicianProfileView({
  currentUser,
  events: initialEvents,
}: TechnicianProfileViewProps) {
  const [events, setEvents] = useState<EventLog[]>(initialEvents);
  const [activeTab, setActiveTab] = useState<'FAULTS' | 'INSPECTIONS' | 'ALL'>('FAULTS');
  const [selectedPhoto, setSelectedPhoto] = useState<EventPhoto | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [resolvingEventId, setResolvingEventId] = useState<string | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const openFaults = events.filter((e) => e.eventType === 'INCIDENT' && e.status !== 'RESOLVED');
  const criticalStops = openFaults.filter((e) => e.priority === 'CRITICAL');
  const upcomingInspections = events.filter((e) => (e.eventType === 'INSPECTION' || e.eventType === 'MAINTENANCE') && e.status !== 'RESOLVED');

  const filteredEvents = events.filter((e) => {
    const matchesTab =
      activeTab === 'ALL' ||
      (activeTab === 'FAULTS' && e.eventType === 'INCIDENT') ||
      (activeTab === 'INSPECTIONS' && (e.eventType === 'INSPECTION' || e.eventType === 'MAINTENANCE'));

    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      (e.targetName && e.targetName.toLowerCase().includes(search.toLowerCase()));

    return matchesTab && matchesSearch;
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
          actionsTaken: actionNotes.trim() || 'Prace serwisowe wykonane pomyślnie. Maszyna przekazana do ruchu.',
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
                  actionsTaken: actionNotes.trim() || 'Prace wykonane pomyślnie.',
                  assignedTo: currentUser.name,
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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
            <Wrench className="w-4 h-4" />
            <span>Panel Utrzymania Ruchu & Automatyki</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Centrum Dyspozytorskie Technika UR
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Zalogowano: <b className="text-emerald-300">{currentUser.name}</b> • Podgląd bieżących zgłoszeń, awarii i harmonogramu przeglądów
          </p>
        </div>

        <button
          onClick={() => setIsAddEventOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Wpisz modyfikację / pracę</span>
        </button>
      </div>

      {/* KPI Cards for Technician */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Critical Stops */}
        <div className={`p-4 rounded-xl border flex items-center justify-between transition ${
          criticalStops.length > 0
            ? 'bg-rose-950/70 border-rose-600 text-rose-100 shadow-lg shadow-rose-950/40'
            : 'bg-slate-900 border-slate-800 text-slate-300'
        }`}>
          <div>
            <div className="text-[11px] uppercase font-bold tracking-wider text-rose-300">
              Awaria: Zatrzymanie Linii
            </div>
            <div className="text-2xl font-black text-rose-400 mt-1">
              {criticalStops.length}
            </div>
            <div className="text-[11px] text-rose-300 mt-0.5">
              {criticalStops.length > 0 ? 'Wymaga natychmiastowej interwencji!' : 'Brak zatrzymań linii'}
            </div>
          </div>
          <AlertOctagon className="w-8 h-8 text-rose-500 shrink-0" />
        </div>

        {/* Total Open Faults */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase font-bold tracking-wider text-amber-400">
              Usterki Oczekujące / W Toku
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {openFaults.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Zgłoszenia z hal produkcyjnych
            </div>
          </div>
          <Clock className="w-8 h-8 text-amber-500 shrink-0" />
        </div>

        {/* Inspections */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase font-bold tracking-wider text-blue-400">
              Przeglądy & Pomiary
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {upcomingInspections.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Harmonogram okresowy
            </div>
          </div>
          <Calendar className="w-8 h-8 text-blue-500 shrink-0" />
        </div>
      </div>

      {/* Filter and Tab bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('FAULTS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'FAULTS'
                ? 'bg-rose-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Bieżące Usterki ({openFaults.length})
          </button>
          <button
            onClick={() => setActiveTab('INSPECTIONS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'INSPECTIONS'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Przeglądy & Serwis ({upcomingInspections.length})
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'ALL'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Wszystkie ({events.length})
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Filtruj zadanie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500 text-xs">
            Brak zadań w wybranej kategorii.
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const isCritical = evt.priority === 'CRITICAL' && evt.status !== 'RESOLVED';
            const isResolving = resolvingEventId === evt.id;

            return (
              <div
                key={evt.id}
                className={`rounded-2xl p-5 border transition shadow-sm space-y-3.5 ${
                  isCritical
                    ? 'bg-rose-950/40 border-rose-800 ring-1 ring-rose-700'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                        {evt.eventType === 'INCIDENT' ? 'Awaria' : evt.eventType === 'INSPECTION' ? 'Przegląd' : 'Modyfikacja'}
                      </span>
                      <PriorityBadge priority={evt.priority} />
                      <EventStatusBadge status={evt.status} />
                    </div>
                    <h3 className="text-base font-bold text-white leading-snug">
                      {evt.title}
                    </h3>
                    <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                      Lokalizacja: {evt.targetName}
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 text-left sm:text-right shrink-0">
                    <div>{evt.createdAt}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Zgłosił: {evt.reportedByName}
                    </div>
                    {evt.assignedTo && (
                      <div className="text-emerald-400 text-[11px] font-semibold">
                        Prowadzi: {evt.assignedTo}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800 leading-relaxed whitespace-pre-line">
                  {evt.description}
                </div>

                {evt.actionsTaken && (
                  <div className="text-xs text-slate-300 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-900/40">
                    <span className="font-semibold text-emerald-400">Wykonane czynności: </span>
                    {evt.actionsTaken}
                  </div>
                )}

                {/* Photos */}
                {evt.photos && evt.photos.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {evt.photos.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPhoto(p)}
                        className="cursor-pointer rounded-lg overflow-hidden border border-slate-700 hover:border-emerald-400 transition"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.fileUrl}
                          alt="Foto"
                          className="w-20 h-16 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Resolving Action Box */}
                {isResolving && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-emerald-600/50 space-y-2 animate-in fade-in">
                    <label className="block text-xs font-bold text-emerald-300">
                      Podsumowanie naprawy / wykonane czynności:
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Opisz co naprawiono, jakie części wymieniono, parametry sprawdzone..."
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setResolvingEventId(null)}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                      >
                        Anuluj
                      </button>
                      <button
                        onClick={() => handleResolveEvent(evt.id)}
                        disabled={isUpdating}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Zatwierdź i zamknij zgłoszenie</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Actions Bar */}
                {!isResolving && evt.status !== 'RESOLVED' && (
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-500">
                      Priorytet: <b className="text-slate-300">{evt.priority}</b>
                    </div>

                    <div className="flex items-center gap-2">
                      {evt.status === 'OPEN' && (
                        <button
                          onClick={() => handleStartWork(evt.id)}
                          disabled={isUpdating}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Podejmij naprawę</span>
                        </button>
                      )}

                      <button
                        onClick={() => setResolvingEventId(evt.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Zakończ i opisz naprawę</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Lightbox for photos */}
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
        />
      )}
    </div>
  );
}
