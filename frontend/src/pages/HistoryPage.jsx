import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const optionLabels = { A: 'A', B: 'B', C: 'C', D: 'D' };
const optionBg = {
  A: 'rgba(124,58,237,0.12)',
  B: 'rgba(6,182,212,0.12)',
  C: 'rgba(236,72,153,0.12)',
  D: 'rgba(245,158,11,0.12)',
};
const optionBorder = {
  A: 'rgba(124,58,237,0.35)',
  B: 'rgba(6,182,212,0.35)',
  C: 'rgba(236,72,153,0.35)',
  D: 'rgba(245,158,11,0.35)',
};
const optionColor = {
  A: '#a78bfa',
  B: '#38bdf8',
  C: '#f472b6',
  D: '#fbbf24',
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [materials, setMaterials] = useState(null);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [activeSection, setActiveSection] = useState('flashcards');
  const [flippedCards, setFlippedCards] = useState({});

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
    setMaterials(null);
    setFlippedCards({});
    setActiveSection('flashcards');
    setLoadingMaterials(true);
    try {
      const res = await API.get(`/api/notes/${note.noteId}/study-materials`);
      setMaterials(res.data);
    } catch (err) {
      console.error('Failed to fetch study materials', err);
      setMaterials({ error: 'Failed to load materials for this note.' });
    } finally {
      setLoadingMaterials(false);
    }
  };

  const toggleFlip = (idx) => {
    setFlippedCards(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const formatDate = (dt) => {
    if (!dt) return '';
    return new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '5.5rem', paddingBottom: '3rem', background: 'radial-gradient(ellipse at 20% 20%, rgba(124,58,237,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(6,182,212,0.06) 0%, transparent 50%)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #a78bfa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            📚 Notes History
          </h1>
          <p style={{ color: '#64748b', marginTop: '0.4rem' }}>Select a note to revisit your generated study materials.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* Left Panel: Notes List */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(124,58,237,0.08)' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Notes</p>
            </div>

            {loadingNotes ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ width: '2rem', height: '2rem', border: '2px solid rgba(124,58,237,0.2)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
              </div>
            ) : notes.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#475569' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📝</div>
                <p style={{ fontSize: '0.875rem' }}>No notes yet. Upload some!</p>
                <button onClick={() => navigate('/notes')} style={{ marginTop: '1rem', padding: '0.5rem 1.2rem', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                  Upload Notes
                </button>
              </div>
            ) : (
              <div style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
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
                      <p style={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 400, color: isActive ? '#c4b5fd' : '#cbd5e1', margin: 0, marginBottom: '0.2rem', lineHeight: 1.4 }}>
                        {note.title}
                      </p>
                      <p style={{ fontSize: '0.72rem', color: '#475569', margin: 0 }}>
                        {formatDate(note.createdAt)}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Panel: Study Materials */}
          <div>
            {!selectedNote && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.08)', borderRadius: '1.25rem', color: '#475569', textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👈</div>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#64748b' }}>Select a note from the left</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.4rem' }}>to view its saved flashcards and quiz Q&amp;A</p>
              </div>
            )}

            {loadingMaterials && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '1rem' }}>
                <div style={{ width: '3rem', height: '3rem', border: '3px solid rgba(124,58,237,0.2)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: '#64748b' }}>Loading study materials...</p>
              </div>
            )}

            {materials && !loadingMaterials && (
              <>
                {/* Selected note title */}
                <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>{selectedNote.title}</h2>
                    <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0, marginTop: '0.2rem' }}>Uploaded on {formatDate(selectedNote.createdAt)}</p>
                  </div>
                  {materials.hasQuiz && (
                    <button
                      onClick={() => navigate(`/quiz/${materials.quizId}`, { state: { questions: materials.questions?.map(q => ({ id: q.id, questionText: q.questionText, optionA: q.optionA, optionB: q.optionB, optionC: q.optionC, optionD: q.optionD })) } })}
                      style={{ padding: '0.6rem 1.4rem', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                    >
                      🧠 Retake Quiz
                    </button>
                  )}
                </div>

                {/* Section Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {[
                    { key: 'flashcards', label: `🃏 Flashcards (${materials.flashcards?.length || 0})` },
                    { key: 'quiz', label: `📋 Quiz Q&A (${materials.questions?.length || 0})` },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveSection(tab.key)}
                      style={{
                        padding: '0.55rem 1.2rem', border: '1px solid',
                        borderColor: activeSection === tab.key ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)',
                        borderRadius: '10px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: activeSection === tab.key ? 600 : 400,
                        color: activeSection === tab.key ? '#c4b5fd' : '#64748b',
                        background: activeSection === tab.key ? 'rgba(124,58,237,0.12)' : 'transparent',
                        transition: 'all 0.2s',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Flashcards Section */}
                {activeSection === 'flashcards' && (
                  <div>
                    {!materials.hasFlashcards ? (
                      <div style={{ padding: '3rem', textAlign: 'center', color: '#475569', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.07)' }}>
                        No flashcards generated for this note yet.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {materials.flashcards.map((fc, idx) => (
                          <div
                            key={fc.id}
                            onClick={() => toggleFlip(idx)}
                            title="Click to flip"
                            style={{ perspective: '1000px', cursor: 'pointer', height: '160px' }}
                          >
                            <div style={{
                              position: 'relative', width: '100%', height: '100%',
                              transformStyle: 'preserve-3d',
                              transform: flippedCards[idx] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                              transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
                            }}>
                              {/* Front */}
                              <div style={{
                                position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                                background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
                                borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                              }}>
                                <p style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Question {idx + 1}</p>
                                <p style={{ fontSize: '0.9rem', color: '#e2e8f0', margin: 0, lineHeight: 1.5 }}>{fc.question}</p>
                                <p style={{ fontSize: '0.7rem', color: '#475569', margin: 0, textAlign: 'right' }}>Click to reveal answer →</p>
                              </div>
                              {/* Back */}
                              <div style={{
                                position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                                background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)',
                                borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                              }}>
                                <p style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Answer</p>
                                <p style={{ fontSize: '0.9rem', color: '#e2e8f0', margin: 0, lineHeight: 1.5 }}>{fc.answer}</p>
                                <p style={{ fontSize: '0.7rem', color: '#475569', margin: 0, textAlign: 'right' }}>← Click to flip back</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Quiz Q&A Section */}
                {activeSection === 'quiz' && (
                  <div>
                    {!materials.hasQuiz ? (
                      <div style={{ padding: '3rem', textAlign: 'center', color: '#475569', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.07)' }}>
                        No quiz generated for this note yet.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {materials.questions.map((q, idx) => (
                          <div key={q.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1.25rem' }}>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.5rem' }}>Q{idx + 1}</p>
                            <p style={{ fontSize: '1rem', color: '#e2e8f0', fontWeight: 500, margin: '0 0 1rem', lineHeight: 1.5 }}>{q.questionText}</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                              {['A', 'B', 'C', 'D'].map(opt => {
                                const isCorrect = q.correctOption === opt;
                                return (
                                  <div
                                    key={opt}
                                    style={{
                                      padding: '0.6rem 0.9rem', borderRadius: '8px',
                                      background: isCorrect ? 'rgba(34,197,94,0.15)' : optionBg[opt],
                                      border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.5)' : optionBorder[opt]}`,
                                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                                    }}
                                  >
                                    <span style={{
                                      width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                                      background: isCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
                                      border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.6)' : optionBorder[opt]}`,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontSize: '0.7rem', fontWeight: 700,
                                      color: isCorrect ? '#4ade80' : optionColor[opt],
                                    }}>
                                      {isCorrect ? '✓' : opt}
                                    </span>
                                    <span style={{ fontSize: '0.82rem', color: isCorrect ? '#86efac' : '#cbd5e1', lineHeight: 1.3 }}>
                                      {q[`option${opt}`]}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
