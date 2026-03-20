# 💳 Flujo de Pagos - Reserva de Viajes

## Resumen General

El sistema implementa un flujo de transacciones completamente descentralizado utilizando la blockchain de Stellar con Freighter Wallet como interface de firma. Cuando un alumno reserva un viaje, el pago se realiza directamente a la wallet de la empresa de viajes.

---

## 🎯 Flujo Completo de Reserva

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ALUMNO VE VIAJES DISPONIBLES (/available-trips)          │
├─────────────────────────────────────────────────────────────┤
│ - Lista todos los viajes activos                            │
│ - Muestra: Destino, Duracion, Precio (XLM), Espacios       │
│ - Botón: "Ver Detalles" → /trip-detail?id={tripId}          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. ALUMNO ABRE DETALLES DEL VIAJE (/trip-detail)            │
├─────────────────────────────────────────────────────────────┤
│ - Detalles completos del viaje                              │
│ - Empresa, descripción, highlights, disponibilidad          │
│ - Precio claramente visible                                 │
│ - Botón: "Reservar Ahora"                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. CLICK EN "RESERVAR AHORA"                                │
├─────────────────────────────────────────────────────────────┤
│ Status: 'signing'                                           │
│ - Detecta Freighter wallet instalada                        │
│ - Obtiene public key del alumno: await getFreighterWallet() │
│ - UI muestra: "🔐 Esperando firma en Freighter..."          │
└─────────────────────────────────────────────────────────────┘
                            ↓
        🔐 FREIGHTER POPUP - USUARIO FIRMA
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. TRANSACCIÓN CONSTRUIDA Y FIRMADA                         │
├─────────────────────────────────────────────────────────────┤
│ Status: 'submitting'                                        │
│ - Transacción construida con:                               │
│   * Origen: Public Key del alumno                           │
│   * Destino: Wallet de la empresa                           │
│   * Monto: X XLM (precio del viaje)                         │
│   * Memo: "Reserva: Nombre del Viaje"                       │
│   * Network: TESTNET                                        │
│ - Freighter firma la transacción                            │
│ - Se envía a Stellar Horizon (testnet)                      │
│ - UI muestra: "📤 Enviando a blockchain..."                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
         ✅ TRANSACCIÓN CONFIRMADA EN STELLAR
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. RESERVA GUARDADA EN API                                  │
├─────────────────────────────────────────────────────────────┤
│ Status: 'registering'                                       │
│ - POST /api/reservations con:                               │
│   * tripId                                                  │
│   * clientWallet                                            │
│   * companyWallet                                           │
│   * amount (XLM)                                            │
│   * txHash (hash de transacción Stellar)                    │
│   * status: 'completed'                                     │
│ - Se guarda en data/reservations.json                       │
│ - UI muestra: "📝 Registrando reserva..."                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. ✅ ÉXITO - RESERVA CONFIRMADA                             │
├─────────────────────────────────────────────────────────────┤
│ Status: 'success'                                           │
│ - UI muestra confirmación con:                              │
│   * Nombre del viaje                                        │
│   * Monto pagado en XLM                                     │
│   * Hash de transacción (verificable en Stellar)            │
│ - Alumno puede volver a viajes disponibles                  │
│ - Reserva aparece en "Mis Reservas"                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Arquitectura Técnica

### Componentes Principales

#### 1. **Frontend - Página de Detalles** (`/app/trip-detail/page.tsx`)
```typescript
- Obtiene ID del viaje desde URL: ?id={tripId}
- Busca viaje completo usando: useTripOffers().getTripById(tripId)
- Muestra información del viaje
- Maneja flujo de reserva con useStellarTransaction()
- Estados: 'idle' → 'signing' → 'submitting' → 'registering' → 'success'|'error'
```

#### 2. **Hook de Transacciones Stellar** (`/hooks/useStellarTransaction.ts`)
```typescript
// Funciones principales:

// 1. Obtener wallet del usuario
getFreighterWallet(): Promise<string>
- Accede a window.freighter
- Solicita public key al usuario
- Retorna string con wallet pública

// 2. Enviar pago
sendPayment(from, to, amountXLM, memo): Promise<TransactionResult>
- Conecta a Horizon (testnet)
- Obtiene cuenta del remitente
- Construye transacción de pago XLM
- Solicita firma a Freighter
- Envía a blockchain
- Retorna hash de transacción
```

