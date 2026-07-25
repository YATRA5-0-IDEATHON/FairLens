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

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-logo">FL</div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="brand-name">FairLens</span>
            <span className="brand-tag">AI</span>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>EquiHire Engine</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Platform</div>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>HR Dashboard</span>
        </NavLink>
        <NavLink to="/blind-screening" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileText size={18} />
          <span>Blind Resume Screening</span>
        </NavLink>
        <NavLink to="/candidate-comparison" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={18} />
          <span>Candidate Comparison</span>
        </NavLink>

        <div className="nav-section-label">Analytics & Parity</div>
        <NavLink to="/gender-analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BarChart3 size={18} />
          <span>Gender Equity</span>
        </NavLink>
        <NavLink to="/pay-equity" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <DollarSign size={18} />
          <span>Pay Equity Audit</span>
        </NavLink>
        <NavLink to="/promotion-analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <TrendingUp size={18} />
          <span>Promotion Analytics</span>
        </NavLink>

        <div className="nav-section-label">Safety & Governance</div>
        <NavLink to="/harassment-dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ShieldAlert size={18} />
          <span>Safety Dashboard</span>
        </NavLink>
        <NavLink to="/compliance-reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileSpreadsheet size={18} />
          <span>Compliance & Audit</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-mini">
          <div className="avatar-circle">HR</div>
          <div className="user-info">
            <div className="user-name">Elena Rostova</div>
            <div className="user-role">Head of People & DEI</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
