import { useLocation, useNavigate, useParams } from 'react-router-dom';

export default function ResultPage() {
  const { quizId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { result, questions } = location.state || {};

  if (!result) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="glass-card p-8 text-center">
          <p className="text-surface-400 mb-4">No result data found.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  const { score, totalQuestions, percentage, passed, breakdown } = result;

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto">
      {/* Score Card */}
      <div className="glass-card p-8 text-center mb-8 animate-fade-in">
        <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 ${
          passed
            ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-2 border-emerald-500/30'
            : 'bg-gradient-to-br from-rose-500/20 to-rose-600/10 border-2 border-rose-500/30'
        }`}>
          <div>
            <p className={`text-4xl font-bold ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>
              {score}/{totalQuestions}
            </p>
            <p className={`text-lg font-semibold ${passed ? 'text-emerald-300' : 'text-rose-300'}`}>
              {percentage.toFixed(0)}%
            </p>
          </div>
        </div>

        <div className={`inline-block px-6 py-2 rounded-full text-sm font-bold mb-4 ${
          passed
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
        }`}>
          {passed ? '🎉 PASSED' : '😔 FAILED'}
        </div>

        <p className="text-surface-400">
          {passed ? 'Great job! Keep up the good work.' : 'Don\'t worry, review the material and try again!'}
        </p>
      </div>

      {/* Breakdown Table */}
      <div className="glass-card p-6 mb-8 animate-slide-up">
        <h3 className="text-lg font-semibold text-surface-100 mb-4">Question Breakdown</h3>
        <div className="space-y-3">
          {breakdown.map((item, i) => {
            const q = questions?.find((q) => q.id === item.questionId);
            return (
              <div key={i} className={`p-4 rounded-xl border ${
                item.correct
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-rose-500/5 border-rose-500/20'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-surface-200 mb-2">
                      Q{i + 1}: {q?.questionText || `Question ${item.questionId}`}
                    </p>
                    <div className="flex gap-4 text-xs">
                      <span className="text-surface-400">
                        Your answer: <span className={item.correct ? 'text-emerald-400' : 'text-rose-400'}>{item.selectedOption || '—'}</span>
                      </span>
                      {!item.correct && (
                        <span className="text-surface-400">
                          Correct: <span className="text-emerald-400">{item.correctOption}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xl flex-shrink-0">{item.correct ? '✅' : '❌'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 justify-center">
        <button onClick={() => questions?.length && navigate(`/quiz/${quizId}`, { state: { questions } })} className="btn-secondary">Retake Quiz</button>
        <button onClick={() => navigate('/progress')} className="btn-primary">View Progress</button>
      </div>
    </div>
  );
}
