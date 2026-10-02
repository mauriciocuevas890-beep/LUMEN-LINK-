/**
 * Helper utility for generating robust public URLs, share links,
 * and normalizing external web/phone/messaging links.
 */

export const DEFAULT_PUBLIC_APP_URL = 'https://ais-pre-44bke3m56lrdlhkirnzrjn-340223326098.us-west2.run.app';
export const DEFAULT_BRANDED_DOMAIN = 'lumenbasenfcards.com';

/**
 * Gets the clean public base URL from the current active host.
 * If running inside an aistudio editor wrapper, falls back to the direct public run.app URL.
 */
export function getPublicBaseUrl(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_PUBLIC_APP_URL;
  }
  
  const origin = window.location.origin;
  if (!origin || origin.includes('aistudio.google.com') || origin.includes('localhost:3000')) {
    return `https://${DEFAULT_BRANDED_DOMAIN}`;
  }

  return origin;
}

/**
 * Generates the full shareable public profile URL for a given username.
 * Supports custom branded domains (defaults to lumenbasenfcards.com).
 */
export function getPublicProfileUrl(username?: string, customDomain?: string): string {
  const cleanUsername = username ? username.replace(/^[@/]+/, '').trim() : '';
  const domainToUse = (customDomain && customDomain.trim()) ? customDomain : DEFAULT_BRANDED_DOMAIN;

  if (domainToUse && domainToUse.trim()) {
    const cleanDomain = domainToUse
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '')
      .replace(/\s+/g, '');
    if (cleanDomain) {
      return cleanUsername ? `https://${cleanDomain}/${cleanUsername}` : `https://${cleanDomain}`;
    }
  }

  if (!cleanUsername) return getPublicBaseUrl();
  return `${getPublicBaseUrl()}/${cleanUsername}`;
}

/**
 * Generates the full shareable client portal URL for a client.
 * Supports custom branded domains.
 */
export function getClientPortalUrl(clientId: string, customDomain?: string): string {
  const domainToUse = (customDomain && customDomain.trim()) ? customDomain : DEFAULT_BRANDED_DOMAIN;
  if (domainToUse && domainToUse.trim()) {
    const cleanDomain = domainToUse
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '')
      .replace(/\s+/g, '');
    if (cleanDomain) {
      return `https://${cleanDomain}/client/${clientId}`;
    }
  }
  return `${getPublicBaseUrl()}/client/${clientId}`;
}

/**
 * Formats any raw input string into a safe, absolute standard URL (http, https, tel, mailto, wa.me).
 * Guaranteed to never return a relative path to prevent 403 errors when clicked in a browser.
 */
export function formatExternalUrl(rawUrl?: string): string {
  if (!rawUrl) return '#';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '#';

  // Already standard protocol
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('sms:')
  ) {
    return trimmed;
  }

  // Pure email format
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return `mailto:${trimmed}`;
  }

  // Pure phone number format (e.g. +1 555 123 4567 or 555-123-4567)
  if (/^[\d\s\+\-\(\)]{7,}$/.test(trimmed)) {
    const cleanNumber = trimmed.replace(/[^\d+]/g, '');
    return `tel:${cleanNumber}`;
  }

  // WhatsApp shortcut formats
  if (trimmed.startsWith('wa.me/')) {
    return `https://${trimmed}`;
  }
  if (trimmed.startsWith('whatsapp://')) {
    return trimmed;
  }

  // Social handles
  if (trimmed.startsWith('@')) {
    return `https://instagram.com/${trimmed.slice(1)}`;
  }

  // General web URL (guaranteed absolute https://)
  return `https://${trimmed.replace(/^\/+/, '')}`;
}
