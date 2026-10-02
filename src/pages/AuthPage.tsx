import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff, Copy, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, profile, signInWithEmail, signUpWithEmail, sendPasswordReset, signInWithGoogle, loading, isAdmin } = useAuth();

  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const initialUsername = searchParams.get('username') || '';
  const initialEmail = searchParams.get('email') || '';

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEmailAlreadyInUse, setIsEmailAlreadyInUse] = useState(false);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resettingPassword, setResettingPassword] = useState(false);

  // If already logged in, route accordingly
  useEffect(() => {
    if (!loading && currentUser) {
      if (profile?.assignedProfileId) {
        // Direct route to their client portal with their pre-made card!
        navigate(`/client/${profile.assignedProfileId}`);
      } else if (isAdmin) {
        navigate('/dashboard');
      } else if (profile?.username) {
        navigate('/client');
      } else {
        navigate(`/onboarding${initialUsername ? `?username=${encodeURIComponent(initialUsername)}` : ''}`);
      }
    }
  }, [currentUser, profile, loading, isAdmin, navigate, initialUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsEmailAlreadyInUse(false);
    setSubmitting(true);

    try {
      if (mode === 'signup') {
        if (password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres.');
        }
        await signUpWithEmail(email, password);
        // Will be routed to onboarding by the useEffect
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        console.warn('El correo ya se encuentra registrado:', email);
        setIsEmailAlreadyInUse(true);
        setErrorMsg('Ya existe una cuenta registrada con este correo electrónico.');
      } else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        console.warn('Credenciales incorrectas:', email);
        setErrorMsg('Correo electrónico o contraseña incorrectos.');
      } else if (code === 'auth/user-not-found') {
        console.warn('Usuario no encontrado:', email);
        setErrorMsg('No se encontró ninguna cuenta con este correo. Por favor regístrate.');
      } else if (code === 'auth/invalid-email') {
        setErrorMsg('Por favor ingresa un correo electrónico válido.');
      } else if (code === 'auth/weak-password') {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      } else if (code === 'auth/operation-not-allowed') {
        setErrorMsg('El registro con correo y contraseña aún no está activado en la consola de Firebase. Por favor regístrate o inicia sesión usando el botón "Continuar con Google" más abajo.');
      } else if (code === 'auth/network-request-failed') {
        setErrorMsg('Error de conexión de red. Verifica tu acceso a internet.');
      } else {
        console.error('Auth error:', err);
        setErrorMsg(err.message || 'Error de autenticación. Verifica tus credenciales.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMsg('Por favor escribe tu correo electrónico arriba para enviarte el enlace de restablecimiento.');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    setResettingPassword(true);
    try {
      await sendPasswordReset(email);
      setSuccessMsg('¡Enlace enviado! Revisa tu bandeja de entrada para restablecer tu contraseña.');
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setErrorMsg('No existe ninguna cuenta registrada con este correo electrónico.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Por favor ingresa un correo electrónico válido.');
      } else {
        setErrorMsg(err.message || 'No se pudo enviar el correo de restablecimiento.');
      }
    } finally {
      setResettingPassword(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setUnauthorizedDomain(null);
    setSuccessMsg(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google auth error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        setUnauthorizedDomain(domain);
        setErrorMsg(null); // Don't show duplicate red error, amber guide handles it
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(err.message || 'Error al iniciar sesión con Google.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-sky-500 selection:text-white">
      {/* Brand logo link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2.5 font-bold text-2xl tracking-tight text-white mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <span>Lumen<span className="text-sky-400">.Link</span></span>
        </Link>
        <h2 className="text-xl font-bold text-slate-200">
          {mode === 'signup' ? 'Crear cuenta en Lumen.Link' : 'Bienvenido a tu panel'}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {mode === 'signup'
            ? 'Crea tu tarjeta digital, reclama tu enlace y publica en minutos'
            : 'Inicia sesión para gestionar tus enlaces, grupos y tarjeta vCard'}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/90 border border-slate-800 py-8 px-6 sm:px-8 shadow-2xl rounded-3xl backdrop-blur-xl">
          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-slate-950 rounded-xl mb-6 border border-slate-800">
            <button
              id="auth-tab-signin"
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              id="auth-tab-signup"
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-sky-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Registrarse
            </button>
          </div>

          {errorMsg && (
            <div
              id="auth-error-alert"
              className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs leading-relaxed space-y-2.5"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
              {isEmailAlreadyInUse && (
                <div className="pt-2 border-t border-red-500/20 flex items-center justify-between gap-2">
                  <span className="text-slate-300 text-[11px]">¿Deseas iniciar sesión?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMsg(null);
                      setIsEmailAlreadyInUse(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[11px] transition-all shadow-xs flex items-center gap-1"
                  >
                    <span>Ir a Iniciar Sesión</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {unauthorizedDomain && (
            <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-3">
              <div className="flex items-start gap-2 font-semibold text-amber-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Autorizar dominios para Google Sign-In</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-200/90">
                Firebase requiere agregar ambos dominios (desarrollo y vista previa compartida) en la lista de dominios autorizados:
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-xl border border-amber-500/20 font-mono text-[11px] text-amber-100 justify-between">
                  <span className="truncate select-all">ais-dev-44bke3m56lrdlhkirnzrjn-340223326098.us-west2.run.app</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('ais-dev-44bke3m56lrdlhkirnzrjn-340223326098.us-west2.run.app');
                      setCopiedDomain(true);
                      setTimeout(() => setCopiedDomain(false), 2500);
                    }}
                    className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg flex items-center gap-1 font-sans font-semibold text-[10px] transition-all flex-shrink-0"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copiar dev</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-xl border border-amber-500/20 font-mono text-[11px] text-amber-100 justify-between">
                  <span className="truncate select-all">ais-pre-44bke3m56lrdlhkirnzrjn-340223326098.us-west2.run.app</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('ais-pre-44bke3m56lrdlhkirnzrjn-340223326098.us-west2.run.app');
                      setCopiedDomain(true);
                      setTimeout(() => setCopiedDomain(false), 2500);
                    }}
                    className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg flex items-center gap-1 font-sans font-semibold text-[10px] transition-all flex-shrink-0"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copiar pre</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <a
                  href="https://console.firebase.google.com/project/lumen-link-nfc-cards/authentication/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-amber-500/30"
                >
                  <span>Abrir Configuración de Firebase</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <p className="text-[11px] text-slate-400 leading-relaxed text-center">
                  En Firebase: <strong>Authentication &gt; Configuración &gt; Dominios autorizados &gt; Agregar dominio</strong>
                </p>
              </div>

              <div className="pt-2 border-t border-amber-500/20 text-[11px] text-slate-300">
                💡 <strong>Acceso inmediato:</strong> El registro con <strong>Correo y Contraseña</strong> (abajo) funciona sin requerir autorizar dominios.
              </div>
            </div>
          )}

          {successMsg && (
            <div
              id="auth-success-alert"
              className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-400 text-xs leading-relaxed"
            >
              <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="email-input">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300" htmlFor="password-input">
                  Contraseña
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resettingPassword}
                    className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors font-medium"
                  >
                    {resettingPassword ? 'Enviando...' : '¿Olvidaste tu contraseña?'}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : 'Ingresa tu contraseña'}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="auth-submit-button"
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 mt-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Crear Cuenta' : 'Iniciar Sesión'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">or continue with</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          {/* Google Login */}
          <button
            id="google-auth-button"
            type="button"
            onClick={handleGoogleAuth}
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-2.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
