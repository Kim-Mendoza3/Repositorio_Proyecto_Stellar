# 🔗 REFERENCIAS Y URLS - Sistema de Pagos

## 📍 URLs del Sistema

### Frontend Local
```
http://localhost:3000/available-trips          Viajes disponibles
http://localhost:3000/trip-detail?id={ID}     Detalles y pago
http://localhost:3000/company-dashboard       Crear viajes
http://localhost:3000/dashboard               Panel principal
```

### API Backend
```
GET  http://localhost:3000/api/trips                              Obtener viajes
POST http://localhost:3000/api/trips                              Crear viaje
GET  http://localhost:3000/api/reservations?clientWallet={ID}    Obtener reservas
POST http://localhost:3000/api/reservations                       Crear reserva
GET  http://localhost:3000/api/users                              Obtener usuarios
POST http://localhost:3000/api/users                              Crear usuario
```

### Blockchain Explorer
```
https://stellar.expert/explorer/testnet                           Principal
https://stellar.expert/explorer/testnet/tx/{HASH}                Transacción
https://stellar.expert/explorer/testnet/account/{WALLET}         Cuenta
```

### Oficial Stellar
```
https://stellar.org                                               Web oficial
https://developers.stellar.org/docs                               Documentación
https://developers.stellar.org/docs/tools/testnet-helper          Friendbot (XLM)
https://freighter.app                                             Descargar Freighter
```

---

## 📄 Documentación del Proyecto

### Rápido (5-10 minutos)
- **[QUICK-START-PAYMENTS.md](./QUICK-START-PAYMENTS.md)** 
  - Paso a paso en 5 minutos
  - Empresario crea viaje
  - Alumno reserva
  - Verificar

### Visual (10 minutos)
- **[VISUAL-GUIDE-PAYMENTS.md](./VISUAL-GUIDE-PAYMENTS.md)**
  - Diagramas ASCII
  - Estados de UI
  - Flujos visuales
  - Interfaces

### Técnico (30 minutos)
- **[PAYMENT-FLOW.md](./PAYMENT-FLOW.md)**
  - Arquitectura detallada
  - Componentes
  - Seguridad
  - Errores
  - Testing

### Resumen (15 minutos)
- **[PAYMENT-IMPLEMENTATION-SUMMARY.md](./PAYMENT-IMPLEMENTATION-SUMMARY.md)**
  - Qué se implementó
  - Cómo usar
  - Ejemplos reales
  - Próximas mejoras

### Cambios (5 minutos)
- **[CHANGELOG-PAYMENTS.md](./CHANGELOG-PAYMENTS.md)**
  - Archivos nuevos
  - Archivos modificados
  - Estadísticas
  - Validaciones

---

## 💻 Archivos de Código

### Página de Detalles
```
frontend/src/app/trip-detail/page.tsx
├─ 262 líneas
├─ Estados: idle, signing, submitting, registering, success, error
├─ Funciones: handleReserveTrip()
└─ Hooks: useTripOffers, useStellarTransaction, useWallet
```

### Hook de Transacciones
```
frontend/src/hooks/useStellarTransaction.ts
├─ getFreighterWallet()          Obtiene wallet pública
├─ sendPayment()                 Envía pago XLM
├─ isProcessing                  Estado de carga
└─ error                         Manejo de errores
```

### Hook de Viajes
```
frontend/src/hooks/useTripOffers.ts
├─ getTripById()         Obtiene viaje por ID ⭐
├─ loadAllTrips()        Carga todos los viajes
├─ createReservation()   Crea reserva
└─ loadClientReservations() Obtiene reservas del cliente
```

### Contexto de Wallet
```
frontend/src/contexts/WalletContext.tsx
├─ useWallet()           Hook para usar wallet
├─ account               Información de cuenta
└─ disconnectWallet()    Desconectar
```

### API Reservas
```
frontend/src/app/api/reservations/route.ts
├─ GET  /api/reservations?clientWallet={ID}
├─ POST /api/reservations
└─ PATCH /api/reservations  (actualizar pago)
```

