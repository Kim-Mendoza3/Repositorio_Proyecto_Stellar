'use client';

import React from 'react';

interface LandingPageProps {
  onStartSession: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartSession }) => {
  return (
  <div 
    className="min-h-screen relative bg-cover bg-center"
    style={{
      backgroundImage: 'url("https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop")',
      backgroundAttachment: 'fixed'
    }}
  >
    {/* Dark overlay for text visibility */}
    <div className="absolute inset-0 bg-black/40 z-0"></div>
      {/* Navigation Header */}
      <nav className="relative z-10 px-6 pt-6">
        <div className="mx-auto max-w-7xl flex items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🇲🇽</span>
            </div>
            <span className="text-white font-bold text-xl drop-shadow-lg">Viajes de Estudio MX</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 pt-20 pb-16">
        <div className="mx-auto max-w-4xl text-center">
          {/* Main Headline */}
          <div className="mb-8">
            <div className="text-6xl mb-4">🎒</div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
              Viajes de Estudio en México
              <span className="block bg-gradient-to-r from-yellow-300 to-amber-300 bg-clip-text text-transparent drop-shadow-xl">
                ¡Financia tu experiencia educativa!
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
              Acceso a financiamiento para programas de viaje, intercambio y educación en todo México. Identidad segura con Passkeys y transacciones en Stellar testnet.
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto">
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
              <div className="text-3xl font-bold text-yellow-300 mb-1">≤5 min</div>
              <div className="text-sm text-white font-semibold">Aprobación</div>
            </div>
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
              <div className="text-3xl font-bold text-yellow-300 mb-1">3-12%</div>
              <div className="text-sm text-white font-semibold">Tasa Anual</div>
            </div>
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
              <div className="text-3xl font-bold text-yellow-300 mb-1">$500-10K</div>
              <div className="text-sm text-white font-semibold">Límite de Crédito</div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mb-16">
            <button
              onClick={onStartSession}
              className="group relative px-8 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 text-lg font-bold rounded-xl shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <span>Solicitar Financiamiento</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
            </button>
            <p className="text-sm text-white font-semibold mt-3 drop-shadow-lg">✓ Autenticación segura ✓ Roles: Estudiantes, Instituciones, Agencias</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-6 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Análisis de Crédito Inteligente</h3>
              <p className="text-blue-100 leading-relaxed">
                Evaluamos tu perfil académico, ingresos familiares y experiencia en programas de intercambio para determinar tu elegibilidad de financiamiento.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Aprobación Instantánea</h3>
              <p className="text-blue-100 leading-relaxed">
                Recibe respuesta en segundos usando smart contracts en Stellar Soroban. Transacciones simuladas y confirmación inmediata en tu dashboard.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Seguridad Biométrica</h3>
              <p className="text-blue-100 leading-relaxed">
                Protección con Windows Hello, FaceID o llaves de seguridad físicas. Tu identidad criptográfica nunca abandona tu dispositivo.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative z-10 px-6 pb-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            ¿Cómo Funciona? <span className="text-teal-400">Solo 3 Pasos</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative text-center">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Completa tu Perfil</h3>
              <p className="text-blue-100 leading-relaxed">
                Proporciona información sobre tu institución académica, destino de viaje y necesidades de financiamiento de forma segura.
              </p>
              <div className="absolute -right-4 top-8 hidden md:block">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="bg-gradient-to-r from-amber-500 to-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Obtén tu Calificación</h3>
              <p className="text-blue-100 leading-relaxed">
                Nuestro algoritmo evalúa tu elegibilidad de forma inmediata considerando tu historial académico, situación económica y programas previos.
              </p>
              <div className="absolute -right-4 top-8 hidden md:block">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">¡Viaja!</h3>
              <p className="text-blue-100 leading-relaxed">
                Si calificas (puntuación ≥750), recibe tu financiamiento confirmado y comienza tu experiencia educativa internacional.
              </p>
            </div>
          </div>
          
          {/* Supported Programs */}
          <div className="mt-16 text-center">
            <h3 className="text-lg font-semibold text-blue-200 mb-8">Programas Soportados</h3>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <span className="text-white font-medium">🎓 Intercambio Académico</span>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <span className="text-white font-medium">� Viajes de Investigación</span>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <span className="text-white font-medium">� Cursos en el Extranjero</span>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <span className="text-white font-medium">🏆 Conferencias Internacionales</span>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <span className="text-white font-medium">🤝 Voluntariado Global</span>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <span className="text-white font-medium">🔬 Trabajo de Campo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="relative z-10 px-6 pb-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">
            Impulsado por <span className="text-amber-400">Tecnología Blockchain</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Tech Icons */}
            <div className="flex flex-col items-center space-y-3 group">
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all">
                <span className="text-2xl">🌐</span>
              </div>
              <span className="text-blue-200 font-medium">WebAuthn</span>
            </div>
            
            <div className="flex flex-col items-center space-y-3 group">
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all">
                <span className="text-2xl">⭐</span>
              </div>
              <span className="text-blue-200 font-medium">Stellar</span>
            </div>
            
            <div className="flex flex-col items-center space-y-3 group">
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all">
                <span className="text-2xl">🚀</span>
              </div>
              <span className="text-blue-200 font-medium">Soroban</span>
            </div>
            
            <div className="flex flex-col items-center space-y-3 group">
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all">
                <span className="text-2xl">🔒</span>
              </div>
              <span className="text-blue-200 font-medium">Privacidad</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-300 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-pulse delay-500"></div>
      </div>
    </div>
  );
};

export default LandingPage;