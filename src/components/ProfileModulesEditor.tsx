import React, { useState } from 'react';
import {
  Sparkles,
  Share2,
  Clock,
  MapPin,
  Building2,
  ShoppingBag,
  Star,
  UserCheck,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  Check,
  AlertCircle,
  HelpCircle,
  Eye,
  Sliders,
} from 'lucide-react';
import {
  ProfileModulesConfig,
  SocialIconsStrip,
  BusinessHoursModule,
  LocationModule,
  BankDetailsModule,
  CatalogModule,
  VisualBadgingStyle,
  TestimonialsModule,
  LeadCaptureModule,
  VideoEmbedModule,
  LinkItem,
} from '../types';
import { VideoEmbedSettings } from './VideoEmbedSettings';

interface ProfileModulesEditorProps {
  initialModules?: ProfileModulesConfig;
  links?: LinkItem[];
  onSave: (modules: ProfileModulesConfig) => Promise<void>;
  onChange?: (modules: ProfileModulesConfig) => void;
  isSaving?: boolean;
}

export function ProfileModulesEditor({
  initialModules,
  links = [],
  onSave,
  onChange,
  isSaving = false,
}: ProfileModulesEditorProps) {
  // Snapshot for 1-Click Rollback / Undo
  const [originalSnapshot, setOriginalSnapshot] = useState<ProfileModulesConfig | null>(initialModules || null);
  const [cachedStateBeforeTurnOff, setCachedStateBeforeTurnOff] = useState<ProfileModulesConfig | null>(null);

  // Local state for each module
  const [socialStrip, setSocialStrip] = useState<SocialIconsStrip>(
    initialModules?.socialStrip || { enabled: false }
  );

  const [businessHours, setBusinessHours] = useState<BusinessHoursModule>(
    initialModules?.businessHours || {
      enabled: false,
      scheduleText: 'Lunes a Viernes: 9:00 AM - 7:00 PM\nSábados: 10:00 AM - 2:00 PM',
      openHour: 9,
      closeHour: 19,
      openDays: [1, 2, 3, 4, 5],
    }
  );

  const [location, setLocation] = useState<LocationModule>(
    initialModules?.location || {
      enabled: false,
      addressTitle: 'Ubicación & Sucursal',
      addressText: '',
      googleMapsUrl: '',
      wazeUrl: '',
    }
  );

  const [bankDetails, setBankDetails] = useState<BankDetailsModule>(
    initialModules?.bankDetails || {
      enabled: false,
      bankName: '',
      accountHolder: '',
      clabeNumber: '',
      accountNumber: '',
      conceptNote: 'Favor de enviar comprobante por WhatsApp.',
    }
  );

  const [catalog, setCatalog] = useState<CatalogModule>(
    initialModules?.catalog || {
      enabled: false,
      sectionTitle: 'Servicios & Productos Destacados',
      items: [],
    }
  );

  const [visualStyle, setVisualStyle] = useState<VisualBadgingStyle>(
    initialModules?.visualStyle || {
      avatarShape: 'circle',
      verifiedBadge: false,
      verifiedBadgeColor: 'blue',
      spotlightLinkId: undefined,
    }
  );

  const [testimonials, setTestimonials] = useState<TestimonialsModule>(
    initialModules?.testimonials || {
      enabled: false,
      googleReviewsUrl: '',
      showGoogleButton: true,
      items: [],
    }
  );

  const [leadCapture, setLeadCapture] = useState<LeadCaptureModule>(
    initialModules?.leadCapture || {
      enabled: false,
      buttonLabel: 'Intercambiar Contacto / Dejar mis Datos',
      formTitle: 'Comparte tus datos de contacto',
      successMessage: '¡Contacto enviado con éxito!',
    }
  );

  const [videoEmbed, setVideoEmbed] = useState<VideoEmbedModule>(
    initialModules?.videoEmbed || {
      enabled: false,
      videoUrl: '',
      title: 'Transmisión en Vivo',
      isLive: false,
    }
  );

  // Sync if initialModules changes asynchronously
  React.useEffect(() => {
    if (initialModules) {
      if (initialModules.socialStrip) setSocialStrip(initialModules.socialStrip);
      if (initialModules.businessHours) setBusinessHours(initialModules.businessHours);
      if (initialModules.location) setLocation(initialModules.location);
      if (initialModules.bankDetails) setBankDetails(initialModules.bankDetails);
      if (initialModules.catalog) setCatalog(initialModules.catalog);
      if (initialModules.visualStyle) setVisualStyle(initialModules.visualStyle);
      if (initialModules.testimonials) setTestimonials(initialModules.testimonials);
      if (initialModules.leadCapture) setLeadCapture(initialModules.leadCapture);
      if (initialModules.videoEmbed) setVideoEmbed(initialModules.videoEmbed);
      setOriginalSnapshot(initialModules);
    }
  }, [initialModules]);

  // Notify parent of live changes for instant mobile preview
  React.useEffect(() => {
    if (onChange) {
      onChange({
        socialStrip,
        businessHours,
        location,
        bankDetails,
        catalog,
        visualStyle,
        testimonials,
        leadCapture,
        videoEmbed,
      });
    }
  }, [
    socialStrip,
    businessHours,
    location,
    bankDetails,
    catalog,
    visualStyle,
    testimonials,
    leadCapture,
    videoEmbed,
    onChange,
  ]);

  // Accordion open section states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    social: true,
    visual: false,
    hours: false,
    location: false,
    bank: false,
    catalog: false,
    reviews: false,
    leads: false,
    video: false,
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 1-Click Rollback: Deshacer cambios recientes y volver al último guardado
  const handleUndoToSaved = () => {
    if (originalSnapshot) {
      if (originalSnapshot.socialStrip) setSocialStrip(originalSnapshot.socialStrip);
      if (originalSnapshot.businessHours) setBusinessHours(originalSnapshot.businessHours);
      if (originalSnapshot.location) setLocation(originalSnapshot.location);
      if (originalSnapshot.bankDetails) setBankDetails(originalSnapshot.bankDetails);
      if (originalSnapshot.catalog) setCatalog(originalSnapshot.catalog);
      if (originalSnapshot.visualStyle) setVisualStyle(originalSnapshot.visualStyle);
      if (originalSnapshot.testimonials) setTestimonials(originalSnapshot.testimonials);
      if (originalSnapshot.leadCapture) setLeadCapture(originalSnapshot.leadCapture);
      if (originalSnapshot.videoEmbed) setVideoEmbed(originalSnapshot.videoEmbed);
    }
  };

  // 1-Click Master Revert: Turn off all modules (Classic Minimal Mode)
  const handleTurnOffAll = () => {
    // Cache current state so user can restore it if they change their mind
    setCachedStateBeforeTurnOff({
      socialStrip,
      businessHours,
      location,
      bankDetails,
      catalog,
      visualStyle,
      testimonials,
      leadCapture,
      videoEmbed,
    });
    setSocialStrip((prev) => ({ ...prev, enabled: false }));
    setBusinessHours((prev) => ({ ...prev, enabled: false }));
    setLocation((prev) => ({ ...prev, enabled: false }));
    setBankDetails((prev) => ({ ...prev, enabled: false }));
    setCatalog((prev) => ({ ...prev, enabled: false }));
    setVisualStyle((prev) => ({ ...prev, verifiedBadge: false, spotlightLinkId: undefined }));
    setTestimonials((prev) => ({ ...prev, enabled: false }));
    setLeadCapture((prev) => ({ ...prev, enabled: false }));
    setVideoEmbed((prev) => ({ ...prev, enabled: false }));
  };

  // 1-Click Restore: Re-enable previous modules
  const handleRestoreTurnedOff = () => {
    if (cachedStateBeforeTurnOff) {
      if (cachedStateBeforeTurnOff.socialStrip) setSocialStrip(cachedStateBeforeTurnOff.socialStrip);
      if (cachedStateBeforeTurnOff.businessHours) setBusinessHours(cachedStateBeforeTurnOff.businessHours);
      if (cachedStateBeforeTurnOff.location) setLocation(cachedStateBeforeTurnOff.location);
      if (cachedStateBeforeTurnOff.bankDetails) setBankDetails(cachedStateBeforeTurnOff.bankDetails);
      if (cachedStateBeforeTurnOff.catalog) setCatalog(cachedStateBeforeTurnOff.catalog);
      if (cachedStateBeforeTurnOff.visualStyle) setVisualStyle(cachedStateBeforeTurnOff.visualStyle);
      if (cachedStateBeforeTurnOff.testimonials) setTestimonials(cachedStateBeforeTurnOff.testimonials);
      if (cachedStateBeforeTurnOff.leadCapture) setLeadCapture(cachedStateBeforeTurnOff.leadCapture);
      if (cachedStateBeforeTurnOff.videoEmbed) setVideoEmbed(cachedStateBeforeTurnOff.videoEmbed);
      setCachedStateBeforeTurnOff(null);
    }
  };

  const activeModulesCount = [
    socialStrip.enabled,
    businessHours.enabled,
    location.enabled,
    bankDetails.enabled,
    catalog.enabled,
    visualStyle.verifiedBadge || visualStyle.spotlightLinkId,
    testimonials.enabled,
    leadCapture.enabled,
    videoEmbed.enabled,
  ].filter(Boolean).length;

  const handleSaveAll = async () => {
    const fullConfig: ProfileModulesConfig = {
      socialStrip,
      businessHours,
      location,
      bankDetails,
      catalog,
      visualStyle,
      testimonials,
      leadCapture,
      videoEmbed,
    };

    await onSave(fullConfig);
    setOriginalSnapshot(fullConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Add Item to Catalog
  const handleAddCatalogItem = () => {
    setCatalog((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `prod_${Date.now()}`,
          title: 'Nuevo Servicio / Producto',
          price: '$0.00',
          description: '',
          imageUrl: '',
        },
      ],
    }));
  };

  const handleRemoveCatalogItem = (id: string) => {
    setCatalog((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  // Add Item to Testimonials
  const handleAddTestimonial = () => {
    setTestimonials((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `test_${Date.now()}`,
          authorName: 'Nombre del Cliente',
          rating: 5,
          text: 'Excelente atención y servicio profesional.',
          roleOrDate: 'Cliente Verificado',
        },
      ],
    }));
  };

  const handleRemoveTestimonial = (id: string) => {
    setTestimonials((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner with Quick Actions, Undo and Rollback */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm sm:text-base font-bold text-white">
                Herramientas y Módulos de Perfil (Opciones 1, 3, 4, 5 y 6)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {activeModulesCount} activo{activeModulesCount !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Activa, personaliza o apaga cada opción en cualquier momento. Si algo no te gusta, puedes deshacer o revertir todo con un solo clic.
            </p>
          </div>

          {/* Action and Rollback Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Revert / Undo to last saved version */}
            <button
              type="button"
              onClick={handleUndoToSaved}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-amber-500/10 text-slate-400 hover:text-amber-300 text-xs font-semibold transition-all shadow-xs"
              title="Deshacer cambios recientes y volver a la última versión guardada"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Deshacer Cambios (Regresar)</span>
            </button>

            {/* Turn Off All button (Classic Minimal Mode) */}
            <button
              type="button"
              onClick={handleTurnOffAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/50 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 text-xs font-semibold transition-all shadow-xs"
              title="Desactiva todos los módulos para volver al estilo minimalista clásico sin perder tus textos"
            >
              <span>Volver a Modo Clásico (Apagar Todo)</span>
            </button>

            {/* Restore turned off modules */}
            {cachedStateBeforeTurnOff && (
              <button
                type="button"
                onClick={handleRestoreTurnedOff}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-950/60 border border-sky-600/50 hover:bg-sky-900/60 text-sky-300 text-xs font-bold transition-all shadow-xs animate-pulse"
                title="Reactivar los módulos que tenías antes de apagar todo"
              >
                <span>Reactivar Módulos Anteriores</span>
              </button>
            )}
          </div>
        </div>

        {/* Informative reversibility badge */}
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300 flex items-center gap-2">
          <span className="text-amber-400 font-bold">💡 100% Reversible:</span>
          <span>
            Edita libremente. En cualquier momento puedes apagar un módulo individual con su interruptor o usar el botón <strong>"Deshacer Cambios"</strong> para regresar sin afectar tu tarjeta original.
          </span>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>¡Módulos guardados y actualizados en tiempo real en tu tarjeta digital!</span>
        </div>
      )}

      {/* Accordion List of Modules */}
      <div className="space-y-4">
        {/* =================================================================== */}
        {/* 1. REDES SOCIALES COMPACTAS (SOCIAL STRIP)                          */}
        {/* =================================================================== */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden">
          <div className="p-4 flex items-center justify-between gap-3 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="social-strip-toggle"
                checked={socialStrip.enabled}
                onChange={(e) => setSocialStrip({ ...socialStrip, enabled: e.target.checked })}
                className="w-4 h-4 text-sky-500 rounded bg-slate-950 border-slate-700 cursor-pointer"
              />
              <label htmlFor="social-strip-toggle" className="cursor-pointer">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 font-extrabold text-[10px]">OPCIÓN 1</span>
                  <span>1. Fila de Redes Sociales Rápidas (Iconos Flotantes)</span>
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Iconos circulares oficiales directamente debajo de tu biografía (WhatsApp, Instagram, TikTok, etc.)
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => toggleSection('social')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
            >
              {openSections.social ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {openSections.social && (
            <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-900/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    WhatsApp (Número con lada o enlace)
                  </label>
                  <input
                    type="text"
                    value={socialStrip.whatsapp || ''}
                    onChange={(e) => setSocialStrip({ ...socialStrip, whatsapp: e.target.value })}
                    placeholder="+52 33 1234 5678"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Instagram (@usuario o link)
                  </label>
                  <input
                    type="text"
                    value={socialStrip.instagram || ''}
                    onChange={(e) => setSocialStrip({ ...socialStrip, instagram: e.target.value })}
                    placeholder="@tu_usuario"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    TikTok (@usuario o link)
                  </label>
                  <input
                    type="text"
                    value={socialStrip.tiktok || ''}
                    onChange={(e) => setSocialStrip({ ...socialStrip, tiktok: e.target.value })}
                    placeholder="@tu_tiktok"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    LinkedIn (usuario o link)
                  </label>
                  <input
                    type="text"
                    value={socialStrip.linkedin || ''}
                    onChange={(e) => setSocialStrip({ ...socialStrip, linkedin: e.target.value })}
                    placeholder="linkedin.com/in/tu-perfil"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Facebook (usuario o link)
                  </label>
                  <input
                    type="text"
                    value={socialStrip.facebook || ''}
                    onChange={(e) => setSocialStrip({ ...socialStrip, facebook: e.target.value })}
                    placeholder="facebook.com/tu-pagina"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    X (Twitter @usuario o link)
                  </label>
                  <input
                    type="text"
                    value={socialStrip.twitter || ''}
                    onChange={(e) => setSocialStrip({ ...socialStrip, twitter: e.target.value })}
                    placeholder="@tu_cuenta"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    YouTube (@canal o link)
                  </label>
                  <input
                    type="text"
                    value={socialStrip.youtube || ''}
                    onChange={(e) => setSocialStrip({ ...socialStrip, youtube: e.target.value })}
                    placeholder="youtube.com/@tu_canal"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Telegram (@usuario o link)
                  </label>
                  <input
                    type="text"
                    value={socialStrip.telegram || ''}
                    onChange={(e) => setSocialStrip({ ...socialStrip, telegram: e.target.value })}
                    placeholder="t.me/tu_usuario"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* 2. ESTILOS VISUALES & INSIGNIA VERIFICADA                           */}
        {/* =================================================================== */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden">
          <div className="p-4 flex items-center justify-between gap-3 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 text-sky-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <span className="text-sm font-bold text-white block">
                  2. Insignia Verificada y Enlace Destacado (Spotlight)
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Agrega palomita de verificación oficial y efecto de pulso a tu enlace estrella
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleSection('visual')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
            >
              {openSections.visual ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {openSections.visual && (
            <div className="p-4 border-t border-slate-800/80 space-y-4 bg-slate-900/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Insignia Verificada */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-sky-400" /> Insignia Verificada
                    </span>
                    <input
                      type="checkbox"
                      checked={visualStyle.verifiedBadge ?? false}
                      onChange={(e) => setVisualStyle({ ...visualStyle, verifiedBadge: e.target.checked })}
                      className="w-4 h-4 text-sky-500 rounded bg-slate-900 border-slate-700"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Muestra un distintivo de autenticidad junto a tu nombre en la tarjeta digital.
                  </p>

                  {visualStyle.verifiedBadge && (
                    <div className="pt-2 flex items-center gap-2">
                      <label className="text-[11px] text-slate-300 font-semibold">Color:</label>
                      {(['blue', 'gold', 'emerald'] as const).map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setVisualStyle({ ...visualStyle, verifiedBadgeColor: color })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize border transition-all ${
                            visualStyle.verifiedBadgeColor === color
                              ? 'bg-slate-800 border-sky-400 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {color === 'blue' ? 'Azul Oficial' : color === 'gold' ? 'Oro Royale' : 'Esmeralda'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Enlace Destacado / Spotlight */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Enlace Estrella con Pulso
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Elige un enlace para que tenga un destello animado que atraiga más clics.
                  </p>

                  <select
                    value={visualStyle.spotlightLinkId || ''}
                    onChange={(e) => setVisualStyle({ ...visualStyle, spotlightLinkId: e.target.value || undefined })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                  >
                    <option value="">(Ninguno - Sin enlace destacado)</option>
                    {links.map((link) => (
                      <option key={link.id} value={link.id}>
                        {link.title} ({link.url})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* 3. HORARIO DE ATENCIÓN EN VIVO                                      */}
        {/* =================================================================== */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden">
          <div className="p-4 flex items-center justify-between gap-3 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="hours-toggle"
                checked={businessHours.enabled}
                onChange={(e) => setBusinessHours({ ...businessHours, enabled: e.target.checked })}
                className="w-4 h-4 text-sky-500 rounded bg-slate-950 border-slate-700 cursor-pointer"
              />
              <label htmlFor="hours-toggle" className="cursor-pointer">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-extrabold text-[10px]">OPCIÓN 3</span>
                  <span>3. Horario de Atención en Vivo (Abierto / Cerrado)</span>
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Muestra si estás "Abierto Ahora" o "Cerrado" automáticamente con tus horas de atención
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => toggleSection('hours')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
            >
              {openSections.hours ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {openSections.hours && (
            <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-900/30">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Texto del Horario
                </label>
                <textarea
                  rows={2}
                  value={businessHours.scheduleText || ''}
                  onChange={(e) => setBusinessHours({ ...businessHours, scheduleText: e.target.value })}
                  placeholder="Lunes a Viernes: 9:00 AM - 7:00 PM&#10;Sábados: 10:00 AM - 2:00 PM"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Hora de Apertura (0 a 23 hrs)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={businessHours.openHour ?? 9}
                    onChange={(e) => setBusinessHours({ ...businessHours, openHour: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Hora de Cierre (0 a 23 hrs)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={businessHours.closeHour ?? 19}
                    onChange={(e) => setBusinessHours({ ...businessHours, closeHour: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* 4. UBICACIÓN & GPS (GOOGLE MAPS / WAZE)                             */}
        {/* =================================================================== */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden">
          <div className="p-4 flex items-center justify-between gap-3 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="location-toggle"
                checked={location.enabled}
                onChange={(e) => setLocation({ ...location, enabled: e.target.checked })}
                className="w-4 h-4 text-sky-500 rounded bg-slate-950 border-slate-700 cursor-pointer"
              />
              <label htmlFor="location-toggle" className="cursor-pointer">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px]">OPCIÓN 4</span>
                  <span>4. Ubicación Física & GPS (Google Maps / Waze)</span>
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Permite a tus clientes abrir la ruta hacia tu local u oficina en un solo toque
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => toggleSection('location')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
            >
              {openSections.location ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {openSections.location && (
            <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-900/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Título de la Sede / Sucursal
                  </label>
                  <input
                    type="text"
                    value={location.addressTitle || ''}
                    onChange={(e) => setLocation({ ...location, addressTitle: e.target.value })}
                    placeholder="Ej. Matriz Corporativa / Consultorio 402"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Dirección Completa
                  </label>
                  <input
                    type="text"
                    value={location.addressText || ''}
                    onChange={(e) => setLocation({ ...location, addressText: e.target.value })}
                    placeholder="Av. Principal 123, Col. Centro, Ciudad"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Enlace de Google Maps (opcional)
                  </label>
                  <input
                    type="url"
                    value={location.googleMapsUrl || ''}
                    onChange={(e) => setLocation({ ...location, googleMapsUrl: e.target.value })}
                    placeholder="https://maps.app.goo.gl/..."
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Enlace de Waze (opcional)
                  </label>
                  <input
                    type="url"
                    value={location.wazeUrl || ''}
                    onChange={(e) => setLocation({ ...location, wazeUrl: e.target.value })}
                    placeholder="https://waze.com/ul/..."
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* 5. DATOS BANCARIOS PARA TRANSFERENCIA                                */}
        {/* =================================================================== */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden">
          <div className="p-4 flex items-center justify-between gap-3 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="bank-toggle"
                checked={bankDetails.enabled}
                onChange={(e) => setBankDetails({ ...bankDetails, enabled: e.target.checked })}
                className="w-4 h-4 text-sky-500 rounded bg-slate-950 border-slate-700 cursor-pointer"
              />
              <label htmlFor="bank-toggle" className="cursor-pointer">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-extrabold text-[10px]">OPCIÓN 5</span>
                  <span>5. Datos Bancarios & Transferencias CLABE</span>
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Muestra tu CLABE o cuenta bancaria con un botón para copiarla en 1 clic
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => toggleSection('bank')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
            >
              {openSections.bank ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {openSections.bank && (
            <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-900/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Institución Bancaria
                  </label>
                  <input
                    type="text"
                    value={bankDetails.bankName || ''}
                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                    placeholder="BBVA / Santander / Banorte / STP"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Nombre del Titular
                  </label>
                  <input
                    type="text"
                    value={bankDetails.accountHolder || ''}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                    placeholder="Tu Nombre o Razón Social"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    CLABE Interbancaria (18 dígitos)
                  </label>
                  <input
                    type="text"
                    value={bankDetails.clabeNumber || ''}
                    onChange={(e) => setBankDetails({ ...bankDetails, clabeNumber: e.target.value })}
                    placeholder="012345678901234567"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Número de Cuenta / Tarjeta (alternativo)
                  </label>
                  <input
                    type="text"
                    value={bankDetails.accountNumber || ''}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    placeholder="4152 3138 ...."
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Nota o Concepto para el Pago
                </label>
                <input
                  type="text"
                  value={bankDetails.conceptNote || ''}
                  onChange={(e) => setBankDetails({ ...bankDetails, conceptNote: e.target.value })}
                  placeholder="Favor de enviar el comprobante de pago por WhatsApp."
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* 6. CATÁLOGO DE SERVICIOS / PRODUCTOS                                */}
        {/* =================================================================== */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden">
          <div className="p-4 flex items-center justify-between gap-3 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="catalog-toggle"
                checked={catalog.enabled}
                onChange={(e) => setCatalog({ ...catalog, enabled: e.target.checked })}
                className="w-4 h-4 text-sky-500 rounded bg-slate-950 border-slate-700 cursor-pointer"
              />
              <label htmlFor="catalog-toggle" className="cursor-pointer">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-extrabold text-[10px]">OPCIÓN 6</span>
                  <span>6. Catálogo de Servicios o Productos Destacados</span>
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Muestra paquetes o platillos con precio y botón de pedido directo por WhatsApp
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => toggleSection('catalog')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
            >
              {openSections.catalog ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {openSections.catalog && (
            <div className="p-4 border-t border-slate-800/80 space-y-4 bg-slate-900/30">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Título de la Sección
                </label>
                <input
                  type="text"
                  value={catalog.sectionTitle || ''}
                  onChange={(e) => setCatalog({ ...catalog, sectionTitle: e.target.value })}
                  placeholder="Nuestros Servicios / Productos Destacados"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {catalog.items.map((item, idx) => (
                  <div key={item.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-200">
                        Item #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCatalogItem(item.id)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...catalog.items];
                          updated[idx].title = e.target.value;
                          setCatalog({ ...catalog, items: updated });
                        }}
                        placeholder="Título del Servicio o Producto"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />

                      <input
                        type="text"
                        value={item.price || ''}
                        onChange={(e) => {
                          const updated = [...catalog.items];
                          updated[idx].price = e.target.value;
                          setCatalog({ ...catalog, items: updated });
                        }}
                        placeholder="Precio (ej. $500 MXN o Desde $1,200)"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>

                    <textarea
                      rows={2}
                      value={item.description || ''}
                      onChange={(e) => {
                        const updated = [...catalog.items];
                        updated[idx].description = e.target.value;
                        setCatalog({ ...catalog, items: updated });
                      }}
                      placeholder="Descripción corta de lo que incluye..."
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddCatalogItem}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-700 hover:border-sky-500 text-sky-400 hover:text-sky-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Servicio o Producto al Catálogo</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* 7. RESEÑAS & GOOGLE MAPS REVIEWS                                    */}
        {/* =================================================================== */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden">
          <div className="p-4 flex items-center justify-between gap-3 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="reviews-toggle"
                checked={testimonials.enabled}
                onChange={(e) => setTestimonials({ ...testimonials, enabled: e.target.checked })}
                className="w-4 h-4 text-sky-500 rounded bg-slate-950 border-slate-700 cursor-pointer"
              />
              <label htmlFor="reviews-toggle" className="cursor-pointer">
                <span className="text-sm font-bold text-white block">
                  7. Reseñas & Botón de Google Maps Reviews
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Muestra testimonios y consigue opiniones de 5 estrellas en tu perfil de Google
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => toggleSection('reviews')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
            >
              {openSections.reviews ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {openSections.reviews && (
            <div className="p-4 border-t border-slate-800/80 space-y-4 bg-slate-900/30">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Enlace directo a tus Reseñas de Google (Google Reviews)
                </label>
                <input
                  type="url"
                  value={testimonials.googleReviewsUrl || ''}
                  onChange={(e) => setTestimonials({ ...testimonials, googleReviewsUrl: e.target.value })}
                  placeholder="https://g.page/r/.../review"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Testimonials List */}
              <div className="space-y-3">
                {testimonials.items.map((test, idx) => (
                  <div key={test.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={test.authorName}
                        onChange={(e) => {
                          const updated = [...testimonials.items];
                          updated[idx].authorName = e.target.value;
                          setTestimonials({ ...testimonials, items: updated });
                        }}
                        placeholder="Nombre del Cliente"
                        className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-bold"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveTestimonial(test.id)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={test.text}
                      onChange={(e) => {
                        const updated = [...testimonials.items];
                        updated[idx].text = e.target.value;
                        setTestimonials({ ...testimonials, items: updated });
                      }}
                      placeholder="Opinión o testimonio del cliente..."
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddTestimonial}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-700 hover:border-amber-500 text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Opinión de Cliente</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* 8. CAPTURA DE CONTACTOS ("INTERCAMBIAR CONTACTO")                   */}
        {/* =================================================================== */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden">
          <div className="p-4 flex items-center justify-between gap-3 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="leads-toggle"
                checked={leadCapture.enabled}
                onChange={(e) => setLeadCapture({ ...leadCapture, enabled: e.target.checked })}
                className="w-4 h-4 text-sky-500 rounded bg-slate-950 border-slate-700 cursor-pointer"
              />
              <label htmlFor="leads-toggle" className="cursor-pointer">
                <span className="text-sm font-bold text-white block">
                  8. Captura de Prospectos ("Intercambiar Contacto")
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Permite a la persona que escaneó tu tarjeta dejarte su nombre y teléfono en 5 segundos
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => toggleSection('leads')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
            >
              {openSections.leads ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {openSections.leads && (
            <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-900/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Texto del Botón en la Tarjeta
                  </label>
                  <input
                    type="text"
                    value={leadCapture.buttonLabel || ''}
                    onChange={(e) => setLeadCapture({ ...leadCapture, buttonLabel: e.target.value })}
                    placeholder="Intercambiar Contacto / Dejar mis Datos"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Título del Formulario
                  </label>
                  <input
                    type="text"
                    value={leadCapture.formTitle || ''}
                    onChange={(e) => setLeadCapture({ ...leadCapture, formTitle: e.target.value })}
                    placeholder="Comparte tus datos de contacto"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 9. Video o Transmisión en Vivo al final de la tarjeta */}
        <VideoEmbedSettings
          config={videoEmbed}
          onChange={setVideoEmbed}
        />
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="w-full py-4 px-6 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50"
        >
          {isSaving ? (
            <span>Guardando módulos...</span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Guardar Configuración de Módulos</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
