'use client';

import { ReactNode } from 'react';

interface IconButtonProps {
  onClick: () => void;
  icon: ReactNode;
  className?: string;
  disabled?: boolean;
  title?: string;
}

export function IconButton({ onClick, icon, className = '', disabled = false, title }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-10 h-10 portrait:w-12 portrait:h-12 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border border-gray-200 shadow-lg ${className}`}
    >
      {icon}
    </button>
  );
}
