# 🔧 TROUBLESHOOTING - Problemas Comunes

## ❌ Error: "Viaje no encontrado"

### Síntomas
```
❌ Viaje no encontrado: trip_1764371203289
```

### Causas
- El ID del viaje no existe en la lista
- El viaje se eliminó
- URL incompleta o incorrecta
- Los viajes no se han cargado aún

### Soluciones

**1. Verificar que los viajes se crearon**
```
1. Ve a /company-dashboard
2. Crea un nuevo viaje
3. Guarda
4. Verifica que aparece en /available-trips
```

**2. Copiar ID correcto de la URL**
```
Cuando haces clic en "Ver Detalles":
http://localhost:3000/trip-detail?id=ESTE_ES_EL_ID_CORRECTO

Verifica que el ID existe en:
GET http://localhost:3000/api/trips
```

**3. Esperar a que carguen los viajes**
```
El componente espera 500ms a que se carguen
Si sigue fallando, los viajes no se guardaron correctamente
```

**4. Revisar data/trips.json**
```bash
cat frontend/data/trips.json

Debe contener:
{
  "success": true,
  "trips": [
    {
      "id": "trip_xxx",
      "name": "Viaje a Madrid",
      ...
    }
  ]
}
```

---

## ❌ Error: "Freighter no disponible"

### Síntomas
```
❌ Freighter no disponible
No se pudo obtener la wallet de Freighter
```

### Causas
- Freighter no está instalada
- Freighter no está conectada
- No está en el navegador correcto
- La extensión está deshabilitada

### Soluciones

**1. Instalar Freighter (si no la tienes)**
```
1. Ve a https://freighter.app
2. Elige tu navegador (Chrome, Firefox, Edge, etc)
3. Instala la extensión
4. Reinicia el navegador
5. Recarga http://localhost:3000
```

**2. Conectar Freighter**
```
1. Abre la extensión Freighter (esquina superior derecha)
2. Si no ves tu wallet, clickea "Import Key"
3. Pega tu secret key (S...)
4. Dale un nombre
5. Clickea Connect
```

**3. Verificar que está habilitada**
```
Chrome/Edge/Firefox:
1. Ve a extensiones (chrome://extensions)
2. Busca Freighter
3. Verifica que el toggle está ON
4. Recarga la página
```

**4. Cambiar a Testnet (si usas Mainnet)**
```
En Freighter:
1. Clickea el nombre de tu wallet
2. Selecciona "Testnet"
3. Recarga http://localhost:3000
```

---

## ❌ Error: "Insufficient balance"

### Síntomas
```
Insufficient balance para realizar la transacción
Transacción rechazada por Stellar
```

### Causas
- No tienes suficientes XLM
- Usaste todos los XLM en otras transacciones
- Balance muy bajo para pagar fee

### Soluciones

**1. Obtener XLM vía Friendbot (Testnet)**
```
1. Copia tu public key (empieza con G...)
2. Ve a https://developers.stellar.org/docs/tools/testnet-helper
3. Pega tu public key
4. Clickea "Get test XLM"
5. Deberías recibir 10,000 XLM
6. Espera 30 segundos
7. Recarga el navegador
```

**O usar curl:**
```bash
curl -X POST \
  "https://friendbot.stellar.org/?addr=YOUR_PUBLIC_KEY"
```

**2. Verificar balance**
```
En Freighter:
- Debería mostrar tu balance en XLM

O en https://stellar.expert/explorer/testnet:
- Busca tu public key
- Verifica el balance

O con API:
curl "http://localhost:3000/api/users?wallet=YOUR_PUBLIC_KEY"
```

**3. Esperar a que actualice**
```
Freighter tarda ~30 segundos en actualizar balance
Si sigue muy bajo, vuelve a pedir XLM
```

---

## ❌ Error: "Transaction rejected by user"

### Síntomas
```
El usuario clickeó "Reject" en el popup de Freighter
Transacción fue cancelada
```

### Causas
- Usuario no quiso confirmar
- Se asustó por la cantidad
- Quiso revisar primero
- Cerró accidentalmente el popup

### Soluciones

**1. Intentar de nuevo**
```
1. Haz clic en "Intentar de nuevo"
2. Revisa el monto y detalles en el popup de Freighter
3. Clickea "APPROVE" (no "REJECT")
```

**2. Verificar detalles antes**
```
Antes de clickear Approve, verifica:
✓ Destino es la wallet de la empresa
✓ Monto es correcto (Precio del viaje)
✓ Memo contiene "Reserva: Nombre del Viaje"
```

---

## ❌ Error: "Failed to save reservation"

### Síntomas
```
La transacción se procesó
Pero la reserva no se guardó en el sistema
```

### Causas
- Backend/API no está corriendo
- Error en la ruta POST /api/reservations
- Problema con permisos de archivo

### Soluciones

**1. Verificar que el backend está corriendo**
```bash
# En otra terminal:
cd frontend
npm run dev

# Debería mostrar:
# ▲ Next.js 14.x.x
# - Local: http://localhost:3000
```

