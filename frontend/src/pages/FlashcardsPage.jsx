import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function FlashcardsPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [hasFlashcards, setHasFlashcards] = useState(false);
  const [flipped, setFlipped] = useState({});
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingCards, setLoadingCards] = useState(false);

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
  }, []);

  const handleSelectNote = async (note) => {
    setSelectedNote(note);
    setFlashcards([]);
    setHasFlashcards(false);
    setFlipped({});
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

  const formatDate = (dt) => {
    if (!dt) return '';
    return new Date(dt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #a78bfa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🃏 Flashcards
        </h1>
        <p style={{ color: '#64748b', marginTop: '0.4rem' }}>Select a note to review its flashcards. Click a card to flip it.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>

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
                      <p style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, flexShrink: 0 }}>Question {idx + 1}</p>
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
