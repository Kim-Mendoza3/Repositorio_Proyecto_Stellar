'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { useUserRegistry } from '@/hooks/useUserRegistry';
import { usePersistUserRegistry } from '@/hooks/usePersistUserRegistry';
import { useTripOffers, TripOffer } from '@/hooks/useTripOffers';
import { MapPin, LogOut, Wallet, Check, Loader, RotateCw, Sparkles, Globe, Zap, Lock } from 'lucide-react';

interface StudentApplication {
  id: string;
  tripId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export default function AvailableTripsPage() {
  // Sincronizar registry persistentemente
  usePersistUserRegistry();

  const router = useRouter();
  const { account, disconnectWallet } = useWallet();
  const { getCurrentUser } = useUserRegistry();
  const { trips, loading, loadAllTrips } = useTripOffers();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<TripOffer | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [joinReason, setJoinReason] = useState('');
  const [filterDestination, setFilterDestination] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadStudentApplications = async (studentWallet: string) => {
    try {
      const response = await fetch(`/api/sponsorship-applications?studentWallet=${encodeURIComponent(studentWallet)}`);
      const data = await response.json();
      if (data.success) {
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error cargando solicitudes del estudiante:', error);
    }
  };

  // Verificar si está autenticado
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    console.log(`✅ [AVAILABLE-TRIPS] Usuario autenticado: ${user.userType} (${user.name || user.companyName})`);
    setCurrentUser(user);
    setIsInitialized(true);
  }, [router, account?.publicKey]);

  useEffect(() => {
    if (account?.publicKey) {
      loadStudentApplications(account.publicKey);
    }
  }, [account?.publicKey]);

  // Funcion para refrescar viajes manualmente
  const handleRefreshTrips = async () => {
    setRefreshing(true);
    console.log('Refrescando lista de viajes...');
    await loadAllTrips();
    setRefreshing(false);
  };

  const filteredTrips = trips.filter(trip => {
    const matchesDestination = trip.destination.toLowerCase().includes(filterDestination.toLowerCase()) || 
                               trip.name.toLowerCase().includes(filterDestination.toLowerCase());
    return matchesDestination;
  });

  const handleLogout = () => {
    disconnectWallet();
    localStorage.removeItem('current_user');
    localStorage.removeItem('user_wallet');
    router.push('/login');
  };

  const handleReserveTrip = (trip: TripOffer) => {
    if (trip.currentBookings >= trip.maxParticipants) {
      alert('Este viaje esta lleno');
      return;
    }
    setSelectedTrip(trip);
    setShowReservationModal(true);
    setPaymentStatus('idle');
    setJoinReason('');
  };

