# 🚀 Guía Completa: Flujo de Transacciones Stellar

## 📋 Resumen del Flujo

El sistema implementa un flujo completo de pagos usando la blockchain de Stellar Testnet:

```
Estudiante selecciona viaje
    ↓
Click en "Reservar Ahora"
    ↓
🔐 PASO 1: Obtener wallet de Freighter
    ↓
💳 PASO 2: Crear transacción Stellar
    ↓
✍️ PASO 3: Firmar con Freighter (popup)
    ↓
📤 PASO 4: Enviar a blockchain Testnet
    ↓
✅ PASO 5: Registrar reserva en base de datos
    ↓
🎉 Reserva completada con hash de transacción
```

## 🔧 Componentes Involucrados

### 1. **Frontend (Next.js)**
- **`pages/trip-detail/page.tsx`** - Interfaz de reserva
- **`hooks/useStellarTransaction.ts`** - Lógica de transacciones
- **`hooks/useFreighterWallet.ts`** - Integración con Freighter
- **`components/FreighterStatus.tsx`** - Estado de conexión

### 2. **Wallet (Freighter)**
- Extensión del navegador
- Firma transacciones XDR
- Gestiona llaves privadas de forma segura

### 3. **Blockchain (Stellar Testnet)**
- Red de pruebas
- URL: `https://horizon-testnet.stellar.org`
- Moneda: Lumens (XLM)

### 4. **Backend API (Next.js)**
- POST `/api/reservations` - Guarda reservas

## 💰 Flujo de Dinero

```
Cuenta del Estudiante (Freighter)
    └─ XLM (cantidad del viaje)
         └─ Transacción Stellar
              └─ Testnet Blockchain
                   └─ Cuenta de la Empresa
```

## 🎯 Requisitos Previos

### Para el Alumno:
1. ✅ **Freighter Wallet instalada**
   - Descargar en https://freighter.app
   
2. ✅ **Wallet creada con fondos Testnet**
   - Crear cuenta en Freighter
   - Cambiar a Testnet en configuración
   - Solicitar fondos en https://developers.stellar.org/docs/reference/testnet-details
   
3. ✅ **Testnet habilitado en Freighter**
   - Abrir Freighter
   - Ir a Settings
   - Activar "Testnet"

### Para la Empresa:
1. ✅ **Dirección pública en Testnet**
   - Actualmente: `GBUQWP3BOUZX34LOCALQVFSGHFTOJREM23NRHBK264KEXWFNVLB74OOO`
   - Puede cambiarse en `frontend/src/hooks/useFreighterWallet.ts`

## 🚀 Pasos para Probar

### 1. Iniciar el servidor de desarrollo

```bash
cd frontend
npm install
npm run dev
```

El servidor estará en `http://localhost:3000`

### 2. Conectar Freighter

- Ir a `http://localhost:3000/available-trips`
- Verificar que muestre: "✅ Freighter conectada y lista"
- Si no aparece:
  - Asegúrate de tener Freighter instalada
  - Haz clic en el icono de Freighter arriba a la derecha
  - Clickea "Connect this site"
  - Recarga la página

### 3. Seleccionar un viaje y hacer reserva

- Click en "Ver más" en un viaje
- Click en "Reservar Ahora"
- Se abrirá un popup de Freighter pidiendo firmar
- Firma la transacción
- Espera a que se envíe a la blockchain
- Verás el hash de la transacción cuando se complete

### 4. Verificar en Stellar Expert

- Copia el hash de transacción
- Ve a: `https://stellar.expert/explorer/testnet/tx/{HASH}`
- Verás todos los detalles de la transacción

## 📊 Ejemplo de Transacción Exitosa

```json
{
  "success": true,
  "hash": "abc123def456...",
  "amount": 50,
  "from": "GBUQWP3BOUZX34LOCALQVFSGHFTOJREM23NRHBK264KEXWFNVLB74OOO",
  "to": "GCDZST3XVCDTUJ76ZAV2HA72KYYWJHYQNMKNQPHJV2HJMRKAWHZ4GY2L",
  "memo": "Reserva: Viaje a París"
}
```

