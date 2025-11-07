/**
 * Session Management for Passkey-authenticated users
 * Handles user sessions in localStorage with automatic expiration
 */

'use client';

import { UserSession } from '@/types/session';
import { Keypair } from '@stellar/stellar-sdk';

const SESSION_KEY = 'ebas-session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const REAUTH_THRESHOLD = 30 * 60 * 1000; // Re-auth every 30 minutes for sensitive operations

/**
 * Generate a real Stellar wallet address
 * Uses dynamic import to avoid SSR issues with Stellar SDK
 */
async function generateStellarWallet(): Promise<string> {
  try {
    // Dynamic import to avoid SSR issues
    const { Keypair } = await import('@stellar/stellar-sdk');
    const keypair = Keypair.random();
    // Guardar clave privada y pública de forma cifrada en localStorage
    if (typeof window !== 'undefined') {
      // Cifrado simple para demo (en producción usar Web Crypto API)
      const walletData = {
        publicKey: keypair.publicKey(),
        secret: btoa(keypair.secret()), // Cifrado base64 (solo demo)
      };
      localStorage.setItem(`stellar-wallet-${keypair.publicKey()}`, JSON.stringify(walletData));
    }
    return keypair.publicKey();
  } catch (error) {
    console.error('Error generating Stellar wallet:', error);
    // Fallback to mock wallet if SDK fails
    return generateMockWallet();
  }

}

/**
 * Genera y persiste una clave Ed25519 para el usuario en el registro
 * Retorna la dirección pública (wallet) y guarda la clave privada cifrada
 */
export async function generateAndPersistWallet(username: string): Promise<{ publicKey: string; secret: string }> {
  const keypair = Keypair.random();
  // Cifrado simple para demo (en producción usar Web Crypto API)
  const walletData = {
    publicKey: keypair.publicKey(),
    secret: btoa(keypair.secret()),
    username,
    createdAt: new Date().toISOString()
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(`stellar-wallet-${username}`, JSON.stringify(walletData));
  }
  return { publicKey: keypair.publicKey(), secret: keypair.secret() };
}

/**
 * Recupera la clave pública y privada Ed25519 asociada al usuario
 */
export function getWalletForUser(username: string): { publicKey: string; secret: string } | null {
  if (typeof window === 'undefined') return null;
  const walletRaw = localStorage.getItem(`stellar-wallet-${username}`);
  if (!walletRaw) return null;
  try {
    const walletData = JSON.parse(walletRaw);
    return {
      publicKey: walletData.publicKey,
      secret: atob(walletData.secret)
    };
  } catch {
    return null;
  }
}

/**
 * Generate a mock Stellar wallet address (fallback)
 * Uses the funded testnet address for demo purposes
 */
function generateMockWallet(): string {
  // Use the VALID funded testnet address (56 characters, 10,000 XLM)
  // This address was confirmed working with transaction: 31935b49f683ba4f139211bd4f586822db2ede8bba68079352dfca95dc090c66
  // In production, each user would have their own wallet
  return 'GDJYLRW4DZK7LVGCNAKBO42FGWVDRP2G7BEAXWWUC5E63ZENZ3RAPAKL';
}

export class SessionManager {
  /**
   * Recuperar la clave privada de la wallet Stellar asociada al usuario
   */
  static getPrivateKey(): string | null {
    const session = this.getSession();
    if (!session) return null;
    const publicKey = session.user.walletAddress;
    if (typeof window !== 'undefined') {
      const walletRaw = localStorage.getItem(`stellar-wallet-${publicKey}`);
      if (!walletRaw) return null;
      try {
        const walletData = JSON.parse(walletRaw);
        return walletData.secret ? atob(walletData.secret) : null;
      } catch {
        return null;
      }
    }
    return null;
  }
  /**
   * Create a new session after successful registration or login
   * For MVP, uses a shared funded testnet wallet
   * In production, would generate unique wallets per user
   */
  static async createSession(
    username: string,
    credentialId: string,
    email?: string
  ): Promise<UserSession> {
    // Recuperar o generar wallet Ed25519 para el usuario
    let walletData = getWalletForUser(username);
    if (!walletData) {
      walletData = await generateAndPersistWallet(username);
    }
    const walletAddress = walletData.publicKey;

    // Guardar credencial en array localStorage
    if (typeof window !== 'undefined') {
      let credentials = [];
      const storedCreds = localStorage.getItem('passkey-credentials');
      if (storedCreds) {
        credentials = JSON.parse(storedCreds);
      }
      let credIndex = credentials.findIndex((c: any) => c.username === username);
      if (credIndex !== -1) {
        credentials[credIndex].credentialId = credentialId;
        credentials[credIndex].walletAddress = walletAddress;
        credentials[credIndex].email = email;
      } else {
        credentials.push({
          username,
          credentialId,
          email,
          walletAddress
        });
      }
      localStorage.setItem('passkey-credentials', JSON.stringify(credentials));
    }

    const session: UserSession = {
      authenticated: true,
      user: {
        id: crypto.randomUUID(),
        username,
        email,
        walletAddress,
        credentialId
      },
      passkey: {
        credentialId,
        lastVerified: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + SESSION_DURATION).toISOString()
    };

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      console.log('✅ Session created for user:', username);
    }

    return session;
  }

  /**
   * Get the current session from localStorage
   * Returns null if no session exists or if expired
   */
  static getSession(): UserSession | null {
    if (typeof window === 'undefined') return null;

    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (!sessionData) return null;

      const session: UserSession = JSON.parse(sessionData);
      
      // Check if session has expired
      if (new Date(session.expiresAt) < new Date()) {
        console.log('⏰ Session expired, clearing...');
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error reading session:', error);
      return null;
    }
  }

  /**
   * Check if there is a valid active session
   */
  static validateSession(): boolean {
    const session = this.getSession();
    return session !== null && session.authenticated;
  }

  /**
   * Clear the current session (logout)
   */
  static clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
      console.log('🔓 Session cleared');
    }
  }

  /**
   * Check if re-authentication is required
   * Used for sensitive operations like trip transactions (e.g., booking/payments)
   */
  static requiresReauth(): boolean {
    const session = this.getSession();
    if (!session) return true;

    const lastVerified = new Date(session.passkey.lastVerified);
    const now = new Date();
    const timeSinceLastAuth = now.getTime() - lastVerified.getTime();

    return timeSinceLastAuth > REAUTH_THRESHOLD;
  }

  /**
   * Update the last verification timestamp
   * Call this after successful re-authentication
   */
  static updateLastVerified(): void {
    const session = this.getSession();
    if (!session) return;

    session.passkey.lastVerified = new Date().toISOString();
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      console.log('🔄 Updated last verification time');
    }
  }

  /**
   * Get the authenticated user's data
   */
  static getUser(): UserSession['user'] | null {
    const session = this.getSession();
    return session?.user || null;
  }

  /**
   * Get the authenticated user's wallet address
   */
  static getWalletAddress(): string | null {
    const session = this.getSession();
    return session?.user.walletAddress || null;
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return this.validateSession();
  }

  /**
   * Get session expiration time
   */
  static getExpiresAt(): Date | null {
    const session = this.getSession();
    return session ? new Date(session.expiresAt) : null;
  }

  /**
   * Get time remaining until session expires (in milliseconds)
   */
  static getTimeRemaining(): number {
    const expiresAt = this.getExpiresAt();
    if (!expiresAt) return 0;

    const now = new Date();
    return Math.max(0, expiresAt.getTime() - now.getTime());
  }
}
