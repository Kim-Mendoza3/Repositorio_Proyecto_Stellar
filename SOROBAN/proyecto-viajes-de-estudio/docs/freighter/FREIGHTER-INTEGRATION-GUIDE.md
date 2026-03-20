# Integración Freighter + Stellar SDK - Guía de Implementación

## Estado Actual ✅

Se han implementado los siguientes componentes para integración real de wallet y pagos en Testnet:

### 1. **useFreighterWallet Hook** (`frontend/src/hooks/useFreighterWallet.ts`)
- ✅ Detección automática de Freighter (con retry)
- ✅ Conexión a wallet
- ✅ Obtención de saldo desde Horizon API
- ✅ Procesamiento de pagos (buyTrip)
- ✅ Firma de transacciones con Freighter
- ✅ Envío a Stellar Testnet
- ✅ Historial de transacciones

**Funciones principales:**
```typescript
connectWallet()           // Conectar wallet con Freighter
disconnectWallet()        // Desconectar
buyTrip(trip)            // Procesar pago XLM
fetchTransactionHistory() // Obtener historial
```

### 2. **WalletLoginPage** (`frontend/src/components/WalletLoginPage.tsx`)
- ✅ Pantalla de login con Freighter
- ✅ Detección de disponibilidad de Freighter
- ✅ Información de wallet conectada
- ✅ Saldo en XLM
- ✅ Redirección a dashboard

### 3. **WalletContext** (`frontend/src/contexts/WalletContext.tsx`)
- ✅ Context global para estado de wallet
- ✅ Hook `useWallet()` para usar en componentes
- ✅ Gestión de cookies para persistencia

### 4. **TravelPackagesWithPayment** (`frontend/src/components/TravelPackagesWithPayment.tsx`)
- ✅ Listado de paquetes con precios en XLM
- ✅ Integración con hook de pagos
- ✅ Interfaz de pago con Freighter
- ✅ Visualización de transacciones exitosas
- ✅ Manejo de errores

### 5. **TransactionHistory** (`frontend/src/components/TransactionHistory.tsx`)
- ✅ Historial de transacciones desde Horizon API
- ✅ Auto-actualización cada 30s
- ✅ Links a Stellar Expert explorer

### 6. **Middleware de Protección** (`frontend/middleware.ts`)
- ✅ Protege rutas: `/dashboard`, `/ebas-credit`, `/ebas-dashboard`, `/travel-packages`
- ✅ Redirige a `/wallet-login` si no hay wallet

### 7. **Layout Global Actualizado** (`frontend/src/app/layout.tsx`)
- ✅ Envuelve app con WalletProvider

---

## Flujo de Usuario 🔄

```
1. Usuario entra a app
   ↓
2. Si NO tiene wallet conectada → Redirige a /wallet-login
   ↓
3. En /wallet-login:
   - Detecta Freighter
   - Botón "Conectar Wallet con Freighter"
   - Muestra saldo
   ↓
4. Una vez conectado → Redirije a /dashboard
   ↓
5. En dashboard accede a viajes y paquetes
   ↓
6. Selecciona paquete y "Pagar con Freighter"
   ↓
7. Freighter abre diálogo de firma
   ↓
8. Transacción se envía a Stellar Testnet
   ↓
9. Aparece hash de transacción y link a explorer
   ↓
10. Transacción aparece en historial
```

---

## Configuración Requerida ⚙️

### Dirección de la Operadora (Para recibir pagos)
```typescript
// frontend/src/hooks/useFreighterWallet.ts - Línea 18
TRIPS_OPERATOR_ADDRESS = 'GBUQWP3BOUZX34LOCALQVFSGHFTOJREM23NRHBK264KEXWFNVLB74OOO'
```
**Cambia esta dirección a la dirección real donde recibirás los pagos.**

### Precios en XLM
Los precios están definidos en `TravelPackagesWithPayment.tsx`:
```typescript
{
  id: 'basic',
  name: 'Paquete Básico',
  price: 3500,        // USD
  priceXLM: 35,       // XLM (ajustar según necesario)
}
```

---

## Cómo Probar 🧪

### Requisitos Previos:
1. **Freighter instalada** en Chrome: https://freighter.app
2. **Cuenta de Testnet**: Créala en https://stellar.org/developers/testnet
3. **XLM de prueba**: Obtén en https://stellar.org/developers/testnet

### Pasos:

1. **Acceder a la app**:
   ```
   http://localhost:3000
   ```

2. **Conectar wallet**:
   - Click en "Conectar Wallet con Freighter"
   - Autoriza en Freighter
   - Verifica saldo

3. **Comprar paquete**:
   - Selecciona un paquete
   - Click "Pagar con Freighter"
   - Firma en Freighter
   - Espera confirmación

4. **Verificar en Horizon**:
   - Click en link de transacción
   - Verifica en https://stellar.expert/explorer/testnet

---

## Rutas Disponibles 🗺️

| Ruta | Estado | Requiere Wallet |
|------|--------|---|
| `/` | Landing page | ❌ |
| `/login` | Passkey login | ❌ |
| `/register` | Registro | ❌ |
| `/wallet-login` | Conexión wallet | ❌ |
| `/dashboard` | Dashboard principal | ✅ |
| `/ebas-credit` | Credit scoring | ✅ |
| `/ebas-dashboard` | EBAS dashboard | ✅ |
| `/travel-packages` | Paquetes de viaje | ✅ |

---

## Dependencias Instaladas 📦

```json
{
  "@stellar/stellar-sdk": "^14.0.0",
  "@stellar/freighter-api": "^2.x.x"
}
```

**Instaladas con**: `npm install --legacy-peer-deps`

---

## Troubleshooting 🔧

### Freighter no se detecta
- Solución: Recarga la página (F5)
- Verifica que Freighter esté instalada en Chrome
- Espera 2 segundos después de instalar Freighter

### Error: "Saldo insuficiente"
- Obtén XLM de prueba en: https://stellar.org/developers/testnet
- Espera a que aparezca en tu cuenta (2-5 minutos)

### Transacción fallida
- Verifica que la dirección del operador sea correcta
- Comprueba en Horizon: https://horizon-testnet.stellar.org/accounts/TU_ADDRESS
- Revisa los logs del navegador (F12)

### "Wallet no conectada"
- Inicia sesión en Freighter
- Autoriza el sitio
- Recarga la página

---

## Próximos Pasos 📋

1. **Cambiar dirección del operador** en `useFreighterWallet.ts`
2. **Ajustar precios en XLM** según cotización
3. **Crear dashboard de pagos** para ver histórico
4. **Integrar pagos reales** en Mainnet (cuando esté listo)
5. **Agregar notificaciones** de transacciones

---

## Arquitectura Técnica 🏗️

```
Next.js App
├── Middleware
│   └── Protege rutas por wallet
├── Layout
│   └── WalletProvider (Context global)
├── Componentes
│   ├── WalletLoginPage (Gate)
│   ├── TravelPackagesWithPayment (UI + Pagos)
│   └── TransactionHistory (Historial)
└── Hooks
    └── useFreighterWallet (Lógica Stellar)
        ├── Freighter API
        ├── Stellar SDK
        └── Horizon API
```

---

## Seguridad ⚠️

- ✅ Las transacciones son **firmadas por Freighter** (el usuario aprueba)
- ✅ No se almacenan claves privadas
- ✅ Todas en **Testnet** (sin dinero real)
- ✅ Dirección del operador controlada por código

---

**Última actualización**: 26 Nov 2025
