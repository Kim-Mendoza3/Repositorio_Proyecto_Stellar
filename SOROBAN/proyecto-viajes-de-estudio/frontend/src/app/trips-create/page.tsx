'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTrips } from '@/hooks/useTrips';
import TripOfferForm, { TripOfferFormData } from '@/components/TripOfferForm';
import { normalizeTripFormData, validateTripOfferData } from '@/lib/trip-validation';

export default function TripsCreatePage() {
  const router = useRouter();
  const { createTrip, isSubmitting, error } = useTrips();

  const [formData, setFormData] = useState<TripOfferFormData>({
    name: '',
    targetSector: '',
    maxApplications: '30',
    duration: '5 dias',
    description: '',
    termsAndConditions: '',
  });
  const [done, setDone] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      formData.name.trim() &&
      formData.targetSector.trim() &&
      formData.maxApplications.trim() &&
      formData.description.trim() &&
      formData.termsAndConditions.trim()
    );
  }, [formData]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setDone(false);

    const normalized = normalizeTripFormData(formData);
    const errors = validateTripOfferData(normalized);

    if (errors.length > 0) {
      setValidationError(errors[0]);
      return;
    }

    await createTrip(normalized);
    setDone(true);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#1e1b4b_0%,_#0f172a_45%,_#020617_100%)] p-6 text-white">
      <div className="max-w-3xl mx-auto bg-slate-900/70 border border-cyan-400/30 rounded-2xl p-8 shadow-xl shadow-cyan-500/10">
        <h1 className="text-3xl font-bold mb-2">Crear viaje (Soroban Flow)</h1>
        <p className="text-cyan-100/80 mb-6">Este formulario usa el nuevo hook de trips integrado.</p>

        <TripOfferForm
          formData={formData}
          onChange={setFormData}
          onSubmit={onSubmit}
          submitLabel="Crear viaje"
          cancelLabel="Volver"
          onCancel={() => router.push('/dashboard')}
          isSubmitting={isSubmitting}
          disableSubmit={!canSubmit}
          errorText={validationError || error}
          successText={done ? 'Viaje creado correctamente.' : null}
        />
      </div>
    </main>
  );
}
