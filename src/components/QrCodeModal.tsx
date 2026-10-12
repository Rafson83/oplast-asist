'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Printer, Download, Copy, Check, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface QrCodeModalProps {
  title: string;
  code: string;
  qrCodeData: string;
  typeText: string;
  locationDetails?: string;
  targetUrl?: string;
  onClose: () => void;
}

export function QrCodeModal({
  title,
  code,
  qrCodeData,
  typeText,
  locationDetails,
  targetUrl,
  onClose,
}: QrCodeModalProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(qrCodeData, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    }).then(setDataUrl).catch(console.error);
  }, [qrCodeData]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(qrCodeData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Etykieta QR - ${code}</title>
          <style>
            @page { size: auto; margin: 10mm; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh; 
              margin: 0;
            }
            .label {
              border: 3px solid #000;
              padding: 16px;
              text-align: center;
              width: 320px;
              border-radius: 8px;
            }
            .brand {
              font-size: 16px;
              font-weight: 900;
              letter-spacing: 1px;
              border-bottom: 2px solid #000;
              padding-bottom: 6px;
              margin-bottom: 8px;
            }
            .type {
              font-size: 11px;
              font-weight: 700;
              color: #444;
              text-transform: uppercase;
            }
            .title {
              font-size: 14px;
              font-weight: 700;
              margin: 4px 0;
            }
            .qr {
              margin: 8px 0;
            }
            .qr img {
              width: 180px;
              height: 180px;
            }
            .code {
              font-family: monospace;
              font-size: 16px;
              font-weight: 900;
              background: #eee;
              padding: 4px 8px;
              border-radius: 4px;
              display: inline-block;
            }
            .footer {
              font-size: 10px;
              color: #666;
              margin-top: 8px;
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="brand">OPLAST • CYFROWE DTR</div>
            <div class="type">${typeText}</div>
            <div class="title">${title}</div>
            <div class="qr"><img src="${dataUrl}" alt="QR" /></div>
            <div class="code">${code}</div>
            <div class="footer">${locationDetails || 'Zeskanuj telefonem aby otworzyć dokumentację'}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR_${code}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
            {typeText}
          </div>
          <h3 className="text-lg font-bold text-slate-100 mt-1">{title}</h3>
          <div className="text-xs text-slate-400 mt-0.5">{locationDetails}</div>
        </div>

        {/* QR Card Preview */}
        <div className="bg-white p-6 rounded-xl text-slate-900 text-center shadow-inner flex flex-col items-center">
          <div className="text-xs font-black tracking-wider text-slate-900 mb-1 border-b border-slate-300 pb-1 w-full">
            OPLAST ASIST • DTR
          </div>
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt="Kod QR" className="w-48 h-48 my-1" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-slate-400">
              Generowanie kodu...
            </div>
          )}
          <div className="font-mono font-bold text-sm bg-slate-100 px-3 py-1 rounded text-slate-800 border border-slate-300">
            {code}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Drukuj etykietę
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 px-4 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Pobierz PNG
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 hover:text-slate-200 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Skopiowano ID' : 'Kopiuj kod QR'}</span>
          </button>

          {targetUrl && (
            <Link
              href={targetUrl}
              onClick={onClose}
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium"
            >
              <span>Przejdź do obiektu</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
