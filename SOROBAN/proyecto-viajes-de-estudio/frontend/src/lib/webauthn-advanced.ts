import { WebAuthn } from '@darkedges/capacitor-native-webauthn';
import { Capacitor } from '@capacitor/core';
import base64url from 'base64url';
import { decode } from 'cbor-x';
import { hash } from '@stellar/stellar-sdk';

export interface WebAuthnRegistrationResult {
  id: string;
  rawId: string;
  response: {
    attestationObject: string;
    clientDataJSON: string;
    transports: string[];
    publicKeyAlgorithm?: number;
    publicKey?: string;
  };
  type: string;
  clientExtensionResults: {};
  authenticatorAttachment: string;
}

export interface WebAuthnAuthenticationResult {
  id: string;
  rawId: string;
  response: {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
    userHandle: string;
  };
  type: string;
  clientExtensionResults: {};
  authenticatorAttachment: string;
}

export interface PasskeyCredentials {
  credentialId: string;
  publicKey: Uint8Array;
  salt: Uint8Array;
  contractSalt: Uint8Array;
}

export class WebAuthnError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'WebAuthnError';
  }
}

// Verificar soporte de WebAuthn
export async function isWebAuthnSupported(): Promise<boolean> {
  try {
    const result = await WebAuthn.isWebAuthnAvailable();
    return result.value;
  } catch (error) {
    console.warn('Error checking WebAuthn support:', error);
    return false;
  }
}

// Verificar soporte específico de Windows Hello/autenticador platform
export async function isWindowsHelloAvailable(): Promise<boolean> {
  return await isWebAuthnSupported();
}

// Crear una nueva passkey usando la implementación oficial
export async function createPasskey(
  username: string,
  userDisplayName?: string
): Promise<WebAuthnRegistrationResult> {
  try {
    // Verificar soporte primero
    const supported = await isWebAuthnSupported();
    if (!supported) {
      throw new WebAuthnError('WebAuthn no es soportado en este navegador');
    }

    const registerRes = await WebAuthn.startRegistration({
      challenge: base64url('createchallenge'),
      rp: {
        id: Capacitor.isNativePlatform() ? "passkey.sorobanbyexample.org" : undefined,
        name: "SoroPass",
      },
      user: {
        id: base64url(username),
        name: username,
        displayName: userDisplayName || username,
      },
      authenticatorSelection: {
        requireResidentKey: false,
        residentKey: Capacitor.getPlatform() === "android" ? "preferred" : "discouraged",
        userVerification: "discouraged",
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }],
      attestation: "none",
    });

    console.log('Registration result:', JSON.stringify(registerRes, null, 2));
    return registerRes as WebAuthnRegistrationResult;
    
  } catch (error: any) {
    console.error('Error creating passkey:', error);
    
    if (error.message?.includes('canceled')) {
      throw new WebAuthnError('Operación cancelada por el usuario', 'USER_CANCELLED');
    } else if (error.message?.includes('not supported')) {
      throw new WebAuthnError('WebAuthn no es soportado', 'NOT_SUPPORTED');
    } else if (error.message?.includes('security')) {
      throw new WebAuthnError('Error de seguridad', 'SECURITY_ERROR');
    } else {
      throw new WebAuthnError(`Error inesperado: ${error.message}`, 'UNKNOWN_ERROR');
    }
  }
}

// Autenticar con passkey existente usando la implementación oficial
export async function authenticateWithPasskey(
  credentialId?: string
): Promise<WebAuthnAuthenticationResult> {
  try {
    // Verificar soporte primero
    const supported = await isWebAuthnSupported();
    if (!supported) {
      throw new WebAuthnError('WebAuthn no es soportado en este navegador');
    }

    const signRes = await WebAuthn.startAuthentication({
      challenge: base64url('createchallenge'),
      rpId: Capacitor.isNativePlatform() ? "passkey.sorobanbyexample.org" : undefined,
      userVerification: "discouraged",
    });

    console.log('Authentication result:', JSON.stringify(signRes, null, 2));
    return signRes as WebAuthnAuthenticationResult;
    
  } catch (error: any) {
    console.error('Error authenticating with passkey:', error);
    
    if (error.message?.includes('canceled')) {
      throw new WebAuthnError('Operación cancelada por el usuario', 'USER_CANCELLED');
    } else if (error.message?.includes('not supported')) {
      throw new WebAuthnError('WebAuthn no es soportado', 'NOT_SUPPORTED');
    } else if (error.message?.includes('security')) {
      throw new WebAuthnError('Error de seguridad', 'SECURITY_ERROR');
    } else {
      throw new WebAuthnError(`Error inesperado: ${error.message}`, 'UNKNOWN_ERROR');
    }
  }
}

