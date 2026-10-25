import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Building2,
  Copy,
  Check,
  Star,
  ExternalLink,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  UserCheck,
  ChevronRight,
  Send,
  Navigation,
} from 'lucide-react';
import {
  ProfileModulesConfig,
  ThemePreferences,
  SocialIconsStrip,
  BusinessHoursModule,
  LocationModule,
  BankDetailsModule,
  CatalogModule,
  TestimonialsModule,
  LeadCaptureModule,
} from '../types';
import {
  WhatsAppIcon,
  InstagramIcon,
  TikTokIcon,
  LinkedInIcon,
  FacebookIcon,
  TwitterXIcon,
  YouTubeIcon,
  SpotifyIcon,
  TelegramIcon,
  GoogleIcon,
} from './BrandIcons';
import { SupportedLanguage } from '../types';
import { t } from '../utils/i18n';
import { formatExternalUrl } from '../utils/urlHelper';

interface ProfileModulesViewProps {
  modules?: ProfileModulesConfig;
  theme: ThemePreferences;
  lang?: SupportedLanguage;
  onOpenLeadCapture?: () => void;
  onLinkClick?: (e: React.MouseEvent<HTMLAnchorElement>, url: string) => void;
}

export function ProfileModulesView({
  modules,
  theme,
  lang = 'es',
  onOpenLeadCapture,
  onLinkClick,
}: ProfileModulesViewProps) {
  if (!modules) return null;

  return (
    <div className="w-full space-y-4 my-4">
      {/* 1. Compact Social Icons Strip */}
      {modules.socialStrip?.enabled && (
        <SocialStripView
          strip={modules.socialStrip}
          theme={theme}
          onLinkClick={onLinkClick}
        />
      )}

      {/* 2. Lead Capture Call-To-Action ("Intercambiar Contacto") */}
      {modules.leadCapture?.enabled && onOpenLeadCapture && (
        <LeadCaptureCta
          leadModule={modules.leadCapture}
          theme={theme}
          lang={lang}
          onOpen={onOpenLeadCapture}
        />
      )}

      {/* 3. Business Hours Module */}
      {modules.businessHours?.enabled && (
        <BusinessHoursView
          hours={modules.businessHours}
          theme={theme}
          lang={lang}
        />
      )}

      {/* 4. Location & GPS Module */}
      {modules.location?.enabled && (
        <LocationView
          loc={modules.location}
          theme={theme}
          lang={lang}
          onLinkClick={onLinkClick}
        />
      )}

      {/* 5. Bank Details / Transfer Info */}
      {modules.bankDetails?.enabled && (
        <BankDetailsView
          bank={modules.bankDetails}
          theme={theme}
          lang={lang}
        />
      )}

      {/* 6. Catalog / Services Highlight */}
      {modules.catalog?.enabled && modules.catalog.items?.length > 0 && (
        <CatalogView
          catalog={modules.catalog}
          theme={theme}
          lang={lang}
          whatsappNumber={modules.socialStrip?.whatsapp}
          onLinkClick={onLinkClick}
        />
      )}

      {/* 7. Testimonials & Google Reviews */}
      {modules.testimonials?.enabled && (
        <TestimonialsView
          testimonials={modules.testimonials}
          theme={theme}
          lang={lang}
          onLinkClick={onLinkClick}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. Social Strip View
// ---------------------------------------------------------------------------
function SocialStripView({
  strip,
  theme,
  onLinkClick,
}: {
  strip: SocialIconsStrip;
  theme: ThemePreferences;
  onLinkClick?: (e: React.MouseEvent<HTMLAnchorElement>, url: string) => void;
}) {
  const socialLinks = [
    {
      key: 'whatsapp',
      value: strip.whatsapp,
      url: strip.whatsapp?.startsWith('http')
        ? strip.whatsapp
        : `https://wa.me/${strip.whatsapp?.replace(/[^0-9]/g, '')}`,
      icon: <WhatsAppIcon className="w-4 h-4 text-emerald-400" />,
      label: 'WhatsApp',
      bg: 'hover:bg-emerald-500/20 border-emerald-500/30',
    },
    {
      key: 'instagram',
      value: strip.instagram,
      url: strip.instagram?.startsWith('http')
        ? strip.instagram
        : `https://instagram.com/${strip.instagram?.replace(/^@/, '')}`,
      icon: <InstagramIcon className="w-4 h-4 text-pink-400" />,
      label: 'Instagram',
      bg: 'hover:bg-pink-500/20 border-pink-500/30',
    },
    {
      key: 'tiktok',
      value: strip.tiktok,
      url: strip.tiktok?.startsWith('http')
        ? strip.tiktok
        : `https://tiktok.com/@${strip.tiktok?.replace(/^@/, '')}`,
      icon: <TikTokIcon className="w-4 h-4 text-cyan-400" />,
      label: 'TikTok',
      bg: 'hover:bg-cyan-500/20 border-cyan-500/30',
    },
    {
      key: 'linkedin',
      value: strip.linkedin,
      url: strip.linkedin?.startsWith('http')
        ? strip.linkedin
        : `https://linkedin.com/in/${strip.linkedin?.replace(/^@/, '')}`,
      icon: <LinkedInIcon className="w-4 h-4 text-blue-400" />,
      label: 'LinkedIn',
      bg: 'hover:bg-blue-500/20 border-blue-500/30',
    },
    {
      key: 'facebook',
      value: strip.facebook,
      url: strip.facebook?.startsWith('http')
        ? strip.facebook
        : `https://facebook.com/${strip.facebook}`,
      icon: <FacebookIcon className="w-4 h-4 text-blue-500" />,
      label: 'Facebook',
      bg: 'hover:bg-blue-500/20 border-blue-500/30',
    },
    {
      key: 'twitter',
      value: strip.twitter,
      url: strip.twitter?.startsWith('http')
        ? strip.twitter
        : `https://x.com/${strip.twitter?.replace(/^@/, '')}`,
      icon: <TwitterXIcon className="w-4 h-4 text-slate-200" />,
      label: 'X (Twitter)',
      bg: 'hover:bg-slate-700/40 border-slate-700/60',
    },
    {
      key: 'youtube',
      value: strip.youtube,
      url: strip.youtube?.startsWith('http')
        ? strip.youtube
        : `https://youtube.com/@${strip.youtube?.replace(/^@/, '')}`,
      icon: <YouTubeIcon className="w-4 h-4 text-red-500" />,
      label: 'YouTube',
      bg: 'hover:bg-red-500/20 border-red-500/30',
    },
    {
      key: 'spotify',
      value: strip.spotify,
      url: strip.spotify?.startsWith('http')
        ? strip.spotify
        : `https://open.spotify.com/artist/${strip.spotify}`,
      icon: <SpotifyIcon className="w-4 h-4 text-green-400" />,
      label: 'Spotify',
      bg: 'hover:bg-green-500/20 border-green-500/30',
    },
    {
      key: 'telegram',
      value: strip.telegram,
      url: strip.telegram?.startsWith('http')
        ? strip.telegram
        : `https://t.me/${strip.telegram?.replace(/^@/, '')}`,
      icon: <TelegramIcon className="w-4 h-4 text-sky-400" />,
      label: 'Telegram',
      bg: 'hover:bg-sky-500/20 border-sky-500/30',
    },
  ].filter((item) => item.value && item.value.trim().length > 0);

  if (socialLinks.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 py-1">
      {socialLinks.map((item) => (
        <a
          key={item.key}
          href={formatExternalUrl(item.url)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => onLinkClick && onLinkClick(e, item.url)}
          title={item.label}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm border backdrop-blur-md bg-black/15 ${item.bg}`}
          style={{ borderColor: theme.cardBorderColor || 'rgba(255,255,255,0.15)' }}
        >
          {item.icon}
        </a>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Lead Capture CTA
// ---------------------------------------------------------------------------
function LeadCaptureCta({
  leadModule,
  theme,
  lang = 'es',
  onOpen,
}: {
  leadModule: LeadCaptureModule;
  theme: ThemePreferences;
  lang?: SupportedLanguage;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-sm border"
      style={{
        backgroundColor: theme.buttonVariant === 'glass' ? 'rgba(255,255,255,0.14)' : theme.cardBgColor || '#1e293b',
        color: theme.cardTextColor || '#ffffff',
        borderColor: theme.cardBorderColor || 'rgba(255,255,255,0.2)',
      }}
    >
      <UserCheck className="w-4 h-4 text-sky-400" />
      <span>{leadModule.buttonLabel || t('connectWith', lang)}</span>
      <Sparkles className="w-3.5 h-3.5 text-amber-400 ml-1" />
    </button>
  );
}

// ---------------------------------------------------------------------------
// 3. Business Hours View
// ---------------------------------------------------------------------------
function BusinessHoursView({
  hours,
  theme,
  lang = 'es',
}: {
  hours: BusinessHoursModule;
  theme: ThemePreferences;
  lang?: SupportedLanguage;
}) {
  // Compute current open/closed status
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // 1=Mon, 7=Sun

  const openDays = hours.openDays || [1, 2, 3, 4, 5];
  const openH = hours.openHour ?? 9;
  const closeH = hours.closeHour ?? 19;

  const isTodayOpenDay = openDays.includes(currentDay);
  const isTimeOpen = currentHour >= openH && currentHour < closeH;
  const isOpenNow = isTodayOpenDay && isTimeOpen;

  return (
    <div
      className="w-full p-4 rounded-2xl border text-left shadow-sm backdrop-blur-md"
      style={{
        backgroundColor: theme.buttonVariant === 'glass' ? 'rgba(255,255,255,0.08)' : theme.cardBgColor || '#1e293b',
        color: theme.cardTextColor || '#ffffff',
        borderColor: theme.cardBorderColor || 'rgba(255,255,255,0.15)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold uppercase tracking-wider opacity-80">
            {t('businessHours', lang)}
          </span>
        </div>

        {/* Live Open / Closed Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black ${
            isOpenNow
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
            }`}
          />
          {isOpenNow ? t('openNow', lang) : t('closedNow', lang)}
        </span>
      </div>

      <p className="text-xs opacity-90 whitespace-pre-line leading-relaxed">
        {hours.scheduleText || 'Lunes a Viernes: 9:00 AM - 7:00 PM | Sábados: 10:00 AM - 2:00 PM'}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Location & GPS View
// ---------------------------------------------------------------------------
function LocationView({
  loc,
  theme,
  lang = 'es',
  onLinkClick,
}: {
  loc: LocationModule;
  theme: ThemePreferences;
  lang?: SupportedLanguage;
  onLinkClick?: (e: React.MouseEvent<HTMLAnchorElement>, url: string) => void;
}) {
  const mapsUrl =
    loc.googleMapsUrl ||
    (loc.addressText
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.addressText)}`
      : undefined);

  return (
    <div
      className="w-full p-4 rounded-2xl border text-left shadow-sm backdrop-blur-md space-y-3"
      style={{
        backgroundColor: theme.buttonVariant === 'glass' ? 'rgba(255,255,255,0.08)' : theme.cardBgColor || '#1e293b',
        color: theme.cardTextColor || '#ffffff',
        borderColor: theme.cardBorderColor || 'rgba(255,255,255,0.15)',
      }}
    >
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-rose-400" />
        <span className="text-xs font-bold uppercase tracking-wider opacity-80">
          {loc.addressTitle || t('location', lang)}
        </span>
      </div>

      {loc.addressText && (
        <p className="text-xs opacity-90 leading-relaxed">{loc.addressText}</p>
      )}

      {/* Action Buttons for Google Maps and Waze */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {mapsUrl && (
          <a
            href={formatExternalUrl(mapsUrl)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => onLinkClick && onLinkClick(e, mapsUrl)}
            className="flex-1 min-w-[130px] py-2 px-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <Navigation className="w-3.5 h-3.5 text-sky-400" />
            <span>{t('viewOnMaps', lang)}</span>
          </a>
        )}

        {loc.wazeUrl && (
          <a
            href={formatExternalUrl(loc.wazeUrl)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => onLinkClick && onLinkClick(e, loc.wazeUrl!)}
            className="flex-1 min-w-[110px] py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <span>Waze</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. Bank Details / Transfer Info
// ---------------------------------------------------------------------------
function BankDetailsView({
  bank,
  theme,
  lang = 'es',
}: {
  bank: BankDetailsModule;
  theme: ThemePreferences;
  lang?: SupportedLanguage;
}) {
  const [copiedClabe, setCopiedClabe] = useState(false);

  const handleCopyClabe = async () => {
    const textToCopy = bank.clabeNumber || bank.accountNumber;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedClabe(true);
      setTimeout(() => setCopiedClabe(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <div
      className="w-full p-4 rounded-2xl border text-left shadow-sm backdrop-blur-md space-y-2.5"
      style={{
        backgroundColor: theme.buttonVariant === 'glass' ? 'rgba(255,255,255,0.08)' : theme.cardBgColor || '#1e293b',
        color: theme.cardTextColor || '#ffffff',
        borderColor: theme.cardBorderColor || 'rgba(255,255,255,0.15)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider opacity-80">
            {t('bankDetails', lang)}
          </span>
        </div>
        {bank.bankName && (
          <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {bank.bankName}
          </span>
        )}
      </div>

      {bank.accountHolder && (
        <div className="text-xs opacity-90">
          <span className="opacity-60 block text-[10px] uppercase font-bold">Titular:</span>
          <span className="font-semibold">{bank.accountHolder}</span>
        </div>
      )}

      {/* CLABE / Account number with copy button */}
      {(bank.clabeNumber || bank.accountNumber) && (
        <div className="p-2.5 rounded-xl bg-black/25 border border-white/10 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] uppercase opacity-60 font-bold block">
              {bank.clabeNumber ? `${t('clabe', lang)}:` : `${t('accountNumber', lang)}:`}
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold tracking-wider truncate block">
              {bank.clabeNumber || bank.accountNumber}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyClabe}
            className="flex-shrink-0 py-1.5 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all"
            title="Copiar número de cuenta"
          >
            {copiedClabe ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{t('copied', lang)}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      )}

      {bank.conceptNote && (
        <p className="text-[11px] opacity-75 italic leading-tight pt-0.5">
          {bank.conceptNote}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. Catalog / Services Highlight
// ---------------------------------------------------------------------------
function CatalogView({
  catalog,
  theme,
  lang = 'es',
  whatsappNumber,
  onLinkClick,
}: {
  catalog: CatalogModule;
  theme: ThemePreferences;
  lang?: SupportedLanguage;
  whatsappNumber?: string;
  onLinkClick?: (e: React.MouseEvent<HTMLAnchorElement>, url: string) => void;
}) {
  const cleanPhone = (whatsappNumber || '').replace(/[^0-9]/g, '');

  return (
    <div className="w-full text-left space-y-2.5 pt-1">
      <div className="flex items-center gap-2 px-1">
        <ShoppingBag className="w-4 h-4 text-amber-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider opacity-85">
          {catalog.sectionTitle || t('catalog', lang)}
        </h4>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {catalog.items.map((item) => {
          const defaultMsg = `Hola, me interesa información y cotización sobre: ${item.title}`;
          const waMsg = encodeURIComponent(item.whatsappInquiryMessage || defaultMsg);
          const waUrl = cleanPhone
            ? `https://wa.me/${cleanPhone}?text=${waMsg}`
            : `https://wa.me/?text=${waMsg}`;

          return (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl border text-left flex items-start gap-3 backdrop-blur-md transition-all hover:scale-[1.01]"
              style={{
                backgroundColor: theme.buttonVariant === 'glass' ? 'rgba(255,255,255,0.08)' : theme.cardBgColor || '#1e293b',
                color: theme.cardTextColor || '#ffffff',
                borderColor: theme.cardBorderColor || 'rgba(255,255,255,0.15)',
              }}
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-white/10"
                />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <h5 className="text-xs sm:text-sm font-bold truncate">{item.title}</h5>
                  {item.price && (
                    <span className="text-xs font-extrabold text-amber-400 whitespace-nowrap">
                      {item.price}
                    </span>
                  )}
                </div>

                {item.description && (
                  <p className="text-xs opacity-80 line-clamp-2 mb-2 leading-relaxed">
                    {item.description}
                  </p>
                )}

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => onLinkClick && onLinkClick(e, waUrl)}
                  className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 transition-all"
                >
                  <MessageCircle className="w-3 h-3 text-emerald-400" />
                  <span>{t('inquire', lang)}</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 7. Testimonials & Google Reviews
// ---------------------------------------------------------------------------
function TestimonialsView({
  testimonials,
  theme,
  lang = 'es',
  onLinkClick,
}: {
  testimonials: TestimonialsModule;
  theme: ThemePreferences;
  lang?: SupportedLanguage;
  onLinkClick?: (e: React.MouseEvent<HTMLAnchorElement>, url: string) => void;
}) {
  return (
    <div className="w-full text-left space-y-3 pt-1">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider opacity-85">
            {t('testimonials', lang)}
          </h4>
        </div>

        {/* Google Reviews Button */}
        {testimonials.showGoogleButton && testimonials.googleReviewsUrl && (
          <a
            href={formatExternalUrl(testimonials.googleReviewsUrl)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => onLinkClick && onLinkClick(e, testimonials.googleReviewsUrl!)}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold py-1 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
            style={{ color: theme.cardTextColor }}
          >
            <GoogleIcon className="w-3.5 h-3.5" />
            <span>{t('seeOnGoogle', lang)}</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        )}
      </div>

      {/* Testimonials List */}
      <div className="space-y-2">
        {testimonials.items.map((test) => (
          <div
            key={test.id}
            className="p-3.5 rounded-2xl border text-left backdrop-blur-md space-y-1.5"
            style={{
              backgroundColor: theme.buttonVariant === 'glass' ? 'rgba(255,255,255,0.06)' : theme.cardBgColor || '#1e293b',
              color: theme.cardTextColor || '#ffffff',
              borderColor: theme.cardBorderColor || 'rgba(255,255,255,0.12)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">{test.authorName}</span>
              <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: test.rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400" />
                ))}
              </div>
            </div>

            <p className="text-xs opacity-85 italic leading-relaxed">
              "{test.text}"
            </p>

            {test.roleOrDate && (
              <span className="block text-[10px] opacity-60 font-medium">
                {test.roleOrDate}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
