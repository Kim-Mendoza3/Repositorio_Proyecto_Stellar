'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { useTripOffers } from '@/hooks/useTripOffers';
import { LogOut, Wallet, Copy, Check, X, Sparkles, Lock, Globe, Zap } from 'lucide-react';
import TransactionHistory from '@/components/TransactionHistory';

interface SponsorshipApplication {
  id: string;
  tripId: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export default function DashboardPage() {
  const router = useRouter();
  const { account, disconnectWallet } = useWallet();
  const { trips, loading, loadAllTrips } = useTripOffers();
  const [copied, setCopied] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [studentApplications, setStudentApplications] = useState<SponsorshipApplication[]>([]);
  const [selectedTripForApplication, setSelectedTripForApplication] = useState<any>(null);
  const [showSponsorshipModal, setShowSponsorshipModal] = useState(false);
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    whyJoin: '',
    whyInterested: '',
    eventContribution: '',
    futureContribution: '',
    acceptedTerms: false,
  });

  const loadStudentApplications = async (studentWallet: string) => {
    try {
      const response = await fetch(`/api/sponsorship-applications?studentWallet=${encodeURIComponent(studentWallet)}`);
      const data = await response.json();

      if (data.success) {
        setStudentApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error cargando postulaciones del estudiante:', error);
    }
  };

  useEffect(() => {
    setIsInitialized(true);
    // Verificar si hay sesión activa
    const walletAddress = localStorage.getItem('walletAddress');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const currentUserRaw = localStorage.getItem('current_user');
    if (currentUserRaw) {
      setCurrentUser(JSON.parse(currentUserRaw));
    }
    
    if (!walletAddress || !isAuthenticated) {
      router.push('/login');
    }

    // Cargar ofertas
    loadAllTrips();
  }, [router]);

  useEffect(() => {
    if (account?.publicKey) {
      loadStudentApplications(account.publicKey);
    }
  }, [account?.publicKey]);

  if (!isInitialized || !account) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#1e1b4b_0%,_#0f172a_45%,_#020617_100%)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex p-4 bg-cyan-400/20 rounded-full mb-4 border border-cyan-300/40">
            <Wallet className="w-12 h-12 text-cyan-300 animate-pulse" />
          </div>
          <p className="text-cyan-100">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(account.publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    disconnectWallet();
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('loginTime');
    router.push('/login');
  };

  const getApplicationForTrip = (tripId: string) => {
    return studentApplications.find((application) => application.tripId === tripId);
  };

  const openSponsorshipModal = (trip: any) => {
    setSelectedTripForApplication(trip);
    setApplicationForm({
      whyJoin: '',
      whyInterested: '',
      eventContribution: '',
      futureContribution: '',
      acceptedTerms: false,
    });
    setShowSponsorshipModal(true);
  };

  const handleSubmitSponsorshipApplication = async () => {
    if (!account?.publicKey || !selectedTripForApplication) return;

    const fields = [
      applicationForm.whyJoin,
      applicationForm.whyInterested,
      applicationForm.eventContribution,
      applicationForm.futureContribution,
    ];

    if (fields.some((value) => value.trim().length < 10)) {
      alert('Completa todos los campos con al menos 10 caracteres.');
      return;
    }

    if (!applicationForm.acceptedTerms) {
      alert('Debes aceptar los términos y condiciones para continuar.');
      return;
    }

    setSubmittingApplication(true);
    try {
      const response = await fetch('/api/sponsorship-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: selectedTripForApplication.id,
          tripName: selectedTripForApplication.name || selectedTripForApplication.destination,
          destination: selectedTripForApplication.destination,
          companyWallet: selectedTripForApplication.companyWallet,
          companyName: selectedTripForApplication.companyName || 'Empresa verificada',
          studentWallet: account.publicKey,
          studentName: currentUser?.name || 'Estudiante',
          studentEmail: currentUser?.email || 'Sin correo',
          studentPhone: currentUser?.phone || '',
          studentSchool: currentUser?.school || '',
          whyJoin: applicationForm.whyJoin.trim(),
          whyInterested: applicationForm.whyInterested.trim(),
          eventContribution: applicationForm.eventContribution.trim(),
          futureContribution: applicationForm.futureContribution.trim(),
          acceptedTerms: true,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'No se pudo enviar la postulación');
      }

      await loadStudentApplications(account.publicKey);
      setShowSponsorshipModal(false);
      setSelectedTripForApplication(null);
      alert('Tu solicitud fue enviada exitosamente.');
    } catch (error: any) {
      alert(error?.message || 'Error enviando la solicitud.');
    } finally {
      setSubmittingApplication(false);
    }
  };

  const renderTripsSection = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center gap-2 text-gray-400 py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-300"></div>
          Cargando ofertas...
        </div>
      );
    }

    if (trips.length === 0) {
      return (
        <div className="bg-slate-900/70 rounded-2xl p-12 text-center border border-cyan-400/25">
          <p className="text-gray-400 mb-4">No hay ofertas disponibles en este momento</p>
          <button
            onClick={() => router.push('/available-trips')}
            className="btn-gloss btn-cyan text-slate-950 font-bold py-2 px-6 rounded-lg transition-all"
          >
            Ver todas las ofertas
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.slice(0, 3).map((trip, idx) => {
          const existingApplication = getApplicationForTrip(trip.id);
          const isPending = existingApplication?.status === 'pending';
          const isAccepted = existingApplication?.status === 'accepted';
          let applicationStatusClass = 'text-rose-300';
          let applicationStatusLabel = 'Rechazado';
          let applicationButtonLabel = 'Unirme a patrocinio';

          if (isAccepted) {
            applicationStatusClass = 'text-emerald-300';
            applicationStatusLabel = 'Aceptado';
            applicationButtonLabel = 'Aceptado';
          } else if (isPending) {
            applicationStatusClass = 'text-amber-300';
            applicationStatusLabel = 'En revision';
            applicationButtonLabel = 'Postulacion enviada';
          }

          const colors = [
            {
              topGradient: 'from-cyan-500/20 to-sky-500/20',
              chipClass: 'bg-cyan-500/20 text-cyan-300',
              btnClass: 'btn-cyan text-slate-950',
            },
            {
              topGradient: 'from-indigo-500/20 to-blue-500/20',
              chipClass: 'bg-indigo-500/20 text-indigo-300',
              btnClass: 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white',
            },
            {
              topGradient: 'from-amber-500/20 to-orange-500/20',
              chipClass: 'bg-amber-500/20 text-amber-300',
              btnClass: 'btn-amber text-slate-900',
            },
          ];
          const color = colors[idx % 3];

          return (
            <div key={trip.id} className="bg-slate-900/70 rounded-2xl overflow-hidden border border-white/10 shadow-xl hover:border-cyan-300/40 transition-all duration-300 hover:-translate-y-1">
              <div className={`h-40 bg-gradient-to-br ${color.topGradient}`}></div>
              <div className="p-6">
                <p className="text-xs text-gray-400 mb-2">
                  Empresa: <span className="text-cyan-200 font-semibold">{trip.companyName || 'Empresa verificada'}</span>
                </p>
                <h3 className="text-lg font-bold text-white mb-2">{trip.name || trip.destination}</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {trip.description || 'Descubre este increíble destino de estudio'}
                </p>
                {existingApplication && (
                  <p className={`text-xs mb-3 font-semibold ${applicationStatusClass}`}>
                    Estado de postulacion: {applicationStatusLabel}
                  </p>
                )}
                <div className="flex items-center justify-end mb-4">
                  <span className={`text-xs px-3 py-1 rounded-full ${color.chipClass}`}>
                    {trip.duration || 3} días
                  </span>
                </div>
                <button
                  onClick={() => openSponsorshipModal(trip)}
                  disabled={isPending || isAccepted}
                  className={`w-full btn-gloss font-bold py-2 px-4 rounded-lg transition-all ${
                    isPending || isAccepted
                      ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                      : `${color.btnClass} hover:scale-[1.02]`
                  }`}
                >
                  {applicationButtonLabel}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_#1e1b4b_0%,_#0f172a_45%,_#020617_100%)] p-6 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="pointer-events-none absolute -top-24 -left-20 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl animate-drift-slow" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl animate-drift" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-300/40 bg-cyan-400/10 backdrop-blur mb-4 animate-soft-float">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span className="text-sm font-semibold text-cyan-100">Panel financiero de estudiante</span>
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
                <h1 className="text-3xl md:text-4xl font-bold text-white">Dashboard</h1>
                <p className="text-cyan-100/80">Bienvenido a StudyTrips Global</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-cyan-100/90">
              <span className="inline-flex items-center gap-2"><Lock className="w-4 h-4 text-cyan-300" /> Seguro</span>
              <span className="inline-flex items-center gap-2"><Globe className="w-4 h-4 text-sky-300" /> Red global</span>
              <span className="inline-flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-300" /> Transacciones rápidas</span>
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Info Card */}
          <div className="lg:col-span-2 bg-slate-900/70 backdrop-blur-xl rounded-2xl p-8 border border-cyan-400/25 shadow-xl shadow-cyan-500/10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Wallet className="w-6 h-6 text-cyan-300" />
              Información de Wallet
            </h2>

            <div className="space-y-4">
              {/* Address */}
              <div>
                <label htmlFor="wallet-address" className="text-sm font-semibold text-gray-400 mb-2 block">
                  Dirección de Wallet
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="wallet-address"
                    type="text"
                    readOnly
                    value={account.publicKey}
                    className="flex-1 bg-slate-950/80 border border-slate-600 rounded-lg px-4 py-3 text-cyan-300 font-mono text-sm"
                  />
                  <button
                    onClick={handleCopyAddress}
                    className="btn-gloss btn-cyan text-slate-950 px-4 py-3 rounded-lg transition-all flex items-center gap-2 font-semibold"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Estado de cuenta */}
              <div>
                <p className="text-sm font-semibold text-gray-400 mb-2 block">
                  Estado de cuenta
                </p>
                <div className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-3">
                  <p className="text-cyan-200 text-sm">Perfil listo para postularse a ofertas de patrocinio.</p>
                </div>
              </div>

              {/* Network Info */}
              <div className="bg-cyan-500/10 border border-cyan-300/30 rounded-lg p-4">
                <p className="text-cyan-200 text-sm">
                  ✓ Conectado a Stellar Testnet<br/>
                  ✓ Freighter wallet activa<br/>
                  ✓ Listo para realizar transacciones
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="bg-slate-900/70 rounded-2xl p-6 border border-cyan-400/30 shadow-xl shadow-cyan-500/10">
              <h3 className="text-lg font-bold text-white mb-4">Ofertas de empresas</h3>
              <p className="text-gray-300 text-sm mb-4">
                Revisa hackatones, programas académicos y nuevas oportunidades publicadas por empresas.
              </p>
              <button
                onClick={() => router.push('/available-trips')}
                className="w-full btn-gloss btn-cyan text-slate-950 font-bold py-2 px-4 rounded-lg transition-all shadow-lg hover:scale-[1.02]"
              >
                Ver ofertas disponibles
              </button>
            </div>

            <div className="bg-slate-900/70 rounded-2xl p-6 border border-cyan-400/25 shadow-xl shadow-cyan-500/10">
              <h3 className="text-lg font-bold text-white mb-4">Transacciones</h3>
              <p className="text-gray-400 text-sm mb-4">
                Visualiza tu historial de pagos y reservas completadas.
              </p>
              <button
                onClick={() => setShowTransactionHistory(true)}
                className="w-full btn-gloss btn-cyan text-slate-950 font-bold py-2 px-4 rounded-lg transition-all hover:scale-[1.02]"
              >
                Ver historial
              </button>
            </div>
          </div>
        </div>

        {/* Travel Packages Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Ofertas recientes de empresas</h2>
          {renderTripsSection()}
        </div>
      </div>

      {/* Transaction History Modal */}
      {showTransactionHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-cyan-400/25 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-900">
              <h2 className="text-xl font-bold text-white">Historial de Transacciones</h2>
              <button
                onClick={() => setShowTransactionHistory(false)}
                className="text-gray-400 hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <TransactionHistory />
            </div>
          </div>
        </div>
      )}

      {/* Sponsorship Application Modal */}
      {showSponsorshipModal && selectedTripForApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-cyan-400/25 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-900">
              <h2 className="text-xl font-bold text-white">Solicitud de Patrocinio: {selectedTripForApplication.name || selectedTripForApplication.destination}</h2>
              <button
                onClick={() => {
                  setShowSponsorshipModal(false);
                  setSelectedTripForApplication(null);
                }}
                className="text-gray-400 hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-300">
                Completa esta postulación explicando por qué te interesa participar y qué valor aportarías a la empresa.
              </p>

              <div>
                <label htmlFor="why-join" className="block text-sm text-gray-300 mb-2">¿Por qué te quieres unir?</label>
                <textarea
                  id="why-join"
                  value={applicationForm.whyJoin}
                  onChange={(e) => setApplicationForm((prev) => ({ ...prev, whyJoin: e.target.value }))}
                  rows={3}
                  className="w-full bg-slate-950/60 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="why-interested" className="block text-sm text-gray-300 mb-2">¿Por qué estás interesado en este evento?</label>
                <textarea
                  id="why-interested"
                  value={applicationForm.whyInterested}
                  onChange={(e) => setApplicationForm((prev) => ({ ...prev, whyInterested: e.target.value }))}
                  rows={3}
                  className="w-full bg-slate-950/60 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="event-contribution" className="block text-sm text-gray-300 mb-2">¿Qué estás dispuesto a aportar a la empresa durante el evento?</label>
                <textarea
                  id="event-contribution"
                  value={applicationForm.eventContribution}
                  onChange={(e) => setApplicationForm((prev) => ({ ...prev, eventContribution: e.target.value }))}
                  rows={3}
                  className="w-full bg-slate-950/60 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="future-contribution" className="block text-sm text-gray-300 mb-2">Si la empresa te recluta en el futuro, ¿qué aportarías?</label>
                <textarea
                  id="future-contribution"
                  value={applicationForm.futureContribution}
                  onChange={(e) => setApplicationForm((prev) => ({ ...prev, futureContribution: e.target.value }))}
                  rows={3}
                  className="w-full bg-slate-950/60 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <label className="flex items-start gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={applicationForm.acceptedTerms}
                  onChange={(e) => setApplicationForm((prev) => ({ ...prev, acceptedTerms: e.target.checked }))}
                  className="mt-1"
                />{' '}
                Acepto terminos y condiciones del patrocinio, y me comprometo a mantener un comportamiento profesional durante el evento.
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowSponsorshipModal(false);
                    setSelectedTripForApplication(null);
                  }}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                  disabled={submittingApplication}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitSponsorshipApplication}
                  className="w-full btn-gloss btn-cyan text-slate-950 font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-60"
                  disabled={submittingApplication}
                >
                  {submittingApplication ? 'Enviando...' : 'Enviar solicitud'}
                </button>
              </div>
            </div>
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







