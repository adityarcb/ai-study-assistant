import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function ProgressChart({ progressData }) {
  if (!progressData || progressData.length < 2) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-surface-400 mb-2">📊</div>
        <p className="text-surface-400">Take at least 2 quizzes to see your progress graph.</p>
      </div>
    );
  }

  // Group data by noteTitle for multiple lines
  const groupedData = {};
  progressData.forEach((item) => {
    if (!groupedData[item.noteTitle]) {
      groupedData[item.noteTitle] = [];
    }
    groupedData[item.noteTitle].push(item);
  });

  const colors = [
    { border: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
    { border: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    { border: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
    { border: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)' },
    { border: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  ];

  // All unique dates
  const allDates = [...new Set(progressData.map((d) =>
    new Date(d.attemptedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  ))];

  const datasets = Object.keys(groupedData).map((title, index) => {
    const color = colors[index % colors.length];
    return {
      label: title.length > 25 ? title.substring(0, 25) + '...' : title,
      data: groupedData[title].map((d) => d.percentage),
      borderColor: color.border,
      backgroundColor: color.bg,
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: color.border,
      pointBorderColor: '#0f172a',
      pointBorderWidth: 2,
      borderWidth: 2.5,
    };
  });

  const data = { labels: allDates, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: datasets.length > 1,
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 12 },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#e2e8f0',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: { family: 'Inter', weight: '600' },
        bodyFont: { family: 'Inter' },
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.parsed.y}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.3)', drawBorder: false },
        ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(51, 65, 85, 0.3)', drawBorder: false },
        ticks: {
          color: '#64748b',
          font: { family: 'Inter', size: 11 },
          callback: (value) => value + '%',
          stepSize: 20,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-surface-100 mb-6">Score Progress Over Time</h3>
      <div style={{ height: '350px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
