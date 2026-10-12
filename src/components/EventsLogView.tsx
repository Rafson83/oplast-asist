'use client';

import React, { useState } from 'react';
import { 
  History, 
  Search, 
  PlusCircle, 
  Camera, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  GitCommit, 
  User, 
  Filter,
  Check,
  ChevronDown
} from 'lucide-react';
import { User as UserType, EventLog, EventPhoto, EventStatus, EventType } from '@/types';
import { PriorityBadge, EventStatusBadge } from './StatusBadge';
import { AddEventModal } from './AddEventModal';
import { PhotoLightboxModal } from './PhotoLightboxModal';

interface EventsLogViewProps {
  currentUser: UserType;
  initialEvents: EventLog[];
  initialStatusFilter?: string;
  initialTypeFilter?: string;
}

export function EventsLogView({
  currentUser,
  initialEvents,
  initialStatusFilter,
  initialTypeFilter,
}: EventsLogViewProps) {
  const [events, setEvents] = useState<EventLog[]>(initialEvents);
  const [selectedType, setSelectedType] = useState<string>(initialTypeFilter || 'ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatusFilter || 'ALL');
  const [search, setSearch] = useState<string>('');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<EventPhoto | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredEvents = events.filter((evt) => {
    const matchesType = selectedType === 'ALL' || evt.eventType === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || evt.status === selectedStatus;
    const matchesSearch =
      evt.title.toLowerCase().includes(search.toLowerCase()) ||
      evt.description.toLowerCase().includes(search.toLowerCase()) ||
      (evt.targetName && evt.targetName.toLowerCase().includes(search.toLowerCase())) ||
      (evt.actionsTaken && evt.actionsTaken.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (eventId: string, newStatus: EventStatus) => {
    setUpdatingId(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? { ...e, status: newStatus } : e))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <History className="w-4 h-4 text-emerald-400" />
            <span>Centralny Dziennik Zakładowy</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Dziennik Zdarzeń & Modyfikacji Połączeń
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ewidencja awarii, modernizacji elektrycznych, wymiany części i zdjęć szaf przed/po zmianach
          </p>
        </div>

        <button
          onClick={() => setIsAddEventOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nowe zgłoszenie / zmiana</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedType === 'ALL'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Wszystkie ({events.length})
            </button>
            <button
              onClick={() => setSelectedType('MODIFICATION')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedType === 'MODIFICATION'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Modyfikacje Maszyn
            </button>
            <button
              onClick={() => setSelectedType('INCIDENT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedType === 'INCIDENT'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Awarie & Usterki
            </button>
            <button
              onClick={() => setSelectedType('INSPECTION')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedType === 'INSPECTION'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Przeglądy i Pomiary
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Szukaj zdarzenia, podzespołu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Status Subfilters */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs">
          <span className="text-slate-400 font-semibold text-[11px]">Status:</span>
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              selectedStatus === 'ALL' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Wszystkie
          </button>
          <button
            onClick={() => setSelectedStatus('OPEN')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              selectedStatus === 'OPEN' ? 'bg-rose-950 text-rose-300 border border-rose-800 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Otwarte
          </button>
          <button
            onClick={() => setSelectedStatus('IN_PROGRESS')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              selectedStatus === 'IN_PROGRESS' ? 'bg-blue-950 text-blue-300 border border-blue-800 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            W trakcie prac
          </button>
          <button
            onClick={() => setSelectedStatus('RESOLVED')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              selectedStatus === 'RESOLVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rozwiązane
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500 text-xs">
            Brak zdarzeń spełniających wybrane kryteria filtrowania.
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3.5 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      {evt.eventType === 'MODIFICATION' ? 'Modyfikacja połączeń' : evt.eventType === 'INCIDENT' ? 'Awaria' : evt.eventType === 'INSPECTION' ? 'Przegląd' : 'Serwis'}
                    </span>
                    <PriorityBadge priority={evt.priority} />
                    <EventStatusBadge status={evt.status} />
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug">
                    {evt.title}
                  </h3>
                  <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                    Dotyczy: {evt.targetName} ({evt.targetType})
                  </div>
                </div>

                <div className="text-xs text-slate-400 text-left sm:text-right shrink-0">
                  <div className="font-medium text-slate-300">{evt.createdAt}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Zgłosił: <span className="text-slate-400 font-medium">{evt.reportedByName}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="text-xs text-slate-300 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
                <span className="font-semibold text-slate-200 block mb-1">Opis problemu / wprowadzonych zmian:</span>
                {evt.description}
              </div>

              {/* Actions taken */}
              {evt.actionsTaken && (
                <div className="text-xs text-slate-300 bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/40 leading-relaxed">
                  <span className="font-semibold text-emerald-400 block mb-0.5">
                    Podjęte czynności naprawcze / zmiana połączeń:
                  </span>
                  {evt.actionsTaken}
                </div>
              )}

              {/* Photos Gallery */}
              {evt.photos && evt.photos.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>Dokumentacja fotograficzna zmian ({evt.photos.length} zdjęć):</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {evt.photos.map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => setSelectedPhoto(photo)}
                        className="group relative cursor-pointer rounded-xl overflow-hidden border border-slate-700 hover:border-emerald-400 transition bg-slate-950 shadow-sm"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.fileUrl}
                          alt={photo.caption || 'Zdjęcie'}
                          className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-2">
                          <span className="text-[10px] font-bold text-white uppercase bg-black/70 px-1.5 py-0.5 rounded w-fit mb-1 border border-white/20">
                            {photo.photoType === 'BEFORE' ? 'Stan Przed' : photo.photoType === 'AFTER' ? 'Stan Po Zmianie' : photo.photoType === 'SCHEMATIC' ? 'Schemat' : 'Foto'}
                          </span>
                          {photo.caption && (
                            <p className="text-[10px] text-slate-300 truncate">
                              {photo.caption}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update Quick Bar */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-[11px] text-slate-500">
                  {evt.resolvedAt && <span>Zakończono: {evt.resolvedAt}</span>}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-semibold mr-1">Zmień status:</span>
                  {evt.status !== 'OPEN' && (
                    <button
                      onClick={() => handleStatusChange(evt.id, 'OPEN')}
                      disabled={updatingId === evt.id}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded text-xs font-semibold border border-slate-700 transition cursor-pointer"
                    >
                      Otwarte
                    </button>
                  )}
                  {evt.status !== 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleStatusChange(evt.id, 'IN_PROGRESS')}
                      disabled={updatingId === evt.id}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded text-xs font-semibold border border-slate-700 transition cursor-pointer"
                    >
                      W trakcie prac
                    </button>
                  )}
                  {evt.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleStatusChange(evt.id, 'RESOLVED')}
                      disabled={updatingId === evt.id}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Oznacz jako rozwiązane</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Lightbox for full photo preview */}
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
