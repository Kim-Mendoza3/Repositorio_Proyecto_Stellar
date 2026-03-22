import {
  Contract,
  Networks,
  SorobanRpc,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
} from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

type ContractDomain = 'trip' | 'badge' | 'reputation' | 'treasury';

const DEFAULT_RPC_URL = 'https://soroban-testnet.stellar.org';
const DEFAULT_NETWORK = Networks.TESTNET;

function getRpcUrl() {
  return process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || process.env.NEXT_PUBLIC_STELLAR_RPC_URL || DEFAULT_RPC_URL;
}

function getNetworkPassphrase() {
  return process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || DEFAULT_NETWORK;
}

export function getContractId(domain: ContractDomain): string | null {
  const fallback = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || null;

  switch (domain) {
    case 'trip':
      return process.env.NEXT_PUBLIC_TRIP_CONTRACT_ID || process.env.NEXT_PUBLIC_TRIPS_CONTRACT_ID || fallback;
    case 'badge':
      return process.env.NEXT_PUBLIC_BADGE_CONTRACT_ID || fallback;
    case 'reputation':
      return process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ID || fallback;
    case 'treasury':
      return process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ID || fallback;
    default:
      return fallback;
  }
}

export function hasContract(domain: ContractDomain): boolean {
  return !!getContractId(domain);
}

function toScValArg(value: unknown) {
  if (typeof value === 'string' && /^[GC][A-Z0-9]{55}$/.test(value)) {
    return nativeToScVal(value, { type: 'address' });
  }

  return nativeToScVal(value as never);
}

async function waitForTx(
  server: SorobanRpc.Server,
  txHash: string,
  maxAttempts = 30,
  delayMs = 1000
) {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await server.getTransaction(txHash);
    if (result.status !== 'NOT_FOUND') {
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error('Timeout esperando confirmacion de transaccion Soroban');
}

export async function invokeSorobanRead(
  contractId: string,
  method: string,
  args: unknown[],
  sourcePublicKey: string
): Promise<unknown> {
  const server = new SorobanRpc.Server(getRpcUrl());
  const sourceAccount = await server.getAccount(sourcePublicKey);
  const contract = new Contract(contractId);

  const tx = new TransactionBuilder(sourceAccount, {
    fee: '100000',
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(contract.call(method, ...args.map(toScValArg)))
    .setTimeout(30)
    .build();

  const simulation = await server.simulateTransaction(tx);

  if (SorobanRpc.Api.isSimulationError(simulation)) {
    throw new Error(`Error simulando ${method}: ${simulation.error}`);
  }

  return simulation.result?.retval ? scValToNative(simulation.result.retval) : null;
}

export async function invokeSorobanWrite(
  contractId: string,
  method: string,
  args: unknown[],
  sourcePublicKey: string
): Promise<unknown> {
  const server = new SorobanRpc.Server(getRpcUrl());
  const sourceAccount = await server.getAccount(sourcePublicKey);
  const contract = new Contract(contractId);

  const tx = new TransactionBuilder(sourceAccount, {
    fee: '100000',
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(contract.call(method, ...args.map(toScValArg)))
    .setTimeout(60)
    .build();

  const prepared = await server.prepareTransaction(tx);
  const signedResult = await signTransaction(prepared.toXDR(), {
    networkPassphrase: getNetworkPassphrase(),
  });

  const signedXdr = typeof signedResult === 'string' ? signedResult : signedResult.signedTxXdr;
  const signedTx = TransactionBuilder.fromXDR(signedXdr, getNetworkPassphrase());

  const sendResult = await server.sendTransaction(signedTx);
  if (sendResult.status === 'ERROR') {
    const detailedError = sendResult.errorResult
      ? JSON.stringify(sendResult.errorResult)
      : 'desconocido';
    throw new Error(`Error enviando tx Soroban: ${detailedError}`);
  }

  const finalResult = await waitForTx(server, sendResult.hash);
  if (finalResult.status !== 'SUCCESS') {
    throw new Error(`Transaccion Soroban fallo con estado ${finalResult.status}`);
  }

  return finalResult.returnValue ? scValToNative(finalResult.returnValue) : null;
}
