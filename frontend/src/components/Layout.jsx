import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#05060f' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(0,0,0,0.5)', display: 'none',
          }}
          className="sidebar-backdrop"
        />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0 }}>
        <header style={{
          height: '64px', padding: '0 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(5,6,15,0.5)', backdropFilter: 'blur(12px)', zIndex: 10, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mobile-menu-btn"
              style={{
                display: 'none', background: 'none', border: 'none',
                color: '#94a3b8', fontSize: '1.25rem', cursor: 'pointer', padding: '0.25rem',
              }}
              aria-label="Toggle menu"
            >
              ☰
            </button>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0' }} className="logo-mobile">StudyAI</span>
          </div>

          <div style={{ flex: 1, maxWidth: '400px' }} className="header-search">
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', padding: '0.5rem 1rem',
            }}>
              <span style={{ color: '#64748b' }}>🔍</span>
              <input
                type="text" placeholder="Search..."
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#e2e8f0', width: '100%', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={handleLogout}
              title="Logout"
              style={{
                background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50%', padding: '0.35rem',
                color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>

            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 600, fontSize: '0.8rem',
            }}>
              {user?.name?.substring(0, 2).toUpperCase() || 'SA'}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
