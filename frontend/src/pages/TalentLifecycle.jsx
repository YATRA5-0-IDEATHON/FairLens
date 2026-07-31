import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BriefcaseBusiness, CalendarDays, CheckCircle2, ClipboardCheck, FileCheck2,
  LoaderCircle, Plus, RefreshCw, Search, Send, ShieldCheck, UserCheck, Users,
  X,
} from 'lucide-react';

const API = '/api/lifecycle';
const tabs = [
  ['pipeline', Users, 'Pipeline'],
  ['jobs', BriefcaseBusiness, 'Jobs'],
  ['interviews', CalendarDays, 'Interviews'],
  ['offers', FileCheck2, 'Offers'],
  ['onboarding', UserCheck, 'Onboarding'],
  ['audit', ShieldCheck, 'Audit trail'],
];
const stageOrder = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Declined'];
const nextStage = {
  Applied: ['Screening', 'Declined'],
  Screening: ['Interview', 'Declined'],
  Interview: ['Offer', 'Declined'],
  Offer: ['Hired', 'Declined'],
};

function authHeaders() {
  const session = JSON.parse(localStorage.getItem('fairlens_auth_session') || '{}');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token || ''}` };
}

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'The request could not be completed');
  return result;
}

export default function TalentLifecycle() {
  const [overview, setOverview] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [tab, setTab] = useState('pipeline');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [jobDialog, setJobDialog] = useState(false);
  const [decision, setDecision] = useState(null);

  const load = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      const [summary, logs] = await Promise.all([
        request('/overview'),
        request('/audit-logs?limit=100'),
      ]);
      setOverview(summary);
      setAuditLogs(logs);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const data = useMemo(
    () => overview?.data || { jobs: [], applications: [], interviews: [], offers: [], onboarding: [] },
    [overview],
  );
  const matches = useCallback(value => JSON.stringify(value).toLowerCase().includes(query.toLowerCase()), [query]);
  const filtered = useMemo(() => ({
    jobs: data.jobs.filter(matches),
    applications: data.applications.filter(matches),
    interviews: data.interviews.filter(matches),
    offers: data.offers.filter(matches),
    onboarding: data.onboarding.filter(matches),
    audit: auditLogs.filter(matches),
  }), [data, auditLogs, matches]);

  const mutate = async (path, body, success) => {
    setError('');
    try {
      await request(path, { method: 'PATCH', body: JSON.stringify(body) });
      setNotice(success);
      window.setTimeout(() => setNotice(''), 3000);
      await load();
      return true;
    } catch (mutationError) {
      setError(mutationError.message);
      return false;
    }
  };

  if (busy && !overview) {
    return <div className="lifecycle-state"><LoaderCircle className="spin" /><strong>Loading connected lifecycle…</strong></div>;
  }

  return (
    <div className="lifecycle-page">
      <header className="lifecycle-hero">
        <div>
          <span className="lifecycle-eyebrow">Connected talent operations</span>
          <h1>From approved role to ready new hire.</h1>
          <p>Move every candidate through a governed workflow with evidence, reasons, and an immutable audit trail.</p>
        </div>
        <div className="lifecycle-hero-actions">
          <button className="button-secondary" onClick={load}><RefreshCw size={15} /> Refresh</button>
          <button className="button-primary" onClick={() => setJobDialog(true)}><Plus size={16} /> Create job</button>
        </div>
      </header>

      {error && <div className="lifecycle-alert error"><X size={17} /><span>{error}</span><button onClick={() => setError('')}>Dismiss</button></div>}
      {notice && <div className="lifecycle-alert success"><CheckCircle2 size={17} /><span>{notice}</span></div>}

      <section className="lifecycle-metrics" aria-label="Lifecycle overview">
        <Metric icon={BriefcaseBusiness} label="Published jobs" value={overview?.metrics.activeJobs || 0} />
        <Metric icon={Users} label="Open applications" value={overview?.metrics.openApplications || 0} />
        <Metric icon={CalendarDays} label="Upcoming interviews" value={overview?.metrics.upcomingInterviews || 0} />
        <Metric icon={FileCheck2} label="Pending offers" value={overview?.metrics.pendingOffers || 0} />
        <Metric icon={UserCheck} label="Hires" value={overview?.metrics.hires || 0} />
      </section>

      <section className="lifecycle-workspace">
        <div className="lifecycle-tabs" role="tablist">
          {tabs.map(([id, Icon, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
              <Icon size={15} /> {label}
              <span>{id === 'pipeline' ? data.applications.length : id === 'audit' ? auditLogs.length : data[id]?.length || 0}</span>
            </button>
          ))}
        </div>
        <div className="lifecycle-toolbar">
          <label><Search size={16} /><span className="sr-only">Search records</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder={`Search ${tab}…`} /></label>
          <small>All changes require a named user and are recorded.</small>
        </div>

        {tab === 'pipeline' && (
          <div className="pipeline-board">
            {stageOrder.map(stage => (
              <section className="pipeline-column" key={stage}>
                <header><span>{stage}</span><b>{filtered.applications.filter(item => item.stage === stage).length}</b></header>
                <div>
                  {filtered.applications.filter(item => item.stage === stage).map(application => (
                    <article className="candidate-stage-card" key={application.id}>
                      <div className="candidate-stage-title"><span>{application.candidateCode}</span><Score value={application.meritScore} /></div>
                      <h3>{application.jobTitle}</h3>
                      <p>{application.skills.slice(0, 3).join(' · ') || 'Evidence review pending'}</p>
                      <small>Applied {formatDate(application.appliedAt)}</small>
                      {nextStage[application.stage]?.length ? (
                        <button onClick={() => setDecision(application)}>Record decision <Send size={13} /></button>
                      ) : <span className={`terminal ${application.stage.toLowerCase()}`}>{application.stage}</span>}
                    </article>
                  ))}
                  {!filtered.applications.some(item => item.stage === stage) && <div className="pipeline-empty">No candidates</div>}
                </div>
              </section>
            ))}
          </div>
        )}

        {tab === 'jobs' && (
          <RecordTable headers={['Role', 'Department', 'Criteria', 'Salary band', 'Status', 'Action']} empty="No jobs match this view.">
            {filtered.jobs.map(job => (
              <div className="record-row jobs" key={job.id}>
                <Identity title={job.title} subtitle={`${job.id} · ${job.location}`} />
                <span>{job.department}</span>
                <span>{job.criteria.join(', ')}</span>
                <span>{money(job.salaryMin)}–{money(job.salaryMax)}</span>
                <Status value={job.status} />
                <select aria-label={`Status for ${job.title}`} value={job.status} onChange={event => mutate(`/jobs/${job.id}`, { status: event.target.value }, `${job.title} updated.`)}>
                  <option>Draft</option><option>Published</option><option>Paused</option><option>Closed</option>
                </select>
              </div>
            ))}
          </RecordTable>
        )}

        {tab === 'interviews' && (
          <RecordTable headers={['Candidate', 'Role', 'Schedule', 'Interviewer', 'Status', 'Action']} empty="Interview tasks appear when a candidate advances.">
            {filtered.interviews.map(interview => (
              <div className="record-row interviews" key={interview.id}>
                <Identity title={interview.candidateCode} subtitle={interview.id} />
                <span>{interview.jobTitle}</span>
                <span>{interview.scheduledAt ? formatDateTime(interview.scheduledAt) : 'Not scheduled'}</span>
                <span>{interview.interviewer || 'Unassigned'}</span>
                <Status value={interview.status} />
                <button className="table-action" onClick={() => setDecision({ ...interview, mode: 'interview' })}>{interview.scheduledAt ? 'Add feedback' : 'Schedule'}</button>
              </div>
            ))}
          </RecordTable>
        )}

        {tab === 'offers' && (
          <RecordTable headers={['Candidate', 'Role', 'Compensation', 'Created', 'Status', 'Action']} empty="Draft offers appear after an interview decision.">
            {filtered.offers.map(offer => (
              <div className="record-row offers" key={offer.id}>
                <Identity title={offer.candidateCode} subtitle={offer.id} />
                <span>{offer.jobTitle}</span>
                <span>{money(offer.salary)}</span>
                <span>{formatDate(offer.createdAt)}</span>
                <Status value={offer.status} />
                <button className="table-action" onClick={() => setDecision({ ...offer, mode: 'offer' })}>Manage offer</button>
              </div>
            ))}
          </RecordTable>
        )}

        {tab === 'onboarding' && (
          <div className="onboarding-grid">
            {filtered.onboarding.map(plan => (
              <article className="onboarding-card" key={plan.id}>
                <header><div><span>{plan.candidateCode}</span><h3>{plan.employeeName}</h3><p>{plan.jobTitle} · starts {formatDate(plan.startDate)}</p></div><Status value={plan.status} /></header>
                <div className="onboarding-progress"><i style={{ width: `${Math.round(plan.tasks.filter(task => task.completed).length / plan.tasks.length * 100)}%` }} /></div>
                <ul>{plan.tasks.map(task => <li key={task.id}><label><input type="checkbox" checked={task.completed} onChange={event => mutate(`/onboarding/${plan.id}/tasks/${task.id}`, { completed: event.target.checked }, 'Onboarding task updated.')} /><span><b>{task.title}</b><small>{task.owner}</small></span></label></li>)}</ul>
              </article>
            ))}
            {!filtered.onboarding.length && <Empty icon={ClipboardCheck} text="Onboarding plans appear when an accepted offer becomes a hire." />}
          </div>
        )}

        {tab === 'audit' && (
          <RecordTable headers={['Event', 'Resource', 'Actor', 'Time', 'Integrity', 'Details']} empty="Recorded lifecycle changes appear here.">
            {filtered.audit.map(log => (
              <div className="record-row audit" key={log.id}>
                <Identity title={humanize(log.action)} subtitle={log.id} />
                <span>{log.entityType} · {log.entityId}</span>
                <span>{log.actor}<small className="block">{log.role}</small></span>
                <span>{formatDateTime(log.timestamp)}</span>
                <span className="integrity"><ShieldCheck size={14} /> Chained</span>
                <span>{summarize(log.details)}</span>
              </div>
            ))}
          </RecordTable>
        )}
      </section>

      {jobDialog && <JobDialog onClose={() => setJobDialog(false)} onCreated={() => { setJobDialog(false); setNotice('Job created with versioned criteria.'); load(); }} />}
      {decision && (
        decision.mode === 'interview'
          ? <InterviewDialog interview={decision} onClose={() => setDecision(null)} onSave={async body => { if (await mutate(`/interviews/${decision.id}`, body, 'Interview record updated.')) setDecision(null); }} />
          : decision.mode === 'offer'
            ? <OfferDialog offer={decision} onClose={() => setDecision(null)} onSave={async body => { if (await mutate(`/offers/${decision.id}`, body, 'Offer updated.')) setDecision(null); }} />
            : <DecisionDialog application={decision} onClose={() => setDecision(null)} onSave={async body => { if (await mutate(`/applications/${decision.id}/stage`, body, `Candidate moved to ${body.stage}.`)) setDecision(null); }} />
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return <article><i><Icon size={18} /></i><span><strong>{value}</strong><small>{label}</small></span></article>;
}

function Identity({ title, subtitle }) {
  return <div className="record-identity"><i>{String(title).slice(0, 2).toUpperCase()}</i><span><strong>{title}</strong><small>{subtitle}</small></span></div>;
}

function Status({ value }) {
  return <span className={`lifecycle-status ${String(value).toLowerCase().replaceAll(' ', '-')}`}><i />{value}</span>;
}

function Score({ value }) {
  return value === null || value === undefined ? <span className="score pending">Pending</span> : <span className="score">{value}% match</span>;
}

function RecordTable({ headers, children, empty }) {
  const count = Array.isArray(children) ? children.length : children ? 1 : 0;
  return <div className="record-table"><div className="record-head">{headers.map(header => <span key={header}>{header}</span>)}</div>{count ? children : <div className="table-empty">{empty}</div>}</div>;
}

function Empty({ icon: Icon, text }) {
  return <div className="lifecycle-empty"><Icon size={24} /><strong>{text}</strong></div>;
}

function Dialog({ title, subtitle, onClose, children, onSubmit, submitLabel }) {
  return <div className="dialog-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}><form className="lifecycle-dialog" onSubmit={onSubmit}><header><div><h2>{title}</h2><p>{subtitle}</p></div><button type="button" onClick={onClose} aria-label="Close"><X size={18} /></button></header><div className="dialog-body">{children}</div><footer><button type="button" className="button-secondary" onClick={onClose}>Cancel</button><button className="button-primary">{submitLabel}</button></footer></form></div>;
}

function JobDialog({ onClose, onCreated }) {
  const [error, setError] = useState('');
  const submit = async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await request('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          title: form.get('title'), department: form.get('department'), location: form.get('location'),
          employmentType: form.get('employmentType'), openings: form.get('openings'), salaryMin: form.get('salaryMin'),
          salaryMax: form.get('salaryMax'), criteria: form.get('criteria'), status: form.get('status'),
        }),
      });
      onCreated();
    } catch (submitError) { setError(submitError.message); }
  };
  return <Dialog title="Create a governed job" subtitle="Criteria become the evidence rubric used throughout screening and interviews." onClose={onClose} onSubmit={submit} submitLabel="Create job">
    {error && <p className="dialog-error">{error}</p>}
    <div className="form-grid"><label>Job title<input name="title" required placeholder="Senior Data Engineer" /></label><label>Department<input name="department" required placeholder="Engineering" /></label><label>Location<input name="location" required defaultValue="Remote" /></label><label>Employment type<select name="employmentType"><option>Full-time</option><option>Part-time</option><option>Contract</option></select></label><label>Openings<input name="openings" type="number" min="1" defaultValue="1" required /></label><label>Initial status<select name="status"><option>Draft</option><option>Published</option></select></label><label>Salary minimum<input name="salaryMin" type="number" min="0" defaultValue="90000" required /></label><label>Salary maximum<input name="salaryMax" type="number" min="1" defaultValue="120000" required /></label><label className="full">Job-related criteria<textarea name="criteria" required placeholder="SQL, data modeling, stakeholder communication" /><small>Comma-separated. Identity and demographic traits are prohibited.</small></label></div>
  </Dialog>;
}

function DecisionDialog({ application, onClose, onSave }) {
  const [stage, setStage] = useState(nextStage[application.stage]?.[0] || '');
  const submit = event => { event.preventDefault(); const form = new FormData(event.currentTarget); onSave({ stage, reason: form.get('reason'), startDate: form.get('startDate') || undefined }); };
  return <Dialog title={`Decision for ${application.candidateCode}`} subtitle={`${application.jobTitle} · currently ${application.stage}`} onClose={onClose} onSubmit={submit} submitLabel="Record decision">
    <label>Next stage<select value={stage} onChange={event => setStage(event.target.value)}>{nextStage[application.stage]?.map(item => <option key={item}>{item}</option>)}</select></label>
    {stage === 'Hired' && <label>Start date<input type="date" name="startDate" required /></label>}
    <label>Evidence-based reason<textarea name="reason" required minLength="12" maxLength="500" placeholder="State the job-related evidence behind this decision." /></label>
    <div className="decision-evidence"><ClipboardCheck size={17} /><span><strong>Decision accountability</strong><small>This reason, your identity, the prior stage, and the new stage will be written to the audit trail.</small></span></div>
  </Dialog>;
}

function InterviewDialog({ interview, onClose, onSave }) {
  const submit = event => { event.preventDefault(); const form = new FormData(event.currentTarget); onSave({ scheduledAt: form.get('scheduledAt') ? new Date(form.get('scheduledAt')).toISOString() : null, interviewer: form.get('interviewer'), format: form.get('format'), status: form.get('status'), rating: form.get('rating') ? Number(form.get('rating')) : null, feedback: form.get('feedback') }); };
  return <Dialog title={`Interview · ${interview.candidateCode}`} subtitle={interview.rubric} onClose={onClose} onSubmit={submit} submitLabel="Save interview">
    <div className="form-grid"><label>Scheduled time<input name="scheduledAt" type="datetime-local" defaultValue={interview.scheduledAt?.slice(0, 16) || ''} required /></label><label>Interviewer<input name="interviewer" defaultValue={interview.interviewer} required /></label><label>Format<select name="format" defaultValue={interview.format}><option>Video</option><option>On-site</option><option>Phone</option></select></label><label>Status<select name="status" defaultValue={interview.status}><option>Scheduled</option><option>Completed</option><option>Cancelled</option><option>No show</option></select></label><label>Rubric rating<input name="rating" type="number" min="1" max="5" step="0.5" defaultValue={interview.rating || ''} /></label><label className="full">Evidence and feedback<textarea name="feedback" defaultValue={interview.feedback} placeholder="Record observed evidence separately from judgment." /></label></div>
  </Dialog>;
}

function OfferDialog({ offer, onClose, onSave }) {
  const submit = event => { event.preventDefault(); const form = new FormData(event.currentTarget); onSave({ salary: Number(form.get('salary')), status: form.get('status') }); };
  return <Dialog title={`Offer · ${offer.candidateCode}`} subtitle={`${offer.jobTitle} · compensation requires an explicit status change`} onClose={onClose} onSubmit={submit} submitLabel="Save offer">
    <label>Annual base salary<input name="salary" type="number" min="1" defaultValue={offer.salary} required /></label><label>Offer status<select name="status" defaultValue={offer.status}><option>Draft</option><option>Pending approval</option><option>Sent</option><option>Accepted</option><option>Declined</option></select></label>
  </Dialog>;
}

function formatDate(value) {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}
function formatDateTime(value) {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}
function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);
}
function humanize(value) {
  return String(value).replaceAll('.', ' ').replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}
function summarize(details = {}) {
  if (details.from && details.to) return `${details.from} → ${details.to}`;
  if (details.status) return `Status: ${details.status}`;
  if (details.jobId) return `Job: ${details.jobId}`;
  return Object.keys(details).length ? Object.entries(details).map(([key, value]) => `${key}: ${value}`).join(' · ') : 'Recorded';
}
