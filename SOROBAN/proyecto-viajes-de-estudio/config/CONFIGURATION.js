// ARCHIVO DE CONFIGURACIÓN - PERSONALIZA ESTOS VALORES
// Ubicación: frontend/src/hooks/useFreighterWallet.ts

// ======================================
// 🔧 CONFIGURACIÓN CRÍTICA
// ======================================

// 1. DIRECCIÓN DEL OPERADOR DE VIAJES
// Esta es la dirección donde se recibirán todos los pagos de los estudiantes
// CAMBIAR ESTA DIRECCIÓN A LA TUYA REAL
const TRIPS_OPERATOR_ADDRESS = 'GBUQWP3BOUZX34LOCALQVFSGHFTOJREM23NRHBK264KEXWFNVLB74OOO';
//                               ↑ REEMPLAZA CON TU DIRECCIÓN PÚBLICA DE TESTNET

// Para obtener tu dirección:
// 1. Ve a https://stellar.org/developers/testnet
// 2. Crea una cuenta de Testnet
// 3. Copia tu dirección pública (empieza con 'G')
// 4. Reemplaza en useFreighterWallet.ts línea 18


// ======================================
// 📊 PRECIOS DE PAQUETES
// Ubicación: frontend/src/components/TravelPackagesWithPayment.tsx
// ======================================

// Formato: 
// price: 3500,      // USD (para referencia)
// priceXLM: 35,     // XLM (CAMBIAR SEGÚN COTIZACIÓN)

// Cotización actual (referencia):
// 1 XLM ≈ $0.10 USD (varía según mercado)
// 
// Ejemplo:
// Si el viaje cuesta $3,500 USD
// Y 1 XLM ≈ $0.10 USD
// Entonces: $3,500 / $0.10 = 35,000 XLM

// ⚠️ IMPORTANTE: Actualizar precios según cotización actual


// ======================================
// 🌍 RED DE STELLAR
// ======================================

// TESTNET (para pruebas - SIN DINERO REAL):
NETWORK_PASSPHRASE = StellarSDK.Networks.TESTNET_NETWORK_PASSPHRASE;
TESTNET_SERVER = 'https://horizon-testnet.stellar.org';

// Para cambiar a MAINNET (dinero real):
// NETWORK_PASSPHRASE = StellarSDK.Networks.PUBLIC_NETWORK_PASSPHRASE;
// TESTNET_SERVER = 'https://horizon.stellar.org';
// ⚠️ SOLO CAMBIAR A MAINNET CUANDO ESTÉ COMPLETAMENTE LISTO


// ======================================
// 💰 COSTOS Y COMISIONES
// ======================================

BASE_FEE = 100; // Stroops (0.00001 XLM)
// Esto es el costo mínimo de una transacción en Stellar
// No cambies a menos que quieras acelerar transacciones


// ======================================
// ⏱️ TIMEOUTS
// ======================================

TIMEOUT = 300; // segundos (5 minutos)
// Tiempo máximo que espera una transacción para confirmarse
// Si no se confirma en este tiempo, se cancela


// ======================================
// 📋 CHECKLIST PARA PRODUCCIÓN
// ======================================

PRODUCCIÓN_CHECKLIST = `
  ☐ Dirección del operador configurada (no es ejemplo)
  ☐ Precios en XLM actualizados
  ☐ Probado pago completo en Testnet
  ☐ Verificado en Stellar Expert que aparezca transacción
  ☐ URL de la app configurada correctamente
  ☐ Freighter instalada en navegadores de usuarios
  ☐ Documentación compartida con maestro
  ☐ Prueba E2E: Login → Compra → Transacción
  ☐ Error handling para todos los casos
  ☐ Respuesta del servidor Horizon verificada
`;


// ======================================
// 🧪 EJEMPLO DE CONFIGURACIÓN REAL
// ======================================

EXAMPLE_PRODUCTION_CONFIG = {
  // Tu dirección (reemplaza con la tuya)
  operatorAddress: 'GDW3F3DQE4CVKXD47Z4VEL5D6T7WQZQ7XY8Z9A0B1C2D3E4F5G6H7I8J9K0',
  
  // Precios actualizados
  packages: {
    basic: {
      name: 'Paquete Básico',
      priceUSD: 3500,
      priceXLM: 35000  // Basado en cotización del día
    }
  },
  
  // Red a usar
  network: 'testnet',  // 'testnet' o 'mainnet'
  
  // Timeouts
  transactionTimeout: 300  // 5 minutos
};


// ======================================
// 🔗 RECURSOS ÚTILES
// ======================================

// Crear cuenta Testnet:
// https://stellar.org/developers/testnet

// Obtener XLM de prueba (Faucet):
// https://stellar.org/developers/testnet (al crear cuenta)

// Ver transacciones:
// https://stellar.expert/explorer/testnet

// Documentación Stellar SDK:
// https://developers.stellar.org/docs/tools/js-stellar-sdk

// Freighter Wallet:
// https://freighter.app

// Documentación Freighter API:
// https://docs.freighter.app
