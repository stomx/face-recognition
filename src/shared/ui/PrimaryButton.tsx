'use client';

import { ReactNode } from 'react';

interface PrimaryButtonProps {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  variant?: 'green' | 'blue' | 'red' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  className?: string;
}

export function PrimaryButton({
  onClick,
  children,
  disabled = false,
  variant = 'green',
  size = 'md',
  icon,
  className = '',
}: PrimaryButtonProps) {
  const variantClasses = {
    green: 'bg-green-500 hover:bg-green-400 shadow-green-500/20',
    blue: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20',
    red: 'bg-red-600 hover:bg-red-700 shadow-red-500/20',
    gray: 'bg-gray-700 hover:bg-gray-600 shadow-gray-500/20',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 portrait:px-8 portrait:py-4 text-lg portrait:text-xl',
    lg: 'px-8 py-4 portrait:px-10 portrait:py-5 text-xl portrait:text-2xl',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 portrait:gap-3 ${sizeClasses[size]} ${variantClasses[variant]} disabled:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white rounded-xl shadow-lg transition-all active:scale-[0.98] font-bold ${className}`}
    >
      {icon && <div className="w-5 h-5 portrait:w-6 portrait:h-6">{icon}</div>}
      {children}
    </button>
  );
}
