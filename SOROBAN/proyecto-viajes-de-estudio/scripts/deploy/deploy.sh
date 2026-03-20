#!/bin/bash

# Deploy Soroban Contract to Stellar Testnet
# Trips Marketplace Contract

set -e

echo "🚀 Deployment de Trips Marketplace Contract"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if soroban CLI is installed
if ! command -v stellar &> /dev/null; then
    echo -e "${RED}❌ Stellar CLI no encontrado. Instálalo con:${NC}"
    echo "cargo install stellar-cli"
    exit 1
fi

# Navigate to contract directory
cd "$(dirname "$0")/contract"

echo -e "${YELLOW}1. Compilando contrato...${NC}"
cargo build --target wasm32-unknown-unknown --release

if [ ! -f "target/wasm32-unknown-unknown/release/passkey_account.wasm" ]; then
    echo -e "${RED}❌ Error en compilación${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Compilación exitosa${NC}"
echo ""

# Check network
echo -e "${YELLOW}2. Verificando red Testnet...${NC}"
if ! stellar network ls | grep -q "testnet"; then
    echo -e "${YELLOW}   Agregando testnet...${NC}"
    stellar network add testnet \
        --rpc-url https://soroban-testnet.stellar.org \
        --network-passphrase "Test SDF Network ; September 2015"
fi
echo -e "${GREEN}✅ Red Testnet lista${NC}"
echo ""

# Deploy
echo -e "${YELLOW}3. Desplegando contrato a Testnet...${NC}"
echo "   Ejecutando:"
echo "   stellar contract deploy \\"
echo "     --wasm target/wasm32-unknown-unknown/release/passkey_account.wasm \\"
echo "     --source <tu-cuenta> \\"
echo "     --network testnet"
echo ""
echo -e "${YELLOW}   Reemplaza <tu-cuenta> con tu nombre de cuenta Stellar${NC}"
echo ""

read -p "Ingresa tu nombre de cuenta Stellar (ej: trips-company): " ACCOUNT_NAME

stellar contract deploy \
    --wasm target/wasm32-unknown-unknown/release/passkey_account.wasm \
    --source "$ACCOUNT_NAME" \
    --network testnet

echo ""
echo -e "${GREEN}✅ ¡Contrato desplegado exitosamente!${NC}"
echo ""
echo -e "${YELLOW}📝 Guarda el Contract ID arriba y actualiza:${NC}"
echo "   frontend/.env.local:"
echo "   NEXT_PUBLIC_TRIPS_CONTRACT_ID=<contract-id-aqui>"
echo ""
