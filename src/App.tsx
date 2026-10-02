import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientPortalPage } from './pages/ClientPortalPage';
import { PublicProfilePage } from './pages/PublicProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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

          {/* Public Profile Routes */}
          <Route path="/u/:username" element={<PublicProfilePage />} />
          <Route path="/user/:username" element={<PublicProfilePage />} />
          <Route path="/profile/:username" element={<PublicProfilePage />} />
          <Route path="/p/:username" element={<PublicProfilePage />} />
          <Route path="/@:username" element={<PublicProfilePage />} />
          <Route path="/:username" element={<PublicProfilePage />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
