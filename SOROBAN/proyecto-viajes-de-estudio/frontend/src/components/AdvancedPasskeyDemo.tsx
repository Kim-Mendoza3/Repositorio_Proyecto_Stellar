'use client';

import React, { useState, useEffect } from 'react';
import { Keypair, Account, BASE_FEE, TransactionBuilder, Networks, Operation } from '@stellar/stellar-sdk';
import {
  createPasskey,
  authenticateWithPasskey,
  extractPublicKeyInfo,
  isWebAuthnSupported,
  isWindowsHelloAvailable,
  validateRegistrationResult,
  validateAuthenticationResult,
  WebAuthnRegistrationResult,
  WebAuthnAuthenticationResult,
  PasskeyCredentials,
  WebAuthnError
} from '@/lib/webauthn-advanced';
import { 
  deployWebAuthnAccount, 
  validateStellarConfig,
  buildAuthTransaction,
  processWebAuthnSignature 
} from '@/lib/stellar-advanced';

interface PasskeyState {
  username: string;
  credentialId: string | null;
  accountAddress: string | null;
  publicKey: string | null;
}

interface BrowserSupport {
  supported: boolean;
  platformAuthenticator: boolean;
  error?: string;
}

interface AdvancedPasskeyDemoProps {
  onSuccess?: (data: {
    credentialId: string;
    publicKey: string;
    accountAddress?: string;
    deviceInfo?: string;
    username?: string;
  }) => void;
  onBack?: () => void;
}