#### 3. **API de Reservas** (`/api/reservations/route.ts`)
```typescript
POST /api/reservations
- Recibe: tripId, clientWallet, companyWallet, amount, txHash
- Valida que el viaje exista
- Verifica que no haya duplicados
- Guarda en data/reservations.json
- Retorna: { success: true, reservation: {...} }

GET /api/reservations?clientWallet=xxx
- Retorna todas las reservas de un cliente
- Filtro opcional por wallet
```

---

## 💰 Flujo de Dinero (Real en Stellar Testnet)

```
Alumno Wallet (CLIENTE)
  │
  ├─ Balance inicial: 10,000 XLM (Friendbot)
  │
  └─ Realiza reserva: -5 XLM (ejemplo)
     │
     ├─ Comisión Stellar: -0.00001 XLM (BASE_FEE)
     │
     └─ → Empresa Wallet (DESTINO)
        │
        └─ Recibe: 4.99999 XLM (5 - fee)
```

**Validación:**
- El alumno DEBE tener suficiente balance
- La transacción falla si balance < (monto + fee)
- Stellar rechaza automáticamente transacciones inválidas

---

## 🔐 Seguridad - Freighter Wallet

### Flujo de Firma

1. **Usuario hace clic en "Reservar"**
   ```
   handleReserveTrip() → sendPayment() → Freighter.signTransaction()
   ```

2. **Freighter detecta solicitud y muestra UI**
   ```
   - El navegador NO ve la clave privada
   - Usuario revisa detalles en popup de Freighter:
     * Destino wallet
     * Monto XLM
     * Memo
   ```

3. **Usuario aprueba o rechaza**
   ```
   Aprueba → Freighter firma con clave privada (privada en extensión)
   Rechaza → Cancela transacción
   ```

4. **Transacción firmada vuelve a frontend**
   ```
   - Frontend NUNCA toca clave privada
   - Solo maneja XDR (firma ya aplicada)
   - Envía a Stellar
   ```

### Criptografía
- **Algoritmo:** Ed25519
- **Firma:** RSA de transacción XDR
- **Verificación:** Stellar valida firma antes de incluir en ledger

---

## 📊 Estados de Transacción UI

```
┌──────────────────────────────────────────────────────┐
│ IDLE                                                 │
│ - Botón "Reservar Ahora" disponible                  │
│ - Usuario puede hacer clic                           │
└──────────────────────────────────────────────────────┘
             ↓ Usuario hace clic
┌──────────────────────────────────────────────────────┐
│ SIGNING                                              │
│ - "🔐 Esperando firma en Freighter..."               │
│ - Freighter popup abierto                            │
│ - Botón deshabilitado                                │
└──────────────────────────────────────────────────────┘
             ↓ Usuario firma en Freighter
┌──────────────────────────────────────────────────────┐
│ SUBMITTING                                           │
│ - "📤 Enviando a blockchain..."                      │
│ - Transacción en tránsito a Stellar                  │
│ - Esperando confirmación                             │
└──────────────────────────────────────────────────────┘
             ↓ Transacción confirmada
┌──────────────────────────────────────────────────────┐
│ REGISTERING                                          │
│ - "📝 Registrando reserva..."                        │
│ - Guardando en API                                   │
│ - Actualizando conteos                               │
└──────────────────────────────────────────────────────┘
             ↓ Reserva guardada
┌──────────────────────────────────────────────────────┐
│ SUCCESS ✅                                            │
│ - "¡Reserva exitosa!"                                │
│ - Muestra monto y txHash                             │
│ - Botón "Volver a viajes"                            │
└──────────────────────────────────────────────────────┘

En caso de error en cualquier etapa:
             ↓ Error
┌──────────────────────────────────────────────────────┐
│ ERROR ❌                                              │
│ - Muestra mensaje de error específico                │
│ - "Intentar de nuevo" disponible                     │
│ - No cambia balance si error antes de enviar         │
└──────────────────────────────────────────────────────┘
```

---

## 📱 Interfaz de Usuario

### /trip-detail?id={tripId}

