#!/bin/bash

# Script para probar el flujo de transacciones en Stellar Testnet
# Uso: bash test-transactions.sh

echo "🚀 Test de Transacciones Stellar"
echo "================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}1. Verificando conexión a Testnet...${NC}"
HORIZON_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://horizon-testnet.stellar.org/info)
if [ "$HORIZON_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Conexión a Testnet OK${NC}"
else
    echo -e "${RED}❌ Error conectando a Testnet (HTTP $HORIZON_RESPONSE)${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}2. Verificando dirección de operador...${NC}"
OPERATOR_ADDRESS="GBUQWP3BOUZX34LOCALQVFSGHFTOJREM23NRHBK264KEXWFNVLB74OOO"
ACCOUNT_RESPONSE=$(curl -s https://horizon-testnet.stellar.org/accounts/$OPERATOR_ADDRESS)

if echo "$ACCOUNT_RESPONSE" | grep -q "id"; then
    echo -e "${GREEN}✅ Dirección válida: $OPERATOR_ADDRESS${NC}"
    echo "   Saldo:" $(echo "$ACCOUNT_RESPONSE" | grep -o '"balance":"[^"]*' | head -1 | cut -d'"' -f4) "XLM"
else
    echo -e "${RED}❌ Dirección inválida o no existe${NC}"
fi

echo ""
echo -e "${YELLOW}3. Verificando ruta de API local...${NC}"
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/reservations)
if [ "$API_RESPONSE" = "200" ] || [ "$API_RESPONSE" = "405" ]; then
    echo -e "${GREEN}✅ API accesible en localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠️  API no responde (HTTP $API_RESPONSE)${NC}"
    echo "   Asegúrate de ejecutar: npm run dev"
fi

echo ""
echo -e "${YELLOW}4. Verificando dependencias...${NC}"
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
else
    echo -e "${RED}❌ Node.js no instalado${NC}"
fi

if npm list @stellar/stellar-sdk > /dev/null 2>&1; then
    echo -e "${GREEN}✅ @stellar/stellar-sdk instalado${NC}"
else
    echo -e "${RED}❌ @stellar/stellar-sdk no encontrado${NC}"
fi

if npm list @stellar/freighter-api > /dev/null 2>&1; then
    echo -e "${GREEN}✅ @stellar/freighter-api instalado${NC}"
else
    echo -e "${RED}❌ @stellar/freighter-api no encontrado${NC}"
fi

echo ""
echo "================================="
echo -e "${GREEN}✅ Pre-requisitos verificados${NC}"
echo ""
echo "📋 Próximos pasos:"
echo "1. Abre http://localhost:3000"
echo "2. Conecta Freighter Wallet"
echo "3. Ve a 'Ver Viajes Disponibles'"
echo "4. Haz clic en un viaje"
echo "5. Haz clic en 'Reservar Ahora'"
echo "6. Firma la transacción en Freighter"
echo "7. Espera confirmación"
echo ""
echo "💡 Verificar transacción en:"
echo "   https://stellar.expert/explorer/testnet/tx/{HASH}"
