export interface TripFormLikeData {
  name: string;
  targetSector: string;
  maxApplications: string;
  duration: string;
  description: string;
  termsAndConditions: string;
}

export interface NormalizedTripOfferData {
  name: string;
  targetSector: string;
  maxApplications: number;
  termsAndConditions: string;
  destination: string;
  duration: string;
  priceXLM: number;
  description: string;
  maxParticipants: number;
  highlights: string[];
}

export function normalizeTripFormData(formData: TripFormLikeData): NormalizedTripOfferData {
  return {
    name: formData.name.trim(),
    targetSector: formData.targetSector.trim(),
    maxApplications: Number(formData.maxApplications),
    termsAndConditions: formData.termsAndConditions.trim(),
    destination: `Sector: ${formData.targetSector.trim() || 'General'}`,
    duration: formData.duration.trim(),
    priceXLM: 50,
    description: formData.description.trim(),
    maxParticipants: 30,
    highlights: [
      `Sector objetivo: ${formData.targetSector.trim() || 'General'}`,
      'Postulacion sujeta a terminos y condiciones',
    ],
  };
}

export function validateTripOfferData(data: NormalizedTripOfferData): string[] {
  const errors: string[] = [];

  if (!data.name) {
    errors.push('El nombre del viaje es obligatorio.');
  }

  if (!data.targetSector) {
    errors.push('El sector al que se dirige la oferta es obligatorio.');
  }

  if (!data.duration) {
    errors.push('La duracion es obligatoria.');
  }

  if (!Number.isInteger(data.maxApplications) || data.maxApplications <= 0) {
    errors.push('El maximo de postulantes debe ser un entero mayor a 0.');
  }

  if (!data.description) {
    errors.push('La descripcion es obligatoria.');
  }

  if (!data.termsAndConditions) {
    errors.push('Debes incluir terminos y condiciones.');
  }

  return errors;
}
