# 🚀 EBAS DApp - Implementation Plan (Sin IA Voice)

> **Estrategia**: Implementar flujo completo profesional con UI tradicional.
> IA Voice se agrega después como enhancement opcional (Phase 6).

---

## 📋 Current Status

### ✅ Lo que ya tenemos funcionando:

1. **Blockchain Integration**
   - ✅ `stellar-loan.ts` - Real XLM transfers
   - ✅ `/api/request-loan-real` - Loan execution endpoint
   - ✅ `/api/calculate-score` - Credit scoring API
   - ✅ Friendbot integration for testnet
   - ✅ Horizon API error handling

2. **Frontend Components**
   - ✅ `IncomeDashboard` - Income data collection
   - ✅ `CreditProfile` - Score display
   - ✅ `SuccessNotification` - Transaction confirmation
   - ✅ `CreditScoringFlow` - Basic flow orchestration

3. **Infrastructure**
   - ✅ Next.js 14 with App Router
   - ✅ TypeScript
   - ✅ TailwindCSS
   - ✅ Stellar SDK integration

### ❌ Lo que falta:

1. **Autenticación**
   - ❌ Passkey registration
   - ❌ Passkey login
   - ❌ Session management
   - ❌ AuthGuard

2. **Dashboard**
   - ❌ Authenticated dashboard
   - ❌ User profile display
   - ❌ Loan history

3. **Flujo mejorado**
   - ❌ Better form validation
   - ❌ Loading states
   - ❌ Error handling
   - ❌ Animations

---

## 🎯 Implementation Plan - Next Steps

### Step 1: Authentication System (PRIORITY 1)

#### 1.1 Create Auth Hook
**File**: `frontend/src/hooks/useAuth.ts`

```typescript
import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  credentialId: string;
  createdAt: Date;
}

interface Session {
  authenticated: boolean;
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const [session, setSession] = useState<Session>({
    authenticated: false,
    user: null,
    loading: true
  });

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('ebas_user');
    if (storedUser) {
      setSession({
        authenticated: true,
        user: JSON.parse(storedUser),
        loading: false
      });
    } else {
      setSession(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = (user: User) => {
    localStorage.setItem('ebas_user', JSON.stringify(user));
    setSession({ authenticated: true, user, loading: false });
  };

  const logout = () => {
    localStorage.removeItem('ebas_user');
    setSession({ authenticated: false, user: null, loading: false });
  };

  return { session, login, logout };
}
```

#### 1.2 Create Passkey Registration Component
**File**: `frontend/src/components/PasskeyRegistration.tsx`

```tsx
'use client';

import { useState } from 'react';
import { Fingerprint, Loader2 } from 'lucide-react';
import { usePasskey } from '@/hooks/usePasskey';
import { useAuth } from '@/hooks/useAuth';

export default function PasskeyRegistration() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { createPasskey } = usePasskey();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create passkey and wallet
      const result = await createPasskey(name, email);
      
      // Save user and login
      login(result.user);
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Fingerprint className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Crear tu cuenta EBAS
          </h1>
          <p className="text-gray-300">
            Usa tu huella digital o Face ID
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@example.com"
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creando tu cuenta...</span>
              </>
            ) : (
              <>
                <Fingerprint className="w-5 h-5" />
                <span>Registrar con Biometría</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-xl">
          <p className="text-blue-200 text-sm text-center">
            🔒 Tu biometría nunca sale de tu dispositivo
          </p>
        </div>

        <div className="mt-6 text-center">
          <a href="/login" className="text-purple-400 hover:text-purple-300 text-sm">
            ¿Ya tienes cuenta? Inicia sesión
          </a>
        </div>
      </div>
    </div>
  );
}
```

#### 1.3 Create Passkey Login Component
**File**: `frontend/src/components/PasskeyLogin.tsx`

```tsx
'use client';

import { useState } from 'react';
import { Fingerprint, Loader2 } from 'lucide-react';
import { usePasskey } from '@/hooks/usePasskey';
import { useAuth } from '@/hooks/useAuth';

export default function PasskeyLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { authenticatePasskey } = usePasskey();
  const { login } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await authenticatePasskey();
      login(result.user);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Fingerprint className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Bienvenido de nuevo
          </h1>
          <p className="text-gray-300">
            Usa tu huella digital para entrar
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Autenticando...</span>
            </>
          ) : (
            <>
              <Fingerprint className="w-5 h-5" />
              <span>Autenticar con Biometría</span>
            </>
          )}
        </button>

        <div className="mt-6 text-center">
          <a href="/register" className="text-purple-400 hover:text-purple-300 text-sm">
            ¿No tienes cuenta? Regístrate
          </a>
        </div>
      </div>
    </div>
  );
}
```

---

### Step 2: Update Landing Page (PRIORITY 2)

**File**: `frontend/src/components/LandingPage.tsx`

Update to add authentication buttons:

