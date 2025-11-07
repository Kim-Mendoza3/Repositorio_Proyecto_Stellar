'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import CreditScoringFlow from '@/components/CreditScoringFlow';

/**
 * EBAS Credit Application Page (Protected)
 * Uses the real CreditScoringFlow component with real Stellar transactions
 */
export default function EBASCredit() {
  return (
    <AuthGuard>
      <CreditScoringFlow />
    </AuthGuard>
  );
}
