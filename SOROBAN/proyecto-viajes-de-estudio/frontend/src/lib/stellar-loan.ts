import { 
  SorobanRpc,
  Horizon,
  Keypair, 
  Networks,
  TransactionBuilder,
  Operation,
  Asset,
  Address,
  nativeToScVal,
  scValToNative,
  xdr,
  StrKey
} from '@stellar/stellar-sdk';

// Contract addresses from environment - Using official Stellar RPC endpoints
const RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org/';
const HORIZON_URL = process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';
// Accept either the original LOAN env var or the new TRIP env var for compatibility
const LOAN_CONTRACT_ID = process.env.NEXT_PUBLIC_LOAN_CONTRACT_ID || process.env.NEXT_PUBLIC_TRIP_CONTRACT_ID;
const TOKEN_CONTRACT_ID = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ID;

// Initialize Soroban server with timeout configuration (for smart contracts)
const sorobanServer = new SorobanRpc.Server(RPC_URL, {
  allowHttp: false,
  timeout: 30000, // 30 second timeout
});

// Initialize Horizon server for regular Stellar transactions
const horizonServer = new Horizon.Server(HORIZON_URL, {
  allowHttp: false,
});

export interface LoanRequest {
  user_address: string;
  amount: number;
  credit_score: number;
  purpose: string;
  repayment_plan: string;
}

export interface LoanResult {
  success: boolean;
  transaction_hash?: string;
  loan_id?: string;
  trip_id?: string;
  amount?: number;
  recipient?: string;
  timestamp?: number;
  interest_rate?: number;
  repayment_due_date?: number;
  error?: string;
}

/**
 * Execute a real trip/reservation transaction using native USDC transfers on Stellar testnet
 */
