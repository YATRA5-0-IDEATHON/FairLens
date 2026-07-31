import { Bell, LogOut, Moon, Search, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const routeTitles = {
  '/dashboard': ['Overview', 'Today’s priorities and decisions'],
  '/blind-screening': ['Resume screening', 'Review candidate evidence without personal identifiers'],
  '/candidate-comparison': ['Candidate comparison', 'Compare candidates using the same evidence'],
  '/talent-lifecycle': ['Talent lifecycle', 'Connect jobs, candidates, interviews, offers, and onboarding'],
  '/gender-analytics': ['Gender equity', 'Understand representation across departments'],
  '/pay-equity': ['Pay equity', 'Find compensation differences that need review'],
  '/promotion-analytics': ['Promotion fairness', 'Check whether advancement is equitable'],
  '/harassment-dashboard': ['Workplace safety', 'Review and respond to employee concerns'],
  '/compliance-reports': ['Compliance', 'Track the fairness checks that require action'],
};

export default function TopNavbar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const workspaceName = location.pathname.startsWith('/workspace/')
    ? location.pathname.split('/').pop().replaceAll('-', ' ').replace(/\b\w/g, letter => letter.toUpperCase())
    : null;
  const [title, subtitle] = routeTitles[location.pathname]
    || (workspaceName ? [workspaceName, 'FairLens enterprise workspace'] : ['FairLens', 'HR workspace']);
  const [theme, setTheme] = useState(() => localStorage.getItem('fairlens_theme') || 'light');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('fairlens_theme', theme);
  }, [theme]);
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };
  return (
    <header className="top-navbar">
      <div className="navbar-page">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>

      <div className="navbar-actions">
        <label className="command-search">
          <Search size={15} />
          <span className="sr-only">Search FairLens</span>
          <input placeholder="Search FairLens…" />
          <kbd>⌘ K</kbd>
        </label>
        <span className="navbar-user">{auth.name || 'HR account'}</span>
        <div className="notification-wrap">
          <button className="navbar-icon-button" title="Notifications">
            <Bell size={16} />
            <span />
          </button>
        </div>
        <button className="navbar-icon-button theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title={`Use ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button onClick={handleLogout} className="navbar-logout" title="Sign out">
          <LogOut size={15} />
          <span>Sign out</span>
        </button>
      </div>
    </header>
  );
}
