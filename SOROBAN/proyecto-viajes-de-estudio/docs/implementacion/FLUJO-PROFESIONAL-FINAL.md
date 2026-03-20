# 🔐 Flujo Profesional con Autenticación Passkey Obligatoria

## 📋 Análisis del Código Actual

### ✅ **Lo que ya tenemos implementado:**

1. **Componentes Passkey Funcionales:**
   - `PasskeyAuth.tsx` - UI para registro/login
   - `usePasskey.ts` - Hook con lógica de negocio
   - `webauthn.ts` - Utilidades WebAuthn (ES256/secp256r1)
   - Almacenamiento en `localStorage` de credenciales

2. **Flujo de Crédito:**
   - `CreditScoringFlow.tsx` - Orquestador del flujo
   - `LandingPage.tsx` - Página inicial
   - `IncomeDashboard.tsx` - Captura de datos de ingreso
   - `CreditProfile.tsx` - Muestra score y solicita préstamo
   - `SuccessNotification.tsx` - Confirmación de préstamo

3. **APIs Funcionando:**
   - `/api/calculate-score` - Calcula scoring crediticio
   - `/api/request-loan-real` - Ejecuta transacción en Stellar testnet

### ❌ **Problema Actual:**

**El flujo NO requiere autenticación:**
```tsx
// En CreditScoringFlow.tsx - Línea 29
const mockUserAddress = 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H';
```

Cualquiera puede acceder directamente sin autenticarse.

---

## 🎯 Solución: Flujo Profesional con Passkey Obligatorio

### **Nuevo Flujo:**

```
┌─────────────────────────────────────────────────────────────────┐
│                     1. LANDING PAGE                              │
│  "Préstamos DeFi sin bancos, con tu huella digital"             │
│                                                                  │
│  [🔐 Iniciar Sesión] [📝 Registrarse]                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ¿Usuario autenticado?
                              ↓
                    ┌─────────┴─────────┐
                    NO                 SÍ
                    ↓                   ↓
         ┌──────────────────┐    ┌──────────────────┐
         │ 2A. REGISTRO     │    │ 2B. LOGIN        │
         │ (Passkey)        │    │ (Passkey)        │
         │                  │    │                  │
         │ • Nombre         │    │ • Autenticar     │
         │ • Email          │    │   con huella     │
         │ • Crear Passkey  │    │ • Cargar sesión  │
         │ • Crear Wallet   │    │ • Verificar      │
         └──────────────────┘    └──────────────────┘
                    ↓                   ↓
                    └─────────┬─────────┘
                              ↓
         ┌─────────────────────────────────────────┐
         │ 3. SESIÓN AUTENTICADA                   │
         │ ✅ Passkey verificado                   │
         │ ✅ Wallet conectado: GXXX...XXXX        │
         │ ✅ Usuario identificado                  │
         └─────────────────────────────────────────┘
                              ↓
         ┌─────────────────────────────────────────┐
         │ 4. DASHBOARD / LANDING AUTENTICADO      │
         │                                          │
         │ Hola, [Nombre] 👋                       │
         │                                          │
         │ [💰 Solicitar Préstamo]                 │
         │ [📊 Ver mi Score]                       │
         │ [📜 Historial]                          │
         │ [🔓 Cerrar Sesión]                      │
         └─────────────────────────────────────────┘
                              ↓
         ┌─────────────────────────────────────────┐
         │ 5. INCOME VERIFICATION                   │
         │ (Captura datos de ingresos)              │
         │                                          │
         │ • Plataformas gig                       │
         │ • Ingresos mensuales                    │
         │ • Experiencia                            │
         │ • etc.                                   │
         └─────────────────────────────────────────┘
                              ↓
         ┌─────────────────────────────────────────┐
         │ 6. CREDIT PROFILE                        │
         │ (Calcula y muestra score)                │
         │                                          │
         │ Tu Score: 750 ⭐                        │
         │ Aprobado para: $2,000 USD                │
         │                                          │
         │ [Solicitar Préstamo]                     │
         └─────────────────────────────────────────┘
                              ↓
         ┌─────────────────────────────────────────┐
         │ 7. LOAN REQUEST                          │
         │ (Configurar monto y términos)            │
         │                                          │
         │ Monto: $500 USD                          │
         │ Plazo: 3 meses                           │
         │ APR: 10%                                 │
         │                                          │
         │ [✅ Confirmar con Passkey]               │
         └─────────────────────────────────────────┘
                              ↓
         ┌─────────────────────────────────────────┐
         │ 8. RE-AUTENTICACIÓN BIOMÉTRICA          │
         │ (Para confirmar transacción)             │
         │                                          │
         │ 👆 Confirma con tu huella               │
         │                                          │
         └─────────────────────────────────────────┘
                              ↓
         ┌─────────────────────────────────────────┐
         │ 9. BLOCKCHAIN EXECUTION                  │
         │ (Transacción en Stellar testnet)         │
         │                                          │
         │ ⏳ Ejecutando en blockchain...          │
         │ 📤 Firmando con Passkey                 │
         │ ✅ Transferencia confirmada              │
         └─────────────────────────────────────────┘
                              ↓
         ┌─────────────────────────────────────────┐
         │ 10. SUCCESS                              │
         │                                          │
         │ 🎉 ¡Préstamo Aprobado!                  │
         │ Hash: 7dbf366...                         │
         │ Monto: 295.5 XLM                         │
         │                                          │
         │ [Ver en Stellar] [Nuevo Préstamo]       │
         └─────────────────────────────────────────┘
```

