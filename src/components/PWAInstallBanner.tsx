import React, { useState, useEffect } from 'react';
import { Download, Share2, PlusSquare, X, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(true);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if dismissed recently (in the last 2 days)
    const dismissedUntil = localStorage.getItem('pwa_banner_dismissed_until');
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      setIsDismissed(true);
    } else {
      setIsDismissed(false);
    }
  }, []);

  // Do not show on shared public profile pages so visitors only see profile information
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isManagementRoute = pathname === '/' || pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/client');
  if (!isManagementRoute) {
    return null;
  }

  // Do not show if already in standalone app, or dismissed, or neither installable nor iOS
  if (isInstalled || isDismissed || (!isInstallable && !isIOS)) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    // Dismiss for 2 days
    localStorage.setItem('pwa_banner_dismissed_until', (Date.now() + 2 * 24 * 60 * 60 * 1000).toString());
  };

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    const success = await install();
    if (success) {
      setInstalled(true);
      setTimeout(() => {
        setIsDismissed(true);
      }, 2500);
    }
  };

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-bottom-5 duration-300">
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl shadow-sky-950/40 text-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/logo.png"
              alt="LumenBase Logo"
              className="w-10 h-10 rounded-xl object-contain bg-slate-950 border border-slate-800 p-0.5 shrink-0 shadow-xs"
            />
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">Instalar LumenBase</h4>
              <p className="text-[11px] text-slate-400 truncate">Acceso rápido desde tu inicio</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {installed ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-500/20">
                <Check className="w-3.5 h-3.5" /> Instalada
              </span>
            ) : (
              <button
                type="button"
                onClick={handleInstall}
                id="pwa-install-banner-btn"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isIOS ? 'En iPhone' : 'Instalar'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDismiss}
              title="Cerrar aviso"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Guided installation modal for iOS Safari */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.png"
                alt="LumenBase Logo"
                className="w-12 h-12 rounded-xl object-contain bg-slate-950 border border-slate-800 p-1 shadow-md shadow-sky-500/10"
              />
              <div>
                <h3 className="text-base font-bold text-white">Instalar en tu iPhone o iPad</h3>
                <p className="text-xs text-sky-400">LumenBase NFC</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              En Safari para iOS puedes guardar la aplicación directamente en tu pantalla de inicio con su logotipo oficial siguiendo estos 2 pasos:
            </p>

            <div className="space-y-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 mb-5 text-xs text-slate-200">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 shrink-0 mt-0.5">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white">1. Presiona "Compartir"</p>
                  <p className="text-[11px] text-slate-400">Toca el botón con el ícono de compartir en la barra inferior de Safari.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 shrink-0 mt-0.5">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white">2. "Agregar a pantalla de inicio"</p>
                  <p className="text-[11px] text-slate-400">Desliza la lista de opciones y presiona <strong>Agregar a pantalla de inicio</strong>.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
