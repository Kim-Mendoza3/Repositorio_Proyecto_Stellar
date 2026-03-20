# 🚀 Guía de Prueba - Sistema de Viajes de Estudio con Stellar

## Resumen Rápido

El sistema ahora permite:
- ✅ Empresas crear ofertas de viajes
- ✅ Clientes ver todas las ofertas disponibles
- ✅ Clientes reservar viajes con pago en XLM
- ✅ Sincronización automática de datos

---

## 📋 Paso a Paso - Flujo Completo

### PASO 1: Registro de Empresa (Tono Companic)

1. Ve a `/register`
2. Completa tu información personal:
   - Nombre: `Tono`
   - Email: `tono@companic.com`
   - Teléfono: `+52123456789`
3. Haz clic en **"Soy Empresa 🏢"**
4. Completa datos de empresa:
   - Nombre de Empresa: `Tono Companic`
   - Licencia: `VM261`
5. Conecta con Freighter o ingresa tu wallet manualmente
6. ✅ Serás redirigido a `/company-dashboard`

---

### PASO 2: Crear Ofertas de Viaje (como Tono)

En `/company-dashboard`:

1. Haz clic en **"Nueva Oferta de Viaje"**
2. Completa los datos:
   - **Nombre:** `Viaje a CDMX - Semana Cultural`
   - **Destino:** `Ciudad de México`
   - **Duración:** `5 días`
   - **Precio:** `50` XLM
   - **Max Participantes:** `30`
   - **Descripción:** `Explora museos y sitios históricos de la CDMX`
   - **Puntos destacados** (uno por línea):
     ```
     Museo de Antropología
     Pirámides de Teotihuacán
     Xochimilco
     Zócalo y Catedral
     ```
3. Haz clic en **"Crear Oferta"**
4. ✅ La oferta aparecer en el sistema

**Repite para crear más ofertas** (recomendado 2-3 viajes)

---

### PASO 3: Logout y Registro de Cliente (Kevin)

1. En `/company-dashboard`, haz clic en **"Cerrar Sesión"**
2. Ve a `/register`
3. Completa tu información:
   - Nombre: `Kevin`
   - Email: `kevin@ejemplo.com`
   - Teléfono: `+52987654321`
4. Haz clic en **"Soy Cliente 👨‍🎓"**
5. Completa datos de estudiante:
   - Escuela: `Preparatoria Central`
   - ID Estudiante: `PREP2024001`
6. Conecta wallet (Freighter o manual, **DEBE SER DIFERENTE a la de Tono**)
7. ✅ Serás redirigido a `/dashboard`

---

### PASO 4: Ver Ofertas Disponibles (como Kevin)

En `/dashboard`:

1. Haz clic en el botón **"🌍 Ver Todos los Viajes"**
2. ✅ Deberías ver todas las ofertas creadas por Tono
3. Los filtros funcionan:
   - Busca por destino (ej: "CDMX")
   - Ajusta precio máximo

**Si no ves viajes:**
- Haz clic en botón **"Actualizar"**
- Ve a `/storage-debug` para verificar datos
- Verifica que `registered_users` contiene a Tono como empresa
- Verifica que existen claves `company_trips_<wallet_tono>`

---

### PASO 5: Reservar Viaje (como Kevin)

1. Selecciona un viaje
2. Haz clic en **"Reservar Ahora"**
3. Se abrirá modal de confirmación mostrando:
   - Nombre del viaje
   - Destino
   - Monto en XLM
4. Haz clic en **"Confirmar Pago"**
5. ✅ Sistema procesa la "transacción" (simulada)
6. Recibirás confirmación de éxito
7. El viaje aparecerá en **"Mis Reservas"**

---

### PASO 6: Ver Tus Reservas

En la página de viajes disponibles, desplázate abajo a la sección **"Mis Reservas"**

Verás todas tus reservas confirmadas con:
- Nombre del viaje
- Monto pagado
- Hash de transacción (mock)

---

## 🔍 Diagnósticos y Debug

### Ver Datos en Storage

Ve a `/storage-debug` para ver:
- **Usuarios registrados:** `registered_users`
- **Viajes por empresa:** `company_trips_<wallet>`
- **Reservas de cliente:** `client_reservations_<wallet>`

