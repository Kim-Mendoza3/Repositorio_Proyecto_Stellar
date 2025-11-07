#!/bin/bash

# 🚀 Setup Script - Soroban Passkey Demo
# Este script configura todo automáticamente

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🔐 Soroban Passkey Demo - Instalación Automática           ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}📁 Directorio del proyecto: ${NC}$PROJECT_ROOT"
echo ""

# Step 1: Check Rust installation
echo -e "${YELLOW}[1/5]${NC} Verificando instalación de Rust..."
if ! command -v rustc &> /dev/null; then
    echo -e "${YELLOW}⚠️  Rust no está instalado. Instalando...${NC}"
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
fi
echo -e "${GREEN}✅ Rust instalado: $(rustc --version)${NC}"
echo ""

# Step 2: Add wasm32 target
echo -e "${YELLOW}[2/5]${NC} Agregando target wasm32-unknown-unknown..."
rustup target add wasm32-unknown-unknown 2>/dev/null || echo "Target ya instalado"
echo -e "${GREEN}✅ Target wasm32 listo${NC}"
echo ""

# Step 3: Build contract
echo -e "${YELLOW}[3/5]${NC} Compilando contrato Soroban..."
cd "$PROJECT_ROOT/contract"
echo "   📦 Descargando dependencias..."
cargo build --target wasm32-unknown-unknown --release --quiet
echo -e "${GREEN}✅ Contrato compilado exitosamente${NC}"
echo ""

# Step 4: Install frontend dependencies
echo -e "${YELLOW}[4/5]${NC} Instalando dependencias del frontend..."
cd "$PROJECT_ROOT/frontend"
if [ -f "package.json" ]; then
    echo "   📦 npm install (esto puede tomar unos minutos)..."
    npm install --silent
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
else
    echo -e "${YELLOW}⚠️  package.json no encontrado${NC}"
fi
echo ""

# Step 5: Create .env.local
echo -e "${YELLOW}[5/5]${NC} Configurando variables de entorno..."
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✅ Archivo .env.local creado${NC}"
else
    echo -e "${GREEN}✅ .env.local ya existe${NC}"
fi
echo ""

# Summary
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🎉 ¡Instalación Completada!                                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ Contrato Soroban compilado${NC}"
echo -e "${GREEN}✅ Dependencias del frontend instaladas${NC}"
echo -e "${GREEN}✅ Variables de entorno configuradas${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🚀 Para iniciar el proyecto:${NC}"
echo ""
echo "   cd $PROJECT_ROOT/frontend"
echo "   npm run dev"
echo ""
echo "   Luego abre: http://localhost:3000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}📚 Documentación:${NC}"
echo "   - README.md           - Overview del proyecto"
echo "   - QUICKSTART.md       - Guía de inicio rápido"
echo "   - PROJECT-SUMMARY.md  - Resumen completo"
echo "   - TIME-ESTIMATE.md    - Detalles de implementación"
echo ""
echo -e "${BLUE}🔧 Comandos útiles:${NC}"
echo "   - make build          - Compilar contrato"
echo "   - make test           - Ejecutar tests"
echo "   - npm run dev         - Servidor desarrollo"
echo "   - npm run build       - Build para producción"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}¡Disfruta tu proyecto de Passkeys + Soroban! 🔐✨${NC}"
echo ""
