// Test script for loan API logic (compatible with Node 10)
const fs = require('fs');

// Mock data structure
const MOCK_LOAN_HISTORY = {
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

function calculateCreditScore(userAddress) {
  // Mock credit score calculation based on address
  let hash = userAddress.split('').reduce(function(a, b) {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Generate score between 500-850
  return 500 + Math.abs(hash % 351);
}

function checkEligibility(userAddress, creditScore) {
  const history = MOCK_LOAN_HISTORY[userAddress] || [];
  
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

function getLoanData(userAddress) {
  // Validate address format (basic validation)
  if (!userAddress.startsWith('G') || userAddress.length !== 56) {
    return { error: 'Invalid Stellar address format' };
  }
  
  // Get mock data
  const loanHistory = MOCK_LOAN_HISTORY[userAddress] || [];
  const creditScore = calculateCreditScore(userAddress);
  const eligibilityCheck = checkEligibility(userAddress, creditScore);
  
  const lastLoanTimestamp = loanHistory.length > 0 
    ? loanHistory[loanHistory.length - 1].timestamp 
    : null;
  
  return {
    user_address: userAddress,
    loan_history: loanHistory,
    pool_balance: MOCK_POOL_BALANCE,
    is_eligible: eligibilityCheck.eligible,
    last_loan_timestamp: lastLoanTimestamp,
    credit_score: creditScore,
    cooldown_remaining: eligibilityCheck.cooldownRemaining
  };
}

// Test cases
console.log('=== Testing Loan API Logic ===\n');

// Test 1: User with loan history (should have cooldown)
console.log('Test 1: User with recent loan history');
const test1 = getLoanData('GDRXE2BQUC2AOYSR7YQCLFQ7NOPQJBBQQY2YVMHM5YRIHVQMGDDDGKMC');
console.log('Address:', test1.user_address);
console.log('Credit Score:', test1.credit_score);
console.log('Eligible:', test1.is_eligible);
console.log('Loan History Count:', test1.loan_history.length);
console.log('Cooldown Remaining:', test1.cooldown_remaining, 'seconds');
console.log('Pool Balance:', test1.pool_balance / 10000000, 'USDC');
console.log('');

// Test 2: User with old loan history (should be eligible)
console.log('Test 2: User with old loan history');
const test2 = getLoanData('GDQ3STE6FVPXQ2TWOMMHWFYMH4IM5WZLQ6PPSV57HSDVP5PVKFICIIPB');
console.log('Address:', test2.user_address);
console.log('Credit Score:', test2.credit_score);
console.log('Eligible:', test2.is_eligible);
console.log('Loan History Count:', test2.loan_history.length);
console.log('Cooldown Remaining:', test2.cooldown_remaining, 'seconds');
console.log('');

// Test 3: New user (no history)
console.log('Test 3: New user with no history');
const test3 = getLoanData('GAXYZ123456789ABCDEF123456789ABCDEF123456789ABCDEF123456');
console.log('Address:', test3.user_address);
console.log('Credit Score:', test3.credit_score);
console.log('Eligible:', test3.is_eligible);
console.log('Loan History Count:', test3.loan_history.length);
console.log('Cooldown Remaining:', test3.cooldown_remaining, 'seconds');
console.log('');

// Test 4: Invalid address
console.log('Test 4: Invalid address');
const test4 = getLoanData('INVALID_ADDRESS');
console.log('Result:', test4);
console.log('');

console.log('=== All tests completed ===');