**Puedes:**
- ✅ Copiar JSON de cualquier dato
- ✅ Exportar todos los datos a archivo
- ✅ Limpiar localStorage completamente
- ✅ Eliminar keys específicas

### Limpiar Todo

Si necesitas empezar de cero:
1. Ve a `/storage-debug`
2. Haz clic en **"🗑️ Limpiar"**
3. Confirma en el diálogo
4. localStorage será limpiado completamente

---

## 📊 Flujo de Datos

```
EMPRESA (Tono) crea viaje
    ↓
Se guarda en: localStorage['company_trips_<wallet_tono>']
    ↓
Se registra empresa en: localStorage['registered_users']
    ↓
CLIENTE (Kevin) abre /available-trips
    ↓
Hook useTripOffers() busca en registered_users
    ↓
Por cada empresa, busca company_trips_<wallet>
    ↓
Muestra todos los viajes disponibles
    ↓
CLIENTE reserva viaje
    ↓
Se guarda en: localStorage['client_reservations_<wallet_kevin>']
    ↓
Contador de bookings se actualiza
```

---

## ✅ Checklist de Prueba

- [ ] Empresa puede registrarse
- [ ] Empresa puede crear múltiples viajes
- [ ] Empresa puede editar viajes
- [ ] Empresa puede eliminar viajes
- [ ] Cliente puede registrarse con wallet diferente
- [ ] Cliente ve TODOS los viajes de TODAS las empresas
- [ ] Cliente puede filtrar por destino
- [ ] Cliente puede filtrar por precio
- [ ] Cliente puede reservar viaje
- [ ] Contador de reservas aumenta
- [ ] Cliente ve sus reservas confirmadas
- [ ] `/storage-debug` muestra todos los datos correctamente

---

## 🆘 Troubleshooting

### ❌ "No hay viajes disponibles"

1. Verifica que registraste una empresa
2. Verifica que la empresa creó viajes
3. Ve a `/storage-debug` y busca:
   - `registered_users` debe tener empresa
   - `company_trips_<wallet>` debe existir
4. Haz clic en "Actualizar" en `/available-trips`

### ❌ "Usuario no encontrado en registro"

Significa que el cliente intentó loguear con una wallet no registrada
- Solución: Registrarse en `/register` primero

### ❌ "Wallet ya está registrada"

No puedes usar la misma wallet para dos cuentas
- Solución: Usa una wallet/dirección diferente

### ❌ Viajes aparecen después de actualizar

El sistema carga datos bajo demanda. Haz clic en "Actualizar" para forzar recarga.

---

## 🎯 Datos de Prueba Recomendados

### Empresa 1 (Tono)
```
Nombre: Tono Companic
Email: tono@companic.com
Wallet: <tu primera wallet>

Viajes:
- CDMX Tour (50 XLM, 5 días)
- Playas Cancún (75 XLM, 7 días)
- Oaxaca Cultural (60 XLM, 4 días)
```

### Cliente 1 (Kevin)
```
Nombre: Kevin
Email: kevin@ejemplo.com
Wallet: <tu segunda wallet / diferente>
Escuela: Prep Central
ID: PREP001

Acciones:
- Ver viajes
- Reservar 1-2 viajes
- Ver reservas
```

---

## 📱 URLs Importantes

| Página | URL | Rol |
|--------|-----|-----|
| Inicio | `/` | Público |
| Registro | `/register` | Público |
| Login | `/login` | Público |
| Dashboard Cliente | `/dashboard` | Cliente |
| Viajes Disponibles | `/available-trips` | Cliente |
| Dashboard Empresa | `/company-dashboard` | Empresa |
| Storage Debug | `/storage-debug` | Admin |

---

## 🚀 Próximas Mejoras

- [ ] Integración de transacciones REALES de Stellar
- [ ] Dashboard de empresa mostrando reservas recibidas
- [ ] Sistema de pagos confirmados en blockchain
- [ ] Comentarios y ratings en viajes
- [ ] Búsqueda y filtros avanzados
- [ ] Notificaciones en tiempo real

---

**¡Listo para probar!** 🎉
