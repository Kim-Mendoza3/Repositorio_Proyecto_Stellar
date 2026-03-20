# Script para probar el flujo de transacciones en Stellar Testnet
# Uso: .\test-transactions.ps1

Write-Host "🚀 Test de Transacciones Stellar" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Conexión a Testnet
Write-Host "1. Verificando conexión a Testnet..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://horizon-testnet.stellar.org/info" -Method Get -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Conexión a Testnet OK" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error conectando a Testnet: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Verificar dirección de operador
Write-Host "2. Verificando dirección de operador..." -ForegroundColor Yellow
$OPERATOR_ADDRESS = "GBUQWP3BOUZX34LOCALQVFSGHFTOJREM23NRHBK264KEXWFNVLB74OOO"
try {
    $accountResponse = Invoke-WebRequest -Uri "https://horizon-testnet.stellar.org/accounts/$OPERATOR_ADDRESS" -Method Get -UseBasicParsing -TimeoutSec 5
    $accountJson = $accountResponse.Content | ConvertFrom-Json
    Write-Host "✅ Dirección válida: $OPERATOR_ADDRESS" -ForegroundColor Green
    Write-Host "   Saldo: $($accountJson.balances[0].balance) XLM"
} catch {
    Write-Host "❌ Dirección inválida o no existe" -ForegroundColor Red
}

Write-Host ""

# Test 3: Verificar API local
Write-Host "3. Verificando ruta de API local..." -ForegroundColor Yellow
try {
    $apiResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/reservations" -Method Get -UseBasicParsing -TimeoutSec 5 -SkipHttpErrorCheck
    if ($apiResponse.StatusCode -eq 200 -or $apiResponse.StatusCode -eq 405) {
        Write-Host "✅ API accesible en localhost:3000" -ForegroundColor Green
    } else {
        Write-Host "⚠️  API retorna HTTP $($apiResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  API no responde" -ForegroundColor Yellow
    Write-Host "   Asegúrate de ejecutar: npm run dev" -ForegroundColor Yellow
}

Write-Host ""

# Test 4: Verificar dependencias
Write-Host "4. Verificando dependencias..." -ForegroundColor Yellow

# Node.js
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js no instalado" -ForegroundColor Red
}

# Paquetes npm
$frontendDir = Get-Location
if (Test-Path "$frontendDir/node_modules/@stellar/stellar-sdk") {
    Write-Host "✅ @stellar/stellar-sdk instalado" -ForegroundColor Green
} else {
    Write-Host "❌ @stellar/stellar-sdk no encontrado" -ForegroundColor Red
}

if (Test-Path "$frontendDir/node_modules/@stellar/freighter-api") {
    Write-Host "✅ @stellar/freighter-api instalado" -ForegroundColor Green
} else {
    Write-Host "❌ @stellar/freighter-api no encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ Pre-requisitos verificados" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:"
Write-Host "1. Abre http://localhost:3000"
Write-Host "2. Conecta Freighter Wallet"
Write-Host "3. Ve a 'Ver Viajes Disponibles'"
Write-Host "4. Haz clic en un viaje"
Write-Host "5. Haz clic en 'Reservar Ahora'"
Write-Host "6. Firma la transacción en Freighter"
Write-Host "7. Espera confirmación"
Write-Host ""
Write-Host "💡 Verificar transacción en:"
Write-Host "   https://stellar.expert/explorer/testnet/tx/{HASH}"
