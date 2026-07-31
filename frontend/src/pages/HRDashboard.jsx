import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, CheckCircle2, FileSpreadsheet,
  FileUp, ShieldAlert, TrendingUp, Users, Workflow,
} from 'lucide-react';
import { useData } from '../context/DataContext';

export default function HRDashboard() {
  const { employees, candidates, biasAlerts, safetyReports, overallEqualityScore } = useData();
  const brief = useMemo(
    () => buildBrief(employees, candidates, biasAlerts, safetyReports, overallEqualityScore),
    [employees, candidates, biasAlerts, safetyReports, overallEqualityScore],
  );

  return (
    <div className="work-dashboard">
      <header className="work-hero">
        <div>
          <span>HR command center</span>
          <h1>What needs attention today</h1>
          <p>One prioritized work queue across hiring, fairness, advancement, and employee safety.</p>
        </div>
        <div className="health-signal">
          <div className={`health-dot ${brief.healthTone}`} />
          <div><strong>{brief.healthLabel}</strong><span>{brief.openActions} open action{brief.openActions === 1 ? '' : 's'}</span></div>
          <b>{overallEqualityScore}<small>/100</small></b>
        </div>
      </header>

      <Link className="lifecycle-launch" to="/talent-lifecycle">
        <i><Workflow size={23} /></i>
        <div>
          <span>New connected workflow</span>
          <strong>Run the complete hiring lifecycle</strong>
          <p>Create governed jobs, move candidates through screening and interviews, manage offers, and complete onboarding from one workspace.</p>
        </div>
        <b>Open talent lifecycle <ArrowRight size={16} /></b>
      </Link>

      <section className="today-strip">
        <div><span>Today’s queue</span><strong>{brief.openActions}</strong><small>items needing an HR decision</small></div>
        <div><span>Highest priority</span><strong>{brief.urgentCases ? `${brief.urgentCases} urgent case${brief.urgentCases === 1 ? '' : 's'}` : 'No urgent cases'}</strong><small>{brief.urgentCases ? 'Workplace response required' : 'Safety queue is stable'}</small></div>
        <div><span>Candidate decisions</span><strong>{brief.pendingCandidates}</strong><small>applications awaiting review</small></div>
        <div><span>Advancement reviews</span><strong>{brief.eligibleEmployees}</strong><small>eligible employees awaiting evaluation</small></div>
      </section>

      <main className="work-layout">
        <section className="work-queue">
          <div className="section-heading"><div><span>Prioritized automatically</span><h2>Action queue</h2></div><small>Critical items first</small></div>
          {brief.tasks.map((task, index) => (
            <article className={`work-item ${task.tone}`} key={task.title}>
              <div className="work-rank">{String(index + 1).padStart(2, '0')}</div>
              <i>{task.icon}</i>
              <div className="work-copy">
                <div><span>{task.area}</span><b>{task.priority}</b></div>
                <h3>{task.title}</h3>
                <p>{task.detail}</p>
                <small>{task.evidence}</small>
              </div>
              <Link to={task.to}>{task.action}<ArrowRight size={15} /></Link>
            </article>
          ))}
          {!brief.tasks.length && <div className="queue-clear"><CheckCircle2 size={24} /><div><strong>No immediate action required</strong><span>Current fairness and safety records are within review thresholds.</span></div></div>}
        </section>

        <aside className="decision-panel">
          <div className="section-heading"><div><span>Current workload</span><h2>Decision load</h2></div></div>
          <div className="load-ring" style={{ '--load': `${brief.loadPercent * 3.6}deg` }}>
            <strong>{brief.loadPercent}%</strong><span>requires action</span>
          </div>
          <div className="load-list">
            {brief.load.map(item => <div key={item.label}><span><i className={item.tone} />{item.label}</span><strong>{item.value}</strong></div>)}
          </div>
          <p>This is workload, not another fairness score. It shows how much of the current HR queue still needs a decision.</p>
        </aside>
      </main>

      <section className="decision-grid">
        <article className="decision-card">
          <div className="section-heading"><div><span>Hiring</span><h2>Next candidate decisions</h2></div><Link to="/candidate-comparison">Open comparison <ArrowRight size={13} /></Link></div>
          <div className="decision-list">
            {brief.candidates.map(candidate => (
              <div key={candidate.id}>
                <div className="candidate-initials">{initials(candidate.name)}</div>
                <div><strong>{candidate.name}</strong><span>{candidate.appliedRole}</span></div>
                <b>{candidate.meritScore ?? '—'}<small> merit</small></b>
                <em className={statusTone(candidate.status)}>{candidate.status}</em>
              </div>
            ))}
            {!brief.candidates.length && <Empty text="No candidates are awaiting a decision." />}
          </div>
        </article>

        <article className="decision-card">
          <div className="section-heading"><div><span>Safety &amp; investigations</span><h2>Open case watch</h2></div><Link to="/harassment-dashboard">Manage cases <ArrowRight size={13} /></Link></div>
          <div className="case-list">
            {brief.cases.map(item => (
              <div key={item.id}>
                <i className={item.severity === 'Urgent' ? 'urgent' : ''}><ShieldAlert size={17} /></i>
                <div><strong>{item.category}</strong><span>{item.id} · {item.date}</span></div>
                <b>{item.status}</b>
              </div>
            ))}
            {!brief.cases.length && <Empty text="There are no open workplace cases." />}
          </div>
        </article>
      </section>

      <section className="brief-footer">
        <article>
          <div className="section-heading"><div><span>Recorded events</span><h2>Latest activity</h2></div></div>
          <div className="brief-timeline">
            {brief.activity.map(item => <div key={`${item.title}-${item.date}`}><i>{item.icon}</i><div><strong>{item.title}</strong><span>{item.detail}</span></div><time>{item.date}</time></div>)}
          </div>
        </article>
        <article className="quick-work">
          <span>Start new work</span><h2>Quick actions</h2>
          <div>
            <Link to="/talent-lifecycle"><Workflow size={17} /><span>Manage lifecycle</span><ArrowRight size={14} /></Link>
            <Link to="/blind-screening"><FileUp size={17} /><span>Upload resumes</span><ArrowRight size={14} /></Link>
            <Link to="/candidate-comparison"><Users size={17} /><span>Review candidates</span><ArrowRight size={14} /></Link>
            <Link to="/compliance-reports"><FileSpreadsheet size={17} /><span>Generate report</span><ArrowRight size={14} /></Link>
          </div>
        </article>
      </section>
      <style>{styles}</style>
    </div>
  );
}

