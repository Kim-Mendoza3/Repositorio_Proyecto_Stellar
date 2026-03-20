#!/bin/bash

# Script para iniciar la dApp con Freighter + Stellar SDK
# Uso: bash init-freighter-app.sh

echo "🚀 Iniciando StudyTrips Global con Freighter..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json"
    echo "Ejecuta este script desde: frontend/"
    exit 1
fi

# Instalar dependencias si falta
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install --legacy-peer-deps
fi

# Verificar Stellar SDK
if ! npm list @stellar/stellar-sdk > /dev/null 2>&1; then
    echo "📦 Instalando @stellar/stellar-sdk..."
    npm install @stellar/stellar-sdk --legacy-peer-deps
fi

# Verificar Freighter API
if ! npm list @stellar/freighter-api > /dev/null 2>&1; then
    echo "📦 Instalando @stellar/freighter-api..."
    npm install @stellar/freighter-api --legacy-peer-deps
fi

echo ""
echo "✅ Dependencias listas"
echo ""
echo "📋 Componentes Freighter instalados:"
echo "  ✓ useFreighterWallet Hook"
echo "  ✓ WalletLoginPage Component"
echo "  ✓ WalletContext Provider"
echo "  ✓ TravelPackagesWithPayment Component"
echo "  ✓ TransactionHistory Component"
echo ""
echo "🔐 Configuración Requerida:"
echo "  1. Abre frontend/src/hooks/useFreighterWallet.ts"
echo "  2. Cambia TRIPS_OPERATOR_ADDRESS (línea 18) a tu dirección"
echo "  3. Ajusta precios en XLM en TravelPackagesWithPayment.tsx"
echo ""
echo "🌐 Acceso a la app:"
echo "  http://localhost:3000"
echo ""
echo "📚 Documentación:"
echo "  Ver: FREIGHTER-INTEGRATION-GUIDE.md"
echo ""
echo "🧪 Para probar:"
echo "  1. Instala Freighter: https://freighter.app"
echo "  2. Obtén XLM de prueba: https://stellar.org/developers/testnet"
echo "  3. Conecta en http://localhost:3000/wallet-login"
echo ""
echo "🚀 Iniciando servidor..."
npm run dev
