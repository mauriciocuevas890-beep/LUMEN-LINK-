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
  createdAt?: string;
  updatedAt?: string;
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
