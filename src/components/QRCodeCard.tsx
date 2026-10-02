import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Download,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Maximize2,
  Share2,
  Contact,
} from 'lucide-react';
import { UserProfile, ClientProfile } from '../types';
import { generateQRCodeDataURL, downloadFile } from '../utils/qr';
import { generateAndDownloadVCF } from '../utils/vcard';
import { getPublicProfileUrl } from '../utils/urlHelper';
import { copyToClipboard } from '../utils/clipboard';

interface QRCodeCardProps {
  profile: UserProfile | ClientProfile;
  onOpenAdvancedModal: () => void;
}

export function QRCodeCard({ profile, onOpenAdvancedModal }: QRCodeCardProps) {
  const username = profile.username;
  const displayName = profile.displayName || ('clientName' in profile ? profile.clientName : profile.username);
  const avatarUrl = profile.avatarUrl;

  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [vcfDownloaded, setVcfDownloaded] = useState(false);

  const publicUrl = getPublicProfileUrl(username, profile.customDomain);

  useEffect(() => {
    let active = true;

    async function makeQR() {
      try {
        const url = await generateQRCodeDataURL(publicUrl, {
          fgColor: '#0f172a',
          bgColor: '#ffffff',
          width: 600,
          margin: 2,
          includeAvatar: Boolean(avatarUrl),
          avatarUrl,
        });
        if (active) setQrUrl(url);
      } catch (err) {
        console.error('Failed to generate preview QR:', err);
      }
    }

    makeQR();

    return () => {
      active = false;
    };
  }, [publicUrl, avatarUrl]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(publicUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadQuick = () => {
    if (!qrUrl) return;
    setDownloading(true);
    downloadFile(qrUrl, `qr_${username}_lumen_link.png`);
    setTimeout(() => setDownloading(false), 1500);
  };

  const handleDownloadVCF = () => {
    const success = generateAndDownloadVCF(profile, { publicUrl });
    if (success) {
      setVcfDownloaded(true);
      setTimeout(() => setVcfDownloaded(false), 2500);
    }
  };

  return (
    <div
      id="qr-code-inline-card"
      className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-sky-950/30 border border-slate-800 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-sky-400" />
            <span>Código QR de la Tarjeta Digital</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Enlaza directamente al perfil público de{' '}
            <strong className="text-slate-200">@{username}</strong>. Listo para imprimir en tarjetas de presentación o escanear en vivo.
          </p>
        </div>

        <button
          id="open-advanced-qr-btn"
          type="button"
          onClick={onOpenAdvancedModal}
          className="px-3.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold transition-all flex items-center gap-1.5 self-start"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Personalizar y Descargar HQ</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* QR Code Graphic Box */}
        <div className="md:col-span-4 flex flex-col items-center justify-center">
          <div
            onClick={onOpenAdvancedModal}
            className="cursor-pointer group relative p-4 rounded-3xl bg-white shadow-xl hover:shadow-sky-500/10 transition-all hover:scale-[1.03]"
            title="Clic para abrir el generador ampliado"
          >
            {qrUrl ? (
              <img
                src={qrUrl}
                alt={`Código QR de ${displayName}`}
                className="w-40 h-40 object-contain rounded-xl"
              />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            <div className="absolute inset-0 rounded-3xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1 backdrop-blur-xs">
              <Maximize2 className="w-4 h-4" />
              <span>Ampliar</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 font-medium">
            Escanea con cualquier cámara móvil
          </span>
        </div>

        {/* Info & Details */}
        <div className="md:col-span-8 space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              URL de Destino
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs sm:text-sm text-sky-400 truncate">
                {publicUrl}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Copiar URL"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Abrir perfil"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs text-slate-300 font-medium flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Optimizado para tarjetas de presentación físicas y eventos</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Descarga el archivo PNG para enviarlo a imprenta, añadirlo a folletos, menús o imprimir stickers con acceso instantáneo a todos los enlaces y al botón "Guardar Contacto".
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              id="quick-download-qr-btn"
              type="button"
              onClick={handleDownloadQuick}
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 shadow-md shadow-sky-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Descargado...' : 'Descargar QR (PNG)'}</span>
            </button>

            <button
              id="quick-download-vcf-btn"
              type="button"
              onClick={handleDownloadVCF}
              className="px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-bold text-xs transition-all flex items-center gap-2"
              title="Descargar archivo estándar .vcf para guardar en la agenda telefónica"
            >
              {vcfDownloaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>¡Ficha Descargada!</span>
                </>
              ) : (
                <>
                  <Contact className="w-3.5 h-3.5" />
                  <span>Descargar Contacto (.vcf)</span>
                </>
              )}
            </button>

            <button
              id="open-custom-modal-btn"
              type="button"
              onClick={onOpenAdvancedModal}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-2"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Ver Tarjeta Digital Completa y SVG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
