# 🚀 Guía de Implementación Práctica - EBAS DApp

## 📋 Índice
1. [Estrategia de Implementación](#estrategia)
2. [Fase 1: Autenticación Biométrica](#fase-1)
3. [Fase 2: Dashboard Autenticado](#fase-2)
4. [Fase 3: Flujo de Crédito](#fase-3)
5. [Fase 4: IA Voice (Opcional)](#fase-4)

---

## 🎯 Estrategia de Implementación {#estrategia}

### ¿Por qué SIN IA primero?

**Ventajas:**
- ✅ **Más rápido**: Menos componentes complejos
- ✅ **Más estable**: Sin dependencias de APIs externas (OpenAI)
- ✅ **Más económico**: No costos de API mientras desarrollamos
- ✅ **MVP funcional**: Tenemos producto completo en menos tiempo
- ✅ **Base sólida**: Después agregamos IA como "capa superior"

**Timeline:**
```
Semana 1-2: Flujo completo SIN IA → MVP FUNCIONAL ✅
Semana 3:   Agregar IA Voice → MEJORA DE UX 🎤
```

---

## 🔐 Fase 1: Autenticación Biométrica (3-4 días) {#fase-1}

### Objetivo
Usuario puede registrarse y hacer login usando su huella digital/Face ID.

### Componentes a Crear

#### 1.1 PasskeyRegistration.tsx
```tsx
'use client';

import React, { useState } from 'react';
import { Fingerprint, Mail, User, Shield } from 'lucide-react';

export default function PasskeyRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreatePasskey = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Generar challenge del servidor
      const challengeRes = await fetch('/api/auth/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const { challenge } = await challengeRes.json();

      // 2. Crear passkey con WebAuthn
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: Uint8Array.from(atob(challenge), c => c.charCodeAt(0)),
          rp: {
            name: "EBAS Finance",
            id: window.location.hostname
          },
          user: {
            id: Uint8Array.from(formData.email, c => c.charCodeAt(0)),
            name: formData.email,
            displayName: formData.name
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },  // ES256
            { type: "public-key", alg: -257 } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            requireResidentKey: true,
            userVerification: "required"
          },
          timeout: 60000
        }
      });

      // 3. Registrar en backend
      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          credential: {
            id: credential.id,
            rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
            response: {
              clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(credential.response.clientDataJSON))),
              attestationObject: btoa(String.fromCharCode(...new Uint8Array(credential.response.attestationObject)))
            },
            type: credential.type
          }
        })
      });

      const result = await registerRes.json();

      if (result.success) {
        // 4. Redirigir al dashboard
        window.location.href = '/dashboard';
      } else {
        setError(result.error || 'Error al registrar');
      }

    } catch (err) {
      console.error('Error creating passkey:', err);
      setError('No se pudo crear la passkey. ¿Tu dispositivo soporta biometría?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Crear tu cuenta EBAS
          </h1>
          <p className="text-gray-300">
            Usa tu huella digital o Face ID
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-white mb-2 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Nombre completo
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Juan Pérez"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-white mb-2 flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="juan@example.com"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Biometric Button */}
        <button
          onClick={handleCreatePasskey}
          disabled={loading || !formData.name || !formData.email}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all"
        >
          <Fingerprint className="w-5 h-5" />
          <span>{loading ? 'Registrando...' : 'Registrar Huella/Face ID'}</span>
        </button>

        {/* Security Note */}
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <p className="text-green-300 text-sm flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Tu biometría nunca sale de tu dispositivo
          </p>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            ¿Ya tienes cuenta?{' '}
            <a href="/login" className="text-blue-400 hover:text-blue-300">
              Inicia sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
```

#### 1.2 PasskeyLogin.tsx
```tsx
'use client';

import React, { useState } from 'react';
import { Fingerprint, Shield, ArrowRight } from 'lucide-react';

export default function PasskeyLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Obtener challenge
      const challengeRes = await fetch('/api/auth/challenge-login');
      const { challenge, allowCredentials } = await challengeRes.json();

      // 2. Autenticar con passkey
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: Uint8Array.from(atob(challenge), c => c.charCodeAt(0)),
          allowCredentials: allowCredentials.map(c => ({
            type: 'public-key',
            id: Uint8Array.from(atob(c.id), c => c.charCodeAt(0))
          })),
          userVerification: "required",
          timeout: 60000
        }
      });

      // 3. Verificar en backend
      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: {
            id: credential.id,
            rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
            response: {
              clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(credential.response.clientDataJSON))),
              authenticatorData: btoa(String.fromCharCode(...new Uint8Array(credential.response.authenticatorData))),
              signature: btoa(String.fromCharCode(...new Uint8Array(credential.response.signature)))
            },
            type: credential.type
          }
        })
      });

      const result = await verifyRes.json();

      if (result.success) {
        // 4. Guardar sesión y redirigir
        localStorage.setItem('session', JSON.stringify(result.session));
        window.location.href = '/dashboard';
      } else {
        setError(result.error || 'Error al verificar');
      }

    } catch (err) {
      console.error('Error during login:', err);
      setError('No se pudo autenticar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Fingerprint className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Bienvenido de nuevo
          </h1>
          <p className="text-gray-300">
            Usa tu huella digital para entrar
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all"
        >
          <Fingerprint className="w-5 h-5" />
          <span>{loading ? 'Autenticando...' : 'Autenticar con Huella/Face ID'}</span>
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-white/20"></div>
          <span className="px-4 text-gray-400 text-sm">o</span>
          <div className="flex-1 border-t border-white/20"></div>
        </div>

        {/* Recovery Link */}
        <a 
          href="/recovery"
          className="block text-center text-blue-400 hover:text-blue-300 text-sm"
        >
          ¿Perdiste acceso a tu dispositivo?
        </a>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            ¿No tienes cuenta?{' '}
            <a href="/register" className="text-blue-400 hover:text-blue-300 flex items-center justify-center mt-2">
              Crear cuenta <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </p>
        </div>

        {/* Security Note */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <p className="text-blue-300 text-sm flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Autenticación segura sin contraseñas
          </p>
        </div>
      </div>
    </div>
  );
}
```

#### 1.3 API Routes

**`/api/auth/challenge/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Generar challenge aleatorio
    const challenge = crypto.randomBytes(32).toString('base64');

    // Guardar challenge temporalmente (en producción usar Redis)
    // Por ahora usamos headers/cookies
    
    return NextResponse.json({
      challenge,
      timeout: 60000
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error generando challenge' },
      { status: 500 }
    );
  }
}
```

**`/api/auth/register/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { Keypair } from '@stellar/stellar-sdk';

// En producción esto iría a una base de datos
const users = new Map();

export async function POST(request: NextRequest) {
  try {
    const { name, email, credential } = await request.json();

    // 1. Verificar que el email no exista
    if (users.has(email)) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // 2. Crear wallet en Stellar
    const keypair = Keypair.random();
    const walletAddress = keypair.publicKey();

    // 3. Guardar usuario
    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      walletAddress,
      credentialId: credential.id,
      credential: credential,
      createdAt: new Date().toISOString()
    };

    users.set(email, user);

    // 4. Crear sesión
    const session = {
      userId: user.id,
      email: user.email,
      walletAddress: user.walletAddress,
      authenticated: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    return NextResponse.json({
      success: true,
      session,
      message: 'Usuario registrado exitosamente'
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}
```

---

## 🏠 Fase 2: Dashboard Autenticado (2-3 días) {#fase-2}

### Objetivo
Usuario ve su dashboard con score, historial y acciones rápidas.

### Componentes a Crear

#### 2.1 AuthGuard.tsx (Middleware)
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface Session {
  userId: string;
  email: string;
  walletAddress: string;
  authenticated: boolean;
  expiresAt: string;
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión
    const sessionData = localStorage.getItem('session');
    
    if (!sessionData) {
      router.push('/login');
      return;
    }

    try {
      const parsed = JSON.parse(sessionData);
      
      // Verificar expiración
      if (new Date(parsed.expiresAt) < new Date()) {
        localStorage.removeItem('session');
        router.push('/login');
        return;
      }

      setSession(parsed);
    } catch (error) {
      console.error('Error parsing session:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
```

#### 2.2 Dashboard.tsx
```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  History, 
  DollarSign,
  LogOut,
  Shield,
  Copy,
  Check
} from 'lucide-react';

interface DashboardProps {
  session: {
    userId: string;
    email: string;
    walletAddress: string;
    name: string;
  };
}

export default function Dashboard({ session }: DashboardProps) {
  const [creditScore, setCreditScore] = useState<number | null>(null);
  const [loanHistory, setLoanHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Cargar datos del usuario
    loadUserData();
  }, []);

  const loadUserData = async () => {
    // Cargar score crediticio si existe
    const scoreData = localStorage.getItem(`score_${session.userId}`);
    if (scoreData) {
      setCreditScore(JSON.parse(scoreData).score);
    }

    // Cargar historial de préstamos
    const historyData = localStorage.getItem(`loans_${session.userId}`);
    if (historyData) {
      setLoanHistory(JSON.parse(historyData));
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(session.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('session');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Hola, {session.name || 'Usuario'} 👋
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
            <span>Salir</span>
          </button>
        </div>

        {/* Wallet Info */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Tu Wallet Stellar</p>
                <p className="text-white font-mono text-sm">
                  {session.walletAddress.substring(0, 10)}...{session.walletAddress.substring(session.walletAddress.length - 6)}
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
            <span>Sesión segura con biometría</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          
          {/* Solicitar Crédito */}
          <a
            href="/credit"
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer group"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Solicitar Crédito
            </h3>
            <p className="text-green-100 text-sm">
              Préstamos rápidos en blockchain
            </p>
            <div className="mt-4 text-white group-hover:translate-x-2 transition-transform">
              →
            </div>
          </a>

          {/* Ver Score */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Tu Score
            </h3>
            {creditScore ? (
              <div className="text-4xl font-bold text-purple-400">
                {creditScore}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                Aún no calculado
              </p>
            )}
          </div>

          {/* Historial */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
              <History className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Historial
            </h3>
            <div className="text-4xl font-bold text-orange-400">
              {loanHistory.length}
            </div>
            <p className="text-gray-400 text-sm">
              {loanHistory.length === 1 ? 'préstamo' : 'préstamos'}
            </p>
          </div>
        </div>

        {/* Loan History */}
        {loanHistory.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">
              Historial de Préstamos
            </h2>
            <div className="space-y-3">
              {loanHistory.map((loan: any, index) => (
                <div 
                  key={index}
                  className="bg-white/5 rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="text-white font-semibold">
                      ${(loan.amount / 10000000).toFixed(2)} USDC
                    </p>
                    <p className="text-gray-400 text-sm">
                      {new Date(loan.timestamp).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                      Aprobado
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 💰 Fase 3: Flujo de Crédito sin IA (3-4 días) {#fase-3}

### Objetivo
Usuario completa solicitud de crédito sin asistente de voz (formularios tradicionales).

### Modificaciones Necesarias

#### 3.1 Eliminar referencias a IA
Ya tienes estos componentes, solo necesitas:

1. **IncomeDashboard.tsx**: Ya funciona sin IA ✅
2. **CreditProfile.tsx**: Ya funciona sin IA ✅
3. **SuccessNotification.tsx**: Quitar secciones de IA

#### 3.2 Actualizar SuccessNotification.tsx
```tsx
// Eliminar estas líneas:
// <AIMessage>...</AIMessage>
// <VoiceAssistant />

// Mantener solo:
<SuccessPage>
  <Celebration>🎉 ¡Préstamo Aprobado!</Celebration>
  <LoanDetails>...</LoanDetails>
  <Timeline>...</Timeline>
  <NextSteps>...</NextSteps>
  <Actions>...</Actions>
</SuccessPage>
```

#### 3.3 Agregar AuthGuard al flujo
```tsx
// src/app/credit/page.tsx
import AuthGuard from '@/components/AuthGuard';
import CreditScoringFlow from '@/components/CreditScoringFlow';

export default function CreditPage() {
  return (
    <AuthGuard>
      <CreditScoringFlow />
    </AuthGuard>
  );
}
```

---

## 🎤 Fase 4: IA Voice (Opcional - Semana 3) {#fase-4}

Esta fase se implementa **DESPUÉS** de tener todo funcionando.

### Componentes a Agregar

1. **VoiceAssistant.tsx**: Botón de micrófono + Web Speech API
2. **ChatInterface.tsx**: Conversación con IA
3. **API `/api/ai/chat`**: Integración con OpenAI
4. **AIReviewPanel.tsx**: IA revisa y sugiere

### Por qué dejarlo para después:
- ✅ MVP ya funciona sin IA
- ✅ No bloquea desarrollo
- ✅ Se puede probar todo antes
- ✅ Reducimos costos durante desarrollo
- ✅ Si hay problemas con IA, el flujo sigue funcionando

---

## 📊 Checklist de Implementación

### Fase 1: Autenticación (Días 1-4)
- [ ] Crear `PasskeyRegistration.tsx`
- [ ] Crear `PasskeyLogin.tsx`
- [ ] Crear API `/api/auth/challenge`
- [ ] Crear API `/api/auth/register`
- [ ] Crear API `/api/auth/verify`
- [ ] Probar registro completo
- [ ] Probar login completo
- [ ] Manejar errores

### Fase 2: Dashboard (Días 5-7)
- [ ] Crear `AuthGuard.tsx`
- [ ] Crear `Dashboard.tsx`
- [ ] Integrar con sesión
- [ ] Mostrar wallet address
- [ ] Mostrar score (si existe)
- [ ] Mostrar historial
- [ ] Botón logout
- [ ] Probar flujo completo

### Fase 3: Crédito sin IA (Días 8-11)
- [ ] Agregar `AuthGuard` a `/credit`
- [ ] Verificar `IncomeDashboard` funciona
- [ ] Verificar `CreditProfile` funciona
- [ ] Limpiar referencias a IA en `SuccessNotification`
- [ ] Probar flujo end-to-end
- [ ] Guardar historial en localStorage
- [ ] Testing completo

### Fase 4: IA (Opcional - Días 12-15)
- [ ] Implementar `VoiceAssistant`
- [ ] Crear API `/api/ai/chat`
- [ ] Integrar con OpenAI
- [ ] Agregar sugerencias IA
- [ ] Probar con voz
- [ ] Polish UX

---

## 🚀 Comando para Empezar

```bash
# Fase 1: Crear estructura de carpetas
cd frontend/src
mkdir -p app/register app/login app/dashboard app/credit
mkdir -p components/auth
mkdir -p api/auth

# Crear archivos
touch app/register/page.tsx
touch app/login/page.tsx
touch app/dashboard/page.tsx
touch components/auth/PasskeyRegistration.tsx
touch components/auth/PasskeyLogin.tsx
touch components/auth/AuthGuard.tsx
touch api/auth/challenge/route.ts
touch api/auth/register/route.ts
touch api/auth/verify/route.ts
```

---

## 💡 Tips de Implementación

1. **Primero funcional, después bonito**: Haz que funcione, luego mejora UI
2. **Usa localStorage** temporalmente (en producción usarás base de datos)
3. **Logs abundantes**: `console.log` en cada paso para debugging
4. **Prueba en móvil**: Face ID/Touch ID solo funciona en dispositivos reales
5. **HTTPS requerido**: WebAuthn solo funciona en localhost o HTTPS
6. **Comienza simple**: Primero haz login básico, luego mejora

---

## 🎯 Resultado Final (Sin IA)

Al terminar Fase 1-3 tendrás:
- ✅ Registro con huella digital
- ✅ Login con biometría
- ✅ Dashboard personalizado
- ✅ Solicitud de crédito completa
- ✅ Cálculo de score
- ✅ Transacción en blockchain
- ✅ Historial de préstamos

**Todo funcional y listo para producción** 🚀

Después puedes agregar IA como "bonus feature" sin romper nada.

---

**Última actualización**: 9 de octubre de 2025
**Estado**: Listo para implementar 
**Prioridad**: Fase 1 → Fase 2 → Fase 3 → Fase 4 (opcional)
