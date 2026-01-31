'use client';

import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', className = '', ...props }, ref) => {
    const baseStyles = 'rounded-3xl overflow-hidden animate-scaleIn';

    const variantStyles = {
      default: 'glass',
      outlined: 'glass-light border-2',
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ children, className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`
      px-4 py-3 hd-p:px-5 hd-p:py-3.5 fhd-p:px-6 fhd-p:py-4 qhd-p:px-8 qhd-p:py-5
      hd-l:px-5 hd-l:py-3 fhd-l:px-6 fhd-l:py-4 qhd-l:px-8 qhd-l:py-5
      border-b border-white/20 ${className}
    `}
    {...props}
  >
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

export const CardBody = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ children, className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`
      p-4 hd-p:p-5 fhd-p:p-6 qhd-p:p-8
      hd-l:p-5 fhd-l:p-6 qhd-l:p-10
      ${className}
    `}
    {...props}
  >
    {children}
  </div>
));

CardBody.displayName = 'CardBody';

export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ children, className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`
      px-4 py-3 hd-p:px-5 hd-p:py-3.5 fhd-p:px-6 fhd-p:py-4 qhd-p:px-8 qhd-p:py-5
      hd-l:px-5 hd-l:py-3 fhd-l:px-6 fhd-l:py-4 qhd-l:px-8 qhd-l:py-5
      border-t border-gray-100 bg-gray-50 ${className}
    `}
    {...props}
  >
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';
