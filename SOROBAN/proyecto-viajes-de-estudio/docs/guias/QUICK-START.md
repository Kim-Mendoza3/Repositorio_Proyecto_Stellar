# 🚀 QUICK START - Freighter + Stellar Testnet

**⏱️ Tiempo requerido: 10 minutos**

---

## 1️⃣ INSTALAR FREIGHTER (2 min)

### En Chrome:
1. Ve a https://freighter.app
2. Click "Download for Chrome"
3. Agrega a Chrome
4. Fija en la barra de herramientas

**✅ Freighter instalada**

---

## 2️⃣ CREAR CUENTA TESTNET (3 min)

### En https://stellar.org/developers/testnet:

1. Ve a "Get Testnet Account"
2. Click "Generate Account"
3. Se generarán:
   - **Dirección Pública**: `GXXXXXX...` (puedes compartir)
   - **Secret Key**: `SXXXXXX...` (GUARDAR SEGURO)
4. Copiar **Secret Key**
5. En "Fund this account" ya tendrás XLM de prueba

**✅ Cuenta Testnet creada + XLM obtenido**

---

## 3️⃣ IMPORTAR EN FREIGHTER (1 min)

### En el navegador (Freighter):

1. Click en icono de Freighter
2. "Add Account" o "Import"
3. Pegar **Secret Key**
4. Guardar

**✅ Wallet importada en Freighter**

---

## 4️⃣ CONFIGURAR OPERADORA (2 min)

### Archivo: `frontend/src/hooks/useFreighterWallet.ts` (línea 18)

**CAMBIAR ESTO:**
```typescript
const TRIPS_OPERATOR_ADDRESS = 'GBUQWP3BOUZX34LOCALQVFSGHFTOJREM23NRHBK264KEXWFNVLB74OOO';
```

**A ESTO (tu dirección Testnet):**
```typescript
const TRIPS_OPERATOR_ADDRESS = 'GXXXXXX...'; // Tu dirección pública
```

**✅ Dirección configurada**

---

## 5️⃣ INICIAR APP (1 min)

### En terminal:

```bash
cd frontend
npm run dev
```

Abre: **http://localhost:3000**

**✅ App corriendo**

---

## 6️⃣ CONECTAR WALLET (1 min)

### En el navegador:

1. Verás banner de configuración (amarillo)
2. Click "Conectar Wallet con Freighter"
3. Autoriza en Freighter
4. ¡Wallet conectada! Verás tu saldo en XLM

**✅ Wallet conectada a la app**

---

## 7️⃣ COMPRAR UN VIAJE (2 min)

### Desde dashboard:

1. Accede a un paquete de viaje
2. Selecciona cualquiera (ej: "Paquete Básico" = 35 XLM)
3. Click "Pagar con Freighter"
4. Freighter abre diálogo
5. Click "Sign"
6. ✅ ¡Transacción enviada!

**Verás:**
- ✅ "Pago exitoso"
- Link a Stellar Expert con hash
- Transacción en blockchain

**✅ Compra completada**

---

## 8️⃣ VERIFICAR EN BLOCKCHAIN (1 min)

### Click en link de transacción O ve a:

```
https://stellar.expert/explorer/testnet
```

**Verás:**
- Remitente (tu dirección)
- Destinatario (operadora)
- 35 XLM
- ✅ Confirmada en Testnet

**✅ Transacción verificada en blockchain**

---

## ✅ LISTO

Has completado el flujo REAL:

```
Freighter → App → Pago XLM → Blockchain Testnet → Verificación
```

---

## 📚 PRÓXIMOS PASOS

- [ ] Probar con diferentes montos
- [ ] Cambiar precios en `TravelPackagesWithPayment.tsx`
- [ ] Crear múltiples cuentas Testnet
- [ ] Revisar `FREIGHTER-INTEGRATION-GUIDE.md`
- [ ] Entender configuración en `CONFIGURATION.js`

---

## 🆘 PROBLEMAS RÁPIDOS

| Problema | Solución |
|----------|----------|
| "Freighter no se detecta" | Recarga F5 / Reinicia navegador |
| "Saldo insuficiente" | Obtén más XLM en Testnet Faucet |
| "Error de transacción" | Verifica dirección en código |
| "Wallet no conecta" | Inicia sesión en Freighter |

---

## 🔗 LINKS ÚTILES

- **Testnet**: https://stellar.org/developers/testnet
- **Freighter**: https://freighter.app
- **Stellar Expert**: https://stellar.expert/explorer/testnet
- **Documentación**: `FREIGHTER-INTEGRATION-GUIDE.md`

---

**¡Ahora tienes la dApp funcionando con Freighter + Stellar Testnet! 🎉**
