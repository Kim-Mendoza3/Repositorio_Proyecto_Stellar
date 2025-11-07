import {
  Keypair,
  SorobanRpc,
  TransactionBuilder,
  Account,
  Operation,
  Address,
  hash,
  xdr,
  StrKey,
} from '@stellar/stellar-sdk';
import base64url from 'base64url';

// Configuración de red
export const getRpcUrl = () => {
  return process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
};

export const getNetworkPassphrase = () => {
  return process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015";
};

export const getFactoryContractId = () => {
  return process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ID;
};

export const getContractAddress = () => {
  return process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
};

// Cliente RPC
export const rpc = new SorobanRpc.Server(getRpcUrl());

/**
 * Despliega una nueva cuenta WebAuthn usando el contrato directo (sin factory por ahora)
 */
export async function deployWebAuthnAccount(
  bundlerKey: Keypair,
  contractSalt: Buffer,
  publicKey: Buffer
): Promise<string> {
  // Por ahora, usamos el contrato directo ya desplegado
  const contractId = getContractAddress();
  if (!contractId) {
    throw new Error('Contract address no configurado');
  }

  // En una implementación completa con factory, aquí desplegaríamos una nueva instancia
  // Por ahora, devolvemos el contrato existente para testing
  console.log('🔧 Usando contrato existente para demo:', contractId);
  console.log('📝 Contract Salt:', contractSalt.toString('hex'));
  console.log('🔑 Public Key:', publicKey.toString('hex'));

  return contractId;
}

/**
 * Construye una transacción de autorización para WebAuthn (simplificado para demo)
 */
export async function buildAuthTransaction(
  bundlerKey: Keypair,
  accountContractId: string,
  challenge: Buffer
): Promise<{
  authHash: Buffer;
  lastLedger: number;
}> {
  // Obtener el último ledger
  const ledgerResponse = await rpc.getLatestLedger();
  const lastLedger = ledgerResponse.sequence;

  // Para demo, usamos el challenge directamente como authHash
  const authHash = challenge;

  console.log('🔗 Auth transaction built:', {
    accountContractId,
    authHash: authHash.toString('hex'),
    lastLedger
  });

  return {
    authHash,
    lastLedger
  };
}

/**
 * Procesa una firma WebAuthn (simplificado para demo)
 */
export async function processWebAuthnSignature(
  accountContractId: string,
  webAuthnSignature: {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
  }
): Promise<any> {
  console.log('🔐 Processing WebAuthn signature:', {
    accountContractId,
    authenticatorData: webAuthnSignature.authenticatorData.substring(0, 32) + '...',
    clientDataJSON: webAuthnSignature.clientDataJSON.substring(0, 32) + '...',
    signature: webAuthnSignature.signature.substring(0, 32) + '...',
  });

  // En una implementación completa, aquí verificaríamos la firma contra el contrato
  // Por ahora, simulamos éxito
  return {
    success: true,
    transactionId: 'demo-tx-' + Date.now(),
    accountAddress: accountContractId
  };
}

/**
 * Valida la configuración de Stellar
 */
export const validateStellarConfig = () => {
  const rpcUrl = getRpcUrl();
  const networkPassphrase = getNetworkPassphrase();
  const contractId = getContractAddress();
  
  if (!contractId) {
    throw new Error('CONTRACT_ADDRESS no configurado. Despliega el contrato primero.');
  }
  
  try {
    Address.fromString(contractId);
  } catch (error) {
    throw new Error('CONTRACT_ADDRESS inválido. Debe ser una dirección Stellar válida.');
  }
  
  return {
    rpcUrl,
    networkPassphrase,
    contractId
  };
};