# 📦 Contratos de Paquetes de Viaje - Documentación

## 🎯 Visión General

Los nuevos contratos inteligentes simulan la liberación de dinero cuando un estudiante elige un paquete de viaje. El flujo es completamente automatizado y basado en el scoring crediticio del estudiante.

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────┐
│    TRAVEL PACKAGE CONTRACT                   │
│  (Gestión de Paquetes y Transacciones)      │
└─────────────────────────────────────────────┘
          │                    │
          ├─► Crear Paquetes   │
          ├─► Pool de Fondos   │
          └─► Reservar Viaje   ├─► Liberar Dinero
                   │           │
          ┌────────┴───────────┘
          │
    ┌─────▼──────────────────┐
    │  FUNDING POOL (XLM)     │
    │  Almacena XLM del       │
    │  programa para viajes   │
    └────────────────────────┘
```

## 📋 Funcionalidades Principales

### 1. **Crear Paquetes de Viaje** (`create_package`)

```rust
pub fn create_package(
    env: Env,
    admin: Address,
    package_id: u32,
    destination: Symbol,
    price: i128,                // En stroops (1 XLM = 10,000,000 stroops)
    duration_days: u32,
    max_students: u32,
    min_credit_score: u32,
) -> Result<TravelPackage, TravelPackageError>
```

**Ejemplo:**
```rust
// Crear un viaje a París por 500 XLM, máximo 30 estudiantes, score mínimo 700
create_package(
    admin,
    1,                          // package_id
    "PARIS",                    // destination
    5_000_000_000i128,         // 500 XLM en stroops
    7,                         // 7 días de duración
    30,                        // máximo 30 estudiantes
    700,                       // score mínimo
)
```

### 2. **Reservar Paquete y Liberar Dinero** (`book_package`)

```rust
pub fn book_package(
    env: Env,
    student: Address,
    package_id: u32,
    credit_score: u32,
) -> Result<TravelBooking, TravelPackageError>
```

**Flujo de Reserva:**

1. ✅ Validar que el estudiante existe
2. ✅ Encontrar el paquete por ID
3. ✅ Verificar que el paquete está activo
4. ✅ Validar que el score crediticio es suficiente
5. ✅ Verificar que no hay cupo lleno
6. ✅ Verificar que el estudiante no tiene una reserva activa
7. ✅ **Liberar dinero del pool** ← **AUTOMÁTICO**
8. ✅ Registrar la transacción
9. ✅ Retornar comprobante de reserva

**Resultado:**

```rust
TravelBooking {
    booking_id: 12345,
    student: student_address,
    package_id: 1,
    destination: "PARIS",
    amount_disbursed: 5_000_000_000,  // 500 XLM liberados
    credit_score: 750,
    booking_date: 1734699200,
    departure_date: 1735304000,       // booking_date + 7 días
    status: "CONFIRMED",
}
```

### 3. **Gestionar Pool de Fondos** (`deposit_to_pool`)

```rust
pub fn deposit_to_pool(
    env: Env,
    admin: Address,
    amount: i128,
) -> Result<i128, TravelPackageError>
```

**Ejemplo:**
```rust
// Depositar 10,000 XLM al pool
deposit_to_pool(admin, 100_000_000_000i128)  // 10,000 XLM en stroops
```

### 4. **Verificar Elegibilidad** (`check_eligibility`)

```rust
pub fn check_eligibility(
    env: Env,
    student: Address,
    package_id: u32,
    credit_score: u32,
) -> bool
```

Valida antes de reservar:
- ✅ Score crediticio cumple mínimo
- ✅ Paquete está activo
- ✅ No hay cupo lleno
- ✅ Pool tiene fondos suficientes

### 5. **Cancelar Reserva** (`cancel_booking`)

```rust
pub fn cancel_booking(
    env: Env,
    student: Address,
    booking_id: u32,
) -> Result<i128, TravelPackageError>
```

- Retorna el dinero al pool
- Marca la reserva como CANCELLED
- Libera el cupo del paquete

## 🔐 Validaciones de Seguridad

| Validación | Descripción |
|-----------|------------|
| **Score Crediticio** | Solo estudiantes con score ≥ min_credit_score pueden reservar |
| **Fondos en Pool** | El contrato verifica que hay suficiente dinero antes de liberar |
| **Duplicados** | Un estudiante no puede reservar el mismo paquete dos veces |
| **Capacidad** | No se puede exceder max_students del paquete |
| **Autenticación** | Solo el admin puede crear paquetes y gestionar el pool |

## 📊 Flujos de Error

```
❌ NotInitialized (1)
   → El contrato no ha sido inicializado

❌ AlreadyInitialized (2)
   → Intento de reinicializar

❌ InsufficientCreditScore (3)
   → Score del estudiante < score mínimo del paquete

❌ InsufficientPoolFunds (4)
   → Pool no tiene dinero suficiente

❌ DuplicateBooking (5)
   → Estudiante ya reservó este paquete

❌ Unauthorized (6)
   → Solo admin puede hacer esta operación

❌ InvalidAmount (7)
   → Monto inválido (≤ 0)

❌ PackageNotFound (8)
   → package_id no existe

