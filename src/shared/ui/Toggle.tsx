'use client';

interface ToggleProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
  label?: string;
  enabledLabel?: string;
  disabledLabel?: string;
}

export function Toggle({
  enabled,
  onToggle,
  disabled = false,
  label,
  enabledLabel = '켜짐',
  disabledLabel = '꺼짐',
}: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className="flex items-center gap-2 portrait:gap-3 px-3 py-2 portrait:px-4 portrait:py-3 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
    >
      <div
        className={`w-10 h-6 portrait:w-12 portrait:h-7 rounded-full relative transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-600'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 portrait:w-5 portrait:h-5 bg-white rounded-full transition-transform ${
            enabled ? 'translate-x-5 portrait:translate-x-6' : 'translate-x-1'
          }`}
        />
      </div>
      {label && (
        <span className="text-white text-sm portrait:text-base font-medium">
          {label}
        </span>
      )}
      {!label && (
        <span className="text-white text-sm portrait:text-base font-medium">
          {enabled ? enabledLabel : disabledLabel}
        </span>
      )}
    </button>
  );
}
