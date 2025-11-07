import { NextRequest, NextResponse } from 'next/server';

// Mock data structure
interface TripRecord {
  recipient: string;
  amount: number;
  credit_score: number;
  timestamp: number;
  transaction_hash: string;
}

interface UserTripData {
  user_address: string;
  trip_history: TripRecord[];
  pool_balance: number;
  is_eligible: boolean;
  last_trip_timestamp: number | null;
  credit_score: number;
  cooldown_remaining: number; // seconds
}

// Mock trip history data
const MOCK_TRIP_HISTORY: Record<string, TripRecord[]> = {
  'GDRXE2BQUC2AOYSR7YQCLFQ7NOPQJBBQQY2YVMHM5YRIHVQMGDDDGKMC': [
    {
      recipient: 'GDRXE2BQUC2AOYSR7YQCLFQ7NOPQJBBQQY2YVMHM5YRIHVQMGDDDGKMC',
      amount: 2000000000, // 200 USDC
      credit_score: 780,
      timestamp: Date.now() - 86400000, // 1 day ago
      transaction_hash: 'abc123def456'
    }
  ],
  'GDQ3STE6FVPXQ2TWOMMHWFYMH4IM5WZLQ6PPSV57HSDVP5PVKFICIIPB': [
    {
      recipient: 'GDQ3STE6FVPXQ2TWOMMHWFYMH4IM5WZLQ6PPSV57HSDVP5PVKFICIIPB',
      amount: 5000000000, // 500 USDC
      credit_score: 750,
      timestamp: Date.now() - 172800000, // 2 days ago
      transaction_hash: 'def456ghi789'
    },
    {
      recipient: 'GDQ3STE6FVPXQ2TWOMMHWFYMH4IM5WZLQ6PPSV57HSDVP5PVKFICIIPB',
      amount: 3000000000, // 300 USDC
      credit_score: 760,
      timestamp: Date.now() - 604800000, // 7 days ago
      transaction_hash: 'ghi789jkl012'
    }
  ]
};

const MOCK_POOL_BALANCE = 100000000000; // 10,000 USDC
const MIN_CREDIT_SCORE = 700;
const COOLDOWN_PERIOD = 86400; // 24 hours in seconds

function calculateCreditScore(userAddress: string): number {
  // Mock credit score calculation based on address
  const hash = userAddress.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Generate score between 500-850
  return 500 + Math.abs(hash % 351);
}

function checkEligibility(userAddress: string, creditScore: number): { eligible: boolean, cooldownRemaining: number } {
  const history = MOCK_TRIP_HISTORY[userAddress] || [];
  
  // Check credit score
  if (creditScore < MIN_CREDIT_SCORE) {
    return { eligible: false, cooldownRemaining: 0 };
  }
  
  // Check 24h cooldown
  if (history.length > 0) {
    const lastLoan = history[history.length - 1];
    const timeSinceLastLoan = (Date.now() - lastLoan.timestamp) / 1000;
    
    if (timeSinceLastLoan < COOLDOWN_PERIOD) {
      return { 
        eligible: false, 
        cooldownRemaining: Math.ceil(COOLDOWN_PERIOD - timeSinceLastLoan)
      };
    }
  }
  
  return { eligible: true, cooldownRemaining: 0 };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('address');
    
    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address is required' },
        { status: 400 }
      );
    }
    
    // Validate address format (basic validation)
    if (!userAddress.startsWith('G') || userAddress.length !== 56) {
      return NextResponse.json(
        { error: 'Invalid Stellar address format' },
        { status: 400 }
      );
    }
    
    // Get mock data
    const loanHistory = MOCK_TRIP_HISTORY[userAddress] || [];
    const creditScore = calculateCreditScore(userAddress);
    const { eligible, cooldownRemaining } = checkEligibility(userAddress, creditScore);
    
    const lastLoanTimestamp = loanHistory.length > 0 
      ? loanHistory[loanHistory.length - 1].timestamp 
      : null;
    
    const response: UserTripData = {
      user_address: userAddress,
      trip_history: loanHistory,
      pool_balance: MOCK_POOL_BALANCE,
      is_eligible: eligible,
      last_trip_timestamp: lastLoanTimestamp,
      credit_score: creditScore,
      cooldown_remaining: cooldownRemaining
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error in get-loan-data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}