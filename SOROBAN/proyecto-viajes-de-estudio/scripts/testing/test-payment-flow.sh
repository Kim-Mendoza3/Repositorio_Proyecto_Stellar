#!/bin/bash

# ============================================================================
# SCRIPT DE TESTING - FLUJO COMPLETO DE PAGOS CON STELLAR
# ============================================================================

echo "🚀 =================================================="
echo "   TESTING FLUJO DE PAGOS - RESERVA DE VIAJES"
echo "=================================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# URLs
API_URL="http://localhost:3000/api"
FRONTEND_URL="http://localhost:3000"

echo -e "${BLUE}📋 PRE-REQUISITOS:${NC}"
echo "1. ✓ Backend corriendo en http://localhost:3000"
echo "2. ✓ Freighter instalada y conectada"
echo "3. ✓ Testnets habilitadas en Freighter"
echo "4. ✓ Wallet con balance > 10 XLM"
echo ""

read -p "¿Continuar con los tests? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  exit 1
fi

echo ""
echo -e "${BLUE}🧪 TEST 1: Verificar API conectada${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESPONSE=$(curl -s "$API_URL/trips")
if echo "$RESPONSE" | grep -q "success"; then
  echo -e "${GREEN}✓ API respondiendo correctamente${NC}"
else
  echo -e "${RED}✗ Error: API no responde correctamente${NC}"
  echo "Respuesta: $RESPONSE"
  exit 1
fi

echo ""
echo -e "${BLUE}🏢 TEST 2: Crear Viaje de Prueba${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Datos de prueba para empresa
EMPRESA_WALLET="GABOTHMIIA476W2RN3CX3RLYNIX7SEKNPVBWGOBOMTKPV47SDCE4YFVM"
TRIP_DATA=$(cat <<EOF
{
  "name": "🧪 TEST: Viaje a Madrid",
  "destination": "Madrid, España",
  "duration": "5 días",
  "priceXLM": 5,
  "description": "Viaje de prueba para testing del sistema de pagos",
  "maxParticipants": 20,
  "highlights": ["Museo del Prado", "Parque Retiro", "Barrio Gótico"],
  "companyWallet": "$EMPRESA_WALLET",
  "companyName": "Empresa Test"
}
EOF
)

echo "Creando viaje con datos:"
echo "$TRIP_DATA" | jq .

RESPONSE=$(curl -s -X POST "$API_URL/trips" \
  -H "Content-Type: application/json" \
  -d "$TRIP_DATA")

echo ""
echo "Respuesta del servidor:"
echo "$RESPONSE" | jq .

TRIP_ID=$(echo "$RESPONSE" | jq -r '.trip.id // empty')

if [ -z "$TRIP_ID" ]; then
  echo -e "${RED}✗ Error: No se pudo crear viaje${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Viaje creado con ID: $TRIP_ID${NC}"

echo ""
echo -e "${BLUE}📋 TEST 3: Verificar Viaje en Lista${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESPONSE=$(curl -s "$API_URL/trips")
if echo "$RESPONSE" | grep -q "$TRIP_ID"; then
  echo -e "${GREEN}✓ Viaje aparece en lista${NC}"
else
  echo -e "${RED}✗ Error: Viaje no aparece en lista${NC}"
  echo "Respuesta: $RESPONSE"
  exit 1
fi

echo ""
echo -e "${BLUE}👥 TEST 4: Crear Usuario Alumno${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# En producción esto vendría de Freighter
ALUMNO_WALLET="GCZST5DUJVSEZFSK226XZNMLXMGTMFCZLJ2VVOQW3X5IF75WDQX3QWQS"

USER_DATA=$(cat <<EOF
{
  "name": "Alumno Test",
  "email": "alumno@test.com",
  "userType": "client",
  "wallet": "$ALUMNO_WALLET"
}
EOF
)

echo "Creando usuario:"
echo "$USER_DATA" | jq .

RESPONSE=$(curl -s -X POST "$API_URL/users" \
  -H "Content-Type: application/json" \
  -d "$USER_DATA")

echo ""
echo "Respuesta:"
echo "$RESPONSE" | jq .

echo -e "${GREEN}✓ Usuario alumno creado${NC}"

echo ""
echo -e "${YELLOW}⚠️  TEST 5: FLUJO DE PAGO - INSTRUCCIONES MANUALES${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "El flujo de pago requiere interacción manual con Freighter."
echo "Por favor, sigue estos pasos:"
echo ""
echo "1️⃣  Abre el navegador: $FRONTEND_URL/trip-detail?id=$TRIP_ID"
echo ""
echo "2️⃣  Verifica que ves:"
echo "    • Nombre: 🧪 TEST: Viaje a Madrid"
echo "    • Destino: Madrid, España"
echo "    • Precio: 5 XLM"
echo "    • Empresa: Empresa Test"
echo ""
echo "3️⃣  Click en 'Reservar Ahora'"
echo ""
echo "4️⃣  Freighter popup:"
echo "    • Revisa que el destino sea: $EMPRESA_WALLET"
echo "    • Revisa que el monto sea: 5 XLM"
echo "    • Click en 'Approve'"
echo ""
echo "5️⃣  Espera a que procese:"
echo "    • 🔐 Esperando firma en Freighter..."
echo "    • 📤 Enviando a blockchain..."
echo "    • 📝 Registrando reserva..."
echo ""
echo "6️⃣  Éxito:"
echo "    • Verás: '¡Reserva exitosa!'"
echo "    • Hash de transacción será visible"
echo ""
echo "7️⃣  Verifica en Stellar Explorer:"
echo "    • https://stellar.expert/explorer/testnet/account/$EMPRESA_WALLET"
echo "    • Deberías ver una transacción entrada de 5 XLM con memo 'Reserva: ...'"
echo ""

read -p "¿Ya completaste el flujo de pago en Freighter? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}⏭️  Saltando test de verificación${NC}"
else
  echo ""
  echo -e "${BLUE}📝 TEST 6: Verificar Reserva Guardada${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  echo "Buscando reservas del alumno: $ALUMNO_WALLET"
  
  RESPONSE=$(curl -s "$API_URL/reservations?clientWallet=$ALUMNO_WALLET")
  echo ""
  echo "Respuesta:"
  echo "$RESPONSE" | jq .
  
  if echo "$RESPONSE" | grep -q "completed"; then
    echo -e "${GREEN}✓ Reserva completada y guardada${NC}"
  else
    echo -e "${YELLOW}⚠️  No se encontraron reservas completadas${NC}"
  fi
fi

echo ""
echo -e "${GREEN}✅ =================================================="
echo "   TESTING COMPLETADO"
echo "==================================================${NC}"
echo ""
echo "📊 Resumen:"
echo "  • Viaje creado: $TRIP_ID"
echo "  • Empresa wallet: $EMPRESA_WALLET"
echo "  • Alumno wallet: $ALUMNO_WALLET"
echo "  • Precio: 5 XLM"
echo ""
echo "🔗 URLs útiles:"
echo "  • Frontend: $FRONTEND_URL/trip-detail?id=$TRIP_ID"
echo "  • Viajes: $FRONTEND_URL/available-trips"
echo "  • Stella Expert: https://stellar.expert/explorer/testnet/account/$EMPRESA_WALLET"
echo ""
