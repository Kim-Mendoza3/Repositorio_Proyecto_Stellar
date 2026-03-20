# 💰 EBAS Credit Scoring MVP - Branch Development

> **Branch:** `feature/credit-scoring-mvp`  
> **Base:** `v1.0.0-ebas-basic`  
> **Target:** `v2.0.0-mvp-complete`  
> **Status:** 🚧 **IN DEVELOPMENT**

---

## 🎯 Objetivo

Implementar un sistema completo de **préstamos instantáneos** basado en credit scoring para trabajadores de gig economy (Uber, Rappi, DiDi), utilizando **Stellar/Soroban blockchain**.

---

## 📚 Documentación

- **Plan Completo:** [`MVP-CREDIT-SCORING-PLAN.md`](./MVP-CREDIT-SCORING-PLAN.md)
- **Estado Actual:** [`IMPLEMENTATION-STATUS.md`](./IMPLEMENTATION-STATUS.md)
- **README Principal:** [`README.md`](./README.md)

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                     │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐         │
│  │  Landing   │→ │   Income    │→ │   Credit     │         │
│  │   Page     │  │  Dashboard  │  │   Profile    │         │
│  └────────────┘  └─────────────┘  └──────────────┘         │
│         ↓                ↓                  ↓                │
│  ┌──────────────────────────────────────────────┐           │
│  │         WebAuthn/Passkey Authentication      │           │
│  └──────────────────────────────────────────────┘           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API (Next.js)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Mock Data   │  │   Credit     │  │   Loan       │      │
│  │  Generator   │  │   Scoring    │  │   Request    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              STELLAR TESTNET (Blockchain)                    │
│  ┌──────────────────┐        ┌──────────────────┐           │
│  │  Token Contract  │  ←───  │  Loan Contract   │           │
│  │  (USDC Mock)     │        │  (Distribution)  │           │
│  └──────────────────┘        └──────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerrequisitos
```bash
# Node.js v18+
node --version  # v18.20.8

# Stellar CLI
stellar --version

# Soroban CLI
soroban --version
```

### Instalar Dependencias
```bash
cd frontend
npm install
```

### Configurar Variables de Entorno
```bash
# Crear .env.local
cp .env.example .env.local

# Editar con los contract IDs
nano .env.local
```

### Ejecutar Desarrollo
```bash
# Terminal 1: Frontend
cd frontend
npm run dev

# Visitar: http://localhost:3000
```

---

## 📦 Estructura del Proyecto

```
soroban-passkey-demo/
├── contract/                    # Smart Contracts (Rust/Soroban)
│   ├── src/
│   │   ├── lib.rs              # Passkey contract (original)
│   │   ├── loan_contract.rs    # 🆕 Loan distribution
│   │   ├── loan_types.rs       # 🆕 Data types
│   │   └── loan_test.rs        # 🆕 Tests
│   ├── Cargo.toml
│   └── Makefile
│
├── frontend/                    # Frontend (Next.js 14)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                    # Landing redirect
│   │   │   ├── credit/page.tsx             # 🆕 Landing EBAS
│   │   │   ├── income-dashboard/page.tsx   # 🆕 Connect apps
│   │   │   ├── credit-profile/page.tsx     # 🆕 Score display
│   │   │   ├── loan-success/page.tsx       # 🆕 Confirmation
│   │   │   └── api/
│   │   │       ├── get-loan-data/          # 🆕 Mock generator
│   │   │       ├── calculate-score/        # 🆕 Scoring engine
│   │   │       └── request-loan/           # 🆕 Loan handler
│   │   │
│   │   ├── components/
│   │   │   ├── loan/                       # 🆕 Loan components
│   │   │   │   ├── LandingPageCredit.tsx
│   │   │   │   ├── IncomeDashboard.tsx
│   │   │   │   ├── CreditProfile.tsx
│   │   │   │   ├── LoanSuccess.tsx
│   │   │   │   ├── IncomeChart.tsx
│   │   │   │   └── PlatformBadge.tsx
│   │   │   │
│   │   │   ├── LandingPage.tsx             # ✏️ Modified (EBAS)
│   │   │   ├── Dashboard.tsx               # ✏️ Modified (button)
│   │   │   └── ... (otros originales)
│   │   │
│   │   ├── lib/
│   │   │   ├── loan-contract.ts            # 🆕 Contract client
│   │   │   └── ... (otros originales)
│   │   │
│   │   └── hooks/
│   │       └── usePasskey.ts               # Original (sin cambios)
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── scripts/
│   ├── deploy-testnet.sh                   # Original
│   └── deploy-loan-contract.sh             # 🆕 Deploy loan contract
│
├── MVP-CREDIT-SCORING-PLAN.md              # 🆕 Plan de 7 días
├── IMPLEMENTATION-STATUS.md                # 🆕 Estado actual
├── README-MVP.md                           # 🆕 Este archivo
└── README.md                               # Original
```

**Leyenda:**
- 🆕 Nuevo archivo/carpeta
- ✏️ Modificado
- Sin icono: Original sin cambios

---

## 🎨 Features Implementadas

### ✅ Base (v1.0.0-ebas-basic)
- [x] Landing page con branding EBAS
- [x] Dashboard con botón EBAS
- [x] 3 rutas mock (dashboard, credit, success)
- [x] Autenticación Passkey (original)
- [x] UI responsive

### 🚧 En Desarrollo (v2.0.0-mvp-complete)
- [ ] Smart contract de préstamos
- [ ] Token contract USDC (mock)
- [ ] API de generación de datos mock
- [ ] Engine de credit scoring
- [ ] Integración Soroban completa
- [ ] Transacciones reales en testnet

---

## 🧪 Testing