  const handleConfirmReservation = async () => {
    if (!selectedTrip || !account?.publicKey) return;

    if (joinReason.trim().length < 10) {
      alert('Comparte brevemente por que quieres unirte a esta oferta (minimo 10 caracteres).');
      return;
    }

    try {
      setProcessingPayment(true);

      const response = await fetch('/api/sponsorship-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: selectedTrip.id,
          tripName: selectedTrip.name || selectedTrip.destination,
          destination: selectedTrip.destination,
          companyWallet: selectedTrip.companyWallet,
          companyName: selectedTrip.companyName || 'Empresa verificada',
          studentWallet: account.publicKey,
          studentName: currentUser?.name || 'Estudiante',
          studentEmail: currentUser?.email || 'Sin correo',
          studentPhone: currentUser?.phone || '',
          studentSchool: currentUser?.school || '',
          whyJoin: joinReason.trim(),
          whyInterested: joinReason.trim(),
          eventContribution: 'Disponible para colaborar activamente durante el evento.',
          futureContribution: 'Interes en aportar valor al equipo en un posible reclutamiento.',
          acceptedTerms: true,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'No se pudo enviar la solicitud');
      }

      setPaymentStatus('success');
      await loadStudentApplications(account.publicKey);

      setTimeout(() => {
        setShowReservationModal(false);
        setSelectedTrip(null);
        setPaymentStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Error procesando reserva:', error);
      setPaymentStatus('error');
    } finally {
      setProcessingPayment(false);
    }
  };

  const getApplicationByTrip = (tripId: string) => {
    return applications.find((application) => application.tripId === tripId);
  };

  const renderTripsContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
            <p className="text-cyan-100 text-lg">Cargando ofertas disponibles...</p>
          </div>
        </div>
      );
    }

    if (filteredTrips.length === 0) {
      return (
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-16 border border-cyan-400/25 text-center">
          <MapPin className="w-20 h-20 text-cyan-400/30 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">No hay ofertas disponibles</h3>
          <p className="text-gray-400 mb-8">Intenta ajustar los filtros o actualiza la pagina</p>
          <button
            onClick={handleRefreshTrips}
            disabled={refreshing || loading}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-lg transition-all"
          >
            {refreshing || loading ? 'Actualizando...' : 'Actualizar ofertas'}
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrips.map(trip => {
          const tripApplication = getApplicationByTrip(trip.id);
          const isReserved = tripApplication?.status === 'accepted';
          const isPending = tripApplication?.status === 'pending';
          const spotsLeft = trip.maxParticipants - trip.currentBookings;
          const isFull = spotsLeft <= 0;

          let statusBadge = (
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/20">
              Disponible
            </span>
          );

          if (isFull) {
            statusBadge = (
              <span className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-400/20">Programa completo</span>
            );
          } else if (isReserved) {
            statusBadge = (
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 flex items-center gap-1">
                <Check className="w-3 h-3" /> Reservado
              </span>
            );
          } else if (spotsLeft <= 2) {
            statusBadge = (
              <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/20">
                {spotsLeft} lugar disponible
              </span>
            );
          }

          let reserveButtonClass = 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white border border-cyan-400/30';
          let reserveButtonLabel = 'Reservar';

          if (isReserved) {
            reserveButtonClass = 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 cursor-default';
            reserveButtonLabel = 'Reservado';
          } else if (isPending) {
            reserveButtonClass = 'bg-amber-600/20 text-amber-300 border border-amber-500/30 cursor-default';
            reserveButtonLabel = 'Solicitud enviada';
          } else if (isFull) {
            reserveButtonClass = 'bg-gray-600/20 text-gray-400 cursor-not-allowed border border-gray-500/20';
            reserveButtonLabel = 'Lleno';
          }

          return (
            <div
              key={trip.id}
              className="bg-slate-900/70 backdrop-blur-xl rounded-2xl overflow-hidden border border-cyan-400/25 hover:border-cyan-300/55 transition-all duration-300 shadow-xl hover:shadow-cyan-500/20 flex flex-col"
            >
              <div className="h-32 bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-purple-500/20 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="w-10 h-10 text-cyan-400/40" />
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <p className="text-xs text-cyan-200/70 mb-2 font-semibold">Por: <span className="text-cyan-300">{trip.companyName}</span></p>
                <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">{trip.name}</h3>
                <p className="text-sm text-gray-400 mb-3">{trip.destination}</p>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{trip.description}</p>

                {trip.highlights.length > 0 && (
                  <div className="mb-3 space-y-1">
                    {trip.highlights.slice(0, 2).map((h) => (
                      <p key={`${trip.id}-${h}`} className="text-xs text-cyan-200/80">✓ {h}</p>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                  <div className="bg-cyan-500/10 rounded-lg p-2 border border-cyan-400/20">
                    <p className="text-xs text-gray-400">Duracion</p>
                    <p className="text-sm font-bold text-cyan-300">{trip.duration}</p>
                  </div>
                  <div className="bg-indigo-500/10 rounded-lg p-2 border border-indigo-400/20">
                    <p className="text-xs text-gray-400">Lugares</p>
                    <p className="text-sm font-bold text-indigo-300">{trip.currentBookings}/{trip.maxParticipants}</p>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-3 mt-auto">
                  <div>{statusBadge}</div>
                  <button
                    onClick={() => handleReserveTrip(trip)}
                    disabled={isFull || isReserved || isPending}
                    className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-1 ${reserveButtonClass}`}
                  >
                    {reserveButtonLabel}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderReservationModalBody = () => {
    if (!selectedTrip) return null;

    if (paymentStatus === 'success') {
      return (
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Solicitud enviada</h2>
          <p className="text-gray-400 mb-6">Tu solicitud fue registrada exitosamente.</p>

          <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-cyan-400/20 text-left">
            <p className="text-gray-300 text-sm mb-2 font-semibold">{selectedTrip.name}</p>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Estado:</span>
              <span className="text-emerald-400 font-bold">En revision</span>
            </div>
          </div>

          <p className="text-gray-400 text-sm">La empresa revisara tu solicitud en breve.</p>
        </div>
      );
    }

    if (paymentStatus === 'error') {
      return (
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✕</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Error al enviar</h2>
          <p className="text-gray-400 mb-6">No se pudo procesar tu solicitud. Intenta nuevamente.</p>

          <button
            onClick={() => {
              setShowReservationModal(false);
              setSelectedTrip(null);
              setPaymentStatus('idle');
            }}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-all"
          >
            Cerrar
          </button>
        </div>
      );
    }

    return (
      <>
        <h2 className="text-2xl font-bold text-white mb-6">Confirmar Reserva</h2>

        <div className="bg-slate-950/50 rounded-lg p-4 mb-6 border border-cyan-400/20">
          <h3 className="text-lg font-bold text-white mb-3">{selectedTrip.name}</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p><span className="text-gray-400">Destino:</span> {selectedTrip.destination}</p>
            <p><span className="text-gray-400">Duracion:</span> {selectedTrip.duration}</p>
            <p><span className="text-gray-400">Empresa:</span> {selectedTrip.companyName}</p>
          </div>
        </div>

        <div className="bg-cyan-500/10 rounded-lg p-4 mb-6 border border-cyan-400/30">
          <label htmlFor="join-reason" className="text-gray-200 font-semibold block mb-2">
            ¿Por que quieres unirte a esta oferta?
          </label>
          <textarea
            id="join-reason"
            value={joinReason}
            onChange={(e) => setJoinReason(e.target.value)}
            rows={4}
            placeholder="Describe brevemente tu interes y lo que puedes aportar."
            className="w-full px-3 py-2 bg-slate-950/60 border border-cyan-400/30 rounded-lg text-white focus:border-cyan-300 focus:outline-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowReservationModal(false);
              setSelectedTrip(null);
            }}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-all"
            disabled={processingPayment}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmReservation}
            disabled={processingPayment}
            className="flex-1 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {processingPayment ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                Acepta (enviar)
              </>
            )}
          </button>
        </div>
      </>
    );
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#1e1b4b_0%,_#0f172a_45%,_#020617_100%)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex p-4 bg-cyan-400/20 rounded-full mb-4 border border-cyan-300/40">
            <Wallet className="w-12 h-12 text-cyan-300 animate-pulse" />
          </div>
          <p className="text-cyan-100">Inicializando...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#1e1b4b_0%,_#0f172a_45%,_#020617_100%)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex p-4 bg-cyan-400/20 rounded-full mb-4 border border-cyan-300/40">
            <Wallet className="w-12 h-12 text-cyan-300 animate-pulse" />
          </div>
          <p className="text-cyan-100">Cargando ofertas disponibles...</p>
        </div>
      </div>
    );
  }

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
              <span className="text-sm font-semibold text-cyan-100">Oportunidades de estudio global</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Ofertas Disponibles</h1>
            <p className="text-cyan-100/80">Hackatones, programas academicos y oportunidades exclusivas de empresas</p>
            <div className="flex flex-wrap gap-3 text-sm text-cyan-100/90 mt-3">
              <span className="inline-flex items-center gap-2"><Lock className="w-4 h-4 text-cyan-300" /> Seguro</span>
              <span className="inline-flex items-center gap-2"><Globe className="w-4 h-4 text-sky-300" /> Red global</span>
              <span className="inline-flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-300" /> Pagos al instante</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-gloss bg-gradient-to-r from-red-500 to-rose-600 hover:brightness-110 text-white font-bold py-2.5 px-4 rounded-lg transition-all inline-flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesion
          </button>
        </div>

        {/* User Info */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-cyan-400/25 shadow-xl shadow-cyan-500/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-gray-300">Conectado como: <span className="text-cyan-300 font-bold">{currentUser.name}</span></p>
              <p className="text-xs text-gray-400 font-mono mt-1">{account?.publicKey.substring(0, 24)}...</p>
            </div>
            <div className="text-right">
              <p className="text-gray-300 text-xs mb-1">Estado</p>
              <p className="text-lg font-bold text-cyan-300">Perfil habilitado para postular</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-cyan-400/25 shadow-xl shadow-cyan-500/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Filtrar ofertas</h2>
            <button
              onClick={handleRefreshTrips}
              disabled={refreshing || loading}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg transition-all text-sm"
            >
              <RotateCw className={`w-4 h-4 ${refreshing || loading ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="destination-filter" className="block text-gray-300 text-sm font-semibold mb-2">Destino o tipo de programa</label>
              <input
                id="destination-filter"
                type="text"
                value={filterDestination}
                onChange={(e) => setFilterDestination(e.target.value)}
                placeholder="Ej: Hackathon, Buenos Aires, Bootcamp..."
                className="w-full px-4 py-3 bg-slate-950/50 border border-cyan-400/30 rounded-lg text-white focus:border-cyan-300 focus:outline-none transition-all"
              />
            </div>
            <div className="flex items-end">
              <p className="text-sm text-cyan-200">Usa el filtro por destino para encontrar la mejor oferta para ti.</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-cyan-200">
            Encontrados: <span className="font-bold text-lg text-cyan-300">{filteredTrips.length}</span> {filteredTrips.length === 1 ? 'oferta' : 'ofertas'}
          </div>
        </div>

        {/* Trips Grid */}
        {renderTripsContent()}

        {/* My Applications Section */}
        {applications.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-white mb-6">Mis Solicitudes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map((application) => {
                const trip = trips.find(t => t.id === application.tripId);
                if (!trip) return null;

                let statusLabel = 'En revision';
                let statusClass = 'text-amber-300';

                if (application.status === 'accepted') {
                  statusLabel = 'Aceptada';
                  statusClass = 'text-emerald-300';
                } else if (application.status === 'rejected') {
                  statusLabel = 'Rechazada';
                  statusClass = 'text-rose-300';
                }

                return (
                  <div
                    key={application.id}
                    className="bg-gradient-to-br from-emerald-500/10 to-slate-900 rounded-2xl p-6 border border-emerald-400/30 shadow-xl"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Check className="w-5 h-5 text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-300">CONFIRMADA</span>
                        </div>
                        <h4 className="text-lg font-bold text-white">{trip.name}</h4>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300 mb-4">
                      <p><span className="text-gray-400">Destino:</span> <span className="text-white font-semibold">{trip.destination}</span></p>
                      <p><span className="text-gray-400">Empresa:</span> <span className="text-cyan-200">{trip.companyName}</span></p>
                      <p><span className="text-gray-400">Estado:</span> <span className={`font-bold ${statusClass}`}>{statusLabel}</span></p>
                      <p className="text-xs text-gray-500">Enviada: {new Date(application.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Reservation Modal */}
      {showReservationModal && selectedTrip && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-cyan-400/25 p-8 max-w-md w-full shadow-2xl shadow-cyan-500/20">
            {renderReservationModalBody()}
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
