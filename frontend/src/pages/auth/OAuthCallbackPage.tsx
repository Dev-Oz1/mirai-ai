import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { authAPI } from '../../services/api';

export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState('');
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const provider = localStorage.getItem('oauth_provider') as 'google' | 'github' | null;

      if (!code || !state || !provider) {
        setError('Login callback is invalid. Please try again.');
        return;
      }

      try {
        const redirectUri = `${window.location.origin}/auth/oauth/callback`;
        const tokenResponse = await authAPI.oauthExchange(provider, {
          code,
          state,
          redirect_uri: redirectUri,
        });

        await loginWithToken(tokenResponse.access_token);
        localStorage.removeItem('oauth_provider');
        navigate('/dashboard', { replace: true });
      } catch (err: any) {
        localStorage.removeItem('oauth_provider');
        setError(err?.response?.data?.detail || 'Sign in failed. Please try again.');
      }
    };

    run();
  }, [loginWithToken, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-200 text-center">
        {!error ? (
          <>
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center">
              <Loader2 className="h-7 w-7 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Signing you in</h1>
            <p className="mt-2 text-sm text-gray-600">Please wait a moment...</p>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-red-700">Sign in failed</h1>
            <p className="mt-2 text-sm text-gray-700">{error}</p>
            <button
              className="mt-4 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 px-4 py-2 text-sm font-medium text-white"
              onClick={() => navigate('/login', { replace: true })}
              type="button"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}