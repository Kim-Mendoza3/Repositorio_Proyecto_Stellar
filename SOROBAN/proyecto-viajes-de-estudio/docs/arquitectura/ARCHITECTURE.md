# 🎯 TRIPS MARKETPLACE - ARCHITECTURE

## 📐 Arquitectura Final

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIOS                                 │
├───────────────────────────┬─────────────────────────────────┤
│  EMPRESA                  │  ALUMNO                         │
│  Browser 1                │  Browser 2                      │
│  (Crear Ofertas)          │  (Reservar Viajes)             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    Freighter Wallet
                     Stellar Network
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
   CREATE_TRIP                            LIST_TRIPS
   MAKE_RESERVATION                       RESERVATIONS
        │                                       │
        ▼                                       ▼
┌─────────────────────────────────────────────────────────────┐
│          SOROBAN SMART CONTRACT (Blockchain)                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📦 trips_marketplace.rs                                   │
│  ├── initialize()                                          │
│  ├── create_trip()          ━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ├── list_trips()           ◄────────────────────────────┤  │
│  ├── make_reservation()     ━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │  │
│  ├── list_client_reservations()                     │ │  │
│  └── cancel_reservation()                            │ │  │
│                                                       │ │  │
│  💾 Storage (Soroban State):                          │ │  │
│  ├── Trips Map                                        │ │  │
│  │   trip_0: {destination, price, spots, ...}        │ │  │
│  │   trip_1: {destination, price, spots, ...}        │ │  │
│  │   trip_2: {...}                                    │ │  │
│  │                                                    │ │  │
│  ├── Reservations Map                               │ │  │
│  │   res_0: {trip_id, client, status, ...}          │ │  │
│  │   res_1: {trip_id, client, status, ...}          │ │  │
│  │   res_2: {...}                                    │ │  │
│  │                                                    │ │  │
│  └── Counters                                        │ │  │
│      ├── TRIP_COUNT: 2                               │ │  │
│      └── RESERVATION_COUNT: 5                        │ │  │
│                                                      ◄─┴──┤
└─────────────────────────────────────────────────────────────┘
            Blockchain Stellar Testnet
            (Descentralizado, Seguro, Inmutable)
```

---

## 🔄 Flujo de Datos Multi-Navegador

### 1️⃣ Empresa crea oferta de viaje

```
BROWSER 1 (Empresa)
        │
        │ 1. useTripsMarketplace.createTrip()
        │    destination: "Japan"
        │    price: 100 XLM
        │    spots: 10
        │
        ▼
   Freighter Wallet
        │
        │ 2. Firma transacción
        │
        ▼
  Stellar Network
        │
        │ 3. Invoca contract.create_trip()
        │
        ▼
┌─────────────────────────┐
│  Soroban Storage        │
│  trips_map:             │
│    trip_0 = {           │
│      destination: "Japan",
│      price: 100000000,  │ (100 XLM en stroops)
│      spots: 10,         │
│      reserved: 0,       │
│      company: <wallet>  │
│    }                    │
└─────────────────────────┘
        ▲
        │ 4. Data stored on blockchain
        │
        ▼
BROWSER 2 (Alumno)
        │
        │ 5. useTripsMarketplace.listTrips()
        │
        ▼
   Freighter Wallet
        │
        │ 6. Lee del blockchain
        │
        ▼
┌──────────────────────────┐
│  Ver en pantalla:        │
│  ✓ Viaje a Japan        │
│  ✓ 100 XLM             │
│  ✓ 10 spots            │
│  ✓ [Reservar]          │
└──────────────────────────┘

⏱️  Tiempo total: ~5-10 segundos (confirmación blockchain)
```

---

## 2️⃣ Alumno hace reservación

```
BROWSER 2 (Alumno)
        │
        │ 1. Click en [Reservar]
        │    trip_id: "trip_0"
        │    price: 100 XLM
        │
        ▼
   Freighter Wallet
        │
        │ 2. Firma transacción
        │
        ▼
  Stellar Network
        │
        │ 3. Invoca contract.make_reservation()
        │    ├── Valida disponibilidad (9 spots quedan)
        │    ├── Valida precio (100 XLM >= 100 XLM)
        │    └── Crea reservación
        │
        ▼
┌──────────────────────────┐
│  Soroban Storage         │
│  reservations_map:       │
│    res_0 = {             │
│      trip_id: "trip_0",  │
│      client: <wallet>,   │
│      price: 100000000,   │
│      status: "confirmed" │
│    }                     │
│  trips_map:              │
│    trip_0.reserved++ (now 1)
└──────────────────────────┘
        │
        │ 4. Confirmación
        │
        ▼
