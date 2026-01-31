import { ReactNode } from 'react';

export interface StatCardProps {
  value: number | string;
  label: string;
  variant?: 'success' | 'error' | 'info' | 'default';
  size?: 'compact' | 'large';
  icon?: ReactNode;
  className?: string;
}

const variantClasses = {
  success: 'from-green-50 to-emerald-50 border-green-100 text-green-600',
  error: 'from-red-50 to-rose-50 border-red-100 text-red-600',
  info: 'from-blue-50 to-indigo-50 border-blue-100 text-blue-600',
  default: 'from-gray-50 to-gray-100 border-gray-200 text-gray-900',
};

const sizeClasses = {
  compact: {
    container: 'p-3',
    value: 'text-2xl',
    label: 'text-xs',
  },
  large: {
    container: 'p-4',
    value: 'text-3xl',
    label: 'text-sm',
  },
};

export function StatCard({
  value,
  label,
  variant = 'default',
  size = 'compact',
  icon,
  className = ''
}: StatCardProps) {
  const sizeConfig = sizeClasses[size];

  return (
    <div className={`bg-gradient-to-br ${variantClasses[variant]} border rounded-2xl ${sizeConfig.container} ${className}`}>
      {icon && (
        <div className="mb-2 opacity-60">
          {icon}
        </div>
      )}
      <p className={`${sizeConfig.value} font-bold`}>{value}</p>
      <p className={`${sizeConfig.label} opacity-70 mt-1`}>{label}</p>
    </div>
  );
}
