'use client';

interface StatusBadgeProps {
  status: 'ready' | 'loading' | 'error';
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const statusConfig = {
    ready: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      dot: 'bg-green-500',
      label: label || '준비',
    },
    loading: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      dot: 'bg-yellow-500 animate-pulse',
      label: label || '로딩',
    },
    error: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      dot: 'bg-red-500',
      label: label || '오류',
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 portrait:px-4 portrait:py-2.5 rounded-full border border-gray-200 ${config.bg} ${config.text}`}
    >
      <span className={`w-2 h-2 portrait:w-2.5 portrait:h-2.5 rounded-full ${config.dot}`} />
      <span className="text-xs portrait:text-sm font-medium">{config.label}</span>
    </div>
  );
}