**Sección Izquierda - Detalles:**
```
┌─────────────────────────────┐
│ Nombre del Viaje            │
│ Destino                     │
│ Duración: X días            │
│ Descripción completa        │
│ Espacios: X/Y disponibles   │
│ Highlights (bullets):       │
│ • Punto 1                   │
│ • Punto 2                   │
│ • Punto 3                   │
└─────────────────────────────┘
```

**Sección Derecha - Pago:**
```
┌─────────────────────────────┐
│ Precio por persona          │
│ ┌─────────────────────────┐ │
│ │ X.XX XLM                │ │
│ │                         │ │
│ │ [RESERVAR AHORA]        │ │
│ │ (o estado en proceso)   │ │
│ │                         │ │
│ │ 💡 Se requiere          │ │
│ │ Freighter Wallet        │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

---

## ✅ Verificación de Transacciones

Cada transacción es **verificable públicamente** en Stellar Testnet:

```
URL: https://stellar.expert/explorer/testnet/tx/{txHash}

Muestra:
- De: Wallet del alumno
- Para: Wallet de la empresa
- Monto: X XLM
- Memo: "Reserva: Nombre Viaje"
- Estado: SUCCESS
- Timestamp: Hora exacta
- Fee: 100 stroops (0.00001 XLM)
```

---

## 🐛 Manejo de Errores

### Errores Posibles y Recuperación

| Error | Causa | Solución |
|-------|-------|----------|
| "Freighter no disponible" | Extensión no instalada | Instalar Freighter |
| "No se pudo obtener wallet" | Freighter no conectada | Conectar wallet en Freighter |
| "Insufficient balance" | Alumno sin XLM suficientes | Pedir XLM via Friendbot |
| "Network error" | Problema de red | Reintentar automáticamente |
| "Transaction rejected" | Usuario rechazó en Freighter | Permitir reintentar |
| "Failed to save reservation" | Error guardando en API | La transacción se hizo, pero reserva no guardada |

---

## 📈 Monitoreo y Logs

### Frontend Logs
```
console.log('🔄 Iniciando proceso de reserva...')
console.log('✅ Wallet obtenida: GABXX...')
console.log('📤 Enviando pago a empresa: GABXX...')
console.log('📝 Transacción construida: {...}')
console.log('🔐 Solicitando firma a Freighter...')
console.log('✅ Transacción firmada')
console.log('📤 Enviando transacción...')
console.log('✅ Transacción enviada: hash_xxx')
console.log('📝 Registrando reserva...')
console.log('✅ Reserva registrada: id_xxx')
```

### API Logs
```
[API] POST /reservations
  Recibida reserva: { tripId, clientWallet, amount, txHash }
  Validando viaje...
  Guardando en data/reservations.json...
  ✅ Reserva guardada con ID: ...
```

---

## 🚀 Testing del Flujo Completo

### 1. Preparar Testnet
```bash
# Asegúrate de tener:
# - Freighter instalada y conectada
# - Wallet con balance > 10 XLM
# - Backend corriendo: npm run dev (puerto 3000)
```

### 2. Crear Empresa
```
1. Login como EMPRESA
2. Crear viaje test: "Viaje a Madrid"
3. Precio: 5 XLM
4. Guardar
```

### 3. Crear Alumno y Reservar
```
1. Logout y login como ALUMNO (wallet diferente)
2. Ir a /available-trips
3. Clickear "Ver Detalles" en el viaje
4. Click "Reservar Ahora"
5. Firmar en Freighter popup
6. Esperar confirmación
```

### 4. Verificar
```
Frontend:
  ✓ Reserva aparece en "Mis Reservas"
  ✓ Hash de transacción visible
  ✓ Monto correcto mostrado

Backend:
  ✓ Reserva guardada en data/reservations.json
  ✓ Hash coincide con Stellar

Stellar:
  ✓ https://stellar.expert/explorer/testnet/account/{empresa_wallet}
  ✓ Transacción entrada con memo "Reserva: ..."
```

---

## 📝 Próximas Mejoras

- [ ] Reembolso automático si se cancela
- [ ] Historial de transacciones para ambas partes
- [ ] Notificaciones en tiempo real
- [ ] Soporte para múltiples assets (no solo XLM)
- [ ] Sistema de escrow para pagos seguros
- [ ] Migración a Mainnet

---

**Sistema funcional con descentralización completa ✨**
