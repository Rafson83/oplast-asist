'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  Cpu, 
  ShieldAlert, 
  FolderLock, 
  QrCode, 
  PlusCircle, 
  Printer, 
  ExternalLink, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Camera,
  GitCommit
} from 'lucide-react';
import { User, ProductionLine, EventLog, TechnicalDocument, EventPhoto } from '@/types';
import { LineStatusBadge, PriorityBadge, EventStatusBadge } from './StatusBadge';
import { QrCodeModal } from './QrCodeModal';
import { QrScannerModal } from './QrScannerModal';
import { AddEventModal } from './AddEventModal';
import { AddDocumentModal } from './AddDocumentModal';
import { PhotoLightboxModal } from './PhotoLightboxModal';

interface DashboardViewProps {
  currentUser: User;
  stats: {
    linesCount: number;
    cabinetsCount: number;
    devicesCount: number;
    docsCount: number;
    openEventsCount: number;
    criticalEventsCount: number;
  };
  lines: ProductionLine[];
  recentEvents: EventLog[];
  recentDocs: TechnicalDocument[];
}

export function DashboardView({
  currentUser,
  stats,
  lines,
  recentEvents,
  recentDocs,
}: DashboardViewProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<EventPhoto | null>(null);
  const [qrModalItem, setQrModalItem] = useState<{
    title: string;
    code: string;
    qrCodeData: string;
    typeText: string;
    locationDetails?: string;
    targetUrl?: string;
  } | null>(null);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>System Aktywny • Dział Utrzymania Ruchu Oplast</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Dzień dobry, {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Cyfrowe DTR, szafy sterownicze, schematy EPLAN i audyt zmian połączeń maszyn.
            </p>
          </div>

          {/* Quick Actions in Hero */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsQrScannerOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm hover:shadow-emerald-600/30 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Skanuj kod QR</span>
            </button>
            <button
              onClick={() => setIsAddEventOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Zgłoś modyfikację</span>
            </button>
            <button
              onClick={() => setIsAddDocOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <FolderLock className="w-4 h-4 text-blue-400" />
              <span>Wgraj DTR / Schemat</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Lines */}
        <Link 
          href="/lines"
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition group shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Linie Produkcyjne</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">{stats.linesCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <span>Wydziały: WTR, REC, EXT</span>
            </div>
          </div>
        </Link>

        {/* Cabinets & Devices */}
        <Link 
          href="/lines"
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition group shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Szafy & Aparaty</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">{stats.cabinetsCount} <span className="text-sm font-normal text-slate-400">/ {stats.devicesCount} dev</span></div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Szafy sterownicze, PLC, serwa
            </div>
          </div>
        </Link>

        {/* Open Events */}
        <Link 
          href="/events?status=OPEN"
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition group shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Zdarzenia w toku</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-400">{stats.openEventsCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {stats.criticalEventsCount > 0 ? (
                <span className="text-rose-400 font-bold">{stats.criticalEventsCount} krytycznych (stop)</span>
              ) : (
                <span>Brak zatrzymań krytycznych</span>
              )}
            </div>
          </div>
        </Link>

        {/* Documents */}
        <Link 
          href="/dtr"
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition group shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cyfrowe DTR</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform">
              <FolderLock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">{stats.docsCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Schematy EPLAN, DTR, manuale
            </div>
          </div>
        </Link>
      </div>

      {/* Main Grid: Recent Events with photos & Lines Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Events and Machine Modifications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                <GitCommit className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white">
                Rejestr Zdarzeń & Modyfikacji Maszyn
              </h2>
            </div>
            <Link
              href="/events"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>Zobacz wszystkie</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentEvents.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
                Brak zarejestrowanych zdarzeń. Kliknij &quot;Zgłoś modyfikację&quot;, aby dodać pierwszy wpis.
              </div>
            ) : (
              recentEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-3 hover:border-slate-700 transition"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          {evt.eventType === 'MODIFICATION' ? 'Modyfikacja połączeń' : evt.eventType === 'INCIDENT' ? 'Awaria' : evt.eventType === 'INSPECTION' ? 'Przegląd' : 'Serwis'}
                        </span>
                        <PriorityBadge priority={evt.priority} />
                        <EventStatusBadge status={evt.status} />
                      </div>
                      <h3 className="text-sm font-bold text-white leading-snug">
                        {evt.title}
                      </h3>
                      <div className="text-xs text-emerald-400 font-medium mt-0.5">
                        Obiekt: {evt.targetName}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 text-right">
                      <div>{evt.createdAt}</div>
                      <div className="text-slate-500">{evt.reportedByName}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    {evt.description}
                  </p>

                  {evt.actionsTaken && (
                    <div className="text-xs text-slate-300 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/40">
                      <span className="font-semibold text-emerald-400">Wykonane czynności: </span>
                      {evt.actionsTaken}
                    </div>
                  )}

                  {/* Photos Carousel/Row (Before / After) */}
                  {evt.photos && evt.photos.length > 0 && (
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Zdjęcia połączeń i aparatury ({evt.photos.length}):</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {evt.photos.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => setSelectedPhoto(p)}
                            className="group relative cursor-pointer rounded-lg overflow-hidden border border-slate-700 hover:border-emerald-400 transition"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.fileUrl}
                              alt={p.caption || 'Zdjęcie'}
                              className="w-24 h-20 sm:w-28 sm:h-24 object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-1.5">
                              <span className="text-[9px] font-bold text-white uppercase bg-black/60 px-1 rounded w-fit">
                                {p.photoType === 'BEFORE' ? 'Przed' : p.photoType === 'AFTER' ? 'Po zmianie' : p.photoType === 'SCHEMATIC' ? 'Schemat' : 'Foto'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Lines Quick Status & Recent Documents */}
        <div className="space-y-6">
          
          {/* Production Lines Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Linie Produkcyjne</h2>
              </div>
              <Link href="/lines" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold">
                Katalog
              </Link>
            </div>

            <div className="space-y-3">
              {lines.map((l) => (
                <div
                  key={l.id}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <Link
                        href={`/lines/${l.id}`}
                        className="text-xs font-bold text-white hover:text-emerald-400 transition"
                      >
                        {l.name}
                      </Link>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {l.code} • {l.departmentName}
                      </div>
                    </div>
                    <LineStatusBadge status={l.status} />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>Szafy: <b className="text-slate-200">{l.cabinetsCount}</b></span>
                      <span>Aparaty: <b className="text-slate-200">{l.devicesCount}</b></span>
                    </div>
                    <button
                      onClick={() =>
                        setQrModalItem({
                          title: l.name,
                          code: l.code,
                          qrCodeData: l.qrCode,
                          typeText: 'Linia Produkcyjna',
                          locationDetails: l.departmentName,
                          targetUrl: `/lines/${l.id}`,
                        })
                      }
                      className="p-1 hover:text-emerald-400 rounded transition cursor-pointer"
                      title="Pokaż kod QR"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Technical Documents */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderLock className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white">Cyfrowa DTR & EPLAN</h2>
              </div>
              <button
                onClick={() => setIsAddDocOpen(true)}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
              >
                + Dodaj
              </button>
            </div>

            <div className="space-y-2.5">
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 hover:border-slate-700 transition flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[9px] font-bold uppercase bg-purple-950 text-purple-300 border border-purple-800/60 px-1.5 py-0.2 rounded">
                        {doc.docType}
                      </span>
                      <span className="text-[10px] text-slate-400">{doc.version}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-white truncate">{doc.title}</h4>
                    <p className="text-[10px] text-slate-500 truncate">{doc.fileName}</p>
                  </div>

                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition shrink-0"
                    title="Otwórz plik"
                  >
                    <FileText className="w-4 h-4 text-emerald-400" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <PhotoLightboxModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}

      {/* QR Code Modal */}
      {qrModalItem && (
        <QrCodeModal
          title={qrModalItem.title}
          code={qrModalItem.code}
          qrCodeData={qrModalItem.qrCodeData}
          typeText={qrModalItem.typeText}
          locationDetails={qrModalItem.locationDetails}
          targetUrl={qrModalItem.targetUrl}
          onClose={() => setQrModalItem(null)}
        />
      )}

      {/* Camera QR Scanner Modal */}
      {isQrScannerOpen && (
        <QrScannerModal onClose={() => setIsQrScannerOpen(false)} />
      )}

      {/* Add Event Modal */}
      {isAddEventOpen && (
        <AddEventModal onClose={() => setIsAddEventOpen(false)} />
      )}

      {/* Add Document Modal */}
      {isAddDocOpen && (
        <AddDocumentModal onClose={() => setIsAddDocOpen(false)} />
      )}
    </div>
  );
}
