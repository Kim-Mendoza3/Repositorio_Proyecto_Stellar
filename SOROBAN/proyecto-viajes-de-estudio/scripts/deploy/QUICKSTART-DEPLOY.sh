#!/bin/bash

# Quick Start - Trips Marketplace Soroban Contract
# ================================================

echo "🚀 QUICK START - Desplegar Contrato Soroban"
echo ""
echo "REQUISITOS:"
echo "✓ stellar CLI (cargo install stellar-cli)"
echo "✓ Rust/Cargo"
echo "✓ Cuenta en Stellar Testnet"
echo "✓ Financiada con XLM desde Friendbot"
echo ""

echo "PASO 1: Verificar que Stellar CLI esté instalado"
echo "$ stellar --version"
echo ""

echo "PASO 2: Crear cuenta en Testnet (si no la tienes)"
echo "$ stellar account create trips-company"
echo ""

echo "PASO 3: Financiar con Friendbot"
echo "Abre: https://developers.stellar.org/learn/fundamentals-and-concepts/testnet-public"
echo "Pega tu public key y presiona 'Get 10,000 XLM'"
echo ""

echo "PASO 4: Desplegar contrato"
echo "$ cd contract/"
echo "$ stellar contract deploy \\"
echo "    --wasm target/wasm32-unknown-unknown/release/passkey_account.wasm \\"
echo "    --source trips-company \\"
echo "    --network testnet"
echo ""

echo "PASO 5: Guardar Contract ID"
echo "El output mostrará: Contract ID: CABC123..."
echo "Guárdalo en .env.local:"
echo ""
echo "frontend/.env.local:"
echo "NEXT_PUBLIC_TRIPS_CONTRACT_ID=CABC123..."
echo ""

echo "PASO 6: Reiniciar frontend"
echo "$ cd frontend/"
echo "$ npm run dev"
echo ""

echo "PASO 7: Probar en 2 navegadores"
echo "Browser 1 (Empresa): Crea oferta de viaje"
echo "Browser 2 (Alumno): Ve la oferta instantáneamente ✨"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "¿Dudas? Lee: DEPLOYMENT-GUIDE.md"
echo "═══════════════════════════════════════════════════════════"
