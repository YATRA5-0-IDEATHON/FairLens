import { Search, Bell, Shield, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TopNavbar() {
  return (
    <header className="top-navbar">
      <div className="navbar-search">
        <Search size={16} color="var(--text-muted)" />
        <input type="text" placeholder="Search candidate IDs, departments, or audit logs..." />
      </div>

      <div className="navbar-actions">
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

        <Link to="/employee-portal" className="btn btn-coral btn-sm">
          <LockIcon />
          <span>Anonymous Portal</span>
        </Link>
      </div>
    </header>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );
}
