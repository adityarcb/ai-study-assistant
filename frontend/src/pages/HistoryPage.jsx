import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';

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
  const location = useLocation();
  const autoSelectedRef = useRef(false);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [materials, setMaterials] = useState(null);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [activeSection, setActiveSection] = useState('summary');
  const [flippedCards, setFlippedCards] = useState({});

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await API.get('/api/notes');
      setNotes(res.data);
      const targetId = location.state?.selectedNoteId;
      if (targetId && !autoSelectedRef.current) {
        autoSelectedRef.current = true;
        const target = res.data.find((n) => n.noteId === targetId);
        if (target) {
          setLoadingNotes(false);
          setSelectedNote(target);
          setMaterials(null);
          setActiveSection('summary');
          setFlippedCards({});
          setLoadingMaterials(true);
          try {
            const matRes = await API.get(`/api/notes/${targetId}/study-materials`);
            setMaterials(matRes.data);
          } catch (err) {
            console.error('Failed to load materials', err);
            setMaterials({ error: 'Failed to load materials.' });
          } finally {
            setLoadingMaterials(false);
          }
          navigate(location.pathname, { replace: true, state: null });
          return;
        }
      }
    } catch (err) {
      console.error('Failed to fetch notes', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleSelectNote = async (note) => {
    setSelectedNote(note);
    setMaterials(null);
    setFlippedCards({});
    setActiveSection('summary');
    setGenError('');
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

  const handleGenerateNow = async () => {
    if (!selectedNote) return;
    setGenerating(true);
    setGenError('');
    try {
      await API.post('/api/study/generate', { noteId: selectedNote.noteId });
      // Re-fetch materials after generation
      await handleSelectNote(selectedNote);
    } catch (err) {
      console.error('Generation failed', err);
      setGenError(err.response?.data?.message || 'Failed to generate study materials. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleFlip = (idx) => {
    setFlippedCards(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const formatDate = (dt) => {
    if (!dt) return '';
    return new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const hasAnyMaterials = materials && (materials.hasSummary || materials.hasFlashcards || materials.hasQuiz);

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #a78bfa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            📚 Notes History
          </h1>
          <p style={{ color: '#64748b', marginTop: '0.4rem' }}>Select a note to revisit your generated summaries, flashcards, and quizzes.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* Left Panel: Notes List */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(124,58,237,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Your Notes</p>
              <span style={{ fontSize: '0.75rem', color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>{notes.length}</span>
            </div>

            {loadingNotes ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ width: '2rem', height: '2rem', border: '2px solid rgba(124,58,237,0.2)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
              </div>
            ) : notes.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#475569' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📝</div>
                <p style={{ fontSize: '0.875rem' }}>No notes uploaded yet.</p>
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
                <p style={{ fontSize: '0.875rem', marginTop: '0.4rem' }}>to view its summary, flashcards, and quiz Q&amp;A</p>
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
                {/* Selected note title & retake button */}
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

                {genError && (
                  <div style={{ marginBottom: '1.25rem', padding: '0.9rem 1.2rem', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '10px', color: '#f43f5e', fontSize: '0.875rem' }}>
                    ⚠️ {genError}
                  </div>
                )}

                {/* If no materials generated yet */}
                {!hasAnyMaterials ? (
                  <div style={{ padding: '3.5rem 2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '1.25rem', border: '1px dashed rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🤖</div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0', margin: '0 0 0.5rem' }}>No Study Materials Generated Yet</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
                      Generate AI summaries, flashcards, and quizzes for this note with a single click.
                    </p>
                    <button
                      onClick={handleGenerateNow}
                      disabled={generating}
                      style={{
                        padding: '0.8rem 1.8rem', background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                        border: 'none', borderRadius: '12px', color: 'white', fontWeight: 700, fontSize: '0.95rem',
                        cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.7 : 1,
                        boxShadow: '0 4px 20px rgba(124,58,237,0.4)', display: 'inline-flex', alignItems: 'center', gap: '0.6rem'
                      }}
                    >
                      {generating ? (
                        <>
                          <div style={{ width: '1.2rem', height: '1.2rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          Generating Study Materials...
                        </>
                      ) : (
                        '🚀 Generate Study Materials'
                      )}
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Section Tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                      {[
                        { key: 'summary', label: '📖 Summary' },
                        { key: 'flashcards', label: `🃏 Flashcards (${materials.flashcards?.length || 0})` },
                        { key: 'quiz', label: `📋 Quiz Q&A (${materials.questions?.length || 0})` },
                        { key: 'content', label: '📄 Original Note' },
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

                    {/* Summary Tab */}
                    {activeSection === 'summary' && (
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', padding: '1.5rem 1.75rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ padding: '0.2rem 0.5rem', background: 'rgba(124,58,237,0.2)', borderRadius: '6px', fontSize: '0.85rem' }}>📖</span>
                          Topic Summary
                        </h3>
                        {materials.hasSummary ? (
                          <div style={{ color: '#cbd5e1', lineHeight: '1.85', fontSize: '0.95rem' }}>
                            {materials.summary.split('\n').filter(p => p.trim()).map((para, i) => (
                              <p key={i} style={{ marginBottom: '1rem' }}>{para}</p>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No summary stored for this note.</p>
                        )}
                      </div>
                    )}

                    {/* Flashcards Tab */}
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
                                style={{ perspective: '1000px', cursor: 'pointer', height: '240px' }}
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
                                    <p style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, flexShrink: 0 }}>Question {idx + 1}</p>
                                    <div style={{ flexGrow: 1, overflowY: 'auto', padding: '0.5rem 0', margin: '0.2rem 0' }}>
                                      <p style={{ fontSize: '0.9rem', color: '#e2e8f0', margin: 0, lineHeight: 1.5 }}>{fc.question}</p>
                                    </div>
                                    <p style={{ fontSize: '0.7rem', color: '#475569', margin: 0, textAlign: 'right' }}>Click to reveal answer →</p>
                                  </div>
                                  {/* Back */}
                                  <div style={{
                                    position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                                    transform: 'rotateY(180deg)',
                                    background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)',
                                    borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                                  }}>
                                    <p style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, flexShrink: 0 }}>Answer</p>
                                    <div style={{ flexGrow: 1, overflowY: 'auto', padding: '0.5rem 0', margin: '0.2rem 0' }}>
                                      <p style={{ fontSize: '0.9rem', color: '#e2e8f0', margin: 0, lineHeight: 1.5 }}>{fc.answer}</p>
                                    </div>
                                    <p style={{ fontSize: '0.7rem', color: '#475569', margin: 0, textAlign: 'right' }}>← Click to flip back</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quiz Q&A Tab */}
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

                    {/* Original Note Tab */}
                    {activeSection === 'content' && (
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', padding: '1.5rem 1.75rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ padding: '0.2rem 0.5rem', background: 'rgba(6,182,212,0.2)', borderRadius: '6px', fontSize: '0.85rem' }}>📄</span>
                          Original Uploaded Text
                        </h3>
                        <div style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', maxHeight: '450px', overflowY: 'auto' }}>
                          {materials.content || 'No text available.'}
                        </div>
                      </div>
                    )}
                  </>
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
