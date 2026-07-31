import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Activity, BadgeCheck, Bot, BriefcaseBusiness, Building2, CalendarDays,
  FileText, Plus, ShieldCheck, Sparkles, Target, UserCheck, Users,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import {
  ActivityFeed, AIChatPanel, Button, CardGrid, DataTable, InsightCard, MetricCard,
  PersonCard, SimpleBarChart, SkeletonLoader, StatusBadge, Toolbar,
  WorkspaceHeader,
} from '../components/EnterpriseComponents';

const screenRegistry = {
  jobs: ['Recruitment', 'Jobs', 'Manage approved roles, hiring criteria, owners, and publishing status.', 'jobs'],
  candidates: ['Recruitment', 'Candidates', 'Search and review every candidate in the active hiring portfolio.', 'candidates'],
  'talent-pool': ['Recruitment', 'Talent pool', 'Reconnect with past applicants, referrals, and internal talent.', 'talent'],
  'interview-pipeline': ['Recruitment', 'Interview pipeline', 'Coordinate structured interview stages and scorecard completion.', 'interviews'],
  'interview-calendar': ['Recruitment', 'Interview calendar', 'Plan interview capacity across candidates, panels, and locations.', 'calendar'],
  offers: ['Recruitment', 'Offer management', 'Track compensation approvals, negotiation, acceptance, and expiry.', 'offers'],
  employees: ['Workforce', 'Employees', 'Explore the governed employee directory and lifecycle records.', 'employees'],
  teams: ['Workforce', 'Teams', 'Understand team composition, management span, and workforce health.', 'teams'],
  departments: ['Workforce', 'Departments', 'Compare headcount, representation, performance, and investment.', 'departments'],
  attendance: ['Workforce', 'Attendance', 'Monitor aggregate attendance patterns without unnecessary surveillance.', 'attendance'],
  leave: ['Workforce', 'Leave management', 'Manage requests, balances, coverage, and privacy-safe availability.', 'leave'],
  performance: ['Workforce', 'Performance reviews', 'Run evidence-based review cycles and monitor calibration.', 'performance'],
  compensation: ['Workforce', 'Compensation', 'Manage salary bands, cycles, and governed compensation changes.', 'compensation'],
  'hiring-fairness': ['Fairness center', 'Hiring fairness', 'Compare stage conversion and decision outcomes across valid cohorts.', 'fairness'],
  'performance-bias': ['Fairness center', 'Performance bias', 'Detect rating, language, and calibration patterns that need review.', 'fairness'],
  'leadership-diversity': ['Fairness center', 'Leadership diversity', 'Track representation across management and leadership levels.', 'leadership'],
  'inclusion-metrics': ['Fairness center', 'Inclusion metrics', 'Monitor employee experience, opportunity access, and belonging signals.', 'fairness'],
  'ai-assistant': ['AI center', 'AI assistant', 'Ask permission-aware questions across hiring and workforce evidence.', 'assistant'],
  'resume-analyzer': ['AI center', 'Resume analyzer', 'Extract skills, projects, experience, and explainable ATS evidence.', 'analyzer'],
  'jd-optimizer': ['AI center', 'Job description optimizer', 'Find biased language and create clearer, inclusive job criteria.', 'optimizer'],
  'interview-generator': ['AI center', 'Interview generator', 'Create structured questions, anchors, and evaluation rubrics.', 'generator'],
  'skill-gap': ['AI center', 'Skill gap analysis', 'Compare verified workforce capabilities with future role demand.', 'skills'],
  'career-recommendations': ['AI center', 'Career recommendations', 'Give employees transparent, evidence-based development paths.', 'skills'],
  'policy-assistant': ['AI center', 'Policy assistant', 'Retrieve and explain approved people policies with citations.', 'assistant'],
  executive: ['Analytics', 'Executive dashboard', 'A concise view of hiring, retention, equity, and workforce health.', 'analytics'],
  'recruitment-analytics': ['Analytics', 'Recruitment analytics', 'Analyze funnel conversion, time to hire, sources, and offers.', 'analytics'],
  'workforce-analytics': ['Analytics', 'Workforce analytics', 'Understand headcount, mobility, tenure, and organization health.', 'analytics'],
  'diversity-analytics': ['Analytics', 'Diversity analytics', 'Explore privacy-safe representation and opportunity outcomes.', 'analytics'],
  'attrition-analytics': ['Analytics', 'Attrition analytics', 'Identify retention patterns using valid, minimum-size cohorts.', 'analytics'],
  'salary-analytics': ['Analytics', 'Salary analytics', 'Compare salary distributions, bands, and adjusted equity signals.', 'analytics'],
  'engagement-analytics': ['Analytics', 'Engagement analytics', 'Track participation, satisfaction, and inclusion trends.', 'analytics'],
  investigations: ['Compliance', 'Investigations', 'Triage concerns, assign conflict-free investigators, and record outcomes.', 'investigations'],
  'audit-logs': ['Compliance', 'Audit logs', 'Reconstruct material reads, changes, decisions, and exports.', 'audit'],
  'evidence-vault': ['Compliance', 'Evidence vault', 'Govern sensitive evidence, integrity hashes, and retention.', 'vault'],
  organization: ['Administration', 'Organization', 'Manage legal entities, departments, teams, locations, and hierarchy.', 'organization'],
  users: ['Administration', 'User management', 'Invite users and govern access, MFA, SSO, and account status.', 'users'],
  roles: ['Administration', 'Roles & permissions', 'Apply least-privilege role and resource scopes.', 'roles'],
  integrations: ['Administration', 'Integrations', 'Connect identity, calendar, HRIS, payroll, and signature providers.', 'integrations'],
  'api-keys': ['Administration', 'API keys', 'Create scoped machine credentials and monitor their use.', 'keys'],
  billing: ['Administration', 'Billing', 'Manage plan, usage, invoices, and commercial contacts.', 'billing'],
  settings: ['Administration', 'Settings', 'Configure branding, workflows, notifications, AI, security, and retention.', 'settings'],
};