// Extraer información de clave pública usando la implementación oficial
export function extractPublicKeyInfo(registrationResult: WebAuthnRegistrationResult): PasskeyCredentials {
  try {
    const contractSalt = hash(base64url.toBuffer(registrationResult.id));

    console.log('Processing registration result:', JSON.stringify(registrationResult, null, 2));

    if (registrationResult.response.attestationObject) {
      const { publicKeyObject } = getPublicKeyObject(registrationResult.response.attestationObject);
      
      // Los objetos CBOR decodificados usan índices numéricos para las claves
      const x = publicKeyObject[-2] || publicKeyObject['-2'];
      const y = publicKeyObject[-3] || publicKeyObject['-3'];
      
      if (!x || !y) {
        console.error('No se pudieron extraer las coordenadas X e Y de la clave pública');
        throw new Error('Coordenadas de clave pública no encontradas');
      }
      
      const publicKey = new Uint8Array(65);
      publicKey[0] = 4; // (0x04 prefix) para punto no comprimido
      publicKey.set(new Uint8Array(x), 1);
      publicKey.set(new Uint8Array(y), 33);

      return {
        credentialId: registrationResult.id,
        publicKey,
        salt: contractSalt,
        contractSalt,
      };
    } else {
      return {
        credentialId: registrationResult.id,
        publicKey: new Uint8Array(0),
        salt: contractSalt,
        contractSalt,
      };
    }
  } catch (error) {
    console.error('Error extracting public key info:', error);
    throw new WebAuthnError(`Error extrayendo información de clave pública: ${error}`);
  }
}

// Función auxiliar para extraer clave pública del objeto de attestation
function getPublicKeyObject(attestationObject: string) {
  const { authData } = decode(base64url.toBuffer(attestationObject));
  const authDataUint8Array = new Uint8Array(authData);
  const authDataView = new DataView(authDataUint8Array.buffer, 0, authDataUint8Array.length);

  let offset = 0;

  // RP ID Hash (32 bytes)
  const rpIdHash = authData.slice(offset, offset + 32);
  offset += 32;

  // Flags (1 byte)
  const flags = authDataView.getUint8(offset);
  offset += 1;

  // Sign Count (4 bytes, big endian)
  const signCount = authDataView.getUint32(offset, false);
  offset += 4;

  // Attested Credential Data, if present
  if (flags & 0x40) { // Checking the AT flag
    // AAGUID (16 bytes)
    const aaguid = authData.slice(offset, offset + 16);
    offset += 16;

    // Credential ID Length (2 bytes, big endian)
    const credentialIdLength = authDataView.getUint16(offset, false);
    offset += 2;

    // Credential ID (variable length)
    const credentialId = authData.slice(offset, offset + credentialIdLength);
    offset += credentialIdLength;

    // Public Key (remaining bytes)
    const publicKeyBytes = authData.slice(offset);
    const publicKeyObject = decode(publicKeyBytes);

    return {
      publicKeyObject,
    };
  }

  throw new Error('No attested credential data found');
}

// Utilidades para validación de datos
export function validateRegistrationResult(result: any): result is WebAuthnRegistrationResult {
  return (
    result &&
    typeof result.id === 'string' &&
    typeof result.rawId === 'string' &&
    result.response &&
    typeof result.response.attestationObject === 'string' &&
    typeof result.response.clientDataJSON === 'string' &&
    typeof result.type === 'string'
  );
}

export function validateAuthenticationResult(result: any): result is WebAuthnAuthenticationResult {
  return (
    result &&
    typeof result.id === 'string' &&
    typeof result.rawId === 'string' &&
    result.response &&
    typeof result.response.authenticatorData === 'string' &&
    typeof result.response.clientDataJSON === 'string' &&
    typeof result.response.signature === 'string' &&
    typeof result.type === 'string'
  );
}