import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  ShieldAlert, 
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { auth } = useAuth();
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-logo">FL</div>
        <div>
          <span className="brand-name">FairLens</span>
          <p className="brand-context">HR workspace</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Hiring</div>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Overview</span>
        </NavLink>
        <NavLink to="/blind-screening" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileText size={18} />
          <span>Resume screening</span>
        </NavLink>
        <NavLink to="/candidate-comparison" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={18} />
          <span>Candidate comparison</span>
        </NavLink>

        <div className="nav-section-label">Workplace equity</div>
        <NavLink to="/gender-analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BarChart3 size={18} />
          <span>Gender Equity</span>
        </NavLink>
        <NavLink to="/pay-equity" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <DollarSign size={18} />
          <span>Pay equity</span>
        </NavLink>
        <NavLink to="/promotion-analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <TrendingUp size={18} />
          <span>Promotions</span>
        </NavLink>

        <div className="nav-section-label">Governance</div>
        <NavLink to="/harassment-dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ShieldAlert size={18} />
          <span>Workplace safety</span>
        </NavLink>
        <NavLink to="/compliance-reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileSpreadsheet size={18} />
          <span>Compliance</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-mini">
          <div className="avatar-circle">HR</div>
          <div className="user-info">
            <div className="user-name">{auth.name || 'HR account'}</div>
            <div className="user-role">Administrator</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
