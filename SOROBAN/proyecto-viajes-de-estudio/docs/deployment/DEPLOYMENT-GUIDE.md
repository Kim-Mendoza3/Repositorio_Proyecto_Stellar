# Deployment Guide - Trips Marketplace Soroban Contract

## ✅ Contrato Compilado

El contrato está listo en: `contract/target/wasm32-unknown-unknown/release/passkey_account.wasm`

## 🚀 Desplegar a Stellar Testnet

### 1. Crear una Cuenta en Testnet

```bash
stellar account create trips-company
```

### 2. Financiar la Cuenta

Usa el Friendbot: https://developers.stellar.org/learn/fundamentals-and-concepts/testnet-public

### 3. Desplegar el Contrato

```bash
cd contract

# Desplegar
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/passkey_account.wasm \
  --source trips-company \
  --network testnet
```

Esto retornará el Contract ID. Guárdalo.

## 📝 Ejemplo de Uso

### Inicializar Marketplace

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source trips-company \
  --network testnet \
  -- \
  initialize
```

### Crear Trip

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source trips-company \
  --network testnet \
  -- \
  create_trip \
  --company <COMPANY_WALLET> \
  --destination "Japan" \
  --description "Amazing trip to Tokyo" \
  --price_xlm 100000000 \
  --available_spots 10 \
  --start_date 1700000000 \
  --end_date 1700100000
```

### Listar Viajes

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source trips-company \
  --network testnet \
  -- \
  list_trips
```

### Hacer Reservación

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source trips-company \
  --network testnet \
  -- \
  make_reservation \
  --trip_id <TRIP_ID> \
  --client <CLIENT_WALLET> \
  --price_paid 100000000
```

## 📋 Funciones Disponibles

1. **initialize()** - Inicializa el marketplace
2. **create_trip()** - Crea una nueva oferta de viaje
3. **list_trips()** - Lista todos los viajes
4. **list_company_trips(company)** - Lista viajes de una empresa
5. **make_reservation()** - Hace una reservación
6. **list_client_reservations(client)** - Lista reservaciones de un cliente
7. **cancel_reservation()** - Cancela una reservación
8. **get_trip()** - Obtiene detalles de un viaje
9. **get_reservation()** - Obtiene detalles de una reservación

## 🔗 Próximos Pasos

1. Actualizar `frontend/.env` con el CONTRACT_ID
2. Actualizar el hook `useTripsMarketplace.ts` para apuntar al contrato desplegado
3. Probar en el frontend

## 📚 Referencias

- [Stellar Soroban Docs](https://developers.stellar.org/learn)
- [Contract Development Guide](https://developers.stellar.org/learn/build/smart-contracts)