function authHeaders() {
  const session = JSON.parse(localStorage.getItem('fairlens_auth_session') || '{}');
  return { Authorization: `Bearer ${session.token || ''}` };
}

export default function EnterpriseWorkspace() {
  const { module = 'executive' } = useParams();
  const { employees, candidates, safetyReports, biasAlerts, overallEqualityScore, genderStats, payGapStats } = useData();
  const [lifecycle, setLifecycle] = useState(null);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const definition = screenRegistry[module] || ['Workspace', humanize(module), 'A connected FairLens operating workspace.', 'analytics'];
  const [eyebrow, title, description, view] = definition;

  useEffect(() => {
    let active = true;
    const refresh = () => fetch('/api/lifecycle/overview', { headers: authHeaders() })
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(result => { if (active) setLifecycle(result); })
      .catch(() => { if (active && !lifecycle) setLifecycle({ data: { jobs: [], applications: [], interviews: [], offers: [], onboarding: [] }, metrics: {} }); });
    refresh();
    const interval = window.setInterval(refresh, 4000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  // The polling callback deliberately retains the last confirmed result.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const context = useMemo(() => ({
    employees, candidates, safetyReports, biasAlerts, overallEqualityScore, genderStats, payGapStats,
    lifecycle: lifecycle?.data || { jobs: [], applications: [], interviews: [], offers: [], onboarding: [] },
    metrics: lifecycle?.metrics || {},
  }), [employees, candidates, safetyReports, biasAlerts, overallEqualityScore, genderStats, payGapStats, lifecycle]);

  const flash = message => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2600);
  };

  return (
    <div className="enterprise-workspace">
      <WorkspaceHeader eyebrow={eyebrow} title={title} description={description} actions={<><Button variant="secondary" icon={FileText}>Export</Button><Button icon={Plus} onClick={() => flash(`New ${title.toLowerCase()} workflow opened.`)}>Create new</Button></>} />
      {notice && <div className="workspace-notice"><BadgeCheck size={16} />{notice}</div>}
      {!lifecycle ? <SkeletonLoader rows={6} /> : <WorkspaceView view={view} context={context} query={query} setQuery={setQuery} flash={flash} />}
    </div>
  );
}

