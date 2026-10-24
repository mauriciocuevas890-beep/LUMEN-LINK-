import React from 'react';
import { Video, Radio, Sparkles, Check, AlertCircle, Play, ShieldCheck, ExternalLink } from 'lucide-react';
import { VideoEmbedModule } from '../types';
import { parseVideoUrl } from '../utils/videoHelper';

interface VideoEmbedSettingsProps {
  config: VideoEmbedModule;
  onChange: (updated: VideoEmbedModule) => void;
  titleText?: string;
  descriptionText?: string;
}

export function VideoEmbedSettings({
  config,
  onChange,
  titleText = 'Video o Transmisión en Vivo al final de la tarjeta',
  descriptionText = 'Muestra un video de bienvenida o una transmisión en directo (YouTube, Twitch, Vimeo) justo al pie de tu perfil digital, antes del sello de marca.',
}: VideoEmbedSettingsProps) {
  const parsed = parseVideoUrl(config.videoUrl);
  const isAutoLive = parsed.isLiveDetected;

  const handleToggle = (enabled: boolean) => {
    onChange({
      ...config,
      enabled,
      title: config.title || (config.isLive || isAutoLive ? 'Transmisión en Vivo' : 'Video Destacado'),
    });
  };

  const handleUrlChange = (url: string) => {
    const info = parseVideoUrl(url);
    onChange({
      ...config,
      videoUrl: url,
      // If live is detected in URL, auto-flag isLive if not explicitly set
      isLive: info.isLiveDetected ? true : config.isLive,
    });
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
      {/* Header with Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <Video className="w-4 h-4" />
            </span>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{titleText}</span>
              {config.enabled && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Activo
                </span>
              )}
            </h4>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            {descriptionText}
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
          <span className="text-xs text-slate-400 font-medium">
            {config.enabled ? 'Activado' : 'Desactivado'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={config.enabled}
            onClick={() => handleToggle(!config.enabled)}
            className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none p-0.5 ${
              config.enabled ? 'bg-red-500 shadow-md shadow-red-500/30' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                config.enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Storage info banner */}
      <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs flex items-start gap-2.5 text-slate-300">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-emerald-400 block">
            0% de almacenamiento utilizado en tu servidor
          </span>
          <span className="text-[11px] text-slate-400">
            Los videos se reproducen directamente de YouTube, Twitch o Vimeo. No ocupan espacio en tu base de datos ni consumen límites de descarga al escanear la tarjeta NFC.
          </span>
        </div>
      </div>

      {/* Form Fields when enabled */}
      {config.enabled && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-200">
          {/* URL Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-white flex items-center justify-between">
              <span>Enlace del Video o Transmisión en Vivo</span>
              {parsed.platform && (
                <span className="text-[10px] uppercase font-bold text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded-md">
                  Plataforma: {parsed.platform}
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="url"
                value={config.videoUrl || ''}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://www.instagram.com/reel/... o https://www.facebook.com/watch/?v=..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 pr-24"
              />
              <div className="absolute right-2 top-2 flex items-center gap-1">
                {parsed.isValid ? (
                  <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Válido
                  </span>
                ) : config.videoUrl ? (
                  <span className="px-2 py-1 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Revisar
                  </span>
                ) : null}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Formatos soportados: <strong>Instagram</strong> (Reels y Posts), <strong>Facebook</strong> (Videos y Watch), <strong>YouTube</strong> (videos, Shorts y Live), <strong>Loom</strong>, <strong>TikTok</strong>, <strong>Vimeo</strong>, <strong>Twitch</strong> y <strong>Videos directos .mp4</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Custom Title */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                Título de la sección (Opcional)
              </label>
              <input
                type="text"
                value={config.title || ''}
                onChange={(e) => onChange({ ...config, title: e.target.value })}
                placeholder={config.isLive ? 'Transmisión en Vivo' : 'Video Destacado'}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Is Live Toggle Badge */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                Modo Transmisión
              </label>
              <label className="flex items-center gap-2.5 p-2 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-all select-none">
                <input
                  type="checkbox"
                  checked={Boolean(config.isLive)}
                  onChange={(e) => onChange({ ...config, isLive: e.target.checked })}
                  className="rounded border-slate-700 text-red-600 focus:ring-red-500 w-4 h-4"
                />
                <span className="text-xs text-slate-200 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>Distintivo "🔴 EN VIVO"</span>
                </span>
              </label>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-500">Probar ejemplos:</span>
            <button
              type="button"
              onClick={() =>
                handleUrlChange('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
              }
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium transition-all"
            >
              YouTube
            </button>
            <button
              type="button"
              onClick={() =>
                handleUrlChange('https://www.instagram.com/reel/C8qL_XDu93u/')
              }
              className="px-2.5 py-1 rounded-lg bg-pink-950/50 hover:bg-pink-900/50 text-[11px] text-pink-300 border border-pink-800/50 font-medium transition-all"
            >
              Instagram Reel
            </button>
            <button
              type="button"
              onClick={() =>
                handleUrlChange('https://www.facebook.com/watch/?v=10153231379946729')
              }
              className="px-2.5 py-1 rounded-lg bg-blue-950/50 hover:bg-blue-900/50 text-[11px] text-blue-300 border border-blue-800/50 font-medium transition-all"
            >
              Facebook Video
            </button>
            <button
              type="button"
              onClick={() =>
                handleUrlChange('https://vimeo.com/76979871')
              }
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium transition-all"
            >
              Vimeo
            </button>
            <button
              type="button"
              onClick={() =>
                handleUrlChange('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')
              }
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium transition-all"
            >
              Video .MP4
            </button>
          </div>

          {/* Real-time Inline Player Preview */}
          {parsed.isValid && parsed.embedUrl && (
            <div className="mt-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-red-400" />
                  <span>Vista previa de reproducción ({parsed.platform})</span>
                </span>
                {config.isLive && (
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                    ● EN VIVO
                  </span>
                )}
              </div>
              <div
                className={`w-full ${
                  parsed.isVertical ? 'aspect-[9/16] max-w-[240px] mx-auto' : 'aspect-video'
                } rounded-lg overflow-hidden bg-black border border-slate-800`}
              >
                {parsed.isDirectVideo ? (
                  <video
                    src={parsed.embedUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <iframe
                    src={parsed.embedUrl}
                    title="Vista Previa de Video"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                )}
              </div>

              {parsed.platform === 'instagram' && (
                <div className="p-3 bg-pink-950/30 border border-pink-800/40 rounded-lg text-xs space-y-1.5 text-pink-200">
                  <div className="flex items-center gap-1.5 font-bold text-pink-300">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    <span>¿Instagram muestra "The link may be broken"?</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-pink-200/90">
                    Instagram protege la privacidad de sus creadores. Para que un Reel se reproduzca directamente dentro de otra web:
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-pink-200/80">
                    <li>La cuenta de Instagram debe ser <strong>Pública</strong> (las cuentas privadas impiden la incrustación).</li>
                    <li>En la app de Instagram ve a: <em>Configuración ➔ Compartir y reutilizar ➔ <strong>"Permitir que las personas incrusten tus publicaciones o reels"</strong></em> y asegúrate de que esté <strong>Activado</strong>.</li>
                    <li>Reels con música comercial protegida por derechos de autor pueden ser bloqueados por Meta para reproductores externos. Tus visitantes siempre tendrán el botón para abrirlo directamente en Instagram.</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
