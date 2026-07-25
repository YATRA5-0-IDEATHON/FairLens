import { Search, Bell, Shield, HelpCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TopNavbar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };
  return (
    <header className="top-navbar">
      <div className="navbar-search">
        <Search size={16} color="var(--text-muted)" />
        <input type="text" placeholder="Search candidate IDs, departments, or audit logs..." />
      </div>

      <div className="navbar-actions">
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{auth.name || 'HR account'}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', background: 'var(--secondary-teal-light)', color: 'var(--secondary-teal)', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-pill)', fontWeight: 600 }}>
          <Shield size={14} />
          <span>AI Audit Mode Active</span>
        </div>

        <button className="btn btn-outline btn-sm" style={{ padding: '0.4rem 0.6rem' }} title="Help & Guidelines">
          <HelpCircle size={16} />
        </button>

        <div style={{ position: 'relative' }}>
          <button className="btn btn-outline btn-sm" style={{ padding: '0.4rem 0.6rem' }} title="Notifications">
            <Bell size={16} />
            <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: 'var(--accent-coral)', borderRadius: '50%' }}></span>
          </button>
        </div>

        <button onClick={handleLogout} className="btn btn-outline btn-sm" style={{ padding: '0.4rem 0.7rem' }} title="Sign out">
          <LogOut size={15} />
          <span>Logout</span>
        </button>

      </div>
    </header>
  );
}
