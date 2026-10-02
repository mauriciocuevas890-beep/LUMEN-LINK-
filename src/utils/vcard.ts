import { VCardDetails, UserProfile, ClientProfile, LinkItem } from '../types';
import { getPublicProfileUrl } from './urlHelper';

export interface VCardOptions {
  customFilename?: string;
  publicUrl?: string; // Canonical public profile URL (e.g. https://lumen.link/username)
  notesExtra?: string;
  links?: LinkItem[] | Array<{ title: string; url: string }>;
}

export type VCardDownloadOptions = string | VCardOptions;

/**
 * Normalizes input: handles VCardDetails, UserProfile, or ClientProfile
 */
function extractCardData(target: VCardDetails | UserProfile | ClientProfile, options?: VCardOptions) {
  let vcard: Partial<VCardDetails> = {};
  let username = '';
  let avatarUrl = '';
  let bio = '';

  let customDomain: string | undefined = undefined;

  if ('vcard_details' in target && target.vcard_details) {
    vcard = target.vcard_details;
    username = target.username || '';
    avatarUrl = target.avatarUrl || '';
    bio = target.bio || '';
    customDomain = target.customDomain;
    if ('clientName' in target && !vcard.fullName) {
      vcard.fullName = target.clientName;
    } else if ('displayName' in target && target.displayName && !vcard.fullName) {
      vcard.fullName = target.displayName;
    }
  } else {
    vcard = target as VCardDetails;
  }

  const rawFullName = (vcard.fullName || username || 'Contacto').trim();

  // Parse first and last names if not explicitly separated
  let firstName = vcard.firstName?.trim() || '';
  let lastName = vcard.lastName?.trim() || '';

  if (!firstName && !lastName && rawFullName) {
    const parts = rawFullName.split(/\s+/);
    if (parts.length > 1) {
      firstName = parts.slice(0, -1).join(' ');
      lastName = parts[parts.length - 1];
    } else {
      firstName = rawFullName;
      lastName = '';
    }
  }

  // Combine note with bio if applicable
  let noteText = vcard.note?.trim() || '';
  if (bio && !noteText.includes(bio)) {
    noteText = noteText ? `${noteText}\n\n${bio}` : bio;
  }
  if (options?.notesExtra) {
    noteText = noteText ? `${noteText}\n\n${options.notesExtra}` : options.notesExtra;
  }

  const publicUrl = options?.publicUrl || (username
    ? getPublicProfileUrl(username, customDomain)
    : '');

  return {
    fullName: rawFullName,
    firstName,
    lastName,
    company: vcard.company?.trim() || '',
    jobTitle: vcard.jobTitle?.trim() || '',
    phone: vcard.phone?.trim() || '',
    email: vcard.email?.trim() || '',
    website: vcard.website?.trim() || '',
    note: noteText,
    username,
    avatarUrl,
    publicUrl,
    links: options?.links || [],
  };
}

/**
 * Escapes characters for standard vCard 3.0 text values
 */
