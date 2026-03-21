'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { useUserRegistry } from '@/hooks/useUserRegistry';
import { usePersistUserRegistry } from '@/hooks/usePersistUserRegistry';
import { Building2, LogOut, Plus, DollarSign, Users, TrendingUp, Edit, Trash2, Sparkles, Lock, Globe, Zap } from 'lucide-react';

interface TripOffer {
  id: string;
  companyWallet: string;
  name: string;
  destination: string;
  duration: string;
  priceXLM: number;
  description: string;
  maxParticipants: number;
  currentBookings: number;
  status: 'active' | 'inactive';
  createdAt: string;
  highlights: string[];
}

export default function CompanyDashboardPage() {
  // Sincronizar registry persistentemente
  usePersistUserRegistry();

  const router = useRouter();
  const { account, disconnectWallet } = useWallet();
  const { getCurrentUser } = useUserRegistry();

  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [tripOffers, setTripOffers] = useState<TripOffer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<TripOffer | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    duration: '',
    priceXLM: '',
    description: '',
    maxParticipants: '',
    highlights: '',
  });

  // Verificar si es empresa
  useEffect(() => {
    const user = getCurrentUser();
    if (user?.userType !== 'company') {
      console.log('No es empresa o no hay usuario');
      router.push('/login');
      return;
    }
    console.log('Empresa encontrada:', user.companyName, 'Wallet:', user.publicKey);
    setCurrentUser(user);
    loadTripOffersFromAPI(user.publicKey);
    setIsInitialized(true);
  }, [router, getCurrentUser]);

  const loadTripOffers = (walletKey?: string) => {
    try {
      // Usar wallet de currentUser si está disponible
      const wallet = walletKey || currentUser?.publicKey || account?.publicKey;
      if (!wallet) {
        console.error('No hay wallet disponible');
        return;
      }
      
      console.log(`Cargando viajes para wallet: ${wallet.substring(0, 8)}...`);
      const data = localStorage.getItem(`company_trips_${wallet}`);
      console.log('Datos encontrados:', data ? JSON.parse(data).length + ' viajes' : 'ninguno');
      
      if (data) {
        setTripOffers(JSON.parse(data));
      }
    } catch (e) {
      console.error('Error cargando ofertas:', e);
    }
  };

  const handleCreateTrip = () => {
    setEditingTrip(null);
    setFormData({
      name: '',
      destination: '',
      duration: '',
      priceXLM: '',
      description: '',
      maxParticipants: '',
      highlights: '',
    });
    setShowModal(true);
  };

  const handleEditTrip = (trip: TripOffer) => {
    setEditingTrip(trip);
    setFormData({
      name: trip.name,
      destination: trip.destination,
      duration: trip.duration,
      priceXLM: trip.priceXLM.toString(),
      description: trip.description,
      maxParticipants: trip.maxParticipants.toString(),
      highlights: trip.highlights.join('\n'),
    });
    setShowModal(true);
  };

  const handleSaveTrip = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.destination ||
      !formData.duration ||
      !formData.priceXLM ||
      !formData.maxParticipants
    ) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    // Usar currentUser.publicKey como fuente de verdad
    const walletKey = currentUser?.publicKey || account?.publicKey;
    if (!walletKey) {
      console.error('No hay wallet disponible para guardar viaje');
      alert('Error: No hay wallet disponible');
      return;
    }

    const trip: TripOffer = {
      id: editingTrip?.id || `trip_${Date.now()}`,
      companyWallet: walletKey,
      name: formData.name,
      destination: formData.destination,
      duration: formData.duration,
      priceXLM: Number.parseFloat(formData.priceXLM),
      description: formData.description,
      maxParticipants: Number.parseInt(formData.maxParticipants, 10),
      currentBookings: editingTrip?.currentBookings || 0,
      status: 'active',
      createdAt: editingTrip?.createdAt || new Date().toISOString(),
      highlights: formData.highlights
        .split('\n')
        .filter(h => h.trim())
        .map(h => h.trim()),
    };

    try {
      console.log(`Guardando viaje en API para wallet ${walletKey.substring(0, 8)}...`);
      
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
  console.log('Viaje guardado en API exitosamente', result);

      // Guardar también en localStorage como respaldo (Netlify /tmp no persiste)
      try {
        const storageKey = `company_trips_${walletKey}`;
        const existing = localStorage.getItem(storageKey);
        const trips = existing ? JSON.parse(existing) : [];
        
        // Actualizar si ya existe, o agregar si es nuevo
        const index = trips.findIndex((t: TripOffer) => t.id === trip.id);
        if (index >= 0) {
          trips[index] = trip;
        } else {
          trips.push(trip);
        }
        
        localStorage.setItem(storageKey, JSON.stringify(trips));
        console.log(`Viaje guardado en localStorage: ${trips.length} viajes`);
      } catch (e) {
        console.warn('No se pudo guardar en localStorage:', e);
      }

      // Recargar viajes desde la API
      loadTripOffersFromAPI(walletKey);
      setShowModal(false);
    } catch (error) {
      console.error('Error guardando viaje:', error);
      alert('Error al guardar el viaje. Por favor intenta de nuevo.');
    }
  };

  const loadTripOffersFromAPI = async (walletKey?: string) => {
    try {
      const wallet = walletKey || currentUser?.publicKey || account?.publicKey;
      if (!wallet) {
        console.error('No hay wallet disponible');
        return;
      }
      
      console.log(`Cargando viajes desde API para wallet: ${wallet.substring(0, 8)}...`);
      const response = await fetch(`/api/trips?company=${wallet}`);
      const data = await response.json();
      
      if (data.success && data.trips.length > 0) {
        console.log(`Viajes cargados desde API: ${data.trips.length}`);
        setTripOffers(data.trips);
        // Actualizar localStorage con datos del API
        localStorage.setItem(`company_trips_${wallet}`, JSON.stringify(data.trips));
      } else {
        console.log(`API devolvió ${data.trips?.length || 0} viajes, intentando localStorage...`);
        // Fallback a localStorage si API no tiene datos (Netlify /tmp no persiste)
        loadTripOffers(wallet);
      }
    } catch (e) {
      console.error('❌ Error cargando ofertas desde API:', e);
      // Fallback a localStorage
      loadTripOffers(walletKey);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta oferta?')) {
      const walletKey = currentUser?.publicKey || account?.publicKey;
      if (!walletKey) {
        console.error('No hay wallet disponible para eliminar viaje');
        return;
      }
      
      try {
        const response = await fetch('/api/trips', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tripId, companyWallet: walletKey }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        console.log('Viaje eliminado exitosamente');
        // Recargar viajes desde la API
        loadTripOffersFromAPI(walletKey);
      } catch (error) {
        console.error('Error eliminando viaje:', error);
        alert('Error al eliminar el viaje. Por favor intenta de nuevo.');
      }
    }
  };

  const handleLogout = () => {
    disconnectWallet();
    localStorage.removeItem('current_user');
    localStorage.removeItem('user_wallet');
    router.push('/login');
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#1e1b4b_0%,_#0f172a_45%,_#020617_100%)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex p-4 bg-cyan-400/20 rounded-full mb-4 border border-cyan-300/40">
            <Building2 className="w-12 h-12 text-cyan-300 animate-pulse" />
          </div>
          <p className="text-cyan-100">Inicializando panel empresarial...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#1e1b4b_0%,_#0f172a_45%,_#020617_100%)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex p-4 bg-cyan-400/20 rounded-full mb-4 border border-cyan-300/40">
            <Building2 className="w-12 h-12 text-cyan-300 animate-pulse" />
          </div>
          <p className="text-cyan-100">Cargando panel empresarial...</p>
        </div>
      </div>
    );
  }

  const totalEarnings = tripOffers.reduce((sum, trip) => sum + trip.priceXLM * trip.currentBookings, 0);
  const totalBookings = tripOffers.reduce((sum, trip) => sum + trip.currentBookings, 0);
  const activeTrips = tripOffers.filter(t => t.status === 'active').length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_#1e1b4b_0%,_#0f172a_45%,_#020617_100%)] p-6 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="pointer-events-none absolute -top-24 -left-20 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl animate-drift-slow" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl animate-drift" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-300/40 bg-cyan-400/10 backdrop-blur mb-4 animate-soft-float">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span className="text-sm font-semibold text-cyan-100">Panel de gestión para empresas</span>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <div className="relative inline-flex w-12 h-12 items-center justify-center bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 rounded-xl p-[2px] shadow-lg shadow-cyan-500/30">
                <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center">
                  <svg viewBox="0 0 64 64" className="w-7 h-7" aria-label="StudyTrips Global logo">
                    <path d="M10 41c8 0 15-3 21-8l8-7 14-6-5 10 6 3-7 4-2 8-8-2-6 7c-8 8-19 10-25 7 8-1 12-4 14-8-4 0-8-2-10-8z" fill="#22d3ee" />
                    <path d="M14 18c7-8 23-10 34-3" stroke="#93c5fd" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">{currentUser.companyName}</h1>
                <p className="text-cyan-100/80">Panel de Control de Empresa</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-cyan-100/90">
              <span className="inline-flex items-center gap-2"><Lock className="w-4 h-4 text-cyan-300" /> Seguro</span>
              <span className="inline-flex items-center gap-2"><Globe className="w-4 h-4 text-sky-300" /> Red global</span>
              <span className="inline-flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-300" /> Gestión rápida</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn-gloss bg-gradient-to-r from-red-500 to-rose-600 hover:brightness-110 text-white font-bold py-2.5 px-4 rounded-lg transition-all inline-flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/25 shadow-xl shadow-cyan-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ofertas Activas</p>
                <p className="text-3xl font-bold text-white mt-2">{activeTrips}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-cyan-300" />
            </div>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/25 shadow-xl shadow-cyan-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Reservas Totales</p>
                <p className="text-3xl font-bold text-cyan-300 mt-2">{totalBookings}</p>
              </div>
              <Users className="w-8 h-8 text-cyan-300" />
            </div>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/25 shadow-xl shadow-cyan-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ingresos Estimados</p>
                <p className="text-3xl font-bold text-emerald-300 mt-2">{totalEarnings.toFixed(2)} XLM</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-300" />
            </div>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/25 shadow-xl shadow-cyan-500/10">
            <div>
              <p className="text-gray-400 text-sm mb-2">Tu Wallet</p>
              <p className="text-sm text-cyan-300 font-mono break-all">{currentUser.publicKey.substring(0, 16)}...</p>
            </div>
          </div>
        </div>

        {/* Create Trip Button */}
        <div className="mb-8">
          <button
            onClick={handleCreateTrip}
            className="btn-gloss btn-cyan text-slate-950 font-bold py-3 px-6 rounded-lg transition-all shadow-lg inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva Oferta de Viaje
          </button>
        </div>

        {/* Trip Offers Table */}
        {tripOffers.length === 0 ? (
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-12 border border-cyan-400/25 text-center">
            <Building2 className="w-16 h-16 text-cyan-300/70 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No hay ofertas de viajes</h3>
            <p className="text-gray-400 mb-6">Crea tu primera oferta de viaje para comenzar</p>
            <button
              onClick={handleCreateTrip}
              className="btn-gloss btn-cyan text-slate-950 font-bold py-2 px-6 rounded-lg transition-all"
            >
              Crear Oferta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tripOffers.map(trip => (
              <div
                key={trip.id}
                className="bg-slate-900/70 backdrop-blur rounded-2xl p-6 border border-cyan-400/25 hover:border-cyan-300/55 transition-all"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-bold text-white">{trip.name}</h3>
                    <p className="text-gray-400 text-sm">{trip.destination}</p>
                    <div className="mt-2 space-y-1">
                      {trip.highlights.slice(0, 2).map((h) => (
                        <p key={h} className="text-gray-400 text-xs">✓ {h}</p>
                      ))}
                      {trip.highlights.length > 2 && (
                        <p className="text-gray-400 text-xs">+{trip.highlights.length - 2} más</p>
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">Precio</p>
                    <p className="text-2xl font-bold text-cyan-300">{trip.priceXLM} XLM</p>
                    <p className="text-gray-400 text-xs mt-1">{trip.duration}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">Reservas</p>
                    <p className="text-2xl font-bold text-emerald-300">{trip.currentBookings}</p>
                    <p className="text-gray-400 text-xs mt-1">de {trip.maxParticipants}</p>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleEditTrip(trip)}
                      className="btn-gloss p-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTrip(trip.id)}
                      className="btn-gloss p-2 bg-gradient-to-r from-red-500 to-rose-600 hover:brightness-110 text-white rounded-lg transition-all"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-cyan-400/25 p-8 max-w-2xl w-full max-h-screen overflow-y-auto shadow-2xl shadow-cyan-500/10">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingTrip ? 'Editar Oferta' : 'Nueva Oferta de Viaje'}
            </h2>

            <form onSubmit={handleSaveTrip} className="space-y-4">
              <div>
                <label htmlFor="trip-name" className="block text-white font-semibold mb-2">Nombre del Viaje *</label>
                <input
                  id="trip-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ej. Viaje a CDMX"
                  className="w-full px-4 py-2 bg-slate-950/70 border border-slate-700 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="trip-destination" className="block text-white font-semibold mb-2">Destino *</label>
                <input
                  id="trip-destination"
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="ej. Ciudad de México"
                  className="w-full px-4 py-2 bg-slate-950/70 border border-slate-700 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="trip-duration" className="block text-white font-semibold mb-2">Duración *</label>
                  <input
                    id="trip-duration"
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="ej. 5 días"
                    className="w-full px-4 py-2 bg-slate-950/70 border border-slate-700 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="trip-price" className="block text-white font-semibold mb-2">Precio (XLM) *</label>
                  <input
                    id="trip-price"
                    type="number"
                    value={formData.priceXLM}
                    onChange={(e) => setFormData({ ...formData, priceXLM: e.target.value })}
                    placeholder="50"
                    step="0.01"
                    className="w-full px-4 py-2 bg-slate-950/70 border border-slate-700 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="trip-max-participants" className="block text-white font-semibold mb-2">Max. Participantes *</label>
                  <input
                    id="trip-max-participants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                    placeholder="30"
                    className="w-full px-4 py-2 bg-slate-950/70 border border-slate-700 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="trip-status" className="block text-white font-semibold mb-2">Estado</label>
                  <select id="trip-status" className="w-full px-4 py-2 bg-slate-950/70 border border-slate-700 rounded-lg text-white focus:border-cyan-400 focus:outline-none">
                    <option>Activo</option>
                    <option>Inactivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="trip-description" className="block text-white font-semibold mb-2">Descripción</label>
                <textarea
                  id="trip-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el viaje..."
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-950/70 border border-slate-700 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="trip-highlights" className="block text-white font-semibold mb-2">Puntos destacados (uno por línea)</label>
                <textarea
                  id="trip-highlights"
                  value={formData.highlights}
                  onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                  placeholder="Museo de Antropología&#10;Pirámides de Teotihuacán&#10;Xochimilco"
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-950/70 border border-slate-700 rounded-lg text-white focus:border-cyan-400 focus:outline-none font-mono text-sm"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-gloss btn-cyan text-slate-950 font-bold py-2 px-4 rounded-lg transition-all"
                >
                  {editingTrip ? 'Actualizar' : 'Crear'} Oferta
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-gloss bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

        .animate-soft-float {
          animation: softFloat 6s ease-in-out infinite;
        }

        .animate-drift {
          animation: drift 18s ease-in-out infinite;
        }

        .animate-drift-slow {
          animation: drift 24s ease-in-out infinite;
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
      `}</style>
    </div>
  );
}







