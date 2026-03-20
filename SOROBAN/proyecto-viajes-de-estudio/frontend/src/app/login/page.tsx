/**
 * Login Page with Freighter Wallet Authentication
 * Enhanced authentication flow with Freighter wallet
 */

'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { Wallet, AlertCircle, Loader, CheckCircle, Sparkles, Lock, Globe, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { account, freighterAvailable, isConnecting, connectWallet, error, isCheckingFreighter } = useWallet();
  // Si ya está conectado, guardar sesión y redirigir
  useEffect(() => {
    if (account) {
      // Guardar sesión en localStorage
      localStorage.setItem('walletAddress', account.publicKey);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('loginTime', new Date().toISOString());
      
      // Pequeño delay para mostrar éxito
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    }
  }, [account, router]);

  const handleConnectClick = async () => {
    if (!freighterAvailable) {
      router.push('/wallet-setup');
      return;
    }
    await connectWallet();
  };

  return (
    <div className="min-h-screen relative p-4 overflow-hidden bg-[radial-gradient(circle_at_top_left,_#1e1b4b_0%,_#0f172a_45%,_#020617_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="pointer-events-none absolute -top-24 -left-20 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl animate-drift-slow" />
      <div className="pointer-events-none absolute top-1/4 -right-20 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl animate-drift" />

      <div className="max-w-2xl w-full relative z-10 mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-300/40 bg-cyan-400/10 backdrop-blur mb-5 animate-soft-float">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span className="text-sm font-semibold text-cyan-100">Acceso seguro con wallet</span>
          </div>
          <div className="relative inline-flex w-16 h-16 items-center justify-center bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-cyan-500/30 p-[2px] animate-soft-float">
            <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center">
              <svg viewBox="0 0 64 64" className="w-9 h-9" aria-label="StudyTrips Global logo">
                <path d="M10 41c8 0 15-3 21-8l8-7 14-6-5 10 6 3-7 4-2 8-8-2-6 7c-8 8-19 10-25 7 8-1 12-4 14-8-4 0-8-2-10-8z" fill="#22d3ee" />
                <path d="M14 18c7-8 23-10 34-3" stroke="#93c5fd" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <span className="absolute -inset-1 rounded-2xl border border-cyan-300/40 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Bienvenido a StudyTrips</h1>
          <p className="text-cyan-100 font-semibold text-lg">Inicia sesión con Freighter de forma rápida y segura</p>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2 text-cyan-300"><Lock className="w-4 h-4" /><span>100% Seguro</span></div>
            <div className="flex items-center gap-2 text-sky-300"><Globe className="w-4 h-4" /><span>Red Global</span></div>
            <div className="flex items-center gap-2 text-emerald-300"><Zap className="w-4 h-4" /><span>Instantáneo</span></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Success State - Connected */}
          {account && (
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-8 border border-emerald-400/40 shadow-xl shadow-emerald-500/20 text-center animate-card-enter">
              <div className="mb-4 flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">¡Sesión Iniciada!</h2>
              <p className="text-green-200 mb-4">Tu wallet está conectada correctamente</p>
              <p className="text-sm text-gray-300 break-all font-mono bg-black/30 rounded-lg p-3 mb-4">
                {account.publicKey.slice(0, 10)}...{account.publicKey.slice(-8)}
              </p>
              <p className="text-sm text-gray-300">Redirigiendo al dashboard...</p>
              <div className="mt-4">
                <Loader className="w-5 h-5 animate-spin mx-auto text-stellar" />
              </div>
            </div>
          )}

          {/* Warning - Freighter Not Available */}
          {!account && !freighterAvailable && !isCheckingFreighter && !isConnecting && (
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-8 border border-amber-400/50 shadow-xl shadow-amber-500/20 animate-card-enter">
              <div className="flex items-start gap-4 mb-4">
                <AlertCircle className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Freighter No Detectada</h3>
                  <p className="text-gray-200 mb-4">
                    Para iniciar sesión necesitas tener instalada la extensión Freighter. 
                    Es una wallet segura que protege tus activos en Stellar.
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/wallet-setup')}
                className="btn-gloss btn-amber w-full text-slate-900 font-bold py-3 px-6 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Wallet className="w-5 h-5" />
                Configurar Freighter
              </button>
            </div>
          )}

          {/* Loading - Detecting Freighter */}
          {!account && isCheckingFreighter && (
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-8 border border-blue-400/40 shadow-xl shadow-blue-500/20 text-center animate-card-enter">
              <Loader className="w-8 h-8 animate-spin mx-auto text-blue-400 mb-3" />
              <h2 className="text-lg font-bold text-white mb-2">Detectando Freighter...</h2>
              <p className="text-blue-200 text-sm">Por favor espera mientras se busca tu extensión de wallet</p>
              <p className="text-blue-100 text-xs mt-4 opacity-70">Esto puede tardar hasta 15 segundos</p>
            </div>
          )}

          {/* Main Login Section */}
          {!account && (
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-8 border border-cyan-400/25 shadow-xl shadow-cyan-500/10 animate-card-enter">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-400/15 border border-cyan-300/30"><Wallet className="w-5 h-5 text-cyan-300" /></span>
                Conectar con Freighter
              </h2>
              <p className="text-gray-300 text-sm mb-6">
                Inicia sesión de forma segura usando tu wallet Freighter. Tu dirección será tu identificador único.
              </p>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Connect Button */}
              <button
                onClick={handleConnectClick}
                disabled={isConnecting}
                className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-lg ${
                  isConnecting
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : freighterAvailable
                    ? 'btn-gloss btn-cyan text-slate-950 shadow-lg shadow-cyan-500/30 hover:scale-[1.02]'
                    : 'btn-gloss btn-amber text-slate-900 shadow-lg shadow-amber-500/30 hover:scale-[1.02]'
                }`}
              >
                {isConnecting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Conectando...
                  </>
                ) : freighterAvailable ? (
                  <>
                    <Wallet className="w-5 h-5" />
                    Conectar Wallet Freighter
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    Instalar Freighter
                  </>
                )}
              </button>

              {/* Info Box */}
              <div className="mt-6 bg-cyan-500/10 backdrop-blur-md rounded-xl p-4 border border-cyan-300/30">
                <p className="text-cyan-100 text-sm font-semibold mb-2">¿Cómo funciona?</p>
                <ul className="text-cyan-100/90 text-sm space-y-1">
                  <li>✓ Conecta tu wallet Freighter</li>
                  <li>✓ Tu dirección será tu cuenta</li>
                  <li>✓ Paga viajes directamente desde tu wallet</li>
                  <li>✓ Sin contraseñas, 100% seguro</li>
                </ul>
              </div>
            </div>
          )}

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="group bg-slate-900/60 backdrop-blur-md rounded-xl p-4 border border-white/15 hover:border-cyan-300/50 hover:-translate-y-1 transition-all duration-300">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="text-white font-bold text-sm mb-1">Seguro</h3>
              <p className="text-gray-300 text-xs">Autenticación descentralizada con tu wallet</p>
            </div>
            <div className="group bg-slate-900/60 backdrop-blur-md rounded-xl p-4 border border-white/15 hover:border-cyan-300/50 hover:-translate-y-1 transition-all duration-300">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="text-white font-bold text-sm mb-1">Instantáneo</h3>
              <p className="text-gray-300 text-xs">Acceso inmediato sin verificaciones</p>
            </div>
            <div className="group bg-slate-900/60 backdrop-blur-md rounded-xl p-4 border border-white/15 hover:border-cyan-300/50 hover:-translate-y-1 transition-all duration-300">
              <div className="text-3xl mb-2">💳</div>
              <h3 className="text-white font-bold text-sm mb-1">Pagos XLM</h3>
              <p className="text-gray-300 text-xs">Paga viajes con Stellar XLM</p>
            </div>
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-3">
            <p className="text-gray-300 text-sm">
              ¿Primera vez aquí?{' '}
              <Link href="/wallet-setup" className="text-cyan-300 hover:text-cyan-200 font-semibold">
                Configurar Freighter
              </Link>
            </p>
            <p className="text-gray-400 text-xs">
              Al conectar tu wallet aceptas nuestros{' '}
              <Link href="/terms" className="text-cyan-300 hover:text-cyan-200">
                términos de servicio
              </Link>
            </p>
            <p className="text-gray-300 text-sm">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="btn-gloss btn-electric inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-white font-semibold">
                Regístrate <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .btn-gloss {
          position: relative;
          overflow: hidden;
        }

        .btn-gloss::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 10%, rgba(255,255,255,0.5) 45%, transparent 70%);
          transform: translateX(-130%);
          animation: shine 3.3s ease-in-out infinite;
          pointer-events: none;
        }

        .btn-cyan {
          background: linear-gradient(90deg, #22d3ee 0%, #38bdf8 100%);
        }

        .btn-amber {
          background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
        }

        .btn-electric {
          background: linear-gradient(92deg, #1d4ed8 0%, #2563eb 40%, #38bdf8 100%);
          border: 1px solid rgba(125, 211, 252, 0.55);
        }

        .animate-soft-float {
          animation: softFloat 6s ease-in-out infinite;
        }

        .animate-drift {
          animation: drift 18s ease-in-out infinite;
        }

        .animate-drift-slow {
          animation: drift 24s ease-in-out infinite;
        }

        .animate-card-enter {
          animation: cardEnter 700ms cubic-bezier(.2,.9,.2,1) both;
        }

        @keyframes softFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes drift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(18px, -12px, 0) scale(1.04); }
        }

        @keyframes shine {
          0% { transform: translateX(-120%); }
          45% { transform: translateX(120%); }
          100% { transform: translateX(120%); }
        }

        @keyframes cardEnter {
          0% { opacity: 0; transform: translateY(16px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}





