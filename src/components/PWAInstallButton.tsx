import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'button' | 'badge';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running as an installed PWA in standalone mode, hide
  if (isInstalled) {
    return null;
  }

  // Not on iOS and not installable yet (or browser doesn't support beforeinstallprompt)
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 3000);
    }
  };

  return (
    <>
      {installSuccess ? (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold animate-in fade-in">
          <Check className="w-3.5 h-3.5" />
          <span>¡App instalada!</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleInstallClick}
          id="pwa-install-header-btn"
          title={isIOS ? 'Cómo instalar en iPhone / iPad' : 'Instalar LumenBase en tu dispositivo'}
          className={
            className ||
            (variant === 'header'
              ? 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500/20 to-indigo-500/20 hover:from-sky-500/30 hover:to-indigo-500/30 text-sky-300 hover:text-white border border-sky-500/40 text-xs font-semibold shadow-xs transition-all active:scale-95'
              : 'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/25 transition-all')
          }
        >
          <Download className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>{isIOS ? 'Instalar en iPhone' : 'Instalar App'}</span>
        </button>
      )}

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
