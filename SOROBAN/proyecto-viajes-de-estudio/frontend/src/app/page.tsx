'use client';
export const dynamic = 'force-dynamic';

import React from "react";
import { ArrowRight, Blocks, BrainCircuit, KeyRound, Plane, ShieldCheck, Sparkles, Stars } from "lucide-react";
import HeroCarousel from "@/components/HeroCarousel";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_#1e1b4b_0%,_#0f172a_45%,_#020617_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="pointer-events-none absolute -top-24 -left-16 w-72 h-72 rounded-full bg-cyan-400/20 blur-3xl animate-drift-slow" />
      <div className="pointer-events-none absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-fuchsia-400/10 blur-3xl animate-drift" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl animate-drift-reverse" />

      <nav className="relative z-20 px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-7xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 p-[2px] shadow-xl shadow-cyan-500/30 animate-soft-float">
              <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center">
                <svg viewBox="0 0 64 64" className="w-8 h-8" aria-label="StudyTrips Global logo">
                  <path d="M10 41c8 0 15-3 21-8l8-7 14-6-5 10 6 3-7 4-2 8-8-2-6 7c-8 8-19 10-25 7 8-1 12-4 14-8-4 0-8-2-10-8z" fill="#22d3ee" />
                  <path d="M14 18c7-8 23-10 34-3" stroke="#93c5fd" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              <span className="absolute -inset-1 rounded-xl border border-cyan-300/40 animate-pulse" />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight">StudyTrips Global</div>
              <div className="text-xs sm:text-sm text-cyan-100/80">Financia tu experiencia internacional con confianza</div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a href="/register" className="btn-gloss btn-cyan flex-1 sm:flex-none text-center px-4 py-2.5 font-semibold rounded-lg shadow-lg shadow-cyan-500/30 transition-transform hover:-translate-y-0.5">Registro</a>
            <a href="/login" className="btn-gloss btn-cyan flex-1 sm:flex-none text-center px-4 py-2.5 font-semibold rounded-lg shadow-lg shadow-cyan-500/30 transition-transform hover:-translate-y-0.5">Login</a>
          </div>
        </div>
      </nav>

      <section className="relative z-10 px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">
          <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-5 animate-soft-float">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                Plataforma de financiamiento educativo
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-balance">Viajes de estudio sin barreras — Financiamiento rápido y seguro</h1>
              <p className="text-base sm:text-lg text-sky-100/90 mb-8">Autenticación biométrica con Passkeys, contratos inteligentes en Soroban y un sistema de scoring que aprueba solicitudes en minutos. Financia tu experiencia internacional con confianza.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-10 auto-rows-fr">
              <div className="group relative sm:col-span-2 flex h-full min-h-[130px] items-start gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-cyan-300/60 hover:bg-white/10 hover:shadow-xl hover:shadow-cyan-500/20 animate-card-enter [animation-delay:120ms]">
                <div className="p-3 bg-white/10 rounded-xl shadow inner-border transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Plane className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <div className="font-semibold">Aprobación en minutos</div>
                  <div className="text-sm text-sky-100/80">Solicitudes rápidas con validación automática.</div>
                </div>
                <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-cyan-300/0 transition-all duration-500 group-hover:ring-cyan-300/40" />
              </div>

              <div className="group relative flex h-full min-h-[130px] items-start gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-emerald-300/60 hover:bg-white/10 hover:shadow-xl hover:shadow-emerald-500/20 animate-card-enter [animation-delay:220ms]">
                <div className="p-3 bg-white/10 rounded-xl shadow inner-border transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <BrainCircuit className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <div className="font-semibold">Scoring inteligente</div>
                  <div className="text-sm text-sky-100/80">Modelo que combina datos y contexto para decisiones justas.</div>
                </div>
                <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-emerald-300/0 transition-all duration-500 group-hover:ring-emerald-300/40" />
              </div>

              <div className="group relative flex h-full min-h-[130px] items-start gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-sky-300/60 hover:bg-white/10 hover:shadow-xl hover:shadow-sky-500/20 animate-card-enter [animation-delay:320ms]">
                <div className="p-3 bg-white/10 rounded-xl shadow inner-border transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Blocks className="w-6 h-6 text-cyan-300" />
                </div>
                <div>
                  <div className="font-semibold">Contratos Soroban</div>
                  <div className="text-sm text-sky-100/80">Transparencia y ejecución segura en Stellar testnet.</div>
                </div>
                <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-sky-300/0 transition-all duration-500 group-hover:ring-sky-300/40" />
              </div>

              <div className="group relative flex h-full min-h-[130px] items-start gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-pink-300/60 hover:bg-white/10 hover:shadow-xl hover:shadow-pink-500/20 animate-card-enter [animation-delay:420ms]">
                <div className="p-3 bg-white/10 rounded-xl shadow inner-border transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <KeyRound className="w-6 h-6 text-pink-300" />
                </div>
                <div>
                  <div className="font-semibold">Passkey/WebAuthn</div>
                  <div className="text-sm text-sky-100/80">Inicio de sesión sin contraseñas, más seguro y fácil.</div>
                </div>
                <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-pink-300/0 transition-all duration-500 group-hover:ring-pink-300/40" />
              </div>

              <div className="group relative sm:col-span-2 rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-amber-300/60 hover:shadow-xl hover:shadow-amber-500/20 animate-card-enter [animation-delay:520ms]">
                <div className="flex items-center gap-2 text-amber-200 mb-2">
                  <Stars className="w-4 h-4 animate-orbit" />
                  <span className="text-sm font-semibold">Experiencia premium</span>
                </div>
                <p className="text-sm text-sky-100/80">Diseño orientado a conversión con navegación clara y flujo de solicitud optimizado para móvil y desktop.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/register" className="btn-gloss btn-amber relative overflow-hidden px-6 py-3 text-slate-900 font-semibold rounded-lg shadow hover:scale-[1.02] transition inline-flex items-center justify-center gap-2">
                <span className="relative">Comenzar</span>
                <ArrowRight className="relative w-4 h-4" />
              </a>
              <a href="/login" className="btn-gloss btn-amber px-6 py-3 text-slate-900 font-semibold rounded-lg shadow hover:scale-[1.02] transition inline-flex items-center justify-center gap-2"><ShieldCheck className="w-4 h-4" /> Iniciar sesión</a>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2.5 text-xs text-sky-100/90">
              <span className="px-3 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm animate-card-enter [animation-delay:620ms]">Respuesta rápida</span>
              <span className="px-3 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm animate-card-enter [animation-delay:700ms]">Seguridad WebAuthn</span>
              <span className="px-3 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm animate-card-enter [animation-delay:780ms]">Transparencia en blockchain</span>
            </div>
          </div>

          <div className="relative flex items-center justify-center pt-6 pb-8">
            <div className="absolute top-0 right-2 z-30 hidden sm:flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-400/10 backdrop-blur px-3 py-1.5 text-xs text-cyan-100 animate-soft-float">
              <Sparkles className="w-3.5 h-3.5" />
              Nuevo flujo inteligente
            </div>
            <div className="absolute bottom-0 left-3 z-30 hidden md:flex items-center gap-2 rounded-full border border-fuchsia-300/40 bg-fuchsia-400/10 backdrop-blur px-3 py-1.5 text-xs text-fuchsia-100 animate-soft-float [animation-delay:200ms]">
              <Stars className="w-3.5 h-3.5 animate-orbit" />
              UI dinámica en tiempo real
            </div>
            <div className="relative z-10 w-full h-[360px] sm:h-[420px] md:h-[520px] rounded-3xl shadow-2xl overflow-hidden border border-white/10 ring-1 ring-cyan-400/20 animate-soft-float">
              <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.10)_40%,transparent_65%)] animate-scan" />
              <HeroCarousel />
            </div>
          </div>
        </div>
      </section>

      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl animate-drift-slow" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl animate-drift" />
      </div>

      <style jsx>{`
        .animate-soft-float {
          animation: softFloat 6s ease-in-out infinite;
        }

        .animate-drift {
          animation: drift 18s ease-in-out infinite;
        }

        .animate-drift-slow {
          animation: drift 24s ease-in-out infinite;
        }

        .animate-drift-reverse {
          animation: driftReverse 22s ease-in-out infinite;
        }

        .animate-shine {
          animation: shine 2.8s ease-in-out infinite;
        }

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
          color: #04111d;
        }

        .btn-cyan:hover {
          filter: brightness(1.06);
        }

        .btn-amber {
          background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
          color: #111827;
        }

        .btn-amber:hover {
          filter: brightness(1.05);
        }

        .animate-card-enter {
          animation: cardEnter 900ms cubic-bezier(.2,.9,.2,1) both;
        }

        .animate-scan {
          animation: scan 6s ease-in-out infinite;
        }

        .animate-orbit {
          animation: orbit 5s linear infinite;
        }

        @keyframes softFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes drift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(18px, -12px, 0) scale(1.04); }
        }

        @keyframes driftReverse {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-16px, 14px, 0) scale(1.05); }
        }

        @keyframes shine {
          0% { transform: translateX(-120%); }
          45% { transform: translateX(120%); }
          100% { transform: translateX(120%); }
        }

        @keyframes cardEnter {
          0% { opacity: 0; transform: translateY(18px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes scan {
          0% { transform: translateX(-120%); opacity: 0; }
          15% { opacity: 1; }
          60% { transform: translateX(120%); opacity: 1; }
          100% { transform: translateX(120%); opacity: 0; }
        }

        @keyframes orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}

