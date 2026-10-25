import { SupportedLanguage } from '../types';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  flag: string;
  shortLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸', shortLabel: 'ES' },
  { code: 'en', name: 'English', flag: '🇺🇸', shortLabel: 'EN' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', shortLabel: 'PT' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', shortLabel: 'FR' },
];

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  es: {
    // Actions & vCard
    saveContact: 'Guardar Contacto en el Teléfono',
    contactDownloaded: 'Contacto Descargado (.vcf)',
    viewQr: 'Ver Código QR de Tarjeta Digital',
    profileQr: 'Código QR del Perfil',
    vcardHint: 'Importa Nombre, Teléfono, Correo y Empresa directamente a tus contactos',
    share: 'Compartir',
    copied: 'Copiado',
    qrTitle: 'Código QR',
    downloadQr: 'Descargar Código QR',

    // Contact buttons
    call: 'Llamar',
    whatsapp: 'WhatsApp',
    email: 'Correo',
    address: 'Dirección',

    // Links & video
    noLinks: 'No hay enlaces publicados todavía.',
    live: 'EN VIVO',
    video: 'Video',
    liveStream: 'Transmisión en Vivo',
    problemPlaying: '¿Problemas para reproducir?',
    openReel: 'Abrir Reel en Instagram',

    // Modules
    businessHours: 'Horarios de Atención',
    openNow: 'Abierto ahora',
    closedNow: 'Cerrado ahora',
    location: 'Ubicación',
    viewOnMaps: 'Ver en Google Maps',
    copyAddress: 'Copiar Dirección',
    addressCopied: '¡Dirección copiada!',
    bankDetails: 'Datos Bancarios para Transferencia',
    accountNumber: 'Número de Cuenta',
    clabe: 'CLABE / IBAN',
    bank: 'Banco',
    catalog: 'Servicios y Productos',
    inquire: 'Consultar por WhatsApp',
    testimonials: 'Opiniones y Reseñas',
    seeOnGoogle: 'Ver en Google Reviews',
    connectWith: 'Conectar',
    sendMessage: 'Enviar Mensaje',

    // Language
    language: 'Idioma',
    switchLanguage: 'Cambiar idioma',
  },
  en: {
    // Actions & vCard
    saveContact: 'Save Contact to Phone',
    contactDownloaded: 'Contact Downloaded (.vcf)',
    viewQr: 'View Digital Card QR Code',
    profileQr: 'Profile QR Code',
    vcardHint: 'Import Name, Phone, Email & Company directly to your contacts',
    share: 'Share',
    copied: 'Copied',
    qrTitle: 'QR Code',
    downloadQr: 'Download QR Code',

    // Contact buttons
    call: 'Call',
    whatsapp: 'WhatsApp',
    email: 'Email',
    address: 'Directions',

    // Links & video
    noLinks: 'No published links yet.',
    live: 'LIVE',
    video: 'Video',
    liveStream: 'Live Stream',
    problemPlaying: 'Trouble playing?',
    openReel: 'Open Reel in Instagram',

    // Modules
    businessHours: 'Business Hours',
    openNow: 'Open now',
    closedNow: 'Closed now',
    location: 'Location',
    viewOnMaps: 'View on Google Maps',
    copyAddress: 'Copy Address',
    addressCopied: 'Address copied!',
    bankDetails: 'Bank Details for Transfer',
    accountNumber: 'Account Number',
    clabe: 'Routing / IBAN',
    bank: 'Bank',
    catalog: 'Services & Products',
    inquire: 'Inquire on WhatsApp',
    testimonials: 'Reviews & Feedback',
    seeOnGoogle: 'View on Google Reviews',
    connectWith: 'Connect',
    sendMessage: 'Send Message',

    // Language
    language: 'Language',
    switchLanguage: 'Switch language',
  },
  pt: {
    // Actions & vCard
    saveContact: 'Salvar Contato no Telefone',
    contactDownloaded: 'Contato Baixado (.vcf)',
    viewQr: 'Ver Código QR do Cartão Digital',
    profileQr: 'Código QR do Perfil',
    vcardHint: 'Importe Nome, Telefone, E-mail e Empresa direto para seus contatos',
    share: 'Compartilhar',
    copied: 'Copiado',
    qrTitle: 'Código QR',
    downloadQr: 'Baixar Código QR',

    // Contact buttons
    call: 'Ligar',
    whatsapp: 'WhatsApp',
    email: 'E-mail',
    address: 'Endereço',

    // Links & video
    noLinks: 'Nenhum link publicado ainda.',
    live: 'AO VIVO',
    video: 'Vídeo',
    liveStream: 'Transmissão Ao Vivo',
    problemPlaying: 'Problemas para reproduzir?',
    openReel: 'Abrir Reel no Instagram',

    // Modules
    businessHours: 'Horário de Atendimento',
    openNow: 'Aberto agora',
    closedNow: 'Fechado agora',
    location: 'Localização',
    viewOnMaps: 'Ver no Google Maps',
    copyAddress: 'Copiar Endereço',
    addressCopied: 'Endereço copiado!',
    bankDetails: 'Dados Bancários para Transferência',
    accountNumber: 'Número da Conta',
    clabe: 'Chave PIX / IBAN',
    bank: 'Banco',
    catalog: 'Serviços e Produtos',
    inquire: 'Consultar pelo WhatsApp',
    testimonials: 'Avaliações e Opiniões',
    seeOnGoogle: 'Ver no Google Reviews',
    connectWith: 'Conectar',
    sendMessage: 'Enviar Mensagem',

    // Language
    language: 'Idioma',
    switchLanguage: 'Mudar idioma',
  },
  fr: {
    // Actions & vCard
    saveContact: 'Enregistrer le Contact sur le Téléphone',
    contactDownloaded: 'Contact Téléchargé (.vcf)',
    viewQr: 'Voir le Code QR de la Carte Digitale',
    profileQr: 'Code QR du Profil',
    vcardHint: 'Importez Nom, Téléphone, E-mail et Entreprise directement dans vos contacts',
    share: 'Partager',
    copied: 'Copié',
    qrTitle: 'Code QR',
    downloadQr: 'Télécharger le Code QR',

    // Contact buttons
    call: 'Appeler',
    whatsapp: 'WhatsApp',
    email: 'E-mail',
    address: 'Adresse',

    // Links & video
    noLinks: 'Aucun lien publié pour le moment.',
    live: 'EN DIRECT',
    video: 'Vidéo',
    liveStream: 'Diffusion en Direct',
    problemPlaying: 'Problème de lecture ?',
    openReel: 'Ouvrir le Reel sur Instagram',

    // Modules
    businessHours: "Horaires d'Ouverture",
    openNow: 'Ouvert actuellement',
    closedNow: 'Fermé actuellement',
    location: 'Emplacement',
    viewOnMaps: 'Voir sur Google Maps',
    copyAddress: "Copier l'Adresse",
    addressCopied: 'Adresse copiée !',
    bankDetails: 'Coordonnées Bancaires pour Virement',
    accountNumber: 'Numéro de Compte',
    clabe: 'IBAN / BIC',
    bank: 'Banque',
    catalog: 'Services & Produits',
    inquire: 'Se renseigner sur WhatsApp',
    testimonials: 'Avis & Témoignages',
    seeOnGoogle: 'Voir sur Google Reviews',
    connectWith: 'Contacter',
    sendMessage: 'Envoyer un Message',

    // Language
    language: 'Langue',
    switchLanguage: 'Changer de langue',
  },
};

