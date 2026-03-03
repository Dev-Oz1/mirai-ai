import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'ghost'
    | 'gold'
    | 'tech-gradient'
    | 'tech-outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles: Record<string, string> = {
    primary:
      'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
    secondary:
      'bg-gray-100 hover:bg-gray-200 focus:ring-gray-500',
    danger:
      'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    ghost:
      'hover:bg-gray-100 focus:ring-gray-500',
    gold:
      'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 shadow-md hover:shadow-lg focus:ring-yellow-500',
    'tech-gradient':
      'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg hover:shadow-xl focus:ring-blue-500 transform hover:scale-[1.02]',
    'tech-outline':
      'border-2 border-gray-900 bg-white hover:bg-gray-900 focus:ring-gray-900',
  };

  // Separate text colors to ensure they apply LAST
  const textColors: Record<string, string> = {
    primary: 'text-white',
    secondary: 'text-gray-900',
    danger: 'text-white',
    ghost: 'text-gray-700',
    gold: 'text-gray-900',
    'tech-gradient': 'text-white',
    'tech-outline': 'text-gray-900 hover:text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizes[size]} ${textColors[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin mr-2`} />
      ) : (
        leftIcon && <span className="mr-2">{leftIcon}</span>
      )}
      {children}
      {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}