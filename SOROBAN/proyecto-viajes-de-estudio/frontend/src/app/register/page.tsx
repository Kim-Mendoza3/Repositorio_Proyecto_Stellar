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
  
  // Pasos: userdata â†’ usertype â†’ wallet â†’ success
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

  // Si ya estÃ¡ conectado y registrado, ir al dashboard
  useEffect(() => {
    if (account) {
      const currentUser = getCurrentUser();
      if (currentUser) {
        // Ya estÃ¡ registrado
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
      setFormError('Email invÃ¡lido');
      return;
    }

    // Avanzar a selecciÃ³n de tipo
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

    // Validaciones especÃ­ficas
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
      // Conectar wallet - el hook manejarÃ¡ todo
      const walletAccount = await connectWallet();
      if (!walletAccount) {
        throw new Error('No se pudo conectar la wallet');
      }

      // Verificar si esta wallet ya estÃ¡ registrada (async)
      const existingUser = await getUserByWallet(walletAccount.publicKey);
      if (existingUser) {
        setFormError('Esta wallet ya estÃ¡ registrada. Intenta iniciar sesiÃ³n.');
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
        bankAccount: walletAccount.publicKey, // Usar la direcciÃ³n de wallet como cuenta
        school: selectedUserType === 'client' ? formData.school : undefined,
        studentId: selectedUserType === 'client' ? formData.studentId : undefined,
        verified: true,
        status: 'active',
      });

      // Ir a pÃ¡gina de Ã©xito
      setStep('success');
      
      // Redirigir despuÃ©s de 2 segundos
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

  // Registrar con direcciÃ³n manual
  const handleRegisterManualWallet = async () => {
    setIsProcessing(true);
    setFormError('');

    try {
      // Validar que sea una direcciÃ³n vÃ¡lida de Stellar
      if (!manualWalletAddress.trim()) {
        setFormError('Ingresa una direcciÃ³n de wallet');
        setIsProcessing(false);
        return;
      }

      // Verificar formato bÃ¡sico (comienza con G y tiene 56 caracteres)
      if (!manualWalletAddress.startsWith('G') || manualWalletAddress.length !== 56) {
        setFormError('DirecciÃ³n de wallet invÃ¡lida. Debe comenzar con G y tener 56 caracteres');
        setIsProcessing(false);
        return;
      }

      // Verificar si esta wallet ya estÃ¡ registrada (async)
      const existingUser = await getUserByWallet(manualWalletAddress);
      if (existingUser) {
        setFormError('Esta wallet ya estÃ¡ registrada. Intenta iniciar sesiÃ³n.');
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
        verified: false, // Marcar como no verificado para validaciÃ³n manual despuÃ©s
        status: 'active',
      });

      // Ir a pÃ¡gina de Ã©xito
      setStep('success');
      
      // Redirigir despuÃ©s de 2 segundos
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4 relative overflow-hidden">
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
          {['Datos', 'Tipo', 'Info', 'Wallet', 'Ã‰xito'].map((label, idx) => {
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
              {formError.includes('Freighter no estÃ¡ disponible') && (
                <Link
                  href="/diagnostics"
                  className="text-sm text-red-300 hover:text-red-200 underline mt-2 inline-block"
                >
                  ðŸ” Ejecutar diagnÃ³stico â†’
                </Link>
              )}
            </div>
          </div>
        )}

        {/* PASO 1: DATOS DEL USUARIO */}
        {step === 'userdata' && (
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/40 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-8 shadow-2xl shadow-indigo-500/20">
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
                  TelÃ©fono (opcional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-5 py-3 bg-slate-700/40 border-2 border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-700/60 transition-all duration-300 font-medium"
                  placeholder="+1234567890"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/50 hover:scale-105 active:scale-95"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>

              <Link href="/login" className="text-center text-slate-400 hover:text-indigo-300 text-sm mt-4">
                Â¿Ya tienes cuenta? Inicia sesiÃ³n
              </Link>
            </form>
          </div>
        )}

        {/* PASO 2: SELECCIONAR TIPO */}
        {step === 'usertype' && (
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/40 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-8 shadow-2xl shadow-indigo-500/20">
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
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/40 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-8 shadow-2xl shadow-indigo-500/20">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
              {selectedUserType === 'company' ? 'InformaciÃ³n de Empresa' : 'InformaciÃ³n de Estudiante'}
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
                      placeholder="NÃºmero de licencia"
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
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/50 hover:scale-105 active:scale-95"
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
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/40 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-8 shadow-2xl shadow-indigo-500/20">
            <h2 className="text-2xl font-bold text-white mb-2">Vincula tu Wallet</h2>
            <p className="text-slate-400 mb-6">Elige cÃ³mo conectar tu wallet Stellar</p>

            {/* Error Message */}
            {formError && (
              <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">{formError}</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              {/* OpciÃ³n 1: Freighter - Deshabilitada si no se detecta */}
              <div className={`p-4 rounded-lg border ${!formError ? 'border-slate-600 bg-slate-700/30' : 'border-red-600/50 bg-red-700/20 opacity-60'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-white font-semibold">OpciÃ³n 1: Freighter</span>
                  {formError && <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">NO DETECTADA</span>}
                </div>
                <p className="text-sm text-slate-400 mb-3">
                  Conecta automÃ¡ticamente con tu extensiÃ³n Freighter
                </p>
                <button
                  onClick={handleConnectFreighter}
                  disabled={isProcessing || !!formError}
                  className={`w-full px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm font-semibold ${
                    formError
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white'
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
                    ðŸ’¡ Si tienes Freighter instalada, recarga la pÃ¡gina (F5) y vuelve a intentar. 
                    Si el problema persiste, usa la OpciÃ³n 2.
                  </p>
                )}
              </div>

              {/* OpciÃ³n 2: Manual - RECOMENDADA */}
              <div className="p-4 rounded-lg border-2 border-amber-500 bg-amber-700/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-white font-semibold">ðŸŸ¡ OpciÃ³n 2: Ingresa Manual (RECOMENDADA)</span>
                </div>
                <p className="text-sm text-amber-200 mb-3">
                  Copia la direcciÃ³n de tu wallet Stellar (comienza con G, 56 caracteres)
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
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
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

              {/* OpciÃ³n 3: Crear nueva */}
              <button
                onClick={handleCreateWallet}
                className="w-full px-6 py-3 border border-indigo-500/50 hover:border-indigo-400 text-indigo-300 hover:text-indigo-200 font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                ðŸŸ£ OpciÃ³n 3: Crear Nueva Wallet en Freighter
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

        {/* PASO 5: Ã‰XITO */}
        {step === 'success' && (
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/40 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Â¡Bienvenido!</h2>
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
    </div>
  );
}