**2. Probar la API manualmente**
```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "tripId": "trip_xxx",
    "clientWallet": "GCZZZ...",
    "companyWallet": "GABOTHM...",
    "amount": 5,
    "txHash": "tx_7a3f...",
    "status": "completed"
  }'

Debería retornar:
{"success": true, "reservation": {...}}
```

**3. Verificar permisos de data/**
```bash
# Verificar que la carpeta existe
ls -la frontend/data/

# Debería mostrar:
# -rw-r--r--  reservations.json
# -rw-r--r--  trips.json
# -rw-r--r--  users.json

# Si no existen, crearlos:
touch frontend/data/reservations.json
echo "[]" > frontend/data/reservations.json
```

**4. Revisar logs del backend**
```
En la terminal donde corre "npm run dev":

Busca líneas con:
- [API]
- ❌ Error
- 📊

Debería mostrar:
📊 [API] POST /reservations - Reserva guardada
```

---

## ❌ Error: "Network timeout"

### Síntomas
```
La transacción tarda más de 30 segundos
Aparece "Network timeout"
Stellar explorer no responde
```

### Causas
- Congestión en Stellar Testnet
- Problema con conexión a internet
- Servidor Horizon está lento
- VPN bloqueando conexión

### Soluciones

**1. Esperar y reintentar**
```
A veces el Testnet está congestionado
Espera 5 minutos y vuelve a intentar
```

**2. Verificar conexión a internet**
```bash
ping google.com
# Debería responder (0% packet loss)
```

**3. Verificar que puedes conectar a Stellar**
```bash
curl -I https://horizon-testnet.stellar.org/

# Debería retornar:
# HTTP/2 200
```

**4. Si usas VPN**
```
Algunos VPNs bloquean conexiones a Stellar
Intenta:
- Desconectarte del VPN
- Cambiar servidor VPN
- Usar proxy en lugar de VPN
```

---

## ⚠️ Advertencias y Avisos

### "Freighter detectada pero no conectada"

```
Significa:
- La extensión está instalada
- Pero no hay wallet conectada

Solución:
1. Abre Freighter
2. Importa o crea una wallet
3. Clickea "Connect"
```

### "Viaje lleno"

```
No pueden reservarse más espacios

Solución:
- Selecciona otro viaje disponible
- O espera a que se cancele una reserva
```

### "Ya tienes una reserva para este viaje"

```
No puedes reservar el mismo viaje dos veces

Solución:
- Selecciona otro viaje
```

---

## 🔍 Debugging Avanzado

### Ver logs en la consola del navegador
```
1. Abre DevTools: F12 o Ctrl+Shift+I
2. Ve a la pestaña "Console"
3. Busca líneas con:
   - ✅ (éxito)
   - ❌ (error)
   - 🔐 (Freighter)
   - 📤 (transacción)
   - 📝 (reserva)
```

### Ver logs del backend
```bash
# Terminal donde corre "npm run dev":
# Busca líneas que comiencen con:
# 📊 [API]
# ❌ Error
# ✅ Success
```

### Ver transacciones en Stellar
```
https://stellar.expert/explorer/testnet

Busca:
1. Tu public key (para ver tus transacciones)
2. Hash de transacción (para ver detalles)
3. Wallet de empresa (para ver ingresos)
```

### Verificar datos guardados
```bash
# Ver todos los viajes
cat frontend/data/trips.json | jq .

# Ver todas las reservas
cat frontend/data/reservations.json | jq .

# Ver todos los usuarios
cat frontend/data/users.json | jq .
```

---

## 📞 Cuando todo falla

### Checklist final
- [ ] ¿Backend corriendo? (`npm run dev`)
- [ ] ¿Freighter instalada? (https://freighter.app)
- [ ] ¿Freighter conectada? (popup muestra public key)
- [ ] ¿XLM balance > 10? (Friendbot)
- [ ] ¿Viajes creados? (/available-trips muestra viajes)
- [ ] ¿URLs correctas? (http://localhost:3000)
- [ ] ¿Permisos de carpeta data/*? (ls -la frontend/data/)

### Reiniciar todo
```bash
# Terminal 1: Detener backend
Ctrl+C

# Limpiar
rm -rf frontend/.next
rm -rf frontend/node_modules

# Reinstalar
cd frontend
npm install

# Reiniciar
npm run dev

# Terminal 2: Limpiar datos y reiniciar
rm -rf frontend/data/*
# Los archivos se regenerarán automáticamente
```

### Contactar soporte
```
Si nada funciona:

1. Abre la consola (F12)
2. Ve a Console
3. Copia todos los errores
4. Incluye:
   - OS y navegador (Windows Chrome, Mac Safari, etc)
   - Pasos exactos para reproducir
   - Screenshot de la pantalla
5. Reporta como issue
```

---

**Última actualización:** Enero 2025
**Versión:** 1.0
