import QRCode from 'qrcode';
import { UserProfile, ClientProfile } from '../types';

export interface QRCodeGeneratorOptions {
  fgColor?: string;
  bgColor?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  width?: number;
  margin?: number;
  includeAvatar?: boolean;
  avatarUrl?: string;
}

/**
 * Generates a Data URL (PNG) of the QR code.
 * If includeAvatar is true and avatarUrl is provided, it composites a circular logo in the center.
 */
export async function generateQRCodeDataURL(
  text: string,
  options: QRCodeGeneratorOptions = {}
): Promise<string> {
  const {
    fgColor = '#0f172a',
    bgColor = '#ffffff',
    errorCorrectionLevel = 'H', // High error correction allows center avatar/logo
    width = 1024,
    margin = 2,
    includeAvatar = false,
    avatarUrl,
  } = options;

  // Generate base QR code to canvas
  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, text, {
    width,
    margin,
    errorCorrectionLevel,
    color: {
      dark: fgColor,
      light: bgColor === 'transparent' ? '#00000000' : bgColor,
    },
  });

  // If center avatar requested and available, composite onto canvas
  if (includeAvatar && avatarUrl) {
    try {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load avatar for QR code'));
          img.src = avatarUrl;
        });

        const logoSize = Math.floor(width * 0.22); // 22% of QR width is safe for error correction 'H'
        const center = width / 2;
        const radius = logoSize / 2;

        ctx.save();
        // Outer border / background shield
        ctx.beginPath();
        ctx.arc(center, center, radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = bgColor === 'transparent' ? '#ffffff' : bgColor;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Clip circle for avatar
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, center - radius, center - radius, logoSize, logoSize);
        ctx.restore();
      }
    } catch {
      // Fallback to plain QR code if avatar loading fails (e.g. CORS)
    }
  }

  return canvas.toDataURL('image/png');
}

/**
 * Generates an SVG string representation of the QR code
 */
export async function generateQRCodeSVG(
  text: string,
  options: QRCodeGeneratorOptions = {}
): Promise<string> {
  const {
    fgColor = '#0f172a',
    bgColor = '#ffffff',
    errorCorrectionLevel = 'M',
    margin = 2,
  } = options;

  return QRCode.toString(text, {
    type: 'svg',
    margin,
    errorCorrectionLevel,
    color: {
      dark: fgColor,
      light: bgColor === 'transparent' ? '#00000000' : bgColor,
    },
  });
}

/**
 * Generates a full Digital Business Card graphic (PNG Data URL)
 * featuring the user/client's branding, avatar, name, title, company,
 * and high-resolution QR code.
 */
export interface DigitalBusinessCardOptions {
  accentColor?: string;
  cardTheme?: 'dark' | 'light' | 'gradient' | 'custom';
  customTemplateUrl?: string; // Uploaded card template / background from device
  templateOpacity?: number;
  customAvatarUrl?: string; // Direct override or uploaded avatar
}

