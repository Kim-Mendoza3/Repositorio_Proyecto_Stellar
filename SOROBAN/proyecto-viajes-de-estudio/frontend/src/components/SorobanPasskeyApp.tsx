'use client';

import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';
import AdvancedPasskeyDemo from './AdvancedPasskeyDemo';

type AppView = 'landing' | 'auth' | 'dashboard';

interface PasskeyData {
  credentialId: string;
  publicKey: string;
  accountAddress?: string;
  deviceInfo?: string;
  username?: string;
}

const SorobanPasskeyApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [loading, setLoading] = useState(true);

  // MCP: Verificar si hay sesión oficial al cargar la aplicación
  useEffect(() => {
    const checkMcpSession = () => {
      try {
        const { SessionManager } = require('@/lib/session');
        const session = SessionManager.getSession();
        if (session && session.authenticated && session.user) {
          setCurrentView('dashboard');
        }
      } catch (error) {
        console.warn('Error loading MCP session:', error);
      } finally {
        setLoading(false);
      }
    };
    checkMcpSession();
  }, []);

  // Manejar el éxito en la autenticación/registro
  const handleAuthSuccess = () => {
    setCurrentView('dashboard');
  };

  // Manejar cerrar sesión
  const handleLogout = () => {
    const { SessionManager } = require('@/lib/session');
    SessionManager.clearSession();
    setCurrentView('landing');
  };

  // Navegar a la vista de autenticación
  const handleStartSession = () => {
    setCurrentView('auth');
  };

  // Navegar de vuelta al landing
  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  // Mostrar loading mientras se verifica la sesión
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  // Renderizar la vista correspondiente
  switch (currentView) {
    case 'landing':
      return <LandingPage onStartSession={handleStartSession} />;
    case 'auth':
      return (
        <AdvancedPasskeyDemo 
          onSuccess={handleAuthSuccess}
          onBack={handleBackToLanding}
        />
      );
    case 'dashboard': {
      // MCP: Leer datos de sesión oficial
      const { SessionManager } = require('@/lib/session');
      const session = SessionManager.getSession();
      if (!session || !session.user) return null;
      return (
        <Dashboard 
          passkeyData={session.user}
          onLogout={handleLogout}
          onAuthenticate={() => {
            // Aquí podrías implementar una nueva autenticación
            console.log('Initiating new authentication...');
          }}
        />
      );
    }
    default:
      return <LandingPage onStartSession={handleStartSession} />;
  }
};

export default SorobanPasskeyApp;