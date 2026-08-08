import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const PASS_THRESHOLD = 70;

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const { data, error, loading } = useFetch('/api/analytics');

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>😕</div>
        <p style={{ color: '#f87171' }}>{error}</p>
      </div>
    );
  }

  if (!data || data.overall.totalAttempts === 0) {
    return (
      <div style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>Learning Analytics</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>AI-powered insights into how you learn</p>
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <p style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: '0.25rem' }}>No quiz attempts yet</p>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Take a quiz to unlock personalized learning analytics</p>
          <button onClick={() => navigate('/notes')} className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
            Upload a note to get started →
          </button>
        </div>
      </div>
    );
  }

  const { overall, topics, trend } = data;

  const sortedTopics = [...topics].sort((a, b) => a.averageScore - b.averageScore);
  const weakest = sortedTopics[0];
  const strongest = sortedTopics[sortedTopics.length - 1];

  const trendChart = {
    labels: trend.map((p) => p.date),
    datasets: [{
      label: 'Cumulative average score',
      data: trend.map((p) => p.percentage),
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      fill: true,
      tension: 0.35,
      pointRadius: 3,
      pointBackgroundColor: '#a78bfa',
    }],
  };

  const topicChart = {
    labels: topics.map((t) => t.noteTitle.length > 20 ? t.noteTitle.substring(0, 20) + '…' : t.noteTitle),
    datasets: [{
      label: 'Average score (%)',
      data: topics.map((t) => t.averageScore),
      backgroundColor: topics.map((t) => t.averageScore >= PASS_THRESHOLD ? 'rgba(16, 185, 129, 0.7)' : 'rgba(244, 63, 94, 0.7)'),
      borderRadius: 8,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { size: 12 } } },
      tooltip: { backgroundColor: '#1e293b', titleColor: '#e2e8f0', bodyColor: '#94a3b8' },
    },
    scales: {
      x: { ticks: { color: '#64748b', maxRotation: 45 }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { min: 0, max: 100, ticks: { color: '#64748b', callback: (v) => v + '%' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  };

  const statCards = [
    { label: 'Average Score', value: `${overall.averageScore}%`, icon: '🎯', color: '#8b5cf6' },
    { label: 'Best Score', value: `${overall.bestScore}%`, icon: '🏆', color: '#38bdf8' },
    { label: 'Quizzes Taken', value: overall.totalAttempts, icon: '📝', color: '#10b981' },
    { label: 'Topics Passed', value: `${overall.topicsPassed}/${overall.topicsAttempted}`, icon: '✅', color: '#f59e0b' },
  ];

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>Learning Analytics</h1>
        <p style={{ color: '#64748b' }}>AI-powered insights into how you learn — weakest topics, score trends, and what to study next.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {statCards.map((s) => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }} className="analytics-2col">
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '1.5rem' }}>
          <h3 style={{ color: '#f8fafc', fontWeight: 600, marginBottom: '1rem' }}>Score Trend</h3>
          <Line data={trendChart} options={chartOptions} />
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '1.5rem' }}>
          <h3 style={{ color: '#f8fafc', fontWeight: 600, marginBottom: '1rem' }}>Topic Performance</h3>
          <Bar data={topicChart} options={chartOptions} />
        </div>
      </div>

      {/* Weakest / strongest */}
      {weakest && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }} className="analytics-2col">
          <div style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fb7185', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Weakest topic</div>
            <div style={{ color: '#f8fafc', fontWeight: 600, marginBottom: '0.25rem' }}>{weakest.noteTitle}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem' }}>Average {weakest.averageScore}% across {weakest.attempts} attempt{weakest.attempts !== 1 ? 's' : ''}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{weakest.recommendation}</div>
          </div>
          {strongest && (
            <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '16px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Strongest topic</div>
              <div style={{ color: '#f8fafc', fontWeight: 600, marginBottom: '0.25rem' }}>{strongest.noteTitle}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem' }}>Average {strongest.averageScore}% across {strongest.attempts} attempt{strongest.attempts !== 1 ? 's' : ''}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{strongest.recommendation}</div>
            </div>
          )}
        </div>
      )}

      {/* Topic table */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
          <h3 style={{ color: '#f8fafc', fontWeight: 600 }}>Topic Breakdown</h3>
          <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>Performance per uploaded note</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                {['Topic', 'Attempts', 'Avg', 'Best', 'Worst', 'Pass Rate', 'Recommendation'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topics.map((t) => {
                const passRate = Math.round((t.passed / t.attempts) * 100);
                const isWeak = t.averageScore < PASS_THRESHOLD;
                return (
                  <tr key={t.noteId} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.9rem 1.25rem', color: '#e2e8f0', fontWeight: 500 }}>{t.noteTitle}</td>
                    <td style={{ padding: '0.9rem 1.25rem', color: '#94a3b8' }}>{t.attempts}</td>
                    <td style={{ padding: '0.9rem 1.25rem', color: isWeak ? '#fb7185' : '#34d399', fontWeight: 600 }}>{t.averageScore}%</td>
                    <td style={{ padding: '0.9rem 1.25rem', color: '#94a3b8' }}>{t.bestScore}%</td>
                    <td style={{ padding: '0.9rem 1.25rem', color: '#94a3b8' }}>{t.worstScore}%</td>
                    <td style={{ padding: '0.9rem 1.25rem', color: '#94a3b8' }}>{passRate}%</td>
                    <td style={{ padding: '0.9rem 1.25rem', color: '#94a3b8', fontSize: '0.85rem' }}>{t.recommendation}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
