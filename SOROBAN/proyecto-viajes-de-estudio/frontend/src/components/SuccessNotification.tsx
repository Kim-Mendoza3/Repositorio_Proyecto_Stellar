'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Copy, 
  ExternalLink, 
  Download, 
  Calendar,
  DollarSign,
  Clock,
  CreditCard,
  Wallet,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface TripResponse {
  success: boolean;
  transaction_hash?: string;
  trip_id?: string;
  amount?: number;
  recipient?: string;
  timestamp?: number;
  interest_rate?: number;
  repayment_due_date?: number;
  error?: string;
}

interface SuccessNotificationProps {
  loanAmount: number;
  userAddress: string;
  onStartOver: () => void;
  onViewDashboard: () => void;
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  loanAmount,
  userAddress,
  onStartOver,
  onViewDashboard
}) => {
  const [loanResult, setLoanResult] = useState<TripResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Process trip request on component mount
  useEffect(() => {
    const processLoan = async () => {
      try {
        setLoading(true);
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const loanRequest = {
          user_address: userAddress,
          amount: loanAmount * 10000000, // Convert to stroops (7 decimals)
          credit_score: 750, // This would come from the previous step
          purpose: 'personal',
          repayment_plan: 'monthly'
        };

        const response = await fetch('/api/request-trip-real', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loanRequest),
        });

  const result: TripResponse = await response.json();
        
        if (result.success) {
          setLoanResult(result);
        } else {
          setError(result.error || 'Error processing trip');
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    processLoan();
  }, [loanAmount, userAddress]);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amountInStroops: number) => {
    return (amountInStroops / 10000000).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-green-400 animate-spin mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Procesando tu Reserva de Viaje</h2>
          <p className="text-xl text-gray-300 mb-6">
            Verificando fondos y ejecutando smart contract...
          </p>
          <div className="space-y-3 text-left max-w-md mx-auto">
            <div className="flex items-center space-x-3 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span>Verificando elegibilidad ✓</span>
            </div>
            <div className="flex items-center space-x-3 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span>Validando balance del pool ✓</span>
            </div>
            <div className="flex items-center space-x-3 text-yellow-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Ejecutando contrato en Stellar...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Error en la Reserva</h2>
          <p className="text-xl text-gray-300 mb-8">{error}</p>
          
          <div className="space-y-4">
              <button
              onClick={onStartOver}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Intentar de Nuevo
            </button>
            <button
              onClick={onViewDashboard}
              className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!loanResult || !loanResult.success) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            ¡Reserva de Viaje <span className="text-green-400">Aprobada!</span>
          </h1>
          <p className="text-2xl text-gray-300">
            Tu reserva de viaje se ha procesado exitosamente
          </p>
        </div>

        {/* Transaction Details Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Wallet className="w-6 h-6 mr-3" />
            Detalles de la Transacción
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Amount */}
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Monto</h3>
                  <p className="text-gray-400">USDC transferido</p>
                </div>
              </div>
                  <div className="text-4xl font-bold text-green-400">
                ${formatAmount(loanResult.amount!)} USDC
              </div>
            </div>

            {/* Interest Rate */}
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Tasa de Interés</h3>
                  <p className="text-gray-400">APR</p>
                </div>
              </div>
              <div className="text-4xl font-bold text-blue-400">
                {(loanResult.interest_rate! * 100).toFixed(1)}%
              </div>
            </div>

            {/* Transaction Hash */}
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Transaction Hash</h3>
                  <p className="text-gray-400">Stellar blockchain</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <code className="text-sm text-purple-400 font-mono truncate">
                  {loanResult.transaction_hash!.substring(0, 20)}...
                </code>
                <button
                  onClick={() => copyToClipboard(loanResult.transaction_hash!, 'hash')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              {copied === 'hash' && (
                <p className="text-green-400 text-xs mt-1">¡Copiado!</p>
              )}
            </div>

            {/* Loan ID */}
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Trip ID</h3>
                  <p className="text-gray-400">Identificador único</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <code className="text-sm text-orange-400 font-mono">
                  {loanResult.trip_id}
                </code>
                <button
                  onClick={() => copyToClipboard(loanResult.trip_id!, 'id')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              {copied === 'id' && (
                <p className="text-green-400 text-xs mt-1">¡Copiado!</p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-8 p-6 bg-white/10 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Cronología
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Procesado</span>
                <span className="text-white font-medium">
                  {formatDate(loanResult.timestamp!)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Fecha de Pago</span>
                <span className="text-yellow-400 font-medium">
                  {formatDate(loanResult.repayment_due_date!)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Próximos Pasos</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <h3 className="text-white font-medium">Los USDC están en tu wallet</h3>
                <p className="text-gray-400 text-sm">
                  Revisa tu wallet Stellar para confirmar la recepción de fondos
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <h3 className="text-white font-medium">Prepara el pago</h3>
                <p className="text-gray-400 text-sm">
                  El pago vence el {formatDate(loanResult.repayment_due_date!)}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Download className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h3 className="text-white font-medium">Guarda este recibo</h3>
                <p className="text-gray-400 text-sm">
                  Usa el Trip ID {loanResult.trip_id} para consultas futuras
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => window.open(`https://stellar.expert/explorer/testnet/tx/${loanResult.transaction_hash}`, '_blank')}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all"
          >
            <ExternalLink className="w-5 h-5" />
            <span>Ver en Stellar</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/ebas-dashboard'}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all"
          >
            <Wallet className="w-5 h-5" />
            <span>Mi Dashboard</span>
          </button>
          
          <button
            onClick={onStartOver}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all"
          >
            <ArrowRight className="w-5 h-5" />
            <span>Nueva Reserva</span>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400">
          <p className="text-sm">
            ¿Preguntas? Contacta soporte con tu Trip ID: {loanResult.trip_id}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessNotification;