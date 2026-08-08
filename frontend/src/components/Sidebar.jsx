import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ open, onClose }) {
  const location = useLocation();

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/notes', label: 'Upload Notes', icon: '📤' },
    { to: '/history', label: 'Notes History', icon: '🕒' },
    { to: '/quizzes', label: 'Quizzes', icon: '📝' },
    { to: '/flashcards', label: 'Flashcards', icon: '🃏' },
    { to: '/progress', label: 'Progress', icon: '📈' },
    { to: '/achievements', label: 'Achievements', icon: '🏆' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <>
      <aside className="app-sidebar" data-open={open || undefined} style={{
        width: '260px',
        background: 'rgba(10, 10, 20, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        flexShrink: 0,
      }}>
        <div style={{ padding: '1.5rem 1.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px', height: '32px',
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
            }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>S</span>
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0' }}>StudyAI</span>
          </div>
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            style={{
              display: 'none', background: 'none', border: 'none',
              color: '#64748b', fontSize: '1.2rem', cursor: 'pointer',
            }}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav style={{ flex: 1, padding: '0 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.15rem', overflowY: 'auto' }}>
          {navLinks.map((link) => {
            const active = location.pathname === link.to || (link.to !== '/dashboard' && location.pathname.startsWith(link.to));
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.7rem 1rem', borderRadius: '10px',
                  color: active ? '#fff' : '#64748b',
                  background: active ? 'linear-gradient(90deg, rgba(124,58,237,0.2) 0%, transparent 100%)' : 'transparent',
                  borderLeft: active ? '3px solid #7c3aed' : '3px solid transparent',
                  textDecoration: 'none', fontWeight: active ? 600 : 500,
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '1rem', opacity: active ? 1 : 0.7 }}>{link.icon}</span>
                <span style={{ fontSize: '0.875rem' }}>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
