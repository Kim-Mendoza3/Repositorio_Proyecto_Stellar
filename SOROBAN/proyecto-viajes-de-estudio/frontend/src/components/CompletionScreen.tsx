"use client";

import React, { useEffect } from "react";
import Link from "next/link";

interface CompletionScreenProps {
  packageName: string;
  companyName: string;
  totalCost: number;
  monthlyPayment: number;
  loanTerm: number;
  userAddress?: string;
}

export default function CompletionScreen({
  packageName,
  companyName,
  totalCost,
  monthlyPayment,
  loanTerm,
  userAddress,
}: CompletionScreenProps) {
  useEffect(() => {
    // Guardar el viaje aprobado en localStorage
    const trip = {
      id: Date.now().toString(),
      packageName,
      companyName,
      totalCost,
      monthlyPayment,
      loanTerm,
      approvalDate: new Date().toISOString(),
      status: 'Aprobado',
    };
    
    const trips = JSON.parse(localStorage.getItem('approvedTrips') || '[]');
    trips.push(trip);
    localStorage.setItem('approvedTrips', JSON.stringify(trips));
  }, [packageName, companyName, totalCost, monthlyPayment, loanTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-slate-900 to-cyan-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Celebration Animation */}
        <div className="text-center mb-12">
          <div className="inline-block mb-8">
            <div className="text-8xl animate-bounce">🎉</div>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
            ¡Felicidades!
          </h1>

          <p className="text-2xl text-slate-200 font-semibold mb-2">
            Tu solicitud ha sido aprobada
          </p>

          <p className="text-lg text-slate-400">
            Estamos listos para ayudarte a vivir una experiencia transformadora
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 mb-8 border border-emerald-500/30 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-12 pb-8 border-b border-slate-700">
            <div className="text-6xl mb-4">✈️</div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Disfruta tu viaje
            </h2>
            <p className="text-slate-300">
              Tu apoyo financiero está listo para desbloquear tu aventura educativa
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Paquete */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-sm text-emerald-300 font-semibold mb-1 uppercase">
                Paquete Seleccionado
              </div>
              <h3 className="text-2xl font-bold text-white">{packageName}</h3>
              <p className="text-slate-400 mt-2">Experiencia de viaje completa</p>
            </div>

            {/* Empresa */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-sm text-cyan-300 font-semibold mb-1 uppercase">
                Financiador
              </div>
              <h3 className="text-2xl font-bold text-white">{companyName}</h3>
              <p className="text-slate-400 mt-2">Tu aliado educativo</p>
            </div>

            {/* Costo Total */}
            <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 rounded-xl p-6 border border-emerald-500/30">
              <div className="text-sm text-emerald-300 font-semibold mb-1 uppercase">
                Costo Total del Viaje
              </div>
              <h3 className="text-3xl font-bold text-white">
                ${totalCost.toLocaleString()}
              </h3>
              <p className="text-emerald-200 mt-2">Financiado completamente</p>
            </div>

            {/* Plan de Pagos */}
            <div className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 rounded-xl p-6 border border-cyan-500/30">
              <div className="text-sm text-cyan-300 font-semibold mb-1 uppercase">
                Plan de Pagos
              </div>
              <h3 className="text-2xl font-bold text-white">
                ${monthlyPayment}
              </h3>
              <p className="text-cyan-200 mt-2">
                por mes × {loanTerm} meses
              </p>
            </div>
          </div>

          {/* What's Included */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">¿Qué incluye tu apoyo?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🏨</span>
                <div>
                  <p className="font-semibold text-white">Hospedaje</p>
                  <p className="text-sm text-slate-400">Hotel/Resort según paquete</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🚌</span>
                <div>
                  <p className="font-semibold text-white">Transporte</p>
                  <p className="text-sm text-slate-400">Autobús, vuelos internos o privado</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🍽️</span>
                <div>
                  <p className="font-semibold text-white">Alimentación</p>
                  <p className="text-sm text-slate-400">Desayunos y comidas según itinerario</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🎓</span>
                <div>
                  <p className="font-semibold text-white">Experiencias</p>
                  <p className="text-sm text-slate-400">Tours guiados y actividades educativas</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🛡️</span>
                <div>
                  <p className="font-semibold text-white">Seguro Médico</p>
                  <p className="text-sm text-slate-400">Cobertura completa durante el viaje</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">👥</span>
                <div>
                  <p className="font-semibold text-white">Asistencia 24/7</p>
                  <p className="text-sm text-slate-400">Asesor dedicado en destino</p>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Info */}
          {userAddress && (
            <div className="bg-blue-900/30 rounded-xl p-6 border border-blue-500/30 mb-8">
              <p className="text-sm text-blue-300 font-semibold mb-2">
                CUENTA STELLAR (TESTNET)
              </p>
              <p className="font-mono text-xs text-blue-200 break-all">{userAddress}</p>
              <p className="text-xs text-blue-400 mt-2">
                Los fondos se registrarán en blockchain para transparencia total
              </p>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8">
            <h3 className="text-lg font-bold text-white mb-4">Próximos pasos</h3>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="bg-emerald-500 text-slate-900 font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  1
                </span>
                <div>
                  <p className="font-semibold text-white">Recibe confirmación por email</p>
                  <p className="text-sm text-slate-400">En las próximas 2 horas</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-emerald-500 text-slate-900 font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  2
                </span>
                <div>
                  <p className="font-semibold text-white">Asesor te contactará</p>
                  <p className="text-sm text-slate-400">Para detalles finales y documentos</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-emerald-500 text-slate-900 font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  3
                </span>
                <div>
                  <p className="font-semibold text-white">Preparate para tu viaje</p>
                  <p className="text-sm text-slate-400">Recibe itinerario y recomendaciones</p>
                </div>
              </li>
            </ol>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-900/30 rounded-xl p-4 border border-amber-500/30">
            <p className="text-xs text-amber-200">
              <span className="font-semibold">⚠️ Importante:</span> Este financiamiento está sujeto a
              términos y condiciones. El primer pago comenzará 30 días después de la
              aprobación. Tienes derecho a cancelar sin penalización hasta 7 días antes del viaje.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard"
            className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all text-center"
          >
            Ir al Dashboard
          </Link>
          <Link
            href="/"
            className="flex-1 px-6 py-4 bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-600 transition text-center"
          >
            Volver al Inicio
          </Link>
        </div>

        {/* Footer Message */}
        <div className="text-center mt-8">
          <p className="text-slate-400">
            ¿Preguntas?{" "}
            <Link href="/dashboard" className="text-emerald-300 hover:text-emerald-200 font-semibold">
              Contacta a tu asesor
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
