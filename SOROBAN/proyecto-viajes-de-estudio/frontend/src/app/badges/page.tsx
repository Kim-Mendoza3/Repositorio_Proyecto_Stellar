'use client';

import { useEffect } from 'react';
import { useBadges } from '@/hooks/useBadges';

const labels = ['Explorer', 'Researcher', 'Communicator', 'Collaborator'];

export default function BadgesPage() {
  const { badges, totalPoints, loadBadges, mintBadge } = useBadges();

  useEffect(() => {
    loadBadges();
  }, [loadBadges]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#1e1b4b_0%,_#0f172a_45%,_#020617_100%)] p-6 text-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Badges</h1>
        <p className="text-cyan-100/80 mb-6">Total de puntos: <span className="font-semibold text-cyan-300">{totalPoints}</span></p>

        <div className="flex flex-wrap gap-3 mb-8">
          {[0, 1, 2, 3].map((type) => (
            <button key={type} onClick={() => mintBadge(type as 0 | 1 | 2 | 3, `trip_demo_${type}`)} className="btn-gloss btn-cyan text-slate-950 px-4 py-2 rounded-lg font-semibold">
              Mint {labels[type]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {badges.map((badge) => (
            <article key={badge.id} className="rounded-xl border border-cyan-400/30 bg-slate-900/70 p-4">
              <h2 className="text-xl font-semibold">{labels[badge.badgeType]}</h2>
              <p className="text-cyan-300">+{badge.points} pts</p>
              <p className="text-slate-300 text-sm mt-2">Trip: {badge.tripId}</p>
              <p className="text-slate-400 text-xs mt-1">{new Date(badge.createdAt).toLocaleString()}</p>
            </article>
          ))}
          {!badges.length && <p className="text-slate-300">Aun no tienes badges.</p>}
        </div>
      </div>
    </main>
  );
}
