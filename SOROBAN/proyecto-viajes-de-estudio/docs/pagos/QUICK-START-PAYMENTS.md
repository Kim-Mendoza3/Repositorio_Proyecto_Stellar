# ⚡ QUICK START - Flujo de Pagos

## 5 Minutos para Probar el Sistema

### Paso 0: Preparación (1 min)

```bash
# Asegúrate que:
# 1. Backend corre: npm run dev (puerto 3000)
# 2. Freighter instalada: https://freighter.app
# 3. Testnet habilitada en Freighter
# 4. Wallet conectada con balance > 10 XLM
```

### Paso 1: Empresario Crea Viaje (1.5 min)

**URL:** `http://localhost:3000/company-dashboard`

```
1. Login como EMPRESA
2. Crear Viaje:
   Nombre:          "Viaje a Berlín"
   Destino:         "Berlín, Alemania"
   Duración:        "5 días"
   Precio:          5 (XLM)
   Máx. Personas:   20
   Descripción:     "Experiencia única en Berlín"
3. Guardar
✓ Viaje guardado
```

### Paso 2: Alumno Ve Viajes (1 min)

**URL:** `http://localhost:3000/available-trips`

```
1. Login como ALUMNO (otra wallet)
2. Buscar "Viaje a Berlín"
3. Ver: Precio 5 XLM, Espacios disponibles
✓ Viaje visible
```

### Paso 3: Alumno Reserva Viaje (1.5 min)

**URL:** Click "Ver Detalles" en viaje

```
1. Ver detalles completos
2. Click "RESERVAR AHORA"
3. Freighter popup aparece:
   - Revisa: Empresa wallet + 5 XLM
   - Click "APPROVE"
4. Esperar progreso:
   🔐 Firmando...
   📤 Enviando...
   📝 Registrando...
5. ✅ ¡ÉXITO!
   - Hash visible
   - Monto: 5 XLM
```

### Paso 4: Verificar (1 min)

**URL:** https://stellar.expert/explorer/testnet

```
1. Ir a: https://stellar.expert/explorer/testnet
2. Buscar wallet de EMPRESA
3. Ver transacción entrante:
   De: Wallet de alumno
   Monto: ~5 XLM (menos fee)
   Memo: "Reserva: Viaje a Berlín"
✓ Transacción confirmada en blockchain
```

---

## 📱 URLs Importantes

| Sección | URL |
|---------|-----|
| Ver Viajes | `http://localhost:3000/available-trips` |
| Crear Viaje | `http://localhost:3000/company-dashboard` |
| Detalles Viaje | `http://localhost:3000/trip-detail?id={ID}` |
| Explorer | `https://stellar.expert/explorer/testnet` |

---

## 🆘 Si Algo Sale Mal

| Error | Solución |
|-------|----------|
| "Freighter no detectada" | Instala desde freighter.app |
| "Insufficient balance" | Obtén XLM aquí: https://developers.stellar.org/docs/tools/testnet-helper |
| "No puedo conectarme" | Backend debe estar en puerto 3000 |
| "Transacción rechazada" | Usuario clickeó "Reject" - Reintentar |

---

## 🎯 Estado Final

- ✅ Empresario recibió 5 XLM menos fee (~0.00001 XLM)
- ✅ Alumno vio transacción en blockchain
- ✅ Reserva guardada en sistema
- ✅ Hash verificable públicamente

**¡Sistema funcional! 🎉**

---

## 📚 Documentación Completa

Para detalles técnicos, lee: **[PAYMENT-FLOW.md](./PAYMENT-FLOW.md)**