### Smart Contract
```bash
cd contract
cargo test --features loan
```

### Frontend
```bash
cd frontend
npm test
```

### End-to-End
```bash
# Iniciar servidor
npm run dev

# Ejecutar pruebas manuales según IMPLEMENTATION-STATUS.md
```

---

## 📊 Credit Scoring Algorithm

```
Base Score: 500

+ Income Bonus:
  - >= $400/week: +200 points
  - >= $300/week: +150 points
  - >= $200/week: +100 points
  - <  $200/week: +50 points

+ Consistency Bonus:
  - 4+ weeks of data: +50 points

+ Stability Bonus:
  - StdDev < $100: +50 points
  - StdDev < $150: +25 points

Eligibility:
  - Score >= 750: $500 USDC loan
  - Score >= 700: $300 USDC loan
  - Score <  700: Not eligible
```

**Rango:** 500 - 850

---

## 🔐 Smart Contract Functions

### Loan Contract
```rust
pub fn initialize(env: Env, admin: Address, token: Address, pool: Address)
pub fn transfer_loan(env: Env, recipient: Address, amount: i128, score: u32) -> Result<TransferResult, Error>
pub fn get_loan_history(env: Env, user: Address) -> Vec<LoanRecord>
pub fn deposit_to_pool(env: Env, admin: Address, amount: i128)
```

### Validaciones
- Credit score >= 700
- Fondos suficientes en pool
- Rate limiting (1 préstamo por día por usuario)
- No préstamos duplicados

---

## 🌐 API Endpoints

### POST `/api/get-loan-data`
**Body:**
```json
{
  "walletAddress": "G..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "incomeHistory": [...],
    "summary": {
      "totalIncome": 1200.00,
      "avgWeekly": 300.00,
      "platforms": ["Uber", "Rappi", "DiDi"]
    }
  }
}
```

### POST `/api/calculate-score`
**Body:**
```json
{
  "walletAddress": "G...",
  "incomeHistory": [...]
}
```

**Response:**
```json
{
  "success": true,
  "score": 750,
  "eligible": true,
  "loanAmount": 500,
  "reasoning": "...",
  "breakdown": {...}
}
```

### POST `/api/request-loan`
**Body:**
```json
{
  "walletAddress": "G...",
  "score": 750,
  "loanAmount": 500
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "abc123...",
  "disbursedAmount": 500,
  "disbursedAt": "2025-10-07T..."
}
```

---

## 📝 Commits y Versioning

### Conventional Commits
```bash
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formato/estilo
refactor: refactorización
test: tests
chore: mantenimiento
```

### Tags
- `v1.0.0-ebas-basic` - Base con 3 rutas mock
- `v2.0.0-mvp-complete` - MVP completo funcional (target)

---

## 🐛 Issues y Troubleshooting

### Node.js Version
```bash
# Si encuentras errores de sintaxis
nvm use 18
node --version  # Debe ser v18+
```

### Stellar CLI
```bash
# Si no encuentra comandos
stellar --version
soroban --version

# Reinstalar si es necesario
cargo install --locked stellar-cli --features opt
```

### Testnet RPC
```bash
# Si RPC no responde
export NEXT_PUBLIC_RPC_URL="https://soroban-testnet.stellar.org:443"
```

---

## 🤝 Contributing

Este es un branch de desarrollo. Para contribuir:

1. **Revisar plan:** `MVP-CREDIT-SCORING-PLAN.md`
2. **Revisar estado:** `IMPLEMENTATION-STATUS.md`
3. **Crear feature branch** desde `feature/credit-scoring-mvp`
4. **Hacer PR** al branch `feature/credit-scoring-mvp`

---

## 📞 Recursos

### Documentación
- [Plan de 7 Días](./MVP-CREDIT-SCORING-PLAN.md)
- [Estado de Implementación](./IMPLEMENTATION-STATUS.md)
- [Stellar Docs](https://developers.stellar.org/)
- [Soroban Docs](https://soroban.stellar.org/)
- [Next.js Docs](https://nextjs.org/docs)

### Tools
- [Stellar Expert](https://stellar.expert/explorer/testnet) - Explorer
- [Stellar Laboratory](https://laboratory.stellar.org/) - Testing

---

## 📈 Progreso

**Actualización:** 7 de Octubre, 2025

```
DÍA 0: ████████████████████ 100% ✅ Setup Completado
DÍA 1: ░░░░░░░░░░░░░░░░░░░░   0% ⏳ No iniciado
DÍA 2: ░░░░░░░░░░░░░░░░░░░░   0% ⏳ No iniciado
DÍA 3: ░░░░░░░░░░░░░░░░░░░░   0% ⏳ No iniciado
DÍA 4: ░░░░░░░░░░░░░░░░░░░░   0% ⏳ No iniciado
DÍA 5: ░░░░░░░░░░░░░░░░░░░░   0% ⏳ No iniciado
DÍA 6: ░░░░░░░░░░░░░░░░░░░░   0% ⏳ No iniciado
DÍA 7: ░░░░░░░░░░░░░░░░░░░░   0% ⏳ No iniciado

Total: ██░░░░░░░░░░░░░░░░░░  3%
```

**Próximo paso:** DÍA 1 - Task 1.2 (Setup Token Contract)

---

## 🚀 Deployment (Futuro)

### Testnet (Actual)
- Token Contract: `TBD`
- Loan Contract: `TBD`
- Frontend: `localhost:3000`

### Mainnet (Futuro)
- Token Contract: `TBD`
- Loan Contract: `TBD`
- Frontend: `TBD`

---

**Mantenido por:** GitHub Copilot  
**Última actualización:** 7 de Octubre, 2025  
**Licencia:** MIT
