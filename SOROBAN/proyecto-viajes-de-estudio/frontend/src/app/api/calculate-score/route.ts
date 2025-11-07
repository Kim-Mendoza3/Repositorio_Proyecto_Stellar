import { NextRequest, NextResponse } from 'next/server';

// Income data structure for gig workers
interface IncomeData {
  monthly_earnings: number[];  // Last 6 months
  gig_platforms: string[];     // ['uber', 'deliveroo', 'freelancer', etc.]
  average_hours_per_week: number;
  years_experience: number;
  education_level: 'high_school' | 'bachelor' | 'master' | 'phd' | 'none';
  employment_type: 'full_time_gig' | 'part_time_gig' | 'mixed' | 'unemployed';
  bank_account_age_months: number;
  has_savings: boolean;
  debt_to_income_ratio: number; // 0.0 to 1.0
}

interface CreditScoreResult {
  credit_score: number;
  factors: {
    income_stability: number;    // 0-100
    income_level: number;        // 0-100  
    employment_history: number;  // 0-100
    financial_behavior: number;  // 0-100
    platform_diversity: number;  // 0-100
  };
  recommendation: string;
  trip_eligible: boolean;
  max_trip_amount: number;
}

function calculateIncomeStability(monthlyEarnings: number[]): number {
  if (monthlyEarnings.length < 3) return 0;
  
  const average = monthlyEarnings.reduce((a, b) => a + b, 0) / monthlyEarnings.length;
  const variance = monthlyEarnings.reduce((acc, earning) => 
    acc + Math.pow(earning - average, 2), 0) / monthlyEarnings.length;
  const stdDev = Math.sqrt(variance);
  
  // Lower standard deviation = higher stability (max 100)
  const coefficientOfVariation = average > 0 ? stdDev / average : 1;
  return Math.max(0, Math.min(100, 100 - (coefficientOfVariation * 100)));
}

function calculateIncomeLevel(monthlyEarnings: number[]): number {
  if (monthlyEarnings.length === 0) return 0;
  
  const average = monthlyEarnings.reduce((a, b) => a + b, 0) / monthlyEarnings.length;
  
  // Score based on income brackets (USD)
  if (average >= 5000) return 100;      // $5000+ = 100
  if (average >= 3000) return 80;       // $3000-4999 = 80
  if (average >= 2000) return 60;       // $2000-2999 = 60
  if (average >= 1000) return 40;       // $1000-1999 = 40
  if (average >= 500) return 20;        // $500-999 = 20
  return 10;                           // <$500 = 10
}

function calculateEmploymentHistory(yearsExperience: number, bankAccountAge: number): number {
  const experienceScore = Math.min(50, yearsExperience * 10); // Max 50 points
  const accountScore = Math.min(50, bankAccountAge * 2);      // Max 50 points (25 months)
  return experienceScore + accountScore;
}

function calculateFinancialBehavior(
  debtToIncomeRatio: number, 
  hasSavings: boolean,
  employmentType: string
): number {
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

function calculatePlatformDiversity(platforms: string[], hoursPerWeek: number): number {
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

function calculateCreditScore(incomeData: IncomeData): CreditScoreResult {
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
  
  // Weighted average (total possible: 550 points)
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
      ? incomeData.monthly_earnings.reduce((a, b) => a + b, 0) / incomeData.monthly_earnings.length
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
    recommendation,
    trip_eligible: isEligible,
    max_trip_amount: maxTripAmount
  };
}

export async function POST(request: NextRequest) {
  try {
    const incomeData: IncomeData = await request.json();
    
    // Validate required fields
    if (!incomeData.monthly_earnings || !Array.isArray(incomeData.monthly_earnings)) {
      return NextResponse.json(
        { error: 'monthly_earnings array is required' },
        { status: 400 }
      );
    }
    
    if (incomeData.monthly_earnings.length === 0) {
      return NextResponse.json(
        { error: 'At least one month of earnings data is required' },
        { status: 400 }
      );
    }
    
    // Validate numeric fields
    if (typeof incomeData.average_hours_per_week !== 'number' || 
        typeof incomeData.years_experience !== 'number' ||
        typeof incomeData.bank_account_age_months !== 'number' ||
        typeof incomeData.debt_to_income_ratio !== 'number') {
      return NextResponse.json(
        { error: 'Invalid numeric field types' },
        { status: 400 }
      );
    }
    
    // Calculate credit score
    const result = calculateCreditScore(incomeData);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error in calculate-score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Method not allowed. Use POST with income data.',
      example: {
        monthly_earnings: [2500, 2800, 2200, 2600, 2400, 2700],
        gig_platforms: ['uber', 'deliveroo'],
        average_hours_per_week: 35,
        years_experience: 2,
        education_level: 'bachelor',
        employment_type: 'full_time_gig',
        bank_account_age_months: 18,
        has_savings: true,
        debt_to_income_ratio: 0.3
      }
    },
    { status: 405 }
  );
}