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
  ExternalLink, 
  FileText, 
  Network, 
  ShieldCheck, 
  Layers, 
  Wrench,
  Camera,
  Hash,
  Server
} from 'lucide-react';
import { User, Device, TechnicalDocument, EventLog, EventPhoto } from '@/types';
import { DeviceStatusBadge, PriorityBadge, EventStatusBadge } from './StatusBadge';
import { QrCodeModal } from './QrCodeModal';
import { AddEventModal } from './AddEventModal';
import { AddDocumentModal } from './AddDocumentModal';
import { PhotoLightboxModal } from './PhotoLightboxModal';

interface DeviceDetailViewProps {
  currentUser: User;
  device: Device & {
    documents: TechnicalDocument[];
    events: EventLog[];
  };
}

export function DeviceDetailView({ currentUser, device }: DeviceDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'DOCS' | 'EVENTS'>('DOCS');
  const [selectedPhoto, setSelectedPhoto] = useState<EventPhoto | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/cabinets/${device.cabinetId}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Powrót do szafy: {device.cabinetName}</span>
        </Link>
        <div className="text-xs text-slate-400 font-mono">
          ID: {device.id}
        </div>
      </div>

      {/* Device Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold bg-slate-800 text-emerald-300 px-2.5 py-0.5 rounded border border-slate-700">
                {device.code}
              </span>
              <span className="text-xs font-bold bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                {device.type}
              </span>
              <DeviceStatusBadge status={device.status} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {device.name}
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {device.specs || 'Komponent aparatury sterowniczej linii produkcyjnej.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsQrOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Drukuj QR na aparat</span>
            </button>
            <button
              onClick={() => setIsAddEventOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Zgłoś usterkę / wymianę</span>
            </button>
            <button
              onClick={() => setIsAddDocOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <FolderLock className="w-4 h-4 text-blue-400" />
              <span>Dodaj instrukcję DTR</span>
            </button>
          </div>
        </div>

        {/* Technical Data Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block">Producent & Model:</span>
            <span className="text-slate-200 font-semibold">{device.manufacturer} {device.model}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Numer seryjny:</span>
            <span className="text-slate-200 font-semibold font-mono">{device.serialNumber || '–'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Adres IP / Sieć:</span>
            <span className="text-blue-400 font-semibold font-mono">{device.ipAddress || device.networkType || '–'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Szafa / Linia:</span>
            <Link href={`/cabinets/${device.cabinetId}`} className="text-emerald-400 font-semibold hover:underline">
              {device.cabinetName}
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('DOCS')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 -mb-px cursor-pointer ${
            activeTab === 'DOCS'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderLock className="w-4 h-4" />
          <span>Karty Katalogowe & DTR ({device.documents.length})</span>
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
          <span>Historia Zdarzeń & Zgłoszeń ({device.events.length})</span>
        </button>
      </div>

      {/* Tab 1: Documents */}
      {activeTab === 'DOCS' && (
        <div className="space-y-3">
          {device.documents.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500 text-xs">
              Brak dokumentacji dedykowanej dla tego podzespołu. Kliknij &quot;Dodaj instrukcję DTR&quot; powyżej.
            </div>
          ) : (
            device.documents.map((doc) => (
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

      {/* Tab 2: Events */}
      {activeTab === 'EVENTS' && (
        <div className="space-y-4">
          {device.events.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500 text-xs">
              Brak zgłoszonych usterek lub prac serwisowych dla tego urządzenia.
            </div>
          ) : (
            device.events.map((evt) => (
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
                      <span>Zdjęcia:</span>
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
          title={device.name}
          code={device.code}
          qrCodeData={device.qrCode}
          typeText={`Urządzenie (${device.type})`}
          locationDetails={`Szafa: ${device.cabinetName}`}
          targetUrl={`/devices/${device.id}`}
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

      {/* Add Event Modal with device preselected */}
      {isAddEventOpen && (
        <AddEventModal
          initialTargetType="DEVICE"
          initialTargetId={device.id}
          initialTargetName={`${device.name} (${device.code})`}
          onClose={() => setIsAddEventOpen(false)}
        />
      )}

      {/* Add Doc Modal with device preselected */}
      {isAddDocOpen && (
        <AddDocumentModal
          initialTargetType="DEVICE"
          initialTargetId={device.id}
          initialTargetName={`${device.name} (${device.code})`}
          onClose={() => setIsAddDocOpen(false)}
        />
      )}
    </div>
  );
}
