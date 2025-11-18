"use client";

import React from "react";
import HeroCarousel from "@/components/HeroCarousel";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-900 to-sky-900 text-white">
      <nav className="relative z-20 px-6 py-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-xl">
              <span className="text-2xl">✈️</span>
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight">StudyTrips Global</div>
              <div className="text-sm text-amber-200/70">Financia tu experiencia internacional con confianza</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/register" className="hidden md:inline-block px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg shadow">Registro</a>
            <a href="/login" className="px-4 py-2 border border-white/20 hover:bg-white/5 rounded-lg">Login</a>
          </div>
        </div>
      </nav>

      <section className="relative z-10 px-6 py-20">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">Viajes de estudio sin barreras — Financiamiento rápido y seguro</h1>
              <p className="text-lg text-sky-100/90 mb-8">Autenticación biométrica con Passkeys, contratos inteligentes en Soroban y un sistema de scoring que aprueba solicitudes en minutos. Financia tu experiencia internacional con confianza.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-white/10 rounded-lg shadow inner-border">
                  <svg className="w-6 h-6 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.5 0-3 .9-3 2v4"/></svg>
                </div>
                <div>
                  <div className="font-semibold">Aprobación en minutos</div>
                  <div className="text-sm text-sky-100/80">Solicitudes rápidas con validación automática.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-3 bg-white/10 rounded-lg shadow inner-border">
                  <svg className="w-6 h-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3"/></svg>
                </div>
                <div>
                  <div className="font-semibold">Scoring inteligente</div>
                  <div className="text-sm text-sky-100/80">Modelo que combina datos y contexto para decisiones justas.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-3 bg-white/10 rounded-lg shadow inner-border">
                  <svg className="w-6 h-6 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0-1.657 2.686-3 6-3s6 1.343 6 3v2"/></svg>
                </div>
                <div>
                  <div className="font-semibold">Contratos Soroban</div>
                  <div className="text-sm text-sky-100/80">Transparencia y ejecución segura en Stellar testnet.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-3 bg-white/10 rounded-lg shadow inner-border">
                  <svg className="w-6 h-6 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c-1.657 0-3 1.343-3 3v5h6v-5c0-1.657-1.343-3-3-3z"/></svg>
                </div>
                <div>
                  <div className="font-semibold">Passkey/WebAuthn</div>
                  <div className="text-sm text-sky-100/80">Inicio de sesión sin contraseñas, más seguro y fácil.</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <a href="/register" className="px-6 py-3 bg-amber-400 text-slate-900 font-semibold rounded-lg shadow hover:scale-105 transition">Comenzar</a>
              <a href="/login" className="px-6 py-3 border border-white/20 rounded-lg hover:bg-white/5">Iniciar sesión</a>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full h-[420px] md:h-[560px] rounded-3xl shadow-2xl overflow-hidden">
              <HeroCarousel />
            </div>
          </div>
        </div>
      </section>

      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />
      </div>
    </main>
  );
}