### API Viajes
```
frontend/src/app/api/trips/route.ts
├─ GET  /api/trips
├─ POST /api/trips
└─ DELETE /api/trips
```

---

## 🧪 Testing y Validación

### Script de Testing
```
bash test-payment-flow.sh

Realiza:
  1. Verifica API conectada
  2. Crea viaje de prueba
  3. Crea usuario alumno
  4. Proporciona instrucciones Freighter
  5. Verifica reserva guardada
```

### URLs para Testing
```
Crear viaje:     http://localhost:3000/company-dashboard
Ver viajes:      http://localhost:3000/available-trips
Reservar:        http://localhost:3000/trip-detail?id=test-trip-1
Verificar:       https://stellar.expert/explorer/testnet
```

### Wallets de Prueba (Testnet)

**Empresa:**
```
Public Key: GABOTHMIIA476W2RN3CX3RLYNIX7SEKNPVBWGOBOMTKPV47SDCE4YFVM
Balance: 10,000 XLM (inicial)
Tipo: Operadora de viajes
```

**Alumno:**
```
Public Key: GCZST5DUJVSEZFSK226XZNMLXMGTMFCZLJ2VVOQW3X5IF75WDQX3QWQS
Balance: 10,000 XLM (vía Friendbot)
Tipo: Cliente/Alumno
```

---

## 🔧 Configuración Requerida

### Backend
```bash
cd frontend
npm install
npm run dev
# Corre en http://localhost:3000
```

### Freighter
```
1. Descargar: https://freighter.app
2. Instalar como extensión
3. Crear cuenta o importar
4. Habilitar Testnet
5. Conectar wallet
```

### Testnet XLM
```
Si balance bajo:
  https://developers.stellar.org/docs/tools/testnet-helper
  
O usar curl:
  curl -X POST "https://friendbot.stellar.org/?addr={PUBLIC_KEY}"
```

---

## 📊 Arquitectura del Sistema

```
┌─────────────────────────────────────────┐
│          FRONTEND (React Next.js)       │
├─────────────────────────────────────────┤
│                                         │
│  Página Viajes         Página Detalles  │
│  /available-trips  →   /trip-detail     │
│                        • Hook transacciones
│                        • Estados UI
│                        • Integración API
│
└─────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│     FREIGHTER WALLET (Extension)        │
│     • Obtiene public key                │
│     • Firma transacciones               │
│     • Interfaz segura                   │
└─────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│    STELLAR BLOCKCHAIN (Testnet)         │
│    • Construye transacción              │
│    • Valida firma                       │
│    • Confirma pago                      │
│    • Retorna hash                       │
└─────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│         API BACKEND (Node.js)           │
│    POST /api/reservations               │
│    • Recibe datos de transacción        │
│    • Guarda en data/reservations.json   │
│    • Retorna confirmación               │
└─────────────────────────────────────────┘
```

---

## 🎯 Flujo de Datos

### Crear Viaje (Empresario)
```
company-dashboard/page.tsx
  ↓
form.submit()
  ↓
fetch('/api/trips', {
  method: 'POST',
  body: { nombre, destino, precio, ... }
})
  ↓
/api/trips/route.ts
  ↓
Guardar en data/trips.json
  ↓
Retornar { success: true, trip: {...} }
```

### Reservar Viaje (Alumno)
```
trip-detail/page.tsx
  ↓
Click "Reservar Ahora"
  ↓
useStellarTransaction.sendPayment()
  ↓
Freighter.getPublicKey()
  ↓
Freighter.signTransaction()
  ↓
🔐 USUARIO FIRMA EN POPUP
  ↓
Horizon.submitTransaction()
  ↓
Stellar valida y confirma
  ↓
Retorna { hash: "tx_xxx" }
  ↓
fetch('/api/reservations', {
  method: 'POST',
  body: { tripId, clientWallet, amount, txHash }
})
  ↓
Guardar en data/reservations.json
  ↓
UI muestra éxito ✅
```

