import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  UserCheck,
  Share2,
  ExternalLink,
  Check,
  Copy,
  Download,
  Phone,
  Mail,
  Briefcase,
  Globe,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  Music2,
  Sparkles,
  QrCode,
  Camera,
  CreditCard,
  ImageIcon,
  MessageCircle,
  MapPin,
  PhoneCall,
  Star,
  Calendar,
  Send,
  MessageSquare,
} from 'lucide-react';
import { UserProfile, LinkItem, ThemePreferences } from '../types';
import { downloadVCard, generateAndDownloadVCF } from '../utils/vcard';
import { QRCodeGeneratorModal } from './QRCodeModal';
import { getPublicProfileUrl, formatExternalUrl } from '../utils/urlHelper';
import { copyToClipboard } from '../utils/clipboard';
import { getOfficialBrandIcon } from './BrandIcons';

interface ProfileViewProps {
  profile: UserProfile;
  links: LinkItem[];
  isPreview?: boolean;
  onEditAvatar?: () => void;
  onEditCardTemplate?: () => void;
  onEditBackground?: () => void;
}

export function ProfileView({
  profile,
  links,
  isPreview = false,
  onEditAvatar,
  onEditCardTemplate,
  onEditBackground,
}: ProfileViewProps) {
  const [copied, setCopied] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [vcardDownloaded, setVcardDownloaded] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const theme: ThemePreferences = profile.theme_preferences || {
    bgColor: '#0f172a',
    cardBgColor: '#1e293b',
    cardTextColor: '#ffffff',
    cardBorderColor: '#334155',
    fontStyle: 'sans',
    buttonStyle: 'rounded-lg',
    buttonVariant: 'filled',
    accentColor: '#38bdf8',
  };

  const vcard = profile.vcard_details;
  const rawPhone = vcard?.phone?.trim() || '';
  const cleanPhoneDigits = rawPhone.replace(/[^\d+]/g, '');
  const hasPhone = Boolean(rawPhone);
  const hasVCard = Boolean(
    vcard && (vcard.fullName?.trim() || vcard.phone?.trim() || vcard.email?.trim() || vcard.company?.trim())
  );

  // Group links
  const activeLinks = links.filter((l) => l.isActive);
  const groupedLinks: { [groupName: string]: LinkItem[] } = {};
  const ungroupedLinks: LinkItem[] = [];

  activeLinks.forEach((link) => {
    const grp = link.group_name?.trim();
    if (grp) {
      if (!groupedLinks[grp]) groupedLinks[grp] = [];
      groupedLinks[grp].push(link);
    } else {
      ungroupedLinks.push(link);
    }
  });

  const handleSaveContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const success = generateAndDownloadVCF(profile, {
      publicUrl: getPublicProfileUrl(profile.username, profile.customDomain),
      links: activeLinks,
    });
    if (success) {
      setVcardDownloaded(true);
      setTimeout(() => setVcardDownloaded(false), 3000);
    }
  };

  const handleCopyPhone = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!rawPhone) return;
    const copied = await copyToClipboard(rawPhone);
    if (copied) {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2500);
    }
  };

  const handleShare = async () => {
    const url = getPublicProfileUrl(profile.username, profile.customDomain);
    const title = profile.displayName || profile.username;
    const text = profile.bio || `Tarjeta digital de ${title}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to clipboard
      }
    }

    const copied = await copyToClipboard(url);
    if (copied) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Robust link click handler ensuring links open across iframes, mobile, and external browsers
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, rawUrl: string) => {
    if (!rawUrl || rawUrl === '#') {
      e.preventDefault();
      return;
    }
    const formatted = formatExternalUrl(rawUrl);

    // Protocol checks for direct dialing / email / sms
    if (formatted.startsWith('tel:') || formatted.startsWith('mailto:') || formatted.startsWith('sms:')) {
      e.preventDefault();
      window.location.href = formatted;
      return;
    }
  };

  // Font family mapping
  const getFontFamilyClass = (style?: string) => {
    switch (style) {
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono';
      case 'rounded':
        return 'font-sans tracking-tight';
      case 'sans':
      default:
        return 'font-sans';
    }
  };

  // Button shape mapping
  const getButtonRadiusClass = (bStyle?: string) => {
    switch (bStyle) {
      case 'rounded-full':
        return 'rounded-full';
      case 'rounded-none':
        return 'rounded-none';
      case 'shadow-hard':
        return 'rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]';
      case 'rounded-lg':
      default:
        return 'rounded-2xl';
    }
  };

  // Get matching official icon for known link platforms
  const getSocialIcon = (url: string, title?: string) => {
    const brandIcon = getOfficialBrandIcon(url, title, 'w-5 h-5');
    if (brandIcon) return brandIcon;

    const lower = (url || '').toLowerCase();
    if (lower.startsWith('mailto:')) return <Mail className="w-5 h-5 flex-shrink-0 text-purple-400" />;
    if (lower.startsWith('tel:')) return <Phone className="w-5 h-5 flex-shrink-0 text-sky-400" />;
    if (lower.startsWith('sms:')) return <MessageSquare className="w-5 h-5 flex-shrink-0 text-blue-400" />;

    return <Globe className="w-5 h-5 flex-shrink-0 text-slate-300" />;
  };

  // Background style calculation
  const containerBgStyle: React.CSSProperties = {
    background:
      theme.bgType === 'gradient' && theme.bgGradient
        ? theme.bgGradient
        : theme.bgColor || '#0f172a',
    position: 'relative',
    overflow: 'hidden',
  };

  // Link card style
  const getLinkCardStyle = (): React.CSSProperties => {
    if (theme.buttonVariant === 'outline') {
      return {
        backgroundColor: 'transparent',
        borderColor: theme.cardBorderColor || theme.cardTextColor || '#ffffff',
        borderWidth: '1.5px',
        color: theme.cardTextColor || '#ffffff',
      };
    }
    if (theme.buttonVariant === 'glass') {
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: 'rgba(255, 255, 255, 0.25)',
        borderWidth: '1px',
        color: theme.cardTextColor || '#ffffff',
      };
    }
    // filled
    return {
      backgroundColor: theme.cardBgColor || '#ffffff',
      borderColor: theme.cardBorderColor || 'transparent',
      borderWidth: theme.cardBorderColor ? '1px' : '0px',
      color: theme.cardTextColor || '#0f172a',
    };
  };

  return (
    <div
      id="profile-view-root"
      style={containerBgStyle}
      className={`w-full transition-colors duration-300 relative ${getFontFamilyClass(
        theme.fontStyle
      )} ${
        isPreview
          ? 'p-3.5 sm:p-5 md:p-6'
          : 'min-h-screen-dvh py-8 sm:py-12 md:py-16 px-3.5 xs:px-4 sm:px-6 md:px-8 pb-safe pt-safe flex flex-col justify-between'
      }`}
    >
      {/* Uploaded Background Image Layer */}
      {theme.bgImageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none transition-all duration-300"
          style={{
            backgroundImage: `url(${theme.bgImageUrl})`,
            opacity: theme.bgImageOpacity ?? 0.85,
            filter: theme.bgImageBlur ? `blur(${theme.bgImageBlur}px)` : undefined,
            transform: theme.bgImageBlur ? 'scale(1.05)' : undefined, // prevent blurred edges from showing white
          }}
        />
      )}

      {/* Readability Contrast Overlay */}
      {theme.bgImageUrl && theme.bgImageOverlay !== 'none' && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity"
          style={{
            background:
              theme.bgImageOverlay === 'light'
                ? 'rgba(255, 255, 255, 0.45)'
                : theme.bgImageOverlay === 'gradient'
                ? 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.75) 100%)'
                : 'rgba(0, 0, 0, 0.45)', // default dark
            backdropFilter: 'blur(1px)',
            WebkitBackdropFilter: 'blur(1px)',
          }}
        />
      )}

      {/* Content wrapper with relative z-10 */}
      <div className="relative z-10 max-w-md sm:max-w-lg md:max-w-xl mx-auto w-full">
        {/* Top action bar */}
        <div className="w-full flex items-center justify-between mb-4 sm:mb-6">
          <div />

          <div className="flex items-center gap-2">
            <motion.button
              id="qr-profile-btn"
              onClick={() => setShowQRModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              title="Ver Código QR"
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-full backdrop-blur-md bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-all flex items-center justify-center gap-1.5 text-xs font-medium select-none"
              style={{ color: theme.cardTextColor }}
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">QR</span>
            </motion.button>

            <motion.button
              id="share-profile-btn"
              onClick={handleShare}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              title="Share or copy profile link"
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-full backdrop-blur-md bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-all flex items-center justify-center gap-1.5 text-xs font-medium select-none"
              style={{ color: theme.cardTextColor }}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Compartir</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        <div className="w-full flex flex-col items-center text-center">
        {/* Card Template / Banner (uploaded by user or admin) */}
        {theme.cardTemplateUrl && (
          <div className="w-full h-32 sm:h-40 rounded-3xl overflow-hidden mb-[-44px] relative border border-white/10 shadow-lg group/banner">
            <img
              src={theme.cardTemplateUrl}
              alt="Plantilla de tarjeta"
              className="w-full h-full object-cover"
              style={{ opacity: theme.cardTemplateOpacity ?? 0.95 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            {onEditCardTemplate && (
              <button
                type="button"
                onClick={onEditCardTemplate}
                className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-semibold opacity-0 group-hover/banner:opacity-100 transition-opacity flex items-center gap-1 shadow-xs"
                title="Cambiar plantilla de tarjeta desde tu dispositivo"
              >
                <CreditCard className="w-3 h-3 text-emerald-400" />
                <span>Plantilla</span>
              </button>
            )}
          </div>
        )}

        {/* Profile Avatar */}
        <div className="relative mb-4 group z-10">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName || profile.username}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-xl border-4"
              style={{
                borderColor: theme.cardBorderColor || 'rgba(255,255,255,0.2)',
              }}
              onError={(e) => {
                // Fallback if image fails to load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-3xl sm:text-4xl font-bold shadow-xl border-4"
              style={{
                backgroundColor: theme.cardBgColor || '#38bdf8',
                color: theme.cardTextColor || '#ffffff',
                borderColor: theme.cardBorderColor || 'rgba(255,255,255,0.2)',
              }}
            >
              {(profile.displayName || profile.username || 'U').charAt(0).toUpperCase()}
            </div>
          )}

          {/* Quick upload overlay on avatar */}
          {onEditAvatar && (
            <button
              type="button"
              onClick={onEditAvatar}
              className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold cursor-pointer shadow-lg"
              title="Subir foto desde tu dispositivo"
            >
              <Camera className="w-5 h-5 text-sky-400 mb-0.5" />
              <span>Subir Foto</span>
            </button>
          )}
        </div>

        {/* Display Name & Username */}
        <h1
          id="profile-display-name"
          className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1"
          style={{ color: theme.cardTextColor }}
        >
          {profile.displayName || profile.username}
        </h1>

        <div
          id="profile-username-tag"
          className="text-sm font-medium opacity-75 mb-3 flex items-center gap-1"
          style={{ color: theme.cardTextColor }}
        >
          <span>@{profile.username}</span>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p
            id="profile-bio"
            className="text-sm sm:text-base leading-relaxed max-w-sm mb-6 opacity-90 whitespace-pre-line"
            style={{ color: theme.cardTextColor }}
          >
            {profile.bio}
          </p>
        )}

        {/* Direct Phone / WhatsApp Quick Contact Action Bar */}
        {hasPhone && (
          <div className="w-full mb-5 space-y-2">
            <div className="grid grid-cols-2 gap-2.5">
              <motion.a
                id="direct-call-btn"
                href={`tel:${cleanPhoneDigits}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-colors select-none"
              >
                <PhoneCall className="w-4 h-4 text-slate-950" />
                <span>Llamar</span>
              </motion.a>

              <motion.a
                id="direct-whatsapp-btn"
                href={`https://wa.me/${cleanPhoneDigits.replace(/^\+/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleLinkClick(e, `https://wa.me/${cleanPhoneDigits.replace(/^\+/, '')}`)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-colors select-none"
              >
                <MessageCircle className="w-4 h-4 text-slate-950" />
                <span>WhatsApp</span>
              </motion.a>
            </div>

            <motion.button
              type="button"
              onClick={handleCopyPhone}
              whileTap={{ scale: 0.97 }}
              className="w-full py-2 px-3 rounded-xl border backdrop-blur-md text-[11px] font-medium flex items-center justify-center gap-1.5 opacity-80 hover:opacity-100 transition-all select-none"
              style={{
                borderColor: theme.cardBorderColor || 'rgba(255,255,255,0.2)',
                color: theme.cardTextColor,
                backgroundColor: 'rgba(255,255,255,0.06)',
              }}
            >
              {copiedPhone ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>¡Teléfono copiado! ({rawPhone})</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{rawPhone} • Copiar Número</span>
                </>
              )}
            </motion.button>
          </div>
        )}

        {/* vCard "Save Contact" Button */}
        {hasVCard && (
          <div className="w-full mb-8">
            <motion.button
              id="save-contact-button"
              onClick={handleSaveContact}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`w-full py-3.5 px-6 font-semibold flex items-center justify-center gap-2.5 shadow-lg select-none ${getButtonRadiusClass(
                theme.buttonStyle
              )}`}
              style={{
                backgroundColor: theme.accentColor || '#0284c7',
                color: '#ffffff',
              }}
            >
              {vcardDownloaded ? (
                <>
                  <Check className="w-5 h-5 text-white" />
                  <span>Contacto Descargado (.vcf)</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Guardar Contacto en el Teléfono</span>
                </>
              )}
            </motion.button>

            <motion.button
              id="view-qr-button"
              type="button"
              onClick={() => setShowQRModal(true)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`w-full mt-2.5 py-2.5 px-4 font-semibold text-xs flex items-center justify-center gap-2 border backdrop-blur-md hover:opacity-90 select-none ${getButtonRadiusClass(
                theme.buttonStyle
              )}`}
              style={{
                borderColor: theme.cardBorderColor || 'rgba(255,255,255,0.2)',
                color: theme.cardTextColor,
                backgroundColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <QrCode className="w-4 h-4" />
              <span>Ver Código QR de Tarjeta Digital</span>
            </motion.button>

            <p
              className="text-[11px] mt-1.5 opacity-60"
              style={{ color: theme.cardTextColor }}
            >
              Importa Nombre, Teléfono, Correo y Empresa directamente a tus contactos
            </p>
          </div>
        )}

        {/* Stand-alone QR button if no vCard configured */}
        {!hasVCard && (
          <div className="w-full mb-6">
            <motion.button
              id="view-qr-button-stand-alone"
              type="button"
              onClick={() => setShowQRModal(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`w-full py-2.5 px-4 font-semibold text-xs flex items-center justify-center gap-2 border backdrop-blur-md hover:opacity-90 select-none ${getButtonRadiusClass(
                theme.buttonStyle
              )}`}
              style={{
                borderColor: theme.cardBorderColor || 'rgba(255,255,255,0.2)',
                color: theme.cardTextColor,
                backgroundColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <QrCode className="w-4 h-4" />
              <span>Código QR del Perfil</span>
            </motion.button>
          </div>
        )}

        {/* Active Links - Organized by Group */}
        <div className="w-full space-y-6">
          {/* Ungrouped Links */}
          {ungroupedLinks.length > 0 && (
            <div className="space-y-3">
              {ungroupedLinks.map((link) => (
                <a
                  key={link.id}
                  id={`link-item-${link.id}`}
                  href={formatExternalUrl(link.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => handleLinkClick(e, link.url)}
                  style={getLinkCardStyle()}
                  className={`w-full p-4 flex items-center justify-between transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm font-medium ${getButtonRadiusClass(
                    theme.buttonStyle
                  )}`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-2">
                    <span className="flex-shrink-0">
                      {getSocialIcon(link.url, link.title)}
                    </span>
                    <span className="truncate text-left text-sm sm:text-base font-semibold">
                      {link.title}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-60 flex-shrink-0" />
                </a>
              ))}
            </div>
          )}

          {/* Grouped Links */}
          {Object.entries(groupedLinks).map(([groupName, groupLinks]) => (
            <div key={groupName} className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div
                  className="h-px flex-1 opacity-20"
                  style={{ backgroundColor: theme.cardTextColor }}
                />
                <h2
                  className="text-xs font-bold uppercase tracking-widest opacity-70 px-2"
                  style={{ color: theme.cardTextColor }}
                >
                  {groupName}
                </h2>
                <div
                  className="h-px flex-1 opacity-20"
                  style={{ backgroundColor: theme.cardTextColor }}
                />
              </div>

              <div className="space-y-3">
                {groupLinks.map((link) => (
                  <a
                    key={link.id}
                    id={`link-item-${link.id}`}
                    href={formatExternalUrl(link.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => handleLinkClick(e, link.url)}
                    style={getLinkCardStyle()}
                    className={`w-full p-4 flex items-center justify-between transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm font-medium ${getButtonRadiusClass(
                      theme.buttonStyle
                    )}`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 pr-2">
                      <span className="flex-shrink-0">
                        {getSocialIcon(link.url, link.title)}
                      </span>
                      <span className="truncate text-left text-sm sm:text-base font-semibold">
                        {link.title}
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 opacity-60 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {activeLinks.length === 0 && (
            <div
              className="py-12 px-6 rounded-2xl border border-dashed text-center opacity-60"
              style={{
                borderColor: theme.cardBorderColor || 'rgba(255,255,255,0.2)',
                color: theme.cardTextColor,
              }}
            >
              <p className="text-sm font-medium">No hay enlaces publicados todavía.</p>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* QR Code Modal (View-Only for public link profile visitors) */}
      <QRCodeGeneratorModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        profile={profile}
        customTitle={`Código QR • @${profile.username}`}
        viewOnly={true}
      />
    </div>
  );
}
