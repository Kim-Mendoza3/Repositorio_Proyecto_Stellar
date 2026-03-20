# 🚀 QUICK START - Sistema de Reservas de Viajes con Stellar

## En 5 minutos estarás haciendo transacciones

---

## ✅ Pre-requisitos (Instalar ANTES de empezar)

### 1️⃣ **Freighter Wallet** (Billetera)
```
📥 Descarga de: https://freighter.app
   - Selecciona tu navegador (Chrome, Firefox, Edge, etc.)
   - Instala como extensión
   - Crea una nueva wallet O importa una existente
   - IMPORTANTE: Cambia a "Test SDF Network" en Settings
```

### 2️⃣ **Obtén Fondos de Prueba (XLM)**
```
🎁 Ve a: https://friendbot.stellar.org/
   1. Copia tu dirección de Freighter
      (Haz clic en tu dirección en Freighter → se copian los primeros caracteres)
   
   2. Pega en Friendbot y espera
   
   3. Recibirás 100 XLM de prueba (gratis, solo para Testnet)
   
   4. Verifica en Freighter que veas "100.0000000 XLM"
```

---

## 🎯 Pasos para Hacer una Reserva

### Paso 1: Abre la aplicación
```
🌐 URL: http://localhost:3000
   (o la URL donde está deployado tu frontend)
```

### Paso 2: Conecta Freighter
```
1. Ve a cualquier página del sitio
2. Deberías ver un panel que dice:
   - "🔍 Verificando Freighter..."
   - O "✅ Freighter conectada y lista"
   - O "⚠️ Freighter no conectada"

3. Si dice "no conectada":
   - Abre Freighter (icono arriba a la derecha del navegador)
   - Busca opción "Connect this site"
   - Aprueba el permiso
   - Recarga la página (F5)
```

### Paso 3: Busca un viaje
```
📍 En la página inicial:
   1. Verás una lista de "Viajes Disponibles"
   2. Cada viaje muestra:
      - Nombre del destino
      - Precio en XLM
      - Fechas
      - Empresa organizadora
   
   3. Haz clic en "Ver Detalles" o en el viaje
```

### Paso 4: Reserva el viaje
```
🎫 En la página de detalles del viaje:
   1. Lee la información completa
   2. Verifica que el precio sea el que esperas
   3. Haz clic en "Reservar Ahora" o "Proceder al Pago"
   
   4. SE ABRIRÁ una ventana de Freighter
   5. Verifica los detalles de la transacción:
      - De: Tu dirección (debe empezar con G)
      - A: Dirección de la empresa (debe empezar con G)
      - Monto: El precio del viaje en XLM
      - Memo: "Reserva: Nombre del Viaje"
   
   6. Haz clic en "APPROVE" o "CONFIRMAR"
   7. Freighter firmará y enviará la transacción
```

### Paso 5: ¡Listo!
```
✅ Verás un mensaje de éxito:
   - Hash de la transacción
   - Enlace al explorador (Stellar Expert)
   - "¡Reserva completada!"

🎊 Ya tienes tu reserva en el blockchain de Stellar!
```

---

## 🔍 Cómo Verificar tu Reserva

### En la Aplicación
```
1. Ve a "Mis Reservas" o "Mi Perfil"
2. Deberías ver la reserva que acabas de hacer
3. Muestra:
   - Nombre del viaje
   - Monto pagado
   - Estado: "Confirmada"
   - Fecha de transacción
   - Hash de la transacción
```

### En el Explorador de Blockchain
```
1. En la página de éxito, haz clic en el enlace de "Ver en Explorador"
   O ve directamente a: https://stellar.expert/explorer/testnet

2. Pega el hash de la transacción en la barra de búsqueda

3. Verás todos los detalles de tu transacción en el blockchain:
   - De qué wallet a qué wallet
   - Cuánto dinero se transfirió
   - Cuándo se ejecutó
   - El estado: "Success"
```

### En tu Wallet Freighter
```
1. Abre Freighter
2. Ve a la pestaña "Activity" o "Transacciones"
3. Verás tu transacción de pago:
   - Salida de XLM (negativo)
   - Destino: wallet de la empresa
   - Timestamp de cuándo se hizo
```

---

## ⚠️ Cosas a Recordar

```
🚫 NO confundas:
   - "Public Network" con "Test SDF Network"
   - XLM real con XLM de prueba (Testnet)
   - Tu billetera en Mainnet con Testnet

✅ SIEMPRE:
   - Verifica la dirección del destinatario
   - Revisa el monto antes de confirmar
   - Guarda el hash de transacción para referencia

💡 TIP:
   - Las transacciones en Testnet son GRATIS
   - Los XLM de prueba no tienen valor real
   - Puedes hacer tantas transacciones como quieras para practicar
```

---

## 🆘 Si Algo Sale Mal

### Error: "Freighter no detectada"
```
1. Verifica que Freighter esté instalada
2. Recarga la página (F5)
3. Reinicia el navegador
4. Ve a FREIGHTER-TROUBLESHOOTING.md para más detalles
```

### Error: "0 XLM en la billetera"
```
1. Ve a https://friendbot.stellar.org/
2. Pasta tu dirección
3. Espera a recibir 100 XLM de prueba
4. Recarga la página
```

### Error: "Transacción rechazada"
```
1. Verifica que tengas suficiente XLM (mínimo: precio + 0.00001)
2. Verifica que la wallet esté en Testnet
3. Verifica que Freighter esté autorizada para este sitio
4. Intenta de nuevo
```

---

## 📊 Flujo Completo de Transacción

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario hace clic en "Reservar"                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Sistema obtiene wallet de Freighter                      │
│    (se abre popup de Freighter)                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Usuario aprueba la transacción en Freighter             │
│    (verifica el monto y destinatario)                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Freighter firma la transacción con tu clave privada      │
│    (nunca sale de tu navegador)                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Transacción se envía a Stellar Testnet Network           │
│    (se ejecuta en ~5-10 segundos)                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Sistema recibe confirmación + hash                       │
│    (transacción completada en blockchain)                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Sistema guarda la reserva en BD                          │
│    (se vincula con la transacción en blockchain)            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. ¡Reserva confirmada! ✅                                   │
│    Usuario ve confirmación + hash + link al explorador      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎓 Conceptos Clave

```
🔐 Blockchain: 
   Base de datos pública, inmutable, descentralizada

💰 XLM (Stellar Lumen):
   Moneda de Stellar

🪙 Testnet:
   Red de prueba donde el XLM no tiene valor real

⛓️ Transacción:
   Movimiento de dinero de una wallet a otra, registrado en blockchain

🔑 Wallet:
   Billetera digital que contiene tu dinero y claves privadas

📝 Hash:
   Identificador único de la transacción (es seguro compartirlo)

🔍 Explorer:
   Herramienta para ver todas las transacciones del blockchain

💳 Freighter:
   Tu billetera segura, controla TUS claves privadas (nadie más)
```

---

## 🌟 Próximos Pasos

```
1. Practica haciendo 2-3 reservas
2. Ve a explorer.stellar.org para ver tus transacciones reales
3. Experimenta con diferentes montos
4. Observa los fees de la red (normalmente ~0.00001 XLM)
5. Lee más en stellar.org para entender blockchain

¡Felicidades! Ya estás usando transacciones reales en blockchain! 🎉
```

---

**Última actualización:** 1 de diciembre de 2025
**Estado:** ✅ Listo para producción
**Red:** Stellar Testnet (https://testnet.stellar.org)
