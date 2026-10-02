import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  FolderTree,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  Zap,
  Users,
  QrCode,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProfileView } from '../components/ProfileView';
import { UserProfile, LinkItem } from '../types';

export function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, profile, isAdmin } = useAuth();
  const [claimUsername, setClaimUsername] = useState('');

  // If query params are provided (e.g. /?u=alex or /?username=alex), redirect to public profile page
  useEffect(() => {
    const queryUsername =
      searchParams.get('u') ||
      searchParams.get('username') ||
      searchParams.get('profile') ||
      searchParams.get('p');
    if (queryUsername) {
      const clean = queryUsername.trim().replace(/^[@/]+/, '');
      if (clean) {
        navigate(`/${encodeURIComponent(clean)}`, { replace: true });
      }
    }
  }, [searchParams, navigate]);

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = claimUsername.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (currentUser) {
      if (profile?.username) {
        if (isAdmin) {
          navigate('/dashboard');
        } else {
          navigate(`/client/${profile?.assignedProfileId || ''}`);
        }
      } else {
        navigate(`/onboarding?username=${encodeURIComponent(clean)}`);
      }
    } else {
      navigate(`/auth?mode=signup&username=${encodeURIComponent(clean)}`);
    }
  };

  // Demo user data for hero preview
  const demoProfile: UserProfile = {
    uid: 'demo',
    username: 'alexmorgan',
    email: 'alex@design.studio',
    displayName: 'Alex Morgan',
    bio: 'Product Designer & Creative Director ⚡ Building sleek interfaces & minimal tools.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    theme_preferences: {
      bgColor: '#090d16',
      cardBgColor: '#161e2e',
      cardTextColor: '#f8fafc',
      cardBorderColor: '#253248',
      fontStyle: 'sans',
      buttonStyle: 'rounded-lg',
      buttonVariant: 'filled',
      accentColor: '#38bdf8',
    },
    vcard_details: {
      fullName: 'Alex Morgan',
      jobTitle: 'Principal Designer',
      company: 'Studio Form & Light',
      phone: '+1 (555) 234-5678',
      email: 'alex@design.studio',
      website: 'alexmorgan.design',
    },
  };

  const demoLinks: LinkItem[] = [
    {
      id: '1',
      uid: 'demo',
      title: 'Design Portfolio & Case Studies',
      url: 'https://github.com',
      group_name: 'Work & Projects',
      order: 0,
      isActive: true,
    },
    {
      id: '2',
      uid: 'demo',
      title: 'Book a 1-on-1 Mentorship Call',
      url: 'https://calendly.com',
      group_name: 'Work & Projects',
      order: 1,
      isActive: true,
    },
    {
      id: '3',
      uid: 'demo',
      title: 'Follow on Twitter / X (@alexm)',
      url: 'https://twitter.com',
      group_name: 'Socials',
      order: 2,
      isActive: true,
    },
    {
      id: '4',
      uid: 'demo',
      title: 'Instagram Creative Log',
      url: 'https://instagram.com',
      group_name: 'Socials',
      order: 3,
      isActive: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-white">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>Lumen<span className="text-sky-400">.Link</span></span>
          </Link>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <Link
                id="header-dashboard-link"
                to={isAdmin ? '/dashboard' : (profile?.assignedProfileId ? `/client/${profile.assignedProfileId}` : '/client')}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors shadow-sm font-semibold flex items-center gap-1.5"
              >
                <span>{isAdmin ? 'Panel Administrador' : 'Mi Tarjeta Digital'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  id="header-signin-link"
                  to="/auth?mode=signin"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  id="header-signup-link"
                  to="/auth?mode=signup"
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-white text-slate-950 hover:bg-slate-200 transition-colors shadow-sm"
                >
                  Empezar Gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-20 lg:pt-20 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Copy & Claim Input */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-sky-400">
                <Zap className="w-3.5 h-3.5" />
                <span>Tarjeta Digital & Link-in-Bio de Última Generación</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Un solo enlace limpio para <br />
                <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                  compartir todo lo que haces.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Organiza tus enlaces en categorías visuales, personaliza tu diseño a medida y permite que tus clientes y seguidores guarden tu contacto o te llamen directamente con 1 clic.
              </p>

              {/* Username Claim Bar */}
              <form
                id="claim-username-form"
                onSubmit={handleClaim}
                className="max-w-md mx-auto lg:mx-0 p-2 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center gap-2 focus-within:border-sky-500/70 transition-all"
              >
                <div className="flex items-center flex-1 px-3 py-2 w-full text-slate-400">
                  <span className="font-mono text-sm text-slate-500 select-none">lumen.link/</span>
                  <input
                    id="hero-username-input"
                    type="text"
                    value={claimUsername}
                    onChange={(e) => setClaimUsername(e.target.value)}
                    placeholder="tunombre"
                    pattern="[a-zA-Z0-9_-]+"
                    title="Solo caracteres alfanuméricos, guiones y guiones bajos"
                    className="bg-transparent text-white placeholder-slate-600 font-medium text-sm focus:outline-none w-full ml-1"
                  />
                </div>
                <button
                  id="hero-claim-submit-btn"
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 flex-shrink-0 shadow-md shadow-sky-500/25"
                >
                  <span>Reclamar Enlace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Key Highlights */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-slate-800/80">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    <FolderTree className="w-3.5 h-3.5 text-sky-400" />
                    <span>Grupos de Enlaces</span>
                  </div>
                  <p className="text-xs text-slate-400">Organiza por categorías limpias.</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Contacto vCard (.vcf)</span>
                  </div>
                  <p className="text-xs text-slate-400">Exportación directa a teléfonos.</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    <QrCode className="w-3.5 h-3.5 text-amber-400" />
                    <span>Generador QR</span>
                  </div>
                  <p className="text-xs text-slate-400">Tarjetas digitales e impresas.</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Ruta /:username</span>
                  </div>
                  <p className="text-xs text-slate-400">Enlace único reservado.</p>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Device Frame */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[340px] sm:max-w-[360px]">
                {/* Device decorative glow */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 rounded-[48px] blur-2xl -z-10" />

                {/* Smartphone chassis */}
                <div className="relative rounded-[44px] border-[6px] border-slate-800 bg-slate-950 p-2 shadow-2xl overflow-hidden ring-1 ring-slate-700/50">
                  {/* Dynamic Island / speaker notch */}
                  <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-slate-950" />
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-950" />
                  </div>

                  {/* Device screen viewport */}
                  <div className="rounded-[34px] overflow-hidden max-h-[600px] overflow-y-auto no-scrollbar border border-slate-800">
                    <ProfileView profile={demoProfile} links={demoLinks} isPreview={true} />
                  </div>
                </div>

                <div className="text-center mt-3 text-xs text-slate-400">
                  <span>Vista Previa Interactiva &bull; Haz clic en "Guardar Contacto" para probar</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="border-t border-slate-800/80 bg-slate-900/40 py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Diseñado para Negocios, Creadores y Profesionales
              </h2>
              <p className="text-sm sm:text-base text-slate-400">
                Todo lo que necesitas para convertir visitantes en clientes, seguidores y contactos guardados en su teléfono.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Modo Agencia & Clientes</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Administra múltiples clientes (doctores, restaurantes, empresas, creadores) desde un solo panel con enlaces, temas y vCards separados.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4">
                  <QrCode className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Generador de Códigos QR</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Crea códigos QR personalizados para tu tarjeta digital o las de tus clientes. Exporta en PNG de alta resolución (1024px) y vectores SVG listos para imprimir en tarjetas de presentación físicas.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Tarjeta Digital vCard (.vcf)</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Genera una ficha .vcf en el navegador sin dependencias de servidor. Los visitantes descargan e importan Nombre, Teléfono, Puesto y Empresa con un solo clic.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                  <FolderTree className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Agrupación por Categorías</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Organiza tus enlaces en secciones limpias como "Portafolio", "Podcasts" o "Redes Sociales" para una navegación intuitiva y mayor conversión.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors md:col-span-2 lg:col-span-2">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Personalización Visual Completa</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Elige presets curados (Minimal Clean, Charcoal Midnight, Matcha Sage, Neo Brutalist) o personaliza fondos con gradientes, colores de botones, bordes, efectos glassmorphism y tipografías a tu gusto.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Lumen.Link</span>
            <span>&bull;</span>
            <span>Tarjetas Digitales & Link-in-Bio</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth?mode=signin" className="hover:text-slate-300 transition-colors">Iniciar Sesión</Link>
            <Link to="/auth?mode=signup" className="hover:text-slate-300 transition-colors">Empezar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
