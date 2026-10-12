'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  QrCode, 
  Cpu, 
  FolderLock, 
  History, 
  PlusCircle, 
  Printer, 
  ExternalLink, 
  FileText, 
  ArrowLeft,
  ChevronRight,
  Shield,
  Calendar,
  Camera,
  Wrench,
  Zap
} from 'lucide-react';
import { User, ProductionLine, ControlCabinet, TechnicalDocument, EventLog, EventPhoto } from '@/types';
import { LineStatusBadge, PriorityBadge, EventStatusBadge } from './StatusBadge';
import { QrCodeModal } from './QrCodeModal';
import { AddEventModal } from './AddEventModal';
import { AddDocumentModal } from './AddDocumentModal';
import { PhotoLightboxModal } from './PhotoLightboxModal';
import { EditLineModal } from './EditLineModal';
import { Settings } from 'lucide-react';

interface LineDetailViewProps {
  currentUser: User;
  line: ProductionLine & {
    cabinets: ControlCabinet[];
    documents: TechnicalDocument[];
    events: EventLog[];
  };
}

export function LineDetailView({ currentUser, line }: LineDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'CABINETS' | 'DOCS' | 'EVENTS'>('CABINETS');
  const [selectedPhoto, setSelectedPhoto] = useState<EventPhoto | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/lines"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Powrót do spisu linii</span>
        </Link>
        <div className="text-xs text-slate-400 font-mono">
          ID: {line.id}
        </div>
      </div>

      {/* Line Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold bg-slate-800 text-emerald-300 px-2.5 py-0.5 rounded border border-slate-700">
                {line.code}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Wydział: <b className="text-slate-200">{line.departmentName}</b>
              </span>
              <LineStatusBadge status={line.status} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {line.name}
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {line.description}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Edytuj maszynę</span>
            </button>
            <button
              onClick={() => setIsQrOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Etykieta QR</span>
            </button>
            <button
              onClick={() => setIsAddEventOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Zgłoś modyfikację</span>
            </button>
            <button
              onClick={() => setIsAddDocOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <FolderLock className="w-4 h-4 text-blue-400" />
              <span>Dodaj DTR</span>
            </button>
          </div>
        </div>

        {/* Machine Specifications Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block">Producent:</span>
            <span className="text-slate-200 font-semibold">{line.manufacturer || '–'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Rok produkcji:</span>
            <span className="text-slate-200 font-semibold">{line.year || '–'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Numer fabryczny:</span>
            <span className="text-slate-200 font-semibold font-mono">{line.serialNumber || '–'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Identyfikator QR:</span>
            <span className="text-emerald-400 font-semibold font-mono">{line.qrCode}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('CABINETS')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 -mb-px cursor-pointer ${
            activeTab === 'CABINETS'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Szafy Sterownicze ({line.cabinets.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('DOCS')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 -mb-px cursor-pointer ${
            activeTab === 'DOCS'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderLock className="w-4 h-4" />
          <span>Cyfrowa DTR & EPLAN ({line.documents.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('EVENTS')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 -mb-px cursor-pointer ${
            activeTab === 'EVENTS'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Dziennik Zdarzeń & Zmian ({line.events.length})</span>
        </button>
      </div>

      {/* Tab 1: Control Cabinets */}
      {activeTab === 'CABINETS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {line.cabinets.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500 text-xs">
              Brak zdefiniowanych szaf w tej linii.
            </div>
          ) : (
            line.cabinets.map((cab) => (
              <div
                key={cab.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-sm flex flex-col justify-between transition group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-800 text-emerald-300 px-2 py-0.5 rounded border border-slate-700">
                      {cab.code}
                    </span>
                    <span className="text-[10px] font-bold bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                      {cab.ipRating || 'IP54'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition leading-snug">
                    {cab.name}
                  </h3>
                  
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {cab.notes}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Lokalizacja:</span>
                      <span className="text-slate-300">{cab.location || '–'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Zasilanie:</span>
                      <span className="text-amber-400 font-semibold">{cab.voltage || '3x400V'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    <span>Aparaty w szafie: <b className="text-slate-200">{cab.devicesCount}</b></span>
                  </div>

                  <Link
                    href={`/cabinets/${cab.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                  >
                    <span>Otwórz szafę</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Technical Documents (DTR) */}
      {activeTab === 'DOCS' && (
        <div className="space-y-3">
          {line.documents.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500 text-xs">
              Brak dokumentów przypisanych bezpośrednio do tej linii. Kliknij &quot;Dodaj DTR&quot; powyżej.
            </div>
          ) : (
            line.documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold uppercase bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded">
                        {doc.docType}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {doc.version}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{doc.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{doc.description}</p>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Plik: <span className="font-mono text-slate-400">{doc.fileName}</span> • Wgrał: {doc.uploadedByName} ({doc.createdAt})
                    </div>
                  </div>
                </div>

                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Otwórz / Pobierz</span>
                </a>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Events & Modifications */}
      {activeTab === 'EVENTS' && (
        <div className="space-y-4">
          {line.events.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500 text-xs">
              Brak zarejestrowanych awarii lub modyfikacji dla tej linii.
            </div>
          ) : (
            line.events.map((evt) => (
              <div
                key={evt.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                        {evt.eventType}
                      </span>
                      <PriorityBadge priority={evt.priority} />
                      <EventStatusBadge status={evt.status} />
                    </div>
                    <h3 className="text-sm font-bold text-white">{evt.title}</h3>
                  </div>
                  <div className="text-xs text-slate-400 text-right">
                    <div>{evt.createdAt}</div>
                    <div className="text-slate-500">{evt.reportedByName}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
                  {evt.description}
                </p>

                {evt.actionsTaken && (
                  <div className="text-xs text-slate-300 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/40">
                    <span className="font-semibold text-emerald-400">Podjęte czynności: </span>
                    {evt.actionsTaken}
                  </div>
                )}

                {evt.photos && evt.photos.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Zdjęcia ze zmianami:</span>
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
                            alt="Foto"
                            className="w-24 h-20 object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition">
                            Powiększ
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
      )}

      {/* QR Modal */}
      {isQrOpen && (
        <QrCodeModal
          title={line.name}
          code={line.code}
          qrCodeData={line.qrCode}
          typeText="Linia Produkcyjna"
          locationDetails={line.departmentName}
          targetUrl={`/lines/${line.id}`}
          onClose={() => setIsQrOpen(false)}
        />
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <PhotoLightboxModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}

      {/* Add Event Modal with line preselected */}
      {isAddEventOpen && (
        <AddEventModal
          initialTargetType="LINE"
          initialTargetId={line.id}
          initialTargetName={`${line.name} (${line.code})`}
          onClose={() => setIsAddEventOpen(false)}
        />
      )}

      {/* Add Doc Modal with line preselected */}
      {isAddDocOpen && (
        <AddDocumentModal
          initialTargetType="LINE"
          initialTargetId={line.id}
          initialTargetName={`${line.name} (${line.code})`}
          onClose={() => setIsAddDocOpen(false)}
        />
      )}

      {/* Edit Line Modal */}
      {isEditOpen && (
        <EditLineModal
          line={line}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </div>
  );
}
