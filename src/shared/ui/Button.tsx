'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary:
        'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    };

    const sizeStyles = {
      sm: 'px-2 py-1 text-xs hd-p:px-2.5 hd-p:py-1.5 hd-p:text-sm fhd-p:px-3 fhd-p:py-1.5 fhd-p:text-sm qhd-p:px-4 qhd-p:py-2 qhd-p:text-base hd-l:px-3 hd-l:py-1.5 hd-l:text-sm fhd-l:px-3 fhd-l:py-1.5 fhd-l:text-sm qhd-l:px-4 qhd-l:py-2 qhd-l:text-base',
      md: 'px-3 py-1.5 text-sm hd-p:px-3.5 hd-p:py-2 hd-p:text-base fhd-p:px-4 fhd-p:py-2 fhd-p:text-base qhd-p:px-6 qhd-p:py-3 qhd-p:text-lg hd-l:px-4 hd-l:py-2 hd-l:text-base fhd-l:px-4 fhd-l:py-2 fhd-l:text-base qhd-l:px-6 qhd-l:py-3 qhd-l:text-lg',
      lg: 'px-4 py-2 text-base hd-p:px-5 hd-p:py-2.5 hd-p:text-lg fhd-p:px-6 fhd-p:py-3 fhd-p:text-lg qhd-p:px-8 qhd-p:py-4 qhd-p:text-xl hd-l:px-6 hd-l:py-3 hd-l:text-lg fhd-l:px-6 fhd-l:py-3 fhd-l:text-lg qhd-l:px-8 qhd-l:py-4 qhd-l:text-xl',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            로딩 중...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
