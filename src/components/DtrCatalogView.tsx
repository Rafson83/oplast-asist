'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FolderLock, 
  Search, 
  PlusCircle, 
  FileText, 
  ExternalLink, 
  Download, 
  Layers, 
  Cpu, 
  Filter,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { User, TechnicalDocument, DocumentType } from '@/types';
import { AddDocumentModal } from './AddDocumentModal';

interface DtrCatalogViewProps {
  currentUser: User;
  documents: TechnicalDocument[];
}

export function DtrCatalogView({ currentUser, documents }: DtrCatalogViewProps) {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [isAddDocOpen, setIsAddDocOpen] = useState<boolean>(false);

  const filteredDocs = documents.filter((doc) => {
    const matchesType = selectedType === 'ALL' || doc.docType === selectedType;
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(search.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const getDocBadgeColor = (type: DocumentType) => {
    switch (type) {
      case 'DTR':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'ELECTRICAL_SCHEMATIC':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'PNEUMATIC_SCHEMATIC':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      case 'USER_MANUAL':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'PLC_BACKUP':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'INSPECTION_REPORT':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getDocTypeLabel = (type: DocumentType) => {
    switch (type) {
      case 'DTR': return 'DTR Maszyny';
      case 'ELECTRICAL_SCHEMATIC': return 'Schemat EPLAN';
      case 'PNEUMATIC_SCHEMATIC': return 'Pneumatyka / Hydraulika';
      case 'USER_MANUAL': return 'Instrukcja / Karta';
      case 'PLC_BACKUP': return 'Kopia PLC / HMI';
      case 'INSPECTION_REPORT': return 'Protokół Badań';
      case 'CERTIFICATE': return 'Certyfikat CE';
      default: return 'Inny';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <FolderLock className="w-4 h-4 text-purple-400" />
            <span>Centralne Repozytorium Dokumentacji</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Cyfrowa DTR & Baza Schematów EPLAN
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Dokumentacje Techniczno-Ruchowe, schematy ideowe, kopie oprogramowania sterowników i instrukcje stanowiskowe
          </p>
        </div>

        <button
          onClick={() => setIsAddDocOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Wgraj nowy dokument</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Type tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedType === 'ALL'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Wszystkie ({documents.length})
          </button>
          <button
            onClick={() => setSelectedType('DTR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedType === 'DTR'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Karty DTR
          </button>
          <button
            onClick={() => setSelectedType('ELECTRICAL_SCHEMATIC')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedType === 'ELECTRICAL_SCHEMATIC'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Schematy EPLAN
          </button>
          <button
            onClick={() => setSelectedType('USER_MANUAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedType === 'USER_MANUAL'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Instrukcje
          </button>
          <button
            onClick={() => setSelectedType('PLC_BACKUP')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedType === 'PLC_BACKUP'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Kopie PLC
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Szukaj dokumentu, pliku..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500 text-xs">
            Brak dokumentacji spełniającej podane kryteria.
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-sm flex flex-col justify-between transition group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getDocBadgeColor(doc.docType)}`}>
                    {getDocTypeLabel(doc.docType)}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {doc.version}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition leading-snug">
                  {doc.title}
                </h3>

                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {doc.description || 'Brak opisu dodatkowego.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1 text-xs text-slate-400">
                  <div className="flex justify-between items-center">
                    <span>Plik źródłowy:</span>
                    <span className="text-slate-300 font-mono text-[11px] truncate max-w-[150px]">{doc.fileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Poziom przypisania:</span>
                    <span className="text-emerald-400 font-semibold">{doc.targetType}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Dodane przez:</span>
                    <span>{doc.uploadedByName || 'UR'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {doc.createdAt}
                </span>

                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Otwórz dokument</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Document Modal */}
      {isAddDocOpen && (
        <AddDocumentModal
          onClose={() => setIsAddDocOpen(false)}
        />
      )}
    </div>
  );
}