---

## 🔧 Implementación Paso a Paso

### **Paso 1: Crear Sistema de Sesión**

#### 1.1 Tipos de Sesión (`src/types/session.ts`)
```typescript
export interface UserSession {
  authenticated: boolean;
  user: {
    id: string;
    username: string;
    email?: string;
    walletAddress: string;
    credentialId: string;
  };
  passkey: {
    credentialId: string;
    lastVerified: string;
  };
  createdAt: string;
  expiresAt: string;
}

export interface SessionManager {
  createSession(userData: UserSession['user'], credentialId: string): UserSession;
  getSession(): UserSession | null;
  validateSession(): boolean;
  clearSession(): void;
  requiresReauth(): boolean;
}
```

#### 1.2 Implementación de SessionManager (`src/lib/session.ts`)
```typescript
'use client';

import { UserSession } from '@/types/session';
import { Keypair } from '@stellar/stellar-sdk';

const SESSION_KEY = 'ebas-session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas
const REAUTH_THRESHOLD = 30 * 60 * 1000; // Re-auth cada 30 min para transacciones

export class SessionManager {
  /**
   * Crear nueva sesión después de registro/login exitoso
   */
  static createSession(
    username: string,
    credentialId: string,
    email?: string,
    walletAddress?: string
  ): UserSession {
    // Si no hay wallet, crear uno nuevo
    const wallet = walletAddress || Keypair.random().publicKey();

    const session: UserSession = {
      authenticated: true,
      user: {
        id: crypto.randomUUID(),
        username,
        email,
        walletAddress: wallet,
        credentialId
      },
      passkey: {
        credentialId,
        lastVerified: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + SESSION_DURATION).toISOString()
    };

    // Guardar en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    return session;
  }

  /**
   * Obtener sesión actual
   */
  static getSession(): UserSession | null {
    if (typeof window === 'undefined') return null;

    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (!sessionData) return null;

      const session: UserSession = JSON.parse(sessionData);
      
      // Validar que no haya expirado
      if (new Date(session.expiresAt) < new Date()) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error reading session:', error);
      return null;
    }
  }

  /**
   * Validar si hay sesión activa
   */
  static validateSession(): boolean {
    const session = this.getSession();
    return session !== null && session.authenticated;
  }

  /**
   * Limpiar sesión (logout)
   */
  static clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  /**
   * Verificar si se requiere re-autenticación
   * (Para transacciones sensibles como préstamos)
   */
  static requiresReauth(): boolean {
    const session = this.getSession();
    if (!session) return true;

    const lastVerified = new Date(session.passkey.lastVerified);
    const now = new Date();
    const timeSinceLastAuth = now.getTime() - lastVerified.getTime();

    return timeSinceLastAuth > REAUTH_THRESHOLD;
  }

  /**
   * Actualizar timestamp de última verificación
   */
  static updateLastVerified(): void {
    const session = this.getSession();
    if (!session) return;

    session.passkey.lastVerified = new Date().toISOString();
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  }

  /**
   * Obtener datos del usuario autenticado
   */
  static getUser(): UserSession['user'] | null {
    const session = this.getSession();
    return session?.user || null;
  }

  /**
   * Obtener wallet address del usuario autenticado
   */
  static getWalletAddress(): string | null {
    const session = this.getSession();
    return session?.user.walletAddress || null;
  }
}
```

---

### **Paso 2: Crear AuthGuard (Protección de Rutas)**

#### 2.1 AuthGuard Component (`src/components/auth/AuthGuard.tsx`)
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SessionManager } from '@/lib/session';
import { Loader2, Lock } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireReauth?: boolean; // Para transacciones sensibles
}

