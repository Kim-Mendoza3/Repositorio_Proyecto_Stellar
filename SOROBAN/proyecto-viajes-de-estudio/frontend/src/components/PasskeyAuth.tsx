"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SessionManager } from "@/lib/session";
import { usePasskey } from "@/hooks/usePasskey";

export function PasskeyAuth() {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<string>("");
  const router = useRouter();
  
  // Use REAL Passkey hook (WebAuthn)
  const { isSupported, isLoading, error, createPasskey, authenticate, clearError } = usePasskey();

  const handleRegister = async () => {
    const normalizedUsername = username.trim().toLowerCase();
    if (!normalizedUsername) {
      setStatus("❌ Por favor ingresa un nombre de usuario");
      return;
    }

    clearError();
    setStatus("🔐 Creando Passkey con WebAuthn...");

    try {
      // Create REAL Passkey using WebAuthn
      const result = await createPasskey(username);

      if (!result.success) {
        setStatus(`❌ Error: ${result.error}`);
        return;
      }

      setStatus("✅ Passkey creado! Creando sesión...");

      // Buscar si ya existe credencial para este usuario
      let credentials = [];
      const storedCreds = localStorage.getItem('passkey-credentials');
      if (storedCreds) {
        credentials = JSON.parse(storedCreds);
      }
      let credIndex = credentials.findIndex((c: any) => c.username === normalizedUsername);
      let walletAddress;
      if (credIndex !== -1 && credentials[credIndex].walletAddress) {
        // Si ya existe, reutilizar la wallet y actualizar credentialId si cambió
        walletAddress = credentials[credIndex].walletAddress;
        credentials[credIndex].credentialId = result.credentialId!;
        credentials[credIndex].email = `${normalizedUsername}@studytrips.mx`;
        localStorage.setItem('passkey-credentials', JSON.stringify(credentials));
      } else {
        // Si no existe, crear nueva wallet derivada de la clave pública y asociar
        walletAddress = await SessionManager.createSession(
          normalizedUsername,
          result.credentialId!,
          `${normalizedUsername}@studytrips.mx`
        ).then(s => s.user.walletAddress);
        credentials.push({
          username: normalizedUsername,
          credentialId: result.credentialId!,
          email: `${normalizedUsername}@studytrips.mx`,
          walletAddress
        });
        localStorage.setItem('passkey-credentials', JSON.stringify(credentials));
      }

      setStatus(`✅ ¡Bienvenido ${username}! Tu cuenta está lista para solicitar financiamiento de viajes.`);
      // Redirigir al dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
      
    } catch (err) {
      console.error('Registration error:', err);
      setStatus(`❌ Error al registrar: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const handleAuthenticate = async () => {
    clearError();
    setStatus("🔐 Autenticando con Passkey...");

    try {
      // Authenticate using REAL WebAuthn
      const result = await authenticate();

      if (!result.success) {
        setStatus(`❌ Error: ${result.error}`);
        return;
      }

      setStatus("✅ Autenticado! Verificando sesión...");

      // Get stored credentials from localStorage to find username
      const normalizedUsername = username.trim().toLowerCase();
      const storedCreds = localStorage.getItem('passkey-credentials');
      if (!storedCreds) {
        setStatus("❌ No se encontraron credenciales guardadas");
        return;
      }

      const credentials = JSON.parse(storedCreds);
      // Buscar por username normalizado
      let credential = credentials.find((c: any) => c.username === normalizedUsername);
      // Si no existe, buscar por credentialId (por si el usuario cambió el nombre)
      if (!credential && result.credentialId) {
        credential = credentials.find((c: any) => c.credentialId === result.credentialId);
        // Si se encuentra, actualizar el nombre de usuario
        if (credential) {
          credential.username = normalizedUsername;
          localStorage.setItem('passkey-credentials', JSON.stringify(credentials));
        }
      }
      if (!credential) {
        setStatus("❌ Credencial no reconocida. Por favor registra tu Passkey primero.");
        return;
      }


      // Recuperar wallet asociada al usuario
      let walletAddress = credential.walletAddress;
      if (!walletAddress) {
        // Si no existe, crear una nueva (solo la primera vez)
        walletAddress = await SessionManager.getWalletAddress();
      }

      // Crear sesión con la wallet recuperada
      await SessionManager.createSession(
        credential.username,
        result.credentialId!,
        credential.email || `${credential.username}@studytrips.mx`
      );

      setStatus(`✅ ¡Bienvenido de vuelta, ${credential.username}!`);

      // Redirect to dashboard after 1 segundo
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
      
    } catch (err) {
      console.error('Authentication error:', err);
      setStatus(`❌ Error al autenticar: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  if (!isSupported) {
    return (
      <div className="glass rounded-2xl p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4 text-white">
            Navegador no compatible
          </h2>
          <p className="text-blue-100">
            Tu navegador no soporta Passkeys/WebAuthn. Por favor usa Chrome, Safari, Edge o Firefox actualizados.
          </p>
          <p className="text-sm text-blue-200 mt-4">
            Requiere HTTPS en producción y Windows Hello, FaceID o clave de seguridad física.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-8 space-y-6 bg-white/10 backdrop-blur-sm border border-white/20">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2 text-white">
          Acceso a tu cuenta
        </h2>
        <p className="text-blue-100">
          Crea o accede con tu Passkey biométrico
        </p>
      </div>

      {/* Campo de usuario */}
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium mb-2 text-blue-100"
        >
          Nombre de usuario
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Ej: juan.perez"
          className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
          disabled={isLoading}
        />
      </div>

      {/* Botones de acción */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={handleRegister}
          disabled={isLoading || !username.trim()}
          className="px-6 py-4 bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-500 hover:to-green-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Spinner />
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Registrarse</span>
            </>
          )}
        </button>

        <button
          onClick={handleAuthenticate}
          disabled={isLoading}
          className="px-6 py-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Spinner />
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              <span>Entrar</span>
            </>
          )}
        </button>
      </div>

      {/* Mensaje de estado */}
      {(status || error) && (
        <div
          className={`p-4 rounded-lg ${
            error
              ? "bg-red-500/20 text-red-100 border border-red-400/50"
              : status.includes("✅")
              ? "bg-green-500/20 text-green-100 border border-green-400/50"
              : "bg-blue-500/20 text-blue-100 border border-blue-400/50"
          }`}
        >
          <p className="text-sm font-medium break-words">{error || status}</p>
        </div>
      )}

      {/* Info del navegador */}
      <div className="pt-4 border-t border-white/20">
        <p className="text-xs text-blue-200 text-center">
          🔒 Tu biometría y datos personales nunca salen de tu dispositivo - Privacidad garantizada
        </p>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}