function buildBrief(employees, candidates, alerts, cases, equalityScore) {
  const activeAlerts = alerts.filter(item => item.status === 'Active');
  const openCases = cases.filter(item => item.status !== 'Resolved');
  const urgentCases = openCases.filter(item => item.severity === 'Urgent').length;
  const pendingCandidates = candidates.filter(item => /pending|review/i.test(item.status)).length;
  const eligible = employees.filter(item => item.monthsInRole >= 24 && item.performanceRating >= 4);
  const womenEligible = eligible.filter(item => item.gender === 'Female');
  const menEligible = eligible.filter(item => item.gender === 'Male');
  const recommended = people => people.filter(item => item.monthsInRole >= 30 && item.performanceRating >= 4.3).length;
  const womenRate = womenEligible.length ? recommended(womenEligible) / womenEligible.length * 100 : 0;
  const menRate = menEligible.length ? recommended(menEligible) / menEligible.length * 100 : 0;
  const promotionGap = Math.abs(womenRate - menRate);
  const womenSalary = average(employees.filter(item => item.gender === 'Female').map(item => item.salary).filter(Boolean));
  const menSalary = average(employees.filter(item => item.gender === 'Male').map(item => item.salary).filter(Boolean));
  const payGap = menSalary ? Math.abs((womenSalary - menSalary) / menSalary * 100) : 0;

  const tasks = [];
  openCases.forEach(item => tasks.push({
    area: 'Workplace safety', priority: item.severity === 'Urgent' ? 'Critical' : 'High',
    title: `${item.id} needs case action`, detail: item.category,
    evidence: `${item.status} · reported ${item.date}`, to: '/harassment-dashboard',
    action: 'Open case', tone: item.severity === 'Urgent' ? 'critical' : 'high', icon: <ShieldAlert size={19} />,
  }));
  activeAlerts.forEach(item => tasks.push({
    area: 'Fairness finding', priority: item.severity === 'High' ? 'High' : 'Review',
    title: item.title, detail: item.description, evidence: `${item.department} · ${item.metric}`,
    to: item.actionUrl || '/dashboard', action: 'Investigate', tone: item.severity === 'High' ? 'high' : 'review', icon: <AlertTriangle size={19} />,
  }));
  if (pendingCandidates) tasks.push({
    area: 'Hiring', priority: 'Decision',
    title: `${pendingCandidates} candidate application${pendingCandidates === 1 ? '' : 's'} waiting`,
    detail: 'Review merit evidence and record the next hiring decision.',
    evidence: `${candidates.length} total candidates in the active pipeline`, to: '/candidate-comparison',
    action: 'Review now', tone: 'normal', icon: <Users size={19} />,
  });
  if (eligible.length) tasks.push({
    area: 'Advancement', priority: promotionGap >= 10 ? 'High' : 'Review',
    title: `${eligible.length} promotion evaluations are ready`,
    detail: 'Eligible employees have sufficient performance and time-in-role evidence.',
    evidence: `${promotionGap.toFixed(1)} point recommendation difference by gender`, to: '/promotion-analytics',
    action: 'Evaluate', tone: promotionGap >= 10 ? 'high' : 'normal', icon: <TrendingUp size={19} />,
  });
  const priority = { critical: 0, high: 1, review: 2, normal: 3 };
  tasks.sort((a, b) => priority[a.tone] - priority[b.tone]);
  const openActions = tasks.length;
  const monitored = employees.length + candidates.length + cases.length + alerts.length;
  const loadPercent = monitored ? Math.min(100, Math.round((openActions + pendingCandidates + openCases.length) / Math.max(1, monitored) * 100)) : 0;
  const candidateQueue = [...candidates]
    .filter(item => !/declined|rejected|hired/i.test(item.status))
    .sort((a, b) => (b.meritScore || 0) - (a.meritScore || 0)).slice(0, 5);
  const activity = [
    ...candidates.slice(0, 2).map(item => ({ title: `${item.name} · ${item.status}`, detail: item.appliedRole, date: item.appliedDate || 'Recent', icon: <Users size={14} /> })),
    ...openCases.slice(0, 2).map(item => ({ title: `${item.id} · ${item.status}`, detail: item.category, date: item.date, icon: <ShieldAlert size={14} /> })),
    ...activeAlerts.slice(0, 1).map(item => ({ title: 'Fairness finding active', detail: item.title, date: 'Current', icon: <AlertTriangle size={14} /> })),
  ].slice(0, 5);
  return {
    tasks: tasks.slice(0, 6), cases: openCases.slice(0, 4), candidates: candidateQueue, activity,
    urgentCases, pendingCandidates, eligibleEmployees: eligible.length, openActions, loadPercent,
    healthLabel: equalityScore >= 85 && !urgentCases ? 'Organization stable' : urgentCases ? 'Immediate attention' : 'Review required',
    healthTone: urgentCases ? 'critical' : equalityScore >= 85 ? 'healthy' : 'review',
    load: [
      { label: 'Candidate decisions', value: pendingCandidates, tone: 'indigo' },
      { label: 'Fairness findings', value: activeAlerts.length, tone: 'amber' },
      { label: 'Open investigations', value: openCases.length, tone: 'coral' },
      { label: 'Promotion reviews', value: eligible.length, tone: 'teal' },
    ],
    payGap,
  };
}