---

## 🔐 Seguridad

### Validaciones Frontend
```
✓ Freighter disponible
✓ Wallet conectada
✓ Trip existe
✓ Espacios disponibles
✓ Balance suficiente (Freighter valida)
```

### Validaciones Backend
```
✓ Trip existe
✓ No es duplicado
✓ Datos válidos
✓ Hash de transacción presente
```

### Validaciones Blockchain
```
✓ Firma Ed25519 válida
✓ Destinatario existe
✓ Balance del origen suficiente
✓ Transacción estructuralmente correcta
```

---

## 📞 Soporte y Troubleshooting

### Error: "Freighter no detectada"
```
Solución: Instalar desde https://freighter.app
1. Ir a sitio
2. Descargar para tu navegador
3. Instalar como extensión
4. Reiniciar navegador
```

### Error: "Insufficient balance"
```
Solución: Obtener XLM vía Friendbot
1. Ir a https://developers.stellar.org/docs/tools/testnet-helper
2. Ingresar tu public key
3. Recibir 10,000 XLM
4. Esperar 30 segundos
5. Reintentar transacción
```

### Error: "Transaction rejected by user"
```
Causa: Usuario clickeó "Reject" en Freighter popup
Solución: Intentar nuevamente
1. Hacer clic en "Intentar de nuevo"
2. Revisar detalles en Freighter
3. Clickear "Approve" esta vez
```

### Error: "Failed to save reservation"
```
Causa: Transacción se hizo pero API falló
Solución: Contactar administrador
Nota: El pago EN EL BLOCKCHAIN ya se realizó
      No se recarga balance
      Pero la reserva no aparece en sistema
```

---

## 📚 Referencias Externas

### Oficial Stellar
- [Stellar.org](https://stellar.org) - Web oficial
- [Developers](https://developers.stellar.org/docs) - Documentación
- [SDK JS](https://github.com/stellar/js-stellar-sdk) - GitHub
- [Freighter API](https://freighter.app/docs) - Documentación

### Herramientas
- [Stellar Expert](https://stellar.expert/explorer/testnet) - Explorer
- [Friendbot](https://developers.stellar.org/docs/tools/testnet-helper) - Obtener XLM
- [Testnet](https://developers.stellar.org/docs/networks/testnet) - Información

### Comunidad
- [Stellar Dev Discord](https://discord.gg/stellar) - Chat de desarrolladores
- [Forum](https://stellar.org/developers/community) - Foro oficial
- [Stack Overflow](https://stackoverflow.com/questions/tagged/stellar) - Q&A

---

## 📈 Métricas y Performance

### Tiempos Típicos
```
Firma en Freighter:    5-10 segundos (usuario)
Envío a blockchain:    2-5 segundos
Confirmación:          1-3 segundos
Guardado en API:       < 500ms
Total:                 10-20 segundos

Nota: Puede variar según congestión de red
```

### Recursos Utilizados
```
Frontend:     ~2 MB (con dependencias)
Backend:      ~50 MB (node_modules)
Datos:        ~100 KB (trips + reservas)

Requerimientos:
- Node.js 16+
- RAM: 512 MB mínimo
- Conexión a internet (Testnet)
```

---

## 🎓 Conceptos Clave

### Stellar Testnet
- Red de prueba separada de Mainnet
- XLM sin valor real
- Perfecta para desarrollo y testing
- 5 segundos de confirmación

### Freighter Wallet
- Extensión de navegador
- Almacena claves privadas de forma segura
- Interfaz para firmar transacciones
- No comparte claves privadas con aplicaciones

### Transacción XLM
- Operación de pago de Stellar
- Requiere firma criptográfica (Ed25519)
- Inmutable en blockchain
- Públicamente verificable

### Hash de Transacción
- Identificador único SHA256
- Generado por Stellar
- Permite rastrear transacción
- Verificable en blockchain público

---

**Última actualización:** Enero 2025
**Status:** ✅ Producción lista (Testnet)
**Versión:** 1.0
