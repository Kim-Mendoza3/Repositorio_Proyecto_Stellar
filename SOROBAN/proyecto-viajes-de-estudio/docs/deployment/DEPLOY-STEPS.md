# 🚀 FINANCIAR CUENTA Y DESPLEGAR CONTRATO

## Tu Public Key (Guárdalo)
```
GABOTHMIIA476W2RN3CX3RLYNIX7SEKNPVBWGOBOMTKPV47SDCE4YFVM
```

## PASO 1: Financiar la Cuenta

Ve a: **https://developers.stellar.org/learn/fundamentals-and-concepts/testnet-public**

1. Copia y pega tu public key (arriba)
2. Click en "Get 10,000 XLM"
3. Espera confirmación

⏳ Esto tardará ~30 segundos a 1 minuto

## PASO 2: Verificar Financiamiento

```bash
stellar account info trips-company --network testnet
```

Deberías ver:
```
Account ID: GABOTHMIIA476W2RN3CX3RLYNIX7SEKNPVBWGOBOMTKPV47SDCE4YFVM
Native Balance: 10000.0000000 XLM
```

## PASO 3: Desplegar el Contrato

Una vez financiado:

```bash
cd contract/
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/passkey_account.wasm \
  --source trips-company \
  --network testnet
```

## PASO 4: Guardar Contract ID

El output mostrará:
```
Contract ID: CABC123XYZ...
```

**Guárdalo en tu .env.local:**

```env
NEXT_PUBLIC_TRIPS_CONTRACT_ID=CABC123XYZ...
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
```

## PASO 5: Reiniciar Frontend y Probar

```bash
cd frontend/
npm run dev
```

Abre 2 navegadores:
- Browser 1: Empresa → Crea viaje
- Browser 2: Alumno → Ve el viaje instantáneamente ✨

---

**⏱️ Tiempo total: ~2 minutos**

¿Estás listo? Sigue estos pasos y avísame cuando tengas el Contract ID.
