'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { useUserRegistry } from '@/hooks/useUserRegistry';
import { usePersistUserRegistry } from '@/hooks/usePersistUserRegistry';
import TripOfferForm, { TripOfferFormData } from '@/components/TripOfferForm';
import { normalizeTripFormData, validateTripOfferData } from '@/lib/trip-validation';
import { Building2, LogOut, Plus, Users, TrendingUp, Edit, Trash2, Sparkles, Lock, Globe, Zap, ClipboardList, CheckCircle2, XCircle } from 'lucide-react';

interface TripOffer {
  id: string;
  companyWallet: string;
  companyName?: string;
  targetSector?: string;
  termsAndConditions?: string;
  maxApplications?: number;
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

interface OutstandingStudent {
  id: string;
  name: string;
  career: string;
  fundedProgram: string;
  location: string;
  performanceScore: number;
  skills: string[];
}

interface SponsorshipApplication {
  id: string;
  tripId: string;
  tripName: string;
  destination: string;
  companyWallet: string;
  companyName: string;
  studentWallet: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  studentSchool?: string;
  whyJoin: string;
  whyInterested: string;
  eventContribution: string;
  futureContribution: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

const outstandingStudentsMock: OutstandingStudent[] = [
  {
    id: 'stu-1',
    name: 'Valeria Gómez',
    career: 'Ing. Software',
    fundedProgram: 'Hackathon IA aplicada en Monterrey',
    location: 'México',
    performanceScore: 96,
    skills: ['React', 'Soroban', 'Product Thinking'],
  },
  {
    id: 'stu-2',
    name: 'Daniel Ríos',
    career: 'Ciberseguridad',
    fundedProgram: 'Bootcamp de Seguridad Cloud en Bogotá',
    location: 'Colombia',
    performanceScore: 92,
    skills: ['Pentesting', 'AWS', 'Automatización'],
  },
  {
    id: 'stu-3',
    name: 'Lucía Herrera',
    career: 'Ciencia de Datos',
    fundedProgram: 'Summit de Analítica en Buenos Aires',
    location: 'Argentina',
    performanceScore: 95,
    skills: ['Python', 'ML Ops', 'Storytelling'],
  },
  {
    id: 'stu-4',
    name: 'Emiliano Torres',
    career: 'UX + Frontend',
    fundedProgram: 'Hackathon de Producto Digital en CDMX',
    location: 'México',
    performanceScore: 90,
    skills: ['UX Research', 'TypeScript', 'Design Systems'],
  },
];

export default function CompanyDashboardPage() {
  // Sincronizar registry persistentemente
  usePersistUserRegistry();

  const router = useRouter();
  const { account, disconnectWallet } = useWallet();
  const { getCurrentUser } = useUserRegistry();

  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [tripOffers, setTripOffers] = useState<TripOffer[]>([]);
  const [applications, setApplications] = useState<SponsorshipApplication[]>([]);
  const [updatingApplicationId, setUpdatingApplicationId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<TripOffer | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [formData, setFormData] = useState<TripOfferFormData>({
    name: '',
    targetSector: '',
    maxApplications: '30',
    duration: '',
    description: '',
    termsAndConditions: '',
    status: 'active',
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
    loadApplicationsFromAPI(user.publicKey);
    setIsInitialized(true);
  }, [router, getCurrentUser]);

  const loadApplicationsFromAPI = async (walletKey?: string) => {
    try {
      const wallet = walletKey || currentUser?.publicKey || account?.publicKey;
      if (!wallet) return;

      const response = await fetch(`/api/sponsorship-applications?companyWallet=${encodeURIComponent(wallet)}`);
      const data = await response.json();

      if (data.success) {
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error cargando solicitudes de patrocinio:', error);
    }
  };

  const handleApplicationDecision = async (applicationId: string, status: 'accepted' | 'rejected') => {
    const wallet = currentUser?.publicKey || account?.publicKey;
    if (!wallet) return;

    try {
      setUpdatingApplicationId(applicationId);

      const response = await fetch('/api/sponsorship-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          companyWallet: wallet,
          status,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'No se pudo actualizar la solicitud');
      }

      await loadApplicationsFromAPI(wallet);
    } catch (error: any) {
      alert(error?.message || 'Error al procesar la solicitud.');
    } finally {
      setUpdatingApplicationId(null);
    }
  };

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
      targetSector: '',
      maxApplications: '30',
      duration: '',
      description: '',
      termsAndConditions: '',
      status: 'active',
    });
    setShowModal(true);
  };

