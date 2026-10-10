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

export const BACKGROUND_CATEGORIES = [
  'Todos',
  'Corporativo & Lujo',
  'Tech & Futurista',
  'Minimal & Estética',
  'Gradientes Vibrantes',
  'Texturas & Materiales',
  'Naturaleza & Bienestar',
] as const;

export type BackgroundCategory = typeof BACKGROUND_CATEGORIES[number];

export const CURATED_BACKGROUND_PRESETS: BackgroundPreset[] = [
  // 1. CORPORATIVO & LUJO
  {
    id: 'dark-luxury',
    name: 'Ébano & Oro Real',
    category: 'Corporativo & Lujo',
    type: 'gradient',
    gradient: 'linear-gradient(145deg, #18181b 0%, #09090b 60%, #1a160d 100%)',
    textColor: '#ffffff',
    cardBg: '#1f1f23',
    accent: '#eab308',
  },
  {
    id: 'titanium-obsidian',
    name: 'Titanio Obsidiana',
    category: 'Corporativo & Lujo',
    type: 'gradient',
    gradient: 'linear-gradient(180deg, #1e293b 0%, #0f172a 60%, #020617 100%)',
    textColor: '#ffffff',
    cardBg: '#1e293b',
    accent: '#38bdf8',
  },
  {
    id: 'royal-navy-gold',
    name: 'Azul Marino Imperial',
    category: 'Corporativo & Lujo',
    type: 'gradient',
    gradient: 'radial-gradient(circle at 20% 20%, #1e3a8a 0%, #0f172a 50%, #030712 100%)',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    accent: '#facc15',
  },
  {
    id: 'swiss-graphite',
    name: 'Grafito Suizo Mate',
    category: 'Corporativo & Lujo',
    type: 'gradient',
    gradient: 'linear-gradient(135deg, #27272a 0%, #18181b 50%, #09090b 100%)',
    textColor: '#ffffff',
    cardBg: '#27272a',
    accent: '#f43f5e',
  },
  {
    id: 'emerald-private-banking',
    name: 'Banca Esmeralda & Oro',
    category: 'Corporativo & Lujo',
    type: 'gradient',
    gradient: 'radial-gradient(ellipse at top right, rgba(16, 185, 129, 0.28) 0%, #062419 40%, #02120d 100%)',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    accent: '#eab308',
  },
  {
    id: 'burgundy-velvet',
    name: 'Borgoña & Bronce',
    category: 'Corporativo & Lujo',
    type: 'gradient',
    gradient: 'linear-gradient(150deg, #3b0718 0%, #1f040d 60%, #0a0104 100%)',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.09)',
    accent: '#f59e0b',
  },
  {
    id: 'platinum-executive',
    name: 'Platino Ejecutivo',
    category: 'Corporativo & Lujo',
    type: 'gradient',
    gradient: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)',
    textColor: '#0f172a',
    cardBg: '#ffffff',
    accent: '#0284c7',
  },

  // 2. TECH & FUTURISTA
  {
    id: 'matrix-cyan',
    name: 'Cyber Matrix Cyan',
    category: 'Tech & Futurista',
    type: 'gradient',
    gradient: 'radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.35) 0%, transparent 60%), radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.2) 0%, transparent 50%), #050b14',
    textColor: '#ffffff',
    cardBg: 'rgba(15, 23, 42, 0.85)',
    accent: '#06b6d4',
  },
  {
    id: 'mesh-cosmic',
    name: 'Nebulosa Cósmica',
    category: 'Tech & Futurista',
    type: 'gradient',
    gradient: 'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.4) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(236, 72, 153, 0.35) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(56, 189, 248, 0.3) 0px, transparent 50%), #090d16',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    accent: '#6366f1',
  },
  {
    id: 'quantum-purple',
    name: 'Cuántico Ultra Violeta',
    category: 'Tech & Futurista',
    type: 'gradient',
    gradient: 'radial-gradient(ellipse at 80% 20%, rgba(168, 85, 247, 0.38) 0%, #150826 40%, #090214 100%)',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    accent: '#c084fc',
  },
  {
    id: 'oled-terminal',
    name: 'Terminal OLED Puro',
    category: 'Tech & Futurista',
    type: 'gradient',
    gradient: 'linear-gradient(180deg, #0a0a0a 0%, #000000 100%)',
    textColor: '#ffffff',
    cardBg: '#121212',
    accent: '#22c55e',
  },
  {
    id: 'neon-tokyo',
    name: 'Neón Tokio Glow',
    category: 'Tech & Futurista',
    type: 'gradient',
    gradient: 'linear-gradient(135deg, #2e0854 0%, #16002c 50%, #080010 100%), radial-gradient(at 0% 100%, rgba(236, 72, 153, 0.3) 0px, transparent 50%)',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    accent: '#f43f5e',
  },
  {
    id: 'silicon-cloud',
    name: 'Silicon Valley Night',
    category: 'Tech & Futurista',
    type: 'gradient',
    gradient: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 60%, #0a0f1d 100%)',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    accent: '#38bdf8',
  },

  // 3. MINIMAL & ESTÉTICA
  {
    id: 'clean-marble',
    name: 'Mármol Carrara Pulido',
    category: 'Minimal & Estética',
    type: 'gradient',
    gradient: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
    textColor: '#0f172a',
    cardBg: '#ffffff',
    accent: '#0284c7',
  },
  {
    id: 'nude-linen',
    name: 'Lino & Arena Nórdica',
    category: 'Minimal & Estética',
    type: 'gradient',
    gradient: 'linear-gradient(135deg, #faf5ef 0%, #f3ece2 50%, #e8decb 100%)',
    textColor: '#292524',
    cardBg: '#ffffff',
    accent: '#92400e',
  },
  {
    id: 'matcha-latte',
    name: 'Matcha & Salvia Suave',
    category: 'Minimal & Estética',
    type: 'gradient',
    gradient: 'linear-gradient(140deg, #f2f7f4 0%, #e3ede6 60%, #d4e2d8 100%)',
    textColor: '#14532d',
    cardBg: '#ffffff',
    accent: '#15803d',
  },
  {
    id: 'rose-champagne',
    name: 'Champagne & Seda Rosa',
    category: 'Minimal & Estética',
    type: 'gradient',
    gradient: 'linear-gradient(135deg, #fdf8f6 0%, #fbeee8 50%, #f7dfd4 100%)',
    textColor: '#4c1d38',
    cardBg: '#ffffff',
    accent: '#db2777',
  },
  {
    id: 'japanese-washi',
    name: 'Papel Washi Minimal',
    category: 'Minimal & Estética',
    type: 'gradient',
    gradient: 'linear-gradient(180deg, #fdfcfb 0%, #f7f6f2 100%)',
    textColor: '#1c1917',
    cardBg: '#ffffff',
    accent: '#0284c7',
  },
  {
    id: 'frosted-slate',
    name: 'Vidrio Esmerilado Dark',
    category: 'Minimal & Estética',
    type: 'gradient',
    gradient: 'linear-gradient(145deg, #334155 0%, #1e293b 100%)',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.1)',
    accent: '#38bdf8',
  },

  // 4. GRADIENTES VIBRANTES
  {
    id: 'sunset-amber',
    name: 'Atardecer Dorado Sunset',
    category: 'Gradientes Vibrantes',
    type: 'gradient',
    gradient: 'radial-gradient(circle at 80% 10%, rgba(249, 115, 22, 0.4) 0%, transparent 45%), linear-gradient(160deg, #2b1107 0%, #451a08 40%, #150905 100%)',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.1)',
    accent: '#f97316',
  },
  {
    id: 'emerald-aurora',
    name: 'Aurora Boreal Esmeralda',
    category: 'Gradientes Vibrantes',
    type: 'gradient',
    gradient: 'radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.4) 0%, transparent 45%), radial-gradient(circle at 90% 80%, rgba(14, 165, 233, 0.35) 0%, transparent 45%), #051c14',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.1)',
    accent: '#10b981',
  },
  {
    id: 'deep-abyss',
    name: 'Océano Profundo Abisal',
    category: 'Gradientes Vibrantes',
    type: 'gradient',
    gradient: 'radial-gradient(circle at 50% 100%, rgba(6, 182, 212, 0.28) 0%, transparent 50%), linear-gradient(180deg, #041d38 0%, #021124 50%, #010813 100%)',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    accent: '#38bdf8',
  },
  {
    id: 'hyper-wave',
    name: 'Hyper Wave Neón',
    category: 'Gradientes Vibrantes',
    type: 'gradient',
    gradient: 'radial-gradient(at 100% 0%, rgba(217, 70, 239, 0.38) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(14, 165, 233, 0.38) 0px, transparent 50%), #0f1026',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    accent: '#e879f9',
  },
  {
    id: 'solar-flare',
    name: 'Llamarada Solar Ámbar',
    category: 'Gradientes Vibrantes',
    type: 'gradient',
    gradient: 'radial-gradient(circle at 50% 20%, rgba(239, 68, 68, 0.32) 0%, rgba(234, 88, 12, 0.22) 40%, #120907 80%)',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.09)',
    accent: '#f97316',
  },
  {
    id: 'cotton-candy',
    name: 'Crepúsculo Rosa Místico',
    category: 'Gradientes Vibrantes',
    type: 'gradient',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #3b0764 45%, #0f172a 100%)',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    accent: '#f472b6',
  },

  // 5. TEXTURAS & MATERIALES
  {
    id: 'carbon-fiber-3d',
    name: 'Fibra de Carbono 3D',
    category: 'Texturas & Materiales',
    type: 'gradient',
    gradient: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.04) 0%, transparent 60%), repeating-linear-gradient(45deg, #111317 0px, #111317 2px, #181b22 2px, #181b22 4px), #0e1014',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.07)',
    accent: '#38bdf8',
  },
  {
    id: 'nero-marquina',
    name: 'Mármol Negro & Oro',
    category: 'Texturas & Materiales',
    type: 'gradient',
    gradient: 'radial-gradient(circle at 75% 25%, rgba(234, 179, 8, 0.15) 0%, transparent 50%), linear-gradient(125deg, #121316 0%, #0a0b0d 60%, #17181c 100%)',
    textColor: '#ffffff',
    cardBg: '#18191e',
    accent: '#facc15',
  },
  {
    id: 'leather-black',
    name: 'Cuero Obsidiana Luxe',
    category: 'Texturas & Materiales',
    type: 'gradient',
    gradient: 'radial-gradient(ellipse at center, #1f1f23 0%, #141416 60%, #0a0a0c 100%)',
    textColor: '#ffffff',
    cardBg: '#1d1d21',
    accent: '#d97706',
  },
  {
    id: 'tech-hex-grid',
    name: 'Malla Hexagonal Tech',
    category: 'Texturas & Materiales',
    type: 'gradient',
    gradient: 'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.22) 0%, transparent 70%), linear-gradient(135deg, #090d16 0%, #05070c 100%)',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    accent: '#38bdf8',
  },
  {
    id: 'brushed-steel',
    name: 'Acero Cepillado Dark',
    category: 'Texturas & Materiales',
    type: 'gradient',
    gradient: 'linear-gradient(90deg, #1e2229 0%, #2b303c 30%, #1c2027 60%, #242933 100%)',
    textColor: '#ffffff',
    cardBg: '#1f242d',
    accent: '#60a5fa',
  },

  // 6. NATURALEZA & BIENESTAR
  {
    id: 'bamboo-forest',
    name: 'Bosque de Bambú & Jade',
    category: 'Naturaleza & Bienestar',
    type: 'gradient',
    gradient: 'radial-gradient(ellipse at 30% 20%, rgba(34, 197, 94, 0.32) 0%, #062315 50%, #02120b 100%)',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.09)',
    accent: '#22c55e',
  },
  {
    id: 'terracotta-desert',
    name: 'Desierto Terracota',
    category: 'Naturaleza & Bienestar',
    type: 'gradient',
    gradient: 'linear-gradient(145deg, #3d1c10 0%, #281107 50%, #170903 100%)',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.09)',
    accent: '#ea580c',
  },
  {
    id: 'cenote-turquoise',
    name: 'Cenote Turquesa Maya',
    category: 'Naturaleza & Bienestar',
    type: 'gradient',
    gradient: 'radial-gradient(circle at 50% 20%, rgba(20, 184, 166, 0.38) 0%, #042628 45%, #021214 100%)',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    accent: '#14b8a6',
  },
  {
    id: 'lavender-provence',
    name: 'Lavanda Provenzal Dark',
    category: 'Naturaleza & Bienestar',
    type: 'gradient',
    gradient: 'linear-gradient(150deg, #24143a 0%, #170c26 50%, #0b0514 100%)',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    accent: '#a855f7',
  },
  {
    id: 'olive-groves',
    name: 'Oliva & Tierra Viva',
    category: 'Naturaleza & Bienestar',
    type: 'gradient',
    gradient: 'linear-gradient(135deg, #1f2518 0%, #13170e 60%, #0a0d07 100%)',
    textColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    accent: '#84cc16',
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
  {
    id: 'tmpl-emerald-banking',
    name: 'Esmeralda Banking',
    category: 'Lujo & Negocios',
    gradient: 'linear-gradient(135deg, #062419 0%, #0b3d2b 50%, #02120d 100%)',
    textColor: '#ffffff',
    accent: '#eab308',
  },
  {
    id: 'tmpl-royal-sapphire',
    name: 'Zafiro Real',
    category: 'Moderno & Tech',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 60%, #020617 100%)',
    textColor: '#ffffff',
    accent: '#60a5fa',
  },
  {
    id: 'tmpl-sunset-coral',
    name: 'Coral Atardecer',
    category: 'Creativos & Medios',
    gradient: 'linear-gradient(135deg, #3b1106 0%, #5c1e08 50%, #1c0803 100%)',
    textColor: '#ffffff',
    accent: '#f97316',
  },
  {
    id: 'tmpl-pure-white-luxury',
    name: 'Platino Puro',
    category: 'Minimalista',
    gradient: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 60%, #e2e8f0 100%)',
    textColor: '#0f172a',
    accent: '#0284c7',
  },
];