export async function executeRealLoan(loanRequest: LoanRequest): Promise<LoanResult> {
  try {
    console.log('🚀 Starting real USDC transfer...', {
      amount: loanRequest.amount,
      user: loanRequest.user_address,
      user_address_length: loanRequest.user_address.length,
      credit_score: loanRequest.credit_score
    });

    // Validate basic requirements
    if (loanRequest.credit_score < 700) {
      throw new Error('Credit score must be at least 700');
    }

    // Clean and validate destination address
    let userAddress = loanRequest.user_address.trim();
    
    // If address is too long, take first 56 characters (standard Stellar address length)
    if (userAddress.length > 56) {
      console.log('⚠️ Address too long, truncating:', userAddress.length, '→ 56');
      userAddress = userAddress.substring(0, 56);
    }
    
    // Validate destination address format
    if (!StrKey.isValidEd25519PublicKey(userAddress)) {
      console.error('❌ Invalid Stellar address provided:', userAddress);
      throw new Error(`Invalid Stellar address: ${userAddress}. Must be a valid Ed25519 public key (starts with G)`);
    }

    console.log('✅ Using destination address:', userAddress);

    // For demo purposes, we'll create a keypair for the pool admin
    // In production, this should be securely managed
    const poolAdmin = Keypair.random();
    
    console.log('🔑 Created pool admin:', poolAdmin.publicKey());
    
    // Fund the pool admin account from friendbot (testnet only)
    await fundAccount(poolAdmin.publicKey());
    
    // Also fund the destination account if it doesn't exist
    console.log('🔍 Checking if destination account exists...');
    const destinationExists = await checkAccountExists(userAddress);
    if (!destinationExists) {
      console.log('🆕 Creating destination account...');
      await fundAccount(userAddress);
    }
    
    // Get account info from Horizon
    let account;
    try {
      account = await horizonServer.loadAccount(poolAdmin.publicKey());
    } catch (error) {
      console.error('Failed to load account from Horizon:', error);
      throw new Error('Unable to connect to Stellar network. Please try again later.');
    }
    
    // Calculate loan parameters
    const interestRate = calculateInterestRate(loanRequest.credit_score, loanRequest.purpose);
    const repaymentDate = calculateRepaymentDate(loanRequest.repayment_plan);
    
    // Create native XLM transfer (simpler than USDC for MVP)
    // Convert amount from USDC stroops to XLM lumens
    // Use reasonable amounts: 50-500 XLM to avoid reserve issues
    // Stellar requires 2 XLM base reserve + 0.5 XLM per entry
    const usdcAmount = loanRequest.amount / 10000000; // Convert stroops to USDC
    
    // Scale down: 1 USDC = 0.5 XLM (instead of 0.1), capped at 500 XLM max
    const xlmAmountRaw = Math.min(usdcAmount * 0.5, 500); // Max 500 XLM
    const xlmAmount = xlmAmountRaw.toFixed(7);
    
    console.log('💰 Transferring', xlmAmount, 'XLM (~$', (parseFloat(xlmAmount) * 2).toFixed(2), 'USDC equivalent) to', userAddress);
    
    // Build transaction to transfer XLM
    const transaction = new TransactionBuilder(account, {
      fee: '10000', // Standard fee
      networkPassphrase: NETWORK_PASSPHRASE,
    })
    .addOperation(
      Operation.payment({
        destination: userAddress, // Use cleaned address
        asset: Asset.native(),
        amount: xlmAmount
      })
    )
    .setTimeout(300)
    .build();

    // Sign transaction
    transaction.sign(poolAdmin);

    // Submit transaction using Horizon
    console.log('📤 Submitting XLM transfer to Stellar...');
    let result;
    try {
      result = await horizonServer.submitTransaction(transaction);
      console.log('✅ Transaction submitted successfully!', result.hash);
    } catch (error: any) {
      console.error('❌ Transaction submission failed:', error);
      
      // Parse Horizon error response for better debugging
      if (error.response?.data) {
        const errorData = error.response.data;
        console.error('📋 Horizon Error Details:', JSON.stringify(errorData, null, 2));
        
        if (errorData.extras?.result_codes) {
          const codes = errorData.extras.result_codes;
          const txCode = codes.transaction;
          const opsCode = codes.operations?.[0];
          
          // Provide user-friendly error messages for common Horizon errors
          let userMessage = 'Transaction failed';
          
          if (txCode === 'tx_insufficient_balance' || opsCode === 'op_underfunded') {
            userMessage = 'Insufficient balance. The account does not have enough XLM to complete this transaction (minimum 2 XLM reserve required).';
          } else if (txCode === 'tx_bad_seq') {
            userMessage = 'Transaction sequence error. Please try again.';
          } else if (opsCode === 'op_no_destination') {
            userMessage = 'Destination account does not exist. Please verify the address.';
          } else if (opsCode === 'op_line_full') {
            userMessage = 'Destination account cannot receive more assets.';
          } else if (txCode === 'tx_failed') {
            userMessage = `Transaction rejected by network. Operation error: ${opsCode || 'unknown'}`;
          }
          
          throw new Error(userMessage);
        }
      }
      
      throw new Error(`Transaction failed: ${error.message || 'Unknown error'}`);
    }

    // Transaction was successful (Horizon returns immediately when successful)
    const hash = result.hash;
    console.log('✅ XLM transfer confirmed!', hash);
    
    // Generate loan/trip ID from transaction hash
    const loanId = `LOAN_${hash.substring(0, 8).toUpperCase()}`;
    const tripId = `TRIP_${hash.substring(0, 8).toUpperCase()}`;
    
    return {
      success: true,
      transaction_hash: hash,
      loan_id: loanId,
      trip_id: tripId,
      amount: loanRequest.amount,
      recipient: userAddress,
      timestamp: Date.now(),
      interest_rate: interestRate,
      repayment_due_date: repaymentDate
    };
    
  } catch (error) {
    console.error('❌ XLM transfer failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Fund account using Stellar testnet friendbot with fallback endpoints
 */
async function fundAccount(publicKey: string): Promise<void> {
  const friendbotEndpoints = [
    'https://friendbot.stellar.org',
    'https://friendbot-testnet.stellar.org'
  ];
  
  try {
    console.log('💰 Funding account:', publicKey);
    
    for (const endpoint of friendbotEndpoints) {
      try {
        console.log(`🔄 Trying friendbot endpoint: ${endpoint}`);
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(`${endpoint}?addr=${publicKey}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log('✅ Account funded successfully');
          // Wait for the account to be created and ledger to update
          await new Promise(resolve => setTimeout(resolve, 3000));
          return;
        } else {
          const errorText = await response.text();
          console.warn(`Friendbot responded with ${response.status}: ${errorText}`);
        }
      } catch (endpointError) {
        console.warn(`Failed to reach ${endpoint}:`, endpointError);
        continue;
      }
    }
    
    console.warn('All friendbot endpoints failed, proceeding anyway');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  } catch (error) {
    console.warn('Friendbot error:', error);
    // Wait anyway in case account already exists
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

/**
 * Calculate interest rate based on credit score and purpose
 */
function calculateInterestRate(creditScore: number, purpose: string): number {
  let baseRate = 0.15; // 15% base APR
  
  // Credit score adjustment
  if (creditScore >= 800) baseRate = 0.08;      // 8% for excellent
  else if (creditScore >= 750) baseRate = 0.10; // 10% for very good
  else if (creditScore >= 700) baseRate = 0.12; // 12% for good
  
  // Purpose adjustment
  switch (purpose) {
    case 'emergency': baseRate += 0.01; break;   // +1% for emergency
    case 'business': baseRate -= 0.01; break;    // -1% for business
    case 'education': baseRate -= 0.02; break;   // -2% for education
    case 'personal': baseRate += 0.00; break;    // No change
  }
  
  return Math.max(0.05, Math.min(0.25, baseRate)); // Cap between 5% and 25%
}

/**
 * Calculate repayment due date based on plan
 */
function calculateRepaymentDate(repaymentPlan: string): number {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000; // 1 day in milliseconds
  
  switch (repaymentPlan) {
    case 'weekly': return now + (7 * day);
    case 'bi_weekly': return now + (14 * day);
    case 'monthly': return now + (30 * day);
    default: return now + (30 * day);
  }
}

/**
 * Check if account exists on Stellar
 */
export async function checkAccountExists(publicKey: string): Promise<boolean> {
  try {
    await horizonServer.loadAccount(publicKey);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get transaction details from Stellar using Horizon
 */
export async function getTransactionDetails(hash: string) {
  try {
    return await horizonServer.transactions().transaction(hash).call();
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }
}