export function t(key: string, lang: SupportedLanguage = 'es'): string {
  const languageDict = TRANSLATIONS[lang] || TRANSLATIONS.es;
  return languageDict[key] || TRANSLATIONS.es[key] || key;
}

// ---------------------------------------------------------------------------
// Standard Group / Section Translations Dictionary
// ---------------------------------------------------------------------------
export const SECTION_TRANSLATIONS: Record<string, Record<SupportedLanguage, string>> = {
  // Contact
  contacto: { es: 'Contacto', en: 'Contact', pt: 'Contato', fr: 'Contact' },
  contact: { es: 'Contacto', en: 'Contact', pt: 'Contato', fr: 'Contact' },
  'información de contacto': { es: 'Información de Contacto', en: 'Contact Info', pt: 'Informações de Contato', fr: 'Coordonnées' },
  'canales de atención': { es: 'Canales de Atención', en: 'Customer Support Channels', pt: 'Canais de Atendimento', fr: 'Canaux d’Assistance' },

  // Social
  'redes sociales': { es: 'Redes Sociales', en: 'Social Media', pt: 'Redes Sociais', fr: 'Réseaux Sociaux' },
  redes: { es: 'Redes Sociales', en: 'Social Media', pt: 'Redes Sociais', fr: 'Réseaux Sociaux' },
  social: { es: 'Redes Sociales', en: 'Social Media', pt: 'Redes Sociais', fr: 'Réseaux Sociaux' },
  'síguenos': { es: 'Síguenos', en: 'Follow Us', pt: 'Siga-nos', fr: 'Suivez-nous' },
  siguenos: { es: 'Síguenos', en: 'Follow Us', pt: 'Siga-nos', fr: 'Suivez-nous' },

  // Services
  servicios: { es: 'Servicios', en: 'Services', pt: 'Serviços', fr: 'Services' },
  services: { es: 'Servicios', en: 'Services', pt: 'Serviços', fr: 'Services' },
  'nuestros servicios': { es: 'Nuestros Servicios', en: 'Our Services', pt: 'Nossos Serviços', fr: 'Nos Services' },
  tratamientos: { es: 'Tratamientos', en: 'Treatments', pt: 'Tratamentos', fr: 'Traitements' },
  especialidades: { es: 'Especialidades', en: 'Specialties', pt: 'Especialidades', fr: 'Spécialités' },

  // Products & Menu
  productos: { es: 'Productos', en: 'Products', pt: 'Produtos', fr: 'Produits' },
  'nuestros productos': { es: 'Nuestros Productos', en: 'Our Products', pt: 'Nossos Produtos', fr: 'Nos Produits' },
  catalogo: { es: 'Catálogo', en: 'Catalog', pt: 'Catálogo', fr: 'Catalogue' },
  catálogo: { es: 'Catálogo', en: 'Catalog', pt: 'Catálogo', fr: 'Catalogue' },
  menu: { es: 'Menú', en: 'Menu', pt: 'Cardápio', fr: 'Menu' },
  menú: { es: 'Menú', en: 'Menu', pt: 'Cardápio', fr: 'Menu' },
  carta: { es: 'Carta / Menú', en: 'Menu', pt: 'Cardápio', fr: 'Carte / Menu' },
  tienda: { es: 'Tienda', en: 'Store', pt: 'Loja', fr: 'Boutique' },
  'tienda online': { es: 'Tienda Online', en: 'Online Store', pt: 'Loja Online', fr: 'Boutique en Ligne' },

  // Location
  ubicacion: { es: 'Ubicación', en: 'Location', pt: 'Localização', fr: 'Emplacement' },
  ubicación: { es: 'Ubicación', en: 'Location', pt: 'Localização', fr: 'Emplacement' },
  direccion: { es: 'Dirección', en: 'Address & Directions', pt: 'Endereço', fr: 'Adresse' },
  dirección: { es: 'Dirección', en: 'Address & Directions', pt: 'Endereço', fr: 'Adresse' },
  'dónde estamos': { es: 'Dónde Estamos', en: 'Where We Are', pt: 'Onde Estamos', fr: 'Où Nous Trouver' },
  'como llegar': { es: 'Cómo Llegar', en: 'How to Arrive', pt: 'Como Chegar', fr: 'Comment Venir' },
  'cómo llegar': { es: 'Cómo Llegar', en: 'How to Arrive', pt: 'Como Chegar', fr: 'Comment Venir' },

  // About
  'sobre nosotros': { es: 'Sobre Nosotros', en: 'About Us', pt: 'Sobre Nós', fr: 'À Propos' },
  'acerca de': { es: 'Acerca de', en: 'About', pt: 'Sobre', fr: 'À Propos' },
  'quiénes somos': { es: 'Quiénes Somos', en: 'Who We Are', pt: 'Quem Somos', fr: 'Qui Sommes-Nous' },
  'mi historia': { es: 'Mi Historia', en: 'My Story', pt: 'Minha História', fr: 'Mon Histoire' },

  // Hours
  horarios: { es: 'Horarios', en: 'Business Hours', pt: 'Horários', fr: 'Horaires' },
  'horarios de atención': { es: 'Horarios de Atención', en: 'Opening Hours', pt: 'Horário de Atendimento', fr: 'Heures d’Ouverture' },

  // Links
  enlaces: { es: 'Enlaces', en: 'Links', pt: 'Links', fr: 'Liens' },
  links: { es: 'Enlaces', en: 'Links', pt: 'Links', fr: 'Liens' },
  'mis enlaces': { es: 'Mis Enlaces', en: 'My Links', pt: 'Meus Links', fr: 'Mes Liens' },
  'enlaces de interés': { es: 'Enlaces de Interés', en: 'Useful Links', pt: 'Links Úteis', fr: 'Liens Utiles' },
  'sitios web': { es: 'Sitios Web', en: 'Websites', pt: 'Websites', fr: 'Sites Internet' },

  // Bookings & Appointments
  reservas: { es: 'Reservas', en: 'Bookings', pt: 'Reservas', fr: 'Réservations' },
  citas: { es: 'Citas', en: 'Appointments', pt: 'Agendamentos', fr: 'Rendez-vous' },
  'agendar cita': { es: 'Agendar Cita', en: 'Book Appointment', pt: 'Agendar Horário', fr: 'Prendre Rendez-vous' },
  reservaciones: { es: 'Reservaciones', en: 'Reservations', pt: 'Reservas', fr: 'Réservations' },

  // Offers
  promociones: { es: 'Promociones', en: 'Promotions', pt: 'Promoções', fr: 'Promotions' },
  ofertas: { es: 'Ofertas Especiales', en: 'Special Offers', pt: 'Ofertas Especiais', fr: 'Offres Spéciales' },
  descuentos: { es: 'Descuentos', en: 'Discounts', pt: 'Descontos', fr: 'Réductions' },

  // Gallery & Media
  galeria: { es: 'Galería', en: 'Gallery', pt: 'Galeria', fr: 'Galerie' },
  galería: { es: 'Galería', en: 'Gallery', pt: 'Galeria', fr: 'Galerie' },
  fotos: { es: 'Fotos', en: 'Photos', pt: 'Fotos', fr: 'Photos' },
  portafolio: { es: 'Portafolio', en: 'Portfolio', pt: 'Portfólio', fr: 'Portfolio' },
  videos: { es: 'Videos', en: 'Videos', pt: 'Vídeos', fr: 'Vidéos' },
  musica: { es: 'Música', en: 'Music', pt: 'Música', fr: 'Musique' },
  música: { es: 'Música', en: 'Music', pt: 'Música', fr: 'Musique' },
  canales: { es: 'Canales', en: 'Channels', pt: 'Canais', fr: 'Chaînes' },

  // Pricing & Reviews
  tarifas: { es: 'Tarifas', en: 'Pricing', pt: 'Preços', fr: 'Tarifs' },
  precios: { es: 'Precios', en: 'Prices', pt: 'Preços', fr: 'Prix' },
  planes: { es: 'Planes', en: 'Plans', pt: 'Planos', fr: 'Formules' },
  testimonios: { es: 'Testimonios', en: 'Testimonials', pt: 'Depoimentos', fr: 'Témoignages' },
  opiniones: { es: 'Opiniones', en: 'Reviews', pt: 'Avaliações', fr: 'Avis' },
  reseñas: { es: 'Reseñas', en: 'Reviews', pt: 'Avaliações', fr: 'Avis' },

  // Downloads & FAQ
  descargas: { es: 'Descargas', en: 'Downloads', pt: 'Downloads', fr: 'Téléchargements' },
  recursos: { es: 'Recursos', en: 'Resources', pt: 'Recursos', fr: 'Ressources' },
  faq: { es: 'Preguntas Frecuentes', en: 'FAQ', pt: 'Perguntas Frequentes', fr: 'FAQ' },
  'preguntas frecuentes': { es: 'Preguntas Frecuentes', en: 'FAQ', pt: 'Perguntas Frequentes', fr: 'FAQ' },
  eventos: { es: 'Próximos Eventos', en: 'Upcoming Events', pt: 'Próximos Eventos', fr: 'Événements à Venir' },
  novedades: { es: 'Novedades', en: 'News & Updates', pt: 'Novidades', fr: 'Nouveautés' },
  noticias: { es: 'Noticias', en: 'Latest News', pt: 'Notícias', fr: 'Actualités' },
  cursos: { es: 'Cursos y Talleres', en: 'Courses & Workshops', pt: 'Cursos e Workshops', fr: 'Formations & Ateliers' },
  talleres: { es: 'Talleres', en: 'Workshops', pt: 'Workshops', fr: 'Ateliers' },
};