❌ PackageNotActive (9)
   → Paquete está desactivado

❌ PackageFull (10)
   → Se alcanzó el máximo de estudiantes

❌ NoPackagesAvailable (11)
   → No hay paquetes en el sistema

❌ NoBookingsFound (12)
   → No hay reservas registradas

❌ BookingNotFound (13)
   → booking_id no existe para este estudiante

❌ InvalidPrice (14)
   → Precio ≤ 0

❌ InvalidDuration (15)
   → Duración = 0
```

## 🧪 Casos de Prueba

### Caso 1: Reserva Exitosa

```rust
// Setup
initialize(admin, token, pool) ✓
deposit_to_pool(admin, 10_000_000_000) ✓  // 1000 XLM
create_package(admin, 1, "PARIS", 500_000_000, 7, 20, 700) ✓  // 50 XLM

// Reserva
book_package(student, 1, 750) ✓
→ amount_disbursed: 500_000_000
→ pool_balance: 9_500_000_000 (se restó 500 XLM)
```

### Caso 2: Score Insuficiente

```rust
book_package(student, 1, 650) ✗
→ Error: InsufficientCreditScore
→ Pool balance: SIN CAMBIOS
```

### Caso 3: Fondos Insuficientes

```rust
deposit_to_pool(admin, 100_000_000)  // Solo 10 XLM
create_package(admin, 2, "TOKYO", 500_000_000, 5, 15, 700)  // 50 XLM necesarios

book_package(student, 2, 750) ✗
→ Error: InsufficientPoolFunds
```

## 🔄 Integración con Frontend

### 1. Obtener Paquetes Disponibles

```javascript
const packages = await contract.get_packages();
// Retorna array de TravelPackage
```

### 2. Verificar Elegibilidad Antes de Reservar

```javascript
const eligible = await contract.check_eligibility(
    studentAddress,
    packageId,
    creditScore
);

if (!eligible) {
    console.log("No cumple requisitos");
}
```

### 3. Realizar Reserva

```javascript
const booking = await contract.book_package(
    studentAddress,
    packageId,
    creditScore
);

// booking.amount_disbursed = dinero liberado automáticamente
// booking.booking_id = ID para trackear
// booking.departure_date = fecha de salida
```

### 4. Obtener Historial de Transacciones

```javascript
const history = await contract.get_transaction_history(studentAddress);
// Cada transacción registra:
// - transaction_id
// - package_id
// - amount
// - timestamp
// - status
```

## 💰 Ejemplo Completo

```rust
// 1. Inicializar (una sola vez)
initialize(
    admin: "GBJCHUKZMTFSLOMNC7P4TS4VJJBTCYL3YKSOLXAUJSD3RQVVSYD3HYQ",
    token: "GBBD47UZQ2KSYFIKG3QIC5P5GPU5DJV5B535AGA2DAES3YPHT6MRWGB",
    pool: "GCZST3SMNAHMNSK2QUYCVHX4GCNXEY4VJBKZ3RU4DAJFQXTDQQJMUAA"
) → OK

// 2. Depositar fondos (admin prepara el pool)
deposit_to_pool(admin, 100_000_000_000)  // 10,000 XLM
→ new_balance: 100_000_000_000

// 3. Crear paquetes (opciones de viaje)
create_package(
    admin,
    1,
    "PARIS",
    5_000_000_000,  // 500 XLM por estudiante
    7,
    30,
    700
) → TravelPackage { id: 1, destination: "PARIS", ... }

create_package(
    admin,
    2,
    "TOKYO",
    7_000_000_000,  // 700 XLM por estudiante
    10,
    20,
    750
) → TravelPackage { id: 2, destination: "TOKYO", ... }

// 4. Estudiante elige paquete
booking = book_package(
    "GBUQWP3TUJSIIK63RJBCJ4VFEAGKQSW4LQZKXKQSGQGP5OOVWT4FFFBZ",
    1,          // París
    750         // Score crediticio
)
→ ✅ CONFIRMADO
→ amount_disbursed: 5_000_000_000 XLM (se libera automáticamente)
→ pool_balance: 95_000_000_000 XLM

// 5. Ver historial
history = get_transaction_history(student)
→ [
    {
        transaction_id: 12345,
        amount: 5_000_000_000,
        status: "CONFIRMED",
        timestamp: 1734699200
    }
]
```

## 🚀 Próximos Pasos

1. **Compilar el contrato:**
   ```bash
   cd contract
   cargo build --release --features travel-package
   ```

2. **Desplegar en Testnet:**
   ```bash
   soroban contract deploy \
       --wasm target/wasm32-unknown-unknown/release/soroban_passkey_contract.wasm
   ```

3. **Inicializar en Testnet:**
   ```bash
   soroban contract invoke \
       --id <CONTRACT_ADDRESS> \
       --fn initialize \
       --arg <admin> \
       --arg <token> \
       --arg <pool>
   ```

## 📝 Notas

- Los montos están en **stroops** (1 XLM = 10,000,000 stroops)
- El score crediticio está entre 300 y 850
- Cada estudiante puede tener solo 1 reserva activa por paquete
- Las transacciones se registran automáticamente para auditoría
- El pool se gestiona de forma centralizada por el admin

