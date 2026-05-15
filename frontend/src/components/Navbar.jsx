import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-900/80 backdrop-blur-xl border-b border-surface-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-lg font-bold gradient-text">StudyAI</span>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              <Link to="/dashboard" className="px-4 py-2 text-sm text-surface-300 hover:text-white rounded-lg hover:bg-surface-700/50 transition-all">
                Dashboard
              </Link>
              <Link to="/notes" className="px-4 py-2 text-sm text-surface-300 hover:text-white rounded-lg hover:bg-surface-700/50 transition-all">
                Notes
              </Link>
              <Link to="/progress" className="px-4 py-2 text-sm text-surface-300 hover:text-white rounded-lg hover:bg-surface-700/50 transition-all">
                Progress
              </Link>
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-surface-400 hidden sm:block">
                  Hi, <span className="text-primary-300 font-medium">{user?.name}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-surface-300 hover:text-white bg-surface-700/50 hover:bg-surface-600/50 rounded-xl border border-surface-600/50 transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="px-4 py-2 text-sm text-surface-300 hover:text-white rounded-xl transition-all">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm !py-2 !px-4">
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
