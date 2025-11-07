'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2, AlertCircle, ArrowRight, TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface Platform {
  name: string;
  icon: string;
  color: string;
  connected: boolean;
  monthlyEarnings: number[];
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
}

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

interface IncomeDashboardProps {
  onDataReady: (data: IncomeData) => void;
  onNext: () => void;
}

const IncomeDashboard: React.FC<IncomeDashboardProps> = ({ onDataReady, onNext }) => {
  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      name: 'Uber',
      icon: '🚗',
      color: 'from-black to-gray-700',
      connected: false,
      monthlyEarnings: [],
      status: 'disconnected'
    },
    {
      name: 'Rappi',
      icon: '🍕',
      color: 'from-orange-500 to-red-500',
      connected: false,
      monthlyEarnings: [],
      status: 'disconnected'
    },
    {
      name: 'DiDi',
      icon: '🚙',
      color: 'from-orange-600 to-yellow-500',
      connected: false,
      monthlyEarnings: [],
      status: 'disconnected'
    },
    {
      name: 'Deliveroo',
      icon: '🛵',
      color: 'from-teal-500 to-cyan-500',
      connected: false,
      monthlyEarnings: [],
      status: 'disconnected'
    },
    {
      name: 'Freelancer',
      icon: '💼',
      color: 'from-blue-600 to-purple-600',
      connected: false,
      monthlyEarnings: [],
      status: 'disconnected'
    },
    {
      name: 'Fiverr',
      icon: '🎨',
      color: 'from-green-500 to-emerald-500',
      connected: false,
      monthlyEarnings: [],
      status: 'disconnected'
    }
  ]);

  const [currentStep, setCurrentStep] = useState(1);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [avgMonthly, setAvgMonthly] = useState(0);
  const [additionalData, setAdditionalData] = useState({
    hoursPerWeek: 35,
    experience: 2,
    education: 'bachelor' as const,
    employmentType: 'full_time_gig' as const,
    bankAge: 18,
    hasSavings: true,
    debtRatio: 0.3
  });

  // Mock earnings data for different platforms
  const mockEarnings: Record<string, number[]> = {
    'Uber': [2200, 2400, 2100, 2300, 2150, 2350],
    'Rappi': [800, 950, 750, 900, 820, 880],
    'DiDi': [1500, 1600, 1400, 1550, 1450, 1580],
    'Deliveroo': [1200, 1350, 1100, 1250, 1180, 1300],
    'Freelancer': [3500, 4200, 3800, 4000, 3600, 4100],
    'Fiverr': [1800, 2200, 1950, 2100, 1900, 2050]
  };

  const connectPlatform = async (index: number) => {
    const platform = platforms[index];
    
    // Set connecting status
    setPlatforms(prev => prev.map((p, i) => 
      i === index ? { ...p, status: 'connecting' } : p
    ));

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock connection success
    const earnings = mockEarnings[platform.name] || [1000, 1100, 950, 1050, 980, 1080];
    
    setPlatforms(prev => prev.map((p, i) => 
      i === index ? { 
        ...p, 
        connected: true, 
        status: 'connected',
        monthlyEarnings: earnings
      } : p
    ));
  };

  const disconnectPlatform = (index: number) => {
    setPlatforms(prev => prev.map((p, i) => 
      i === index ? { 
        ...p, 
        connected: false, 
        status: 'disconnected',
        monthlyEarnings: []
      } : p
    ));
  };

  // Calculate totals when platforms change
  useEffect(() => {
    const connectedPlatforms = platforms.filter(p => p.connected);
    const allEarnings = connectedPlatforms.flatMap(p => p.monthlyEarnings);
    
    if (allEarnings.length > 0) {
      const total = allEarnings.reduce((sum, earning) => sum + earning, 0);
      const monthCount = Math.max(...connectedPlatforms.map(p => p.monthlyEarnings.length));
      
      setTotalEarnings(total);
      setAvgMonthly(total / (monthCount || 1));
    } else {
      setTotalEarnings(0);
      setAvgMonthly(0);
    }
  }, [platforms]);

  // Prepare data for credit scoring when ready
  useEffect(() => {
    const connectedPlatforms = platforms.filter(p => p.connected);
    if (connectedPlatforms.length > 0) {
      const combinedEarnings = [];
      const maxMonths = Math.max(...connectedPlatforms.map(p => p.monthlyEarnings.length));
      
      // Combine earnings from all platforms by month
      for (let i = 0; i < maxMonths; i++) {
        const monthTotal = connectedPlatforms.reduce((sum, platform) => {
          return sum + (platform.monthlyEarnings[i] || 0);
        }, 0);
        combinedEarnings.push(monthTotal);
      }

      const incomeData: IncomeData = {
        monthly_earnings: combinedEarnings,
        gig_platforms: connectedPlatforms.map(p => p.name.toLowerCase()),
        average_hours_per_week: additionalData.hoursPerWeek,
        years_experience: additionalData.experience,
        education_level: additionalData.education,
        employment_type: additionalData.employmentType,
        bank_account_age_months: additionalData.bankAge,
        has_savings: additionalData.hasSavings,
        debt_to_income_ratio: additionalData.debtRatio
      };

      onDataReady(incomeData);
    }
  }, [platforms, additionalData, onDataReady]);

  const connectedCount = platforms.filter(p => p.connected).length;
  const canProceed = connectedCount >= 2; // Need at least 2 platforms

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Conecta tus <span className="text-green-400">Apps de Ingresos</span>
          </h1>
          <p className="text-xl text-gray-300">
            Conecta al menos 2 plataformas para calcular tu credit score
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 1 ? 'bg-green-500' : 'bg-gray-600'
            }`}>
              <span className="text-white text-sm font-bold">1</span>
            </div>
            <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 2 ? 'bg-green-500' : 'bg-gray-600'
            }`}>
              <span className="text-white text-sm font-bold">2</span>
            </div>
            <div className={`w-16 h-1 ${currentStep >= 3 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 3 ? 'bg-green-500' : 'bg-gray-600'
            }`}>
              <span className="text-white text-sm font-bold">3</span>
            </div>
          </div>
          <div className="flex justify-center space-x-8 text-sm text-gray-400">
            <span>Conectar Apps</span>
            <span>Información Extra</span>
            <span>Credit Score</span>
          </div>
        </div>

        {currentStep === 1 && (
          <>
            {/* Platform Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {platforms.map((platform, index) => (
                <div key={platform.name} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${platform.color} rounded-xl flex items-center justify-center`}>
                        <span className="text-2xl">{platform.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{platform.name}</h3>
                        <p className="text-sm text-gray-400">
                          {platform.connected ? 'Conectado' : 'No conectado'}
                        </p>
                      </div>
                    </div>
                    
                    {platform.status === 'connected' && (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    )}
                    {platform.status === 'connecting' && (
                      <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                    )}
                  </div>

                  {platform.connected && (
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        ${platform.monthlyEarnings[platform.monthlyEarnings.length - 1]?.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-gray-400">Último mes</div>
                    </div>
                  )}

                  <button
                    onClick={() => platform.connected ? disconnectPlatform(index) : connectPlatform(index)}
                    disabled={platform.status === 'connecting'}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                      platform.connected 
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    } ${platform.status === 'connecting' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {platform.status === 'connecting' && 'Conectando...'}
                    {platform.status === 'connected' && 'Desconectar'}
                    {platform.status === 'disconnected' && 'Conectar'}
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            {connectedCount > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Resumen de Ingresos</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-1">
                      {connectedCount}
                    </div>
                    <div className="text-sm text-gray-400">Plataformas Conectadas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-1">
                      ${avgMonthly.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Promedio Mensual</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-1">
                      ${totalEarnings.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Total (6 meses)</div>
                  </div>
                </div>
              </div>
            )}

            {/* Continue Button */}
            <div className="text-center">
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!canProceed}
                className={`px-8 py-4 rounded-xl font-semibold transition-all flex items-center space-x-2 mx-auto ${
                  canProceed
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
              >
                <span>Continuar</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              {!canProceed && (
                <p className="text-red-400 text-sm mt-2">
                  Necesitas conectar al menos 2 plataformas
                </p>
              )}
            </div>
          </>
        )}

        {currentStep === 2 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Información Adicional</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Hours per week */}
              <div>
                <label className="block text-white font-medium mb-2">Horas por semana</label>
                <input
                  type="number"
                  value={additionalData.hoursPerWeek}
                  onChange={(e) => setAdditionalData(prev => ({
                    ...prev,
                    hoursPerWeek: parseInt(e.target.value) || 0
                  }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  min="1"
                  max="80"
                />
              </div>

              {/* Years of experience */}
              <div>
                <label className="block text-white font-medium mb-2">Años de experiencia</label>
                <input
                  type="number"
                  value={additionalData.experience}
                  onChange={(e) => setAdditionalData(prev => ({
                    ...prev,
                    experience: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  min="0"
                  max="20"
                  step="0.5"
                />
              </div>

              {/* Education */}
              <div>
                <label className="block text-white font-medium mb-2">Nivel de educación</label>
                <select
                  value={additionalData.education}
                  onChange={(e) => setAdditionalData(prev => ({
                    ...prev,
                    education: e.target.value as any
                  }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="none">Sin educación formal</option>
                  <option value="high_school">Bachillerato</option>
                  <option value="bachelor">Licenciatura</option>
                  <option value="master">Maestría</option>
                  <option value="phd">Doctorado</option>
                </select>
              </div>

              {/* Employment type */}
              <div>
                <label className="block text-white font-medium mb-2">Tipo de empleo</label>
                <select
                  value={additionalData.employmentType}
                  onChange={(e) => setAdditionalData(prev => ({
                    ...prev,
                    employmentType: e.target.value as any
                  }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="full_time_gig">Gig tiempo completo</option>
                  <option value="part_time_gig">Gig tiempo parcial</option>
                  <option value="mixed">Mixto</option>
                  <option value="unemployed">Desempleado</option>
                </select>
              </div>

              {/* Bank account age */}
              <div>
                <label className="block text-white font-medium mb-2">Antigüedad cuenta bancaria (meses)</label>
                <input
                  type="number"
                  value={additionalData.bankAge}
                  onChange={(e) => setAdditionalData(prev => ({
                    ...prev,
                    bankAge: parseInt(e.target.value) || 0
                  }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  min="1"
                  max="240"
                />
              </div>

              {/* Debt ratio */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Ratio deuda/ingreso ({(additionalData.debtRatio * 100).toFixed(0)}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={additionalData.debtRatio}
                  onChange={(e) => setAdditionalData(prev => ({
                    ...prev,
                    debtRatio: parseFloat(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Has savings checkbox */}
            <div className="mt-6">
              <label className="flex items-center space-x-3 text-white">
                <input
                  type="checkbox"
                  checked={additionalData.hasSavings}
                  onChange={(e) => setAdditionalData(prev => ({
                    ...prev,
                    hasSavings: e.target.checked
                  }))}
                  className="w-5 h-5 text-green-500"
                />
                <span>Tengo ahorros</span>
              </label>
            </div>

            {/* Continue buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                Volver
              </button>
              <button
                onClick={onNext}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center space-x-2"
              >
                <span>Calcular Credit Score</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeDashboard;