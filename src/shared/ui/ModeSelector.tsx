'use client';

import { ReactNode } from 'react';

interface ModeSelectorProps {
  modes: {
    id: string;
    label: string;
    description: string;
    icon: ReactNode;
  }[];
  selectedMode: string;
  onModeChange: (modeId: string) => void;
  disabled?: boolean;
}

export function ModeSelector({ modes, selectedMode, onModeChange, disabled = false }: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          disabled={disabled}
          className={`p-6 rounded-2xl text-center transition-all ${
            selectedMode === mode.id
              ? 'bg-blue-600 text-white ring-4 ring-blue-400/50'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="w-10 h-10 mx-auto mb-3">{mode.icon}</div>
          <span className="text-xl font-medium block">{mode.label}</span>
          <p className="text-sm opacity-70 mt-1">{mode.description}</p>
        </button>
      ))}
    </div>
  );
}