export async function generateDigitalBusinessCardImage(
  profile: UserProfile | ClientProfile,
  profileUrl: string,
  options: DigitalBusinessCardOptions = {}
): Promise<string> {
  const width = 1000;
  const height = 1500;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const {
    accentColor = '#0284c7',
    cardTheme = 'dark',
    customTemplateUrl = profile.theme_preferences?.cardTemplateUrl,
    customAvatarUrl,
  } = options;

  const effectiveAvatarUrl = customAvatarUrl || profile.avatarUrl;

  const displayName = profile.displayName || ('clientName' in profile ? profile.clientName : profile.username);
  const username = profile.username;
  const vcard = profile.vcard_details;
  const jobTitle = vcard?.jobTitle || '';
  const company = vcard?.company || '';

  // Background
  if (cardTheme === 'dark') {
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#090d16');
    bgGradient.addColorStop(0.5, '#0f172a');
    bgGradient.addColorStop(1, '#020617');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
  } else if (cardTheme === 'light') {
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#f8fafc');
    bgGradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
  } else {
    // Gradient theme
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0f172a');
    bgGradient.addColorStop(0.6, '#1e1b4b');
    bgGradient.addColorStop(1, '#0284c7');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
  }

  // Card Inner Frame (Rounded)
  const cardX = 60;
  const cardY = 60;
  const cardW = width - 120;
  const cardH = height - 120;
  const cardRadius = 48;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius);
  ctx.fillStyle = cardTheme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.88)';
  ctx.fill();

  // If a custom template or card background was uploaded from device, render it inside the card frame
  if (customTemplateUrl) {
    try {
      const tmplImg = new Image();
      tmplImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        tmplImg.onload = () => resolve();
        tmplImg.onerror = () => reject();
        tmplImg.src = customTemplateUrl;
      });

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius);
      ctx.clip();

      // Cover scaling
      const hRatio = cardW / tmplImg.width;
      const vRatio = cardH / tmplImg.height;
      const ratio = Math.max(hRatio, vRatio);
      const shiftX = (cardW - tmplImg.width * ratio) / 2;
      const shiftY = (cardH - tmplImg.height * ratio) / 2;

      ctx.drawImage(
        tmplImg,
        0, 0, tmplImg.width, tmplImg.height,
        cardX + shiftX, cardY + shiftY, tmplImg.width * ratio, tmplImg.height * ratio
      );

      // Contrast scrim overlay to keep QR code and text 100% readable
      ctx.fillStyle = cardTheme === 'light'
        ? 'rgba(255, 255, 255, 0.82)'
        : 'rgba(15, 23, 42, 0.82)';
      ctx.fillRect(cardX, cardY, cardW, cardH);
      ctx.restore();
    } catch (e) {
      console.warn('Could not draw custom card template image:', e);
    }
  }

  ctx.lineWidth = 2;
  ctx.strokeStyle = cardTheme === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.15)';
  ctx.stroke();
  ctx.restore();

  // Top Accent Brand Banner
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, 160, [cardRadius, cardRadius, 0, 0]);
  const bannerGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + 160);
  bannerGrad.addColorStop(0, accentColor);
  bannerGrad.addColorStop(1, '#38bdf8');
  ctx.fillStyle = bannerGrad;
  ctx.fill();

  // Brand text on banner
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TARJETA DIGITAL DE CONTACTO', width / 2, cardY + 95);
  ctx.restore();

  // Avatar (Circle)
  const avatarY = cardY + 160;
  const avatarRadius = 75;
  const centerX = width / 2;

  // Outer ring for avatar
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, avatarY, avatarRadius + 6, 0, Math.PI * 2);
  ctx.fillStyle = cardTheme === 'light' ? '#ffffff' : '#0f172a';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.shadowBlur = 0;

  let avatarDrawn = false;
  if (effectiveAvatarUrl) {
    try {
      const avImg = new Image();
      avImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        avImg.onload = () => resolve();
        avImg.onerror = () => reject();
        avImg.src = effectiveAvatarUrl;
      });
      ctx.beginPath();
      ctx.arc(centerX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avImg, centerX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
      avatarDrawn = true;
    } catch {
      avatarDrawn = false;
    }
  }

  if (!avatarDrawn) {
    // Initial letter fallback
    ctx.beginPath();
    ctx.arc(centerX, avatarY, avatarRadius, 0, Math.PI * 2);
    ctx.fillStyle = accentColor;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((displayName || 'U').charAt(0).toUpperCase(), centerX, avatarY);
  }
  ctx.restore();

  // Name
  ctx.save();
  ctx.fillStyle = cardTheme === 'light' ? '#0f172a' : '#ffffff';
  ctx.font = 'bold 44px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(displayName, centerX, avatarY + avatarRadius + 60);

  // Subtitle (Job Title & Company)
  const subtitle = [jobTitle, company].filter(Boolean).join(' • ');
  if (subtitle) {
    ctx.fillStyle = accentColor;
    ctx.font = '600 24px Inter, system-ui, sans-serif';
    ctx.fillText(subtitle, centerX, avatarY + avatarRadius + 100);
  }

  // Username badge
  ctx.fillStyle = cardTheme === 'light' ? '#64748b' : '#94a3b8';
  ctx.font = '500 22px monospace';
  ctx.fillText(`@${username}`, centerX, avatarY + avatarRadius + (subtitle ? 140 : 105));
  ctx.restore();

  // QR Code Generation for Card
  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, profileUrl, {
    width: 480,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });

  // QR Code Box (white card container with subtle shadow)
  const qrBoxSize = 520;
  const qrBoxX = (width - qrBoxSize) / 2;
  const qrBoxY = avatarY + avatarRadius + (subtitle ? 180 : 150);

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 28);
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Draw QR canvas inside
  const qrOffset = (qrBoxSize - 480) / 2;
  ctx.drawImage(qrCanvas, qrBoxX + qrOffset, qrBoxY + qrOffset);
  ctx.restore();

  // Instructions & URL footer
  ctx.save();
  ctx.fillStyle = cardTheme === 'light' ? '#334155' : '#e2e8f0';
  ctx.font = '600 24px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Escanea con la cámara de tu celular', centerX, qrBoxY + qrBoxSize + 55);

  ctx.fillStyle = accentColor;
  ctx.font = 'bold 22px monospace';
  ctx.fillText(profileUrl.replace(/^https?:\/\//, ''), centerX, qrBoxY + qrBoxSize + 95);

  // Footer notes
  ctx.fillStyle = cardTheme === 'light' ? '#94a3b8' : '#64748b';
  ctx.font = '500 18px Inter, system-ui, sans-serif';
  ctx.fillText('Ver enlaces, redes sociales y guardar contacto', centerX, qrBoxY + qrBoxSize + 135);
  ctx.restore();

  return canvas.toDataURL('image/png');
}

/**
 * Downloads a data URL or blob with the given filename
 */
export function downloadFile(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
