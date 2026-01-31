export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-24 h-24',
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
};

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`text-center ${className}`}>
      <div className={`relative ${sizeClasses[size]} mx-auto mb-6`}>
        <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
      </div>
      {text && (
        <p className={`text-gray-400 ${textSizeClasses[size]}`}>{text}</p>
      )}
    </div>
  );
}
