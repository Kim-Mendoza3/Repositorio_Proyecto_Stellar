'use client';

import { useEffect, useState } from 'react';
import { useTreasury } from '@/hooks/useTreasury';

export default function TreasuryPage() {
  const { balance, commissionRate, loadTreasury, depositCommission, setCommissionRate } = useTreasury();
  const [amount, setAmount] = useState('10');
  const [rate, setRate] = useState('300');

  useEffect(() => {
    loadTreasury();
  }, [loadTreasury]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#1e1b4b_0%,_#0f172a_45%,_#020617_100%)] p-6 text-white">
      <div className="max-w-4xl mx-auto rounded-2xl border border-cyan-400/30 bg-slate-900/70 p-8">
        <h1 className="text-3xl font-bold mb-6">Treasury</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
            <p className="text-sm text-slate-400">Balance Treasury</p>
            <p className="text-3xl font-bold text-cyan-300">{balance.toFixed(2)} XLM</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
            <p className="text-sm text-slate-400">Comision</p>
            <p className="text-3xl font-bold text-indigo-300">{(commissionRate / 100).toFixed(2)}%</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <input value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-lg bg-slate-950/80 border border-slate-600 px-4 py-2" />
            <button onClick={() => depositCommission(Number(amount))} className="btn-gloss btn-cyan text-slate-950 px-4 py-2 rounded-lg font-semibold">Depositar comision</button>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <input value={rate} onChange={(e) => setRate(e.target.value)} className="rounded-lg bg-slate-950/80 border border-slate-600 px-4 py-2" />
            <button onClick={() => setCommissionRate(Number(rate))} className="btn-gloss bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold">Actualizar bps</button>
          </div>
        </div>
      </div>
    </main>
  );
}
