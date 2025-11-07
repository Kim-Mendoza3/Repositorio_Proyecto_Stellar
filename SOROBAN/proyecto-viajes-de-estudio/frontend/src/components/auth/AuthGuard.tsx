/**
 * AuthGuard - Protect routes that require authentication
 * 
 * Usage:
 * <AuthGuard>
 *   <ProtectedComponent />
 * </AuthGuard>
 * 
 * For sensitive operations (like transactions):
 * <AuthGuard requireReauth={true}>
 *   <TransactionComponent />
 * </AuthGuard>
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SessionManager } from '@/lib/session';

interface AuthGuardProps {
  children: React.ReactNode;
  requireReauth?: boolean;
}

export default function AuthGuard({ children, requireReauth = false }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const isAuthenticated = SessionManager.isAuthenticated();
        
        if (!isAuthenticated) {
          console.log('🚫 Not authenticated, redirecting to login...');
          setIsLoading(false);
          setIsAuthorized(false);
          router.push('/login');
          return;
        }

        // If reauth is required, check last verification time
        if (requireReauth && SessionManager.requiresReauth()) {
          console.log('🔐 Re-authentication required for sensitive operation');
          // Store the current URL to redirect back after reauth
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('auth-redirect', window.location.pathname);
          }
          setIsLoading(false);
          setIsAuthorized(false);
          router.push('/login?reauth=true');
          return;
        }

        // User is authorized
        console.log('✅ User authenticated');
        setIsAuthorized(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsLoading(false);
        setIsAuthorized(false);
        router.push('/login');
      }
    };

    checkAuth();
  }, []); // Empty dependency array - only run once on mount

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center max-w-md p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-6">
            Necesitas iniciar sesión para acceder a esta página.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
