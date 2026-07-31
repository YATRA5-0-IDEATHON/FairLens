import { NavLink } from 'react-router-dom';
import {
  BarChart3, CircleDollarSign, FileSpreadsheet, FileText, LayoutDashboard,
  Scale, ShieldAlert, ShieldCheck, TrendingUp, Users, Workflow,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const sections = [
  { label: 'Overview', links: [
    ['Dashboard', '/dashboard', LayoutDashboard],
    ['Hiring lifecycle', '/talent-lifecycle', Workflow],
  ] },
  { label: 'Hiring', links: [
    ['Blind screening', '/blind-screening', FileText],
    ['Compare candidates', '/candidate-comparison', Scale],
  ] },
  { label: 'People & equity', links: [
    ['Employees', '/workspace/employees', Users],
    ['Gender equity', '/gender-analytics', BarChart3],
    ['Pay equity', '/pay-equity', CircleDollarSign],
    ['Promotions', '/promotion-analytics', TrendingUp],
  ] },
  { label: 'Safety & governance', links: [
    ['Workplace reports', '/harassment-dashboard', ShieldAlert],
    ['Compliance', '/compliance-reports', FileSpreadsheet],
    ['Audit trail', '/workspace/audit-logs', ShieldCheck],
  ] },
];

export default function Sidebar() {
  const { auth } = useAuth();
  return (
    <aside className="sidebar enterprise-sidebar">
      <div className="sidebar-header"><img src="/logo.png" alt="FairLens" className="brand-logo" /><div><span className="brand-name">FairLens</span><p className="brand-context">People workspace</p></div></div>
      <nav className="sidebar-nav simple-navigation">
        {sections.map(section => <section key={section.label}><div className="nav-section-label">{section.label}</div>{section.links.map(([label, path, Icon]) => <NavLink key={path} to={path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Icon size={17} /><span>{label}</span></NavLink>)}</section>)}
      </nav>
      <div className="sidebar-footer"><div className="user-profile-mini"><div className="avatar-circle">{(auth.name || 'HR').split(' ').map(part => part[0]).join('').slice(0, 2)}</div><div className="user-info"><div className="user-name">{auth.name || 'HR account'}</div><div className="user-role">HR administrator</div></div></div></div>
    </aside>
  );
}
