"use client";

import React, { useState } from "react";

export interface TravelPackage {
  id: string;
  name: string;
  duration: string;
  price: number;
  icon: string;
  description: string;
  highlights: string[];
  benefits: string[];
  monthlyPayment: number;
  loanTerm: number;
}

interface TravelPackagesProps {
  onSelectPackage: (pkg: TravelPackage) => void;
  onBack: () => void;
}

const packages: TravelPackage[] = [
  {
    id: "basic",
    name: "Paquete Básico",
    duration: "5 días",
    price: 3500,
    icon: "🎒",
    description: "Experiencia educativa en la Ciudad de México con hospedaje compartido",
    highlights: [
      "5 noches en hostal/albergue compartido",
      "Visitas a museos y sitios culturales",
      "Desayunos incluidos",
      "Transporte interno en autobus escolar",
    ],
    benefits: [
      "🚌 Autobús escolar incluido",
      "🍽️ Desayunos diarios",
      "🏛️ 3 atracciones turísticas",
      "👥 Grupo de 20-30 estudiantes",
    ],
    monthlyPayment: 175,
    loanTerm: 24,
  },
  {
    id: "standard",
    name: "Paquete Estándar",
    duration: "7 días",
    price: 5200,
    icon: "✈️",
    description: "Viaje a Oaxaca con experiencia cultural inmersiva",
    highlights: [
      "7 noches en hotel 3 estrellas",
      "Tours arqueológicos y gastronómicos",
      "Desayunos y comidas incluidas",
      "Autobús privado + vuelos internos",
    ],
    benefits: [
      "✈️ Vuelos internos incluidos",
      "🚌 Autobús privado exclusivo",
      "🍽️ Desayunos + 5 comidas",
      "🏨 Hotel 3 estrellas",
      "🎭 Experiencias culturales",
    ],
    monthlyPayment: 260,
    loanTerm: 24,
  },
  {
    id: "premium",
    name: "Paquete Premium",
    duration: "10 días",
    price: 7800,
    icon: "⭐",
    description: "Ruta completa por Yucatán: arqueología y playas",
    highlights: [
      "10 noches en hoteles 4 estrellas",
      "Visitas a Chichén Itzá y cenotes",
      "All-inclusive: desayunos, comidas, cenas",
      "Transporte aéreo + autobús de lujo",
    ],
    benefits: [
      "🛫 Vuelos internos directos",
      "🚐 Autobús de lujo con aire acondicionado",
      "🍽️ All-inclusive (todas las comidas)",
      "🏖️ Día libre en playa",
      "🏛️ Visitas guiadas profesionales",
      "📸 Seguro de viaje incluido",
    ],
    monthlyPayment: 390,
    loanTerm: 24,
  },
  {
    id: "deluxe",
    name: "Paquete Deluxe",
    duration: "12 días",
    price: 10500,
    icon: "👑",
    description: "Aventura por Quintana Roo: cenotes, isla Mujeres y parques",
    highlights: [
      "12 noches en resorts todo incluido",
      "Snorkel en cenotes y arrecife",
      "Día en Isla Mujeres",
      "Aventura en parques naturales",
    ],
    benefits: [
      "✈️ Vuelos + traslados premium",
      "🚤 Excursiones en lancha privada",
      "🏊 Snorkel y actividades acuáticas",
      "🏨 Resort 5 estrellas todo incluido",
      "🎁 Paquete de bienvenida",
      "📱 Asistencia 24/7 en el destino",
      "💳 Seguro médico internacional",
    ],
    monthlyPayment: 525,
    loanTerm: 24,
  },
  {
    id: "elite",
    name: "Paquete Elite",
    duration: "14 días",
    price: 13200,
    icon: "💎",
    description: "Experiencia de intercambio académico en Baja California",
    highlights: [
      "14 noches en hospedaje premium",
      "Seminarios académicos en universidades",
      "Excursiones a Baja California y playas",
      "Ruta gastronómica exclusiva",
    ],
    benefits: [
      "🎓 Seminarios en universidades reconocidas",
      "✈️ Vuelos + hospedaje 5 estrellas",
      "🚁 Tour en helicóptero (opcional)",
      "🍷 Experiencia gastronómica de lujo",
      "📚 Certificados académicos",
      "🎯 Networking con profesionales",
      "💼 Mentoría personalizada",
      "🌍 Acceso a red global de estudiantes",
    ],
    monthlyPayment: 660,
    loanTerm: 24,
  },
];