export default function AuthGuard({ children, requireReauth = false }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    // Verificar sesión activa
    const isAuthenticated = SessionManager.validateSession();

    if (!isAuthenticated) {
      // No hay sesión -> redirigir a login
      router.push('/login');
      return;
    }

    // Si se requiere re-autenticación para esta acción
    if (requireReauth && SessionManager.requiresReauth()) {
      // Guardar la ruta actual para redirigir después
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirect-after-reauth', window.location.pathname);
      }
      router.push('/reauth');
      return;
    }

    // Todo OK
    setIsAuthorized(true);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 text-center">
          <Lock className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Acceso Denegado
          </h2>
          <p className="text-gray-300 mb-6">
            Necesitas autenticarte para acceder a esta sección.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
          >
            Ir a Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

---

### **Paso 3: Modificar PasskeyAuth para crear sesión**

#### 3.1 Actualizar PasskeyAuth.tsx
```tsx
// Agregar al final de handleRegister, después del éxito:
if (result.success) {
  // Crear sesión
  SessionManager.createSession(
    username,
    result.credentialId!,
    undefined, // email opcional
    undefined  // walletAddress se generará automáticamente
  );
  
  setStatus(`✅ Passkey creado! Redirigiendo...`);
  
  // Redirigir al dashboard
  setTimeout(() => {
    window.location.href = '/dashboard';
  }, 1500);
}

// Agregar al final de handleAuthenticate, después del éxito:
if (result.success) {
  // Cargar credencial de localStorage
  const credentials = JSON.parse(localStorage.getItem('passkey-credentials') || '[]');
  const matchedCred = credentials.find(
    (cred: any) => cred.credentialId === result.credentialId
  );

  if (matchedCred) {
    // Crear sesión
    SessionManager.createSession(
      matchedCred.username,
      result.credentialId!
    );
    
    setStatus(`✅ Autenticado! Bienvenido ${matchedCred.username}`);
    
    // Redirigir al dashboard
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1500);
  }
}
```

---

### **Paso 4: Crear Dashboard Autenticado**

#### 4.1 Dashboard Component (`src/app/dashboard/page.tsx`)
```tsx
'use client';

import React from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import { SessionManager } from '@/lib/session';
import { 
  DollarSign, 
  TrendingUp, 
  History, 
  LogOut,
  Wallet,
  Shield,
  Copy,
  Check
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const user = SessionManager.getUser();

  if (!user) return null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(user.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    SessionManager.clearSession();
    router.push('/');
  };

  const handleRequestLoan = () => {
    router.push('/credit');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Hola, {user.username} 👋
            </h1>
            <p className="text-gray-400">
              Bienvenido a tu panel EBAS
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {/* Wallet Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Tu Wallet Stellar</p>
                <p className="text-white font-mono text-sm">
                  {user.walletAddress.substring(0, 10)}...{user.walletAddress.slice(-6)}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCopyAddress}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 flex items-center space-x-2 text-green-400 text-sm">
            <Shield className="w-4 h-4" />
            <span>Sesión segura con Passkey</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Solicitar Crédito */}
          <button
            onClick={handleRequestLoan}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 hover:scale-105 transition-transform text-left group"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Solicitar Préstamo
            </h3>
            <p className="text-green-100 text-sm mb-4">
              Préstamos DeFi en blockchain
            </p>
            <div className="text-white font-semibold group-hover:translate-x-2 transition-transform">
              Comenzar →
            </div>
          </button>

          {/* Score */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Tu Score
            </h3>
            <p className="text-gray-400 text-sm">
              Aún no calculado
            </p>
          </div>

          {/* Historial */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
              <History className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Historial
            </h3>
            <div className="text-4xl font-bold text-orange-400 mb-2">
              0
            </div>
            <p className="text-gray-400 text-sm">
              préstamos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### **Paso 5: Proteger Flujo de Crédito**

#### 5.1 Actualizar CreditScoringFlow.tsx
```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { SessionManager } from '@/lib/session';
import { useRouter } from 'next/navigation';
import AuthGuard from './auth/AuthGuard';
import IncomeDashboard from './IncomeDashboard';
import CreditProfile from './CreditProfile';
import SuccessNotification from './SuccessNotification';

type FlowStep = 'income' | 'credit' | 'success';