/**
 * Translates a section/link-group title based on:
 * 1. User's custom translations configured for this profile
 * 2. Standard built-in dictionary
 * 3. Fallback to original groupName
 */
export function translateSectionName(
  groupName: string,
  lang: SupportedLanguage = 'es',
  customTranslations?: Record<string, Partial<Record<SupportedLanguage, string>>>
): string {
  if (!groupName || !groupName.trim()) return '';
  const trimmed = groupName.trim();

  // 1. Check custom translations set by user for this profile
  if (customTranslations?.[trimmed]?.[lang]) {
    const custom = customTranslations[trimmed][lang];
    if (custom && custom.trim()) return custom.trim();
  }

  // 2. Check built-in standard translations (case-insensitive normalized)
  const normalized = trimmed.toLowerCase();
  if (SECTION_TRANSLATIONS[normalized]?.[lang]) {
    return SECTION_TRANSLATIONS[normalized][lang];
  }

  // 3. Fallback to original group name
  return trimmed;
}

/**
 * Helper to get the translated bio of a profile or client
 */
export function getTranslatedBio(
  profileOrBio: { bio?: string; language?: { bioTranslations?: Partial<Record<SupportedLanguage, string>> }; modules?: { language?: { bioTranslations?: Partial<Record<SupportedLanguage, string>> } } } | string | undefined,
  lang: SupportedLanguage = 'es'
): string {
  if (!profileOrBio) return '';

  if (typeof profileOrBio === 'string') {
    return profileOrBio;
  }

  const customTrans =
    profileOrBio.language?.bioTranslations?.[lang] ||
    profileOrBio.modules?.language?.bioTranslations?.[lang];

  if (customTrans && customTrans.trim().length > 0) {
    return customTrans.trim();
  }

  return profileOrBio.bio || '';
}

