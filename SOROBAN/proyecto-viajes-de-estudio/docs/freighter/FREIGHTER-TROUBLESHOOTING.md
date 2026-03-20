# 🔧 Troubleshooting - Freighter Wallet Integration

## Problema: "Error: No se pudo obtener la wallet de Freighter"

Este error ocurre cuando el navegador no puede acceder a Freighter. Aquí están los pasos para diagnosticar y arreglar:

---

## 📋 Checklist de Verificación

### 1. **Freighter Instalado**
```
✅ Verifica que Freighter esté instalado como extensión del navegador
   - Chrome/Edge: Ve a chrome://extensions/
   - Firefox: Ve a about:addons
   - Deberías ver "Freighter" en la lista
```

### 2. **Freighter Habilitado**
```
✅ En las extensiones, asegúrate que Freighter esté "habilitada"
   - Debe tener un toggle azul activado
   - No debe tener advertencia de "deshabilitada"
```

### 3. **Freighter Configurado para Testnet**
```
✅ Abre Freighter y:
   - Haz clic en el icono (arriba a la derecha)
   - Busca "Settings" o "Configuración"
   - Asegúrate que dice "Test SDF Network" o "Testnet"
   - NO debe estar en "Public Network"
```

### 4. **Wallet Conectada al Sitio**
```
✅ En Freighter:
   - Haz clic en el icono
   - Si dice "Not connected" o "No conectada"
   - Haz clic en "Connect this site" o "Conectar este sitio"
   - Acepta el permiso
```

### 5. **Testnet XLM Balance**
```
✅ Verifica que tu wallet tenga XLM en Testnet:
   - Abre Freighter
   - Deberías ver un saldo de XLM (ej: 100.0000000 XLM)
   - Si dice "0 XLM" o no ve saldo, necesitas fondos de prueba:
     → Ve a https://friendbot.stellar.org/
     → Pega tu dirección pública de Freighter
     → Recibe 10,000 XLM de prueba
```

---

## 🔍 Cómo Obtener Fondos de Testnet

### Paso 1: Obtener tu Dirección Pública
```
1. Abre Freighter
2. Haz clic en tu dirección (arriba, debajo del nombre)
3. Se copian los primeros caracteres de tu dirección
4. Tu dirección empieza con "G" y tiene 56 caracteres
```

### Paso 2: Ir a Friendbot (Faucet de Stellar Testnet)
```
1. Ve a https://friendbot.stellar.org/
2. En el campo de entrada, pega tu dirección pública completa
3. Haz clic en "Get starting balance"
4. Espera a que aparezca el mensaje de éxito
```

### Paso 3: Verificar los Fondos
```
1. Regresa a Freighter
2. Deberías ver "100.0000000 XLM" o similar
3. Si no aparece de inmediato, espera 30 segundos y actualiza
```

---

## 🐛 Debugging en la Consola

### Abre las Developer Tools
```
Windows/Linux: F12 o Ctrl+Shift+I
Mac: Cmd+Option+I
```

### Busca estos mensajes en la pestaña "Console":

```
✅ BIEN:
   - "🔍 [FreighterStatus] FreighterAPI disponible: true"
   - "✅ [FreighterStatus] Freighter disponible y conectado: G..."
   - "✅ [useStellarTransaction] Wallet obtenida: G..."

❌ PROBLEMA:
   - "🔍 [FreighterStatus] FreighterAPI disponible: false" 
     → Freighter no está instalado o no cargó
   
   - "Error obteniendo wallet: user denied access"
     → El usuario no autorizó el acceso al sitio
   
   - "Error obteniendo wallet: popup window required"
     → Freighter requiere que permitas popups en el navegador
```

---

## 🔧 Soluciones Comunes

### Problema 1: "FreighterAPI disponible: false"

**Causa:** Freighter no está instalado o no cargó

**Solución:**
```
1. Instala Freighter:
   → https://freighter.app (selecciona tu navegador)
2. Recarga la página (F5)
3. Si sigue sin funcionar, reinicia el navegador completamente
```

---

### Problema 2: "user denied access"

**Causa:** No autorizaste a este sitio para usar Freighter

**Solución:**
```
1. En Freighter, haz clic en el icono
2. Mira si aparece "Not connected" o "No conectada"
3. Haz clic en "Connect this site" 
4. Acepta el permiso
5. Recarga la página (F5)
```

---

### Problema 3: "0 XLM" en la wallet

**Causa:** No tienes fondos de prueba

**Solución:**
```
1. Ve a https://friendbot.stellar.org/
2. Pega tu dirección pública de Freighter
3. Espera a recibir 100 XLM de prueba
4. Vuelve a recargar la página
```

---

### Problema 4: "popup window required"

**Causa:** Tu navegador está bloqueando popups de Freighter

**Solución:**
```
1. En la barra de dirección, haz clic en el icono de "bloquear popups"
2. Selecciona "Permitir popups para este sitio"
3. Recarga la página
```

---

## 📊 Flujo de Transacciones Esperado

```
1. Usuario hace clic en "Reservar Ahora"
   ↓
2. Sistema obtiene wallet de Freighter
   ↓
3. Se abre ventana emergente de Freighter pidiendo firma
   ↓
4. Usuario revisa y aprueba la transacción
   ↓
5. Freighter firma la transacción y la envía a Stellar Testnet
   ↓
6. Se muestra hash de la transacción y enlace al explorador
   ↓
7. Reserva se registra en la base de datos
   ↓
8. Mensaje de éxito: "¡Reserva completada!"
```

---

## 🌐 Enlaces Útiles

- **Freighter Oficial:** https://freighter.app
- **Stellar Testnet Friendbot:** https://friendbot.stellar.org/
- **Stellar Testnet Explorer:** https://stellar.expert/explorer/testnet
- **Documentación Freighter:** https://github.com/stellar/freighter

---

## 💡 Consejos

### Para Developers

```
// En la consola del navegador, ejecuta:

// Ver si Freighter está disponible
console.log(window.freighter !== undefined)

// Ver la dirección conectada
// (solo si está conectado y autorizado)
```

### Para Testing

```
1. Abre el Developer Tools (F12)
2. Ve a la pestaña "Console"
3. Observa los logs con 🔍, ✅, ❌ para entender qué está pasando
4. Si hay error, copia el mensaje completo para reportarlo
```

---

## 📞 Reportar Problemas

Si después de seguir estos pasos aún no funciona, reporta:

1. **Sistema Operativo:** Windows/Mac/Linux
2. **Navegador:** Chrome/Firefox/Edge/Brave
3. **Versión de Freighter:** (en Extensiones)
4. **Mensaje de Error Exacto:** (de la consola)
5. **Pasos Reproducidos:** (qué hiciste antes del error)

---

**Última actualización:** 1 de diciembre de 2025
**Status:** ✅ Freighter Integration Ready
