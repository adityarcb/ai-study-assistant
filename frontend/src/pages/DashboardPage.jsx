import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { fetchDashboard } from '../api/dashboard';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Glass stat card with colored accent
function StatCard({ label, value, icon, gradientFrom, gradientTo, glowColor }) {
  return (
    <div style={{
      position: 'relative',
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: '20px',
      padding: '1.5rem',
      textAlign: 'center',
      boxShadow: `0 4px 24px rgba(0,0,0,0.3), 0 0 40px ${glowColor}14`,
      overflow: 'hidden',
      transition: 'all 0.3s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 12px 40px rgba(0,0,0,0.4), 0 0 60px ${glowColor}28`; e.currentTarget.style.borderColor=`${glowColor}40`; }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=`0 4px 24px rgba(0,0,0,0.3), 0 0 40px ${glowColor}14`; e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'; }}
    >
      {/* Top shimmer */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: `linear-gradient(90deg, transparent, ${glowColor}80, transparent)`,
      }} />
      {/* Icon circle */}
      <div style={{
        width: '56px', height: '56px', margin: '0 auto 1rem',
        background: `linear-gradient(135deg, ${gradientFrom}30, ${gradientTo}20)`,
        border: `1px solid ${gradientFrom}40`,
        borderRadius: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.6rem',
        boxShadow: `0 4px 16px ${glowColor}25`,
      }}>
        {icon}
      </div>
      <p style={{ fontSize: '2rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1, marginBottom: '0.4rem',
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>{value}</p>
      <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalNotes: 0, totalQuizzes: 0, averageScore: 0, totalFlashcards: 0 });
  const [scoreHistory, setScoreHistory] = useState({ content: [], pageNumber: 0, pageSize: 7, totalElements: 0, totalPages: 0, last: true });
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashRes = await fetchDashboard(page, 7);
        const { totalQuizzes, averageScore, totalFlashcards, scoreHistory: sh } = dashRes;
        setStats(prev => ({ ...prev, totalQuizzes, averageScore, totalFlashcards }));
        setScoreHistory(sh);
        const notesRes = await API.get('/api/notes');
        const notes = notesRes.data;
        setStats(prev => ({ ...prev, totalNotes: notes.length }));
        setRecentNotes(notes.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '4rem' }}>
      <div style={{
        width: '48px', height: '48px',
        border: '3px solid rgba(139,92,246,0.15)',
        borderTopColor: '#8b5cf6',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  );

  const statCards = [
    { label: 'Total Notes',    value: stats.totalNotes,     icon: '📝', gradientFrom: '#8b5cf6', gradientTo: '#a78bfa', glowColor: '#8b5cf6' },
    { label: 'Quizzes Taken',  value: stats.totalQuizzes,   icon: '✅', gradientFrom: '#10b981', gradientTo: '#34d399', glowColor: '#10b981' },
    { label: 'Average Score',  value: `${Number(stats.averageScore).toFixed(1)}%`, icon: '📊', gradientFrom: '#06b6d4', gradientTo: '#38bdf8', glowColor: '#06b6d4' },
    { label: 'Flashcards',     value: stats.totalFlashcards,icon: '📚', gradientFrom: '#ec4899', gradientTo: '#f472b6', glowColor: '#ec4899' },
  ];

  const chartData = {
    labels: scoreHistory.content.map(p => {
      const d = new Date(p.date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [{
      label: 'Score %',
      data: scoreHistory.content.map(p => Number(p.percentage)),
      fill: true,
      borderColor: '#8b5cf6',
      backgroundColor: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
        gradient.addColorStop(0, 'rgba(139,92,246,0.35)');
        gradient.addColorStop(1, 'rgba(139,92,246,0.00)');
        return gradient;
      },
      tension: 0.4,
      pointBackgroundColor: '#a78bfa',
      pointBorderColor: '#1e1b4b',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index', intersect: false,
        backgroundColor: 'rgba(10,8,30,0.85)',
        titleColor: '#c4b5fd',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(139,92,246,0.3)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#64748b', font: { size: 11 } },
      },
      y: {
        beginAtZero: true, max: 100,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#64748b', font: { size: 11 }, callback: v => `${v}%` },
      },
    },
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '5.5rem', paddingBottom: '3rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem', animation: 'slideUp 0.5s ease-out both' }}>
          <p style={{ fontSize: '0.8rem', color: '#7c3aed', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Welcome back
          </p>
          <h1 style={{
            fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '0.5rem',
            fontFamily: "'Space Grotesk', sans-serif",
            background: 'linear-gradient(135deg, #f1f5f9 0%, #c4b5fd 50%, #38bdf8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Hello, {user?.name} 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>Track your learning journey and crush your study goals.</p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem', animation: 'slideUp 0.6s ease-out both' }}>
          {statCards.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        {/* Chart + Recent Notes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>

          {/* Chart Card */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '1.75rem',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Top glow line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), rgba(6,182,212,0.6), transparent)' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.2rem' }}>Score Progress</h2>
                <p style={{ fontSize: '0.8rem', color: '#475569' }}>Your quiz performance over time</p>
              </div>
              {scoreHistory.totalPages > 1 && (
                <span style={{ fontSize: '0.75rem', color: '#64748b', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '99px', padding: '0.2rem 0.6rem' }}>
                  Page {scoreHistory.pageNumber + 1} / {scoreHistory.totalPages}
                </span>
              )}
            </div>

            {scoreHistory.content.length > 0 ? (
              <>
                <Line data={chartData} options={chartOptions} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
                  <button onClick={() => setPage(p => Math.max(p - 1, 0))} disabled={page === 0}
                    className="btn-secondary" style={{ padding: '0.45rem 1.2rem', fontSize: '0.85rem', opacity: page === 0 ? 0.4 : 1 }}>
                    ← Prev
                  </button>
                  <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                    {scoreHistory.totalElements} total attempts
                  </span>
                  <button onClick={() => setPage(p => scoreHistory.last ? p : p + 1)} disabled={scoreHistory.last}
                    className="btn-primary" style={{ padding: '0.45rem 1.2rem', fontSize: '0.85rem', opacity: scoreHistory.last ? 0.4 : 1 }}>
                    Next →
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📊</div>
                <p style={{ color: '#475569', marginBottom: '1.25rem' }}>No quiz data yet. Take your first quiz!</p>
                <Link to="/notes" className="btn-primary">Go to Notes</Link>
              </div>
            )}
          </div>

          {/* Recent Notes Panel */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '1.75rem',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.5), rgba(236,72,153,0.5), transparent)' }} />

            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1.25rem' }}>Recent Notes</h3>

            {recentNotes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.5 }}>📝</div>
                <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1rem' }}>No notes yet.</p>
                <Link to="/notes" className="btn-primary" style={{ fontSize: '0.85rem' }}>Add Note</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {recentNotes.map(note => (
                  <div key={note.noteId}
                    onClick={() => navigate(`/study/${note.noteId}`)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '14px',
                      border: '1px solid rgba(255,255,255,0.06)',
                      background: 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(139,92,246,0.08)'; e.currentTarget.style.borderColor='rgba(139,92,246,0.25)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'; }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 500, color: '#e2e8f0', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {note.title}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.15rem' }}>
                        {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#8b5cf6', marginLeft: '0.5rem', whiteSpace: 'nowrap' }}>Study →</span>
                  </div>
                ))}
                <Link to="/notes" style={{ display: 'block', textAlign: 'center', marginTop: '0.5rem', fontSize: '0.8rem', color: '#64748b', textDecoration: 'none', padding: '0.5rem' }}
                  onMouseEnter={e => e.target.style.color='#a78bfa'}
                  onMouseLeave={e => e.target.style.color='#64748b'}
                >
                  View all notes →
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