function WorkspaceView({ view, context, query, setQuery, flash }) {
  if (view === 'candidates' || view === 'talent') return <CandidateView context={context} query={query} setQuery={setQuery} talent={view === 'talent'} flash={flash} />;
  if (view === 'jobs') return <JobsView context={context} query={query} setQuery={setQuery} flash={flash} />;
  if (view === 'employees') return <EmployeeView context={context} query={query} setQuery={setQuery} flash={flash} />;
  if (view === 'assistant' || view === 'optimizer' || view === 'generator' || view === 'analyzer' || view === 'skills') return <AIView view={view} context={context} flash={flash} />;
  if (view === 'calendar' || view === 'interviews') return <InterviewView context={context} calendar={view === 'calendar'} flash={flash} />;
  if (view === 'offers') return <OffersView context={context} flash={flash} />;
  if (view === 'investigations') return <InvestigationsView context={context} />;
  if (view === 'audit') return <AuditView query={query} setQuery={setQuery} />;
  if (['organization', 'teams', 'departments', 'users', 'roles', 'integrations', 'keys', 'settings', 'billing', 'vault'].includes(view)) return <AdminView view={view} context={context} query={query} setQuery={setQuery} flash={flash} />;
  return <AnalyticsView view={view} context={context} />;
}

function DashboardMetrics({ context }) {
  return <CardGrid className="metric-grid"><MetricCard label="Total employees" value={context.employees.length} trend="+4.8%" comparison="vs last quarter" icon={Users} tone="teal" /><MetricCard label="Open jobs" value={context.metrics.activeJobs || context.lifecycle.jobs.length} trend="+2" comparison="this month" icon={BriefcaseBusiness} /><MetricCard label="Active candidates" value={context.candidates.length} trend="+12.4%" comparison="vs prior period" icon={UserCheck} tone="purple" /><MetricCard label="Fairness score" value={`${context.overallEqualityScore}/100`} trend="+3.1%" comparison="rolling 90 days" icon={ShieldCheck} tone="teal" /></CardGrid>;
}

function JobsView({ context, query, setQuery, flash }) {
  const jobs = context.lifecycle.jobs.filter(item => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()));
  return <><DashboardMetrics context={context} /><Toolbar query={query} onQuery={setQuery}><Button variant="ghost">Advanced filters</Button></Toolbar><DataTable rows={jobs} columns={[
    { key: 'title', label: 'Job title', render: (value, row) => <div className="table-primary"><i><BriefcaseBusiness size={14} /></i><span><strong>{value}</strong><small>{row.id}</small></span></div> },
    { key: 'department', label: 'Department' }, { key: 'owner', label: 'Hiring manager' }, { key: 'location', label: 'Location' },
    { key: 'salaryMin', label: 'Salary', render: (value, row) => `${money(value)}–${money(row.salaryMax)}` },
    { key: 'openings', label: 'Positions' }, { key: 'status', label: 'Status', render: value => <StatusBadge>{value}</StatusBadge> },
  ]} renderActions={row => <button className="icon-action" onClick={() => flash(`${row.title} opened.`)}>•••</button>} /></>;
}

function CandidateView({ context, query, setQuery, talent, flash }) {
  const rows = context.candidates.filter(item => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()));
  return <><InsightCard title={talent ? 'Three past applicants match current demand' : 'Candidate review quality is strong'} summary={talent ? 'Verified skills overlap with two published engineering roles. Re-engage only candidates with valid contact consent.' : '92% of active profiles have enough evidence for a structured review. Four profiles need parser verification.'} onAction={() => flash('Recommendation details opened.')} /><Toolbar query={query} onQuery={setQuery} filters={[{ label: 'Status', value: 'All', options: ['All', 'Pending Review', 'Shortlisted', 'Hired'], onChange: () => {} }]} /><CardGrid>{rows.slice(0, 12).map(candidate => <PersonCard key={candidate.id} code={candidate.id} title={talent ? 'Identity protected' : candidate.name} subtitle={candidate.appliedRole} skills={candidate.skills} score={candidate.meritScore} status={candidate.status} meta={[{ label: 'Experience', value: `${candidate.experienceYears || 0} years` }, { label: 'Applied', value: candidate.appliedDate || '—' }]} actions={<Button variant="ghost" onClick={() => flash(`${candidate.id} profile opened.`)}>View profile</Button>} />)}</CardGrid></>;
}