BROWSER 2
┌──────────────────────────┐
│  ✓ ¡Reserva confirmada! │
│  Reservation ID: res_0  │
└──────────────────────────┘

BROWSER 1 (Empresa)
        │
        │ 5. Si recarga listCompanyTrips()
        │
        ▼
        │ trip_0 ahora muestra:
        │ Spots disponibles: 9/10
        │ [1 reservación pendiente]
```

---

## 🏗️ Estructura del Código

```
contract/
├── src/
│   ├── lib.rs                          (5KB)
│   │   └── #[cfg(feature = "trip")]
│   │       └── mod trips_marketplace
│   │
│   ├── trips_marketplace_types.rs      (3KB)
│   │   ├── struct TripOffer
│   │   ├── struct Reservation
│   │   └── enum MarketplaceError
│   │
│   └── trips_marketplace.rs            (12KB)
│       └── impl TripsMarketplace
│           ├── fn initialize()
│           ├── fn create_trip()
│           ├── fn list_trips()
│           ├── fn make_reservation()
│           ├── fn list_client_reservations()
│           └── fn cancel_reservation()
│
├── target/wasm32-unknown-unknown/release/
│   └── passkey_account.wasm            (94KB compilado)
│
└── Cargo.toml
    ├── soroban-sdk
    ├── soroban-contract-macros
    └── soroban-env-common

frontend/
├── src/
│   ├── hooks/
│   │   └── useTripsMarketplace.ts      (7KB)
│   │       ├── initializeMarketplace()
│   │       ├── createTrip()
│   │       ├── listTrips()
│   │       ├── makeReservation()
│   │       └── listClientReservations()
│   │
│   └── app/
│       ├── company-dashboard/page.tsx
│       │   └── Usa: createTrip()
│       │
│       └── available-trips/page.tsx
│           ├── Usa: listTrips()
│           └── Usa: makeReservation()
│
└── .env.local
    └── NEXT_PUBLIC_TRIPS_CONTRACT_ID=...
```

---

## 🔐 Seguridad

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1: WALLET AUTHENTICATION                        │
│  ├── Freighter Wallet requerido                         │
│  ├── Firma con clave privada de usuario                │
│  └── No se transmiten keys al servidor                 │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  LAYER 2: BLOCKCHAIN VALIDATION                        │
│  ├── Stellar network valida firma                      │
│  ├── Contract validaciones (business logic)            │
│  ├── Precio, disponibilidad, etc.                      │
│  └── Transacción ledger-locked                         │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  LAYER 3: IMMUTABLE STATE                              │
│  ├── Datos en Soroban State (blockchain)              │
│  ├── No modificable después de confirmación            │
│  ├── Auditable (cualquiera puede verificar)           │
│  └── Replicado en múltiples nodos                      │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Comparativa: JSON vs Soroban

| Aspecto | JSON Backend | Soroban |
|---------|--------------|--------|
| **Donde se guarda** | Servidor local | Blockchain |
| **Multi-navegador** | ✓ (mismo servidor) | ✓ (mismo blockchain) |
| **Descentralizado** | ✗ | ✓ |
| **Seguridad** | Media (depende del servidor) | Alta (criptografía blockchain) |
| **Auditabilidad** | Solo admin | Todos pueden auditar |
| **Costo servidor** | $5-50/mes | Gratis (Stellar sponsora) |
| **Escalabilidad** | Limitada | Ilimitada |
| **Down time** | Posible | Imposible (blockchain) |
| **Privacidad** | ✓ (datos privados) | ✓ (billetera privada) |

---

## 🚀 Timeline Estimado

```
Hoy:
  ✅ Contrato compilado
  ⏳ Desplegar (~5 min)
  
Después del despliegue:
  ⏳ Probar en 2 navegadores (~10 min)
  ⏳ Agregar UI mejorada (~2 horas)
  ⏳ Testing intensivo (~1 día)
  ⏳ Deploy a Mainnet (~cuando esté ready)
```

---

## 💡 Ventajas de tu Arquitectura

1. **Verdaderamente Descentralizada**
   - No depende de un servidor central
   - Cualquiera puede verificar los datos

2. **Multi-Empresa Nativa**
   - Cualquier empresa puede crear ofertas
   - Sin revisar por admin

3. **Multi-Navegador Automática**
   - Datos sincronizados via blockchain
   - No requiere refresh manual

4. **Inmutable Audit Trail**
   - Todas las transacciones grabadas
   - Imposible falsificar

5. **Seguro**
   - Blockchain + Wallet authentication
   - Imposible hackear (sin robar wallet)

---

**Diagram dibujado: 28 de noviembre de 2025**
