# 🚀 GUÍA PROFESIONAL DE DESPLIEGUE EN NETLIFY
**Proyecto Viajes de Estudio - dApp Stellar Soroban**

---

## 📋 RESUMEN EJECUTIVO

Este documento proporciona un plan completo y profesional para desplegar la dApp "Viajes de Estudio" en Netlify. La arquitectura integra un frontend Next.js 14 con autenticación WebAuthn, integración Stellar Freighter y un contrato inteligente Soroban en Stellar Testnet.

**Stack Tecnológico:**
- **Frontend:** Next.js 14.2.15 (App Router) + React 18 + TypeScript
- **Blockchain:** Stellar Testnet + Soroban Smart Contract
- **Autenticación:** WebAuthn/Passkeys + Freighter Wallet
- **Hosting:** Netlify (OpenNext Adapter)
- **MCP:** Stellar MCP Server para automatización

---

## 🏗️ ARQUITECTURA DE DESPLIEGUE

```
┌─────────────────────────────────────────────────────────┐
│                      NETLIFY CDN                        │
├─────────────────────────────────────────────────────────┤
│  Edge Functions (Middleware, Headers, Redirects)        │
├─────────────────────────────────────────────────────────┤
│  Serverless Functions (SSR, ISR, API Routes)            │
│  (OpenNext Adapter)                                     │
├─────────────────────────────────────────────────────────┤
│  Static Content (Next.js Output)                        │
│  - App Router (.next/static)                            │
│  - Public Assets                                        │
│  - Image Optimization (Netlify Image CDN)               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              STELLAR TESTNET                            │
├─────────────────────────────────────────────────────────┤
│  Soroban Smart Contract (passkey_account.wasm)          │
│  - Trip Marketplace                                     │
│  - Reservation Management                              │
│  - Payment Processing                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 CONFIGURACIÓN ACTUAL DEL PROYECTO

### Frontend (Next.js)
```
frontend/
├── package.json
├── next.config.mjs          ✅ Configurado para WebAuthn
├── netlify.toml             ✅ Optimizado para Netlify
├── tsconfig.json
├── src/
│   ├── app/                 (App Router)
│   ├── components/          (React Components)
│   ├── hooks/               (useFreighterWallet, etc.)
│   └── services/            (Stellar SDK)
└── .next/                   (Build output)
```

**Dependencias Críticas:**
- `@stellar/freighter-api@6.0.0` - Integración wallet
- `@stellar/stellar-sdk@12.3.0` - Blockchain SDK
- `@simplewebauthn/browser@13.2.0` - Autenticación
- `next@14.2.15` - Framework

### Contrato Inteligente
```
contract/
├── Cargo.toml
├── src/
│   └── lib.rs              (Soroban Contract)
└── target/wasm32-unknown-unknown/
    └── release/
        └── passkey_account.wasm  ✅ Compilado
```

### MCP Server
```
mcp-servers/stellar-mcp/
├── package.json
├── src/
│   └── (TypeScript sources)
└── dist/                    (Compiled JS)
```

---

## ⚙️ CONFIGURACIÓN NETLIFY ACTUAL

### netlify.toml (Raíz)
```toml
[build]
  base = "Repositorio_Proyecto_Stellar/SOROBAN/proyecto-viajes-de-estudio/frontend"
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NODE_ENV = "production"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
```

### netlify.toml (Frontend)
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NODE_ENV = "production"
```

---

## ✅ PRE-REQUISITOS PARA DESPLIEGUE

### 1. **Requisitos Locales**
- [ ] Node.js 18+ instalado
- [ ] npm 9+ instalado
- [ ] Git configurado
- [ ] Repositorio en GitHub/GitLab/Bitbucket

