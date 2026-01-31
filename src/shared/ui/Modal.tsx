'use client';

import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="glass rounded-3xl p-6 hd-p:p-7 fhd-p:p-8 qhd-p:p-10 hd-l:p-7 fhd-l:p-8 qhd-l:p-12 max-w-md hd-p:max-w-lg fhd-p:max-w-lg qhd-p:max-w-2xl hd-l:max-w-lg fhd-l:max-w-xl qhd-l:max-w-3xl w-full mx-4 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 hd-p:mb-7 fhd-p:mb-8 qhd-p:mb-10 hd-l:mb-7 fhd-l:mb-8 qhd-l:mb-10">
          <h2 className="text-xl hd-p:text-2xl fhd-p:text-2xl qhd-p:text-3xl hd-l:text-2xl fhd-l:text-2xl qhd-l:text-4xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 hd-p:w-11 hd-p:h-11 fhd-p:w-12 fhd-p:h-12 qhd-p:w-14 qhd-p:h-14 hd-l:w-11 hd-l:h-11 fhd-l:w-12 fhd-l:h-12 qhd-l:w-16 qhd-l:h-16 rounded-full glass-light flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-white/30 transition-all transform hover:scale-110 cursor-pointer"
          >
            <svg className="w-5 h-5 hd-p:w-5.5 hd-p:h-5.5 fhd-p:w-6 fhd-p:h-6 qhd-p:w-7 qhd-p:h-7 hd-l:w-5.5 hd-l:h-5.5 fhd-l:w-6 fhd-l:h-6 qhd-l:w-8 qhd-l:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
