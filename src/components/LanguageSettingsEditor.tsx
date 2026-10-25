import React, { useState, useEffect } from 'react';
import {
  Languages,
  Check,
  Globe,
  Sparkles,
  BookOpen,
  FolderTree,
  Wand2,
  RefreshCw,
  Eye,
  Info,
} from 'lucide-react';
import { ProfileLanguageConfig, SupportedLanguage } from '../types';
import {
  SUPPORTED_LANGUAGES,
  SECTION_TRANSLATIONS,
  autoTranslateBio,
  translateSectionName,
} from '../utils/i18n';

interface LanguageSettingsEditorProps {
  languageConfig?: ProfileLanguageConfig;
  onSaveLanguage: (config: ProfileLanguageConfig) => Promise<void> | void;
  accentColor?: string;
  isSaving?: boolean;
  currentBio?: string;
  sectionNames?: string[];
}

export function LanguageSettingsEditor({
  languageConfig,
  onSaveLanguage,
  accentColor = '#0284c7',
  isSaving = false,
  currentBio = '',
  sectionNames = [],
}: LanguageSettingsEditorProps) {
  const [defaultLang, setDefaultLang] = useState<SupportedLanguage>(
    languageConfig?.defaultLanguage || 'es'
  );
  const [mode, setMode] = useState<'fixed' | 'switcher'>(
    languageConfig?.mode || 'fixed'
  );
  const [availableLangs, setAvailableLangs] = useState<SupportedLanguage[]>(
    languageConfig?.availableLanguages && languageConfig.availableLanguages.length > 0
      ? languageConfig.availableLanguages
      : ['es', 'en']
  );

  // Multilingual Biography translations: { en: '...', pt: '...', fr: '...' }
  const [bioTranslations, setBioTranslations] = useState<Partial<Record<SupportedLanguage, string>>>(
    languageConfig?.bioTranslations || {}
  );

  // Multilingual Section/Group translations: { 'Contacto': { en: 'Contact', pt: 'Contato' }, ... }
  const [sectionTranslations, setSectionTranslations] = useState<
    Record<string, Partial<Record<SupportedLanguage, string>>>
  >(languageConfig?.sectionTranslations || {});

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [previewLang, setPreviewLang] = useState<SupportedLanguage>(defaultLang);

  // Keep state synced if props change
  useEffect(() => {
    if (languageConfig?.defaultLanguage) setDefaultLang(languageConfig.defaultLanguage);
    if (languageConfig?.mode) setMode(languageConfig.mode);
    if (languageConfig?.availableLanguages && languageConfig.availableLanguages.length > 0) {
      setAvailableLangs(languageConfig.availableLanguages);
    }
    if (languageConfig?.bioTranslations) {
      setBioTranslations(languageConfig.bioTranslations);
    }
    if (languageConfig?.sectionTranslations) {
      setSectionTranslations(languageConfig.sectionTranslations);
    }
  }, [languageConfig]);

  const handleToggleAvailableLang = (code: SupportedLanguage) => {
    if (code === defaultLang) return; // Cannot disable default language
    if (availableLangs.includes(code)) {
      if (availableLangs.length <= 1) return;
      setAvailableLangs(availableLangs.filter((l) => l !== code));
    } else {
      setAvailableLangs([...availableLangs, code]);
    }
  };

  const handleDefaultLangChange = (code: SupportedLanguage) => {
    setDefaultLang(code);
    setPreviewLang(code);
    if (!availableLangs.includes(code)) {
      setAvailableLangs([...availableLangs, code]);
    }
  };

  const handleBioChange = (lang: SupportedLanguage, text: string) => {
    setBioTranslations((prev) => ({
      ...prev,
      [lang]: text,
    }));
  };

  const handleAutoTranslateBio = (targetLang: SupportedLanguage) => {
    const baseText = currentBio.trim() || bioTranslations[defaultLang] || '';
    if (!baseText) return;
    const translated = autoTranslateBio(baseText, targetLang);
    handleBioChange(targetLang, translated);
  };

  const handleSectionChange = (groupName: string, lang: SupportedLanguage, text: string) => {
    setSectionTranslations((prev) => ({
      ...prev,
      [groupName]: {
        ...(prev[groupName] || {}),
        [lang]: text,
      },
    }));
  };

  const handleAutoTranslateSection = (groupName: string, targetLang: SupportedLanguage) => {
    const suggested = translateSectionName(groupName, targetLang);
    handleSectionChange(groupName, targetLang, suggested);
  };

  const handleSave = async () => {
    const config: ProfileLanguageConfig = {
      defaultLanguage: defaultLang,
      mode,
      availableLanguages: availableLangs.includes(defaultLang)
        ? availableLangs
        : [defaultLang, ...availableLangs],
      bioTranslations,
      sectionTranslations,
    };

    await onSaveLanguage(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Distinct section names to translate (from prop, plus any pre-existing custom keys)
  const allSectionKeys = Array.from(
    new Set([...sectionNames, ...Object.keys(sectionTranslations)])
  ).filter((s) => s && s.trim().length > 0);

  // Other languages enabled besides the default
  const secondaryLangs = SUPPORTED_LANGUAGES.filter(
    (l) => availableLangs.includes(l.code) && l.code !== defaultLang
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-7 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sky-400 shrink-0">
            <Languages className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>Configuración de Idioma y Traducciones</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Completo
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Personaliza el idioma, traduce tu biografía y tus secciones de enlaces con 1 clic.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Modalidad: ¿Idioma Fijo o Selector con un clic? */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          1. Modalidad del Idioma en la Tarjeta
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Opción 1: Idioma Fijo */}
          <button
            type="button"
            onClick={() => setMode('fixed')}
            className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
              mode === 'fixed'
                ? 'bg-sky-500/10 border-sky-500 text-white shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/50'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                Solo 1 Idioma Fijo
              </span>
              {mode === 'fixed' && <Check className="w-4 h-4 text-sky-400" />}
            </div>
            <h4 className="font-bold text-sm text-white mb-1">Únicamente en un idioma</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              La tarjeta se muestra estrictamente en el idioma elegido. Sin botones ni selectores adicionales para los visitantes.
            </p>
          </button>

          {/* Opción 2: Selector interactivo en la esquina superior izquierda */}
          <button
            type="button"
            onClick={() => setMode('switcher')}
            className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
              mode === 'switcher'
                ? 'bg-sky-500/10 border-sky-500 text-white shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/50'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Recomendado</span>
              </span>
              {mode === 'switcher' && <Check className="w-4 h-4 text-sky-400" />}
            </div>
            <h4 className="font-bold text-sm text-white mb-1">Selector con 1 clic (Esquina superior)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Muestra un botón en la esquina superior izquierda de la tarjeta (`[ 🌐 ES ⇄ EN ]`) para alternar idioma al instante.
            </p>
          </button>
        </div>
      </div>

      {/* 2. Selección del Idioma Principal / Predeterminado */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          2. Idioma Principal / Predeterminado
        </label>
        <p className="text-xs text-slate-400 -mt-1 mb-2">
          Es el idioma con el que se abrirá la tarjeta al cargar.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = defaultLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleDefaultLangChange(lang.code)}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500/15 border-sky-400 text-white font-bold ring-1 ring-sky-400/40 shadow-sm'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="text-xs">{lang.name}</span>
                <span className="text-[10px] font-mono opacity-60">({lang.shortLabel})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Selección de idiomas activos para el selector */}
      {mode === 'switcher' && (
        <div className="space-y-3 bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4 text-sky-400" />
            <h4 className="text-sm font-bold text-white">
              3. Idiomas activos en el selector de la esquina
            </h4>
          </div>
          <p className="text-xs text-slate-400">
            Marca los idiomas entre los que el visitante podrá rotar con 1 clic:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isEnabled = availableLangs.includes(lang.code);

              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleToggleAvailableLang(lang.code)}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all ${
                    isEnabled
                      ? 'bg-slate-850 border-sky-500/50 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                      isEnabled ? 'bg-sky-500 text-white' : 'bg-slate-800 text-transparent'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Botón esquina preview */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              Botón en esquina superior izquierda:
            </span>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-bold text-white shadow-xs">
              <Languages className="w-3.5 h-3.5 text-sky-400" />
              <span className="uppercase text-sky-300 font-mono">
                {SUPPORTED_LANGUAGES.find((l) => l.code === defaultLang)?.shortLabel || 'ES'}
              </span>
              <span className="text-slate-500 text-[11px]">⇄</span>
              <span className="uppercase text-slate-400 font-mono">
                {SUPPORTED_LANGUAGES.find(
                  (l) => l.code === (availableLangs.find((a) => a !== defaultLang) || 'en')
                )?.shortLabel || 'EN'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. TRADUCCIÓN DE LA BIOGRAFÍA */}
      <div className="space-y-4 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Traducción de la Biografía
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            Cambia según el idioma seleccionado por el cliente
          </span>
        </div>

        {/* Biografía Original */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
            <span>{SUPPORTED_LANGUAGES.find((l) => l.code === defaultLang)?.flag}</span>
            <span>Biografía Original ({SUPPORTED_LANGUAGES.find((l) => l.code === defaultLang)?.name}):</span>
          </span>
          <p className="text-xs text-slate-200 italic">
            {currentBio || 'No has redactado una biografía todavía en tus datos básicos.'}
          </p>
        </div>

        {/* Campos de traducción para cada idioma secundario */}
        <div className="space-y-3.5">
          {SUPPORTED_LANGUAGES.filter((l) => l.code !== defaultLang).map((lang) => {
            const isTargetActive = availableLangs.includes(lang.code);
            const currentVal = bioTranslations[lang.code] || '';

            return (
              <div
                key={lang.code}
                className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                  isTargetActive
                    ? 'bg-slate-950/80 border-slate-800'
                    : 'bg-slate-950/30 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-xs font-bold text-white">
                      Biografía en {lang.name} ({lang.shortLabel})
                    </span>
                    {isTargetActive && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-sky-500/20 text-sky-300 font-semibold">
                        Activo en selector
                      </span>
                    )}
                  </div>

                  {currentBio && (
                    <button
                      type="button"
                      onClick={() => handleAutoTranslateBio(lang.code)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all cursor-pointer"
                      title="Generar traducción inteligente automáticamente"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>✨ Sugerir traducción automática</span>
                    </button>
                  )}
                </div>

                <textarea
                  rows={2}
                  value={currentVal}
                  onChange={(e) => handleBioChange(lang.code, e.target.value)}
                  placeholder={`Ej. Escribe aquí la versión en ${lang.name} de tu biografía...`}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 leading-relaxed resize-y"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. TRADUCCIÓN DE SECCIONES Y GRUPOS DE ENLACES */}
      <div className="space-y-4 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-sky-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Traducción de Secciones y Grupos de Enlaces
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            Títulos separadores (ej. Contacto, Redes Sociales, Menú, etc.)
          </span>
        </div>

        {allSectionKeys.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-400">
            No tienes grupos o secciones creados en tus enlaces aún. Al asignarle un grupo a tus enlaces (ej. "Contacto" o "Servicios"), aparecerán aquí para personalizar su traducción.
          </div>
        ) : (
          <div className="space-y-3">
            {allSectionKeys.map((sectionName) => (
              <div
                key={sectionName}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                  <span className="text-xs font-bold text-sky-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span>Sección: <strong>"{sectionName}"</strong></span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Traducciones por idioma
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SUPPORTED_LANGUAGES.filter((l) => l.code !== defaultLang).map((lang) => {
                    const currentTrans =
                      sectionTranslations[sectionName]?.[lang.code] || '';
                    const suggestedTrans = translateSectionName(sectionName, lang.code);

                    return (
                      <div key={lang.code} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </label>
                          {!currentTrans && suggestedTrans !== sectionName && (
                            <button
                              type="button"
                              onClick={() => handleAutoTranslateSection(sectionName, lang.code)}
                              className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                              title="Usar traducción sugerida"
                            >
                              <span>Sugerir: "{suggestedTrans}"</span>
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          value={currentTrans}
                          onChange={(e) =>
                            handleSectionChange(sectionName, lang.code, e.target.value)
                          }
                          placeholder={suggestedTrans}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-sky-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Simulador / Previsualización interactiva rápida */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/20 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-sky-400" />
            <span>Previsualización rápida de textos traducidos:</span>
          </span>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {SUPPORTED_LANGUAGES.filter((l) => availableLangs.includes(l.code)).map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setPreviewLang(l.code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  previewLang === l.code
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {l.flag} {l.shortLabel}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
              Biografía en idioma ({previewLang.toUpperCase()}):
            </span>
            <p className="text-slate-200 italic">
              {previewLang === defaultLang
                ? currentBio || 'Sin biografía'
                : bioTranslations[previewLang] || currentBio || 'Sin traducción configurada (se mostrará la original)'}
            </p>
          </div>

          {allSectionKeys.length > 0 && (
            <div className="pt-1 border-t border-slate-800/80">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                Títulos de Secciones en ({previewLang.toUpperCase()}):
              </span>
              <div className="flex flex-wrap gap-2">
                {allSectionKeys.map((sec) => {
                  const translated = translateSectionName(sec, previewLang, sectionTranslations);
                  return (
                    <span
                      key={sec}
                      className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-sky-300 font-bold text-[11px] border border-slate-700/60"
                    >
                      {translated}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botón Guardar */}
      <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: accentColor }}
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>¡Traducciones Guardadas con Éxito!</span>
            </>
          ) : (
            <>
              <Languages className="w-4 h-4" />
              <span>Guardar Configuración y Traducciones</span>
            </>
          )}
        </button>

        {savedSuccess && (
          <span className="text-xs font-semibold text-emerald-400 animate-fade-in flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>Biografía y secciones actualizadas para la tarjeta digital.</span>
          </span>
        )}
      </div>
    </div>
  );
}
