'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import { X, Camera, AlertCircle, RefreshCw, ArrowRight, Zap } from 'lucide-react';

interface QrScannerModalProps {
  onClose: () => void;
  onSelect?: (target: { id: string; name: string; type: string; url: string }) => void;
}

export function QrScannerModal({ onClose, onSelect }: QrScannerModalProps) {
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
          onClose();
          if (onSelect) {
            onSelect({
              id: data.id,
              name: data.name,
              type: data.type,
              url: data.url,
            });
          } else {
            router.push(data.url);
          }
        }, 900);
      } else {
        setCameraError(data.error || 'Nie rozpoznano kodu QR');
        setTimeout(() => setCameraError(''), 3000);
      }
    } catch {
      setCameraError('Błąd połączenia podczas odczytu kodu');
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, onClose, onSelect, router, stopCamera]);

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
      console.warn('Camera access denied or unavailable:', err);
      setHasCamera(false);
      setCameraError('Aparat niedostępny lub brak uprawnień. Możesz wpisać kod ręcznie.');
    }
  }, [tick]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleLookup(manualCode.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative">
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Skaner Kodów QR Maszyn i Szaf</h3>
            <p className="text-xs text-slate-400">Skieruj aparat na etykietę QR na szafie lub urządzeniu</p>
          </div>
        </div>

        {/* Camera Viewport or Fallback */}
        <div className="relative aspect-4/3 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
          {hasCamera ? (
            <>
              <video ref={videoRef} className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Target scanner crosshair overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-emerald-400/80 rounded-2xl relative">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr"></div>
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-400 rounded-bl"></div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-400 rounded-br"></div>
                  <div className="w-full h-0.5 bg-emerald-400/70 absolute top-1/2 -translate-y-1/2 animate-pulse"></div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center">
              <Camera className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {cameraError || 'Aparat jest nieaktywny w tym oknie przeglądarki. Wpisz kod ręcznie lub kliknij jeden z gotowych identyfikatorów poniżej.'}
              </p>
              <button
                onClick={startCamera}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Ponów próbę aparatu
              </button>
            </div>
          )}

          {/* Success Result Overlay */}
          {scanResult && (
            <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center p-4 text-center animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-2 shadow-lg">
                <Zap className="w-6 h-6" />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                Rozpoznano: {scanResult.type}
              </div>
              <div className="text-base font-bold text-white mt-1 max-w-xs">{scanResult.name}</div>
              <div className="text-xs text-emerald-200 mt-2 flex items-center gap-1">
                <span>Przekierowywanie do DTR...</span>
                <ArrowRight className="w-3.5 h-3.5 animate-bounce" />
              </div>
            </div>
          )}
        </div>

        {cameraError && !scanResult && (
          <div className="mt-2 text-[11px] text-rose-400 flex items-center gap-1.5 bg-rose-950/50 p-2 rounded-lg border border-rose-900">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Manual Code Input Form */}
        <form onSubmit={handleManualSubmit} className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Wpisz kod QR lub KKS (np. OPL-CAB-KM01-S1)"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={isProcessing}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            {isProcessing ? 'Szukam...' : 'Otwórz'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Instant Demo Shortcuts */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Szybkie testowanie QR (kliknij aby przejść):
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleLookup('OPL-LIN-MYJ-03')}
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 hover:border-emerald-500 transition cursor-pointer"
            >
              🌊 Linia Myjąca 3 (Hala 1)
            </button>
            <button
              onClick={() => handleLookup('OPL-LIN-GRAN-DUZA')}
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 hover:border-emerald-500 transition cursor-pointer"
            >
              🔄 Duża Granulacja (Hala Duża)
            </button>
            <button
              onClick={() => handleLookup('OPL-WTR-04')}
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 hover:border-emerald-500 transition cursor-pointer"
            >
              ⚙️ Wtryskarka 4
            </button>
            <button
              onClick={() => handleLookup('OPL-CAB-TRAFO-T2')}
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 hover:border-emerald-500 transition cursor-pointer"
            >
              ⚡ Trafo T2 (1250 kVA)
            </button>
            <button
              onClick={() => handleLookup('OPL-INFRA-OCZ')}
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 hover:border-emerald-500 transition cursor-pointer"
            >
              💧 Oczyszczalnia
            </button>
            <button
              onClick={() => handleLookup('OPL-INFRA-PV')}
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 hover:border-emerald-500 transition cursor-pointer"
            >
              ☀️ Fotowoltaika (PV)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
