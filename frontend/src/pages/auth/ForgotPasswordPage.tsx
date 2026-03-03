import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, ArrowLeft } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We've sent you a password reset link"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <Mail className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-gray-400">
            We've sent a password reset link to <strong className="text-white">{email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <Link to="/login">
            <Button variant="secondary" className="w-full mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email to receive a reset link"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button
          type="submit"
          className="w-full"
          variant="gold"
          isLoading={isLoading}
        >
          Send reset link
        </Button>

        <Link to="/login">
          <Button type="button" variant="ghost" className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to login
          </Button>
        </Link>
      </form>
    </AuthLayout>
  );
}