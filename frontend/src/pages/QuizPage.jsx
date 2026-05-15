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
      <div className="min-h-screen flex items-center justify-center pt-16">
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

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Quiz Time</h1>
          <p className="text-surface-400 text-sm">Question {currentIndex + 1} of {questions.length}</p>
        </div>
        <Timer totalSeconds={300} onTimeUp={handleSubmit} />
      </div>

      {/* Progress bar */}
      <div className="progress-bar mb-8">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div className="glass-card p-6 sm:p-8 mb-8">
        <QuizQuestionComp
          question={current}
          selectedOption={answers[current.id]}
          onSelect={handleSelect}
          showResult={false}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
          disabled={currentIndex === 0}
          className="btn-secondary disabled:opacity-30"
        >
          ← Previous
        </button>

        {isLast ? (
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex items-center gap-2">
            {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            Submit Quiz
          </button>
        ) : (
          <button onClick={() => setCurrentIndex((p) => p + 1)} className="btn-primary">
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
