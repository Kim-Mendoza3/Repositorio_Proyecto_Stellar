/**
 * Register Page
 * Create new account with Passkey
 */

'use client';

import { PasskeyAuth } from '@/components/PasskeyAuth';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4 bg-cover bg-center"
      style={{
  backgroundImage: 'url("https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=1920&h=1080&fit=crop")',
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">¡Crea tu cuenta en Viajes de Estudio MX!</h1>
          <p className="text-white font-semibold drop-shadow-md">Regístrate y accede a programas, intercambios y viajes educativos dentro de México</p>
        </div>

        {/* Info Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20 shadow-lg">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            ¿Qué obtienes al registrarte?
          </h3>
          <ul className="space-y-3 text-base text-white">
            <li className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
              <span className="text-yellow-300 font-bold">✓</span>
              Acceso a financiamiento para viajes dentro de México
            </li>
            <li className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
              <span className="text-yellow-300 font-bold">✓</span>
              Evaluación de elegibilidad en minutos
            </li>
            <li className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
              <span className="text-yellow-300 font-bold">✓</span>
              Seguridad biométrica y Passkeys
            </li>
            <li className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
              <span className="text-yellow-300 font-bold">✓</span>
              Experiencia sin contraseñas
            </li>
          </ul>
        </div>

        {/* Auth Component */}
        <PasskeyAuth />

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <p className="text-white font-semibold text-sm mb-3 drop-shadow-md">¿Ya tienes cuenta?</p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 rounded-lg font-bold hover:from-yellow-300 hover:to-amber-400 transition-all shadow-lg"
          >
            Inicia sesión aquí
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
