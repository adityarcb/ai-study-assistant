import { useState, useEffect, useCallback, useRef } from 'react';

const STAGGER_MS = 400;
const AUTO_COLLAPSE_MS = 800;

const panelStyle = {
  position: 'fixed',
  bottom: '1.5rem',
  right: '1.5rem',
  zIndex: 50,
  background: 'rgba(10, 10, 25, 0.7)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid rgba(245, 158, 11, 0.2)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 40px rgba(245, 158, 11, 0.08)',
  overflow: 'hidden',
  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
};

const cardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.85rem',
  padding: '0.85rem 1.1rem',
  background: 'rgba(245, 158, 11, 0.06)',
  border: '1px solid rgba(245, 158, 11, 0.18)',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  textAlign: 'left',
  width: '100%',
  color: 'inherit',
  fontSize: 'inherit',
  fontFamily: 'inherit',
};

export default function RemindersPanel({ failingQuizzes, onRetake, quizRetakeMap }) {
  const [phase, setPhase] = useState('hidden');
  const [expanded, setExpanded] = useState(false);
  const collapseTimer = useRef(null);

  const startAnimation = useCallback(() => {
    if (failingQuizzes.length === 0) return;
    setPhase('animating');
    setExpanded(false);

    if (collapseTimer.current) clearTimeout(collapseTimer.current);
    collapseTimer.current = setTimeout(() => {
      setPhase('stacked');
    }, failingQuizzes.length * STAGGER_MS + AUTO_COLLAPSE_MS);
  }, [failingQuizzes.length]);

  useEffect(() => {
    startAnimation();
    return () => { if (collapseTimer.current) clearTimeout(collapseTimer.current); };
  }, [startAnimation]);

  useEffect(() => {
    if (failingQuizzes.length === 0) setPhase('hidden');
  }, [failingQuizzes.length]);

  if (phase === 'hidden' || failingQuizzes.length === 0) return null;

  const toggleExpand = () => {
    if (collapseTimer.current) clearTimeout(collapseTimer.current);
    setExpanded(!expanded);
  };

  const handleClickCard = (quiz) => {
    if (!quizRetakeMap[quiz.quizId]) return;
    onRetake(quiz);
  };

  if (!expanded && phase === 'stacked') {
    return (
      <div style={{ ...panelStyle, padding: '0.8rem 1.15rem' }}>
        <button
          onClick={toggleExpand}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.7rem',
            background: 'none', border: 'none', cursor: 'pointer', color: '#fbbf24',
            padding: 0, fontFamily: 'inherit',
          }}
        >
          <span style={{
            width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
            background: 'rgba(245,158,11,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
          }}>⚠️</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {failingQuizzes.length} quiz{failingQuizzes.length > 1 ? 'zes' : ''} to retake
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div style={{ ...panelStyle, padding: '1rem', width: '340px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fbbf24', margin: 0 }}>⚠️ Quizzes to Retake</p>
        {phase === 'animating' && (
          <button onClick={toggleExpand} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
            padding: '0.2rem', display: 'flex', alignItems: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {failingQuizzes.map((quiz, i) => {
          const hasQuestions = !!quizRetakeMap[quiz.quizId];
          return (
            <button
              key={`${quiz.quizId}-${quiz.attemptedAt}`}
              onClick={() => handleClickCard(quiz)}
              disabled={!hasQuestions}
              className="reminder-anim"
              style={{
                ...cardStyle,
                animationDelay: `${i * STAGGER_MS}ms`,
                opacity: hasQuestions ? 1 : 0.45,
                cursor: hasQuestions ? 'pointer' : 'not-allowed',
              }}
              onMouseEnter={e => { if (hasQuestions) { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.45)'; e.currentTarget.style.background = 'rgba(245,158,11,0.12)'; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.18)'; e.currentTarget.style.background = 'rgba(245,158,11,0.06)'; }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: 'rgba(244,63,94,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
              }}>📉</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {quiz.noteTitle}
                </p>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0.1rem 0 0' }}>
                  Previous: <span style={{ color: '#fb7185', fontWeight: 600 }}>{Number(quiz.percentage).toFixed(0)}%</span>
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: hasQuestions ? '#fbbf24' : '#64748b', flexShrink: 0, whiteSpace: 'nowrap' }}>
                {hasQuestions ? 'Retake →' : 'Generate first'}
              </span>
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes reminderSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reminder-anim {
          animation: reminderSlideUp 0.4s ease-out both;
        }
      `}</style>
    </div>
  );
}