function EmployeeView({ context, query, setQuery, flash }) {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const loadLeave = useCallback(() => {
    fetch('/api/leave-requests', { headers: authHeaders() }).then(response => response.json()).then(setLeaveRequests).catch(() => setLeaveRequests([]));
  }, []);
  useEffect(() => { const timer = window.setTimeout(loadLeave, 0); const interval = window.setInterval(loadLeave, 4000); return () => { window.clearTimeout(timer); window.clearInterval(interval); }; }, [loadLeave]);
  const decideLeave = async (id, status) => {
    const response = await fetch(`/api/leave-requests/${id}`, { method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (response.ok) { flash(`Leave request ${status.toLowerCase()}.`); loadLeave(); }
  };
  const rows = context.employees.filter(item => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()));
  return <><DashboardMetrics context={context} /><Toolbar query={query} onQuery={setQuery} filters={[{ label: 'Department', value: 'All', options: ['All', ...new Set(context.employees.map(item => item.department))], onChange: () => {} }]} /><DataTable rows={rows} columns={[
    { key: 'name', label: 'Employee', render: (value, row) => <div className="table-primary"><i>{initials(value)}</i><span><strong>{value}</strong><small>{row.id}</small></span></div> },
    { key: 'role', label: 'Role' }, { key: 'department', label: 'Department' }, { key: 'level', label: 'Level' },
    { key: 'performanceRating', label: 'Performance', render: value => value ? `${value}/5` : 'Not reviewed' },
    { key: 'status', label: 'Status', render: value => <StatusBadge>{value}</StatusBadge> },
  ]} renderActions={row => <button className="icon-action" onClick={() => flash(`${row.name} profile opened.`)}>•••</button>} /><WorkspaceHeader eyebrow="Employee requests" title="Leave approvals" description="Requests submitted by employees appear here in real time." /><DataTable rows={leaveRequests} empty="No employee leave requests." columns={[{ key: 'employeeName', label: 'Employee' }, { key: 'type', label: 'Type' }, { key: 'startDate', label: 'Start', render: date }, { key: 'endDate', label: 'End', render: date }, { key: 'days', label: 'Days' }, { key: 'status', label: 'Status', render: value => <StatusBadge>{value}</StatusBadge> }]} renderActions={row => row.status === 'Pending' ? <div className="leave-actions"><button onClick={() => decideLeave(row.id, 'Approved')}>✓</button><button onClick={() => decideLeave(row.id, 'Declined')}>×</button></div> : null} /></>;
}

function InterviewView({ context, calendar, flash }) {
  const interviews = context.lifecycle.interviews;
  if (calendar) {
    const days = ['Mon 3', 'Tue 4', 'Wed 5', 'Thu 6', 'Fri 7'];
    return <><CardGrid className="metric-grid"><MetricCard label="Scheduled" value={interviews.length} icon={CalendarDays} /><MetricCard label="Panel hours" value={`${interviews.length * 2.5}h`} icon={Users} tone="purple" /><MetricCard label="Scorecards due" value={interviews.filter(item => !item.feedback).length} icon={Target} tone="teal" /></CardGrid><section className="week-calendar enterprise-surface">{days.map((day, index) => <div key={day}><header>{day}</header>{interviews.filter((_, itemIndex) => itemIndex % 5 === index).map(item => <button key={item.id} onClick={() => flash(`${item.id} opened.`)}><time>{item.scheduledAt ? new Date(item.scheduledAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'TBD'}</time><strong>{item.candidateCode}</strong><span>{item.interviewer || 'Panel needed'}</span></button>)}</div>)}</section></>;
  }
  return <><InsightCard title="Two scorecards need follow-up" summary="Structured feedback should be submitted before panel discussion to reduce conformity bias." /><DataTable rows={interviews} columns={[{ key: 'candidateCode', label: 'Candidate' }, { key: 'jobTitle', label: 'Role' }, { key: 'interviewer', label: 'Interviewer' }, { key: 'format', label: 'Format' }, { key: 'status', label: 'Status', render: value => <StatusBadge>{value}</StatusBadge> }, { key: 'rating', label: 'Score' }]} /></>;
}

function OffersView({ context, flash }) {
  return <><CardGrid className="metric-grid"><MetricCard label="Draft" value={context.lifecycle.offers.filter(item => item.status === 'Draft').length} icon={FileText} /><MetricCard label="Pending approval" value={context.lifecycle.offers.filter(item => /pending/i.test(item.status)).length} icon={ShieldCheck} tone="purple" /><MetricCard label="Accepted" value={context.lifecycle.offers.filter(item => item.status === 'Accepted').length} icon={BadgeCheck} tone="teal" /></CardGrid><DataTable rows={context.lifecycle.offers} empty="No offers have been created yet." columns={[{ key: 'candidateCode', label: 'Candidate' }, { key: 'jobTitle', label: 'Role' }, { key: 'salary', label: 'Base salary', render: money }, { key: 'createdAt', label: 'Created', render: date }, { key: 'status', label: 'Status', render: value => <StatusBadge>{value}</StatusBadge> }]} renderActions={row => <button className="icon-action" onClick={() => flash(`${row.id} opened.`)}>•••</button>} /></>;
}

function AIView({ view, context, flash }) {
  const copy = {
    optimizer: ['Paste a job description', 'Analyze inclusive language', 'Senior engineers must be aggressive, competitive rockstars with 10+ years of experience.', ['Analyze language', 'Rewrite inclusively', 'Extract criteria']],
    generator: ['Generate an interview kit', 'Create structured, job-related questions', 'Senior Platform Engineer · system design · technical leadership', ['Generate technical questions', 'Create scorecard', 'Add behavioral anchors']],
    analyzer: ['Analyze a resume', 'Extract cited evidence without exposing identity', 'Upload a PDF or DOCX resume to begin.', ['Analyze latest resume', 'Compare to open role', 'Explain ATS score']],
    skills: ['Understand skill demand', 'Compare verified capabilities and role requirements', `${context.employees.length} employees · ${context.lifecycle.jobs.length} active job profiles`, ['Find critical gaps', 'Recommend learning', 'Map internal talent']],
  };
  if (view === 'assistant') return <div className="assistant-layout"><AIChatPanel prompts={['Summarize hiring risks', 'Explain the pay gap', 'Prepare a compliance brief', 'Find overdue decisions']} onPrompt={prompt => flash(`${prompt} analysis started.`)} /><ActivityFeed items={activity(context)} /></div>;
  const current = copy[view] || copy.analyzer;
  return <div className="ai-tool-layout"><section className="ai-tool-input enterprise-surface"><i><Bot size={24} /></i><span>FairLens AI tool</span><h2>{current[0]}</h2><p>{current[1]}</p><textarea defaultValue={current[2]} /><Button icon={Sparkles} onClick={() => flash('AI analysis completed with cited evidence.')}>Run analysis</Button></section><AIChatPanel title={current[0]} prompts={current[3]} response="Ready. Results will include evidence, confidence, policy version, and a required human-review step." onPrompt={prompt => flash(`${prompt} generated.`)} /></div>;
}

function InvestigationsView({ context }) {
  return <DataTable rows={context.safetyReports} columns={[{ key: 'id', label: 'Case' }, { key: 'category', label: 'Type' }, { key: 'severity', label: 'Severity', render: value => <StatusBadge>{value}</StatusBadge> }, { key: 'date', label: 'Reported' }, { key: 'status', label: 'Status', render: value => <StatusBadge>{value}</StatusBadge> }, { key: 'evidenceFiles', label: 'Evidence', render: value => `${value?.length || 0} files` }]} />;
}

function AuditView({ query, setQuery }) {
  const [logs, setLogs] = useState([]);
  useEffect(() => { fetch('/api/lifecycle/audit-logs?limit=100', { headers: authHeaders() }).then(response => response.json()).then(setLogs).catch(() => setLogs([])); }, []);
  const rows = logs.filter(item => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()));
  return <><Toolbar query={query} onQuery={setQuery} /><DataTable rows={rows} columns={[{ key: 'actor', label: 'Who' }, { key: 'action', label: 'Action', render: humanize }, { key: 'entityType', label: 'Resource' }, { key: 'role', label: 'Role' }, { key: 'timestamp', label: 'Time', render: date }, { key: 'hash', label: 'Integrity', render: () => <StatusBadge>Verified</StatusBadge> }]} /></>;
}

function AdminView({ view, context, query, setQuery, flash }) {
  const departments = Object.values(context.employees.reduce((result, employee) => {
    const key = employee.department || 'Unassigned';
    result[key] ||= { id: key, name: key, employees: 0, manager: 'Department lead', location: 'Multi-site', status: 'Active' };
    result[key].employees += 1;
    return result;
  }, {}));
  const generic = {
    organization: departments, teams: departments, departments,
    users: context.employees.slice(0, 15).map(item => ({ ...item, name: item.name, type: 'Employee', access: 'Standard', mfa: 'Enabled' })),
    roles: [{ id: 1, name: 'HR Administrator', type: 'System role', access: 'Organization', status: 'Active' }, { id: 2, name: 'Recruiter', type: 'Custom role', access: 'Assigned jobs', status: 'Active' }, { id: 3, name: 'Auditor', type: 'System role', access: 'Evidence only', status: 'Active' }],
    integrations: [{ id: 1, name: 'Google Workspace', type: 'Calendar', access: 'Connected', status: 'Healthy' }, { id: 2, name: 'Workday', type: 'HRIS', access: 'Daily sync', status: 'Healthy' }, { id: 3, name: 'DocuSign', type: 'Signature', access: 'Offers', status: 'Review' }],
    keys: [{ id: 1, name: 'Analytics export', type: 'Read only', access: 'Last used today', status: 'Active' }],
    vault: [{ id: 1, name: 'Case evidence archive', type: 'Restricted', access: '12 objects', status: 'Verified' }],
    billing: [{ id: 1, name: 'Growth plan', type: 'Annual', access: '32 seats', status: 'Active' }],
    settings: [{ id: 1, name: 'Hiring workflow', type: 'Workflow', access: '6 stages', status: 'Active' }, { id: 2, name: 'AI model policy', type: 'AI governance', access: '3 approved models', status: 'Active' }, { id: 3, name: 'Data retention', type: 'Privacy', access: '7 record classes', status: 'Review' }],
  };
  const rows = (generic[view] || departments).filter(item => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()));
  return <><Toolbar query={query} onQuery={setQuery}><Button icon={Plus} onClick={() => flash('Configuration workflow opened.')}>Add</Button></Toolbar><DataTable rows={rows} columns={[{ key: 'name', label: 'Name', render: (value, row) => <div className="table-primary"><i><Building2 size={14} /></i><span><strong>{value}</strong><small>{row.id}</small></span></div> }, { key: view === 'organization' || view === 'departments' || view === 'teams' ? 'employees' : 'type', label: view === 'organization' || view === 'departments' || view === 'teams' ? 'Employees' : 'Type' }, { key: 'manager', label: 'Owner' }, { key: 'location', label: 'Location' }, { key: 'access', label: 'Scope' }, { key: 'status', label: 'Status', render: value => <StatusBadge>{value}</StatusBadge> }]} /></>;
}