function average(values) { return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0; }
function initials(name = '') { return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase(); }
function statusTone(status = '') {
  if (/shortlist|interview|advanced/i.test(status)) return 'positive';
  if (/declined|rejected/i.test(status)) return 'negative';
  return 'pending';
}
function Empty({ text }) { return <div className="work-empty">{text}</div>; }

const styles = `
.work-dashboard{display:flex;flex-direction:column;gap:18px;color:var(--text-dark)}.work-hero{display:flex;align-items:center;justify-content:space-between;gap:25px;padding:30px 34px;border-radius:24px;background:linear-gradient(120deg,#252963,#3a4388);color:#fff}.work-hero>div:first-child>span{color:#76d9c7;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.09em}.work-hero h1{margin:7px 0 5px;font-family:var(--font-serif);font-size:39px}.work-hero p{color:rgba(255,255,255,.7);font-size:14px}.health-signal{display:grid;grid-template-columns:10px 1fr auto;align-items:center;gap:11px;min-width:310px;padding:15px 17px;border:1px solid rgba(255,255,255,.14);border-radius:15px;background:rgba(255,255,255,.07)}.health-dot{width:10px;height:10px;border-radius:50%}.health-dot.healthy{background:#2dd4bf}.health-dot.review{background:#f3b74e}.health-dot.critical{background:#ff8073;box-shadow:0 0 0 5px rgba(255,128,115,.12)}.health-signal strong,.health-signal span{display:block}.health-signal strong{font-size:12px}.health-signal span{margin-top:3px;color:rgba(255,255,255,.55);font-size:9px}.health-signal>b{font-size:24px}.health-signal b small{color:rgba(255,255,255,.45);font-size:9px}.lifecycle-launch{display:grid;grid-template-columns:48px 1fr auto;align-items:center;gap:16px;padding:18px 21px;border:1px solid #bfd2ff;border-radius:16px;background:linear-gradient(100deg,#f4f7ff,#eef8ff);color:#172033;text-decoration:none;box-shadow:0 7px 20px rgba(37,99,235,.07)}.lifecycle-launch>i{width:48px;height:48px;display:grid;place-items:center;border-radius:13px;background:#4f46e5;color:#fff}.lifecycle-launch div>span{display:block;color:#4f46e5;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}.lifecycle-launch div>strong{display:block;margin:3px 0;font-size:16px}.lifecycle-launch p{color:#667085;font-size:11px}.lifecycle-launch>b{display:flex;align-items:center;gap:7px;padding:10px 13px;border-radius:9px;background:#172033;color:#fff;font-size:11px}.today-strip{display:grid;grid-template-columns:repeat(4,1fr);overflow:hidden;border:1px solid var(--border-light);border-radius:18px;background:#fff}.today-strip>div{padding:18px 20px;border-right:1px solid var(--border-light)}.today-strip>div:last-child{border:0}.today-strip span,.today-strip small,.today-strip strong{display:block}.today-strip span{color:var(--text-muted);font-size:9px;font-weight:800;text-transform:uppercase}.today-strip strong{margin:6px 0 3px;color:var(--primary-indigo);font-size:22px}.today-strip small{color:var(--text-muted);font-size:9px}.work-layout{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:12px}.work-queue,.decision-panel,.decision-card,.brief-footer>article{overflow:hidden;border:1px solid var(--border-light);border-radius:19px;background:#fff}.section-heading{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:19px 21px;border-bottom:1px solid var(--border-light)}.section-heading>div>span{color:var(--secondary-teal);font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.06em}.section-heading h2{margin-top:3px;color:var(--primary-indigo);font-size:19px}.section-heading>small{color:var(--text-muted);font-size:9px}.section-heading>a{display:flex;align-items:center;gap:4px;color:var(--secondary-teal);font-size:10px;font-weight:750;text-decoration:none}.work-item{display:grid;grid-template-columns:35px 38px 1fr auto;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid var(--border-light)}.work-item:last-child{border:0}.work-item.critical{border-left:4px solid var(--accent-coral)}.work-item.high{border-left:4px solid var(--warning-amber)}.work-rank{color:#aeb2be;font-size:10px;font-weight:800}.work-item>i{width:37px;height:37px;display:grid;place-items:center;border-radius:11px;background:var(--neutral-bg);color:var(--primary-indigo)}.work-item.critical>i{background:#fbe6e3;color:var(--accent-coral)}.work-copy>div{display:flex;align-items:center;gap:7px}.work-copy>div span{color:var(--text-muted);font-size:8px;font-weight:800;text-transform:uppercase}.work-copy>div b{padding:3px 6px;border-radius:10px;background:#fff1d6;color:#9a6810;font-size:7px;text-transform:uppercase}.work-item.critical .work-copy>div b{background:#fbe6e3;color:#a9483e}.work-copy h3{margin:4px 0 3px;font-size:12px}.work-copy p{max-width:650px;color:var(--text-muted);font-size:10px;line-height:1.4}.work-copy>small{display:block;margin-top:5px;color:#8a8f9d;font-size:8px}.work-item>a{display:flex;align-items:center;gap:5px;padding:8px 10px;border:1px solid var(--border-light);border-radius:9px;color:var(--primary-indigo);font-size:9px;font-weight:800;text-decoration:none}.queue-clear{display:flex;align-items:center;justify-content:center;gap:11px;padding:45px;color:var(--secondary-teal)}.queue-clear strong,.queue-clear span{display:block}.queue-clear strong{font-size:13px}.queue-clear span{margin-top:3px;color:var(--text-muted);font-size:10px}.decision-panel{padding-bottom:18px}.decision-panel .section-heading{border:0}.load-ring{width:145px;height:145px;display:flex;align-items:center;justify-content:center;flex-direction:column;margin:10px auto 20px;border-radius:50%;background:radial-gradient(circle closest-side,#fff 73%,transparent 75% 99%),conic-gradient(var(--warning-amber) var(--load),#edf0f4 0)}.load-ring strong{font-size:29px}.load-ring span{color:var(--text-muted);font-size:9px}.load-list{margin:0 20px;border-top:1px solid var(--border-light)}.load-list>div{display:flex;align-items:center;justify-content:space-between;padding:10px 1px;border-bottom:1px solid var(--border-light)}.load-list span{display:flex;align-items:center;gap:7px;color:var(--text-muted);font-size:10px}.load-list i{width:8px;height:8px;border-radius:50%}.load-list i.indigo{background:var(--primary-indigo)}.load-list i.amber{background:var(--warning-amber)}.load-list i.coral{background:var(--accent-coral)}.load-list i.teal{background:var(--secondary-teal)}.load-list strong{font-size:11px}.decision-panel>p{margin:14px 20px 0;color:var(--text-muted);font-size:9px;line-height:1.5}.decision-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:12px}.candidate-initials{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;background:#e8e9f5;color:var(--primary-indigo);font-size:10px;font-weight:800}.decision-list{padding:3px 19px 12px}.decision-list>div{display:grid;grid-template-columns:34px 1fr 55px 100px;align-items:center;gap:10px;padding:11px 0;border-bottom:1px solid var(--border-light)}.decision-list>div:last-child{border:0}.decision-list strong,.decision-list span{display:block}.decision-list strong{font-size:10px}.decision-list span{margin-top:2px;color:var(--text-muted);font-size:9px}.decision-list>div>b{color:var(--primary-indigo);font-size:14px}.decision-list b small{color:var(--text-muted);font-size:8px}.decision-list em{padding:5px 8px;border-radius:12px;text-align:center;font-size:8px;font-style:normal;font-weight:800}.decision-list em.pending{background:#fff1d8;color:#95650f}.decision-list em.positive{background:#dff5ef;color:#237a69}.decision-list em.negative{background:#fbe5e2;color:#aa463b}.case-list{padding:3px 19px 12px}.case-list>div{display:grid;grid-template-columns:36px 1fr auto;align-items:center;gap:10px;padding:11px 0;border-bottom:1px solid var(--border-light)}.case-list>div:last-child{border:0}.case-list>div>i{width:35px;height:35px;display:grid;place-items:center;border-radius:10px;background:#fff1d8;color:#9c6c17}.case-list>div>i.urgent{background:#fbe5e2;color:var(--accent-coral)}.case-list strong,.case-list span{display:block}.case-list strong{font-size:10px}.case-list span{margin-top:3px;color:var(--text-muted);font-size:8px}.case-list b{padding:5px 7px;border-radius:11px;background:var(--neutral-bg);font-size:8px}.brief-footer{display:grid;grid-template-columns:1fr 360px;gap:12px}.brief-timeline{padding:3px 20px 12px}.brief-timeline>div{display:grid;grid-template-columns:32px 1fr auto;align-items:center;gap:10px;padding:11px 0;border-bottom:1px solid var(--border-light)}.brief-timeline>div:last-child{border:0}.brief-timeline>div>i{width:30px;height:30px;display:grid;place-items:center;border-radius:9px;background:var(--neutral-bg);color:var(--primary-indigo)}.brief-timeline strong,.brief-timeline span{display:block}.brief-timeline strong{font-size:10px}.brief-timeline span,.brief-timeline time{color:var(--text-muted);font-size:8px}.quick-work{padding:20px;background:#252963!important;color:#fff}.quick-work>span{color:#74d8c5;font-size:9px;font-weight:800;text-transform:uppercase}.quick-work h2{margin:3px 0 14px;font-family:var(--font-serif);font-size:22px}.quick-work>div{display:flex;flex-direction:column}.quick-work a{display:grid;grid-template-columns:25px 1fr 14px;align-items:center;gap:8px;padding:11px 0;border-top:1px solid rgba(255,255,255,.1);color:#fff;font-size:10px;text-decoration:none}.quick-work a>svg:last-child{color:rgba(255,255,255,.35)}.work-empty{padding:28px!important;color:var(--text-muted);text-align:center;font-size:10px}@media(max-width:1050px){.work-layout,.decision-grid,.brief-footer{grid-template-columns:1fr}.today-strip{grid-template-columns:repeat(2,1fr)}}@media(max-width:700px){.work-hero{align-items:flex-start;flex-direction:column}.health-signal{min-width:0;width:100%}.lifecycle-launch{grid-template-columns:42px 1fr}.lifecycle-launch>b{grid-column:2;width:max-content}.today-strip{grid-template-columns:1fr}.work-item{grid-template-columns:30px 36px 1fr}.work-item>a{grid-column:3;width:max-content}.decision-list>div{grid-template-columns:34px 1fr 45px}.decision-list em{grid-column:2/-1;width:max-content}}
.work-hero>div:first-child>span{font-size:13px}.work-hero p{font-size:16px}.health-signal strong{font-size:14px}.health-signal span{font-size:11px}.health-signal>b{font-size:27px}.health-signal b small{font-size:11px}
.today-strip span{font-size:11px}.today-strip strong{font-size:25px}.today-strip small{font-size:11px}
.section-heading>div>span{font-size:11px}.section-heading h2{font-size:21px}.section-heading>small,.section-heading>a{font-size:12px}
.work-rank{font-size:12px}.work-copy>div span{font-size:10px}.work-copy>div b{font-size:9px}.work-copy h3{font-size:15px}.work-copy p{font-size:12px;line-height:1.5}.work-copy>small{font-size:10px}.work-item>a{font-size:11px}
.queue-clear strong{font-size:15px}.queue-clear span{font-size:12px}.load-ring span{font-size:11px}.load-list span,.load-list strong{font-size:12px}.decision-panel>p{font-size:11px}
.candidate-initials{font-size:12px}.decision-list strong{font-size:12px}.decision-list span{font-size:11px}.decision-list>div>b{font-size:16px}.decision-list b small{font-size:10px}.decision-list em{font-size:10px}
.case-list strong{font-size:12px}.case-list span{font-size:10px}.case-list b{font-size:10px}.brief-timeline strong{font-size:12px}.brief-timeline span,.brief-timeline time{font-size:10px}
.quick-work>span{font-size:11px}.quick-work a{font-size:12px}.work-empty{font-size:12px}
`;
