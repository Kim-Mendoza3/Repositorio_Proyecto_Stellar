'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { useUserRegistry, type UserType } from '@/hooks/useUserRegistry';
import { usePersistUserRegistry } from '@/hooks/usePersistUserRegistry';
import { Download, CheckCircle, AlertCircle, ArrowRight, Loader, Building2, User, LogIn, Sparkles, Globe, Lock, Zap, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

export default function RegisterNewPage() {
  // Sincronizar registry persistentemente
  usePersistUserRegistry();

  const router = useRouter();
  const { account, connectWallet } = useWallet();
  const { registerUser, getCurrentUser, getUserByWallet } = useUserRegistry();
  
  // Pasos: userdata -> usertype -> wallet -> success
  const [step, setStep] = useState<'userdata' | 'usertype' | 'usertype-form' | 'wallet' | 'success'>('userdata');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
  const [formError, setFormError] = useState('');
  const [manualWalletAddress, setManualWalletAddress] = useState('');
  
  // Datos del usuario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    // Empresa
    companyName: '',
    businessLicense: '',
    // Cliente
    studentId: '',
    school: '',
  });

  // Si ya está conectado y registrado, ir al dashboard
  useEffect(() => {
    if (account) {
      const currentUser = getCurrentUser();
      if (currentUser) {
        // Ya está registrado
        if (currentUser.userType === 'company') {
          router.push('/company-dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    }
  }, [account, getCurrentUser, router]);

  // ============ PASO 1: DATOS DEL USUARIO ============
  const handleUserDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Nombre y email son requeridos');
      return;
    }

    if (!formData.email.includes('@')) {
      setFormError('Email inválido');
      return;
    }

    const normalizedPhone = formData.phone.replace(/\D/g, '');
    if (normalizedPhone && normalizedPhone.length !== 10) {
      setFormError('El teléfono debe tener exactamente 10 dígitos');
      return;
    }

    // Avanzar a selección de tipo
    setStep('usertype');
  };

  // ============ PASO 2: SELECCIONAR TIPO ============
  const handleSelectType = (type: UserType) => {
    setSelectedUserType(type);
    setStep('usertype-form');
  };

  // ============ PASO 3: FORMULARIO POR TIPO ============
  const handleTypeFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedUserType) {
      setFormError('Tipo de usuario no seleccionado');
      return;
    }

    // Validaciones específicas
    if (selectedUserType === 'company') {
      if (!formData.companyName.trim()) {
        setFormError('Nombre de empresa requerido');
        return;
      }
      if (!formData.businessLicense.trim()) {
        setFormError('Licencia comercial requerida');
        return;
      }
    } else if (selectedUserType === 'client') {
      if (!formData.school.trim()) {
        setFormError('Nombre de escuela requerido');
        return;
      }
      if (!formData.studentId.trim()) {
        setFormError('ID de estudiante requerido');
        return;
      }
    }

    // Avanzar a paso de wallet
    setStep('wallet');
  };

  // ============ PASO 4A: CONECTAR CON FREIGHTER ============
  const handleConnectFreighter = async () => {
    setIsProcessing(true);
    setFormError('');

    try {
      // Conectar wallet - el hook manejará todo
      const walletAccount = await connectWallet();
      if (!walletAccount) {
        throw new Error('No se pudo conectar la wallet');
      }

      // Verificar si esta wallet ya está registrada (async)
      const existingUser = await getUserByWallet(walletAccount.publicKey);
      if (existingUser) {
        setFormError('Esta wallet ya está registrada. Intenta iniciar sesión.');
        setIsProcessing(false);
        return;
      }

      // Registrar nuevo usuario
      if (!selectedUserType) {
        throw new Error('Tipo de usuario no seleccionado');
      }

      const newUser = await registerUser({
        publicKey: walletAccount.publicKey,
        userType: selectedUserType,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        companyName: selectedUserType === 'company' ? formData.companyName : undefined,
        businessLicense: selectedUserType === 'company' ? formData.businessLicense : undefined,
        bankAccount: walletAccount.publicKey, // Usar la dirección de wallet como cuenta
        school: selectedUserType === 'client' ? formData.school : undefined,
        studentId: selectedUserType === 'client' ? formData.studentId : undefined,
        verified: true,
        status: 'active',
      });

      // Ir a página de éxito
      setStep('success');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        if (selectedUserType === 'company') {
          router.push('/company-dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 2000);

    } catch (err: any) {
      console.error('Error registrando usuario con Freighter:', err);
      setFormError(err.message || 'Error al registrar usuario');
    } finally {
      setIsProcessing(false);
    }
  };

  // Registrar con dirección manual
  const handleRegisterManualWallet = async () => {
    setIsProcessing(true);
    setFormError('');

    try {
      // Validar que sea una dirección válida de Stellar
      if (!manualWalletAddress.trim()) {
        setFormError('Ingresa una dirección de wallet');
        setIsProcessing(false);
        return;
      }

      // Verificar formato básico (comienza con G y tiene 56 caracteres)
      if (!manualWalletAddress.startsWith('G') || manualWalletAddress.length !== 56) {
        setFormError('Dirección de wallet inválida. Debe comenzar con G y tener 56 caracteres');
        setIsProcessing(false);
        return;
      }

      // Verificar si esta wallet ya está registrada (async)
      const existingUser = await getUserByWallet(manualWalletAddress);
      if (existingUser) {
        setFormError('Esta wallet ya está registrada. Intenta iniciar sesión.');
        setIsProcessing(false);
        return;
      }

      // Registrar nuevo usuario
      if (!selectedUserType) {
        throw new Error('Tipo de usuario no seleccionado');
      }

      const newUser = await registerUser({
        publicKey: manualWalletAddress,
        userType: selectedUserType,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        companyName: selectedUserType === 'company' ? formData.companyName : undefined,
        businessLicense: selectedUserType === 'company' ? formData.businessLicense : undefined,
        bankAccount: manualWalletAddress,
        school: selectedUserType === 'client' ? formData.school : undefined,
        studentId: selectedUserType === 'client' ? formData.studentId : undefined,
        verified: false, // Marcar como no verificado para validación manual después
        status: 'active',
      });

      // Ir a página de éxito
      setStep('success');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        if (selectedUserType === 'company') {
          router.push('/company-dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 2000);

    } catch (err: any) {
      console.error('Error registrando usuario:', err);
      setFormError(err.message || 'Error al registrar usuario');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateWallet = () => {
    window.open('https://freighter.app', '_blank');
  };

  // ============ UI ============

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#1e1b4b_0%,_#0f172a_45%,_#020617_100%)] p-4 relative overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-indigo-500/30 mb-6">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-semibold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Bienvenido a StudyTrips</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">StudyTrips Global</h1>
          <p className="text-indigo-200">Financia tus viajes de estudio con blockchain</p>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2 text-indigo-400">
              <Lock className="w-4 h-4" />
              <span>100% Seguro</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-400">
              <Globe className="w-4 h-4" />
              <span>Red Global</span>
            </div>
            <div className="flex items-center gap-2 text-teal-400">
              <Zap className="w-4 h-4" />
              <span>Instantáneo</span>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-between items-center mb-12 px-4">
          {['Datos', 'Tipo', 'Info', 'Wallet', 'Éxito'].map((label, idx) => {
            const steps: Array<typeof step> = ['userdata', 'usertype', 'usertype-form', 'wallet', 'success'];
            const isActive = steps.indexOf(step) >= idx;
            const stepNum = idx + 1;
            
            return (
              <div key={label} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  isActive ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'
                }`}>
                  {stepNum}
                </div>
                <div className={`text-sm ml-2 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                  {label}
                </div>
                {idx < 4 && (
                  <div className={`w-12 h-0.5 mx-2 ${isActive ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Error Message */}
        {formError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-200">{formError}</p>
              {formError.includes('Freighter no está disponible') && (
                <Link
                  href="/diagnostics"
                  className="text-sm text-red-300 hover:text-red-200 underline mt-2 inline-block"
                >
                  Ejecutar diagnóstico
                </Link>
              )}
            </div>
          </div>
        )}

        {/* PASO 1: DATOS DEL USUARIO */}
        {step === 'userdata' && (
          <div className="bg-slate-900/70 backdrop-blur-xl border border-cyan-400/25 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Cuéntanos sobre ti</h2>
                <p className="text-slate-400 text-sm">Comienza compartiendo tu información básica</p>
              </div>
            </div>
            
            <form onSubmit={handleUserDataSubmit} className="space-y-6">
              <div className="group">
                <label className="block text-sm font-semibold text-indigo-300 mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-5 py-3 bg-slate-700/40 border-2 border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-700/60 transition-all duration-300 font-medium"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-5 py-3 bg-slate-700/40 border-2 border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-700/60 transition-all duration-300 font-medium"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Teléfono (opcional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({...formData, phone: digitsOnly});
                  }}
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  className="w-full px-5 py-3 bg-slate-700/40 border-2 border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-700/60 transition-all duration-300 font-medium"
                  placeholder="3001234567"
                />
              </div>

              <button
                type="submit"
                className="btn-gloss btn-amber w-full mt-6 px-6 py-3 text-slate-900 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/40 hover:scale-[1.02] active:scale-95"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>

              <Link href="/login" className="btn-electric text-center text-white font-semibold text-sm mt-4 py-3 rounded-xl shadow-lg shadow-blue-500/40">
                ¿Ya tienes cuenta? Inicia sesión aquí
              </Link>
            </form>
          </div>
        )}

        {/* PASO 2: SELECCIONAR TIPO */}
        {step === 'usertype' && (
          <div className="bg-slate-900/70 backdrop-blur-xl border border-cyan-400/25 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
            <h2 className="text-2xl font-bold text-white mb-2">¿Cuál es tu rol?</h2>
            <p className="text-slate-300 mb-6">Elige tu perfil para continuar</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Cliente */}
              <button
                onClick={() => handleSelectType('client')}
                className="p-6 rounded-lg border-2 border-slate-600 hover:border-indigo-500 bg-slate-700/30 hover:bg-slate-700/60 transition text-left group"
              >
                <User className="w-8 h-8 text-indigo-400 mb-3 group-hover:text-indigo-300" />
                <h3 className="font-semibold text-white mb-1">Estudiante 🎓</h3>
                <p className="text-sm text-slate-400">Reserva y financia tus viajes</p>
              </button>

              {/* Empresa */}
              <button
                onClick={() => handleSelectType('company')}
                className="p-6 rounded-lg border-2 border-slate-600 hover:border-cyan-500 bg-slate-700/30 hover:bg-slate-700/60 transition text-left group"
              >
                <Building2 className="w-8 h-8 text-cyan-400 mb-3 group-hover:text-cyan-300" />
                <h3 className="font-semibold text-white mb-1">Empresa 🏢</h3>
                <p className="text-sm text-slate-400">Ofrece viajes estudiantiles</p>
              </button>
            </div>

            <button
              onClick={() => setStep('userdata')}
              className="w-full px-6 py-3 border-2 border-slate-600/50 hover:border-slate-500 text-slate-300 hover:text-indigo-300 rounded-xl font-semibold transition-all duration-300 hover:bg-slate-700/30"
            >
              Volver
            </button>
          </div>
        )}

        {/* PASO 3: FORMULARIO POR TIPO */}
        {step === 'usertype-form' && selectedUserType && (
          <div className="bg-slate-900/70 backdrop-blur-xl border border-cyan-400/25 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
              {selectedUserType === 'company' ? 'Información de Empresa' : 'Información de Estudiante'}
              </h2>
              <p className="text-slate-400 text-sm">Completa los detalles de tu perfil</p>
            </div>

            <form onSubmit={handleTypeFormSubmit} className="space-y-6">
              {selectedUserType === 'company' ? (
                <>
                  <div className="group">
                    <label className="block text-sm font-semibold text-indigo-300 mb-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Nombre de Empresa *
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      className="w-full px-5 py-3 bg-slate-700/40 border-2 border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-700/60 transition-all duration-300 font-medium"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-indigo-300 mb-3 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Licencia Comercial *
                    </label>
                    <input
                      type="text"
                      value={formData.businessLicense}
                      onChange={(e) => setFormData({...formData, businessLicense: e.target.value})}
                      className="w-full px-5 py-3 bg-slate-700/40 border-2 border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-700/60 transition-all duration-300 font-medium"
                      placeholder="Número de licencia"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="group">
                    <label className="block text-sm font-semibold text-indigo-300 mb-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Escuela *
                    </label>
                    <input
                      type="text"
                      value={formData.school}
                      onChange={(e) => setFormData({...formData, school: e.target.value})}
                      className="w-full px-5 py-3 bg-slate-700/40 border-2 border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-700/60 transition-all duration-300 font-medium"
                      placeholder="Nombre de tu escuela"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-indigo-300 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      ID de Estudiante *
                    </label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                      className="w-full px-5 py-3 bg-slate-700/40 border-2 border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-700/60 transition-all duration-300 font-medium"
                      placeholder="Tu ID de estudiante"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="btn-gloss btn-amber w-full mt-6 px-6 py-3 text-slate-900 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/40 hover:scale-[1.02] active:scale-95"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setStep('usertype')}
                className="w-full px-6 py-3 border-2 border-slate-600/50 hover:border-slate-500 text-slate-300 hover:text-indigo-300 rounded-xl font-semibold transition-all duration-300 hover:bg-slate-700/30"
              >
                Volver
              </button>
            </form>
          </div>
        )}

        {/* PASO 4: CONECTAR WALLET */}
        {step === 'wallet' && (
          <div className="bg-slate-900/70 backdrop-blur-xl border border-cyan-400/25 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
            <h2 className="text-2xl font-bold text-white mb-2">Vincula tu Wallet</h2>
            <p className="text-slate-400 mb-6">Elige cómo conectar tu wallet Stellar</p>

            {/* Error Message */}
            {formError && (
              <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">{formError}</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              {/* Opción 1: Freighter - Deshabilitada si no se detecta */}
              <div className={`p-4 rounded-lg border ${!formError ? 'border-slate-600 bg-slate-700/30' : 'border-red-600/50 bg-red-700/20 opacity-60'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-white font-semibold">Opción 1: Freighter</span>
                  {formError && <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">NO DETECTADA</span>}
                </div>
                <p className="text-sm text-slate-400 mb-3">
                  Conecta automáticamente con tu extensión Freighter
                </p>
                <button
                  onClick={handleConnectFreighter}
                  disabled={isProcessing || !!formError}
                  className={`w-full px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm font-semibold ${
                    formError
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'btn-gloss btn-cyan text-slate-950'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Conectar con Freighter
                    </>
                  )}
                </button>
                {formError && (
                  <p className="text-xs text-red-300 mt-3">
                    Si tienes Freighter instalada, recarga la página (F5) y vuelve a intentar.
                    Si el problema persiste, usa la Opción 2.
                  </p>
                )}
              </div>

              {/* Opción 2: Manual - RECOMENDADA */}
              <div className="p-4 rounded-lg border-2 border-amber-500 bg-amber-700/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-white font-semibold">Opción 2: Ingresa Manual (RECOMENDADA)</span>
                </div>
                <p className="text-sm text-amber-200 mb-3">
                  Copia la dirección de tu wallet Stellar (comienza con G, 56 caracteres)
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={manualWalletAddress}
                    onChange={(e) => setManualWalletAddress(e.target.value.trim())}
                    placeholder="Ej: GBUQWP3BOUZX34LOCALQVFSGHFTOJREM23NRHBK264KEXWFNVLB74OOO"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-amber-500/40 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm font-mono"
                  />
                  <button
                    onClick={handleRegisterManualWallet}
                    disabled={isProcessing || !manualWalletAddress.trim()}
                    className={`w-full px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm font-semibold ${
                      isProcessing || !manualWalletAddress.trim()
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        : 'btn-gloss btn-amber text-slate-900'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4" />
                        Registrar con esta Wallet
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Opción 3: Crear nueva */}
              <button
                onClick={handleCreateWallet}
                className="btn-gloss btn-cyan w-full px-6 py-3 text-slate-950 font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Opción 3: Crear Nueva Wallet en Freighter
              </button>
            </div>

            <button
              onClick={() => setStep('usertype')}
              className="w-full px-6 py-3 border-2 border-slate-600/50 hover:border-slate-500 text-slate-300 hover:text-indigo-300 rounded-xl font-semibold transition-all duration-300 hover:bg-slate-700/30"
            >
              Volver
            </button>
          </div>
        )}

        {/* PASO 5: ÉXITO */}
        {step === 'success' && (
          <div className="bg-slate-900/70 backdrop-blur-xl border border-cyan-400/25 rounded-2xl p-8 text-center shadow-2xl shadow-cyan-500/10">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">¡Bienvenido!</h2>
            <p className="text-slate-400 mb-6">
              Tu cuenta ha sido creada exitosamente y tu wallet ha sido vinculada.
            </p>
            <p className="text-sm text-slate-500">Redirigiendo al dashboard...</p>
            <div className="mt-6 flex justify-center">
              <Loader className="w-6 h-6 text-indigo-400 animate-spin" />
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

        .btn-cyan:hover {
          filter: brightness(1.06);
        }

        .btn-amber {
          background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
        }

        .btn-amber:hover {
          filter: brightness(1.06);
        }

        .btn-electric {
          position: relative;
          overflow: hidden;
          background: linear-gradient(92deg, #1d4ed8 0%, #2563eb 40%, #38bdf8 100%);
          border: 1px solid rgba(125, 211, 252, 0.55);
        }

        .btn-electric::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 12%, rgba(255,255,255,0.7) 45%, transparent 68%);
          transform: translateX(-140%);
          animation: electricFlash 2.2s ease-in-out infinite;
          pointer-events: none;
        }

        .btn-electric::after {
          content: "";
          position: absolute;
          left: -18%;
          top: 52%;
          width: 136%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(186,230,253,0.95), transparent);
          filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.95));
          transform: skewX(-25deg);
          animation: lightningLine 2.2s ease-in-out infinite;
          pointer-events: none;
        }

        .btn-electric:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }

        @keyframes shine {
          0% { transform: translateX(-120%); }
          45% { transform: translateX(120%); }
          100% { transform: translateX(120%); }
        }

        @keyframes electricFlash {
          0%, 74%, 100% { transform: translateX(-140%); opacity: 0; }
          14%, 24% { opacity: 1; }
          42% { transform: translateX(140%); opacity: 0.9; }
          58% { transform: translateX(140%); opacity: 0; }
        }

        @keyframes lightningLine {
          0%, 74%, 100% { opacity: 0; transform: skewX(-25deg) translateX(-8%); }
          15%, 21% { opacity: 1; }
          35% { opacity: 0.8; transform: skewX(-25deg) translateX(8%); }
          52% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}



