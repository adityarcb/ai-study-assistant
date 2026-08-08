import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
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
    <aside style={{
      width: '260px',
      background: 'rgba(10, 10, 20, 0.6)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
    }}>
      <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '32px', height: '32px',
          background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
        }}>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>S</span>
        </div>
        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0' }}>StudyAI</span>
      </div>

      <nav style={{ flex: 1, padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
        {navLinks.map((link) => {
          const active = location.pathname.startsWith(link.to) && link.to !== '/' || location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                color: active ? '#fff' : '#64748b',
                background: active ? 'linear-gradient(90deg, rgba(124,58,237,0.15) 0%, transparent 100%)' : 'transparent',
                borderLeft: active ? '3px solid #7c3aed' : '3px solid transparent',
                textDecoration: 'none',
                fontWeight: active ? 600 : 500,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.color = '#e2e8f0';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.1rem', opacity: active ? 1 : 0.7 }}>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
