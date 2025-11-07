import { NextRequest, NextResponse } from 'next/server';

// Trip request structure
interface TripRequest {
  user_address: string;
  amount: number;              // In stroops (7 decimals)
  credit_score: number;
  purpose: string;             // 'emergency' | 'business' | 'personal' | 'education'
  repayment_plan: 'weekly' | 'bi_weekly' | 'monthly';
}

interface TripResponse {
  success: boolean;
  transaction_hash?: string;
  trip_id?: string;
  amount?: number;
  recipient?: string;
  timestamp?: number;
  interest_rate?: number;
  repayment_due_date?: number;
  error?: string;
  validation_errors?: string[];
}

// Mock configuration (same as smart contract)
const MOCK_POOL_BALANCE = 100000000000; // 10,000 USDC in stroops
const MIN_CREDIT_SCORE = 700;
const COOLDOWN_PERIOD = 3600; // 1 hour in seconds (reduced for MVP demo)
const MAX_LOAN_AMOUNT = 20000000000; // 2,000 USDC in stroops
const MIN_LOAN_AMOUNT = 500000000;   // 50 USDC in stroops

// Mock loan history (empty for fresh start)
const MOCK_TRIP_HISTORY: Record<string, any[]> = {
  // No pre-existing loans for demo purposes
  // Users can request loans immediately without 24h restriction
};

// Mock pool balance tracker
let currentPoolBalance = MOCK_POOL_BALANCE;

function generateTransactionHash(): string {
  const chars = 'abcdef0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateTripId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'TRIP_';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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

function validateTripRequest(request: TripRequest): string[] {
  const errors: string[] = [];
  
  // Validate address
  if (!request.user_address || !request.user_address.startsWith('G') || request.user_address.length !== 56) {
    errors.push('Invalid Stellar address format');
  }
  
  // Validate amount
  if (!request.amount || typeof request.amount !== 'number') {
    errors.push('Amount is required and must be a number');
  } else if (request.amount < MIN_LOAN_AMOUNT) {
    errors.push(`Minimum trip amount is ${MIN_LOAN_AMOUNT / 10000000} USDC`);
  } else if (request.amount > MAX_LOAN_AMOUNT) {
    errors.push(`Maximum trip amount is ${MAX_LOAN_AMOUNT / 10000000} USDC`);
  }
  
  // Validate credit score
  if (!request.credit_score || typeof request.credit_score !== 'number') {
    errors.push('Credit score is required and must be a number');
  } else if (request.credit_score < 500 || request.credit_score > 850) {
    errors.push('Credit score must be between 500 and 850');
  }
  
  // Validate purpose
  const validPurposes = ['emergency', 'business', 'personal', 'education'];
  if (!request.purpose || !validPurposes.includes(request.purpose)) {
    errors.push('Purpose must be one of: emergency, business, personal, education');
  }
  
  // Validate repayment plan
  const validPlans = ['weekly', 'bi_weekly', 'monthly'];
  if (!request.repayment_plan || !validPlans.includes(request.repayment_plan)) {
    errors.push('Repayment plan must be one of: weekly, bi_weekly, monthly');
  }
  
  return errors;
}

function checkTripEligibility(userAddress: string, creditScore: number, amount: number): { eligible: boolean, reason?: string } {
  // Check credit score
  if (creditScore < MIN_CREDIT_SCORE) {
    return { eligible: false, reason: `Credit score ${creditScore} is below minimum requirement of ${MIN_CREDIT_SCORE}` };
  }
  
  // Check pool funds
  if (amount > currentPoolBalance) {
    return { eligible: false, reason: 'Insufficient funds in trip pool' };
  }
  
  // Skip cooldown check for MVP demo to allow multiple trips
  // This allows users to test the trip functionality multiple times
  // In production, implement proper cooldown logic with persistent storage
  // const userHistory = MOCK_LOAN_HISTORY[userAddress] || [];
  // Cooldown verification disabled for MVP demonstration
  
  return { eligible: true };
}

function processTripRequest(request: TripRequest): TripResponse {
  // Check eligibility
  const eligibilityCheck = checkTripEligibility(request.user_address, request.credit_score, request.amount);
  
  if (!eligibilityCheck.eligible) {
    return {
      success: false,
      error: eligibilityCheck.reason
    };
  }
  
  // Generate trip details
  const transactionHash = generateTransactionHash();
  const tripId = generateTripId();
  const interestRate = calculateInterestRate(request.credit_score, request.purpose);
  const repaymentDueDate = calculateRepaymentDate(request.repayment_plan);
  const timestamp = Date.now();
  
  // Update mock pool balance
  currentPoolBalance -= request.amount;
  
  // Add to user's trip history
  if (!MOCK_TRIP_HISTORY[request.user_address]) {
    MOCK_TRIP_HISTORY[request.user_address] = [];
  }

  MOCK_TRIP_HISTORY[request.user_address].push({
    recipient: request.user_address,
    amount: request.amount,
    credit_score: request.credit_score,
    timestamp: timestamp,
    transaction_hash: transactionHash,
    trip_id: tripId,
    purpose: request.purpose,
    interest_rate: interestRate,
    repayment_plan: request.repayment_plan,
    repayment_due_date: repaymentDueDate
  });
  
  return {
    success: true,
    transaction_hash: transactionHash,
    trip_id: tripId,
    amount: request.amount,
    recipient: request.user_address,
    timestamp: timestamp,
    interest_rate: interestRate,
    repayment_due_date: repaymentDueDate
  };
}

export async function POST(request: NextRequest) {
  try {
    const tripRequest: TripRequest = await request.json();
    
    // Validate request
    const validationErrors = validateTripRequest(tripRequest);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed',
          validation_errors: validationErrors 
        },
        { status: 400 }
      );
    }
    
    // Process trip
    const result = processTripRequest(tripRequest);
    
    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 422 });
    }
    
  } catch (error) {
    console.error('Error in request-trip:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Method not allowed. Use POST to request a loan.',
      current_pool_balance: currentPoolBalance,
      min_credit_score: MIN_CREDIT_SCORE,
      min_trip_amount: MIN_LOAN_AMOUNT,
      max_trip_amount: MAX_LOAN_AMOUNT,
      cooldown_period_hours: COOLDOWN_PERIOD / 3600,
      example: {
        user_address: 'GAXYZ123456789ABCDEF123456789ABCDEF123456789ABCDEF123456',
        amount: 10000000000, // 1000 USDC in stroops
        credit_score: 750,
        purpose: 'business',
        repayment_plan: 'monthly'
      }
    },
    { status: 405 }
  );
}

// Reset function for testing (not exposed in production)
export async function DELETE(request: NextRequest) {
  // Reset pool balance and clear loan history (for testing only)
  currentPoolBalance = MOCK_POOL_BALANCE;
  Object.keys(MOCK_TRIP_HISTORY).forEach(key => {
    delete MOCK_TRIP_HISTORY[key];
  });
  
  return NextResponse.json({
    success: true,
    message: 'Mock data reset',
    pool_balance: currentPoolBalance
  });
}