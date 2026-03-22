import { useCallback, useState } from 'react';
import { getContractId, hasContract, invokeSorobanRead, invokeSorobanWrite } from '@/lib/soroban-client';
import { useWallet } from '@/contexts/WalletContext';

const TREASURY_KEY = 'smarttrip_treasury_balance';
const RATE_KEY = 'smarttrip_treasury_rate';

export function useTreasury() {
  const { account } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [commissionRateBps, setCommissionRateBps] = useState<number>(300);

  const loadTreasury = useCallback(async () => {
    const treasuryContractId = getContractId('treasury');
    if (treasuryContractId && hasContract('treasury') && account?.publicKey) {
      try {
        const [chainBalance, chainRate] = await Promise.all([
          invokeSorobanRead(treasuryContractId, 'get_balance', [], account.publicKey),
          invokeSorobanRead(treasuryContractId, 'get_commission_rate', [], account.publicKey),
        ]);

        if (typeof chainBalance === 'number') {
          const parsedBalance = chainBalance / 10_000_000;
          setBalance(parsedBalance);
          localStorage.setItem(TREASURY_KEY, String(parsedBalance));
        }

        if (typeof chainRate === 'number') {
          setCommissionRateBps(chainRate);
          localStorage.setItem(RATE_KEY, String(chainRate));
        }

        return;
      } catch (error) {
        console.warn('No se pudo cargar treasury on-chain, usando respaldo local', error);
      }
    }

    const rawBalance = localStorage.getItem(TREASURY_KEY);
    const rawRate = localStorage.getItem(RATE_KEY);
    setBalance(rawBalance ? Number(rawBalance) : 0);
    setCommissionRateBps(rawRate ? Number(rawRate) : 300);
  }, [account?.publicKey]);

  const depositCommission = useCallback(
    (amount: number) => {
      const treasuryContractId = getContractId('treasury');
      if (treasuryContractId && hasContract('treasury') && account?.publicKey) {
        invokeSorobanWrite(
          treasuryContractId,
          'deposit_commission',
          [Math.floor(amount * 10_000_000), 1],
          account.publicKey
        ).catch((error) => {
          console.warn('No se pudo depositar on-chain, manteniendo respaldo local', error);
        });
      }

      const next = balance + amount;
      localStorage.setItem(TREASURY_KEY, String(next));
      setBalance(next);
      return next;
    },
    [balance]
  );

  const setCommissionRate = useCallback((rate: number) => {
    if (rate > 500 || rate < 0) {
      throw new Error('La comision debe estar entre 0 y 500 bps');
    }
    const treasuryContractId = getContractId('treasury');
    if (treasuryContractId && hasContract('treasury') && account?.publicKey) {
      invokeSorobanWrite(
        treasuryContractId,
        'set_commission_rate',
        [rate],
        account.publicKey
      ).catch((error) => {
        console.warn('No se pudo actualizar rate on-chain, manteniendo respaldo local', error);
      });
    }

    localStorage.setItem(RATE_KEY, String(rate));
    setCommissionRateBps(rate);
  }, [account?.publicKey]);

  return {
    balance,
    commissionRate: commissionRateBps,
    loadTreasury,
    depositCommission,
    setCommissionRate,
  };
}
