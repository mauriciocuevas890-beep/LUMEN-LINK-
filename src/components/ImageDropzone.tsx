import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Trash2, Camera, RefreshCw, Sliders, Check, Sparkles, CreditCard, LayoutTemplate } from 'lucide-react';
import { processImageFile, validateImageFile, AVATAR_OPTIONS, BACKGROUND_OPTIONS, CARD_TEMPLATE_OPTIONS } from '../utils/imageUpload';

interface ImageDropzoneProps {
  type: 'avatar' | 'background' | 'card_template';
  currentValue?: string;
  onChange: (value: string) => void;
  onRemove?: () => void;
  label?: string;
  description?: string;
  // Background / Template specific props
  opacity?: number;
  onOpacityChange?: (opacity: number) => void;
  blur?: number;
  onBlurChange?: (blur: number) => void;
  overlay?: 'none' | 'dark' | 'light' | 'gradient';
  onOverlayChange?: (overlay: 'none' | 'dark' | 'light' | 'gradient') => void;
}

export function ImageDropzone({
  type,
  currentValue,
  onChange,
  onRemove,
  label,
  description,
  opacity = 0.85,
  onOpacityChange,
  blur = 0,
  onBlurChange,
  overlay = 'dark',
  onOverlayChange,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAvatar = type === 'avatar';
  const isCardTemplate = type === 'card_template';

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Archivo inválido.');
      return;
    }

    try {
      setIsProcessing(true);
      const options = isAvatar ? AVATAR_OPTIONS : isCardTemplate ? CARD_TEMPLATE_OPTIONS : BACKGROUND_OPTIONS;
      const dataUrl = await processImageFile(file, options);
      onChange(dataUrl);
      setShowSettings(true);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al procesar la imagen.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    onChange(inputUrl.trim());
    setInputUrl('');
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            {isAvatar ? (
              <Camera className="w-4 h-4 text-sky-400" />
            ) : isCardTemplate ? (
              <CreditCard className="w-4 h-4 text-emerald-400" />
            ) : (
              <ImageIcon className="w-4 h-4 text-indigo-400" />
            )}
            {label || (isAvatar ? 'Foto de Perfil' : isCardTemplate ? 'Plantilla de la Tarjeta' : 'Fondo del Perfil')}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            {description || (isAvatar ? 'Sube tu foto personal o logotipo' : isCardTemplate ? 'Sube la plantilla o diseño de fondo para tu tarjeta digital' : 'Sube una foto o imagen de fondo personalizada')}
          </p>
        </div>

        {/* Tab switch upload / url */}
        <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              activeTab === 'upload' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Subir Archivo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              activeTab === 'url' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            URL
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Zone */}
      {activeTab === 'upload' ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer transition-all duration-200 border-2 border-dashed rounded-xl p-4 sm:p-6 text-center ${
            isDragging
              ? 'border-sky-400 bg-sky-500/10 scale-[1.01]'
              : 'border-slate-700 hover:border-slate-500 bg-slate-800/40 hover:bg-slate-800/70'
          }`}
        >
          {isProcessing ? (
            <div className="py-6 flex flex-col items-center justify-center gap-2 text-sky-400">
              <RefreshCw className="w-7 h-7 animate-spin" />
              <span className="text-xs font-semibold">Procesando y optimizando imagen...</span>
            </div>
          ) : isAvatar ? (
            /* Avatar preview / dropzone */
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <div className="relative group/avatar">
                {currentValue ? (
                  <img
                    src={currentValue}
                    alt="Foto de perfil"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-sky-400/80 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-slate-400">
                    <Camera className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center text-white text-[11px] font-medium transition-opacity">
                  Cambiar
                </div>
              </div>

              <div className="text-center sm:text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-sm transition-all mb-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  Seleccionar foto desde tu dispositivo
                </span>
                <p className="text-[11px] text-slate-400">
                  Haz clic o arrastra una imagen aquí (JPG, PNG, WEBP)
                </p>
              </div>
            </div>
          ) : isCardTemplate ? (
            /* Card Template preview / dropzone */
            <div className="flex flex-col items-center gap-3">
              {currentValue ? (
                <div className="w-full max-w-sm h-36 rounded-2xl relative overflow-hidden border border-emerald-500/40 shadow-xl group/card bg-slate-950">
                  <img
                    src={currentValue}
                    alt="Plantilla de tarjeta"
                    className="w-full h-full object-cover"
                    style={{
                      opacity,
                      filter: blur ? `blur(${blur}px)` : undefined,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-3">
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Plantilla activa para la tarjeta digital
                    </span>
                    <span className="text-[10px] text-slate-300">
                      Haz clic para cambiar por otro archivo desde tu dispositivo
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-1">
                  <CreditCard className="w-6 h-6" />
                </div>
              )}

              <div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all mb-1">
                  <Upload className="w-3.5 h-3.5" />
                  {currentValue ? 'Cambiar plantilla de tarjeta' : 'Subir plantilla desde tu dispositivo'}
                </span>
                <p className="text-[11px] text-slate-400">
                  Selecciona tu diseño de tarjeta, gafete o fondo (JPG, PNG, WEBP)
                </p>
              </div>
            </div>
          ) : (
            /* Background banner preview / dropzone */
            <div className="flex flex-col items-center gap-3">
              {currentValue ? (
                <div className="w-full h-28 sm:h-32 rounded-lg relative overflow-hidden border border-slate-700 shadow-inner group/bg">
                  <img
                    src={currentValue}
                    alt="Fondo de perfil"
                    className="w-full h-full object-cover"
                    style={{
                      opacity,
                      filter: blur ? `blur(${blur}px)` : undefined,
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-medium opacity-0 group-hover/bg:opacity-100 transition-opacity">
                    Hacer clic para cambiar imagen de fondo
                  </div>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 mb-1">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}

              <div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all mb-1">
                  <Upload className="w-3.5 h-3.5" />
                  {currentValue ? 'Cambiar imagen de fondo' : 'Subir imagen de fondo'}
                </span>
                <p className="text-[11px] text-slate-400">
                  Arrastra o selecciona un archivo desde tu teléfono o computadora
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* URL Input */
        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://ejemplo.com/mi-imagen.jpg"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Aplicar
          </button>
        </form>
      )}

      {/* Error message */}
      {errorMessage && (
        <p className="text-xs text-red-400 font-medium bg-red-950/40 border border-red-900/60 p-2 rounded-lg">
          {errorMessage}
        </p>
      )}

      {/* Action buttons (Remove, Adjustments) */}
      {currentValue && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            {!isAvatar && (
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 font-medium transition-all ${
                  showSettings
                    ? 'bg-slate-800 text-white border-slate-600'
                    : 'bg-transparent text-slate-300 border-slate-700 hover:border-slate-600'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>Ajustar opacidad y contraste</span>
              </button>
            )}
          </div>

          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="text-xs px-2.5 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg flex items-center gap-1.5 font-medium transition-all ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isAvatar ? 'Eliminar foto' : 'Quitar fondo'}</span>
            </button>
          )}
        </div>
      )}

      {/* Background controls accordion (Opacity, Blur, Scrim) */}
      {!isAvatar && currentValue && showSettings && (
        <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3.5 text-xs">
          {/* Opacity slider */}
          {onOpacityChange && (
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Opacidad del fondo</span>
                <span className="font-semibold text-sky-400">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>
          )}

          {/* Blur slider */}
          {onBlurChange && (
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Desenfoque (blur)</span>
                <span className="font-semibold text-sky-400">{blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={blur}
                onChange={(e) => onBlurChange(parseInt(e.target.value, 10))}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Un ligero desenfoque hace que los botones y enlaces resalten más.
              </p>
            </div>
          )}

          {/* Overlay contrast type */}
          {onOverlayChange && (
            <div>
              <label className="block text-slate-300 mb-1.5">Filtro de Contraste para Legibilidad</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['dark', 'gradient', 'light', 'none'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onOverlayChange(opt)}
                    className={`py-1.5 px-2 rounded-lg border text-center font-medium capitalize transition-all ${
                      overlay === opt
                        ? 'border-sky-500 bg-sky-500/20 text-white'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt === 'dark' ? 'Oscuro' : opt === 'gradient' ? 'Degradado' : opt === 'light' ? 'Claro' : 'Ninguno'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
