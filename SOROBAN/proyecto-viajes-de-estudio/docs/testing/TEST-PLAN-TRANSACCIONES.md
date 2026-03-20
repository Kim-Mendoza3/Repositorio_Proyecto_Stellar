# 🧪 Casos de Prueba - Sistema de Transacciones

## Test Plan Completo

### Fase 1: Preparación ✅

- [ ] **T1.1** Freighter instalada
  - Ir a https://freighter.app
  - Descargar extensión
  - Instalar en navegador

- [ ] **T1.2** Wallet creada en Testnet
  - Abrir Freighter
  - Click "New Account" o "Import Account"
  - Copiar dirección pública
  - Ir a Settings y cambiar a "Testnet"

- [ ] **T1.3** Fondos de prueba solicitados
  - Ir a https://developers.stellar.org/docs/reference/testnet-details
  - Pegar dirección en faucet
  - Recibir 50 XLM de prueba
  - Esperar 1-2 minutos

### Fase 2: Conexión ✅

#### Test 2.1: Detectar Freighter
```
Pasos:
1. Abrir http://localhost:3000/available-trips
2. Verificar estado de Freighter

Resultado esperado:
✅ [FreighterStatus] Freighter disponible y conectado: GBUQWP...
```

#### Test 2.2: Conectar Wallet
```
Pasos:
1. Si muestra "Freighter no conectada"
2. Abrir Freighter (icono arriba a la derecha)
3. Click "Connect this site"
4. Recargar página

Resultado esperado:
✅ Freighter conectada y lista
```

#### Test 2.3: Mostrar Saldo
```
Pasos:
1. Abrir consola (F12)
2. Ejecutar: JSON.parse(localStorage.getItem('wallet_account'))

Resultado esperado:
{
  "publicKey": "GCDZST3XVCDTUJ76ZAV2HA72KYYWJHYQNMKNQPHJV2HJMRKAWHZ4GY2L",
  "balance": 50,
  "network": "Stellar Testnet"
}
```

### Fase 3: Transacción Exitosa ✅

#### Test 3.1: Ver viaje
```
Pasos:
1. Ir a "Ver Viajes Disponibles"
2. Click en "Ver más" en un viaje
3. Verificar que aparecen detalles

Resultado esperado:
- Nombre del viaje visible
- Precio en XLM visible
- Botón "Reservar Ahora" disponible
```

#### Test 3.2: Iniciar transacción
```
Pasos:
1. Click en "Reservar Ahora"
2. Verificar que muestre "Esperando firma en Freighter..."
3. Popup de Freighter debe aparecer

Resultado esperado:
- Popup de Freighter en primer plano
- Muestra XDR a firmar
- Muestra monto y destino
```

#### Test 3.3: Firmar transacción
```
Pasos:
1. En Freighter popup, verificar detalles
2. Click "Sign" o "Approve"
3. Verificar que desaparece el popup

Resultado esperado:
- Popup cierra
- Estado cambia a "Enviando a blockchain..."
- Aparece spinner
```

#### Test 3.4: Enviar a blockchain
```
Pasos:
1. Esperar 2-3 segundos
2. Verificar que aparece "Registrando reserva..."
3. Esperar otros 1-2 segundos

Resultado esperado:
- Estado progresa: Firmada ✓ → Enviada ✓ → Registrando...
- No hay errores en consola
```

#### Test 3.5: Confirmación exitosa
```
Pasos:
1. Esperar a que desaparezca el spinner
2. Verificar que aparece "¡Reserva exitosa!"
3. Copiar hash de transacción

Resultado esperado:
- Verde claro de fondo
- Hash mostrado en formato: abc123def456...
- Botón "Volver a viajes" disponible
```

### Fase 4: Verificación en Blockchain ✅

#### Test 4.1: Explorer de Stellar
```
Pasos:
1. Copiar hash (de Test 3.5)
2. Ir a https://stellar.expert/explorer/testnet/tx/{HASH}
3. Reemplazar {HASH} con el hash real

Resultado esperado:
- Página muestra detalles completos
- Muestra: From, To, Amount, Fee, Time
- Estado: SUCCESS
- Confirmaciones: 3-6+
```

#### Test 4.2: Verificar dirección de origen
```
En la página del explorer:
- "From" debe coincidir con tu wallet (GCDZST...)
- "To" debe ser GBUQWP3BOUZX34LOCALQVFSGHFTOJREM23NRHBK264KEXWFNVLB74OOO
```

#### Test 4.3: Verificar monto
```
En la página del explorer:
- "Amount" debe ser el precio del viaje (ej: 50 XLM)
- "Fee" debe ser 0.00001 XLM (estándar)
- "Balance" debe haber disminuido
```

### Fase 5: Casos de Error ❌

#### Test 5.1: Sin Freighter instalada
```
Pasos:
1. Desinstalar extensión Freighter
2. Recargar página
3. Ir a viaje
4. Click "Reservar Ahora"

Resultado esperado:
- Error: "Freighter no detectada"
- Mensaje sugiere descargar Freighter
- No intenta procesar transacción
```

