'use client';

interface StatCounterProps {
  value: number;
  label: string;
  color?: 'green' | 'red' | 'blue' | 'yellow';
}

export function StatCounter({ value, label, color = 'green' }: StatCounterProps) {
  const colorClasses = {
    green: 'text-green-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
    yellow: 'text-yellow-600',
  };

  return (
    <div className="text-center">
      <p className={`text-lg portrait:text-xl font-bold ${colorClasses[color]}`}>{value}</p>
      <p className="text-gray-600 text-[10px] portrait:text-xs">{label}</p>
    </div>
  );
}
