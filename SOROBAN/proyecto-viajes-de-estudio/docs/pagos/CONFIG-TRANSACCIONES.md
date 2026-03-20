# 🔧 Configuración del Sistema de Transacciones

## Variables de Entorno

Crear archivo `.env.local` en `frontend/` con:

```env
# Blockchain
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_RPC=https://horizon-testnet.stellar.org

# Contratos (para Soroban en el futuro)
NEXT_PUBLIC_TRIPS_CONTRACT_ID=your_contract_id_here

# API
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Parámetros de Transacción

### En `frontend/src/hooks/useFreighterWallet.ts`:

```typescript
// Dirección que recibe los pagos (empresa)
const TRIPS_OPERATOR_ADDRESS = 'GBUQWP3BOUZX34LOCALQVFSGHFTOJREM23NRHBK264KEXWFNVLB74OOO';

// Red Stellar
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015'; // Testnet
// Cambiar a 'Public Global Stellar Network ; September 2015' para Mainnet

// Servidor Horizon (para leer saldos y enviar transacciones)
const TESTNET_SERVER = new StellarSDK.Horizon.Server(
  'https://horizon-testnet.stellar.org'
);
```

### En `frontend/src/hooks/useStellarTransaction.ts`:

```typescript
// URL del servidor Horizon
const TESTNET_URL = 'https://horizon-testnet.stellar.org';

// Fee en stroops (1 XLM = 10,000,000 stroops)
// BASE_FEE = 100 stroops por operación = 0.00001 XLM
const fee = StellarSDK.BASE_FEE; // Mínimo recomendado
```

### En `frontend/data/trips.json`:

```json
{
  "id": "1",
  "name": "Viaje a París",
  "destination": "París, Francia",
  "description": "Una experiencia única en la capital del arte",
  "duration": "5 días",
  "priceXLM": 50,          // ← Precio por persona en XLM
  "maxParticipants": 30,
  "currentBookings": 5,
  "companyWallet": "GBUQWP3BOUZX34LOCALQVFSGHFTOJREM23NRHBK264KEXWFNVLB74OOO",
  "highlights": [
    "Torre Eiffel",
    "Museo del Louvre",
    "Catedral de Notre-Dame"
  ]
}
```

## Cambios de Configuración Comunes

### 1. Cambiar dirección de la empresa

**Antes:**
```typescript
const TRIPS_OPERATOR_ADDRESS = 'GBUQWP3BOUZX34LOCALQVFSGHFTOJREM23NRHBK264KEXWFNVLB74OOO';
```

**Después (ejemplo con otra dirección):**
```typescript
const TRIPS_OPERATOR_ADDRESS = 'GCDZST3XVCDTUJ76ZAV2HA72KYYWJHYQNMKNQPHJV2HJMRKAWHZ4GY2L';
```

### 2. Cambiar precio del viaje

**Antes:**
```json
"priceXLM": 50
```

**Después (100 XLM por persona):**
```json
"priceXLM": 100
```

### 3. Usar Mainnet en lugar de Testnet

**⚠️ ADVERTENCIA: Esto usará dinero REAL**

**En `useFreighterWallet.ts`:**
```typescript
// ❌ NO LO HAGAS EN PRODUCCIÓN SIN VERIFICAR
const NETWORK_PASSPHRASE = 'Public Global Stellar Network ; September 2015';
const TESTNET_SERVER = new StellarSDK.Horizon.Server(
  'https://horizon.stellar.org'  // Sin "-testnet"
);
```

**En `useStellarTransaction.ts`:**
```typescript
const TESTNET_URL = 'https://horizon.stellar.org';  // Sin "-testnet"
```

### 4. Aumentar el fee por operación

**Antes:**
```typescript
const fee = StellarSDK.BASE_FEE;  // 100 stroops = 0.00001 XLM
```

**Después (2x más rápido):**
```typescript
const fee = StellarSDK.BASE_FEE * 2;  // 200 stroops = 0.00002 XLM
```

## Montos en XLM

Guía de conversión:

```
1 XLM = 10,000,000 stroops (unidad atómica)

Ejemplos de precios:
- 0.00001 XLM = 100 stroops (mínimo fee)
- 0.001 XLM = 10,000 stroops
- 0.01 XLM = 100,000 stroops
- 0.1 XLM = 1,000,000 stroops
- 1 XLM = 10,000,000 stroops
- 50 XLM = 500,000,000 stroops
- 100 XLM = 1,000,000,000 stroops
```

## Direcciones de Testnet

### Para solicitar fondos de prueba:

1. Ve a: https://developers.stellar.org/docs/reference/testnet-details
2. Haz clic en "Stellar Laboratory"
3. O usa directamente: https://laboratory.stellar.org

### Direcciones conocidas:

```
Operador (Empresa): GBUQWP3BOUZX34LOCALQVFSGHFTOJREM23NRHBK264KEXWFNVLB74OOO
Ejemplo Estudiante: GCDZST3XVCDTUJ76ZAV2HA72KYYWJHYQNMKNQPHJV2HJMRKAWHZ4GY2L
```

## Limpieza de Caché

Si haces cambios de configuración y no se reflejan:

### Limpiar caché Next.js:
```bash
rm -rf .next
npm run dev
```

### Limpiar LocalStorage (en consola del navegador):
```javascript
localStorage.clear()
location.reload()
```

### Limpiar todo:
```bash
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

## Variables de Depuración

Activar logs detallados en consola:

**En `useFreighterWallet.ts`:**
```typescript
// Línea 51: Ya tiene logs, no cambiar
console.log('✅ [HOOK] Freighter está disponible...');
```

**En `useStellarTransaction.ts`:**
```typescript
// Línea 65: Ya tiene logs
console.log('📝 Transacción construida:', {...});
```

**En el navegador (F12):**
```javascript
// Ver estado actual
console.log(localStorage.getItem('wallet_account'))
console.log(localStorage.getItem('wallet_public_key'))
```

## Checklist de Configuración

- [ ] Freighter instalada y en Testnet
- [ ] Dirección de operador configurada
- [ ] Precios de viajes definidos
- [ ] API en `/api/reservations` funcionando
- [ ] Variables de entorno en `.env.local`
- [ ] Fondos de prueba en cuenta de estudiante
- [ ] Fondos de prueba en cuenta de operador (opcional)
- [ ] Red correcta en Freighter (Testnet)
- [ ] Navegador actualizado

## Troubleshooting

### "Error: Saldo insuficiente"
- Verificar que la cuenta tiene XLM en Testnet
- Solicitar más fondos en el faucet de Stellar

### "Error: Transacción no válida"
- Verificar que el `NETWORK_PASSPHRASE` es correcto
- Verificar que el fee es suficiente

### "Error: Dirección no válida"
- Verificar que la dirección empieza con 'G'
- Verificar que tiene 56 caracteres

### "Error: Freighter no conectada"
- Abrir Freighter
- Clickear "Connect this site"
- Cambiar a Testnet si estaba en otra red
- Recargar la página

---

**Última actualización:** 1 de diciembre de 2025
