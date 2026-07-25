import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, BriefcaseBusiness, Filter, Search, ShieldCheck, SlidersHorizontal, Users } from 'lucide-react';
import { useData } from '../context/DataContext';

const API_BASE = 'http://localhost:5000/api';

export default function PeopleOperations() {
  const { employees, candidates, updateCandidateStatus } = useData();
  const [tab, setTab] = useState('people');
  const [query, setQuery] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetch(`${API_BASE}/audit-logs?limit=100`).then(response => response.json()).then(setAuditLogs).catch(() => setAuditLogs([]));
  }, []);

  const filteredEmployees = useMemo(() => employees.filter(employee =>
    `${employee.name} ${employee.department} ${employee.role || employee.position}`.toLowerCase().includes(query.toLowerCase())
  ), [employees, query]);
  const filteredCandidates = useMemo(() => candidates.filter(candidate =>
    (statusFilter === 'All' || candidate.status === statusFilter)
    && `${candidate.id} ${candidate.appliedRole} ${candidate.status}`.toLowerCase().includes(query.toLowerCase())
  ), [candidates, query, statusFilter]);
  const jobs = useMemo(() => Object.values(candidates.reduce((result, candidate) => {
    const role = candidate.appliedRole || 'Unassigned role';
    result[role] ||= { role, applications: 0, shortlisted: 0, hired: 0 };
    result[role].applications += 1;
    if (candidate.status === 'Shortlisted') result[role].shortlisted += 1;
    if (candidate.status === 'Hired') result[role].hired += 1;
    return result;
  }, {})), [candidates]);

  return (
    <div className="operations-page">
      <header className="operations-header"><div><span>People operations</span><h1>Workforce control center</h1><p>Manage connected employee, recruiting, and governance workflows.</p></div><button><SlidersHorizontal size={16} /> Customize view</button></header>
      <nav className="operations-tabs">
        {[['people', Users, 'Employees'], ['pipeline', Filter, 'Hiring pipeline'], ['jobs', BriefcaseBusiness, 'Job demand'], ['audit', ShieldCheck, 'Audit log']].map(([id, Icon, label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}><Icon size={15} />{label}</button>)}
      </nav>
      <div className="operations-toolbar"><label><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search this view…" /></label>{tab === 'pipeline' && <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option>All</option><option>Pending Review</option><option>Shortlisted</option><option>Hired</option><option>Declined</option></select>}<span>{tab === 'people' ? filteredEmployees.length : tab === 'pipeline' ? filteredCandidates.length : tab === 'jobs' ? jobs.length : auditLogs.length} records</span></div>
      <motion.section className="operations-table" key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {tab === 'people' && <><TableHead labels={['Employee', 'Department', 'Role', 'Performance', 'Status']} />{filteredEmployees.map(employee => <div className="operations-row" key={employee.id}><Identity title={employee.name} subtitle={employee.id} /><span>{employee.department || 'Unassigned'}</span><span>{employee.role || employee.position || 'Not specified'}</span><span>{employee.performanceRating ? `${employee.performanceRating}/5` : 'Not reviewed'}</span><Status value={employee.status || 'Active'} /></div>)}</>}
        {tab === 'pipeline' && <><TableHead labels={['Candidate', 'Role', 'Applied', 'Status', 'Decision']} />{filteredCandidates.map(candidate => <div className="operations-row" key={candidate.id}><Identity title={candidate.id} subtitle="Identity protected" /><span>{candidate.appliedRole}</span><span>{candidate.appliedDate || 'Not recorded'}</span><Status value={candidate.status} /><select value={candidate.status} onChange={event => updateCandidateStatus(candidate.id, event.target.value)}><option>Pending Review</option><option>Shortlisted</option><option>Hired</option><option>Declined</option></select></div>)}</>}
        {tab === 'jobs' && <><TableHead labels={['Role', 'Applications', 'Shortlisted', 'Hired', 'Conversion']} />{jobs.map(job => <div className="operations-row" key={job.role}><Identity title={job.role} subtitle="Active candidate demand" /><span>{job.applications}</span><span>{job.shortlisted}</span><span>{job.hired}</span><span>{job.applications ? Math.round(job.hired / job.applications * 100) : 0}%</span></div>)}</>}
        {tab === 'audit' && <><TableHead labels={['Activity', 'Entity', 'Actor', 'Time', 'Details']} />{auditLogs.map(log => <div className="operations-row" key={log.id}><Identity title={log.action} subtitle={log.id} /><span>{log.entityType} · {log.entityId}</span><span>{log.actor}</span><span>{new Date(log.timestamp).toLocaleString()}</span><span className="audit-fields">{log.details?.fields?.join(', ') || log.details?.role || 'Recorded'}</span></div>)}</>}
      </motion.section>
    </div>
  );
}

function TableHead({ labels }) {
  return <div className="operations-table-head">{labels.map(label => <span key={label}>{label}</span>)}</div>;
}
function Identity({ title, subtitle }) {
  return <div className="operation-identity"><i><Activity size={14} /></i><span><strong>{title}</strong><small>{subtitle}</small></span></div>;
}
function Status({ value }) {
  return <span className={`operation-status ${String(value).toLowerCase().replace(/\s+/g, '-')}`}><i />{value}</span>;
}
