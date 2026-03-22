import { useCallback, useMemo, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { getContractId, hasContract, invokeSorobanRead, invokeSorobanWrite } from '@/lib/soroban-client';

type BadgeType = 0 | 1 | 2 | 3;

export interface UserBadge {
  id: string;
  badgeType: BadgeType;
  points: number;
  tripId: string;
  createdAt: string;
}

const badgePoints: Record<BadgeType, number> = {
  0: 50,
  1: 100,
  2: 75,
  3: 150,
};

function getStorageKey(wallet: string) {
  return `smarttrip_badges_${wallet}`;
}

export function useBadges() {
  const { account } = useWallet();
  const [badges, setBadges] = useState<UserBadge[]>([]);

  const loadBadges = useCallback(() => {
    if (!account?.publicKey) return;
    const raw = localStorage.getItem(getStorageKey(account.publicKey));
    setBadges(raw ? JSON.parse(raw) : []);
  }, [account?.publicKey]);

  const mintBadge = useCallback(
    (badgeType: BadgeType, tripId: string) => {
      if (!account?.publicKey) {
        throw new Error('Wallet no conectada');
      }

      const badgeContractId = getContractId('badge');
      if (badgeContractId && hasContract('badge')) {
        invokeSorobanWrite(
          badgeContractId,
          'mint_badge',
          [account.publicKey, badgeType, Number(tripId.replaceAll(/\D/g, '')) || 1],
          account.publicKey
        ).catch((error) => {
          console.warn('Fallo mint on-chain badge, se mantiene respaldo local', error);
        });
      }

      const next: UserBadge = {
        id: `badge_${Date.now()}`,
        badgeType,
        points: badgePoints[badgeType],
        tripId,
        createdAt: new Date().toISOString(),
      };

      const current = [...badges, next];
      localStorage.setItem(getStorageKey(account.publicKey), JSON.stringify(current));
      setBadges(current);
      return next;
    },
    [account?.publicKey, badges]
  );

  const totalPoints = useMemo(() => badges.reduce((sum, badge) => sum + badge.points, 0), [badges]);

  const refreshFromChain = useCallback(async () => {
    if (!account?.publicKey) return;

    const badgeContractId = getContractId('badge');
    if (!badgeContractId || !hasContract('badge')) return;

    try {
      const points = await invokeSorobanRead(
        badgeContractId,
        'get_user_badge_points',
        [account.publicKey],
        account.publicKey
      );

      if (typeof points === 'number') {
        const current = badges.length
          ? badges
          : [
              {
                id: 'chain_sync',
                badgeType: 0 as const,
                points,
                tripId: 'chain',
                createdAt: new Date().toISOString(),
              },
            ];
        setBadges(current);
      }
    } catch (error) {
      console.warn('No se pudo leer badges on-chain, manteniendo vista local', error);
    }
  }, [account?.publicKey, badges]);

  return {
    badges,
    totalPoints,
    loadBadges,
    mintBadge,
    refreshFromChain,
  };
}
