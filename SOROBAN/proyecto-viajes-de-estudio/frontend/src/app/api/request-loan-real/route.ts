import { NextRequest, NextResponse } from 'next/server';
import { executeRealLoan, LoanRequest, LoanResult } from '@/lib/stellar-loan';

interface RequestBody extends LoanRequest {}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    
  // Validate request body
  const validationErrors = validateLoanRequest(body);
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        validation_errors: validationErrors
      }, { status: 400 });
    }

    console.log('🏦 Processing REAL trip request:', {
      user: body.user_address,
      amount: body.amount,
      credit_score: body.credit_score
    });

  // Execute real trip transaction on Stellar
  const result: LoanResult = await executeRealLoan(body);
    
    if (result.success) {
  console.log('✅ Real trip transaction successful:', result.transaction_hash);
      
      return NextResponse.json(result, { status: 201 });
    } else {
  console.error('❌ Real trip transaction failed:', result.error);
      
      return NextResponse.json({
        success: false,
        error: result.error || 'Loan processing failed'
      }, { status: 422 });
    }
    
  } catch (error) {
  console.error('🚨 API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function validateLoanRequest(request: RequestBody): string[] {
  const errors: string[] = [];
  
  // Validate address
  if (!request.user_address || !request.user_address.startsWith('G') || request.user_address.length !== 56) {
    errors.push('Invalid Stellar address format');
  }
  
  // Validate amount
  if (!request.amount || typeof request.amount !== 'number') {
    errors.push('Amount is required and must be a number');
  } else if (request.amount < 50 * 10000000) { // 50 USDC minimum
    errors.push('Minimum trip amount is 50 USDC');
  } else if (request.amount > 2000 * 10000000) { // 2000 USDC maximum
    errors.push('Maximum trip amount is 2000 USDC');
  }
  
  // Validate credit score
  if (!request.credit_score || typeof request.credit_score !== 'number') {
    errors.push('Credit score is required');
  } else if (request.credit_score < 300 || request.credit_score > 850) {
    errors.push('Credit score must be between 300 and 850');
    } else if (request.credit_score < 700) {
    errors.push('Minimum credit score of 700 required for trips');
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

// Enable CORS for development
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}