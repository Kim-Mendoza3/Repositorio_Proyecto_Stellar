/**
 * Login Page
 * Authenticate with existing Passkey
 */

'use client';

import { PasskeyAuth } from '@/components/PasskeyAuth';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div 
      className="min-h-screen relative flex items-center justify-center p-4 bg-cover bg-center"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop")',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/50 z-0"></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl mb-4 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m5.506 0C15.009 17.799 16 14.517 16 11m-6-1a4 4 0 11-8 0 4 4 0 018 0zm0 0a4 4 0 110 8 4 4 0 010-8zm-7 4a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">¡Bienvenido!</h1>
          <p className="text-white font-semibold drop-shadow-md">Accede a tu cuenta Viajes de Estudio MX con tu Passkey biométrico</p>
        </div>

        {/* Info Banner */}
        <div className="bg-yellow-400/20 backdrop-blur-md rounded-xl p-4 mb-6 border border-yellow-300/40 shadow-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-white text-sm font-semibold drop-shadow-sm">
              Usa tu biometría (huella, cara o PIN) para acceder de forma segura a tu solicitud de viaje.
            </p>
          </div>
        </div>

  {/* Componente de autenticación */}
  <PasskeyAuth />

        {/* Enlaces de pie de página */}
        <div className="mt-6 text-center">
          <p className="text-white font-semibold text-sm mb-3 drop-shadow-md">
            ¿Aún no te has registrado?
          </p>
          <Link
            href="/register"
            className="inline-block px-6 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 rounded-lg font-bold hover:from-yellow-300 hover:to-amber-400 transition-colors shadow-lg"
          >
            Crear cuenta nueva
          </Link>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-yellow-300 hover:text-yellow-100 text-sm font-bold drop-shadow-md"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
