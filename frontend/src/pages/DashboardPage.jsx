import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalNotes: 0, totalQuizzes: 0, averageScore: 0 });
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, n] = await Promise.all([
          API.get('/api/dashboard/stats'),
          API.get('/api/notes'),
        ]);
        setStats(s.data);
        setRecentNotes(n.data.slice(0, 5));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-16"><div className="spinner" /></div>;

  const statCards = [
    { label: 'Total Notes', value: stats.totalNotes, icon: '📝', color: 'primary' },
    { label: 'Quizzes Taken', value: stats.totalQuizzes, icon: '✅', color: 'emerald' },
    { label: 'Average Score', value: `${stats.averageScore}%`, icon: '📊', color: 'amber' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-10 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold text-surface-100">Hello, {user?.name} 👋</h1>
        <p className="text-surface-400 mt-2 text-lg">Ready to study? Here's your overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 animate-slide-up">
        {statCards.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="text-3xl mb-2">{s.icon}</div>
            <p className="text-3xl font-bold text-surface-100">{s.value}</p>
            <p className="text-surface-400 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-surface-100">Recent Notes</h2>
            <Link to="/notes" className="text-sm text-primary-400 hover:text-primary-300">View all →</Link>
          </div>
          {recentNotes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-surface-400 mb-4">No notes yet. Add your first!</p>
              <Link to="/notes" className="btn-primary">Add Note</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <div key={note.noteId} className="flex items-center justify-between p-4 rounded-xl bg-surface-800/30 border border-surface-700/30 hover:border-surface-600/50 transition-all group">
                  <div className="min-w-0">
                    <p className="font-medium text-surface-200 truncate">{note.title}</p>
                    <p className="text-xs text-surface-500">{new Date(note.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => navigate(`/study/${note.noteId}`)} className="px-4 py-2 text-sm font-medium text-primary-400 bg-primary-500/10 rounded-lg hover:bg-primary-500/20 transition-all opacity-0 group-hover:opacity-100">
                    Study Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-surface-100 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/notes" className="flex items-center gap-3 p-4 rounded-xl bg-primary-500/5 border border-primary-500/20 hover:bg-primary-500/10 transition-all">
              <span className="text-2xl">➕</span>
              <div><p className="font-medium text-surface-200">Add New Note</p><p className="text-xs text-surface-400">Paste text or upload PDF</p></div>
            </Link>
            <Link to="/progress" className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-all">
              <span className="text-2xl">📈</span>
              <div><p className="font-medium text-surface-200">View Progress</p><p className="text-xs text-surface-400">Track your scores</p></div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
