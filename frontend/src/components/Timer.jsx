import { useState, useEffect, useRef } from 'react';

export default function Timer({ totalSeconds, onTimeUp }) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [totalSeconds, onTimeUp]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = (secondsLeft / totalSeconds) * 100;

  const isLow = secondsLeft <= 30;
  const isCritical = secondsLeft <= 10;

  return (
    <div className="flex items-center gap-4">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
        isCritical
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          : isLow
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          : 'bg-surface-700/50 border-surface-600/50 text-surface-200'
      } transition-colors duration-300`}>
        <svg className={`w-5 h-5 ${isCritical ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-mono font-bold text-lg tabular-nums">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>

      {/* Mini progress bar */}
      <div className="flex-1 h-1.5 bg-surface-700 rounded-full overflow-hidden max-w-xs">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isCritical ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-primary-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
