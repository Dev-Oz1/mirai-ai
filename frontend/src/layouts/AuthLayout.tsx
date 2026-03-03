import React from 'react';
import { Logo } from '../components/ui/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Auth Card */}
      <div className="relative w-full max-w-md">
        {/* Glassmorphic card */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
            {subtitle && <p className="text-gray-400">{subtitle}</p>}
          </div>

          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  );
};