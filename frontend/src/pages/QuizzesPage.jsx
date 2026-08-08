import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function QuizzesPage() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retakingId, setRetakingId] = useState(null);

  const handleRetake = async (quiz) => {
    if (!quiz.noteId || retakingId) return;
    setRetakingId(quiz.quizId);
    try {
      const res = await API.get(`/api/notes/${quiz.noteId}/study-materials`);
      const { questions, quizId } = res.data;
      if (questions?.length) {
        const stripped = questions.map(({ id, questionText, optionA, optionB, optionC, optionD }) => ({ id, questionText, optionA, optionB, optionC, optionD }));
        navigate(`/quiz/${quizId || quiz.quizId}`, { state: { questions: stripped } });
      }
    } catch (err) {
      console.error('Failed to load quiz:', err);
      setRetakingId(null);
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get('/api/quiz/history');
        setAttempts(res.data);
      } catch (err) {
        console.error('Failed to fetch quiz history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dt) => {
    if (!dt) return '';
    return new Date(dt).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const average = attempts.length > 0
    ? (attempts.reduce((sum, a) => sum + Number(a.percentage), 0) / attempts.length).toFixed(1)
    : 0;
  const best = attempts.length > 0 ? Math.max(...attempts.map(a => Number(a.percentage))) : 0;
  const passed = attempts.filter(a => Number(a.percentage) >= 60).length;

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #a78bfa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          📝 Quizzes
        </h1>
        <p style={{ color: '#64748b', marginTop: '0.4rem' }}>Review all your quiz attempts and scores.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner" />
        </div>
      ) : attempts.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '1.25rem', border: '2px dashed rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🧠</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0', margin: '0 0 0.5rem' }}>No Quizzes Taken Yet</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Generate study materials from a note, then take the quiz to see your scores here.
          </p>
          <button onClick={() => navigate('/notes')} className="btn-primary">Upload Notes</button>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', padding: '1.25rem' }}>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.25rem' }}>Total Attempts</p>
              <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>{attempts.length}</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', padding: '1.25rem' }}>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.25rem' }}>Average Score</p>
              <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#a78bfa', margin: 0 }}>{average}%</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', padding: '1.25rem' }}>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.25rem' }}>Best Score</p>
              <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#34d399', margin: 0 }}>{best}%</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', padding: '1.25rem' }}>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.25rem' }}>Passed</p>
              <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#38bdf8', margin: 0 }}>{passed}/{attempts.length}</p>
            </div>
          </div>

          {/* Attempt list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {attempts.map((a) => {
              const pct = Number(a.percentage);
              const ok = pct >= 60;
              return (
                <div
                  key={`${a.quizId}-${a.attemptedAt}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
                    padding: '1.1rem 1.4rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${ok ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
                    borderRadius: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                      background: ok ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
                    }}>
                      {ok ? '✅' : '❌'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.noteTitle}
                      </p>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.15rem 0 0' }}>{formatDate(a.attemptedAt)}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Score</p>
                      <p style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>{a.score}/{a.totalQuestions}</p>
                    </div>
                    <div style={{ width: '110px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`, height: '100%', borderRadius: '99px',
                        background: ok ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f43f5e, #fb7185)',
                      }} />
                    </div>
                    <span style={{
                      fontSize: '0.85rem', fontWeight: 700, width: '52px', textAlign: 'right',
                      color: ok ? '#34d399' : '#fb7185',
                    }}>
                      {pct.toFixed(0)}%
                    </span>
                    {a.noteId && (
                      <button
                        onClick={() => handleRetake(a)}
                        disabled={retakingId === a.quizId}
                        style={{
                          padding: '0.4rem 1rem', borderRadius: '8px', border: 'none',
                          background: retakingId === a.quizId ? 'rgba(124,58,237,0.2)' : 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                          color: 'white', cursor: retakingId === a.quizId ? 'wait' : 'pointer',
                          fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
                          opacity: retakingId === a.quizId ? 0.7 : 1,
                        }}
                      >
                        {retakingId === a.quizId ? '...' : 'Retake →'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
