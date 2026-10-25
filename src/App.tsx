import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { ProfileSkeleton } from './components/ProfileSkeleton';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ErrorBoundary } from './components/ErrorBoundary';

/**
 * Safe lazy loader with auto-retry and multi-export fallback.
 * Prevents "Failed to fetch dynamically imported module" errors when
 * browser caches stale chunks or when Vite re-indexes modules during development.
 */
function safeLazy<T extends React.ComponentType<any>>(
  factory: () => Promise<any>,
  componentName?: string
) {
  return lazy(async () => {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const mod = await factory();
        // Support both named export and default export
        const Component = componentName
          ? mod[componentName] || mod.default
          : mod.default || (mod[Object.keys(mod)[0]]);

        if (!Component) {
          throw new Error(`Component ${componentName || 'default'} not found in module`);
        }
        return { default: Component as T };
      } catch (err) {
        if (attempt >= maxRetries) {
          console.error(`Failed to load dynamic module after ${maxRetries} attempts:`, err);
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
      }
    }
    throw new Error('Module import failed');
  });
}

// Code-split heavy routes with resilient retry logic
const HomePage = safeLazy(() => import('./pages/HomePage'), 'HomePage');
const AuthPage = safeLazy(() => import('./pages/AuthPage'), 'AuthPage');
const OnboardingPage = safeLazy(() => import('./pages/OnboardingPage'), 'OnboardingPage');
const DashboardPage = safeLazy(() => import('./pages/DashboardPage'), 'DashboardPage');
const ClientPortalPage = safeLazy(() => import('./pages/ClientPortalPage'), 'ClientPortalPage');

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={<ProfileSkeleton />}>
            <Routes>
            {/* Landing / Welcome route */}
            <Route path="/" element={<HomePage />} />

            {/* Authentication route */}
            <Route path="/auth" element={<AuthPage />} />

            {/* New user onboarding and username claiming */}
            <Route path="/onboarding" element={<OnboardingPage />} />

            {/* Private Admin Dashboard (Master view of all client profiles) */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin" element={<DashboardPage />} />

            {/* Client Dedicated Page (Solo su perfil y su información) */}
            <Route path="/client/:clientId" element={<ClientPortalPage />} />
            <Route path="/client" element={<ClientPortalPage />} />
            <Route path="/cliente/:clientId" element={<ClientPortalPage />} />
            <Route path="/cliente" element={<ClientPortalPage />} />
            <Route path="/clientes/:clientId" element={<ClientPortalPage />} />
            <Route path="/clientes" element={<ClientPortalPage />} />
            <Route path="/portal/:clientId" element={<ClientPortalPage />} />
            <Route path="/portal" element={<ClientPortalPage />} />
            <Route path="/perfil/:clientId" element={<ClientPortalPage />} />
            <Route path="/perfil" element={<ClientPortalPage />} />
            <Route path="/c/:clientId" element={<ClientPortalPage />} />
            <Route path="/c" element={<ClientPortalPage />} />

            {/* Public Profile Routes (instant rendering without heavy dashboard bundle) */}
            <Route path="/u/:username" element={<PublicProfilePage />} />
            <Route path="/user/:username" element={<PublicProfilePage />} />
            <Route path="/profile/:username" element={<PublicProfilePage />} />
            <Route path="/p/:username" element={<PublicProfilePage />} />
            <Route path="/@:username" element={<PublicProfilePage />} />
            <Route path="/:username" element={<PublicProfilePage />} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>

        {/* Global PWA install banner & offline indicator */}
        <PWAInstallBanner />
        <OfflineIndicator />
      </BrowserRouter>
    </AuthProvider>
  );
}
