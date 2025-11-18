/**
 * Authenticated Dashboard
 * Main landing page after successful login/registration
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import { SessionManager } from '@/lib/session';
import { UserSession } from '@/types/session';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [copied, setCopied] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);

  useEffect(() => {
    const userSession = SessionManager.getSession();
    setSession(userSession);
    
    // Cargar viajes aprobados
    const approvedTrips = JSON.parse(localStorage.getItem('approvedTrips') || '[]');
    setTrips(approvedTrips);
  }, []);

  const handleCopyWallet = () => {
    if (session?.user.walletAddress) {
      navigator.clipboard.writeText(session.user.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    // Limpiar sesión
    SessionManager.clearSession();
    // Limpiar credenciales y wallet del usuario actual
    if (session && session.user && session.user.username) {
      // Eliminar credencial asociada
      const storedCreds = localStorage.getItem('passkey-credentials');
      if (storedCreds) {
        let credentials = JSON.parse(storedCreds);
        credentials = credentials.filter((c: any) => c.username !== session.user.username);
        localStorage.setItem('passkey-credentials', JSON.stringify(credentials));
      }
      // Eliminar wallet asociada
      const walletsRaw = localStorage.getItem('user-wallets');
      if (walletsRaw) {
        let wallets = JSON.parse(walletsRaw);
        delete wallets[session.user.username];
        localStorage.setItem('user-wallets', JSON.stringify(wallets));
      }
    }
    router.push('/');
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative bg-cover bg-center"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop")',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-black/40 to-black/55 -z-10" />
      {/* Header */}
      <header className="relative z-10 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {session.user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7), -1px -1px 2px rgba(255,255,255,0.3)' }}>
                  ¡Hola, {session.user.username}!
                </h1>
                <p className="text-sm text-slate-100 drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Bienvenido al panel de StudyTrips — administra tus viajes y financiamiento</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-8 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>Sesión Activa</h2>
              <p className="text-sm text-yellow-200 drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Autenticado con Passkey</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-sm text-amber-200 font-semibold drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Cuenta Stellar (testnet)</p>
                <p className="font-mono text-sm text-white break-all drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                  {session.user.walletAddress}
                </p>
                <div className="mt-1 text-xs text-sky-100/80 drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Operamos en: <span className="font-semibold">México</span></div>
              </div>
              <button
                onClick={handleCopyWallet}
                className="ml-4 px-3 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 rounded-lg hover:scale-105 transition-transform text-sm flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copiar
                  </>
                )}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-amber-200 mb-1 font-bold drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Usuario</p>
                <p className="font-bold text-white drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{session.user.username}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-amber-200 mb-1 font-bold drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Sesión expira</p>
                <p className="font-bold text-white text-sm drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                  {new Date(session.expiresAt).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-amber-200 mb-1 font-bold drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Rol</p>
                <p className="font-bold text-white drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Estudiante</p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-amber-200 mb-1 font-bold drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Convenio</p>
                <p className="font-bold text-white drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Universidad Nacional (ejemplo)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Solicitar Crédito */}
          <button
            onClick={() => router.push('/ebas-credit')}
            className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl p-6 text-gray-900 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>Solicitar Financiamiento para Viaje</h3>
            <p className="text-white/90 text-sm drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Solicita apoyo económico para tu viaje de estudios; estudia ahora, paga después en condiciones preferenciales.</p>
          </button>

          {/* Historial */}
          <div className="bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 drop-shadow-lg" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>Mis Viajes</h3>
            {trips.length === 0 ? (
              <>
                <p className="text-white/90 text-sm mb-4 drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>No tienes viajes aprobados aún.</p>
                <button
                  onClick={() => router.push('/ebas-credit')}
                  className="px-4 py-2 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-slate-100 transition"
                >
                  Solicitar Viaje
                </button>
              </>
            ) : (
              <div className="space-y-3">
                {trips.map((trip) => (
                  <div key={trip.id} className="bg-white/10 rounded-lg p-3 border border-white/20">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white">{trip.packageName}</h4>
                      <span className="text-xs bg-green-400 text-slate-900 px-2 py-1 rounded-full font-semibold">{trip.status}</span>
                    </div>
                    <p className="text-sm text-white/80 mb-2">Empresa: {trip.companyName}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
                      <div>Costo: ${trip.totalCost.toLocaleString()}</div>
                      <div>Mensualidades: ${trip.monthlyPayment} × {trip.loanTerm}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-300 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-bold text-amber-200 mb-1 drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>🔒 Sesión Segura</h4>
              <p className="text-sm text-white drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Tu sesión está protegida con Passkey. Tus datos biométricos nunca salen de tu dispositivo.</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h4 className="font-bold text-amber-200 mb-1 drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>✈️ Operamos en</h4>
            <p className="text-sm text-white drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Actualmente ofrecemos viajes y convenios dentro de <strong>México</strong>. Pronto ampliaremos destinos.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
            <h4 className="font-bold text-amber-200 drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>¿Necesitas ayuda?</h4>
            <p className="text-sm text-white drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Contacta a un asesor académico para recibir apoyo personalizado en tu postulación y financiamiento.</p>
            <div className="mt-2 flex gap-2">
              <button onClick={() => router.push('/contact')} className="px-3 py-2 bg-amber-500 text-slate-900 rounded-md font-bold drop-shadow-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>Contactar Asesor</button>
              <button onClick={() => router.push('/convenios')} className="px-3 py-2 border border-white/10 rounded-md font-bold text-white drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Ver Convenios</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
