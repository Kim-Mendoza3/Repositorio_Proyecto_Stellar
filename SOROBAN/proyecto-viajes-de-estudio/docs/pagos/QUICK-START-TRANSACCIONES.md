# ⚡ INICIO RÁPIDO - Sistema de Transacciones Stellar

## 🎯 Objetivo

Permitir que estudiantes paguen en XLM (Stellar Lumens) para reservar viajes de estudio.

## ✅ Status Actual

- ✅ Sistema de transacciones implementado
- ✅ Integración con Freighter Wallet
- ✅ Conexión a Stellar Testnet
- ✅ API de reservaciones
- ✅ Todo sin errores de TypeScript

## 🚀 Empezar en 3 minutos

### Paso 1: Preparar Freighter (2 minutos)

```
1. Instalar extensión: https://freighter.app
2. Crear o importar wallet
3. Ir a Settings → Cambiar a "Testnet"
4. Ir a https://developers.stellar.org/docs/reference/testnet-details
5. Solicitar fondos de prueba (50 XLM)
6. Esperar 1-2 minutos
```

### Paso 2: Iniciar servidor (1 minuto)

```bash
cd frontend
npm install  # Si es primera vez
npm run dev
```

Abrir: http://localhost:3000

### Paso 3: Hacer primera transacción (1 minuto)

```
1. Click en "Ver Viajes Disponibles"
2. Verificar: "✅ Freighter conectada y lista"
3. Click en un viaje → "Ver más"
4. Click en "Reservar Ahora"
5. Firmar en Freighter (se abre popup)
6. Esperar a que aparezca el hash
7. ✅ ¡Listo! Transacción completada
```

## 📊 Monitorear Transacción

**Opción 1: En la app**
- El hash aparece en verde cuando se completa
- Click en "Ver Viajes" para volver

**Opción 2: En Stellar Expert**
```
1. Copiar el hash de transacción
2. Ir a: https://stellar.expert/explorer/testnet/tx/[HASH]
3. Ver todos los detalles
```

**Opción 3: En consola del navegador (F12)**
```javascript
// Ver logs
console.log("Transacciones:")

// Ver saldo guardado
JSON.parse(localStorage.getItem('wallet_account'))

// Limpiar todo
localStorage.clear()
```

## 🔧 Cambios Comunes

### Cambiar precio del viaje
Archivo: `frontend/data/trips.json`
```json
"priceXLM": 50  → cambiar a: 100
```

### Cambiar dirección que recibe pagos
Archivo: `frontend/src/hooks/useFreighterWallet.ts`
```typescript
const TRIPS_OPERATOR_ADDRESS = 'NUEVA_DIRECCION_AQUI';
```

### Ver logs detallados
En navegador (F12):
```javascript
// Buscar en consola:
// 🔍 [useStellarTransaction] Obteniendo wallet...
// 📝 Transacción construida:
// 🔐 Solicitando firma a Freighter...
// ✅ Transacción firmada
// 📤 Enviando transacción...
// ✅ Transacción enviada: [HASH]
```

## ❌ Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "Freighter no está conectada" | No permitiste acceso | Abrir Freighter → "Connect this site" |
| "Saldo insuficiente" | Fondos de prueba insuficientes | Solicitar más XLM en faucet |
| "Error firmando" | Freighter en red equivocada | Cambiar a Testnet en Settings |
| "Transacción no válida" | Problema técnico | Recargar página (F5) e intentar de nuevo |

## 📱 Flujo Completo

```
👤 Estudiante abre app
    ↓
👁️ Ve lista de viajes disponibles
    ↓
💬 Lee detalles del viaje
    ↓
🔐 Freighter valida conexión
    ↓
💳 Click en "Reservar Ahora"
    ↓
🔐 Firma popup de Freighter
    ↓
⏳ Enviando a blockchain (2-3 seg)
    ↓
✅ Transacción confirmada
    ↓
📝 Reserva registrada en base de datos
    ↓
🎉 ¡Reserva completada!
```

## 💰 Costo de Transacción

- **Fee de red:** 0.00001 XLM (automático)
- **Fee de Soroban:** 0 XLM (no usamos contrato aún)
- **Costo total:** Precio del viaje + 0.00001 XLM

Ejemplo:
```
Viaje: 50 XLM
Fee: 0.00001 XLM
Total: 50.00001 XLM
```

## 🔐 Seguridad

**Lo que protege Freighter:**
- ✅ Nunca envía tu llave privada
- ✅ Solo firma transacciones que ves
- ✅ Solo envía dinero cuando firmas
- ✅ Todo en el navegador, sin servidor

**Lo que protege Stellar:**
- ✅ Inmutabilidad de transacciones
- ✅ Validación de red
- ✅ 6+ confirmaciones

## 🎓 Qué Aprendes

1. **Wallets Web3** - Cómo usar Freighter
2. **Blockchain** - Transacciones en Stellar
3. **Criptografía** - Firmas digitales
4. **UX Web3** - Popups y confirmaciones

## 📚 Recursos

- **Documentación:** `GUIA-FLUJO-TRANSACCIONES.md`
- **Configuración:** `CONFIG-TRANSACCIONES.md`
- **Testing:** `test-transactions.sh` o `test-transactions.ps1`

## 🆘 Ayuda

### Si nada funciona:
```bash
# 1. Detener servidor
Ctrl+C

# 2. Limpiar caché
rm -rf .next

# 3. Reiniciar
npm run dev

# 4. Abrir consola (F12)
# 5. Ver errores en rojo
# 6. Copiar error en Freighter/Stellar docs
```

### Contacto
- Documentación: https://developers.stellar.org
- Soporte Freighter: https://freighter.app
- Forum Stellar: https://stellar.stackexchange.com

## ✨ Siguientes Pasos (Opcional)

- [ ] Implementar historial de transacciones
- [ ] Agregar notificaciones por email
- [ ] Integrar Soroban para lógica avanzada
- [ ] Agregar refunds automáticos
- [ ] Ir a Mainnet cuando esté listo

---

**¡Listo para empezar! 🚀**

Preguntas frecuentes → Ver `GUIA-FLUJO-TRANSACCIONES.md`