## 🔐 Seguridad

### ✅ Lo que está protegido:

1. **Llaves privadas** - Solo en Freighter, nunca se envían
2. **Firmas** - Solo en el navegador del usuario
3. **Transacciones** - Inmutables en la blockchain
4. **Red** - Usa HTTPS en producción

### ⚠️ Consideraciones:

- Freighter SOLO firma, no envía dinero
- El usuario ve exactamente qué está firmando
- Las transacciones son permanentes en Testnet
- Usa XLM de prueba (sin valor real)

## 🛠️ Configuración

### Cambiar dirección de empresa:

**Archivo:** `frontend/src/hooks/useFreighterWallet.ts`

```typescript
const TRIPS_OPERATOR_ADDRESS = 'NUEVA_DIRECCION_AQUI';
```

### Cambiar cantidad de XLM por viaje:

**Archivo:** `frontend/data/trips.json`

```json
{
  "id": "1",
  "name": "Viaje a París",
  "priceXLM": 100  // Cambiar aquí
}
```

### Cambiar red (no recomendado):

**Archivo:** `frontend/src/hooks/useStellarTransaction.ts`

```typescript
const TESTNET_URL = 'https://horizon-testnet.stellar.org'; // Testnet
// O cambiar a:
const TESTNET_URL = 'https://horizon.stellar.org'; // Mainnet (¡CUIDADO!)
```

## 📱 Errores Comunes

### ❌ "Freighter no está instalada"
- **Solución:** Instalar extensión desde https://freighter.app

### ❌ "Freighter no conectada"
- **Solución:** 
  1. Abrir Freighter
  2. Clickear "Connect this site"
  3. Recargar página

### ❌ "Saldo insuficiente"
- **Solución:** Solicitar fondos de prueba en https://developers.stellar.org/docs/reference/testnet-details

### ❌ "Error firmando transacción"
- **Solución:**
  1. Verificar que estés en Testnet
  2. Verificar que la wallet esté desbloqueada
  3. Intentar de nuevo

### ❌ "Error registrando reserva"
- **Solución:**
  1. El pago se procesó pero la API falló
  2. Consultar logs del servidor
  3. Verificar que `/api/reservations` esté funcionando

## 📈 Monitoreo

### Logs en consola del navegador (F12):

```
🔍 [useStellarTransaction] Obteniendo wallet de Freighter...
✅ [useStellarTransaction] Wallet obtenida: GBUQWP...
📝 Transacción construida: {...}
🔐 Solicitando firma a Freighter...
✅ Transacción firmada
📤 Enviando transacción...
✅ Transacción enviada: abc123def456...
```

### Logs en servidor:

```
POST /api/reservations 200 OK
{
  "reservationId": "res_123",
  "studentWallet": "GCDZST...",
  "companyWallet": "GBUQWP...",
  "txHash": "abc123...",
  "amount": 50,
  "createdAt": "2025-12-01T10:30:00Z"
}
```

## 🎓 Resumen Educativo

Este flujo enseña:

1. **Integración de wallets** - Cómo usar Freighter en una app web
2. **Transacciones Stellar** - Cómo construir y firmar en XDR
3. **Blockchain en producción** - Usar redes reales (aunque sea Testnet)
4. **UX/DX de Web3** - Popups de firma, estados de transacción
5. **Seguridad** - Nunca tocar llaves privadas

## 🚀 Próximos Pasos

- [ ] Implementar confirmación en blockchain (6+ confirmaciones)
- [ ] Agregar historial de transacciones
- [ ] Implementar refunds automáticos
- [ ] Integrar con Soroban para lógica de contrato
- [ ] Agregar notificaciones por email
- [ ] Mostrar saldo en tiempo real

---

**Última actualización:** 1 de diciembre de 2025
**Estado:** ✅ Funcional en Testnet
