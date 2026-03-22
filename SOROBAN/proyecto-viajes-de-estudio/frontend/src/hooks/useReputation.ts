import { useCallback, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { getContractId, hasContract, invokeSorobanRead, invokeSorobanWrite } from '@/lib/soroban-client';

interface ReputationState {
  score: number;
  actions: number;
}

function getStorageKey(wallet: string) {
  return `smarttrip_reputation_${wallet}`;
}

export function useReputation() {
  const { account } = useWallet();
  const [state, setState] = useState<ReputationState>({ score: 100, actions: 0 });

  const loadReputation = useCallback(async () => {
    if (!account?.publicKey) return;

    const reputationContractId = getContractId('reputation');
    if (reputationContractId && hasContract('reputation')) {
      try {
        const [score, actions] = await Promise.all([
          invokeSorobanRead(reputationContractId, 'get_reputation_score', [account.publicKey], account.publicKey),
          invokeSorobanRead(reputationContractId, 'get_action_history_count', [account.publicKey], account.publicKey),
        ]);

        if (typeof score === 'number' && typeof actions === 'number') {
          setState({ score, actions });
          localStorage.setItem(getStorageKey(account.publicKey), JSON.stringify({ score, actions }));
          return;
        }
      } catch (error) {
        console.warn('No se pudo cargar reputacion on-chain, usando respaldo local', error);
      }
    }

    const raw = localStorage.getItem(getStorageKey(account.publicKey));
    const parsed: ReputationState = raw ? JSON.parse(raw) : { score: 100, actions: 0 };
    setState(parsed);
  }, [account?.publicKey]);

  const recordAction = useCallback(
    (scoreChange: number) => {
      if (!account?.publicKey) {
        throw new Error('Wallet no conectada');
      }

      const reputationContractId = getContractId('reputation');
      if (reputationContractId && hasContract('reputation')) {
        invokeSorobanWrite(
          reputationContractId,
          'record_action',
          [account.publicKey, scoreChange >= 0 ? 1 : 2, scoreChange],
          account.publicKey
        ).catch((error) => {
          console.warn('No se pudo registrar accion on-chain, se mantiene respaldo local', error);
        });
      }

      const score = Math.max(0, Math.min(1000, state.score + scoreChange));
      const next = { score, actions: state.actions + 1 };
      localStorage.setItem(getStorageKey(account.publicKey), JSON.stringify(next));
      setState(next);
      return next;
    },
    [account?.publicKey, state]
  );

  let level = 5;
  if (state.score <= 100) {
    level = 1;
  } else if (state.score <= 300) {
    level = 2;
  } else if (state.score <= 600) {
    level = 3;
  } else if (state.score <= 800) {
    level = 4;
  }

  return {
    score: state.score,
    actions: state.actions,
    level,
    loadReputation,
    recordAction,
  };
}