#### Test 5.2: Freighter no conectada
```
Pasos:
1. Abrir Freighter
2. Clickear "Disconnect" o "Forget this site"
3. Recargar página
4. Click "Reservar Ahora"

Resultado esperado:
- Error: "Freighter no conectada"
- Se sugiere hacer "Connect this site"
- No procesa transacción
```

#### Test 5.3: Saldo insuficiente
```
Pasos:
1. Usar wallet con < 1 XLM
2. Ir a viaje con precio > saldo
3. Click "Reservar Ahora"

Resultado esperado:
- Error en consola: "Saldo insuficiente"
- Freighter rechaza en popup
- Mensaje muestra cuánto falta
```

#### Test 5.4: Red equivocada
```
Pasos:
1. En Freighter, cambiar a Mainnet
2. Ir a viaje
3. Click "Reservar Ahora"

Resultado esperado:
- Freighter popup muestra advertencia
- Rechaza o muestra error de red
- No se envía transacción a Testnet
```

#### Test 5.5: Rechazar firma
```
Pasos:
1. Click "Reservar Ahora"
2. Popup de Freighter
3. Click "Reject" o cerrar popup

Resultado esperado:
- Estado vuelve a "idle"
- Mensaje: "Usuario rechazó la transacción"
- No se envía nada a blockchain
```

### Fase 6: Rendimiento ⚡

#### Test 6.1: Tiempo de respuesta
```
Pasos:
1. Usar DevTools (F12) → Network
2. Hacer transacción
3. Medir tiempo total

Resultado esperado:
- Firmado: < 10 segundos (esperar usuario)
- Enviado: 2-3 segundos
- Registrado: 1-2 segundos
- Total: 3-5 segundos (sin espera de firma)
```

#### Test 6.2: Manejo de múltiples transacciones
```
Pasos:
1. Hacer transacción (esperar confirmación)
2. Ir a otro viaje
3. Hacer otra transacción
4. Repetir 5 veces

Resultado esperado:
- Cada transacción se completa sin errores
- Saldos se actualizan correctamente
- No hay memory leaks
```

### Fase 7: UI/UX 🎨

#### Test 7.1: Estados visuales
```
Verificar que se muestren correctamente:
- [ ] Estado "Verificando Freighter..."
- [ ] Estado "Esperando firma"
- [ ] Estado "Enviando..."
- [ ] Estado "Registrando"
- [ ] Estado "✅ Exitoso"
- [ ] Estado "❌ Error"
```

#### Test 7.2: Mensajes claros
```
Verificar que cada mensaje:
- [ ] Sea comprensible para no-técnicos
- [ ] Muestre qué sucede en cada paso
- [ ] Tenga instrucciones si hay error
- [ ] No contenga jerga innecesaria
```

#### Test 7.3: Responsividad
```
Verificar en:
- [ ] Desktop (> 1920px)
- [ ] Tablet (768px - 1024px)
- [ ] Mobile (< 768px)
```

### Fase 8: Seguridad 🔐

#### Test 8.1: No se envían claves privadas
```
Pasos:
1. Abrir DevTools (F12) → Network
2. Hacer transacción
3. Verificar todas las requests

Resultado esperado:
- Ningún request contiene: privateKey, secret, seed
- Solo se envía: publicKey, signedXDR
```

#### Test 8.2: HTTPS en producción
```
Pasos:
1. En producción, verificar que URL sea HTTPS
2. No HTTP sin encripción

Resultado esperado:
- Candado verde en navegador
- URL empieza con https://
```

#### Test 8.3: Validación de dirección
```
Pasos:
1. Verificar que solo acepta direcciones válidas
2. Dirección debe empezar con 'G'
3. Dirección debe tener 56 caracteres

Resultado esperado:
- Si dirección inválida: error
- Si dirección válida: continúa
```

## Tabla Resumen

| Test | Esperado | Estado | Notas |
|------|----------|--------|-------|
| 2.1 Detectar Freighter | ✅ | - | - |
| 2.2 Conectar Wallet | ✅ | - | - |
| 2.3 Mostrar Saldo | ✅ | - | - |
| 3.1 Ver viaje | ✅ | - | - |
| 3.2 Iniciar transacción | ✅ | - | - |
| 3.3 Firmar transacción | ✅ | - | - |
| 3.4 Enviar a blockchain | ✅ | - | - |
| 3.5 Confirmación | ✅ | - | - |
| 4.1 Explorer | ✅ | - | - |
| 4.2 Verificar origen | ✅ | - | - |
| 4.3 Verificar monto | ✅ | - | - |
| 5.1 Sin Freighter | ❌ | - | - |
| 5.2 No conectada | ❌ | - | - |
| 5.3 Saldo insuficiente | ❌ | - | - |
| 5.4 Red equivocada | ❌ | - | - |
| 5.5 Rechazar firma | ❌ | - | - |

## Checklist Final

- [ ] Todos los tests pasados
- [ ] No hay errores en consola
- [ ] No hay warnings importantes
- [ ] Transacciones verificadas en Explorer
- [ ] UX es clara y sin confusiones
- [ ] Rendimiento aceptable (< 5 seg)
- [ ] Seguridad validada
- [ ] Documentación actualizada

---

**Instrucciones:** Marcar cada celda de "Estado" con ✅ (pasado), ❌ (fallido), o ⏳ (pendiente)

**Última actualización:** 1 de diciembre de 2025
