import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#05060f' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* Top Header */}
        <header style={{
          height: '80px',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(5,6,15,0.5)',
          backdropFilter: 'blur(12px)',
          zIndex: 10,
        }}>
          {/* Search Bar (Placeholder) */}
          <div style={{ flex: 1, maxWidth: '400px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '0.6rem 1rem',
            }}>
              <span style={{ color: '#64748b' }}>🔍</span>
              <input 
                type="text" 
                placeholder="Search notes, flashcards, quizzes..." 
                style={{
                  background: 'transparent', border: 'none', outline: 'none', color: '#e2e8f0', width: '100%', fontSize: '0.9rem'
                }}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748b', border: '1px solid rgba(255,255,255,0.1)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>⌘ K</span>
            </div>
          </div>

          {/* User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', color: '#64748b' }}>
              <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>☀️</button>
              <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>🔔</button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1.25rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.85rem', color: '#e2e8f0', margin: 0, fontWeight: 600 }}>Hi, {user?.name}</p>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Keep learning!</p>
              </div>
              <div 
                onClick={handleLogout}
                title="Click to logout"
                style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
                }}
              >
                {user?.name?.substring(0, 2).toUpperCase() || 'AR'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