/**
 * Smart automatic bio translator for English, Portuguese, and French
 * Translates common business bio structures and vocabulary with high fidelity.
 */
export function autoTranslateBio(text: string, targetLang: SupportedLanguage): string {
  if (!text || !text.trim()) return '';
  if (targetLang === 'es') return text;

  let translated = text;

  if (targetLang === 'en') {
    const enReplacements: [RegExp, string][] = [
      [/\bEspecialistas en\b/gi, 'Specialists in'],
      [/\bEspecialista en\b/gi, 'Specialist in'],
      [/\bExpertos en\b/gi, 'Experts in'],
      [/\bExperto en\b/gi, 'Expert in'],
      [/\bBienvenidos a\b/gi, 'Welcome to'],
      [/\bBienvenido a\b/gi, 'Welcome to'],
      [/\bAtención personalizada\b/gi, 'Personalized customer care'],
      [/\bServicio personalizado\b/gi, 'Personalized service'],
      [/\bServicios profesionales de\b/gi, 'Professional services in'],
      [/\bServicios de\b/gi, 'Services in'],
      [/\bCalidad y confianza\b/gi, 'Quality and trust'],
      [/\bCalidad garantizada\b/gi, 'Guaranteed quality'],
      [/\bMás de (\d+) años de experiencia\b/gi, 'Over $1 years of experience'],
      [/\b(\d+) años de experiencia\b/gi, '$1 years of experience'],
      [/\bContáctanos para más información\b/gi, 'Contact us for more info'],
      [/\bContáctanos\b/gi, 'Contact us'],
      [/\bEscríbenos\b/gi, 'Message us'],
      [/\bSíguenos en nuestras redes\b/gi, 'Follow us on social media'],
      [/\bSíguenos en\b/gi, 'Follow us on'],
      [/\bSíguenos\b/gi, 'Follow us'],
      [/\bVisítanos en\b/gi, 'Visit us at'],
      [/\bVisítanos\b/gi, 'Visit us'],
      [/\bEnvíos a todo el país\b/gi, 'Nationwide shipping available'],
      [/\bEnvíos a domicilio\b/gi, 'Home delivery available'],
      [/\bAgenda tu cita\b/gi, 'Book your appointment today'],
      [/\bAgendar cita\b/gi, 'Book an appointment'],
      [/\bPrevia cita\b/gi, 'By appointment only'],
      [/\bSalud y bienestar\b/gi, 'Health and wellness'],
      [/\bDiseño y desarrollo\b/gi, 'Design and development'],
      [/\bMarketing digital\b/gi, 'Digital marketing'],
      [/\bFotografía profesional\b/gi, 'Professional photography'],
      [/\bOdontología integral\b/gi, 'Comprehensive dental care'],
      [/\bCirugía estética\b/gi, 'Aesthetic surgery'],
      [/\bComida casera\b/gi, 'Homemade food'],
      [/\bCafé de especialidad\b/gi, 'Specialty coffee'],
      [/\bModa y estilo\b/gi, 'Fashion & style'],
      [/\bBienes raíces\b/gi, 'Real estate'],
      [/\bInmobiliaria\b/gi, 'Real estate agency'],
      [/\bAsesoría legal\b/gi, 'Legal advisory'],
      [/\bEntrenamiento personalizado\b/gi, 'Personal fitness training'],
      [/\bAbierto de lunes a viernes\b/gi, 'Open Monday to Friday'],
      [/\bConsulta previa\b/gi, 'Prior consultation'],
      [/\by mucho más\b/gi, 'and much more'],
      [/\bHaz clic abajo\b/gi, 'Click below'],
      [/\bConoce más\b/gi, 'Learn more'],
    ];
    for (const [pattern, repl] of enReplacements) {
      translated = translated.replace(pattern, repl);
    }
  } else if (targetLang === 'pt') {
    const ptReplacements: [RegExp, string][] = [
      [/\bEspecialistas en\b/gi, 'Especialistas em'],
      [/\bEspecialista en\b/gi, 'Especialista em'],
      [/\bExpertos en\b/gi, 'Especialistas em'],
      [/\bExperto en\b/gi, 'Especialista em'],
      [/\bBienvenidos a\b/gi, 'Bem-vindos a'],
      [/\bBienvenido a\b/gi, 'Bem-vindo a'],
      [/\bAtención personalizada\b/gi, 'Atendimento personalizado'],
      [/\bServicio personalizado\b/gi, 'Serviço personalizado'],
      [/\bServicios profesionales de\b/gi, 'Serviços profissionais de'],
      [/\bServicios de\b/gi, 'Serviços de'],
      [/\bCalidad y confianza\b/gi, 'Qualidade e confiança'],
      [/\bCalidad garantizada\b/gi, 'Qualidade garantida'],
      [/\bMás de (\d+) años de experiencia\b/gi, 'Mais de $1 anos de experiência'],
      [/\b(\d+) años de experiencia\b/gi, '$1 anos de experiência'],
      [/\bContáctanos para más información\b/gi, 'Entre em contato para mais informações'],
      [/\bContáctanos\b/gi, 'Entre em contato'],
      [/\bEscríbenos\b/gi, 'Escreva para nós'],
      [/\bSíguenos en nuestras redes\b/gi, 'Siga-nos nas redes sociais'],
      [/\bSíguenos en\b/gi, 'Siga-nos no'],
      [/\bSíguenos\b/gi, 'Siga-nos'],
      [/\bVisítanos en\b/gi, 'Visite-nos em'],
      [/\bVisítanos\b/gi, 'Visite-nos'],
      [/\bEnvíos a todo el país\b/gi, 'Envios para todo o país'],
      [/\bEnvíos a domicilio\b/gi, 'Entregas em domicílio'],
      [/\bAgenda tu cita\b/gi, 'Agende seu horário'],
      [/\bAgendar cita\b/gi, 'Agendar consulta'],
      [/\bPrevia cita\b/gi, 'Com agendamento prévio'],
      [/\bSalud y bienestar\b/gi, 'Saúde e bem-estar'],
      [/\bDiseño y desarrollo\b/gi, 'Design e desenvolvimento'],
      [/\bMarketing digital\b/gi, 'Marketing digital'],
      [/\bFotografía profesional\b/gi, 'Fotografia profissional'],
      [/\bOdontología integral\b/gi, 'Odontologia integral'],
      [/\bComida casera\b/gi, 'Comida caseira'],
      [/\bCafé de especialidad\b/gi, 'Café especial'],
      [/\bModa y estilo\b/gi, 'Moda e estilo'],
      [/\bBienes raíces\b/gi, 'Imóveis'],
      [/\bInmobiliaria\b/gi, 'Imobiliária'],
      [/\bAsesoría legal\b/gi, 'Assessoria jurídica'],
      [/\bEntrenamiento personalizado\b/gi, 'Treinamento personalizado'],
      [/\by mucho más\b/gi, 'e muito mais'],
      [/\bHaz clic abajo\b/gi, 'Clique abaixo'],
      [/\bConoce más\b/gi, 'Saiba mais'],
    ];
    for (const [pattern, repl] of ptReplacements) {
      translated = translated.replace(pattern, repl);
    }
  } else if (targetLang === 'fr') {
    const frReplacements: [RegExp, string][] = [
      [/\bEspecialistas en\b/gi, 'Spécialistes en'],
      [/\bEspecialista en\b/gi, 'Spécialiste en'],
      [/\bExpertos en\b/gi, 'Experts en'],
      [/\bExperto en\b/gi, 'Expert en'],
      [/\bBienvenidos a\b/gi, 'Bienvenue chez'],
      [/\bBienvenido a\b/gi, 'Bienvenue chez'],
      [/\bAtención personalizada\b/gi, 'Service client personnalisé'],
      [/\bServicio personalizado\b/gi, 'Service sur mesure'],
      [/\bServicios profesionales de\b/gi, 'Services professionnels de'],
      [/\bServicios de\b/gi, 'Services de'],
      [/\bCalidad y confianza\b/gi, 'Qualité et confiance'],
      [/\bCalidad garantizada\b/gi, 'Qualité garantie'],
      [/\bMás de (\d+) años de experiencia\b/gi, 'Plus de $1 ans d’expérience'],
      [/\b(\d+) años de experiencia\b/gi, '$1 ans d’expérience'],
      [/\bContáctanos para más información\b/gi, 'Contactez-nous pour plus d’informations'],
      [/\bContáctanos\b/gi, 'Contactez-nous'],
      [/\bEscríbenos\b/gi, 'Écrivez-nous'],
      [/\bSíguenos en nuestras redes\b/gi, 'Suivez-nous sur nos réseaux'],
      [/\bSíguenos en\b/gi, 'Suivez-nous sur'],
      [/\bSíguenos\b/gi, 'Suivez-nous'],
      [/\bVisítanos en\b/gi, 'Rendez-nous visite à'],
      [/\bVisítanos\b/gi, 'Venez nous voir'],
      [/\bEnvíos a todo el país\b/gi, 'Livraison dans tout le pays'],
      [/\bEnvíos a domicilio\b/gi, 'Livraison à domicile'],
      [/\bAgenda tu cita\b/gi, 'Prenez rendez-vous'],
      [/\bAgendar cita\b/gi, 'Prendre un rendez-vous'],
      [/\bPrevia cita\b/gi, 'Sur rendez-vous uniquement'],
      [/\bSalud y bienestar\b/gi, 'Santé et bien-être'],
      [/\bDiseño y desarrollo\b/gi, 'Design et développement'],
      [/\bMarketing digital\b/gi, 'Marketing digital'],
      [/\bFotografía profesional\b/gi, 'Photographie professionnelle'],
      [/\bOdontología integral\b/gi, 'Soins dentaires complets'],
      [/\bComida casera\b/gi, 'Cuisine faite maison'],
      [/\bCafé de especialidad\b/gi, 'Café de spécialité'],
      [/\bModa y estilo\b/gi, 'Mode et style'],
      [/\bBienes raíces\b/gi, 'Immobilier'],
      [/\bInmobiliaria\b/gi, 'Agence immobilière'],
      [/\bAsesoría legal\b/gi, 'Conseil juridique'],
      [/\bEntrenamiento personalizado\b/gi, 'Coaching sportif personnalisé'],
      [/\by mucho más\b/gi, 'et bien plus encore'],
      [/\bHaz clic abajo\b/gi, 'Cliquez ci-dessous'],
      [/\bConoce más\b/gi, 'En savoir plus'],
    ];
    for (const [pattern, repl] of frReplacements) {
      translated = translated.replace(pattern, repl);
    }
  }

  return translated;
}