function escapeVCardValue(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

/**
 * Folds lines longer than 75 octets according to RFC 2426 / RFC 6350 standards
 */
function foldVCardLine(line: string): string {
  const maxLineLength = 75;
  if (line.length <= maxLineLength) return line;

  const chunks: string[] = [];
  let remaining = line;

  while (remaining.length > maxLineLength) {
    chunks.push(remaining.substring(0, maxLineLength));
    // Line continuation requires a leading whitespace character
    remaining = ' ' + remaining.substring(maxLineLength);
  }
  if (remaining.length > 0) {
    chunks.push(remaining);
  }

  return chunks.join('\r\n');
}

/**
 * Formats contact details or digital business cards into standard RFC 6350 / vCard 3.0 text
 * Compatible with Apple Contacts (iOS/macOS), Google Contacts (Android), Microsoft Outlook, and standard address books.
 */
export function generateVCardString(
  target: VCardDetails | UserProfile | ClientProfile,
  options?: VCardOptions
): string {
  const card = extractCardData(target, options);

  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'PRODID:-//Lumen.Link//Digital Business Card vCard Generator//ES',
    `FN;CHARSET=UTF-8:${escapeVCardValue(card.fullName)}`,
    `N;CHARSET=UTF-8:${escapeVCardValue(card.lastName)};${escapeVCardValue(card.firstName)};;;`,
  ];

  if (card.username) {
    lines.push(`NICKNAME;CHARSET=UTF-8:${escapeVCardValue(card.username)}`);
  }

  if (card.company) {
    lines.push(`ORG;CHARSET=UTF-8:${escapeVCardValue(card.company)}`);
  }

  if (card.jobTitle) {
    lines.push(`TITLE;CHARSET=UTF-8:${escapeVCardValue(card.jobTitle)}`);
  }

  if (card.phone) {
    // Clean telephone string preserving '+' for international prefix
    const cleanPhone = card.phone.replace(/[^\d+*# -]/g, '').trim();
    lines.push(`TEL;TYPE=CELL,VOICE,PREF:${cleanPhone}`);
  }

  if (card.email) {
    lines.push(`EMAIL;TYPE=INTERNET,WORK,PREF:${card.email}`);
  }

  if (card.website) {
    let site = card.website;
    if (!site.startsWith('http://') && !site.startsWith('https://')) {
      site = `https://${site}`;
    }
    lines.push(`URL;TYPE=WORK:${site}`);
  }

  if (card.publicUrl) {
    lines.push(`URL;TYPE=DIGITAL_CARD:${card.publicUrl}`);
  }

  if (card.avatarUrl) {
    lines.push(`PHOTO;VALUE=URI:${card.avatarUrl}`);
  }

  // Social profile fields for iOS / modern address books
  if (card.links && card.links.length > 0) {
    card.links.forEach((l) => {
      const u = l.url.toLowerCase();
      if (u.includes('twitter.com') || u.includes('x.com')) {
        lines.push(`X-SOCIALPROFILE;type=twitter:${l.url}`);
      } else if (u.includes('linkedin.com')) {
        lines.push(`X-SOCIALPROFILE;type=linkedin:${l.url}`);
      } else if (u.includes('instagram.com')) {
        lines.push(`X-SOCIALPROFILE;type=instagram:${l.url}`);
      } else if (u.includes('facebook.com')) {
        lines.push(`X-SOCIALPROFILE;type=facebook:${l.url}`);
      } else if (u.includes('github.com')) {
        lines.push(`X-SOCIALPROFILE;type=github:${l.url}`);
      } else if (u.includes('youtube.com')) {
        lines.push(`X-SOCIALPROFILE;type=youtube:${l.url}`);
      }
    });
  }

  if (card.note) {
    lines.push(`NOTE;CHARSET=UTF-8:${escapeVCardValue(card.note)}`);
  }

  // ISO timestamp of card revision
  lines.push(`REV:${new Date().toISOString()}`);
  lines.push('END:VCARD');

  // Format with RFC-compliant line folding and CRLF
  const formatted = lines.map((l) => foldVCardLine(l)).join('\r\n');
  return formatted;
}

/**
 * Generates and triggers download of a standard .vcf file for any digital business card.
 * Can be called with VCardDetails, UserProfile, or ClientProfile.
 * Allows contacts to be saved directly into phone address books (iOS, Android, macOS, Outlook).
 */
export function downloadVCard(
  target: VCardDetails | UserProfile | ClientProfile,
  optionsOrFilename?: VCardDownloadOptions
): boolean {
  try {
    const options: VCardOptions =
      typeof optionsOrFilename === 'string'
        ? { customFilename: optionsOrFilename }
        : optionsOrFilename || {};

    const vcardContent = generateVCardString(target, options);
    const cardData = extractCardData(target, options);

    // Create UTF-8 encoded Blob with standard MIME type
    const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const baseName =
      options.customFilename ||
      cardData.username ||
      cardData.fullName ||
      'contacto';

    const safeName = baseName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove diacritics
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .replace(/_+/g, '_');

    const filename = `${safeName}.vcf`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up memory
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1500);

    return true;
  } catch (error) {
    console.error('Error generating or downloading standard .vcf file:', error);
    return false;
  }
}

/**
 * Explicit function to generate and download a standard .vcf file for each digital business card
 * so contacts can be saved to address books.
 * Alias of downloadVCard with complete type support.
 */
export function generateAndDownloadVCF(
  target: VCardDetails | UserProfile | ClientProfile,
  options?: VCardOptions
): boolean {
  return downloadVCard(target, options);
}

/**
 * Parses a standard .vcf (vCard 2.1, 3.0, 4.0) text string to extract contact details
 * such as fullName, phone, email, company, jobTitle, and note.
 */
export function parseVCardString(vcfText: string): Partial<VCardDetails> {
  const result: Partial<VCardDetails> = {};
  if (!vcfText) return result;

  const lines = vcfText.split(/\r\n|\r|\n/);
  // Unfold lines
  const unfolded: string[] = [];
  for (const line of lines) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && unfolded.length > 0) {
      unfolded[unfolded.length - 1] += line.slice(1);
    } else {
      unfolded.push(line);
    }
  }

  for (const rawLine of unfolded) {
    const line = rawLine.trim();
    if (!line || line.startsWith('BEGIN:') || line.startsWith('END:') || line.startsWith('VERSION:')) {
      continue;
    }

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const propPart = line.slice(0, colonIndex).toUpperCase();
    const val = line.slice(colonIndex + 1).replace(/\\n/gi, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').trim();

    if (propPart.startsWith('FN')) {
      result.fullName = val;
    } else if (propPart.startsWith('N') && !propPart.startsWith('NOTE') && !result.fullName) {
      const parts = val.split(';').map((p) => p.trim()).filter(Boolean);
      result.fullName = parts.reverse().join(' ');
    } else if (propPart.startsWith('TEL')) {
      result.phone = val;
    } else if (propPart.startsWith('EMAIL')) {
      result.email = val;
    } else if (propPart.startsWith('ORG')) {
      result.company = val.split(';')[0].trim();
    } else if (propPart.startsWith('TITLE') || propPart.startsWith('ROLE')) {
      result.jobTitle = val;
    } else if (propPart.startsWith('URL')) {
      result.website = val;
    } else if (propPart.startsWith('NOTE')) {
      result.note = val;
    }
  }

  return result;
}

