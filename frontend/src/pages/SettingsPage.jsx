import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #a78bfa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ⚙️ Settings
        </h1>
        <p style={{ color: '#64748b', marginTop: '0.4rem' }}>Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', padding: '1.75rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e2e8f0', margin: '0 0 1.25rem' }}>Profile</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '1.5rem',
            boxShadow: '0 8px 24px rgba(124,58,237,0.35)',
          }}>
            {user?.name?.substring(0, 2).toUpperCase() || 'SA'}
          </div>
          <div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>{user?.name}</p>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.25rem 0 0' }}>Student ID: {user?.studentId}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.85rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.25rem' }}>Account</p>
            <p style={{ fontSize: '0.9rem', color: '#e2e8f0', margin: 0 }}>Student</p>
          </div>
          <div style={{ padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.85rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.25rem' }}>Member Since</p>
            <p style={{ fontSize: '0.9rem', color: '#e2e8f0', margin: 0 }}>Account active</p>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', padding: '1.75rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e2e8f0', margin: '0 0 1.25rem' }}>Preferences</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <p style={{ fontSize: '0.9rem', color: '#e2e8f0', margin: 0 }}>Appearance</p>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.15rem 0 0' }}>Dark theme is always on</p>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 600 }}>🌙 Dark</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <p style={{ fontSize: '0.9rem', color: '#e2e8f0', margin: 0 }}>Quiz Timer</p>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.15rem 0 0' }}>5 minutes per quiz</p>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 600 }}>05:00</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0' }}>
          <div>
            <p style={{ fontSize: '0.9rem', color: '#e2e8f0', margin: 0 }}>Notifications</p>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.15rem 0 0' }}>Study reminders</p>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 600 }}>On</span>
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ background: 'rgba(244,63,94,0.04)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '1.25rem', padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fda4af', margin: '0 0 0.75rem' }}>Session</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.25rem' }}>Log out of your account on this device.</p>
        <button onClick={handleLogout} className="btn-danger">Logout</button>
      </div>
    </div>
  );
}
