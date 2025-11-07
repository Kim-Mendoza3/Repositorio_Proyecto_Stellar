"use client";

import React, { useState } from "react";
import SorobanPasskeyApp from "@/components/SorobanPasskeyApp";
import CreditScoringFlow from "@/components/CreditScoringFlow";

type AppMode = 'home' | 'passkey' | 'credit';

export default function Home() {
  const [currentMode, setCurrentMode] = useState<AppMode>('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-900 to-blue-900">
      <nav className="relative z-10 px-6 pt-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">✈️</span>
            </div>
            <span className="text-white font-bold text-xl">StudyTrips Global</span>
          </div>
        </div>
      </nav>

      <div className="relative z-10 px-6 pt-20 pb-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            StudyTrips Global
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto leading-relaxed mb-12">
            Financia tus viajes de estudio con seguridad blockchain. Autenticación biométrica, pagos en criptomonedas y acceso global para estudiantes.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Características</h2>
            <ul className="text-left text-blue-100 text-lg space-y-2 mx-auto max-w-xl mb-8">
              <li>✅ Financiamiento de viajes de estudio aprobado en minutos</li>
              <li>✅ Algoritmo inteligente de evaluación de crédito</li>
              <li>✅ Contratos inteligentes en Soroban (Stellar testnet)</li>
              <li>✅ Autenticación segura con Passkey/WebAuthn</li>
              <li>✅ Privacidad garantizada: datos nunca salen de tu dispositivo</li>
              <li>✅ Interfaz moderna y responsiva</li>
            </ul>
            <div className="flex flex-col md:flex-row gap-4 justify-center mt-4">
              <a
                href="/register"
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-500 hover:to-green-500 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg text-lg"
              >
                Registro
              </a>
              <a
                href="/login"
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg text-lg"
              >
                Login
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>
    </div>
  );
}
