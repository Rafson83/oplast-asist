'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import { Camera, RefreshCw, ArrowRight, Zap, QrCode, AlertCircle } from 'lucide-react';
import { User } from '@/types';

export function QrScannerPageView({ currentUser }: { currentUser: User }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const [manualCode, setManualCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{ name: string; url: string; type: string } | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const stopCamera = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const handleLookup = useCallback(async (codeToLookup: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const res = await fetch(`/api/qr/lookup?code=${encodeURIComponent(codeToLookup.trim())}`);
      const data = await res.json();
      if (res.ok && data.url) {
        setScanResult({
          name: data.name,
          url: data.url,
          type: data.type,
        });
        stopCamera();
        setTimeout(() => {
          router.push(data.url);
        }, 1200);
      } else {
        setCameraError(data.error || 'Nie rozpoznano kodu QR');
        setTimeout(() => setCameraError(''), 3000);
      }
    } catch {
      setCameraError('Błąd odczytu kodu');
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, router, stopCamera]);

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          handleLookup(code.data);
          return;
        }
      }
    }

    animationFrameId.current = requestAnimationFrame(tick);
  }, [handleLookup]);

  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        setHasCamera(true);
        animationFrameId.current = requestAnimationFrame(tick);
      }
    } catch (err: unknown) {
      console.warn('Camera error:', err);
      setHasCamera(false);
      setCameraError('Aparat niedostępny w tej przeglądarce lub brak uprawnień.');
    }
  }, [tick]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <QrCode className="w-4 h-4 text-emerald-400" />
          <span>Szybka Identyfikacja na Hali</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Skaner Kodów QR Maszyn i Szaf
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Zeskanuj etykietę na szafie sterowniczej lub silniku, aby natychmiast otworzyć schemat DTR i zgłosić zdarzenie.
        </p>
      </div>

      {/* Camera Viewport */}
      <div className="relative aspect-4/3 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex items-center justify-center">
        {hasCamera ? (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />

            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-56 border-2 border-emerald-400/80 rounded-2xl relative">
                <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl"></div>
                <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr"></div>
                <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl"></div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br"></div>
                <div className="w-full h-0.5 bg-emerald-400/70 absolute top-1/2 -translate-y-1/2 animate-pulse"></div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <Camera className="w-16 h-16 text-slate-600 mx-auto mb-3" />
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              {cameraError || 'Aparat jest nieaktywny. Możesz wpisać kod ręcznie poniżej lub przetestować jedno z gotowych urządzeń.'}
            </p>
            <button
              onClick={startCamera}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Włącz kamerę ponownie
            </button>
          </div>
        )}

        {/* Scan Success Modal */}
        {scanResult && (
          <div className="absolute inset-0 bg-emerald-950/95 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-3 shadow-xl">
              <Zap className="w-7 h-7" />
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-300">
              Rozpoznano: {scanResult.type}
            </div>
            <div className="text-lg font-black text-white mt-1 max-w-sm">{scanResult.name}</div>
            <div className="text-xs text-emerald-200 mt-3 flex items-center gap-1.5">
              <span>Otwieranie karty i schematów...</span>
              <ArrowRight className="w-4 h-4 animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {cameraError && !scanResult && (
        <div className="p-3 bg-rose-950/60 border border-rose-900 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Manual Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="text-xs font-bold text-slate-300 mb-2">
          Wpisz oznaczenie aparatu lub szafy ręcznie (lub skanerem ręcznym):
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (manualCode.trim()) handleLookup(manualCode.trim());
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="np. OPL-CAB-KM01-S1 lub LIN-WTR-01"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={isProcessing}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            {isProcessing ? 'Szukam...' : 'Przejdź'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Quick Demo Links */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Szybkie przejścia testowe:
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleLookup('OPL-LIN-MYJ-03')}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-emerald-500 transition cursor-pointer"
          >
            🌊 Linia Myjąca 3 (Hala 1)
          </button>
          <button
            onClick={() => handleLookup('OPL-LIN-GRAN-DUZA')}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-emerald-500 transition cursor-pointer"
          >
            🔄 Duża Granulacja (Hala Duża)
          </button>
          <button
            onClick={() => handleLookup('OPL-WTR-04')}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-emerald-500 transition cursor-pointer"
          >
            ⚙️ Wtryskarka 4 (450T)
          </button>
          <button
            onClick={() => handleLookup('OPL-CAB-TRAFO-T2')}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-emerald-500 transition cursor-pointer"
          >
            ⚡ Trafo T2 (1250 kVA)
          </button>
          <button
            onClick={() => handleLookup('OPL-INFRA-OCZ')}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-emerald-500 transition cursor-pointer"
          >
            💧 Oczyszczalnia Ścieków
          </button>
          <button
            onClick={() => handleLookup('OPL-INFRA-PV')}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-emerald-500 transition cursor-pointer"
          >
            ☀️ Fotowoltaika (PV 500kWp)
          </button>
        </div>
      </div>
    </div>
  );
}
