import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { formatDate } from '../utils/formatDate';

export default function FlashcardsPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [hasFlashcards, setHasFlashcards] = useState(false);
  const [flipped, setFlipped] = useState({});
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingCards, setLoadingCards] = useState(false);
  const [dueCards, setDueCards] = useState([]);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewFlipped, setReviewFlipped] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const fetchDueCards = async () => {
    try {
      const res = await API.get('/api/flashcards/due');
      setDueCards(res.data || []);
    } catch { setDueCards([]); }
  };

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await API.get('/api/notes');
        setNotes(res.data);
      } catch (err) {
        console.error('Failed to fetch notes', err);
      } finally {
        setLoadingNotes(false);
      }
    };
    fetchNotes();
    fetchDueCards();
  }, []);

  const handleSelectNote = async (note) => {
    setSelectedNote(note);
    setFlashcards([]);
    setHasFlashcards(false);
    setFlipped({});
    setReviewMode(false);
    setLoadingCards(true);
    try {
      const res = await API.get(`/api/notes/${note.noteId}/study-materials`);
      setFlashcards(res.data.flashcards || []);
      setHasFlashcards(!!res.data.hasFlashcards);
    } catch (err) {
      console.error('Failed to fetch flashcards', err);
    } finally {
      setLoadingCards(false);
    }
  };

  const handleReview = async (correct) => {
    const card = dueCards[0];
    if (!card) { setReviewMode(false); return; }
    setReviewError('');
    try {
      const res = await API.post('/api/flashcards/review', { flashcardId: card.id, correct });
      const updated = res.data;
      setDueCards(prev => prev.filter(c => c.id !== updated.id));
      setFlashcards(prev => prev.map(f => f.id === updated.id ? { ...f, boxLevel: updated.boxLevel, nextReviewDate: updated.nextReviewDate } : f));
      setReviewFlipped(false);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to save review');
    }
  };

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #a78bfa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🃏 Flashcards
        </h1>
        <p style={{ color: '#64748b', marginTop: '0.4rem' }}>Spaced repetition (Leitner boxes) — review cards daily to move them to higher boxes and longer intervals.</p>
      </div>

      {/* Spaced repetition review panel */}
      <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.25rem' }}>
        {!reviewMode && dueCards.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>✅</span>
              <div>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>No cards due for review</p>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.15rem 0 0' }}>All caught up! New cards are due as their review interval expires.</p>
              </div>
            </div>
            {flashcards.length > 0 && (
              <button
                onClick={() => setReviewMode(true)}
                className="btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Browse all cards →
              </button>
            )}
          </div>
        )}

        {!reviewMode && dueCards.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>⏰</span>
              <div>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>{dueCards.length} card{dueCards.length !== 1 ? 's' : ''} due for review</p>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.15rem 0 0' }}>Answer correctly to move cards up the Leitner boxes</p>
              </div>
            </div>
            <button
              onClick={() => { setReviewMode(true); setReviewFlipped(false); }}
              className="btn-primary"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
            >
              Start review →
            </button>
          </div>
        )}

        {reviewMode && dueCards.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
                Reviewing card 1 of {dueCards.length}
              </p>
              <button onClick={() => setReviewMode(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' }}>
                Exit review ✕
              </button>
            </div>
            <div
              onClick={() => setReviewFlipped(!reviewFlipped)}
              title="Click to flip"
              style={{ perspective: '1000px', cursor: 'pointer', height: '260px', maxWidth: '560px', margin: '0 auto' }}
            >
              <div style={{
                position: 'relative', width: '100%', height: '100%',
                transformStyle: 'preserve-3d',
                transform: reviewFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
              }}>
                <div style={{
                  position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                  background: 'linear-gradient(135deg, rgba(91,33,182,0.4), rgba(6,182,212,0.2))',
                  border: '1px solid rgba(139,92,246,0.4)',
                  borderRadius: '1rem', padding: '1.5rem',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                }}>
                  <p style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem' }}>Question</p>
                  <p style={{ fontSize: '1.05rem', color: '#ede9fe', margin: 0, lineHeight: 1.6 }}>{dueCards[0].question}</p>
                  <p style={{ fontSize: '0.7rem', color: '#475569', marginTop: '1rem' }}>Click to flip</p>
                </div>
                <div style={{
                  position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background: 'linear-gradient(135deg, rgba(6,182,212,0.3), rgba(16,185,129,0.2))',
                  border: '1px solid rgba(56,189,248,0.35)',
                  borderRadius: '1rem', padding: '1.5rem',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                }}>
                  <p style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem' }}>Answer</p>
                  <p style={{ fontSize: '1rem', color: '#f0f9ff', margin: 0, lineHeight: 1.6 }}>{dueCards[0].answer}</p>
                </div>
              </div>
            </div>
            {reviewError && <p style={{ color: '#f87171', fontSize: '0.85rem', textAlign: 'center', marginTop: '0.75rem' }}>{reviewError}</p>}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.25rem' }}>
              <button
                onClick={() => handleReview(false)}
                style={{
                  padding: '0.6rem 1.75rem', borderRadius: '12px', border: '1px solid rgba(244,63,94,0.4)',
                  background: 'rgba(244,63,94,0.1)', color: '#fb7185', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                }}
              >
                🔄 Still learning
              </button>
              <button
                onClick={() => handleReview(true)}
                style={{
                  padding: '0.6rem 1.75rem', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.4)',
                  background: 'rgba(16,185,129,0.1)', color: '#34d399', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                }}
              >
                ✓ Got it
              </button>
            </div>
          </div>
        )}

        {reviewMode && dueCards.length === 0 && (
          <div style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
            <p style={{ color: '#e2e8f0', fontWeight: 600, margin: '0 0 0.25rem' }}>Review complete!</p>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1rem' }}>All due cards reviewed. Check back tomorrow for the next round.</p>
            <button onClick={() => setReviewMode(false)} className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
              Done
            </button>
          </div>
        )}
      </div>

      <div className="sidebar-note-list" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Notes list */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(124,58,237,0.08)' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Notes</p>
          </div>

          {loadingNotes ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto', width: '2rem', height: '2rem' }} />
            </div>
          ) : notes.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              <p style={{ fontSize: '0.875rem' }}>No notes yet.</p>
              <button onClick={() => navigate('/notes')} className="btn-primary" style={{ marginTop: '1rem', padding: '0.5rem 1.2rem', fontSize: '0.8rem' }}>
                Upload Notes
              </button>
            </div>
          ) : (
            <div style={{ maxHeight: 'calc(100vh - 260px)', overflowY: 'auto' }}>
              {notes.map((note) => {
                const isActive = selectedNote?.noteId === note.noteId;
                return (
                  <button
                    key={note.noteId}
                    onClick={() => handleSelectNote(note)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '0.9rem 1.25rem', border: 'none', cursor: 'pointer',
                      background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
                      borderLeft: isActive ? '3px solid #7c3aed' : '3px solid transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <p style={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 400, color: isActive ? '#c4b5fd' : '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                      {note.title}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: '#475569', margin: '0.15rem 0 0' }}>{formatDate(note.createdAt)}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Flashcards panel */}
        <div>
          {!selectedNote ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '380px', background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.08)', borderRadius: '1.25rem', color: '#475569', textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👈</div>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#64748b' }}>Select a note from the left</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.4rem' }}>to view its flashcards</p>
            </div>
          ) : loadingCards ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '380px', gap: '1rem' }}>
              <div className="spinner" />
              <p style={{ color: '#64748b' }}>Loading flashcards...</p>
            </div>
          ) : !hasFlashcards ? (
            <div style={{ padding: '3.5rem 2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '1.25rem', border: '1px dashed rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🤖</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0', margin: '0 0 0.5rem' }}>No Flashcards Generated</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
                Generate AI flashcards for "{selectedNote.title}" with a single click.
              </p>
              <button onClick={() => navigate(`/study/${selectedNote.noteId}`)} className="btn-primary">
                🚀 Generate Flashcards
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {flashcards.map((fc, idx) => (
                <div
                  key={fc.id}
                  onClick={() => setFlipped(prev => ({ ...prev, [idx]: !prev[idx] }))}
                  title="Click to flip"
                  style={{ perspective: '1000px', cursor: 'pointer', height: '230px' }}
                >
                  <div style={{
                    position: 'relative', width: '100%', height: '100%',
                    transformStyle: 'preserve-3d',
                    transform: flipped[idx] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
                  }}>
                    <div style={{
                      position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                      background: 'linear-gradient(135deg, rgba(91,33,182,0.35), rgba(109,40,217,0.25))',
                      border: '1px solid rgba(139,92,246,0.35)',
                      borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                        <p style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Question {idx + 1}</p>
                        <span
                          title="Leitner box level — higher = longer review interval"
                          style={{
                            fontSize: '0.7rem', fontWeight: 700, color: '#c4b5fd',
                            background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(139,92,246,0.3)',
                            borderRadius: '99px', padding: '0.15rem 0.6rem',
                          }}
                        >
                          Box {fc.boxLevel || 1}/5
                        </span>
                      </div>
                      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '0.5rem 0', margin: '0.2rem 0' }}>
                        <p style={{ fontSize: '0.9rem', color: '#ede9fe', margin: 0, lineHeight: 1.5 }}>{fc.question}</p>
                      </div>
                      <p style={{ fontSize: '0.7rem', color: '#7c6fb0', margin: 0, textAlign: 'right' }}>Click to reveal answer →</p>
                    </div>
                    <div style={{
                      position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      background: 'linear-gradient(135deg, rgba(4,78,59,0.4), rgba(4,120,87,0.3))',
                      border: '1px solid rgba(16,185,129,0.35)',
                      borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    }}>
                      <p style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, flexShrink: 0 }}>Answer</p>
                      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '0.5rem 0', margin: '0.2rem 0' }}>
                        <p style={{ fontSize: '0.9rem', color: '#d1fae5', margin: 0, lineHeight: 1.5 }}>{fc.answer}</p>
                      </div>
                      <p style={{ fontSize: '0.7rem', color: '#6ab79b', margin: 0, textAlign: 'right' }}>← Click to flip back</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
