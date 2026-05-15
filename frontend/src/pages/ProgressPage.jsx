import { useState, useEffect } from 'react';
import API from '../api/axios';
import ProgressChart from '../components/ProgressChart';

export default function ProgressPage() {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await API.get('/api/progress');
        setProgressData(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchProgress();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-16"><div className="spinner" /></div>;

  // Build summary table data: group by noteTitle
  const topicMap = {};
  progressData.forEach((item) => {
    if (!topicMap[item.noteTitle]) topicMap[item.noteTitle] = [];
    topicMap[item.noteTitle].push(item);
  });

  const summaryRows = Object.entries(topicMap).map(([topic, attempts]) => {
    const scores = attempts.map((a) => parseFloat(a.percentage));
    const best = Math.max(...scores);
    const last = scores[scores.length - 1];
    const prev = scores.length >= 2 ? scores[scores.length - 2] : null;
    const trend = prev !== null ? (last > prev ? '↑' : last < prev ? '↓' : '→') : '—';
    return { topic, attempts: attempts.length, best, last, trend };
  });

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-surface-100">Your Progress</h1>
        <p className="text-surface-400 mt-2">Track your performance across all topics.</p>
      </div>

      {/* Chart */}
      <div className="mb-8 animate-slide-up">
        <ProgressChart progressData={progressData} />
      </div>

      {/* Summary Table */}
      {summaryRows.length > 0 && (
        <div className="glass-card overflow-hidden animate-slide-up">
          <div className="p-6 border-b border-surface-700/50">
            <h3 className="text-lg font-semibold text-surface-100">Topic Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-700/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-surface-400 uppercase tracking-wider">Attempts</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-surface-400 uppercase tracking-wider">Best Score</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-surface-400 uppercase tracking-wider">Last Score</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-surface-400 uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody>
                {summaryRows.map((row, i) => (
                  <tr key={i} className="border-b border-surface-700/30 hover:bg-surface-700/20 transition-colors">
                    <td className="px-6 py-4 text-surface-200 font-medium">{row.topic}</td>
                    <td className="px-6 py-4 text-center text-surface-300">{row.attempts}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-emerald-400 font-semibold">{row.best.toFixed(0)}%</span>
                    </td>
                    <td className="px-6 py-4 text-center text-surface-300">{row.last.toFixed(0)}%</td>
                    <td className="px-6 py-4 text-center text-xl">
                      <span className={row.trend === '↑' ? 'text-emerald-400' : row.trend === '↓' ? 'text-rose-400' : 'text-surface-400'}>
                        {row.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {progressData.length === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-surface-400 text-lg">No progress data yet. Take some quizzes to see your stats!</p>
        </div>
      )}
    </div>
  );
}
