// Test script for calculate-score API logic (compatible with Node 10)

// Income data structure for gig workers
function calculateIncomeStability(monthlyEarnings) {
  if (monthlyEarnings.length < 3) return 0;
  
  const average = monthlyEarnings.reduce(function(a, b) { return a + b; }, 0) / monthlyEarnings.length;
  const variance = monthlyEarnings.reduce(function(acc, earning) {
    return acc + Math.pow(earning - average, 2);
  }, 0) / monthlyEarnings.length;
  const stdDev = Math.sqrt(variance);
  
  // Lower standard deviation = higher stability (max 100)
  const coefficientOfVariation = average > 0 ? stdDev / average : 1;
  return Math.max(0, Math.min(100, 100 - (coefficientOfVariation * 100)));
}

function calculateIncomeLevel(monthlyEarnings) {
  if (monthlyEarnings.length === 0) return 0;
  
  const average = monthlyEarnings.reduce(function(a, b) { return a + b; }, 0) / monthlyEarnings.length;
  
  // Score based on income brackets (USD)
  if (average >= 5000) return 100;      // $5000+ = 100
  if (average >= 3000) return 80;       // $3000-4999 = 80
  if (average >= 2000) return 60;       // $2000-2999 = 60
  if (average >= 1000) return 40;       // $1000-1999 = 40
  if (average >= 500) return 20;        // $500-999 = 20
  return 10;                           // <$500 = 10
}

function calculateEmploymentHistory(yearsExperience, bankAccountAge) {
  const experienceScore = Math.min(50, yearsExperience * 10); // Max 50 points
  const accountScore = Math.min(50, bankAccountAge * 2);      // Max 50 points (25 months)
  return experienceScore + accountScore;
}

function calculateFinancialBehavior(debtToIncomeRatio, hasSavings, employmentType) {
  let score = 0;
  
  // Debt to income ratio (40 points max)
  if (debtToIncomeRatio <= 0.2) score += 40;      // Very low debt
  else if (debtToIncomeRatio <= 0.4) score += 30; // Low debt
  else if (debtToIncomeRatio <= 0.6) score += 20; // Moderate debt
  else if (debtToIncomeRatio <= 0.8) score += 10; // High debt
  // Very high debt = 0 points
  
  // Savings (30 points max)
  if (hasSavings) score += 30;
  
  // Employment type (30 points max)
  switch (employmentType) {
    case 'full_time_gig': score += 30; break;
    case 'mixed': score += 20; break;
    case 'part_time_gig': score += 10; break;
    case 'unemployed': score += 0; break;
  }
  
  return Math.min(100, score);
}

function calculatePlatformDiversity(platforms, hoursPerWeek) {
  let score = 0;
  
  // Platform count (50 points max)
  const platformCount = platforms.length;
  if (platformCount >= 4) score += 50;
  else if (platformCount === 3) score += 40;
  else if (platformCount === 2) score += 25;
  else if (platformCount === 1) score += 10;
  
  // Hours commitment (50 points max)
  if (hoursPerWeek >= 40) score += 50;      // Full time
  else if (hoursPerWeek >= 30) score += 40; // Nearly full time
  else if (hoursPerWeek >= 20) score += 25; // Part time
  else if (hoursPerWeek >= 10) score += 15; // Casual
  else score += 5;                          // Very casual
  
  return Math.min(100, score);
}

