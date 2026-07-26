import { Bell, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const routeTitles = {
  '/dashboard': ['Overview', 'Today’s priorities and decisions'],
  '/blind-screening': ['Resume screening', 'Review candidate evidence without personal identifiers'],
  '/candidate-comparison': ['Candidate comparison', 'Compare candidates using the same evidence'],
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
  const [title, subtitle] = routeTitles[location.pathname] || ['FairLens', 'HR workspace'];
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
        <span className="navbar-user">{auth.name || 'HR account'}</span>
        <div className="notification-wrap">
          <button className="navbar-icon-button" title="Notifications">
            <Bell size={16} />
            <span />
          </button>
        </div>
        <button onClick={handleLogout} className="navbar-logout" title="Sign out">
          <LogOut size={15} />
          <span>Sign out</span>
        </button>
      </div>
    </header>
  );
}
