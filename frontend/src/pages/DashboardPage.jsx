import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { fetchDashboard } from '../api/dashboard';
import { Line } from 'react-chartjs-2';
import RemindersPanel from '../components/RemindersPanel';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function StatCard({ label, value, icon, subtext, gradientFrom, gradientTo, glowColor }) {
  return (
    <div style={{
      position: 'relative',
      background: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '20px',
      padding: '1.5rem',
      boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
      overflow: 'hidden',
      WebkitMaskImage: '-webkit-radial-gradient(white, black)',
      transform: 'translateZ(0)',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px) translateZ(0)'; e.currentTarget.style.boxShadow=`0 12px 40px rgba(0,0,0,0.4), 0 0 40px ${glowColor}1A`; e.currentTarget.style.borderColor=`${glowColor}40`; }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0) translateZ(0)'; e.currentTarget.style.boxShadow=`0 4px 24px rgba(0,0,0,0.2)`; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: `linear-gradient(90deg, transparent, ${glowColor}60, transparent)`,
      }} />
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{
          width: '46px', height: '46px',
          background: `linear-gradient(135deg, ${gradientFrom}30, ${gradientTo}20)`,
          border: `1px solid ${gradientFrom}40`,
          borderRadius: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem', flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 500, marginBottom: '0.2rem' }}>{label}</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1, marginBottom: '0.4rem' }}>{value}</p>
          <p style={{ fontSize: '0.75rem', color: gradientFrom, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {subtext}
          </p>
        </div>
      </div>
    </div>
  );
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function avg(arr) {
  return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null;
}

function countTrend(items, getDate) {
  const now = Date.now();
  let recent = 0;
  let previous = 0;
  items.forEach((item) => {
    const t = new Date(getDate(item)).getTime();
    if (Number.isNaN(t)) return;
    if (t >= now - WEEK_MS) recent += 1;
    else if (t >= now - 2 * WEEK_MS) previous += 1;
  });
  const delta = recent - previous;
  if (delta > 0) return `↑ ${delta} from last week`;
  if (delta < 0) return `↓ ${Math.abs(delta)} vs last week`;
  if (recent > 0) return '→ No change this week';
  return '— No activity yet';
}

function weightedTrend(items, getDate, getWeight) {
  const now = Date.now();
  let recent = 0;
  let previous = 0;
  items.forEach((item) => {
    const t = new Date(getDate(item)).getTime();
    if (Number.isNaN(t)) return;
    const w = getWeight(item) || 0;
    if (t >= now - WEEK_MS) recent += w;
    else if (t >= now - 2 * WEEK_MS) previous += w;
  });
  const delta = recent - previous;
  if (delta > 0) return `↑ ${delta} new cards this week`;
  if (delta < 0) return `↓ ${Math.abs(delta)} cards vs last week`;
  if (recent > 0) return '→ No new cards this week';
  return '— No cards yet';
}

function scoreTrend(attempts) {
  const now = Date.now();
  const recent = [];
  const previous = [];
  attempts.forEach((a) => {
    const t = new Date(a.attemptedAt).getTime();
    if (Number.isNaN(t)) return;
    const p = Number(a.percentage);
    if (t >= now - WEEK_MS) recent.push(p);
    else if (t >= now - 2 * WEEK_MS) previous.push(p);
  });
  const r = avg(recent);
  const p = avg(previous);
  if (r === null && p === null) return { sub: 'No quizzes yet', pill: '🎯 Take your first quiz' };
  if (r === null) return { sub: 'No quizzes this week', pill: '📉 No quizzes this week' };
  if (p === null) return { sub: `↑ ${r.toFixed(1)}% avg this week`, pill: `📈 ${r.toFixed(0)}% avg this week` };
  const delta = r - p;
  if (delta > 0.5) return { sub: `↑ +${delta.toFixed(1)}% improvement`, pill: `📈 +${delta.toFixed(0)}% improvement` };
  if (delta < -0.5) return { sub: `↓ ${Math.abs(delta).toFixed(1)}% from last week`, pill: `📉 -${Math.abs(delta).toFixed(0)}% this week` };
  return { sub: '→ Steady performance', pill: '📊 Scores steady' };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalNotes: 0, totalQuizzes: 0, averageScore: 0, totalFlashcards: 0 });
  const [scoreHistory, setScoreHistory] = useState({ content: [], pageNumber: 0, pageSize: 7, totalElements: 0, totalPages: 0, last: true });
  const [recentNotes, setRecentNotes] = useState([]);
  const [trends, setTrends] = useState({ notes: '', quizzes: '', score: '', scorePill: '', cards: '', pendingQuizzes: 0, best: null, lowest: null, passRate: null });
  const [failingQuizzes, setFailingQuizzes] = useState([]);
  const [quizRetakeMap, setQuizRetakeMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashRes = await fetchDashboard(0, 7);
        const { totalQuizzes, averageScore, totalFlashcards, scoreHistory: sh } = dashRes;
        setStats(prev => ({ ...prev, totalQuizzes, averageScore, totalFlashcards }));
        setScoreHistory(sh);
        const notesRes = await API.get('/api/notes');
        const notes = notesRes.data;
        setStats(prev => ({ ...prev, totalNotes: notes.length }));
        setRecentNotes(notes.slice(0, 4));

        const historyRes = await API.get('/api/quiz/history');
        const attempts = historyRes.data;
        setFailingQuizzes(attempts.filter((a) => Number(a.percentage) < 60));

        const materialsRes = await Promise.allSettled(
          notes.map((n) => API.get(`/api/notes/${n.noteId}/study-materials`))
        );
        const materialsByNote = {};
        notes.forEach((n, i) => {
          if (materialsRes[i].status === 'fulfilled') materialsByNote[n.noteId] = materialsRes[i].value.data;
        });

        const cardItems = notes.map((n) => ({
          date: n.createdAt,
          count: (materialsByNote[n.noteId]?.flashcards || []).length,
        }));
        const pendingQuizzes = notes.filter((n) => !materialsByNote[n.noteId]?.hasQuiz).length;

        const retakeMap = {};
        Object.values(materialsByNote).forEach((mat) => {
          if (mat.quizId && mat.questions?.length) {
            retakeMap[mat.quizId] = mat.questions.map(({ id, questionText, optionA, optionB, optionC, optionD }) => ({ id, questionText, optionA, optionB, optionC, optionD }));
          }
        });
        setQuizRetakeMap(retakeMap);
        const st = scoreTrend(attempts);
        const percentages = attempts.map((a) => Number(a.percentage));

        setTrends({
          notes: countTrend(notes, (n) => n.createdAt),
          quizzes: countTrend(attempts, (a) => a.attemptedAt),
          score: st.sub,
          scorePill: st.pill,
          cards: weightedTrend(cardItems, (c) => c.date, (c) => c.count),
          pendingQuizzes,
          best: percentages.length ? Math.max(...percentages) : null,
          lowest: percentages.length ? Math.min(...percentages) : null,
          passRate: attempts.length ? Math.round((attempts.filter((a) => Number(a.percentage) >= 60).length / attempts.length) * 100) : null,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  const handleRetake = (quiz) => {
    const questions = quizRetakeMap[quiz.quizId];
    if (!questions) return;
    navigate(`/quiz/${quiz.quizId}`, { state: { questions } });
  };

  const hasHistory = scoreHistory.content.length > 0;

  const chartData = {
    labels: hasHistory ? scoreHistory.content.map(p => new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) : [],
    datasets: [{
      label: 'Score %',
      data: hasHistory ? scoreHistory.content.map(p => Number(p.percentage)) : [],
      fill: true,
      borderColor: '#38bdf8',
      backgroundColor: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
        gradient.addColorStop(0, 'rgba(56,189,248,0.4)');
        gradient.addColorStop(1, 'rgba(124,58,237,0.05)');
        return gradient;
      },
      tension: 0.4,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#38bdf8',
      pointBorderWidth: 2,
      pointRadius: 4,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false }, ticks: { color: '#64748b' } },
      y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false, borderDash: [5, 5] }, ticks: { color: '#64748b', callback: v => `${v}%` } },
    },
  };

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header row */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.75rem' }}>
          Good <span style={{ color: '#c084fc', fontWeight: 700 }}>evening</span>, {user?.name}! 👋
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
          Let's continue your AI learning journey and achieve your goals.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(245,158,11,0.1)', color: '#fcd34d', padding: '0.3rem 0.8rem', borderRadius: '99px', fontSize: '0.8rem', border: '1px solid rgba(245,158,11,0.2)' }}>
            {recentNotes.length === 0
              ? '🔥 Upload notes to start'
              : trends.pendingQuizzes > 0
                ? `🔥 ${trends.pendingQuizzes} quizzes pending`
                : '✅ All quizzes completed'}
          </span>
          <span style={{ background: 'rgba(16,185,129,0.1)', color: '#6ee7b7', padding: '0.3rem 0.8rem', borderRadius: '99px', fontSize: '0.8rem', border: '1px solid rgba(16,185,129,0.2)' }}>
            {trends.scorePill}
          </span>
          <span style={{ background: 'rgba(56,189,248,0.1)', color: '#7dd3fc', padding: '0.3rem 0.8rem', borderRadius: '99px', fontSize: '0.8rem', border: '1px solid rgba(56,189,248,0.2)' }}>🎯 Keep it up!</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <StatCard label="Total Notes" value={stats.totalNotes} icon="📄" subtext={trends.notes} gradientFrom="#38bdf8" gradientTo="#0284c7" glowColor="#38bdf8" />
        <StatCard label="Quizzes Taken" value={stats.totalQuizzes} icon="✅" subtext={trends.quizzes} gradientFrom="#10b981" gradientTo="#047857" glowColor="#10b981" />
        <StatCard label="Average Score" value={stats.averageScore ? `${Number(stats.averageScore).toFixed(1)}%` : '—'} icon="📊" subtext={trends.score} gradientFrom="#a855f7" gradientTo="#7e22ce" glowColor="#a855f7" />
        <StatCard label="Flashcards" value={stats.totalFlashcards} icon="📚" subtext={trends.cards} gradientFrom="#f59e0b" gradientTo="#b45309" glowColor="#f59e0b" />
      </div>

      {/* Middle Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Chart */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', fontWeight: 600 }}>Score Progress</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Your quiz performance over time</p>
            </div>
            <select style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div style={{ height: '240px', width: '100%' }}>
            {hasHistory ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem' }}>📊</div>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>No quiz data yet</p>
                <Link to="/notes" style={{ fontSize: '0.85rem', color: '#8b5cf6', textDecoration: 'none' }}>Take your first quiz</Link>
              </div>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
            <div><p style={{ fontSize: '0.75rem', color: '#64748b' }}>Best Score</p><p style={{ color: '#10b981', fontWeight: 600 }}>{trends.best !== null ? `${trends.best.toFixed(0)}%` : '—'}</p></div>
            <div><p style={{ fontSize: '0.75rem', color: '#64748b' }}>Lowest Score</p><p style={{ color: '#f43f5e', fontWeight: 600 }}>{trends.lowest !== null ? `${trends.lowest.toFixed(0)}%` : '—'}</p></div>
            <div><p style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Quizzes</p><p style={{ color: '#f8fafc', fontWeight: 600 }}>{stats.totalQuizzes}</p></div>
            <div><p style={{ fontSize: '0.75rem', color: '#64748b' }}>Pass Rate</p><p style={{ color: '#f59e0b', fontWeight: 600 }}>{trends.passRate !== null ? `${trends.passRate}%` : '—'}</p></div>
          </div>
        </div>

        {/* Recent Notes */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', fontWeight: 600 }}>Recent Notes</h3>
            <Link to="/notes" style={{ fontSize: '0.8rem', color: '#8b5cf6', textDecoration: 'none' }}>View all</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentNotes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.5 }}>📝</div>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>No notes yet. Add your first note to start studying.</p>
                <Link to="/notes" className="btn-primary" style={{ fontSize: '0.85rem' }}>Add Note</Link>
              </div>
            ) : recentNotes.map((n, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: ['rgba(59,130,246,0.2)', 'rgba(168,85,247,0.2)', 'rgba(16,185,129,0.2)', 'rgba(245,158,11,0.2)'][i%4], color: ['#3b82f6', '#a855f7', '#10b981', '#f59e0b'][i%4], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📄</div>
                  <div>
                    <p style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 500 }}>{n.title}</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(n.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <button onClick={() => navigate('/history', { state: { selectedNoteId: n.noteId } })} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#c4b5fd', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>Study →</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
        {/* Continue Learning */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', fontWeight: 600 }}>Continue Learning</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Pick up where you left off</p>
            </div>
            <Link to="/history" style={{ fontSize: '0.8rem', color: '#8b5cf6', textDecoration: 'none' }}>View all</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(168,85,247,0.2)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📄</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.95rem', color: '#f8fafc', fontWeight: 500, marginBottom: '0.4rem' }}>
                {recentNotes.length > 0 ? recentNotes[0].title : 'Database Normalization'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px' }}>
                  <div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, #a855f7, #38bdf8)', borderRadius: '99px' }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>60% Complete</span>
              </div>
            </div>
            <button
              onClick={() => navigate(recentNotes.length > 0 ? '/history' : '/notes', recentNotes.length > 0 ? { state: { selectedNoteId: recentNotes[0].noteId } } : undefined)}
              className="btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              Continue Study →
            </button>
          </div>
        </div>
      </div>

      <RemindersPanel failingQuizzes={failingQuizzes} onRetake={handleRetake} quizRetakeMap={quizRetakeMap} />

    </div>
  );
}