### 2. **Cuentas Requeridas**
- [ ] **Netlify Account** (https://app.netlify.com/signup)
- [ ] **Stellar Testnet Account** (https://stellar.org/developers/testnet)
  - Public Key (GXXXXXX...)
  - Secret Key (SXXXXXX...)
- [ ] **GitHub Account** (para conectar repositorio)

### 3. **Variables de Entorno**
```bash
# .env.production (NO compartir publicly)
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_CONTRACT_ID=<TU_CONTRACT_ID>
NEXT_PUBLIC_FREIGHTER_API_ENABLED=true
```

### 4. **Contrato Inteligente**
- [ ] Compilado a `.wasm`
- [ ] Desplegado en Stellar Testnet
- [ ] Contract ID obtenido y guardado

---

## 🔧 PASOS DE DESPLIEGUE PASO A PASO

### FASE 1: PREPARACIÓN LOCAL (5 min)

#### 1.1 Clonar y Preparar Repositorio
```bash
git clone <tu-repositorio-url> proyecto-viajes
cd proyecto-viajes/SOROBAN/proyecto-viajes-de-estudio/frontend

# Instalar dependencias
npm install --legacy-peer-deps

# Verificar build
npm run build

# Comprobar que no hay errores
npm run type-check
```

#### 1.2 Crear Variables de Entorno
```bash
# En frontend/.env.production
cat > .env.production << 'EOF'
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_CONTRACT_ID=<TU_CONTRACT_ID>
NEXT_PUBLIC_FREIGHTER_API_ENABLED=true
EOF

# Verificar: NO incluir secret keys aquí
```

#### 1.3 Validar Configuración Next.js
```bash
# Verificar next.config.mjs
node -e "import('./next.config.mjs').then(m => console.log('✓ Config válido'))"

# Verificar webpack fallbacks (WebAuthn compatibility)
npm run build
```

---

### FASE 2: CONFIGURACIÓN NETLIFY (10 min)

#### 2.1 Conectar Repositorio
1. **Login en Netlify:** https://app.netlify.com
2. **New site from Git** → Selecciona tu repositorio
3. **Configure build settings:**
   - Base directory: `SOROBAN/proyecto-viajes-de-estudio/frontend`
   - Build command: `npm run build`
   - Publish directory: `.next`

#### 2.2 Configurar Variables de Entorno en Netlify
```
Site Settings → Build & deploy → Environment

NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_CONTRACT_ID=<TU_CONTRACT_ID>
NEXT_PUBLIC_FREIGHTER_API_ENABLED=true
NODE_VERSION=18
NODE_ENV=production
```

#### 2.3 Habilitar Skew Protection (Opcional pero Recomendado)
```
Site Settings → Build & deploy → Environment

NETLIFY_NEXT_SKEW_PROTECTION=true
```

Actualizar `next.config.mjs`:
```javascript
const nextConfig = {
  experimental: {
    useDeploymentId: true,
  },
  // ... resto de config
};
```

---

### FASE 3: OPTIMIZACIONES NETLIFY (5 min)

#### 3.1 Actualizar netlify.toml
```toml
[build]
  command = "npm run build"
  publish = ".next"
  environment = { NODE_VERSION = "18", NODE_ENV = "production" }

[build.environment]
  NODE_OPTIONS = "--max_old_space_size=3072"

# Caching Headers
[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/api/*"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"

# Security Headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"

# COOP/COEP para WebAuthn
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Embedder-Policy = "require-corp"

# Redirects
[[redirects]]
  from = "/api/trpc/*"
  to = "/.netlify/functions/index:path"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 404
```

#### 3.2 Configurar Revalidación de Caché
En `src/app/layout.tsx` o `src/pages`:
```typescript
// Habilitar ISR (Incremental Static Regeneration)
export const revalidate = 60; // Revalidar cada 60 segundos
```

---

### FASE 4: DESPLIEGUE DEL CONTRATO INTELIGENTE (15 min)

#### 4.1 Compilar Contrato
```bash
cd contract
make build
# O manualmente:
cargo build --target wasm32-unknown-unknown --release
```

#### 4.2 Desplegar con Stellar CLI
```bash
# Instalar Stellar CLI si no lo tienes
curl -s https://raw.githubusercontent.com/stellar/stellar-cli/master/install.sh | bash

# Crear cuenta (si no tienes)
stellar keys generate trips-company

# Financiar cuenta (ir a https://stellar.org/developers/testnet)

# Desplegar contrato
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/passkey_account.wasm \
  --source trips-company \
  --network testnet

# Guardar el CONTRACT_ID
export CONTRACT_ID="<contract_id_aqui>"
```

#### 4.3 Inicializar Contrato
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source trips-company \
  --network testnet \
  -- \
  initialize
```

---

### FASE 5: AUTOMATIZACIÓN CON MCP (10 min)

#### 5.1 Configurar MCP Server
```bash
cd mcp-servers/stellar-mcp
npm install
npm run build
```

#### 5.2 Crear Script de Despliegue Automatizado
```bash
# deploy-automation.sh
#!/bin/bash

set -e

echo "🚀 Iniciando despliegue automático..."

# 1. Build del contrato
echo "📦 Compilando contrato Soroban..."
cd contract
cargo build --target wasm32-unknown-unknown --release

# 2. Deploy a Stellar
echo "🌟 Desplegando a Stellar Testnet..."
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/passkey_account.wasm \
  --source trips-company \
  --network testnet

# 3. Build del frontend
echo "🎨 Compilando frontend Next.js..."
cd ../frontend
npm run build

# 4. Notificar Netlify (webhook)
echo "✅ Deploy completado!"
```

#### 5.3 Configurar Trigger en Netlify
1. Ir a **Site settings → Build & deploy → Continuous deployment**
2. Configurar webhook personalizado para MCP
3. O usar: **Netlify Build Hooks**

---

## 📊 CHECKLIST DE DESPLIEGUE

```markdown
### PRE-DESPLIEGUE
- [ ] Node.js 18+ verificado
- [ ] npm install ejecutado sin errores
- [ ] npm run build completado sin errores
- [ ] npm run type-check sin problemas
- [ ] Variables .env.production configuradas
- [ ] .env no incluye secrets

### CONFIGURACIÓN NETLIFY
- [ ] Repositorio conectado a Netlify
- [ ] Build settings correctos (base, command, publish)
- [ ] Variables de entorno configuradas
- [ ] netlify.toml validado
- [ ] Node version = 18

### CONTRATO INTELIGENTE
- [ ] Contrato compilado a .wasm
- [ ] Desplegado en Stellar Testnet
- [ ] CONTRACT_ID guardado
- [ ] Inicializado correctamente
- [ ] Testeable vía Stellar CLI

### POST-DESPLIEGUE
- [ ] Verificar deploy en Netlify (Build logs)
- [ ] Acceder a https://tu-sitio.netlify.app
- [ ] Conectar Freighter wallet
- [ ] Probar transacción de prueba
- [ ] Verificar console sin errores
- [ ] Probar en Testnet (no mainnet)

### MONITOREO
- [ ] Habilitar Netlify Analytics
- [ ] Configurar alertas de error
- [ ] Monitorear logs de función
- [ ] Verificar uso de ancho de banda
```

---

## 🔍 VERIFICACIÓN POST-DESPLIEGUE

### 1. Verificar Build en Netlify
```bash
# En Netlify Dashboard
Site settings → Build & deploy → Deploys

# Verificar último deploy exitoso
# Build time < 2 minutos ✓
# Deploy preview funcional ✓
# Production build sin errores ✓
```

### 2. Verificar Frontend
```javascript
// Abrir https://tu-sitio.netlify.app y en console ejecutar:
console.log(window.NEXT_PUBLIC_STELLAR_NETWORK); // "testnet"
console.log(window.NEXT_PUBLIC_CONTRACT_ID);     // Tu contract ID
```

### 3. Verificar Conectividad Stellar
```bash
# Verificar RPC
curl https://soroban-testnet.stellar.org

# Verificar contrato
stellar contract info \
  --id $CONTRACT_ID \
  --network testnet
```

### 4. Verificar Freighter Integration
1. Instalar Freighter en navegador
2. Importar cuenta Testnet
3. En DevTools → Console → Sin errores al conectar wallet
4. Probar transacción de prueba

---

## ⚠️ TROUBLESHOOTING

### Error: "Cannot find module '@stellar/stellar-sdk'"
```bash
npm install --legacy-peer-deps
npm run build
```

### Error: "WebAuthn not supported"
Verificar headers COOP/COEP en netlify.toml:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Embedder-Policy = "require-corp"
```

### Error: "Contract not found on Stellar"
1. Verificar CONTRACT_ID es correcto
2. Verificar red es "testnet"
3. Re-desplegar contrato

### Error: "Freighter not detecting network"
1. Verificar NEXT_PUBLIC_STELLAR_RPC_URL
2. Limpiar cache Freighter
3. Reiniciar navegador

### Slow Build Time
```bash
# Aumentar memoria de Node
export NODE_OPTIONS="--max_old_space_size=3072"
npm run build
```

---

## 🔐 SEGURIDAD EN PRODUCCIÓN

### 1. Variables de Entorno Seguras
```javascript
// ❌ NUNCA hacer esto:
const SECRET_KEY = "SXXXXXXXXXXXXXX"; // ¡Exposición!

// ✅ Usar variables de entorno
const API_KEY = process.env.NEXT_PUBLIC_STELLAR_RPC_URL;
```

### 2. Headers de Seguridad
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "SAMEORIGIN"
    X-XSS-Protection = "1; mode=block"
```

### 3. Limitación de Tasa
```bash
# Configurar en Netlify Functions (si aplica)
# rate-limiting.js
exports.handler = async (event) => {
  // Implementar rate limiting
};
```

### 4. Verificación de Contrato
- Auditoría de seguridad del contrato Soroban
- Testing unitario completo
- Testnet deployment antes de mainnet

---

## 📈 MONITOREO Y MÉTRICAS

### Netlify Analytics
```
Site settings → Analytics
- Page views
- Unique visitors
- Build times
- Function performance
```

### Custom Metrics
```javascript
// En src/app/layout.tsx
if (typeof window !== 'undefined') {
  // Enviar eventos a servicio de analytics
  console.log('Page loaded:', performance.now());
}
```

### Alertas Recomendadas
- [ ] Build failure → Email
- [ ] Deploy error → Slack webhook
- [ ] Function error rate > 1% → Alert
- [ ] Uptime monitoring

---

## 🚀 PASOS FINALES DE DESPLIEGUE

### 1. Push a GitHub
```bash
git add .
git commit -m "chore: prepare for Netlify deployment"
git push origin main
```

### 2. Triggerear Build en Netlify
- Automático al push
- O manual: **Deploys → Trigger deploy**

### 3. Esperar Complección
- Build: 1-2 minutos
- Deploy: < 30 segundos
- Verificar status badge ✅

### 4. Acceder a URL de Deploy
```
https://nombre-sitio.netlify.app
```

### 5. Verificación Final
- [ ] Sitio carga correctamente
- [ ] No hay errores en console
- [ ] Conectar con Freighter funciona
- [ ] Transacciones de prueba funcionan

---

## 📞 SOPORTE Y RECURSOS

### Documentación Oficial
- **Netlify Next.js:** https://docs.netlify.com/frameworks/next-js/overview/
- **OpenNext Adapter:** https://opennext.js.org/netlify
- **Stellar Docs:** https://developers.stellar.org/
- **Soroban Docs:** https://soroban.stellar.org/

### Comunidades
- Stellar Discord: https://discord.gg/stellar
- Netlify Community: https://answers.netlify.com/
- GitHub Discussions: [Tu repo]

### Herramientas de Debug
```bash
# Ver logs Netlify
netlify logs

# Ejecutar localmente como producción
NODE_ENV=production npm run start

# Verificar bundle size
npm run build -- --analyze
```

---

## 📝 NOTAS IMPORTANTES

1. **Testnet vs Mainnet:** Este deployment está en Stellar **Testnet**. Para mainnet, cambiar:
   - `NEXT_PUBLIC_STELLAR_NETWORK=mainnet`
   - Auditoria de seguridad requerida
   - Gas fees reales (no free testnet XLM)

2. **Freighter Wallet:** Usuarios necesitan:
   - Extensión Freighter instalada
   - Cuenta Testnet importada
   - XLM de prueba en billetera

3. **Actualizaciones:** Netlify actualiza automáticamente:
   - OpenNext adapter
   - Node.js (si no pinea versión)
   - Edge Functions

4. **Costo:** Netlify Free tier incluye:
   - 300 minutos build/mes
   - Ilimitadas funciones serverless
   - 125k solicitudes Edge Functions/mes

---

**Versión:** 1.0  
**Fecha:** 3 de diciembre de 2025  
**Autor:** Equipo Desarrollo Viajes de Estudio  
**Status:** ✅ Listo para despliegue

---