const AdvancedPasskeyDemo: React.FC<AdvancedPasskeyDemoProps> = ({ onSuccess, onBack }) => {
  // Estados principales
  const [passkeyState, setPasskeyState] = useState<PasskeyState>({
    username: '',
    credentialId: null,
    accountAddress: null,
    publicKey: null,
  });

  const [browserSupport, setBrowserSupport] = useState<BrowserSupport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bundlerKey, setBundlerKey] = useState<Keypair | null>(null);
  
  // Estados de UI
  const [currentStep, setCurrentStep] = useState<'setup' | 'register' | 'authenticate' | 'dashboard'>('setup');

  // Verificación inicial
  useEffect(() => {
    const initializeApp = async () => {
      // Verificar soporte del navegador
      const webauthnSupported = await isWebAuthnSupported();
      const windowsHelloSupported = await isWindowsHelloAvailable();
      
      setBrowserSupport({
        supported: webauthnSupported,
        platformAuthenticator: windowsHelloSupported,
      });

      // Verificar configuración de Stellar
      try {
        validateStellarConfig();
      } catch (error) {
        setError(`🔧 Configuración: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }

      // Configurar bundler key
      let bundler = localStorage.getItem('bundler-key');
      if (!bundler) {
        const newBundler = Keypair.random();
        localStorage.setItem('bundler-key', newBundler.secret());
        bundler = newBundler.secret();
      }
      setBundlerKey(Keypair.fromSecret(bundler));

      // Cargar datos de passkey si existen
      const savedPasskeyData = localStorage.getItem('passkey-data');
      if (savedPasskeyData) {
        try {
          const parsedData = JSON.parse(savedPasskeyData);
          setPasskeyState(parsedData);
          // Si ya tiene datos de passkey válidos, ir directo al dashboard
          if (parsedData.credentialId && parsedData.accountAddress) {
            setCurrentStep('dashboard');
          }
        } catch (error) {
          console.warn('Error parsing saved passkey data:', error);
          localStorage.removeItem('passkey-data');
        }
      }

      // Cargar estado previo
      const savedState = localStorage.getItem('passkey-state');
      if (savedState) {
        const state = JSON.parse(savedState);
        setPasskeyState(state);
        if (state.accountAddress) {
          setCurrentStep('dashboard');
        }
      }
    };

    initializeApp();
  }, []);

  // Guardar estado en localStorage
  useEffect(() => {
    if (passkeyState.credentialId || passkeyState.accountAddress) {
      localStorage.setItem('passkey-state', JSON.stringify(passkeyState));
    }
  }, [passkeyState]);

  // Manejar registro de passkey
  const handleRegister = async () => {
    if (!passkeyState.username.trim()) {
      setError('❌ Ingresa un nombre de usuario');
      return;
    }

    if (!browserSupport?.supported) {
      setError('❌ Tu navegador no soporta WebAuthn');
      return;
    }

    if (!bundlerKey) {
      setError('❌ Error de configuración: bundler key no disponible');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Crear passkey
      setSuccess('🔐 Creando passkey...');
      const result = await createPasskey(passkeyState.username);
      
      // Validar el resultado
      if (!validateRegistrationResult(result)) {
        setError('❌ Error: resultado de registro inválido');
        return;
      }

      // Extraer información de clave pública
      setSuccess('🔑 Extrayendo información de clave pública...');
      let keyInfo;
      try {
        keyInfo = extractPublicKeyInfo(result);
        console.log('Información de clave extraída:', keyInfo);
      } catch (extractError) {
        console.error('Error extrayendo clave pública:', extractError);
        setError(`❌ Error extrayendo clave pública: ${extractError instanceof Error ? extractError.message : 'Error desconocido'}`);
        return;
      }
      
      // Desplegar cuenta en Stellar
      setSuccess('🚀 Desplegando cuenta en Stellar...');
      const accountAddress = await deployWebAuthnAccount(
        bundlerKey, 
        Buffer.from(keyInfo.contractSalt), 
        Buffer.from(keyInfo.publicKey)
      );

      // Actualizar estado y guardar en localStorage
      const newPasskeyState = {
        ...passkeyState,
        credentialId: result.id,
        accountAddress,
        publicKey: Buffer.from(keyInfo.publicKey).toString('hex'),
      };
      
      setPasskeyState(newPasskeyState);
      localStorage.setItem('passkey-data', JSON.stringify(newPasskeyState));

      setSuccess('🎉 ¡Cuenta creada exitosamente! Redirigiendo al dashboard...');
      
      // Llamar a onSuccess si está disponible
      if (onSuccess) {
        onSuccess({
          credentialId: newPasskeyState.credentialId!,
          publicKey: newPasskeyState.publicKey!,
          accountAddress: newPasskeyState.accountAddress || undefined,
          username: newPasskeyState.username
        });
      } else {
        // Ir al dashboard después de un pequeño delay si no hay callback
        setTimeout(() => {
          setCurrentStep('dashboard');
        }, 1500);
      }
      
    } catch (error) {
      console.error('Error en registro:', error);
      if (error instanceof WebAuthnError) {
        setError(`❌ ${error.message}`);
      } else if (error instanceof Error) {
        setError(`❌ Error inesperado: ${error.message}`);
      } else {
        setError(`❌ Error inesperado: ${String(error)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Manejar autenticación
  const handleAuthenticate = async () => {
    if (!passkeyState.credentialId) {
      setError('❌ No hay passkey registrado');
      return;
    }

    if (!passkeyState.accountAddress) {
      setError('❌ No hay cuenta desplegada');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      setSuccess('🔐 Autenticando con passkey...');
      
      // Autenticar con passkey
      setSuccess('🔑 Autenticando con Windows Hello...');
      const result = await authenticateWithPasskey(passkeyState.credentialId);
      
      // Validar el resultado
      if (!validateAuthenticationResult(result)) {
        setError('❌ Error: resultado de autenticación inválido');
        return;
      }

      // Procesar la firma
      setSuccess('🔗 Procesando firma en blockchain...');
      const processResult = await processWebAuthnSignature(
        passkeyState.accountAddress,
        {
          authenticatorData: result.response.authenticatorData,
          clientDataJSON: result.response.clientDataJSON,
          signature: result.response.signature
        }
      );

      if (processResult.success) {
        setSuccess('✅ ¡Autenticación exitosa! TxID: ' + processResult.transactionId);
      } else {
        setError('❌ Error procesando la firma');
      }
      
    } catch (error) {
      setError(`❌ Error autenticando: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      console.error('Error en autenticación:', error);
    } finally {
      setLoading(false);
    }
  };

  // Resetear aplicación
  const handleReset = () => {
    localStorage.removeItem('passkey-state');
    localStorage.removeItem('bundler-key');
    setPasskeyState({
      username: '',
      credentialId: null,
      accountAddress: null,
      publicKey: null,
    });
    setCurrentStep('setup');
    setError('');
    setSuccess('');
  };

  // Renderizado de soporte del navegador
  const renderBrowserSupport = () => {
    if (!browserSupport) return null;

    return (
      <div className={`mb-4 p-3 rounded-md text-sm backdrop-blur-sm border ${
        browserSupport.supported 
          ? 'bg-green-500/20 text-green-300 border-green-500/30'
          : 'bg-red-500/20 text-red-300 border-red-500/30'
      }`}>
        {browserSupport.supported ? (
          <div>
            ✅ <strong>WebAuthn soportado</strong>
            {browserSupport.platformAuthenticator ? (
              <div>🎉 Autenticador de plataforma disponible</div>
            ) : (
              <div>⚠️ Sin autenticador de plataforma (usa llave de seguridad)</div>
            )}
          </div>
        ) : (
          <div>❌ <strong>WebAuthn no soportado</strong></div>
        )}
      </div>
    );
  };

  // Renderizado del paso setup
  const renderSetupStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-center text-white">
          🚀 Soroban Passkey Demo Avanzado
        </h2>
        <p className="text-gray-300 text-center mb-6">
          Cuenta blockchain sin contraseñas usando WebAuthn y Soroban
        </p>
      </div>

      {renderBrowserSupport()}

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
          Nombre de usuario
        </label>
        <input
          id="username"
          type="text"
          value={passkeyState.username}
          onChange={(e) => setPasskeyState({ ...passkeyState, username: e.target.value })}
          placeholder="Ingresa tu nombre de usuario"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div className="flex space-x-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Volver</span>
          </button>
        )}
        
        <button
          onClick={() => setCurrentStep('register')}
          disabled={loading || !passkeyState.username.trim() || !browserSupport?.supported}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Continuar al Registro
        </button>
      </div>
    </div>
  );

  // Renderizado del paso registro
  const renderRegisterStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-center text-white">
          🔐 Crear Passkey
        </h2>
        <p className="text-gray-300 text-center mb-6">
          Usuario: <strong>{passkeyState.username}</strong>
        </p>
      </div>

      <div className="bg-blue-500/20 p-4 rounded-md border border-blue-500/30 backdrop-blur-sm">
        <h3 className="font-semibold text-blue-300 mb-2">¿Qué va a pasar?</h3>
        <ul className="text-blue-200 text-sm space-y-1">
          <li>• Se creará un passkey en tu dispositivo</li>
          <li>• Se desplegará una cuenta en Stellar</li>
          <li>• Podrás usar biometría para autenticar</li>
        </ul>
      </div>

      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '⏳ Creando...' : '🔐 Crear Passkey'}
      </button>

      <button
        onClick={() => setCurrentStep('setup')}
        disabled={loading}
        className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
      >
        ← Volver
      </button>
    </div>
  );

  // Renderizado del dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-center text-white">
          🎛️ Dashboard
        </h2>
        <p className="text-gray-300 text-center mb-6">
          Usuario: <strong>{passkeyState.username}</strong>
        </p>
      </div>

      <div className="bg-green-500/20 p-4 rounded-md border border-green-500/30 backdrop-blur-sm">
        <h3 className="font-semibold text-green-300 mb-2">✅ Cuenta Activa</h3>
        <div className="text-green-200 text-sm space-y-2">
          <div>
            <strong>Dirección:</strong> 
            <div className="font-mono text-xs break-all">
              {passkeyState.accountAddress}
            </div>
          </div>
          {passkeyState.publicKey && (
            <div>
              <strong>Clave Pública:</strong>
              <div className="font-mono text-xs break-all">
                {passkeyState.publicKey.substring(0, 32)}...
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        <button
          onClick={handleAuthenticate}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? '⏳ Autenticando...' : '🔐 Probar Autenticación'}
        </button>

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
        >
          🔄 Resetear Todo
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          {/* Mensajes de estado */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md backdrop-blur-sm">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-md backdrop-blur-sm">
              <p className="text-green-300 text-sm">{success}</p>
            </div>
          )}

          {/* Contenido principal */}
          {currentStep === 'setup' && renderSetupStep()}
          {currentStep === 'register' && renderRegisterStep()}
          {currentStep === 'authenticate' && renderRegisterStep()}
          {currentStep === 'dashboard' && renderDashboard()}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-white/70 text-sm">
          <p>Powered by Soroban + WebAuthn</p>
          <p>Implementación basada en kalepail/soroban-passkey</p>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>
    </div>
  );
};

export default AdvancedPasskeyDemo;