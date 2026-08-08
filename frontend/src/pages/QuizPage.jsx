import { useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import QuizQuestionComp from '../components/QuizQuestion';
import Timer from '../components/Timer';

export default function QuizPage() {
  const { quizId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const questions = location.state?.questions || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = (optionKey) => {
    setAnswers((prev) => ({ ...prev, [questions[currentIndex].id]: optionKey }));
  };

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    const answerList = questions.map((q) => ({
      questionId: q.id,
      selectedOption: answers[q.id] || '',
    }));
    try {
      const res = await API.post('/api/quiz/attempt', { quizId: parseInt(quizId), answers: answerList });
      navigate(`/result/${quizId}`, { state: { result: res.data, questions } });
    } catch (err) {
      console.error('Submit failed:', err);
      setSubmitting(false);
    }
  }, [submitting, questions, answers, quizId, navigate]);

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="glass-card p-8 text-center">
          <p className="text-surface-400 mb-4">No quiz data found. Please generate study materials first.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Quiz Time</h1>
          <p className="text-surface-400 text-sm">
            Question {currentIndex + 1} of {totalQuestions}
            &nbsp;·&nbsp;
            <span style={{ color: answeredCount === totalQuestions ? '#4ade80' : '#a78bfa' }}>
              {answeredCount}/{totalQuestions} answered
            </span>
          </p>
        </div>
        <Timer totalSeconds={300} onTimeUp={handleSubmit} />
      </div>

      {/* Progress bar */}
      <div className="progress-bar mb-6">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div className="glass-card p-6 sm:p-8 mb-6">
        <QuizQuestionComp
          question={current}
          selectedOption={answers[current.id]}
          onSelect={handleSelect}
          showResult={false}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center gap-3">
        <button
          onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
          disabled={currentIndex === 0}
          className="btn-secondary disabled:opacity-30"
        >
          ← Previous
        </button>

        <div className="flex gap-3">
          {/* Submit always visible */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 4px 14px rgba(22,163,74,0.35)' }}
          >
            {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '✅'}
            Submit Quiz
          </button>

          {/* Next only if not on last */}
          {!isLast && (
            <button onClick={() => setCurrentIndex((p) => p + 1)} className="btn-primary">
              Next →
            </button>
          )}
        </div>
      </div>

      {/* Question dots navigator */}
      <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
        {questions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            title={`Question ${idx + 1}`}
            style={{
              width: '32px', height: '32px', borderRadius: '50%', border: 'none', cursor: 'pointer',
              fontSize: '0.7rem', fontWeight: 600, transition: 'all 0.15s',
              background: idx === currentIndex
                ? 'linear-gradient(135deg, #7c3aed, #06b6d4)'
                : answers[q.id]
                ? 'rgba(124,58,237,0.35)'
                : 'rgba(255,255,255,0.07)',
              color: idx === currentIndex ? 'white' : answers[q.id] ? '#c4b5fd' : '#64748b',
              boxShadow: idx === currentIndex ? '0 2px 10px rgba(124,58,237,0.5)' : 'none',
            }}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
