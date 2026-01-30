'use client';

import { useEffect, useState } from 'react';

interface ResultOverlayProps {
  type: 'success' | 'failed';
  userName?: string;
  confidence?: number;
  message: string;
  onClose: () => void;
  duration?: number;
}

export function ResultOverlay({
  type,
  userName,
  confidence,
  message,
  onClose,
  duration = 5000,
}: ResultOverlayProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const closeTimer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(closeTimer);
  }, [duration, onClose]);

  const isSuccess = type === 'success';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isClosing ? 'bg-black/0 backdrop-blur-none' : 'bg-black/50 backdrop-blur-sm'
      }`}
    >
      <div
        className={`relative max-w-md w-[90%] mx-4 rounded-3xl overflow-hidden ${
          isClosing ? 'animate-scale-out' : 'animate-scale-in'
        } ${
          isSuccess
            ? 'bg-green-500/20 border border-green-400/30'
            : 'bg-red-500/20 border border-red-400/30'
        } backdrop-blur-xl shadow-2xl`}
      >
        <div className={`h-2 ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`} />

        <div className="p-8 portrait:p-10 text-center text-white">
          <div
            className={`mx-auto mb-6 w-24 h-24 portrait:w-28 portrait:h-28 rounded-full flex items-center justify-center ${
              isSuccess ? 'bg-green-500/30' : 'bg-red-500/30'
            }`}
          >
            {isSuccess ? (
              <svg
                className="w-14 h-14 portrait:w-16 portrait:h-16 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-14 h-14 portrait:w-16 portrait:h-16 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>

          <h1
            className={`text-3xl portrait:text-4xl font-bold mb-3 ${
              isSuccess ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {isSuccess ? '출입 승인' : '확인 필요'}
          </h1>

          {isSuccess && userName ? (
            <p className="text-xl portrait:text-2xl text-white/90 mb-6">
              환영합니다, <span className="font-bold">{userName}</span>님
            </p>
          ) : (
            <p className="text-lg portrait:text-xl text-white/80 mb-6">{message}</p>
          )}

          <div className="bg-white/10 rounded-2xl py-4 px-6 mb-6">
            <div className="text-3xl portrait:text-4xl font-light text-white mb-1">
              {new Date().toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            <div className="text-sm portrait:text-base text-white/60">
              {new Date().toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric',
                weekday: 'short',
              })}
            </div>
          </div>

          {confidence !== undefined && (
            <div className="max-w-xs mx-auto">
              <div className="flex justify-between text-sm mb-2 text-white/70">
                <span>일치율</span>
                <span className="font-bold">{(confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    isSuccess ? 'bg-green-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="h-1.5 bg-black/20">
          <div
            className={`h-full animate-shrink-width ${
              isSuccess ? 'bg-green-400/70' : 'bg-red-400/70'
            }`}
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes scale-out {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(0.8);
            opacity: 0;
          }
        }
        @keyframes shrink-width {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.4s ease-out;
        }
        .animate-scale-out {
          animation: scale-out 0.3s ease-in forwards;
        }
        .animate-shrink-width {
          animation: shrink-width 5s linear;
        }
      `}</style>
    </div>
  );
}
