export interface ThemePreferences {
  presetId?: string;
  bgColor: string; // e.g. '#0f172a' or hex/gradient
  bgType?: 'solid' | 'gradient' | 'image';
  bgGradient?: string;
  bgImageUrl?: string; // Custom uploaded background image (data URL or URL)
  bgImageOpacity?: number; // 0.1 to 1.0 (default 0.85)
  bgImageBlur?: number; // 0 to 20 px blur
  bgImageOverlay?: 'none' | 'dark' | 'light' | 'gradient'; // Overlay for contrast
  cardTemplateUrl?: string; // Custom uploaded card template / banner image from device (data URL or URL)
  cardTemplateOpacity?: number; // 0.1 to 1.0 (default 0.95)
  cardBgColor: string; // e.g. '#1e293b' or '#ffffff'
  cardTextColor: string; // e.g. '#ffffff' or '#0f172a'
  cardBorderColor?: string;
  fontStyle: 'sans' | 'serif' | 'mono' | 'rounded';
  buttonStyle: 'rounded-lg' | 'rounded-full' | 'rounded-none' | 'shadow-hard';
  buttonVariant: 'filled' | 'outline' | 'glass';
  accentColor: string;
}

export interface VCardDetails {
  enabled?: boolean; // When false, hides the "Guardar Contacto" button from the digital card. Defaults to true if contact details exist.
  showQuickCall?: boolean; // When false, hides the quick Llamar/WhatsApp direct buttons from the top bar. Defaults to true if phone exists.
  showQrButton?: boolean; // When false, hides the QR code button on the card. Defaults to true.
  fullName: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  company?: string;
  phone?: string;
  email?: string;
  website?: string;
  note?: string;
}

export interface CustomDomainConfig {
  domain: string; // e.g. "links.miempresa.com" or "tarjeta.drgarcia.com"
  status: 'pending' | 'verified' | 'active' | 'error';
  cnameTarget: string; // e.g. "cname.lumen.link"
  dnsRecordType: 'CNAME';
  verifiedAt?: string;
  sslStatus?: 'active' | 'issuing' | 'pending';
  lastChecked?: string;
}

export interface SocialIconsStrip {
  enabled: boolean;
  whatsapp?: string;
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  telegram?: string;
  spotify?: string;
}

export interface BusinessHoursModule {
  enabled: boolean;
  scheduleText?: string; // e.g. "Lun - Vie: 9:00 AM - 7:00 PM | Sáb: 10:00 AM - 2:00 PM"
  openHour?: number; // 0-23
  closeHour?: number; // 0-23
  openDays?: number[]; // [1,2,3,4,5] (1=Mon, 7=Sun)
}

export interface LocationModule {
  enabled: boolean;
  addressTitle?: string;
  addressText?: string;
  googleMapsUrl?: string;
  wazeUrl?: string;
}

export interface BankDetailsModule {
  enabled: boolean;
  bankName?: string;
  accountHolder?: string;
  clabeNumber?: string;
  accountNumber?: string;
  conceptNote?: string;
}

export interface ServiceProductItem {
  id: string;
  title: string;
  price?: string;
  description?: string;
  imageUrl?: string;
  whatsappInquiryMessage?: string;
}

export interface CatalogModule {
  enabled: boolean;
  sectionTitle?: string;
  items: ServiceProductItem[];
}

export interface VisualBadgingStyle {
  avatarShape?: 'circle' | 'squircle' | 'rounded';
  verifiedBadge?: boolean;
  verifiedBadgeColor?: 'blue' | 'gold' | 'emerald';
  spotlightLinkId?: string;
}

export interface TestimonialItem {
  id: string;
  authorName: string;
  rating?: number;
  text: string;
  roleOrDate?: string;
}

export interface TestimonialsModule {
  enabled: boolean;
  googleReviewsUrl?: string;
  showGoogleButton?: boolean;
  items: TestimonialItem[];
}

export interface LeadContactItem {
  id: string;
  name: string;
  phone: string;
  email?: string;
  note?: string;
  createdAt: string;
}

export interface LeadCaptureModule {
  enabled: boolean;
  buttonLabel?: string;
  formTitle?: string;
  successMessage?: string;
}

export interface VideoEmbedModule {
  enabled: boolean;
  videoUrl?: string; // YouTube, YouTube Live, Vimeo, Twitch
  title?: string; // Optional section title (e.g. "Transmisión en Vivo", "Video Destacado")
  isLive?: boolean; // Highlight with a pulsing red 'EN VIVO' badge
}

export interface ProfileModulesConfig {
  socialStrip?: SocialIconsStrip;
  businessHours?: BusinessHoursModule;
  location?: LocationModule;
  bankDetails?: BankDetailsModule;
  catalog?: CatalogModule;
  visualStyle?: VisualBadgingStyle;
  testimonials?: TestimonialsModule;
  leadCapture?: LeadCaptureModule;
  videoEmbed?: VideoEmbedModule;
  language?: ProfileLanguageConfig;
}

export type SupportedLanguage = 'es' | 'en' | 'pt' | 'fr';

export interface ProfileLanguageConfig {
  defaultLanguage: SupportedLanguage; // 'es' | 'en' | 'pt' | 'fr'
  mode: 'fixed' | 'switcher'; // 'fixed': strictly in 1 language; 'switcher': visitor can switch with 1 click in top-left
  availableLanguages?: SupportedLanguage[]; // e.g. ['es', 'en']
  bioTranslations?: Partial<Record<SupportedLanguage, string>>;
  sectionTranslations?: Record<string, Partial<Record<SupportedLanguage, string>>>;
}

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  role?: 'admin' | 'client';
  assignedProfileId?: string; // If user is a client assigned to a ClientProfile
  isPremium?: boolean;
  customDomain?: string;
  customDomainConfig?: CustomDomainConfig;
  theme_preferences: ThemePreferences;
  vcard_details: VCardDetails;
  modules?: ProfileModulesConfig;
  language?: ProfileLanguageConfig;
  capturedLeads?: LeadContactItem[];
  createdAt?: string;
  updatedAt?: string;
  isOptimistic?: boolean;
}

export interface ClientProfile {
  id: string; // Document ID
  ownerUid: string; // Account owner UID who manages this client
  username: string; // Unique handle for public URL /:username
  clientName: string; // Internal reference name (e.g. "Clínica Dental Martínez")
  clientEmail?: string; // Email of the client assigned to this profile
  clientUid?: string; // Firebase Auth UID of the registered client
  clientStatus?: 'unassigned' | 'pending' | 'active'; // Registration & link status
  clientAccess?: 'full' | 'view_only'; // Permissions
  isPremium?: boolean;
  tier?: 'free' | 'premium' | 'agency';
  customDomain?: string;
  customDomainConfig?: CustomDomainConfig;
  industry?: string; // Tag or category (e.g. "Restaurante", "Salud", "Servicios", "Creador")
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  theme_preferences: ThemePreferences;
  vcard_details: VCardDetails;
  modules?: ProfileModulesConfig;
  language?: ProfileLanguageConfig;
  capturedLeads?: LeadContactItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LinkItem {
  id: string; // Document ID (link_id)
  uid: string;
  profileId?: string; // ID of the client profile (or 'main' for personal)
  title: string;
  url: string;
  group_name?: string;
  order: number;
  isActive: boolean;
  icon?: string;
  clickCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UsernameDoc {
  uid: string;
  profileId?: string;
  username: string;
  createdAt: string;
}
