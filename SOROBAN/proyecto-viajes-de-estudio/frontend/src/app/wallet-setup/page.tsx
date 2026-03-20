'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, CheckCircle, AlertCircle, Loader, Sparkles, Lock, Globe, Zap, RefreshCw, ExternalLink } from 'lucide-react';

export default function WalletSetupPage() {
  const router = useRouter();
  const [freighterDetected, setFreighterDetected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Verificar periódicamente si Freighter está instalada
  useEffect(() => {
    const checkFreighter = async () => {
      setIsChecking(true);
      for (let i = 0; i < 30; i++) {
        if ((window as any).freighter) {
          setFreighterDetected(true);
          // Redirigir después de 2 segundos
          setTimeout(() => {
            router.push('/login');
          }, 2000);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      setIsChecking(false);
    };

    checkFreighter();
  }, [router]);

  return (
    <div className="min-h-screen relative p-4 overflow-hidden bg-[radial-gradient(circle_at_top_left,_#1e1b4b_0%,_#0f172a_45%,_#020617_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="pointer-events-none absolute -top-24 -left-20 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl animate-drift-slow" />
      <div className="pointer-events-none absolute top-1/4 -right-20 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl animate-drift" />

      <div className="max-w-3xl w-full relative z-10 mx-auto py-8">
        {/* Freighter Detected */}
        {freighterDetected && (
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-8 border border-emerald-400/40 shadow-xl shadow-emerald-500/20 text-center animate-card-enter">
            <div className="mb-4 flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">¡Freighter detectada!</h2>
            <p className="text-green-200 mb-4">Hemos detectado tu extensión Freighter instalada correctamente.</p>
            <p className="text-sm text-gray-300">Redirigiendo al login...</p>
            <div className="mt-4">
              <Loader className="w-5 h-5 animate-spin mx-auto text-green-400" />
            </div>
          </div>
        )}

        {/* Setup Instructions */}
        {!freighterDetected && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-300/40 bg-cyan-400/10 backdrop-blur mb-5 animate-soft-float">
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span className="text-sm font-semibold text-cyan-100">Configuración inicial de wallet</span>
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

              <h1 className="text-4xl font-bold text-white mb-2">Configura tu Wallet</h1>
              <p className="text-cyan-100 font-semibold text-lg">Instala Freighter para continuar en StudyTrips</p>
              <div className="flex justify-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2 text-cyan-300"><Lock className="w-4 h-4" /><span>100% Seguro</span></div>
                <div className="flex items-center gap-2 text-sky-300"><Globe className="w-4 h-4" /><span>Red Global</span></div>
                <div className="flex items-center gap-2 text-emerald-300"><Zap className="w-4 h-4" /><span>Instantáneo</span></div>
              </div>
            </div>

            {/* Main Setup Card */}
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-8 border border-cyan-400/25 shadow-xl shadow-cyan-500/10 animate-card-enter">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Download className="w-6 h-6 text-cyan-300" />
                Paso 1: Descargar Freighter
              </h2>

              <div className="space-y-4 mb-8">
                <p className="text-gray-300">
                  Freighter es una extensión de navegador segura que protege tus activos en la red Stellar.
                </p>

                <div className="bg-cyan-500/10 border border-cyan-300/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-cyan-300 flex-shrink-0 mt-0.5" />
                  <p className="text-cyan-100 text-sm">
                    Solo usa Freighter descargado desde <strong>freighter.app</strong>. No confíes en otras fuentes.
                  </p>
                </div>

                <a
                  href="https://freighter.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gloss btn-cyan block w-full text-slate-950 font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-cyan-500/30 text-center flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Descargar Freighter (freighter.app)
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <hr className="border-slate-600 my-8" />

              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                Paso 2: Instalar extensión
              </h2>

              <div className="space-y-4 mb-8">
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                  <p className="text-gray-300 font-semibold mb-2">Instrucciones por navegador:</p>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li><strong>Chrome/Brave:</strong> Click en la descarga y luego "Añadir a Chrome"</li>
                    <li><strong>Firefox:</strong> Click en la descarga y luego "Añadir a Firefox"</li>
                    <li><strong>Edge:</strong> Click en la descarga y luego "Obtener extensión"</li>
                  </ul>
                </div>

                <div className="bg-amber-500/20 border border-amber-300/40 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-200 text-sm font-semibold mb-2">Después de instalar:</p>
                    <ul className="text-amber-100 text-sm space-y-1">
                      <li>✓ Encontrarás el icono de Freighter en tu navegador</li>
                      <li>✓ Click en el icono para abrir la extensión</li>
                      <li>✓ Crea una nueva wallet o importa una existente</li>
                    </ul>
                  </div>
                </div>
              </div>

              <hr className="border-slate-600 my-8" />

              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Loader className="w-6 h-6 text-cyan-400 animate-spin" />
                Paso 3: Espera detección
              </h2>

              <div className="space-y-4">
                <p className="text-gray-300">
                  Estamos verificando si Freighter está instalada...
                </p>

                {isChecking && (
                  <div className="flex justify-center items-center gap-2 text-cyan-300">
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Buscando Freighter...</span>
                  </div>
                )}

                <button
                  onClick={() => window.location.reload()}
                  className="btn-gloss btn-amber w-full text-slate-900 font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Verificar Nuevamente
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="group bg-slate-900/60 backdrop-blur-md rounded-xl p-4 border border-white/15 hover:border-cyan-300/50 hover:-translate-y-1 transition-all duration-300">
                <div className="text-3xl mb-2">🔐</div>
                <h3 className="text-white font-bold text-sm mb-1">Seguro</h3>
                <p className="text-gray-300 text-xs">Tus claves privadas nunca dejan tu navegador</p>
              </div>
              <div className="group bg-slate-900/60 backdrop-blur-md rounded-xl p-4 border border-white/15 hover:border-cyan-300/50 hover:-translate-y-1 transition-all duration-300">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="text-white font-bold text-sm mb-1">Rápido</h3>
                <p className="text-gray-300 text-xs">Transacciones instantáneas en Stellar</p>
              </div>
              <div className="group bg-slate-900/60 backdrop-blur-md rounded-xl p-4 border border-white/15 hover:border-cyan-300/50 hover:-translate-y-1 transition-all duration-300">
                <div className="text-3xl mb-2">🌍</div>
                <h3 className="text-white font-bold text-sm mb-1">Descentralizado</h3>
                <p className="text-gray-300 text-xs">Control total de tus activos</p>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-cyan-500/10 backdrop-blur-md rounded-2xl p-6 border border-cyan-300/30">
              <h3 className="text-cyan-100 font-bold mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                ¿Necesitas ayuda?
              </h3>
              <ul className="text-cyan-100/90 text-sm space-y-2">
                <li>
                  <a href="https://docs.freighter.app" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:text-cyan-200 underline">
                    Documentación de Freighter
                  </a>
                </li>
                <li>
                  <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:text-cyan-200 underline">
                    Aprende sobre Stellar
                  </a>
                </li>
                <li>
                  Contacta nuestro soporte: support@viajesdeestudio.mx
                </li>
              </ul>
            </div>
          </div>
        )}
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







