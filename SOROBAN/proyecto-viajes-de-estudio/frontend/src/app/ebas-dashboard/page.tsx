'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Car, Smartphone, Bike, ArrowRight } from 'lucide-react';

export default function EBASDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [apps, setApps] = useState([
    { id: 'uber', name: 'Uber', icon: Car, connected: false },
    { id: 'rappi', name: 'Rappi', icon: Smartphone, connected: false },
    { id: 'didi', name: 'DiDi', icon: Bike, connected: false },
  ]);

  useEffect(() => {
    const data = localStorage.getItem('passkey-data');
    if (data) {
      setUserData(JSON.parse(data));
    }
  }, []);

  const connectApp = (id: string) => {
    setApps(apps.map(app => app.id === id ? { ...app, connected: true } : app));
  };

  const handleContinue = () => {
    router.push('/ebas-credit');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Dashboard EBAS</h1>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {apps.map((app) => (
            <div key={app.id} className={`p-6 rounded-2xl border-2 ${
              app.connected 
                ? 'bg-green-900/30 border-green-500' 
                : 'bg-slate-800/50 border-slate-700'
            }`}>
              <app.icon className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-4">{app.name}</h3>
              {!app.connected ? (
                <button
                  onClick={() => connectApp(app.id)}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
                >
                  Conectar
                </button>
              ) : (
                <div className="text-green-400 font-semibold">✓ Conectado</div>
              )}
            </div>
          ))}
        </div>

        {apps.some(app => app.connected) && (
          <button
            onClick={handleContinue}
            className="flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold mx-auto"
          >
            Ver mi Score Crediticio
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
