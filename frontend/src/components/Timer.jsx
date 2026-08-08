import { useState, useEffect, useRef } from 'react';

export default function Timer({ totalSeconds, onTimeUp }) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const intervalRef = useRef(null);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    setSecondsLeft(totalSeconds);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        return next > 0 ? next : 0;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [totalSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0 && secondsLeft === 0) {
      clearInterval(intervalRef.current);
      onTimeUpRef.current?.();
    }
  }, [secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = (secondsLeft / totalSeconds) * 100;

  const isLow = secondsLeft <= 30;
  const isCritical = secondsLeft <= 10;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid',
        borderColor: isCritical ? 'rgba(244,63,94,0.3)' : isLow ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.1)',
        background: isCritical ? 'rgba(244,63,94,0.1)' : isLow ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)',
        color: isCritical ? '#fb7185' : isLow ? '#fbbf24' : '#e2e8f0',
        transition: 'all 0.3s ease',
      }}>
        <span style={{ fontSize: '1.1rem' }}>{isCritical ? '🔴' : isLow ? '🟡' : '⏱️'}</span>
        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.05em' }}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>

      <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden', maxWidth: '180px' }}>
        <div style={{
          width: `${progress}%`, height: '100%', borderRadius: '99px',
          background: isCritical ? 'linear-gradient(90deg, #f43f5e, #fb7185)' : isLow ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #7c3aed, #38bdf8)',
          transition: 'width 1s linear',
        }} />
      </div>
    </div>
  );
}
