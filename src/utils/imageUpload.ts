/**
 * Image upload and optimization utilities for Profile Avatars and Backgrounds.
 * Compresses images client-side into lightweight high-definition Data URLs
 * that save directly and immediately to Firestore.
 */

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  format?: 'image/jpeg' | 'image/webp' | 'image/png';
}

export const AVATAR_OPTIONS: ImageProcessingOptions = {
  maxWidth: 400,
  maxHeight: 400,
  quality: 0.82,
  format: 'image/jpeg',
};

export const BACKGROUND_OPTIONS: ImageProcessingOptions = {
  maxWidth: 960,
  maxHeight: 720,
  quality: 0.75,
  format: 'image/jpeg',
};

export const CARD_TEMPLATE_OPTIONS: ImageProcessingOptions = {
  maxWidth: 800,
  maxHeight: 1200,
  quality: 0.78,
  format: 'image/jpeg',
};

/**
 * Validates whether the selected file is an image and within acceptable size limits.
 */
export function validateImageFile(file: File, maxSizeBytes = 25 * 1024 * 1024): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No se ha seleccionado ningún archivo.' };
  }

  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'El archivo seleccionado debe ser una imagen válida (JPG, PNG, WEBP, GIF, etc.).' };
  }

  if (file.size > maxSizeBytes) {
    const sizeMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return { valid: false, error: `La imagen excede el límite máximo de ${sizeMb}MB. Por favor selecciona una imagen más liviana.` };
  }

  return { valid: true };
}

/**
 * Reads an image file and processes/compresses it using HTML5 Canvas.
 */
export function processImageFile(file: File, options: ImageProcessingOptions = AVATAR_OPTIONS): Promise<string> {
  return new Promise((resolve, reject) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      reject(new Error(validation.error));
      return;
    }

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        try {
          const maxWidth = options.maxWidth || 800;
          const maxHeight = options.maxHeight || 800;
          let width = img.width;
          let height = img.height;

          // Calculate aspect ratio preserving downscale
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to original data URL if 2D context is unavailable
            resolve(readerEvent.target?.result as string);
            return;
          }

          // Render with smooth scaling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // For PNGs with transparency if requested, keep PNG; otherwise JPEG
          const outputFormat = file.type === 'image/png' && options.format === 'image/png' 
            ? 'image/png' 
            : options.format || 'image/jpeg';

          if (outputFormat === 'image/jpeg') {
            // Fill background with white to avoid black backgrounds behind transparent PNGs
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
          }

          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL(outputFormat, options.quality || 0.85);
          resolve(compressedDataUrl);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        reject(new Error('No se pudo decodificar el archivo de imagen.'));
      };

      if (typeof readerEvent.target?.result === 'string') {
        img.src = readerEvent.target.result;
      } else {
        reject(new Error('Lectura de archivo errónea.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo desde el dispositivo.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Pre-curated background patterns & textures that look stunning for cards
 */
export interface BackgroundPreset {
  id: string;
  name: string;
  category: string;
  type: 'image' | 'gradient';
  url?: string;
  gradient?: string;
  textColor: string;
  cardBg: string;
  accent: string;
}

export const CURATED_BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'mesh-cosmic',
    name: 'Nebulosa Cósmica',
    category: 'Creativo & Moderno',
    type: 'gradient',
    gradient: 'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.4) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(236, 72, 153, 0.35) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(56, 189, 248, 0.3) 0px, transparent 50%), #090d16',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    accent: '#6366f1',
  },
  {
    id: 'dark-luxury',
    name: 'Elegancia Ébano',
    category: 'Corporativo & Lujo',
    type: 'gradient',
    gradient: 'linear-gradient(145deg, #18181b 0%, #09090b 60%, #171210 100%)',
    textColor: '#ffffff',
    cardBg: '#1f1f23',
    accent: '#eab308',
  },
  {
    id: 'emerald-aurora',
    name: 'Aurora Esmeralda',
    category: 'Salud & Bienestar',
    type: 'gradient',
    gradient: 'radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.35) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(14, 165, 233, 0.3) 0%, transparent 45%), #062419',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.1)',
    accent: '#10b981',
  },
  {
    id: 'clean-marble',
    name: 'Mármol Pulido',
    category: 'Minimalista & Estética',
    type: 'gradient',
    gradient: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
    textColor: '#0f172a',
    cardBg: '#ffffff',
    accent: '#0284c7',
  },
  {
    id: 'sunset-amber',
    name: 'Atardecer Dorado',
    category: 'Restaurantes & Estilo',
    type: 'gradient',
    gradient: 'linear-gradient(160deg, #1c100b 0%, #31180d 50%, #150905 100%)',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.1)',
    accent: '#f97316',
  },
];

export interface CardTemplatePreset {
  id: string;
  name: string;
  category: string;
  gradient?: string;
  url?: string;
  textColor: string;
  accent: string;
}

export const CURATED_CARD_TEMPLATES: CardTemplatePreset[] = [
  {
    id: 'tmpl-dark-carbon',
    name: 'Fibra de Carbono',
    category: 'Moderno & Tech',
    gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)',
    textColor: '#ffffff',
    accent: '#38bdf8',
  },
  {
    id: 'tmpl-gold-executive',
    name: 'Oro Ejecutivo',
    category: 'Lujo & Negocios',
    gradient: 'linear-gradient(135deg, #2a2015 0%, #17120c 60%, #3d2f1a 100%)',
    textColor: '#fef08a',
    accent: '#eab308',
  },
  {
    id: 'tmpl-neon-cyber',
    name: 'Gradiente Neón',
    category: 'Creativos & Medios',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #0f172a 100%)',
    textColor: '#ffffff',
    accent: '#ec4899',
  },
  {
    id: 'tmpl-clean-frosted',
    name: 'Cristal Mate',
    category: 'Minimalista',
    gradient: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
    textColor: '#ffffff',
    accent: '#10b981',
  },
];