```tsx
<div className="flex flex-col sm:flex-row gap-4 justify-center">
  <a 
    href="/login"
    className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl font-semibold text-lg transition-all"
  >
    🔐 Iniciar Sesión
  </a>
  <a 
    href="/register"
    className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold text-lg transition-all"
  >
    💰 Crear Cuenta
  </a>
</div>
```

---

### Step 3: Create Dashboard (PRIORITY 3)

**File**: `frontend/src/components/AuthenticatedDashboard.tsx`

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { Wallet, TrendingUp, History, LogOut } from 'lucide-react';

export default function AuthenticatedDashboard() {
  const { session, logout } = useAuth();

  if (!session.authenticated || !session.user) {
    return null;
  }

  const { user } = session;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Hola, {user.name} 👋
            </h1>
            <p className="text-gray-400">
              {user.email}
            </p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 rounded-xl flex items-center space-x-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Salir</span>
          </button>
        </div>
      </div>

      {/* Wallet Info */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <Wallet className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Tu Wallet</h2>
          </div>
          <p className="text-gray-300 font-mono text-sm">
            {user.walletAddress}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
        <a
          href="/ebas-credit"
          className="bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-3xl p-8 transition-all cursor-pointer"
        >
          <TrendingUp className="w-12 h-12 text-white mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            Solicitar Crédito
          </h3>
          <p className="text-purple-100">
            Obtén un préstamo en minutos
          </p>
        </a>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8">
          <History className="w-12 h-12 text-purple-400 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            Historial
          </h3>
          <p className="text-gray-300">
            Ver tus préstamos anteriores
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8">
          <Wallet className="w-12 h-12 text-purple-400 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            Mi Perfil
          </h3>
          <p className="text-gray-300">
            Administrar mi cuenta
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

### Step 4: Add Auth Guard (PRIORITY 4)

**File**: `frontend/src/components/AuthGuard.tsx`

```tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { session } = useAuth();

  useEffect(() => {
    if (!session.loading && !session.authenticated) {
      window.location.href = '/login';
    }
  }, [session]);

  if (session.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!session.authenticated) {
    return null;
  }

  return <>{children}</>;
}
```

---

## 📁 File Structure Summary

```
frontend/src/
├── components/
│   ├── PasskeyRegistration.tsx       ← NEW
│   ├── PasskeyLogin.tsx              ← NEW
│   ├── AuthGuard.tsx                 ← NEW
│   ├── AuthenticatedDashboard.tsx    ← NEW
│   ├── LandingPage.tsx               ← UPDATE
│   ├── IncomeDashboard.tsx           ← EXISTS
│   ├── CreditProfile.tsx             ← EXISTS
│   ├── SuccessNotification.tsx       ← EXISTS
│   └── CreditScoringFlow.tsx         ← UPDATE
├── hooks/
│   ├── useAuth.ts                    ← NEW
│   └── usePasskey.ts                 ← UPDATE (exists but needs work)
├── app/
│   ├── login/
│   │   └── page.tsx                  ← NEW
│   ├── register/
│   │   └── page.tsx                  ← NEW
│   ├── dashboard/
│   │   └── page.tsx                  ← NEW
│   └── ebas-credit/
│       └── page.tsx                  ← UPDATE (add AuthGuard)
```

---

## ✅ Implementation Checklist

### Week 1: Authentication
- [ ] Create `useAuth` hook
- [ ] Create `PasskeyRegistration` component
- [ ] Create `PasskeyLogin` component
- [ ] Create `AuthGuard` component
- [ ] Update `usePasskey` hook
- [ ] Create `/login` page
- [ ] Create `/register` page
- [ ] Update landing page with auth buttons

### Week 2: Dashboard & Protected Routes
- [ ] Create `AuthenticatedDashboard` component
- [ ] Create `/dashboard` page
- [ ] Add `AuthGuard` to `/ebas-credit`
- [ ] Add `AuthGuard` to `/ebas-dashboard`
- [ ] Add user info to credit flow
- [ ] Store user wallet address
- [ ] Add logout functionality

### Week 3: Polish & UX
- [ ] Add loading states everywhere
- [ ] Add error boundaries
- [ ] Add toast notifications
- [ ] Add animations (Framer Motion)
- [ ] Mobile responsive
- [ ] Form validation improvements
- [ ] Better error messages

---

## 🎯 Success Criteria

### Week 1 Deliverable:
✅ User can register with passkey  
✅ User can login with passkey  
✅ Session persists across page reloads  

### Week 2 Deliverable:
✅ Authenticated user sees dashboard  
✅ Credit flow requires authentication  
✅ User wallet address connected to loans  

### Week 3 Deliverable:
✅ Professional UX with animations  
✅ Comprehensive error handling  
✅ Mobile-ready  
✅ Production-ready quality  

---

**Next Action**: Start with `useAuth` hook and `PasskeyRegistration` component?
