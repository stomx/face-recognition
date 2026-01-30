'use client';

import { useEffect, useState, memo } from 'react';

export const TimeDisplay = memo(function TimeDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatDate = (date: Date) =>
    date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });

  return (
    <div className="bg-black/50 backdrop-blur-md rounded-2xl px-4 py-3 portrait:px-5 portrait:py-4">
      <div className="text-2xl portrait:text-3xl font-light tracking-wider text-white">
        {formatTime(currentTime)}
      </div>
      <div className="text-xs portrait:text-sm text-gray-400">{formatDate(currentTime)}</div>
    </div>
  );
});
