'use client';

import React from 'react';
import { X, ExternalLink, Tag } from 'lucide-react';
import { EventPhoto } from '@/types';

interface PhotoLightboxModalProps {
  photo: EventPhoto;
  onClose: () => void;
}

export function PhotoLightboxModal({ photo, onClose }: PhotoLightboxModalProps) {
  const getBadge = () => {
    switch (photo.photoType) {
      case 'BEFORE':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-xs font-bold">STAN PRZED ZMIANĄ</span>;
      case 'DURING':
        return <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded text-xs font-bold">W TRAKCIE PRAC</span>;
      case 'AFTER':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-xs font-bold">STAN PO ZMIANIE</span>;
      case 'SCHEMATIC':
        return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded text-xs font-bold">SCHEMAT POŁĄCZEŃ</span>;
      default:
        return <span className="bg-slate-500/20 text-slate-300 border border-slate-500/40 px-2 py-0.5 rounded text-xs font-bold">ZDJĘCIE OGÓLNE</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            {getBadge()}
            <span className="text-xs text-slate-400">Data: {photo.createdAt}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={photo.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Otwórz oryginalny rozmiar"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Photo viewport */}
        <div className="flex-1 overflow-auto bg-black flex items-center justify-center p-2 min-h-[300px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.fileUrl}
            alt={photo.caption || 'Zdjęcie zdarzenia'}
            className="max-h-[70vh] max-w-full object-contain rounded"
          />
        </div>

        {/* Caption footer */}
        {photo.caption && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-200 flex items-start gap-2">
            <Tag className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{photo.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}