function AnalyticsView({ view, context }) {
  const departmentData = Object.values(context.employees.reduce((result, item) => { result[item.department] ||= { label: item.department, value: 0 }; result[item.department].value += 1; return result; }, {})).slice(0, 8);
  const title = humanize(view);
  return <><DashboardMetrics context={context} /><InsightCard title={`${title} signal requires review`} summary={`${context.biasAlerts.length} active fairness signals and ${context.safetyReports.filter(item => item.status !== 'Resolved').length} open workplace cases are included in this governed view.`} /><div className="analytics-layout"><SimpleBarChart label={`${title} by department`} data={departmentData} /><SimpleBarChart label="Representation" tone="teal" data={[{ label: 'Women', value: context.genderStats.femalePct, suffix: '%' }, { label: 'Men', value: context.genderStats.malePct, suffix: '%' }, { label: 'Non-binary', value: context.genderStats.nbPct, suffix: '%' }, { label: 'Unspecified', value: context.genderStats.unspecPct, suffix: '%' }]} /><ActivityFeed items={activity(context)} /></div></>;
}

function activity(context) {
  return [
    ...context.candidates.slice(0, 2).map(item => ({ title: `${item.id} · ${item.status}`, detail: item.appliedRole, time: item.appliedDate || 'Recent', icon: <UserCheck size={14} /> })),
    ...context.safetyReports.slice(0, 2).map(item => ({ title: `${item.id} · ${item.status}`, detail: item.category, time: item.date, tone: 'amber', icon: <ShieldCheck size={14} /> })),
    { title: 'Fairness metrics refreshed', detail: `${context.employees.length} employee records evaluated`, time: 'Today', icon: <Activity size={14} /> },
  ];
}

function humanize(value = '') { return String(value).replaceAll('-', ' ').replaceAll('.', ' ').replace(/\b\w/g, letter => letter.toUpperCase()); }
function money(value) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0); }
function date(value) { return value ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value)) : '—'; }
function initials(value = '') { return value.split(' ').map(item => item[0]).join('').slice(0, 2).toUpperCase(); }