export default function TravelPackages({
  onSelectPackage,
  onBack,
}: TravelPackagesProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (pkg: TravelPackage) => {
    setSelectedId(pkg.id);
    setTimeout(() => onSelectPackage(pkg), 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Elige tu Paquete de Viaje
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Selecciona la opción que mejor se adapte a tu presupuesto y preferencias educativas.
            Nuestros paquetes incluyen transporte, hospedaje y experiencias guiadas.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => handleSelect(pkg)}
              className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                selectedId === pkg.id
                  ? "ring-4 ring-blue-400 shadow-2xl scale-105"
                  : "hover:shadow-xl"
              }`}
            >
              {/* Card Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />

              {/* Premium Badge */}
              {pkg.id === "deluxe" || pkg.id === "elite" ? (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 rounded-full text-xs font-bold text-white">
                  🔥 Más Popular
                </div>
              ) : null}

              <div className="relative p-6">
                {/* Icon & Name */}
                <div className="mb-4">
                  <div className="text-5xl mb-3">{pkg.icon}</div>
                  <h3 className="text-2xl font-bold text-white">{pkg.name}</h3>
                  <p className="text-sm text-slate-400">{pkg.duration}</p>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="text-3xl font-extrabold text-blue-300">
                    ${pkg.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400">
                    ${pkg.monthlyPayment}/mes por {pkg.loanTerm} meses
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-300 mb-4">{pkg.description}</p>

                {/* Highlights */}
                <div className="space-y-2 mb-4">
                  {pkg.highlights.map((h, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-blue-400 mt-0.5">✓</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                <button
                  className={`w-full py-2 rounded-lg font-bold transition-all ${
                    selectedId === pkg.id
                      ? "bg-blue-500 text-white"
                      : "bg-slate-700 text-white hover:bg-slate-600"
                  }`}
                >
                  {selectedId === pkg.id ? "✓ Seleccionado" : "Seleccionar"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Details Section for Selected */}
        {selectedId && (
          <div className="mt-12 animate-fadeIn">
            {packages
              .filter((p) => p.id === selectedId)
              .map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white"
                >
                  <h2 className="text-3xl font-bold mb-6">Beneficios incluidos en {pkg.name}</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {pkg.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{benefit.split(" ")[0]}</span>
                        <div>
                          <p className="font-semibold">{benefit.substring(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Terms & Conditions */}
                  <div className="bg-white/10 rounded-lg p-6 mb-6">
                    <h3 className="font-bold text-lg mb-4">📋 Términos y Condiciones</h3>
                    <ul className="space-y-2 text-sm text-white/90">
                      <li>✓ Pago en {pkg.loanTerm} mensualidades de ${pkg.monthlyPayment} cada una</li>
                      <li>✓ Tasa de interés entre 4.5% - 8% dependiendo de la empresa seleccionada</li>
                      <li>✓ Seguro de viaje y cobertura médica incluidos</li>
                      <li>✓ Cancelación gratuita hasta 30 días antes del viaje</li>
                      <li>✓ Asistencia dedicada de asesor académico antes y durante el viaje</li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => setSelectedId(null)}
                      className="flex-1 px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition font-bold"
                    >
                      Cambiar Paquete
                    </button>
                    <button
                      onClick={() => handleSelect(packages.find((p) => p.id === selectedId)!)}
                      className="flex-1 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-slate-100 transition font-bold"
                    >
                      Continuar con este Paquete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition font-bold"
          >
            ← Volver a Elegir Empresa
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
