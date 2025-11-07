'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle, Home } from 'lucide-react';

export default function EBASSuccess() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800/50 rounded-3xl p-12 text-center">
          <CheckCircle className="w-24 h-24 text-green-400 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">¡Préstamo Aprobado!</h1>
          <p className="text-2xl text-green-400 mb-8">$500 USD</p>
          <p className="text-gray-300 mb-8">
            Tu préstamo ha sido aprobado y depositado en tu wallet de Stellar
          </p>
          
          <div className="bg-slate-900/50 rounded-xl p-6 mb-8 text-left">
            <p className="text-gray-400 text-sm mb-2">Transaction Hash:</p>
            <p className="text-white font-mono text-sm break-all">
              5d3b03f2912eec1229aa15efdb394c0652e2693503944258503dea179201ce7e
            </p>
          </div>

          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold mx-auto"
          >
            <Home className="w-5 h-5" />
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
}
