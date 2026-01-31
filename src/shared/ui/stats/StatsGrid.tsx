import { ReactNode } from 'react';

export interface StatsGridProps {
  children: ReactNode;
  layout?: 'row' | 'grid-2' | 'grid-3';
  className?: string;
}

const layoutClasses = {
  row: 'flex flex-wrap gap-4',
  'grid-2': 'grid grid-cols-2 gap-4',
  'grid-3': 'grid grid-cols-3 gap-4',
};

export function StatsGrid({ children, layout = 'grid-3', className = '' }: StatsGridProps) {
  return (
    <div className={`${layoutClasses[layout]} ${className}`}>
      {children}
    </div>
  );
}
