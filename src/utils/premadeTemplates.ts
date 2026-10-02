import { ThemePreferences, VCardDetails } from '../types';
import { THEME_PRESETS } from './themePresets';

export interface PremadeTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  iconName: string;
  theme: ThemePreferences;
  defaultBio: string;
  defaultJobTitle: string;
  defaultLinks: {
    title: string;
    url: string;
    group_name: string;
  }[];
}

export const PREMADE_PROFILE_TEMPLATES: PremadeTemplate[] = [
  {
    id: 'corporate',
    name: 'Corporativo & Negocios',
    category: 'Empresarial',
    description: 'Ideal para consultores, directores, ejecutivos y agencias.',
    iconName: 'Briefcase',
    theme: THEME_PRESETS[1].theme, // Elegant Slate / Indigo
    defaultBio: 'Consultoría estratégica, soluciones empresariales y proyectos de innovación.',
    defaultJobTitle: 'Director General / Consultor',
    defaultLinks: [
      {
        title: 'WhatsApp Directo • Consultas',
        url: 'https://wa.me/5215500000000',
        group_name: 'Contacto Inmediato',
      },
      {
        title: 'Agendar Reunión (Calendly / Meet)',
        url: 'https://calendly.com',
        group_name: 'Contacto Inmediato',
      },
      {
        title: 'Sitio Web Oficial',
        url: 'https://miempresa.com',
        group_name: 'Canales Oficiales',
      },
      {
        title: 'Perfil Profesional en LinkedIn',
        url: 'https://linkedin.com',
        group_name: 'Canales Oficiales',
      },
      {
        title: 'Enviar Correo Corporativo',
        url: 'mailto:contacto@miempresa.com',
        group_name: 'Canales Oficiales',
      },
    ],
  },
  {
    id: 'health',
    name: 'Médico & Salud',
    category: 'Salud',
    description: 'Diseñado para doctores, dentistas, psicólogos y clínicas.',
    iconName: 'HeartPulse',
    theme: THEME_PRESETS[4].theme, // Clean Emerald / Teal
    defaultBio: 'Atención médica especializada, diagnóstico clínico y cuidado integral de tu salud.',
    defaultJobTitle: 'Especialista Médico',
    defaultLinks: [
      {
        title: 'Agendar Cita Médica por WhatsApp',
        url: 'https://wa.me/5215500000000',
        group_name: 'Citas & Urgencias',
      },
      {
        title: 'Urgencias Médicas • Llamada Directa',
        url: 'tel:+5215500000000',
        group_name: 'Citas & Urgencias',
      },
      {
        title: 'Ubicación del Consultorio (Google Maps)',
        url: 'https://maps.google.com',
        group_name: 'Información del Consultorio',
      },
      {
        title: 'Tratamientos & Especialidades',
        url: 'https://clinicamedica.com',
        group_name: 'Información del Consultorio',
      },
      {
        title: 'Perfil en Doctoralia / Reseñas',
        url: 'https://doctoralia.com',
        group_name: 'Información del Consultorio',
      },
    ],
  },
  {
    id: 'restaurant',
    name: 'Restaurante & Gastronomía',
    category: 'Restaurante',
    description: 'Perfecto para cafeterías, bares, chefs y restaurantes.',
    iconName: 'Utensils',
    theme: THEME_PRESETS[2].theme, // Sunset / Warm Amber
    defaultBio: 'Cocina de autor, ingredientes frescos y experiencias culinarias inolvidables.',
    defaultJobTitle: 'Restaurante & Experiencias',
    defaultLinks: [
      {
        title: 'Ver Menú Digital & Carta',
        url: 'https://restaurante.com/menu',
        group_name: 'Nuestra Carta',
      },
      {
        title: 'Hacer Pedido a Domicilio (WhatsApp)',
        url: 'https://wa.me/5215500000000',
        group_name: 'Pedidos & Reservas',
      },
      {
        title: 'Reservar Mesa',
        url: 'https://wa.me/5215500000000',
        group_name: 'Pedidos & Reservas',
      },
      {
        title: 'Síguenos en Instagram (@fotos)',
        url: 'https://instagram.com',
        group_name: 'Redes Sociales',
      },
      {
        title: 'Cómo Llegar (Google Maps / Waze)',
        url: 'https://maps.google.com',
        group_name: 'Ubicación',
      },
    ],
  },
  {
    id: 'creator',
    name: 'Creador & Redes Sociales',
    category: 'Creador',
    description: 'Optimizado para influencers, streamers, artistas y creadores.',
    iconName: 'Sparkles',
    theme: THEME_PRESETS[3].theme, // Cyber Neon / Violet
    defaultBio: 'Creador de contenido digital, podcasts y proyectos creativos.',
    defaultJobTitle: 'Creador Digital & Artista',
    defaultLinks: [
      {
        title: 'Instagram Oficial',
        url: 'https://instagram.com',
        group_name: 'Mis Redes Principales',
      },
      {
        title: 'TikTok (@videos)',
        url: 'https://tiktok.com',
        group_name: 'Mis Redes Principales',
      },
      {
        title: 'Canal de YouTube • Nuevos Videos',
        url: 'https://youtube.com',
        group_name: 'Contenido en Video',
      },
      {
        title: 'Escúchame en Spotify / Podcast',
        url: 'https://spotify.com',
        group_name: 'Música & Podcast',
      },
      {
        title: 'Contacto para Marcas & Colaboraciones',
        url: 'mailto:manager@creador.com',
        group_name: 'Negocios',
      },
    ],
  },
  {
    id: 'realestate',
    name: 'Inmobiliaria & Bienes Raíces',
    category: 'Inmobiliaria',
    description: 'Para agentes de bienes raíces, brokers y constructoras.',
    iconName: 'Building',
    theme: THEME_PRESETS[0].theme, // Modern Minimal Dark
    defaultBio: 'Asesoría inmobiliaria profesional para comprar, vender o rentar tu propiedad.',
    defaultJobTitle: 'Asesor Inmobiliario Senior',
    defaultLinks: [
      {
        title: 'Consultar Propiedades Disponibles',
        url: 'https://wa.me/5215500000000',
        group_name: 'Atención Inmediata',
      },
      {
        title: 'Catálogo de Casas & Departamentos',
        url: 'https://inmobiliaria.com',
        group_name: 'Catálogo',
      },
      {
        title: 'Solicitar Valuación de mi Propiedad',
        url: 'https://wa.me/5215500000000',
        group_name: 'Servicios',
      },
      {
        title: 'Llamar al Asesor Directamente',
        url: 'tel:+5215500000000',
        group_name: 'Atención Inmediata',
      },
    ],
  },
  {
    id: 'blank',
    name: 'Personalizado / En Blanco',
    category: 'General',
    description: 'Empieza sin enlaces predefinidos para diseñarlo a tu medida.',
    iconName: 'Plus',
    theme: THEME_PRESETS[0].theme,
    defaultBio: '',
    defaultJobTitle: '',
    defaultLinks: [],
  },
];
