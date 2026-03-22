import React from 'react';

export interface TripOfferFormData {
  name: string;
  targetSector: string;
  maxApplications: string;
  duration: string;
  description: string;
  termsAndConditions: string;
  status?: 'active' | 'inactive';
}

interface TripOfferFormProps {
  formData: TripOfferFormData;
  onChange: (next: TripOfferFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  cancelLabel: string;
  onCancel: () => void;
  isSubmitting?: boolean;
  disableSubmit?: boolean;
  errorText?: string | null;
  successText?: string | null;
  showStatusField?: boolean;
  className?: string;
}

export default function TripOfferForm({
  formData,
  onChange,
  onSubmit,
  submitLabel,
  cancelLabel,
  onCancel,
  isSubmitting = false,
  disableSubmit = false,
  errorText,
  successText,
  showStatusField = false,
  className = 'space-y-4',
}: Readonly<TripOfferFormProps>) {
  return (
    <form onSubmit={onSubmit} className={className}>
      <div>
        <label htmlFor="trip-name" className="block text-white font-semibold mb-2">Nombre del Viaje *</label>
        <input
          id="trip-name"
          type="text"
          value={formData.name}
          onChange={(e) => onChange({ ...formData, name: e.target.value })}
          placeholder="ej. Viaje a CDMX"
          className="w-full px-4 py-2 bg-slate-950/70 border border-slate-700 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
          required
        />
      </div>

      <div>
        <label htmlFor="trip-description" className="block text-white font-semibold mb-2">Descripcion (Que aprenderas, ubicacion) *</label>
        <textarea
          id="trip-description"
          value={formData.description}
          onChange={(e) => onChange({ ...formData, description: e.target.value })}
          placeholder="Que aprenderas en el evento y en que ubicacion se realizara"
          rows={4}
          className="w-full px-4 py-2 bg-slate-950/70 border border-slate-700 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="trip-sector" className="block text-white font-semibold mb-2">Sector al que esta dirigido *</label>
          <input
            id="trip-sector"
            type="text"
            value={formData.targetSector}
            onChange={(e) => onChange({ ...formData, targetSector: e.target.value })}
            placeholder="ej. Tecnologia, Fintech, Educacion"
            className="w-full px-4 py-2 bg-slate-950/70 border border-slate-700 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="trip-max-applications" className="block text-white font-semibold mb-2">Maximo de postulantes (solicitudes) *</label>
          <input
            id="trip-max-applications"
            type="number"
            min="1"
            step="1"
            value={formData.maxApplications}
            onChange={(e) => onChange({ ...formData, maxApplications: e.target.value })}
            placeholder="ej. 30"
            className="w-full px-4 py-2 bg-slate-950/70 border border-slate-700 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="trip-duration" className="block text-white font-semibold mb-2">Duracion *</label>
          <input
            id="trip-duration"
            type="text"
            value={formData.duration}
            onChange={(e) => onChange({ ...formData, duration: e.target.value })}
            placeholder="ej. 5 dias"
            className="w-full px-4 py-2 bg-slate-950/70 border border-slate-700 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="trip-terms" className="block text-white font-semibold mb-2">Terminos y condiciones *</label>
        <textarea
          id="trip-terms"
          value={formData.termsAndConditions}
          onChange={(e) => onChange({ ...formData, termsAndConditions: e.target.value })}
          placeholder="Define compromisos, reglas, asistencia, conducta y condiciones del patrocinio"
          rows={3}
          className="w-full px-4 py-2 bg-slate-950/70 border border-slate-700 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
          required
        />
      </div>

      {errorText && <p className="text-rose-300">{errorText}</p>}
      {successText && <p className="text-emerald-300">{successText}</p>}

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || disableSubmit}
          className="flex-1 btn-gloss btn-cyan text-slate-950 font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 btn-gloss bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
        >
          {cancelLabel}
        </button>
      </div>
    </form>
  );
}
