'use client';

import { useEffect } from 'react';
import { useReputation } from '@/hooks/useReputation';

export default function ReputationPage() {
  const { score, level, actions, loadReputation, recordAction } = useReputation();

  useEffect(() => {
    loadReputation();
  }, [loadReputation]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#1e1b4b_0%,_#0f172a_45%,_#020617_100%)] p-6 text-white">
      <div className="max-w-4xl mx-auto rounded-2xl border border-cyan-400/30 bg-slate-900/70 p-8">
        <h1 className="text-3xl font-bold mb-6">Reputacion On-chain</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl bg-slate-950/70 p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Score</p>
            <p className="text-3xl text-cyan-300 font-bold">{score}</p>
          </div>
          <div className="rounded-xl bg-slate-950/70 p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Nivel</p>
            <p className="text-3xl text-indigo-300 font-bold">{level}</p>
          </div>
          <div className="rounded-xl bg-slate-950/70 p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Acciones</p>
            <p className="text-3xl text-emerald-300 font-bold">{actions}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => recordAction(40)} className="btn-gloss btn-cyan text-slate-950 px-4 py-2 rounded-lg font-semibold">+40 Trip completado</button>
          <button onClick={() => recordAction(25)} className="btn-gloss bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold">+25 Hito verificado</button>
          <button onClick={() => recordAction(-80)} className="btn-gloss bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg font-semibold">-80 Penalizacion</button>
        </div>
      </div>
    </main>
  );
}
