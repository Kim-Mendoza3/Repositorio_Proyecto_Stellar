"use client";

import { useState, useEffect, useCallback } from "react";
import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
} from "@/lib/webauthn";

export interface PasskeyResult {
  success: boolean;
  credentialId?: string;
  publicKey?: Uint8Array;
  userHandle?: string;
  signature?: Uint8Array;
  error?: string;
}

export function usePasskey() {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsSupported(browserSupportsWebAuthn());
  }, []);

  const createPasskey = useCallback(
    async (username: string): Promise<PasskeyResult> => {
      if (!isSupported) {
        return {
          success: false,
          error: "WebAuthn is not supported in this browser",
        };
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await startRegistration(username);

        if (!result.success) {
          setError(result.error || "Failed to create passkey");
          return result;
        }

        console.log("✅ Passkey created:", {
          credentialId: result.credentialId,
          publicKeyLength: result.publicKey?.length,
        });

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [isSupported]
  );

  const authenticate = useCallback(async (): Promise<PasskeyResult> => {
    if (!isSupported) {
      return {
        success: false,
        error: "WebAuthn is not supported in this browser",
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await startAuthentication();

      if (!result.success) {
        setError(result.error || "Authentication failed");
        return result;
      }

      console.log("✅ Authenticated:", {
        credentialId: result.credentialId,
        userHandle: result.userHandle,
        signatureLength: result.signature?.length,
      });

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isSupported,
    isLoading,
    error,
    createPasskey,
    authenticate,
    clearError,
  };
}
