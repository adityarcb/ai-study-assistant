import { useState, useEffect } from 'react';
import API from '../api/axios';

const ACHIEVEMENTS = [
  {
    id: 'first-quiz',
    icon: '🎯',
    title: 'First Steps',
    desc: 'Take your first quiz',
    test: (s) => s.attempts >= 1,
    progress: (s) => Math.min(s.attempts, 1),
    max: 1,
    color: '#38bdf8',
  },
  {
    id: 'quiz-whiz',
    icon: '🧠',
    title: 'Quiz Whiz',
    desc: 'Score 90% or higher on any quiz',
    test: (s) => s.best >= 90,
    progress: (s) => (s.best >= 90 ? 1 : 0),
    max: 1,
    color: '#a78bfa',
  },
  {
    id: 'perfect-score',
    icon: '🏆',
    title: 'Perfect Score',
    desc: 'Score 100% on a quiz',
    test: (s) => s.hasPerfect,
    progress: (s) => (s.hasPerfect ? 1 : 0),
    max: 1,
    color: '#fbbf24',
  },
  {
    id: 'marathon',
    icon: '🏃',
    title: 'Marathon Runner',
    desc: 'Take 5 quizzes',
    test: (s) => s.attempts >= 5,
    progress: (s) => Math.min(s.attempts, 5),
    max: 5,
    color: '#34d399',
  },
  {
    id: 'topic-explorer',
    icon: '🗺️',
    title: 'Topic Explorer',
    desc: 'Take quizzes on 3 different topics',
    test: (s) => s.topics >= 3,
    progress: (s) => Math.min(s.topics, 3),
    max: 3,
    color: '#f472b6',
  },
  {
    id: 'collector',
    icon: '📚',
    title: 'Knowledge Collector',
    desc: 'Create 3 notes',
    test: (s) => s.notes >= 3,
    progress: (s) => Math.min(s.notes, 3),
    max: 3,
    color: '#fb923c',
  },
  {
    id: 'consistent',
    icon: '📈',
    title: 'Consistent Learner',
    desc: 'Keep an average score of 70% or higher',
    test: (s) => s.attempts > 0 && s.average >= 70,
    progress: (s) => (s.attempts > 0 && s.average >= 70 ? 1 : 0),
    max: 1,
    color: '#06b6d4',
  },
  {
    id: 'double-digit',
    icon: '🔥',
    title: 'Study Streak',
    desc: 'Take 10 quizzes',
    test: (s) => s.attempts >= 10,
    progress: (s) => Math.min(s.attempts, 10),
    max: 10,
    color: '#f43f5e',
  },
];

export default function AchievementsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, notesRes] = await Promise.all([
          API.get('/api/quiz/history'),
          API.get('/api/notes'),
        ]);
        const attempts = historyRes.data;
        const percentages = attempts.map(a => Number(a.percentage));
        const uniqueTopics = new Set(attempts.map(a => a.noteTitle)).size;
        setStats({
          attempts: attempts.length,
          best: percentages.length ? Math.max(...percentages) : 0,
          average: percentages.length ? (percentages.reduce((a, b) => a + b, 0) / percentages.length) : 0,
          hasPerfect: percentages.some(p => p === 100),
          topics: uniqueTopics,
          notes: notesRes.data.length,
        });
      } catch (err) {
        console.error('Failed to fetch achievements data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div className="spinner" />
      </div>
    );
  }

  const unlockedCount = ACHIEVEMENTS.filter(a => stats && a.test(stats)).length;

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #a78bfa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🏆 Achievements
        </h1>
        <p style={{ color: '#64748b', marginTop: '0.4rem' }}>
          {stats && stats.attempts > 0
            ? `You've unlocked ${unlockedCount} of ${ACHIEVEMENTS.length} achievements. Keep studying!`
            : 'Take quizzes and create notes to unlock achievements.'}
        </p>
      </div>

      {/* Overall progress bar */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>Overall Progress</p>
          <p style={{ fontSize: '0.85rem', color: '#a78bfa', fontWeight: 700, margin: 0 }}>{unlockedCount}/{ACHIEVEMENTS.length}</p>
        </div>
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{
            width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%`, height: '100%',
            background: 'linear-gradient(90deg, #7c3aed, #06b6d4)', borderRadius: '99px',
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>

      {/* Achievement cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {ACHIEVEMENTS.map((a) => {
          const unlocked = stats && a.test(stats);
          const prog = stats ? a.progress(stats) : 0;
          return (
            <div
              key={a.id}
              style={{
                padding: '1.5rem',
                borderRadius: '1.25rem',
                background: unlocked ? `${a.color}0F` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${unlocked ? `${a.color}50` : 'rgba(255,255,255,0.07)'}`,
                opacity: unlocked ? 1 : 0.6,
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                  background: unlocked ? `${a.color}22` : 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                  filter: unlocked ? 'none' : 'grayscale(1)',
                }}>
                  {a.icon}
                </div>
                <div>
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: unlocked ? '#f8fafc' : '#94a3b8', margin: 0 }}>{a.title}</p>
                  <p style={{ fontSize: '0.72rem', color: unlocked ? a.color : '#64748b', fontWeight: 600, margin: '0.1rem 0 0' }}>
                    {unlocked ? 'UNLOCKED' : 'LOCKED'}
                  </p>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 0.9rem' }}>{a.desc}</p>
              {!unlocked && a.max > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${(prog / a.max) * 100}%`, height: '100%', background: a.color, borderRadius: '99px' }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{prog}/{a.max}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
