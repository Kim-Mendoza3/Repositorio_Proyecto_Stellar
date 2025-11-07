// Test script for request-loan API logic (compatible with Node 10)

// Mock configuration
const MOCK_POOL_BALANCE = 100000000000; // 10,000 USDC in stroops
const MIN_CREDIT_SCORE = 700;
const COOLDOWN_PERIOD = 86400; // 24 hours in seconds
const MAX_LOAN_AMOUNT = 20000000000; // 2,000 USDC in stroops
const MIN_LOAN_AMOUNT = 500000000;   // 50 USDC in stroops

// Mock loan history
const MOCK_LOAN_HISTORY = {
  'GDRXE2BQUC2AOYSR7YQCLFQ7NOPQJBBQQY2YVMHM5YRIHVQMGDDDGKMC': [
    {
      recipient: 'GDRXE2BQUC2AOYSR7YQCLFQ7NOPQJBBQQY2YVMHM5YRIHVQMGDDDGKMC',
      amount: 2000000000, // 200 USDC
      credit_score: 780,
      timestamp: Date.now() - 86400000, // 1 day ago
      transaction_hash: 'abc123def456'
    }
  ]
};

// Mock pool balance tracker
let currentPoolBalance = MOCK_POOL_BALANCE;

function generateTransactionHash() {
  const chars = 'abcdef0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateLoanId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'LOAN_';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function calculateInterestRate(creditScore, purpose) {
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

function calculateRepaymentDate(repaymentPlan) {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000; // 1 day in milliseconds
  
  switch (repaymentPlan) {
    case 'weekly': return now + (7 * day);
    case 'bi_weekly': return now + (14 * day);
    case 'monthly': return now + (30 * day);
    default: return now + (30 * day);
  }
}

function validateLoanRequest(request) {
  const errors = [];
  
  // Validate address
  if (!request.user_address || !request.user_address.startsWith('G') || request.user_address.length !== 56) {
    errors.push('Invalid Stellar address format');
  }
  
  // Validate amount
  if (!request.amount || typeof request.amount !== 'number') {
    errors.push('Amount is required and must be a number');
  } else if (request.amount < MIN_LOAN_AMOUNT) {
    errors.push('Minimum loan amount is ' + (MIN_LOAN_AMOUNT / 10000000) + ' USDC');
  } else if (request.amount > MAX_LOAN_AMOUNT) {
    errors.push('Maximum loan amount is ' + (MAX_LOAN_AMOUNT / 10000000) + ' USDC');
  }
  
  // Validate credit score
  if (!request.credit_score || typeof request.credit_score !== 'number') {
    errors.push('Credit score is required and must be a number');
  } else if (request.credit_score < 500 || request.credit_score > 850) {
    errors.push('Credit score must be between 500 and 850');
  }
  
  // Validate purpose
  const validPurposes = ['emergency', 'business', 'personal', 'education'];
  if (!request.purpose || validPurposes.indexOf(request.purpose) === -1) {
    errors.push('Purpose must be one of: emergency, business, personal, education');
  }
  
  // Validate repayment plan
  const validPlans = ['weekly', 'bi_weekly', 'monthly'];
  if (!request.repayment_plan || validPlans.indexOf(request.repayment_plan) === -1) {
    errors.push('Repayment plan must be one of: weekly, bi_weekly, monthly');
  }
  
  return errors;
}

function checkEligibility(userAddress, creditScore, amount) {
  // Check credit score
  if (creditScore < MIN_CREDIT_SCORE) {
    return { eligible: false, reason: 'Credit score ' + creditScore + ' is below minimum requirement of ' + MIN_CREDIT_SCORE };
  }
  
  // Check pool funds
  if (amount > currentPoolBalance) {
    return { eligible: false, reason: 'Insufficient funds in loan pool' };
  }
  
  // Check 24h cooldown
  const userHistory = MOCK_LOAN_HISTORY[userAddress] || [];
  if (userHistory.length > 0) {
    const lastLoan = userHistory[userHistory.length - 1];
    const timeSinceLastLoan = (Date.now() - lastLoan.timestamp) / 1000;
    
    if (timeSinceLastLoan < COOLDOWN_PERIOD) {
      const hoursRemaining = Math.ceil((COOLDOWN_PERIOD - timeSinceLastLoan) / 3600);
      return { eligible: false, reason: 'Must wait ' + hoursRemaining + ' more hours before requesting another loan' };
    }
  }
  
  return { eligible: true };
}

function processLoanRequest(request) {
  // Validate request
  const validationErrors = validateLoanRequest(request);
  if (validationErrors.length > 0) {
    return {
      success: false,
      error: 'Validation failed',
      validation_errors: validationErrors
    };
  }
  
  // Check eligibility
  const eligibilityCheck = checkEligibility(request.user_address, request.credit_score, request.amount);
  
  if (!eligibilityCheck.eligible) {
    return {
      success: false,
      error: eligibilityCheck.reason
    };
  }
  
  // Generate loan details
  const transactionHash = generateTransactionHash();
  const loanId = generateLoanId();
  const interestRate = calculateInterestRate(request.credit_score, request.purpose);
  const repaymentDueDate = calculateRepaymentDate(request.repayment_plan);
  const timestamp = Date.now();
  
  // Update mock pool balance
  currentPoolBalance -= request.amount;
  
  // Add to user's loan history
  if (!MOCK_LOAN_HISTORY[request.user_address]) {
    MOCK_LOAN_HISTORY[request.user_address] = [];
  }
  
  MOCK_LOAN_HISTORY[request.user_address].push({
    recipient: request.user_address,
    amount: request.amount,
    credit_score: request.credit_score,
    timestamp: timestamp,
    transaction_hash: transactionHash,
    loan_id: loanId,
    purpose: request.purpose,
    interest_rate: interestRate,
    repayment_plan: request.repayment_plan,
    repayment_due_date: repaymentDueDate
  });
  
  return {
    success: true,
    transaction_hash: transactionHash,
    loan_id: loanId,
    amount: request.amount,
    recipient: request.user_address,
    timestamp: timestamp,
    interest_rate: interestRate,
    repayment_due_date: repaymentDueDate
  };
}

// Test cases
console.log('=== Testing Loan Request Processing ===\\n');

// Test 1: Valid loan request
console.log('Test 1: Valid loan request (good credit, eligible user)');
const test1 = processLoanRequest({
  user_address: 'GAXYZ123456789ABCDEF123456789ABCDEF123456789ABCDEF123456',
  amount: 10000000000, // 1000 USDC
  credit_score: 750,
  purpose: 'business',
  repayment_plan: 'monthly'
});
console.log('Success:', test1.success);
if (test1.success) {
  console.log('Loan ID:', test1.loan_id);
  console.log('Amount:', test1.amount / 10000000, 'USDC');
  console.log('Interest Rate:', (test1.interest_rate * 100).toFixed(1) + '%');
  console.log('Transaction Hash:', test1.transaction_hash.substring(0, 16) + '...');
} else {
  console.log('Error:', test1.error);
  if (test1.validation_errors) {
    console.log('Validation Errors:', test1.validation_errors);
  }
}
console.log('Remaining Pool Balance:', (currentPoolBalance / 10000000), 'USDC');
console.log('');

// Test 2: Low credit score (should fail)
console.log('Test 2: Low credit score (should fail)');
const test2 = processLoanRequest({
  user_address: 'GBXYZ123456789ABCDEF123456789ABCDEF123456789ABCDEF123456',
  amount: 5000000000, // 500 USDC
  credit_score: 650, // Below 700
  purpose: 'personal',
  repayment_plan: 'monthly'
});
console.log('Success:', test2.success);
console.log('Error:', test2.error);
console.log('');

// Test 3: Amount too high (should fail)
console.log('Test 3: Amount too high (should fail)');
const test3 = processLoanRequest({
  user_address: 'GCXYZ123456789ABCDEF123456789ABCDEF123456789ABCDEF123456',
  amount: 25000000000, // 2500 USDC (above 2000 limit)
  credit_score: 800,
  purpose: 'emergency',
  repayment_plan: 'weekly'
});
console.log('Success:', test3.success);
console.log('Error:', test3.error);
if (test3.validation_errors) {
  console.log('Validation Errors:', test3.validation_errors);
}
console.log('');

// Test 4: User with recent loan (cooldown period)
console.log('Test 4: User with recent loan (cooldown period)');
const test4 = processLoanRequest({
  user_address: 'GDRXE2BQUC2AOYSR7YQCLFQ7NOPQJBBQQY2YVMHM5YRIHVQMGDDDGKMC', // Has recent loan
  amount: 8000000000, // 800 USDC
  credit_score: 780,
  purpose: 'education',
  repayment_plan: 'bi_weekly'
});
console.log('Success:', test4.success);
console.log('Error:', test4.error);
console.log('');

// Test 5: Invalid data (validation errors)
console.log('Test 5: Invalid data (validation errors)');
const test5 = processLoanRequest({
  user_address: 'INVALID_ADDRESS',
  amount: 'not a number',
  credit_score: 1000, // Above 850
  purpose: 'invalid_purpose',
  repayment_plan: 'invalid_plan'
});
console.log('Success:', test5.success);
console.log('Error:', test5.error);
console.log('Validation Errors:', test5.validation_errors);
console.log('');

// Test 6: Excellent credit with education purpose (best rate)
console.log('Test 6: Excellent credit with education purpose (best rate)');
const test6 = processLoanRequest({
  user_address: 'GDXYZ123456789ABCDEF123456789ABCDEF123456789ABCDEF123456',
  amount: 15000000000, // 1500 USDC
  credit_score: 820,
  purpose: 'education',
  repayment_plan: 'monthly'
});
console.log('Success:', test6.success);
if (test6.success) {
  console.log('Interest Rate:', (test6.interest_rate * 100).toFixed(1) + '% (best rate for education + excellent credit)');
  console.log('Amount:', test6.amount / 10000000, 'USDC');
} else {
  console.log('Error:', test6.error);
}
console.log('Final Pool Balance:', (currentPoolBalance / 10000000), 'USDC');
console.log('');

console.log('=== All loan request tests completed ===');