import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Download,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  X,
  Palette,
  Image as ImageIcon,
  Share2,
  Printer,
  ShieldCheck,
  User,
  Building,
  Phone,
  Mail,
  Contact,
  Upload,
  Camera,
  CreditCard,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { UserProfile, ClientProfile } from '../types';
import {
  generateQRCodeDataURL,
  generateQRCodeSVG,
  generateDigitalBusinessCardImage,
  downloadFile,
} from '../utils/qr';
import { generateAndDownloadVCF } from '../utils/vcard';
import { getPublicProfileUrl } from '../utils/urlHelper';
import { copyToClipboard } from '../utils/clipboard';
import {
  processImageFile,
  validateImageFile,
  CARD_TEMPLATE_OPTIONS,
  AVATAR_OPTIONS,
} from '../utils/imageUpload';

interface QRCodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | ClientProfile;
  customTitle?: string;
  onSaveCardTemplate?: (url: string) => Promise<void> | void;
  onSaveAvatar?: (url: string) => Promise<void> | void;
  viewOnly?: boolean;
}

export function QRCodeGeneratorModal({
  isOpen,
  onClose,
  profile,
  customTitle,
  onSaveCardTemplate,
  onSaveAvatar,
  viewOnly = false,
}: QRCodeGeneratorModalProps) {
  const username = profile.username;
  const displayName = profile.displayName || ('clientName' in profile ? profile.clientName : profile.username);
  const vcard = profile.vcard_details;
  const initialAvatarUrl = profile.avatarUrl;

  // Active view: 'qr-only' | 'digital-card' (always 'qr-only' if viewOnly)
  const [viewMode, setViewMode] = useState<'qr-only' | 'digital-card'>(
    viewOnly ? 'qr-only' : 'digital-card'
  );

  // QR Customization options
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [includeAvatar, setIncludeAvatar] = useState(Boolean(initialAvatarUrl));
  const [cardTheme, setCardTheme] = useState<'dark' | 'light' | 'gradient'>('dark');

  // Custom template & avatar uploaded from device
  const [customCardTemplateUrl, setCustomCardTemplateUrl] = useState<string>(
    profile.theme_preferences?.cardTemplateUrl || ''
  );
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>(profile.avatarUrl || '');
  const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const templateFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Generated images cache
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [digitalCardDataUrl, setDigitalCardDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // User feedback states
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Full public profile URL
  const publicUrl = getPublicProfileUrl(username, profile.customDomain);

  // Sync state if profile changes
  useEffect(() => {
    if (profile.theme_preferences?.cardTemplateUrl) {
      setCustomCardTemplateUrl(profile.theme_preferences.cardTemplateUrl);
    }
    if (profile.avatarUrl) {
      setCustomAvatarUrl(profile.avatarUrl);
    }
  }, [profile]);

  const handleUploadTemplateFile = async (file: File) => {
    setUploadError(null);
    const val = validateImageFile(file);
    if (!val.valid) {
      setUploadError(val.error || 'Archivo inválido.');
      return;
    }
    try {
      setIsUploadingTemplate(true);
      const dataUrl = await processImageFile(file, CARD_TEMPLATE_OPTIONS);
      setCustomCardTemplateUrl(dataUrl);
      if (onSaveCardTemplate) {
        await onSaveCardTemplate(dataUrl);
      }
      setDownloadSuccess('¡Plantilla de tarjeta cargada con éxito!');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al procesar plantilla.');
    } finally {
      setIsUploadingTemplate(false);
    }
  };

  const handleUploadAvatarFile = async (file: File) => {
    setUploadError(null);
    const val = validateImageFile(file);
    if (!val.valid) {
      setUploadError(val.error || 'Archivo inválido.');
      return;
    }
    try {
      setIsUploadingAvatar(true);
      const dataUrl = await processImageFile(file, AVATAR_OPTIONS);
      setCustomAvatarUrl(dataUrl);
      setIncludeAvatar(true);
      if (onSaveAvatar) {
        await onSaveAvatar(dataUrl);
      }
      setDownloadSuccess('¡Foto de perfil actualizada con éxito!');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al procesar foto.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Color preset options
  const COLOR_PRESETS = [
    { label: 'Negro Clásico', hex: '#0f172a' },
    { label: 'Azul Lumen', hex: '#0284c7' },
    { label: 'Esmeralda', hex: '#059669' },
    { label: 'Púrpura Real', hex: '#7c3aed' },
    { label: 'Rosa Neón', hex: '#db2777' },
  ];

  // Re-generate QR and Digital Card whenever parameters change
  useEffect(() => {
    let isCancelled = false;

    async function generateAssets() {
      if (!isOpen) return;
      setLoading(true);
      try {
        // 1. Generate QR Code
        const qrUrl = await generateQRCodeDataURL(publicUrl, {
          fgColor,
          bgColor,
          width: 800,
          margin: 2,
          includeAvatar: includeAvatar && Boolean(customAvatarUrl),
          avatarUrl: customAvatarUrl,
        });

        // 2. Generate Digital Business Card
        const cardUrl = await generateDigitalBusinessCardImage(profile, publicUrl, {
          accentColor: fgColor === '#0f172a' ? '#0284c7' : fgColor,
          cardTheme,
          customTemplateUrl: customCardTemplateUrl,
          customAvatarUrl: customAvatarUrl,
        });

        if (!isCancelled) {
          setQrDataUrl(qrUrl);
          setDigitalCardDataUrl(cardUrl);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to generate QR code or card:', err);
        if (!isCancelled) setLoading(false);
      }
    }

    generateAssets();

    return () => {
      isCancelled = true;
    };
  }, [
    isOpen,
    publicUrl,
    fgColor,
    bgColor,
    includeAvatar,
    customAvatarUrl,
    profile,
    cardTheme,
    customCardTemplateUrl,
  ]);

  if (!isOpen) return null;

  // Handle URL Copy
  const handleCopyUrl = async () => {
    const ok = await copyToClipboard(publicUrl);
    if (ok) {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  // Download High-Res QR Code (PNG)
  const handleDownloadQRPNG = () => {
    if (!qrDataUrl) return;
    downloadFile(qrDataUrl, `qr_${username}_lumen_link.png`);
    setDownloadSuccess('Código QR PNG descargado');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Download Vector QR Code (SVG)
  const handleDownloadQRSVG = async () => {
    try {
      const svgString = await generateQRCodeSVG(publicUrl, {
        fgColor,
        bgColor,
        margin: 2,
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      downloadFile(url, `qr_${username}_lumen_link.svg`);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDownloadSuccess('Vector SVG descargado');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (e) {
      console.error('Error generating SVG:', e);
    }
  };

  // Download Digital Business Card Image (PNG)
  const handleDownloadDigitalCard = () => {
    if (!digitalCardDataUrl) return;
    downloadFile(digitalCardDataUrl, `tarjeta_digital_${username}.png`);
    setDownloadSuccess('Tarjeta Digital descargada');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Download standard .vcf file for this business card
  const handleDownloadVCF = () => {
    const success = generateAndDownloadVCF(profile, { publicUrl });
    if (success) {
      setDownloadSuccess('¡Ficha de contacto estándar (.vcf) generada y descargada para guardar en tu agenda!');
      setTimeout(() => setDownloadSuccess(null), 3500);
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    try {
      const targetUrl = viewMode === 'digital-card' ? digitalCardDataUrl : qrDataUrl;
      if (!targetUrl) return;

      const res = await fetch(targetUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2500);
    } catch (err) {
      console.warn('Clipboard image write not supported:', err);
      // Fallback: copy public URL instead
      handleCopyUrl();
    }
  };

  // Print function
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const targetImg = viewMode === 'digital-card' ? digitalCardDataUrl : qrDataUrl;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Imprimir Código QR - ${displayName}</title>
          <style>
            body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, sans-serif; background: #fff; }
            img { max-width: 85%; max-height: 80vh; object-fit: contain; }
            h2 { margin-bottom: 4px; }
            p { margin-top: 0; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <h2>${displayName}</h2>
          <p>${publicUrl}</p>
          <img src="${targetImg}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div
      id="qr-code-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {viewOnly ? (
        /* Dedicated View-Only QR Modal: ONLY the QR code, link, and download (No settings or customization) */
        <div
          id="qr-code-modal-container"
          className="w-full max-w-sm sm:max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  {customTitle || 'Código QR'}
                </h2>
                <p className="text-xs text-slate-400">
                  <span className="font-mono text-sky-400">@{username}</span>
                </p>
              </div>
            </div>

            <button
              id="close-qr-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: Pure QR Code display */}
          <div className="p-5 sm:p-6 flex flex-col items-center space-y-4">
            {/* QR Card with white high-contrast background for easy camera detection */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white shadow-2xl border border-slate-700/30 flex items-center justify-center">
              {loading ? (
                <div className="w-52 h-52 sm:w-60 sm:h-60 flex flex-col items-center justify-center text-slate-500 gap-2">
                  <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-medium">Generando código QR...</span>
                </div>
              ) : qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`Código QR de ${displayName}`}
                  className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-xl select-none"
                />
              ) : null}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Apunta con la cámara de tu teléfono para abrir el perfil</span>
            </div>

            {/* Direct Link Bar */}
            <div className="w-full flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs font-mono text-slate-300 truncate pl-2 select-all">
                {publicUrl}
              </span>
              <button
                id="copy-qr-url-btn"
                type="button"
                onClick={handleCopyUrl}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5 flex-shrink-0 active:scale-95"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>

            {/* Notification message */}
            {downloadSuccess && (
              <div className="w-full p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{downloadSuccess}</span>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                id="download-qr-png-btn"
                type="button"
                onClick={handleDownloadQRPNG}
                className="py-3 px-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Descargar QR (PNG)</span>
              </button>

              {profile.vcard_details?.phone || profile.vcard_details?.fullName ? (
                <button
                  id="modal-qr-vcf-download-btn"
                  type="button"
                  onClick={handleDownloadVCF}
                  className="py-3 px-4 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Contact className="w-4 h-4" />
                  <span>Guardar Contacto</span>
                </button>
              ) : (
                <button
                  id="copy-card-image-btn"
                  type="button"
                  onClick={handleCopyImage}
                  className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {copiedImage ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copiada</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Imagen</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Full Creator / Studio QR Generator Container with Settings */
        <div
          id="qr-code-modal-container"
          className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        >
          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>{customTitle || 'Generador de Código QR'}</span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    Digital Card
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Enlace directo al perfil público:{' '}
                  <span className="font-mono text-sky-400">@{username}</span>
                </p>
              </div>
            </div>

            <button
              id="close-qr-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Public Link Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0 px-1">
              <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-mono text-slate-200 truncate select-all">
                {publicUrl}
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                id="copy-qr-url-btn"
                type="button"
                onClick={handleCopyUrl}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar URL</span>
                  </>
                )}
              </button>

              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Abrir perfil público"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              id="qr-mode-card-tab"
              type="button"
              onClick={() => setViewMode('digital-card')}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                viewMode === 'digital-card'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Tarjeta Digital con QR</span>
            </button>

            <button
              id="qr-mode-code-tab"
              type="button"
              onClick={() => setViewMode('qr-only')}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                viewMode === 'qr-only'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Código QR Puro (Print)</span>
            </button>
          </div>

          {/* Visual Preview Area */}
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-950/60 border border-slate-800/80 min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-12 text-slate-400">
                <div className="w-8 h-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Generando código QR de alta resolución...</span>
              </div>
            ) : viewMode === 'digital-card' ? (
              /* Digital Business Card Preview */
              <div className="flex flex-col items-center w-full max-w-sm">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 transition-transform duration-200 hover:scale-[1.01] bg-slate-900 w-full">
                  {digitalCardDataUrl && (
                    <img
                      src={digitalCardDataUrl}
                      alt={`Tarjeta Digital de ${displayName}`}
                      className="w-full h-auto object-contain rounded-2xl"
                    />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-3 text-center">
                  Tarjeta optimizada para compartir en redes, historias o imprimir como gafete.
                </p>
              </div>
            ) : (
              /* Clean QR Code Preview */
              <div className="flex flex-col items-center">
                <div
                  className="p-5 rounded-3xl shadow-2xl border border-slate-700/60 transition-transform duration-200 hover:scale-[1.02]"
                  style={{ backgroundColor: bgColor === 'transparent' ? '#ffffff' : bgColor }}
                >
                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt={`Código QR para ${publicUrl}`}
                      className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
                    />
                  )}
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Nivel de corrección 'H' (Ultra escaneable en papel y pantallas)</span>
                </div>
              </div>
            )}
          </div>

          {/* Customization Options Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Palette className="w-4 h-4 text-sky-400" />
              <span>Opciones de Personalización</span>
            </h4>

            {viewMode === 'qr-only' ? (
              <div className="space-y-3">
                {/* QR Colors */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    Color del Código QR
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => setFgColor(preset.hex)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          fgColor === preset.hex
                            ? 'border-sky-400 bg-sky-500/10 text-white shadow-sm'
                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20"
                          style={{ backgroundColor: preset.hex }}
                        />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                    {/* Custom Color Input */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
                      />
                      <span className="text-[11px] font-mono text-slate-400">{fgColor}</span>
                    </div>
                  </div>
                </div>

                {/* Include Center Avatar Toggle */}
                {customAvatarUrl && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-xs font-semibold text-slate-300 block">
                        Foto / Logo en el centro
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Integra tu avatar en el centro del código QR
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeAvatar}
                        onChange={(e) => setIncludeAvatar(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                    </label>
                  </div>
                )}
              </div>
            ) : (
              /* Digital Card Customization */
              <div className="space-y-4">
                {/* 1. UPLOAD CARD TEMPLATE / BACKGROUND FROM DEVICE */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-emerald-400" />
                        Plantilla de Tarjeta o Fondo
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Sube una plantilla o imagen de fondo desde tu dispositivo para personalizar el diseño
                      </span>
                    </div>

                    {customCardTemplateUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomCardTemplateUrl('');
                          if (onSaveCardTemplate) onSaveCardTemplate('');
                        }}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-950/40 border border-rose-900/60"
                        title="Quitar plantilla personalizada"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Quitar</span>
                      </button>
                    )}
                  </div>

                  <input
                    ref={templateFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleUploadTemplateFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      disabled={isUploadingTemplate}
                      onClick={() => templateFileInputRef.current?.click()}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      {isUploadingTemplate ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Procesando plantilla...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>
                            {customCardTemplateUrl
                              ? 'Cambiar plantilla desde dispositivo'
                              : 'Subir plantilla desde tu dispositivo'}
                          </span>
                        </>
                      )}
                    </button>

                    {customCardTemplateUrl && (
                      <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                        <Check className="w-3.5 h-3.5" />
                        <span>Plantilla personalizada activa</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. UPLOAD PROFILE PICTURE DIRECTLY FOR THE CARD */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-sky-400" />
                        Foto de Perfil en la Tarjeta
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Edita la foto que aparece en el gafete o tarjeta digital
                      </span>
                    </div>

                    {customAvatarUrl && (
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-sky-400/60 shadow-xs flex-shrink-0">
                        <img src={customAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <input
                    ref={avatarFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleUploadAvatarFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={isUploadingAvatar}
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    {isUploadingAvatar ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Subiendo foto...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-3.5 h-3.5" />
                        <span>Subir foto desde tu dispositivo</span>
                      </>
                    )}
                  </button>
                </div>

                {uploadError && (
                  <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900/60 p-2.5 rounded-xl font-medium">
                    {uploadError}
                  </p>
                )}

                {/* 3. Estilo de Fondo Alternativo (si no se usa imagen propia) */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    O elige un estilo de fondo base
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'dark', label: 'Oscuro Elegante' },
                      { id: 'gradient', label: 'Gradiente Moderno' },
                      { id: 'light', label: 'Claro Minimalista' },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setCardTheme(theme.id as any)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                          cardTheme === theme.id
                            ? 'bg-sky-500/15 text-sky-400 border-sky-400'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color for banner */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    Color de Acento de Marca
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => setFgColor(preset.hex)}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          fgColor === preset.hex
                            ? 'border-white scale-110 shadow-lg'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: preset.hex }}
                        title={preset.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Feedback banner */}
          {downloadSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* Export & Download Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
            {viewMode === 'digital-card' ? (
              <>
                <button
                  id="download-digital-card-btn"
                  type="button"
                  onClick={handleDownloadDigitalCard}
                  className="py-3 px-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Tarjeta (PNG)</span>
                </button>

                <button
                  id="modal-vcf-download-btn"
                  type="button"
                  onClick={handleDownloadVCF}
                  className="py-3 px-4 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                  title="Descargar archivo estándar .vcf para importar el contacto en la agenda del teléfono"
                >
                  <Contact className="w-4 h-4" />
                  <span>Guardar Contacto (.vcf)</span>
                </button>

                <button
                  id="copy-card-image-btn"
                  type="button"
                  onClick={handleCopyImage}
                  className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                >
                  {copiedImage ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copiada</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Imagen</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  id="download-qr-png-btn"
                  type="button"
                  onClick={handleDownloadQRPNG}
                  className="py-3 px-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar PNG (HQ)</span>
                </button>

                <button
                  id="download-qr-svg-btn"
                  type="button"
                  onClick={handleDownloadQRSVG}
                  className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Vector (SVG)</span>
                </button>

                <button
                  id="modal-qr-vcf-download-btn"
                  type="button"
                  onClick={handleDownloadVCF}
                  className="py-3 px-4 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                  title="Descargar archivo estándar .vcf para la agenda"
                >
                  <Contact className="w-4 h-4" />
                  <span>Guardar Contacto (.vcf)</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Escaneable con cualquier smartphone (iOS y Android)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
