import { useCallback, useMemo, useState } from 'react';
import { useTripOffers } from './useTripOffers';
import { useWallet } from '@/contexts/WalletContext';
import { getContractId, hasContract, invokeSorobanWrite } from '@/lib/soroban-client';

export interface CreateTripInput {
  name: string;
  destination: string;
  duration: string;
  priceXLM: number;
  description: string;
  maxParticipants: number;
  highlights: string[];
}

export function useTrips() {
  const { account } = useWallet();
  const { trips, loadAllTrips, createReservation, getTripById } = useTripOffers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTrip = useCallback(
    async (input: CreateTripInput) => {
      if (!account?.publicKey) {
        throw new Error('Wallet no conectada');
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const tripContractId = getContractId('trip');
        if (tripContractId && hasContract('trip')) {
          const now = Math.floor(Date.now() / 1000);
          await invokeSorobanWrite(
            tripContractId,
            'create_trip',
            [account.publicKey, Math.floor(input.priceXLM * 10_000_000), now + 3600, now + 86400 * 30, 3],
            account.publicKey
          );
        }

        const response = await fetch('/api/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: `trip_${Date.now()}`,
            companyWallet: account.publicKey,
            status: 'active',
            currentBookings: 0,
            createdAt: new Date().toISOString(),
            ...input,
          }),
        });

        if (!response.ok) {
          throw new Error(`No se pudo crear el viaje (${response.status})`);
        }

        await loadAllTrips();
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        setError(message);
        throw e;
      } finally {
        setIsSubmitting(false);
      }
    },
    [account?.publicKey, loadAllTrips]
  );

  const sponsorTrip = useCallback(
    async (tripId: string, amountXLM: number) => {
      if (!account?.publicKey) {
        throw new Error('Wallet no conectada');
      }

      const trip = getTripById(tripId);
      if (!trip) {
        throw new Error('Viaje no encontrado');
      }

      const tripContractId = getContractId('trip');
      if (tripContractId && hasContract('trip')) {
        await invokeSorobanWrite(
          tripContractId,
          'sponsor_trip',
          [Number(tripId.replaceAll(/\D/g, '')) || 1, Math.floor(amountXLM * 10_000_000)],
          account.publicKey
        );
      }

      return createReservation(tripId, account.publicKey, trip.companyWallet, amountXLM);
    },
    [account?.publicKey, createReservation, getTripById]
  );

  const activeTrips = useMemo(() => trips.filter((trip) => trip.status === 'active'), [trips]);

  return {
    trips,
    activeTrips,
    isSubmitting,
    error,
    createTrip,
    sponsorTrip,
    reloadTrips: loadAllTrips,
    getTripById,
  };
}
