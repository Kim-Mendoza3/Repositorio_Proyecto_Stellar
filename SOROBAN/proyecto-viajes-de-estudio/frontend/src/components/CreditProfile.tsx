'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Shield, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Loader2,
  BarChart3,
  User,
  Calendar,
  Briefcase,
  PieChart
} from 'lucide-react';

interface IncomeData {
  monthly_earnings: number[];
  gig_platforms: string[];
  average_hours_per_week: number;
  years_experience: number;
  education_level: 'high_school' | 'bachelor' | 'master' | 'phd' | 'none';
  employment_type: 'full_time_gig' | 'part_time_gig' | 'mixed' | 'unemployed';
  bank_account_age_months: number;
  has_savings: boolean;
  debt_to_income_ratio: number;
}

interface CreditScoreResult {
  credit_score: number;
  factors: {
    income_stability: number;
    income_level: number;
    employment_history: number;
    financial_behavior: number;
    platform_diversity: number;
  };
  recommendation: string;
  loan_eligible: boolean;
  max_loan_amount: number;
}

interface CreditProfileProps {
  incomeData: IncomeData;
  onRequestLoan: (amount: number) => void;
  onBack: () => void;
}

const CreditProfile: React.FC<CreditProfileProps> = ({ incomeData, onRequestLoan, onBack }) => {
  const [creditResult, setCreditResult] = useState<CreditScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState(500);

  // Calculate credit score on component mount
  useEffect(() => {
    const calculateScore = async () => {
      try {
        setLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const response = await fetch('/api/calculate-score', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(incomeData),
        });

        if (!response.ok) {
          throw new Error('Failed to calculate credit score');
        }

        const result: CreditScoreResult = await response.json();
        setCreditResult(result);
        
        // Set default loan amount to half of max or $500, whichever is higher
        if (result.loan_eligible && result.max_loan_amount > 0) {
          setSelectedAmount(Math.max(500, Math.floor(result.max_loan_amount / 2)));
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    calculateScore();
  }, [incomeData]);

  const getScoreColor = (score: number) => {
    if (score >= 800) return 'text-emerald-400';
    if (score >= 750) return 'text-green-400';
    if (score >= 700) return 'text-yellow-400';
    if (score >= 650) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 800) return 'from-emerald-500 to-green-500';
    if (score >= 750) return 'from-green-500 to-lime-500';
    if (score >= 700) return 'from-yellow-500 to-green-500';
    if (score >= 650) return 'from-orange-500 to-yellow-500';
    return 'from-red-500 to-orange-500';
  };

  const getFactorIcon = (factor: string) => {
    switch (factor) {
      case 'income_stability': return <TrendingUp className="w-5 h-5" />;
      case 'income_level': return <DollarSign className="w-5 h-5" />;
      case 'employment_history': return <Calendar className="w-5 h-5" />;
      case 'financial_behavior': return <Shield className="w-5 h-5" />;
      case 'platform_diversity': return <Briefcase className="w-5 h-5" />;
      default: return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getFactorLabel = (factor: string) => {
    switch (factor) {
      case 'income_stability': return 'Estabilidad de Ingresos';
      case 'income_level': return 'Nivel de Ingresos';
      case 'employment_history': return 'Historial Laboral';
      case 'financial_behavior': return 'Comportamiento Financiero';
      case 'platform_diversity': return 'Diversidad de Plataformas';
      default: return factor;
    }
  };

  const calculateInterestRate = (score: number) => {
    if (score >= 800) return 6;
    if (score >= 750) return 8;
    if (score >= 700) return 12;
    return 15;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Calculando tu Credit Score</h2>
          <p className="text-gray-300">
            Analizando {incomeData.gig_platforms.length} plataformas y {incomeData.monthly_earnings.length} meses de datos...
          </p>
          <div className="mt-6 w-64 bg-gray-700 rounded-full h-2 mx-auto">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!creditResult) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Tu <span className="text-green-400">Credit Score</span>
          </h1>
          <p className="text-xl text-gray-300">
            Basado en el análisis de tus ingresos y perfil financiero
          </p>
        </div>

        {/* Main Score Display */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 mb-8">
          <div className="text-center mb-8">
            <div className={`text-8xl md:text-9xl font-bold ${getScoreColor(creditResult.credit_score)} mb-4`}>
              {creditResult.credit_score}
            </div>
            <div className="text-2xl text-gray-300 mb-6">
              {creditResult.credit_score >= 800 && 'Excelente'}
              {creditResult.credit_score >= 750 && creditResult.credit_score < 800 && 'Muy Bueno'}
              {creditResult.credit_score >= 700 && creditResult.credit_score < 750 && 'Bueno'}
              {creditResult.credit_score >= 650 && creditResult.credit_score < 700 && 'Regular'}
              {creditResult.credit_score < 650 && 'Necesita Mejora'}
            </div>
            
            {/* Score Bar */}
            <div className="w-full max-w-md mx-auto">
              <div className="bg-gray-700 rounded-full h-4 mb-2">
                <div 
                  className={`bg-gradient-to-r ${getScoreGradient(creditResult.credit_score)} h-4 rounded-full transition-all duration-1000`}
                  style={{ width: `${((creditResult.credit_score - 500) / 350) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>500</span>
                <span>850</span>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-white/10 rounded-2xl p-6 text-center">
            <p className="text-lg text-gray-300">{creditResult.recommendation}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Score Factors */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <PieChart className="w-6 h-6 mr-3" />
              Factores del Score
            </h2>
            
            <div className="space-y-4">
              {Object.entries(creditResult.factors).map(([factor, value]) => (
                <div key={factor} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-blue-400">
                      {getFactorIcon(factor)}
                    </div>
                    <span className="text-white font-medium">
                      {getFactorLabel(factor)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                        style={{ width: `${value}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-bold w-12 text-right">{value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Loan Options */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <DollarSign className="w-6 h-6 mr-3" />
              Opciones de Préstamo
            </h2>

            {creditResult.loan_eligible ? (
              <>
                {/* Loan Amount Selector */}
                <div className="mb-6">
                  <label className="block text-white font-medium mb-3">
                    Monto del Préstamo: ${selectedAmount.toLocaleString()} USDC
                  </label>
                  <input
                    type="range"
                    min="50"
                    max={creditResult.max_loan_amount}
                    step="50"
                    value={selectedAmount}
                    onChange={(e) => setSelectedAmount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>$50</span>
                    <span>${creditResult.max_loan_amount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Loan Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-gray-300">Tasa de Interés APR</span>
                    <span className="text-green-400 font-bold">
                      {calculateInterestRate(creditResult.credit_score)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-gray-300">Límite Máximo</span>
                    <span className="text-blue-400 font-bold">
                      ${creditResult.max_loan_amount.toLocaleString()} USDC
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-gray-300">Tiempo de Aprobación</span>
                    <span className="text-purple-400 font-bold">≤ 5 minutos</span>
                  </div>
                </div>

                {/* Request Loan Button */}
                <button
                  onClick={() => onRequestLoan(selectedAmount)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <DollarSign className="w-5 h-5" />
                  <span>Solicitar ${selectedAmount.toLocaleString()} USDC</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">No Elegible</h3>
                <p className="text-gray-300 mb-6">
                  Tu score actual ({creditResult.credit_score}) está por debajo del mínimo requerido (700).
                </p>
                
                {/* Improvement Tips */}
                <div className="bg-white/10 rounded-lg p-4 text-left">
                  <h4 className="text-lg font-bold text-white mb-3">Para mejorar tu score:</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Aumenta tus ingresos mensuales promedio</li>
                    <li>• Conecta más plataformas de trabajo</li>
                    <li>• Mantén ingresos estables por más tiempo</li>
                    <li>• Reduce tu ratio de deuda/ingreso</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
          >
            Volver a Configuración
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditProfile;