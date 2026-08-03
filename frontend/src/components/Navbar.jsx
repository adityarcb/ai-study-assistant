import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/notes',     label: 'Notes' },
    { to: '/progress',  label: 'Progress' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: 'rgba(5, 6, 15, 0.7)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
      boxShadow: '0 4px 30px rgba(0,0,0,0.3), 0 1px 0 rgba(139,92,246,0.12) inset',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div style={{
              width: '38px', height: '38px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(124,58,237,0.45)',
              transition: 'box-shadow 0.3s ease, transform 0.3s ease',
            }}
              className="group-hover:scale-110"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span style={{
              fontSize: '1.15rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif",
              background: 'linear-gradient(135deg, #a78bfa 0%, #38bdf8 60%, #e879f9 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>StudyAI</span>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => {
                const active = location.pathname === to;
                return (
                  <Link key={to} to={to} style={{
                    padding: '0.45rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 400,
                    borderRadius: '10px',
                    color: active ? '#c4b5fd' : '#94a3b8',
                    background: active ? 'rgba(139,92,246,0.15)' : 'transparent',
                    border: active ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                  }}
                    onMouseEnter={e => { if (!active) { e.target.style.color='#e2e8f0'; e.target.style.background='rgba(255,255,255,0.05)'; }}}
                    onMouseLeave={e => { if (!active) { e.target.style.color='#94a3b8'; e.target.style.background='transparent'; }}}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:block" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Hi,&nbsp;<span style={{ color: '#a78bfa', fontWeight: 600 }}>{user?.name}</span>
                </span>
                <button onClick={handleLogout} style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.85rem', fontWeight: 500,
                  borderRadius: '10px',
                  color: '#94a3b8',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                  onMouseEnter={e => { e.target.style.color='#f1f5f9'; e.target.style.background='rgba(244,63,94,0.12)'; e.target.style.borderColor='rgba(244,63,94,0.3)'; }}
                  onMouseLeave={e => { e.target.style.color='#94a3b8'; e.target.style.background='rgba(255,255,255,0.04)'; e.target.style.borderColor='rgba(255,255,255,0.08)'; }}
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" style={{
                  padding: '0.45rem 1rem', fontSize: '0.85rem', color: '#94a3b8',
                  borderRadius: '10px', textDecoration: 'none', transition: 'color 0.2s',
                }}>Login</Link>
                <Link to="/register" className="btn-primary" style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