interface IncomeData {
  monthly_earnings: number[];
  gig_platforms: string[];
  average_hours_per_week: number;
  years_experience: number;
  education_level: 'high_school' | 'bachelor' | 'master' | 'phd' | 'none';
  employment_type: 'full_time_gig' | 'part_time_gig' | 'mixed' | 'unemployed';
  bank_account_age_months: number;
  has_savings: boolean;
  debt_to_income_ratio: number;
}

const CreditScoringFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('income');
  const [incomeData, setIncomeData] = useState<IncomeData | null>(null);
  const [selectedLoanAmount, setSelectedLoanAmount] = useState<number>(0);
  const [userAddress, setUserAddress] = useState<string>('');
  const router = useRouter();

  // Obtener wallet address de la sesión
  useEffect(() => {
    const address = SessionManager.getWalletAddress();
    if (address) {
      setUserAddress(address);
    }
  }, []);

  const handleIncomeDataReady = (data: IncomeData) => {
    setIncomeData(data);
  };

  const handleIncomeNext = () => {
    if (incomeData) {
      setCurrentStep('credit');
    }
  };

  const handleRequestLoan = (amount: number) => {
    setSelectedLoanAmount(amount);
    setCurrentStep('success');
  };

  const handleBackToIncome = () => {
    setCurrentStep('income');
  };

  const handleStartOver = () => {
    setCurrentStep('income');
    setIncomeData(null);
    setSelectedLoanAmount(0);
  };

  const handleViewDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <AuthGuard requireReauth={currentStep === 'success'}>
      <div className="min-h-screen">
        {currentStep === 'income' && (
          <IncomeDashboard
            onDataReady={handleIncomeDataReady}
            onNext={handleIncomeNext}
          />
        )}
        
        {currentStep === 'credit' && incomeData && (
          <CreditProfile
            incomeData={incomeData}
            onRequestLoan={handleRequestLoan}
            onBack={handleBackToIncome}
          />
        )}
        
        {currentStep === 'success' && (
          <SuccessNotification
            loanAmount={selectedLoanAmount}
            userAddress={userAddress}
            onStartOver={handleStartOver}
            onViewDashboard={handleViewDashboard}
          />
        )}
      </div>
    </AuthGuard>
  );
};

export default CreditScoringFlow;
```

---

### **Paso 6: Actualizar Rutas**

#### 6.1 Crear `/app/login/page.tsx`
```tsx
import { PasskeyAuth } from '@/components/PasskeyAuth';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <PasskeyAuth />
      </div>
    </div>
  );
}
```

#### 6.2 Crear `/app/register/page.tsx`
```tsx
import { PasskeyAuth } from '@/components/PasskeyAuth';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            Únete a EBAS
          </h1>
          <p className="text-gray-300">
            Préstamos DeFi con tu huella digital
          </p>
        </div>
        <PasskeyAuth />
      </div>
    </div>
  );
}
```

#### 6.3 Actualizar `/app/credit/page.tsx`
```tsx
import CreditScoringFlow from '@/components/CreditScoringFlow';

export default function CreditPage() {
  return <CreditScoringFlow />;
}
```

---

## 📊 Resumen del Flujo

### ✅ **Flujo Completo Protegido:**

1. **Landing** → Botones Login/Registro
2. **Login/Registro** → PasskeyAuth (crea sesión)
3. **Dashboard** → Protegido con AuthGuard
4. **Credit Flow** → Protegido con AuthGuard + obtiene wallet de sesión
5. **Transacción** → Requiere re-auth (AuthGuard con `requireReauth`)
6. **Success** → Muestra resultado con wallet del usuario real

### 🔒 **Seguridad:**

- ✅ **Sin sesión → No acceso a crédito**
- ✅ **Wallet asociado al usuario autenticado**
- ✅ **Re-autenticación para transacciones**
- ✅ **Sesión expira en 24 horas**
- ✅ **Passkey almacenado localmente**

---

## 🚀 Checklist de Implementación

- [ ] Crear `src/types/session.ts`
- [ ] Crear `src/lib/session.ts` (SessionManager)
- [ ] Crear `src/components/auth/AuthGuard.tsx`
- [ ] Modificar `PasskeyAuth.tsx` (agregar creación de sesión)
- [ ] Crear `/app/dashboard/page.tsx`
- [ ] Crear `/app/login/page.tsx`
- [ ] Crear `/app/register/page.tsx`
- [ ] Actualizar `CreditScoringFlow.tsx` (usar sesión)
- [ ] Actualizar `LandingPage.tsx` (botones Login/Registro)
- [ ] Probar flujo completo

---

**Última actualización**: 9 de octubre de 2025  
**Estado**: Listo para implementar 🚀
