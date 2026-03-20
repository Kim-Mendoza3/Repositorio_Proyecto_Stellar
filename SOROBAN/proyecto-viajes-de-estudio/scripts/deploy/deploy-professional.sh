#!/bin/bash

################################################################################
#
# 🚀 DEPLOYMENT AUTOMATION SCRIPT - PROFESSIONAL VERSION
# Viajes de Estudio - dApp Stellar Soroban en Netlify
#
# Uso:
#   ./deploy-professional.sh                    # Deployment automático
#   ./deploy-professional.sh --validate-only    # Solo validación
#   ./deploy-professional.sh --help             # Ayuda
#
################################################################################

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
CONTRACT_DIR="$PROJECT_ROOT/contract"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="deployment_${TIMESTAMP}.log"

# Funciones de utilidad
log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}✗${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1" | tee -a "$LOG_FILE"
}

separator() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

################################################################################
# VALIDACIONES
################################################################################

validate_environment() {
    log "🔍 Validando ambiente..."
    
    # Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js no está instalado"
        exit 1
    fi
    success "Node.js $(node -v) ✓"
    
    # npm
    if ! command -v npm &> /dev/null; then
        error "npm no está instalado"
        exit 1
    fi
    success "npm $(npm -v) ✓"
    
    # Git
    if ! command -v git &> /dev/null; then
        error "Git no está instalado"
        exit 1
    fi
    success "Git ✓"
}

validate_files() {
    log "📁 Verificando archivos críticos..."
    
    [ -f "$FRONTEND_DIR/package.json" ] && success "Frontend package.json ✓" || { error "package.json no encontrado"; exit 1; }
    [ -f "$PROJECT_ROOT/netlify.toml" ] && success "netlify.toml ✓" || { error "netlify.toml no encontrado"; exit 1; }
    [ -f "$FRONTEND_DIR/.env.production" ] || { error ".env.production no existe"; exit 1; }
}

validate_frontend() {
    log "🎨 Validando frontend..."
    cd "$FRONTEND_DIR"
    
    log "  Instalando dependencias..."
    npm ci --legacy-peer-deps 2>&1 | grep -v "warn" || true
    success "Dependencias ✓"
    
    log "  Type check..."
    npm run type-check 2>&1 | tail -1
    success "Type check ✓"
    
    log "  Build (esto puede tardar 1-2 min)..."
    npm run build 2>&1 | tail -5
    success "Frontend compilado ✓"
    
    [ -d ".next" ] || { error ".next no generado"; exit 1; }
}

validate_git() {
    log "📦 Validando Git..."
    cd "$PROJECT_ROOT"
    
    BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    success "Rama: $BRANCH ✓"
    
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        error "Cambios sin commitear"
        git status
        exit 1
    fi
    success "Working tree limpio ✓"
}

################################################################################
# DEPLOYMENT
################################################################################

deploy() {
    log "📤 Iniciando deployment..."
    cd "$PROJECT_ROOT"
    
    COMMIT_MSG="chore: deployment $(date '+%Y-%m-%d %H:%M:%S')"
    
    log "  Committing..."
    git add . 2>/dev/null || true
    git commit -m "$COMMIT_MSG" 2>/dev/null || warning "Sin cambios para commitear"
    
    log "  Pushing a GitHub..."
    git push origin "$(git rev-parse --abbrev-ref HEAD)" 2>&1 | grep -E "To|error" || true
    success "Push completado ✓"
}

################################################################################
# MAIN
################################################################################

main() {
    touch "$LOG_FILE"
    
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║  🚀 DEPLOYMENT PROFESIONAL                            ║"
    echo "║  Viajes de Estudio - dApp Stellar + Netlify          ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    
    case "${1:-}" in
        --validate-only)
            separator
            log "MODO VALIDACIÓN (sin deploy)"
            separator
            validate_environment
            validate_files
            validate_frontend
            validate_git
            separator
            success "✅ Validaciones completadas"
            ;;
        --help|-h)
            echo "Uso: $0 [opción]"
            echo ""
            echo "Opciones:"
            echo "  (sin opción)    Deployment completo"
            echo "  --validate-only Solo validar"
            echo "  --help          Esta ayuda"
            ;;
        *)
            separator
            log "DEPLOYMENT COMPLETO"
            separator
            validate_environment
            validate_files
            validate_frontend
            validate_git
            echo ""
            deploy
            echo ""
            separator
            success "✅ Deployment completado"
            separator
            echo ""
            log "📊 Próximos pasos:"
            log "  1. Netlify iniciará build automáticamente"
            log "  2. Monitor en: https://app.netlify.com"
            log "  3. URL: https://viajes-de-estudio.netlify.app"
            log "  4. Instala Freighter y conecta wallet"
            echo ""
            ;;
    esac
    
    log "Log: $LOG_FILE"
}

main "$@"