  const handleEditTrip = (trip: TripOffer) => {
    setEditingTrip(trip);
    setFormData({
      name: trip.name,
      targetSector: trip.targetSector || '',
      maxApplications: String(trip.maxApplications ?? trip.maxParticipants ?? 30),
      duration: trip.duration,
      description: trip.description,
      termsAndConditions: trip.termsAndConditions || '',
      status: trip.status,
    });
    setShowModal(true);
  };

  const handleSaveTrip = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalized = normalizeTripFormData({
      name: formData.name,
      targetSector: formData.targetSector,
      maxApplications: formData.maxApplications,
      duration: formData.duration,
      description: formData.description,
      termsAndConditions: formData.termsAndConditions,
    });
    const errors = validateTripOfferData(normalized);
    if (errors.length > 0) {
      alert(errors[0]);
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
      companyName: currentUser?.companyName || editingTrip?.companyName || 'Empresa asociada',
      targetSector: normalized.targetSector,
      termsAndConditions: normalized.termsAndConditions,
      maxApplications: normalized.maxApplications,
      name: normalized.name,
      destination: normalized.destination,
      duration: normalized.duration,
      priceXLM: normalized.priceXLM,
      description: normalized.description,
      maxParticipants: normalized.maxApplications,
      currentBookings: editingTrip?.currentBookings || 0,
      status: formData.status || 'active',
      createdAt: editingTrip?.createdAt || new Date().toISOString(),
      highlights: normalized.highlights,
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

  const totalBookings = tripOffers.reduce((sum, trip) => sum + trip.currentBookings, 0);
  const activeTrips = tripOffers.filter(t => t.status === 'active').length;
  const pendingApplications = applications.filter((application) => application.status === 'pending').length;

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
            <div>
              <p className="text-gray-400 text-sm mb-2">Tu Wallet</p>
              <p className="text-sm text-cyan-300 font-mono break-all">{currentUser.publicKey.substring(0, 16)}...</p>
            </div>
          </div>
        </div>

        <div className="mb-8 bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/25 shadow-xl shadow-cyan-500/10">
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-cyan-300" />
                Solicitudes de patrocinio
              </h2>
              <p className="text-gray-400 text-sm mt-1">Postulantes que quieren unirse a tus programas de empresa.</p>
            </div>
            <span className="text-sm px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-200 border border-cyan-400/25">
              Pendientes: {pendingApplications}
            </span>
          </div>

          {applications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-cyan-400/25 bg-slate-950/40 p-5 text-sm text-gray-400">
              Aún no hay solicitudes de patrocinio para tus ofertas.
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => {
                const isPending = application.status === 'pending';
                let statusBadgeClass = 'bg-amber-500/20 text-amber-300';
                let statusBadgeLabel = 'Pendiente';

                if (application.status === 'accepted') {
                  statusBadgeClass = 'bg-emerald-500/20 text-emerald-300';
                  statusBadgeLabel = 'Aceptada';
                } else if (application.status === 'rejected') {
                  statusBadgeClass = 'bg-rose-500/20 text-rose-300';
                  statusBadgeLabel = 'Rechazada';
                }

                return (
                  <article key={application.id} className="rounded-xl border border-cyan-400/20 bg-slate-950/55 p-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">{application.studentName}</h3>
                        <p className="text-sm text-cyan-200">{application.studentEmail}</p>
                        <p className="text-xs text-gray-400 mt-1">Wallet: {application.studentWallet.substring(0, 16)}...</p>
                        {application.studentSchool && (
                          <p className="text-xs text-gray-400 mt-1">Escuela: {application.studentSchool}</p>
                        )}
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-sm text-white font-semibold">{application.tripName}</p>
                        <p className="text-xs text-gray-400">{application.destination}</p>
                        <span className={`inline-flex mt-2 items-center px-3 py-1 rounded-full text-xs font-bold ${statusBadgeClass}`}>
                          {statusBadgeLabel}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-slate-900/70 border border-slate-700 p-3">
                        <p className="text-cyan-200 font-semibold mb-1">Por qué quiere unirse</p>
                        <p className="text-gray-300">{application.whyJoin}</p>
                      </div>
                      <div className="rounded-lg bg-slate-900/70 border border-slate-700 p-3">
                        <p className="text-cyan-200 font-semibold mb-1">Interés en el evento</p>
                        <p className="text-gray-300">{application.whyInterested}</p>
                      </div>
                      <div className="rounded-lg bg-slate-900/70 border border-slate-700 p-3">
                        <p className="text-cyan-200 font-semibold mb-1">Aporte durante el evento</p>
                        <p className="text-gray-300">{application.eventContribution}</p>
                      </div>
                      <div className="rounded-lg bg-slate-900/70 border border-slate-700 p-3">
                        <p className="text-cyan-200 font-semibold mb-1">Aporte futuro si es reclutado</p>
                        <p className="text-gray-300">{application.futureContribution}</p>
                      </div>
                    </div>

                    {isPending && (
                      <div className="flex flex-wrap gap-3 mt-4">
                        <button
                          onClick={() => handleApplicationDecision(application.id, 'accepted')}
                          disabled={updatingApplicationId === application.id}
                          className="btn-gloss inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-60"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Aceptar solicitud
                        </button>
                        <button
                          onClick={() => handleApplicationDecision(application.id, 'rejected')}
                          disabled={updatingApplicationId === application.id}
                          className="btn-gloss inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:brightness-110 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-60"
                        >
                          <XCircle className="w-4 h-4" />
                          Rechazar solicitud
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="mb-8 bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/25 shadow-xl shadow-cyan-500/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Estudiantes destacados disponibles para tu empresa</h2>
              <p className="text-gray-400 text-sm">Talentos destacados que siguen disponibles para ser reclutados por tu empresa.</p>
            </div>
            <button
              onClick={handleCreateTrip}
              className="btn-gloss btn-cyan text-slate-950 font-bold py-3 px-6 rounded-lg transition-all shadow-lg inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nueva Oferta
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outstandingStudentsMock.map((student) => (
              <article
                key={student.id}
                className="rounded-xl border border-cyan-400/20 bg-slate-950/50 p-4 hover:border-cyan-300/40 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{student.name}</h3>
                    <p className="text-sm text-cyan-200">{student.career} • {student.location}</p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300">
                    Score {student.performanceScore}/100
                  </span>
                </div>

                <p className="text-sm text-gray-300 mb-3">
                  Programa financiado: <span className="text-white font-semibold">{student.fundedProgram}</span>
                </p>

                <div className="flex flex-wrap gap-2">
                  {student.skills.map((skill) => (
                    <span key={skill} className="text-xs px-2 py-1 rounded-full bg-cyan-500/15 text-cyan-200 border border-cyan-400/25">
                      {skill}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-bold text-white">{trip.name}</h3>
                    <p className="text-gray-400 text-sm">{trip.destination}</p>
                    <p className="text-xs text-gray-300 mt-1">Maximo de postulaciones: {trip.maxApplications ?? trip.maxParticipants}</p>
                    <p className="text-xs text-cyan-200 mt-1">Empresa visible para estudiantes: {trip.companyName || currentUser.companyName}</p>
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
                    <p className="text-gray-400 text-xs mb-1">Duracion</p>
                    <p className="text-2xl font-bold text-cyan-300">{trip.duration}</p>
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

            <TripOfferForm
              formData={formData}
              onChange={setFormData}
              onSubmit={handleSaveTrip}
              submitLabel={`${editingTrip ? 'Actualizar' : 'Crear'} Oferta`}
              cancelLabel="Cancelar"
              onCancel={() => setShowModal(false)}
            />
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







