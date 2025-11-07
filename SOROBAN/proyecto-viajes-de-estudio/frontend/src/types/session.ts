/**
 * Types for user session management
 * Based on WebAuthn/Passkey authentication
 */

export interface UserSession {
  authenticated: boolean;
  user: {
    id: string;
    username: string;
    email?: string;
    walletAddress: string;
    credentialId: string;
  };
  passkey: {
    credentialId: string;
    lastVerified: string;
  };
  createdAt: string;
  expiresAt: string;
}

export interface SessionManager {
  createSession(userData: UserSession['user'], credentialId: string): UserSession;
  getSession(): UserSession | null;
  validateSession(): boolean;
  clearSession(): void;
  requiresReauth(): boolean;
}
