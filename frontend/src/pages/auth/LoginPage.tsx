import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, startOAuthLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoadingProvider, setOauthLoadingProvider] = useState<'google' | null>(null);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google') => {
    setError('');
    setOauthLoadingProvider(provider);
    try {
      await startOAuthLogin(provider);
    } catch (err: any) {
      setError(err?.response?.data?.detail || `${provider} login is unavailable`);
      setOauthLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <Logo />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-600">Enter your credentials to access your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link to="/forgot-password" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !!oauthLoadingProvider}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={isLoading || !!oauthLoadingProvider}
                className="py-3 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {oauthLoadingProvider === 'google' ? (
                  'Connecting...'
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-1.4 3.6-5.5 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3 14.7 2.1 12 2.1 6.5 2.1 2.1 6.5 2.1 12S6.5 21.9 12 21.9c6.9 0 9.6-4.8 9.6-7.3 0-.5 0-.9-.1-1.3H12z" />
                      <path fill="#34A853" d="M2.1 12c0 1.8.5 3.4 1.4 4.8l3.3-2.6c-.2-.6-.4-1.4-.4-2.2s.1-1.5.4-2.2L3.5 7.2A9.9 9.9 0 0 0 2.1 12z" />
                      <path fill="#FBBC05" d="M12 21.9c2.7 0 4.9-.9 6.5-2.4L15.4 17c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.2l-3.3 2.6c1.7 3.2 5 5.5 8.9 5.5z" />
                      <path fill="#4285F4" d="M21.6 13.3H12v-3.1h9.5c.1.4.1.8.1 1.2s0 1-.1 1.9z" />
                    </svg>
                    Google
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign up
              </Link>
            </p>
            <p className="text-center text-xs text-gray-500 mt-2">
              Admin access?{' '}
              <Link to="/admin/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Admin login
              </Link>
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">(c) 2026 Mirai AI. Your future built intelligently.</p>
      </div>
    </div>
  );
}
