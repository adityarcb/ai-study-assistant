import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import FlashcardFlip from '../components/FlashcardFlip';
import ReactMarkdown from 'react-markdown';

export default function StudyPage() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const generate = async () => {
      try {
        const res = await API.post('/api/study/generate', { noteId: parseInt(noteId) });
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to generate study materials. Please try again.');
      } finally { setLoading(false); }
    };
    generate();
  }, [noteId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-16 gap-4">
        <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
        <div className="text-center">
          <p className="text-xl font-semibold text-surface-100">Generating Study Materials</p>
          <p className="text-surface-400 mt-2">Our AI is analyzing your notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 px-4">
        <div className="glass-card p-8 max-w-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-rose-300 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Section A: Summary */}
      <section className="mb-12 animate-fade-in">
        <h2 className="text-2xl font-bold text-surface-100 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-sm">📖</span>
          Summary
        </h2>
        <div className="glass-card p-6 sm:p-8">
          <div className="text-surface-300 leading-relaxed" style={{ fontSize: '0.95rem', lineHeight: '1.85' }}>
            {data.summary.split('\n').filter(p => p.trim()).map((para, i) => (
              <p key={i} style={{ marginBottom: '1rem' }}>{para}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Section B: Flashcards */}
      <section className="mb-12 animate-slide-up">
        <h2 className="text-2xl font-bold text-surface-100 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-sm">🃏</span>
          Flashcards
        </h2>
        <FlashcardFlip flashcards={data.flashcards} />
      </section>

      {/* Section C: Start Quiz */}
      <section className="animate-slide-up">
        <div className="glass-card p-8 text-center">
          <div className="text-5xl mb-4">🧠</div>
          <h2 className="text-2xl font-bold text-surface-100 mb-2">Ready for the Quiz?</h2>
          <p className="text-surface-400 mb-6">Test your knowledge with {data.questions.length} multiple choice questions.</p>
          <button
            onClick={() => navigate(`/quiz/${data.quizId}`, { state: { questions: data.questions } })}
            className="btn-primary text-lg px-8 py-4"
          >
            🚀 Start Quiz
          </button>
        </div>
      </section>
    </div>
  );
}
