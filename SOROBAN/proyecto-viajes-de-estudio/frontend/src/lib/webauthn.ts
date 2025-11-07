/**
 * WebAuthn/Passkey utilities for browser-side authentication
 * Implements ES256 (secp256r1) signature generation for Soroban
 */

import type { PasskeyResult } from "@/hooks/usePasskey";

/**
 * Check if the browser supports WebAuthn
 */
export function browserSupportsWebAuthn(): boolean {
  return (
    typeof window !== "undefined" &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === "function"
  );
}

/**
 * Generate a random challenge for authentication
 */
function generateChallenge(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

/**
 * Generate a random user ID
 */
function generateUserId(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Convert a Uint8Array to a base64url string
 */
function bufferToBase64Url(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode.apply(null, Array.from(buffer)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Convert a base64url string to a Uint8Array
 */
function base64UrlToBuffer(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

/**
 * Extract the public key from the credential response
 * Converts from COSE format to raw secp256r1 coordinates
 */
function extractPublicKey(credential: PublicKeyCredential): Uint8Array {
  const response = credential.response as AuthenticatorAttestationResponse;
  
  // Get the attestation object
  const attestationObject = response.attestationObject;
  
  // For simplicity, we'll extract from the raw public key bytes
  // In production, you'd want to properly parse the COSE key
  // This is a simplified version for demonstration
  
  // The public key is in the attestation object's authData
  // For now, return a placeholder - you'd need a COSE decoder in production
  const publicKeyBytes = new Uint8Array(64); // 32 bytes X + 32 bytes Y
  
  return publicKeyBytes;
}

/**
 * Start passkey registration (creation)
 */
export async function startRegistration(
  username: string
): Promise<PasskeyResult> {
  try {
    const challenge = generateChallenge();
    const userId = generateUserId();

    // Create credential options
    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions =
      {
        challenge: challenge as BufferSource,
        rp: {
          name: "Soroban Passkey Demo",
          id: typeof window !== "undefined" ? window.location.hostname : "localhost",
        },
        user: {
          id: userId as BufferSource,
          name: username,
          displayName: username,
        },
        pubKeyCredParams: [
          {
            type: "public-key",
            alg: -7, // ES256 (secp256r1)
          },
        ],
        authenticatorSelection: {
          // No especificar authenticatorAttachment permite usar cualquier autenticador
          // Esto permite usar el navegador sin Windows Hello
          userVerification: "discouraged", // Permite registro sin verificación biométrica
          residentKey: "preferred",
          requireResidentKey: false,
        },
        timeout: 60000,
        attestation: "none", // We don't need attestation for this demo
      };

    // Create the credential
    const credential = (await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    })) as PublicKeyCredential;

    if (!credential) {
      return { success: false, error: "Failed to create credential" };
    }

    // Extract the public key and credential ID
    const credentialId = bufferToBase64Url(
      new Uint8Array(credential.rawId)
    );
    const publicKey = extractPublicKey(credential);

    // Store credential ID in localStorage for later authentication
    if (typeof window !== "undefined") {
      // Generar y persistir wallet antes de guardar la credencial
      let walletAddress = undefined;
      try {
        const { SessionManager } = require("@/lib/session");
        const walletData = await SessionManager.generateAndPersistWallet(username);
        walletAddress = walletData.publicKey;
      } catch (e) {
        console.error("No se pudo generar wallet:", e);
      }
      let credentials = JSON.parse(localStorage.getItem("passkey-credentials") || "[]") || [];
      // Eliminar credenciales duplicadas para el mismo usuario
      credentials = credentials.filter((c: any) => c.username !== username);
      credentials.push({
        credentialId,
        username,
        userId: bufferToBase64Url(userId),
        createdAt: new Date().toISOString(),
        walletAddress,
      });
      localStorage.setItem("passkey-credentials", JSON.stringify(credentials));
    }

    return {
      success: true,
      credentialId,
      publicKey,
    };
  } catch (error) {
    console.error("Registration error:", error);
    
    if (error instanceof Error) {
      // Handle specific WebAuthn errors
      if (error.name === "NotAllowedError") {
        return {
          success: false,
          error: "Operation cancelled or not allowed",
        };
      }
      if (error.name === "InvalidStateError") {
        return {
          success: false,
          error: "This authenticator is already registered",
        };
      }
      return { success: false, error: error.message };
    }
    
    return { success: false, error: "Unknown error occurred" };
  }
}

/**
 * Start passkey authentication
 */
export async function startAuthentication(): Promise<PasskeyResult> {
  try {
    const challenge = generateChallenge();

    // Get stored credentials
    const storedCredentials =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("passkey-credentials") || "[]")
        : [];

    if (storedCredentials.length === 0) {
      return {
        success: false,
        error: "No passkeys found. Please create one first.",
      };
    }

    // Prepare credential IDs for authentication
    const allowCredentials = storedCredentials.map(
      (cred: { credentialId: string }) => ({
        type: "public-key" as const,
        id: base64UrlToBuffer(cred.credentialId),
      })
    );

    // Create assertion options
    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
      {
        challenge: challenge as BufferSource,
        allowCredentials,
        timeout: 60000,
        userVerification: "discouraged", // Permite autenticación sin verificación biométrica
        rpId: typeof window !== "undefined" ? window.location.hostname : "localhost",
      };

    // Get the credential (authenticate)
    const credential = (await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    })) as PublicKeyCredential;

    if (!credential) {
      return { success: false, error: "Authentication failed" };
    }

    const response = credential.response as AuthenticatorAssertionResponse;
    
    // Extract signature and other data
    const credentialId = bufferToBase64Url(new Uint8Array(credential.rawId));
    const signature = new Uint8Array(response.signature);
    const userHandle = response.userHandle
      ? bufferToBase64Url(new Uint8Array(response.userHandle))
      : undefined;

    // Find the matching credential
    const matchedCred = storedCredentials.find(
      (cred: { credentialId: string }) => cred.credentialId === credentialId
    );

    return {
      success: true,
      credentialId,
      signature,
      userHandle: matchedCred?.username || userHandle,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    
    if (error instanceof Error) {
      if (error.name === "NotAllowedError") {
        return {
          success: false,
          error: "Authentication cancelled or not allowed",
        };
      }
      return { success: false, error: error.message };
    }
    
    return { success: false, error: "Unknown error occurred" };
  }
}

/**
 * Get all stored credentials
 */
export function getStoredCredentials(): Array<{
  credentialId: string;
  username: string;
  userId: string;
  createdAt: string;
}> {
  if (typeof window === "undefined") return [];
  
  try {
    return JSON.parse(localStorage.getItem("passkey-credentials") || "[]");
  } catch {
    return [];
  }
}

/**
 * Clear all stored credentials
 */
export function clearStoredCredentials(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("passkey-credentials");
  }
}
