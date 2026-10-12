'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  QrCode, 
  Cpu, 
  FolderLock, 
  History, 
  PlusCircle, 
  Printer, 
  ExternalLink, 
  FileText, 
  ChevronRight, 
  Zap, 
  ShieldCheck, 
  Network,
  Camera,
  Layers
} from 'lucide-react';
import { User, ControlCabinet, Device, TechnicalDocument, EventLog, EventPhoto } from '@/types';
import { DeviceStatusBadge, PriorityBadge, EventStatusBadge } from './StatusBadge';
import { QrCodeModal } from './QrCodeModal';
import { AddEventModal } from './AddEventModal';
import { AddDocumentModal } from './AddDocumentModal';
import { PhotoLightboxModal } from './PhotoLightboxModal';
import { EditCabinetModal } from './EditCabinetModal';
import { Settings } from 'lucide-react';

interface CabinetDetailViewProps {
  currentUser: User;
  cabinet: ControlCabinet & {
    devices: Device[];
    documents: TechnicalDocument[];
    events: EventLog[];
  };
}

export function CabinetDetailView({ currentUser, cabinet }: CabinetDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'DEVICES' | 'DOCS' | 'EVENTS'>('DEVICES');
  const [selectedPhoto, setSelectedPhoto] = useState<EventPhoto | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumbs */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/lines/${cabinet.lineId}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Powrót do linii: {cabinet.lineName}</span>
        </Link>
        <div className="text-xs text-slate-400 font-mono">
          ID: {cabinet.id}
        </div>
      </div>

      {/* Cabinet Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold bg-slate-800 text-emerald-300 px-2.5 py-0.5 rounded border border-slate-700">
                {cabinet.code}
              </span>
              <span className="text-xs font-bold bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                {cabinet.ipRating || 'IP54'}
              </span>
              <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                ⚡ {cabinet.voltage || '3x400V AC'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {cabinet.name}
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {cabinet.notes || 'Szafa sterownicza z aparaturą modułową, sterownikami i zabezpieczeniami obwodów.'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Edytuj szafę</span>
            </button>
            <button
              onClick={() => setIsQrOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Drukuj QR na szafę</span>
            </button>
            <button
              onClick={() => setIsAddEventOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Zgłoś zmianę w szafie</span>
            </button>
            <button
              onClick={() => setIsAddDocOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <FolderLock className="w-4 h-4 text-blue-400" />
              <span>Dodaj schemat EPLAN</span>
            </button>
          </div>
        </div>

        {/* Location & specs */}
        <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block">Lokalizacja na maszynie:</span>
            <span className="text-slate-200 font-semibold">{cabinet.location || '–'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Linia nadrzędna:</span>
            <Link href={`/lines/${cabinet.lineId}`} className="text-emerald-400 font-semibold hover:underline">
              {cabinet.lineName}
            </Link>
          </div>
          <div>
            <span className="text-slate-500 block">Zainstalowane aparaty:</span>
            <span className="text-slate-200 font-semibold">{cabinet.devices.length} podzespołów</span>
          </div>
          <div>
            <span className="text-slate-500 block">Kod etykiety QR:</span>
            <span className="text-emerald-400 font-semibold font-mono">{cabinet.qrCode}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('DEVICES')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 -mb-px cursor-pointer ${
            activeTab === 'DEVICES'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Aparatura & Podzespoły ({cabinet.devices.length})</span>
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
          <span>Schematy EPLAN & DTR ({cabinet.documents.length})</span>
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
          <span>Historia Zmian Połączeń ({cabinet.events.length})</span>
        </button>
      </div>

      {/* Tab 1: Devices inside cabinet */}
      {activeTab === 'DEVICES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Spis aparatury zamontowanej na szynach montażowych w szafie
            </h3>
            <span className="text-xs text-slate-400">
              Sterowniki PLC, przemienniki częstotliwości, moduły Safety i zasilacze
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Oznaczenie (KKS)</th>
                  <th className="px-4 py-3">Nazwa / Podzespół</th>
                  <th className="px-4 py-3">Typ</th>
                  <th className="px-4 py-3">Producent / Model</th>
                  <th className="px-4 py-3">Sieć / IP</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Akcja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {cabinet.devices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Brak aparatów zarejestrowanych w tej szafie.
                    </td>
                  </tr>
                ) : (
                  cabinet.devices.map((dev) => (
                    <tr key={dev.id} className="hover:bg-slate-800/40 transition group">
                      <td className="px-4 py-3 font-mono font-bold text-emerald-300">
                        {dev.code}
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        <Link href={`/devices/${dev.id}`} className="hover:text-emerald-400 transition">
                          {dev.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-700">
                          {dev.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {dev.manufacturer} {dev.model}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                        {dev.ipAddress ? (
                          <span className="flex items-center gap-1 text-blue-400">
                            <Network className="w-3 h-3" />
                            {dev.ipAddress}
                          </span>
                        ) : (
                          '–'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <DeviceStatusBadge status={dev.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/devices/${dev.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold border border-slate-700 transition"
                        >
                          <span>Karta</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Schematics & Docs */}
      {activeTab === 'DOCS' && (
        <div className="space-y-3">
          {cabinet.documents.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500 text-xs">
              Brak schematów przypisanych do tej szafy. Kliknij &quot;Dodaj schemat EPLAN&quot; powyżej.
            </div>
          ) : (
            cabinet.documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold uppercase bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.5 rounded">
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
          {cabinet.events.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500 text-xs">
              Brak zarejestrowanych zmian połączeń w tej szafie.
            </div>
          ) : (
            cabinet.events.map((evt) => (
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
                    <span className="font-semibold text-emerald-400">Wykonane czynności: </span>
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
          title={cabinet.name}
          code={cabinet.code}
          qrCodeData={cabinet.qrCode}
          typeText="Szafa Sterownicza"
          locationDetails={`Linia: ${cabinet.lineName} (${cabinet.location || 'Hala'})`}
          targetUrl={`/cabinets/${cabinet.id}`}
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

      {/* Add Event Modal with cabinet preselected */}
      {isAddEventOpen && (
        <AddEventModal
          initialTargetType="CABINET"
          initialTargetId={cabinet.id}
          initialTargetName={`${cabinet.name} (${cabinet.code})`}
          onClose={() => setIsAddEventOpen(false)}
        />
      )}

      {/* Add Doc Modal with cabinet preselected */}
      {isAddDocOpen && (
        <AddDocumentModal
          initialTargetType="CABINET"
          initialTargetId={cabinet.id}
          initialTargetName={`${cabinet.name} (${cabinet.code})`}
          onClose={() => setIsAddDocOpen(false)}
        />
      )}

      {/* Edit Cabinet Modal */}
      {isEditOpen && (
        <EditCabinetModal
          cabinet={cabinet}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </div>
  );
}