function calculateCreditScore(incomeData) {
  // Calculate individual factors
  const incomeStability = calculateIncomeStability(incomeData.monthly_earnings);
  const incomeLevel = calculateIncomeLevel(incomeData.monthly_earnings);
  const employmentHistory = calculateEmploymentHistory(
    incomeData.years_experience, 
    incomeData.bank_account_age_months
  );
  const financialBehavior = calculateFinancialBehavior(
    incomeData.debt_to_income_ratio,
    incomeData.has_savings,
    incomeData.employment_type
  );
  const platformDiversity = calculatePlatformDiversity(
    incomeData.gig_platforms,
    incomeData.average_hours_per_week
  );
  
  // Education bonus (max 50 points)
  let educationBonus = 0;
  switch (incomeData.education_level) {
    case 'phd': educationBonus = 50; break;
    case 'master': educationBonus = 40; break;
    case 'bachelor': educationBonus = 30; break;
    case 'high_school': educationBonus = 20; break;
    case 'none': educationBonus = 0; break;
  }
  
  // Weighted average
  const totalScore = (
    incomeStability * 0.25 +      // 25%
    incomeLevel * 0.25 +          // 25%
    employmentHistory * 0.20 +    // 20%
    financialBehavior * 0.20 +    // 20%
    platformDiversity * 0.10 +    // 10%
    educationBonus * 0.20         // Education bonus
  );
  
  // Convert to credit score range (500-850)
  const creditScore = Math.round(500 + (totalScore / 100) * 350);
  const finalScore = Math.max(500, Math.min(850, creditScore));
  
  // Determine eligibility and max trip allocation
  const isEligible = finalScore >= 700;
  let maxTripAmount = 0;
  
  if (isEligible) {
    const avgIncome = incomeData.monthly_earnings.length > 0 
      ? incomeData.monthly_earnings.reduce(function(a, b) { return a + b; }, 0) / incomeData.monthly_earnings.length
      : 0;
    
  // Max trip allocation = 0.5 * monthly income, capped at $2000
  maxTripAmount = Math.min(2000, Math.round(avgIncome * 0.5));
  }
  
  // Generate recommendation
  let recommendation = '';
  if (finalScore >= 800) {
    recommendation = 'Excellent credit profile! You qualify for our best rates.';
  } else if (finalScore >= 750) {
    recommendation = 'Very good credit profile with low risk.';
  } else if (finalScore >= 700) {
  recommendation = 'Good credit profile. You qualify for trips/bookings.';
  } else if (finalScore >= 650) {
    recommendation = 'Fair credit. Consider improving income stability or reducing debt.';
  } else {
    recommendation = 'Poor credit. Focus on increasing income and building financial history.';
  }
  
  return {
    credit_score: finalScore,
    factors: {
      income_stability: Math.round(incomeStability),
      income_level: Math.round(incomeLevel),
      employment_history: Math.round(employmentHistory),
      financial_behavior: Math.round(financialBehavior),
      platform_diversity: Math.round(platformDiversity)
    },
    recommendation: recommendation,
    trip_eligible: isEligible,
    max_trip_amount: maxTripAmount
  };
}

// Test cases
console.log('=== Testing Credit Score Calculation ===\\n');

// Test 1: Excellent gig worker
console.log('Test 1: Excellent gig worker (high income, stable, educated)');
const test1 = calculateCreditScore({
  monthly_earnings: [4200, 4100, 4300, 4000, 4250, 4150],
  gig_platforms: ['uber', 'deliveroo', 'freelancer', 'fiverr'],
  average_hours_per_week: 45,
  years_experience: 4,
  education_level: 'bachelor',
  employment_type: 'full_time_gig',
  bank_account_age_months: 36,
  has_savings: true,
  debt_to_income_ratio: 0.15
});
console.log('Credit Score:', test1.credit_score);
console.log('Eligible for trip:', test1.trip_eligible);
console.log('Max allocation for trip:', test1.max_trip_amount);
console.log('Factors:', test1.factors);
console.log('Recommendation:', test1.recommendation);
console.log('');

// Test 2: Average gig worker
console.log('Test 2: Average gig worker (moderate income, some stability)');
const test2 = calculateCreditScore({
  monthly_earnings: [1800, 2200, 1900, 2100, 1750, 2000],
  gig_platforms: ['uber', 'deliveroo'],
  average_hours_per_week: 30,
  years_experience: 2,
  education_level: 'high_school',
  employment_type: 'part_time_gig',
  bank_account_age_months: 18,
  has_savings: false,
  debt_to_income_ratio: 0.45
});
console.log('Credit Score:', test2.credit_score);
console.log('Eligible for trip:', test2.trip_eligible);
console.log('Max allocation for trip:', test2.max_trip_amount);
console.log('Factors:', test2.factors);
console.log('Recommendation:', test2.recommendation);
console.log('');

// Test 3: Poor credit profile
console.log('Test 3: Poor credit profile (low income, unstable)');
const test3 = calculateCreditScore({
  monthly_earnings: [400, 800, 300, 600, 250, 500],
  gig_platforms: ['uber'],
  average_hours_per_week: 15,
  years_experience: 0.5,
  education_level: 'none',
  employment_type: 'part_time_gig',
  bank_account_age_months: 6,
  has_savings: false,
  debt_to_income_ratio: 0.8
});
console.log('Credit Score:', test3.credit_score);
console.log('Eligible for trip:', test3.trip_eligible);
console.log('Max allocation for trip:', test3.max_trip_amount);
console.log('Factors:', test3.factors);
console.log('Recommendation:', test3.recommendation);
console.log('');

// Test 4: High earner but unstable
console.log('Test 4: High earner but unstable income');
const test4 = calculateCreditScore({
  monthly_earnings: [6000, 1000, 8000, 500, 7500, 2000],
  gig_platforms: ['freelancer'],
  average_hours_per_week: 50,
  years_experience: 3,
  education_level: 'master',
  employment_type: 'full_time_gig',
  bank_account_age_months: 24,
  has_savings: true,
  debt_to_income_ratio: 0.2
});
console.log('Credit Score:', test4.credit_score);
console.log('Eligible for trip:', test4.trip_eligible);
console.log('Max allocation for trip:', test4.max_trip_amount);
console.log('Factors:', test4.factors);
console.log('Recommendation:', test4.recommendation);
console.log('');

console.log('=== All credit score tests completed ===');