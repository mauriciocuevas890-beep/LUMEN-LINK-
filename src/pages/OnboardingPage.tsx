import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Check, X, AlertCircle, ArrowRight, User, Phone, Briefcase, Building, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function OnboardingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, profile, claimUsername, isUsernameAvailable, loading, isAdmin, signOut } = useAuth();

  const initialUsername = searchParams.get('username') || '';

  const [username, setUsername] = useState(initialUsername);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');

  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/auth?mode=signup');
    } else if (!loading && profile?.assignedProfileId) {
      navigate(`/client/${profile.assignedProfileId}`);
    } else if (!loading && profile?.username) {
      if (isAdmin) {
        navigate('/dashboard');
      } else {
        navigate('/client');
      }
    }
  }, [currentUser, profile, loading, isAdmin, navigate]);

  // Real-time username debounced check
  useEffect(() => {
    const raw = username.trim().toLowerCase();
    if (!raw) {
      setIsAvailable(null);
      setFeedback('');
      return;
    }

    if (raw.length < 2) {
      setIsAvailable(false);
      setFeedback('Must be at least 2 characters.');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(raw)) {
      setIsAvailable(false);
      setFeedback('Only letters, numbers, hyphens, and underscores.');
      return;
    }

    const reserved = ['dashboard', 'login', 'signup', 'onboarding', 'settings', 'admin', 'api', 'help', 'app', 'auth'];
    if (reserved.includes(raw)) {
      setIsAvailable(false);
      setFeedback('This username is reserved.');
      return;
    }

    setChecking(true);
    const timer = setTimeout(async () => {
      try {
        const available = await isUsernameAvailable(raw);
        setIsAvailable(available);
        setFeedback(available ? 'Username is available!' : 'Username is already taken.');
      } catch {
        // If live check fails due to network, assume tentatively available if format matches
        setIsAvailable(true);
        setFeedback('Username format is valid.');
      } finally {
        setChecking(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username, isUsernameAvailable]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAvailable === false) {
      setErrorMsg('Please choose an available username before proceeding.');
      return;
    }
    if (username.length < 2) {
      setErrorMsg('Username must be at least 2 characters.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const result = await claimUsername(username, {
      displayName: displayName.trim() || username.trim(),
      bio: bio.trim() || 'Welcome to my links page!',
      vcard_details: {
        fullName: displayName.trim() || username.trim(),
        email: currentUser?.email || '',
        phone: phone.trim(),
        jobTitle: jobTitle.trim(),
        company: company.trim(),
      },
    });

    setSubmitting(false);

    if (result.success) {
      if (isAdmin) {
        navigate('/dashboard');
      } else {
        navigate('/client');
      }
    } else {
      setErrorMsg(result.error || 'Failed to claim username.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 selection:bg-sky-500 selection:text-white">
      {/* Top Bar with Logout option */}
      <div className="max-w-xl mx-auto w-full flex justify-between items-center pb-4">
        <span className="text-xs text-slate-500 font-mono">
          {currentUser?.email ? `Conectado como: ${currentUser.email}` : ''}
        </span>
        {currentUser && (
          <button
            type="button"
            onClick={async () => {
              await signOut();
              navigate('/auth?mode=signin');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 text-xs font-medium transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        )}
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 mx-auto mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Claim Your Unique Lumen.Link</h1>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Your username establishes your permanent public URL and digital business card route.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-slate-900/90 border border-slate-800 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl backdrop-blur-xl">
          {errorMsg && (
            <div
              id="onboarding-error-alert"
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-xs"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleClaimSubmit} className="space-y-6">
            {/* Username claim block */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label htmlFor="onboarding-username-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Choose Your Username <span className="text-sky-400">*</span>
              </label>

              <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-3 focus-within:border-sky-500 transition-all">
                <span className="font-mono text-sm text-slate-500 select-none">lumen.link/</span>
                <input
                  id="onboarding-username-input"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="yourname"
                  className="bg-transparent text-white font-semibold text-sm placeholder-slate-600 focus:outline-none w-full ml-1"
                />
                <div className="flex items-center ml-2">
                  {checking && (
                    <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                  )}
                  {!checking && isAvailable === true && (
                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  {!checking && isAvailable === false && (
                    <div className="flex items-center gap-1 text-red-400 text-xs font-semibold">
                      <X className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              {feedback && (
                <p
                  id="username-feedback"
                  className={`text-xs font-medium ${
                    isAvailable === true ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {feedback}
                </p>
              )}
            </div>

            {/* Profile Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                Profile Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="onboarding-display-name" className="block text-xs font-medium text-slate-300 mb-1">
                    Display Name
                  </label>
                  <input
                    id="onboarding-display-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label htmlFor="onboarding-job-title" className="block text-xs font-medium text-slate-300 mb-1">
                    Job Title / Role
                  </label>
                  <input
                    id="onboarding-job-title"
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Creative Director"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="onboarding-bio" className="block text-xs font-medium text-slate-300 mb-1">
                  Short Bio / Tagline
                </label>
                <textarea
                  id="onboarding-bio"
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your visitors who you are and what you do..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Quick vCard Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Digital Business Card (vCard)
                </h3>
                <span className="text-[11px] text-slate-500">Optional</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="onboarding-phone" className="block text-xs font-medium text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="onboarding-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label htmlFor="onboarding-company" className="block text-xs font-medium text-slate-300 mb-1">
                    Company / Organization
                  </label>
                  <input
                    id="onboarding-company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme Studio"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="onboarding-submit-btn"
              type="submit"
              disabled={submitting || isAvailable !== true}
              className="w-full py-3.5 px-6 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Claim URL & Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
