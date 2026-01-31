import { ReactNode } from 'react';

export interface ModeOption {
  value: string;
  label: string;
  icon: ReactNode;
  description?: string;
}

export interface ModeSelectionGridProps {
  options: ModeOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ModeSelectionGrid({
  options,
  value,
  onChange,
  disabled = false,
  className = ''
}: ModeSelectionGridProps) {
  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`}>
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            className={`p-6 rounded-2xl text-center transition-all cursor-pointer ${
              isSelected
                ? 'bg-blue-600 text-white ring-4 ring-blue-400/50'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="w-10 h-10 mx-auto mb-3">
              {option.icon}
            </div>
            <span className="text-xl font-medium">{option.label}</span>
            {option.description && (
              <p className="text-sm opacity-70 mt-1">{option.description}</p>
            )}
          </button>
        );
      })}
    </div>
  );
}
