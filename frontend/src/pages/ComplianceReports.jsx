import { useMemo, useState } from 'react';
import {
  AlertTriangle, CheckCircle2, ChevronDown, Clock3, FileSpreadsheet,
  FileText, Filter, ShieldCheck, XCircle,
} from 'lucide-react';
import { useData } from '../context/DataContext';

const ALL = 'All';
const average = values => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const clamp = value => Math.max(0, Math.min(100, Math.round(value)));

export default function ComplianceReports() {
  const { employees, candidates, biasAlerts, safetyReports } = useData();
  const [department, setDepartment] = useState(ALL);
  const departments = useMemo(() => [ALL, ...new Set(employees.map(item => item.department).filter(Boolean))], [employees]);
  const scoped = useMemo(() => employees.filter(item => department === ALL || item.department === department), [employees, department]);

  const scopedCandidates = useMemo(() => candidates.filter(item => (
    department === ALL || item.department === department || !item.department
  )), [candidates, department]);

  const scopedAlerts = useMemo(() => biasAlerts.filter(item => (
    department === ALL || item.department === department
  )), [biasAlerts, department]);

  const scopedCases = useMemo(() => safetyReports.filter(item => (
    department === ALL || item.department === department || !item.department
  )), [safetyReports, department]);

  const report = useMemo(
    () => buildReport(scoped, scopedCandidates, scopedAlerts, scopedCases, department),
    [scoped, scopedCandidates, scopedAlerts, scopedCases, department],
  );

  const exportCsv = () => {
    const rows = [
      ['FairLens current compliance report'],
      ['Department scope', department],
      ['Overall compliance score', report.overall],
      [],
      ['Category', 'Score', 'Status'],
      ...report.categories.map(item => [item.label, item.score, item.met ? 'Meets standard' : 'Action required']),
      [],
      ['Department', 'Compliance score', 'Pay gap', 'Promotion gap', 'Open findings'],
      ...report.departments.map(item => [item.name, item.score, `${item.payGap.toFixed(1)}%`, `${item.promotionGap.toFixed(1)}%`, item.findings]),
      [],
      ['Unresolved item', 'Count'],
      ...report.issueSummary.map(item => [item.label, item.value]),
    ];
    const csv = rows.map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `fairlens-compliance-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="compliance-page">
      <header className="compliance-hero">
        <div>
          <span><ShieldCheck size={15} /> Equality compliance center</span>
          <h1>Compliance &amp; Regulatory Reports</h1>
          <p>A centralized, evidence-based view of gender equality and workplace fairness obligations.</p>
        </div>
        <div className="compliance-actions">
          <button onClick={exportCsv}><FileSpreadsheet size={16} /> Download CSV</button>
          <button className="primary" onClick={() => window.print()}><FileText size={16} /> Export PDF</button>
        </div>
      </header>

      <section className="compliance-filters">
        <div className="filter-intro"><Filter size={17} /><div><strong>Report scope</strong><span>{scoped.length} employees included</span></div></div>
        <Select label="Department" value={department} setValue={setDepartment} options={departments} />
        <span className="current-data-note">Current dataset · updated automatically</span>
      </section>

      <section className="compliance-overview">
        <article className={`overall-score ${tone(report.overall)}`}>
          <div className="score-ring" style={{ '--score': `${report.overall * 3.6}deg` }}><strong>{report.overall}</strong><span>/100</span></div>
          <div><span>Overall compliance score</span><h2>{statusLabel(report.overall)}</h2><p>{report.failed} of {report.categories.length} standards require action in this scope.</p></div>
        </article>
        <div className="category-scores">
          {report.categories.map(item => (
            <article key={item.label}>
              <div><i className={item.met ? 'pass' : 'attention'}>{item.met ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}</i><span>{item.label}</span></div>
              <strong>{item.score}<small>/100</small></strong>
              <div className="mini-progress"><i className={item.met ? 'pass' : 'attention'} style={{ width: `${item.score}%` }} /></div>
            </article>
          ))}
        </div>
      </section>

      <section className="compliance-card">
        <Title title="Standards requiring attention" subtitle="A direct check of the five fairness standards against current records." />
        <div className="checklist">
          {report.categories.map(item => (
            <div key={item.label}>
              <i className={item.met ? 'pass' : 'fail'}>{item.met ? <CheckCircle2 size={18} /> : <XCircle size={18} />}</i>
              <div><strong>{item.label}</strong><span>{item.detail}</span></div>
              <b className={item.met ? 'pass' : 'fail'}>{item.met ? 'Meets standard' : 'Action required'}</b>
            </div>
          ))}
        </div>
      </section>

      <section className="compliance-card department-card">
        <Title title="Department compliance comparison" subtitle="Lowest-scoring departments appear first so HR can focus investigation." />
        <div className="department-compliance">
          {report.departments.map(item => (
            <div className="department-row" key={item.name}>
              <div><strong>{item.name}</strong><span>{item.people} employees · {item.findings} open finding{item.findings === 1 ? '' : 's'}</span></div>
              <div className="department-track"><i className={tone(item.score)} style={{ width: `${item.score}%` }} /></div>
              <strong className={tone(item.score)}>{item.score}</strong>
              <span className={`status-pill ${tone(item.score)}`}>{statusLabel(item.score)}</span>
            </div>
          ))}
          {!report.departments.length && <Empty text="No department data is available for this scope." />}
        </div>
      </section>

      <section className="issue-cards">
        {report.issueSummary.map(item => (
          <article key={item.label} className={item.value ? 'has-issue' : ''}>
            <i>{item.icon}</i><div><strong>{item.value}</strong><span>{item.label}</span><small>{item.detail}</small></div>
          </article>
        ))}
      </section>




      <style>{styles}</style>
    </div>
  );
}

function buildReport(employees, candidates, alerts, cases, selectedDepartment) {
  const women = employees.filter(item => item.gender === 'Female');
  const men = employees.filter(item => item.gender === 'Male');
  const femaleSalary = average(women.map(item => item.salary).filter(Boolean));
  const maleSalary = average(men.map(item => item.salary).filter(Boolean));
  const payGap = maleSalary ? (femaleSalary - maleSalary) / maleSalary * 100 : 0;
  const payIssues = countPayIssues(employees);

  const eligible = employees.filter(item => (item.monthsInRole || 0) >= 24 && (item.performanceRating || 0) >= 4);
  const femaleEligible = eligible.filter(item => item.gender === 'Female');
  const maleEligible = eligible.filter(item => item.gender === 'Male');
  const promoted = people => people.filter(item => (item.performanceRating || 0) >= 4.3 && (item.monthsInRole || 0) >= 30).length;
  const femaleRate = femaleEligible.length ? promoted(femaleEligible) / femaleEligible.length * 100 : 0;
  const maleRate = maleEligible.length ? promoted(maleEligible) / maleEligible.length * 100 : 0;
  const promotionGap = femaleRate - maleRate;

  const activeAlerts = alerts.filter(item => item.status === 'Active' && (selectedDepartment === ALL || item.department === selectedDepartment));
  const openCases = cases.filter(item => item.status !== 'Resolved');

  const hiringScore = clamp(88 + Math.min(7, candidates.length / 4) - activeAlerts.filter(item => /hiring|screen/i.test(item.title)).length * 8);
  const payScore = clamp(100 - Math.abs(payGap) * 2 - payIssues * 1.5);
  const ratingSpread = standardDeviation(employees.map(item => item.performanceRating).filter(Boolean));
  const performanceScore = clamp(96 - ratingSpread * 13 - activeAlerts.filter(item => /review|performance/i.test(item.title)).length * 8);
  const promotionScore = clamp(100 - Math.abs(promotionGap) * 1.4 - activeAlerts.filter(item => /promotion/i.test(item.title)).length * 5);
  const safetyScore = clamp(100 - openCases.length * 11 - openCases.filter(item => item.severity === 'Urgent').length * 7);

  const categories = [
    { label: 'Hiring Fairness', score: hiringScore, met: hiringScore >= 80, detail: `${candidates.length} candidate records monitored; merit-based screening enabled.` },
    { label: 'Pay Equity', score: payScore, met: payScore >= 80, detail: `${Math.abs(payGap).toFixed(1)}% unadjusted gender pay gap; ${payIssues} peer disparities.` },
    { label: 'Performance Review Fairness', score: performanceScore, met: performanceScore >= 80, detail: `${ratingSpread.toFixed(2)} rating deviation across ${employees.length} employees.` },
    { label: 'Promotion Fairness', score: promotionScore, met: promotionScore >= 80, detail: `${Math.abs(promotionGap).toFixed(1)} point gender recommendation gap among eligible employees.` },
    { label: 'Workplace Safety', score: safetyScore, met: safetyScore >= 80, detail: `${openCases.length} unresolved case${openCases.length === 1 ? '' : 's'} in the case register.` },
  ];
  const overall = clamp(categories.reduce((sum, item) => sum + item.score, 0) / categories.length);

  const departmentNames = [...new Set(employees.map(item => item.department).filter(Boolean))];
  const departments = departmentNames.map(name => {
    const people = employees.filter(item => item.department === name);
    const w = people.filter(item => item.gender === 'Female');
    const m = people.filter(item => item.gender === 'Male');
    const wSalary = average(w.map(item => item.salary).filter(Boolean));
    const mSalary = average(m.map(item => item.salary).filter(Boolean));
    const deptPayGap = mSalary ? (wSalary - mSalary) / mSalary * 100 : 0;
    const wEligible = w.filter(item => item.monthsInRole >= 24 && item.performanceRating >= 4);
    const mEligible = m.filter(item => item.monthsInRole >= 24 && item.performanceRating >= 4);
    const wRate = wEligible.length ? promoted(wEligible) / wEligible.length * 100 : 0;
    const mRate = mEligible.length ? promoted(mEligible) / mEligible.length * 100 : 0;
    const deptPromotionGap = wEligible.length && mEligible.length ? wRate - mRate : 0;
    const findings = alerts.filter(item => item.status === 'Active' && item.department === name).length;
    const score = clamp(96 - Math.abs(deptPayGap) * 1.3 - Math.abs(deptPromotionGap) * .35 - findings * 8);
    return { name, people: people.length, score, payGap: deptPayGap, promotionGap: deptPromotionGap, findings };
  }).sort((a, b) => a.score - b.score);

  const flaggedReviews = activeAlerts.filter(item => /review|performance/i.test(`${item.title} ${item.description}`)).length;
  const issueSummary = [
    { label: 'Unresolved pay disparities', value: payIssues, detail: 'Comparable-peer salary findings', icon: <AlertTriangle size={19} /> },
    { label: 'Promotion disparities', value: Math.abs(promotionGap) >= 10 ? 1 : 0, detail: `${Math.abs(promotionGap).toFixed(1)} point gender gap`, icon: <Clock3 size={19} /> },
    { label: 'Flagged performance reviews', value: flaggedReviews, detail: 'Active review-related findings', icon: <FileText size={19} /> },
    { label: 'Open workplace cases', value: openCases.length, detail: `${openCases.filter(item => item.severity === 'Urgent').length} urgent investigation`, icon: <ShieldCheck size={19} /> },
  ];

  const recommendations = [];
  if (payIssues) recommendations.push(`Review compensation for ${payIssues} employee${payIssues === 1 ? '' : 's'} below a comparable opposite-gender peer benchmark.`);
  if (Math.abs(promotionGap) >= 10) recommendations.push(`Audit promotion recommendations; the selected scope has a ${Math.abs(promotionGap).toFixed(1)} point gender difference.`);
  if (openCases.length) recommendations.push(`Assign owners and resolution dates to ${openCases.length} open workplace case${openCases.length === 1 ? '' : 's'}.`);
  if (activeAlerts.length) recommendations.push(`Close or document remediation for ${activeAlerts.length} active fairness finding${activeAlerts.length === 1 ? '' : 's'}.`);
  if (!recommendations.length) recommendations.push('Maintain quarterly monitoring and retain evidence for the next compliance review.');

  return { overall, failed: categories.filter(item => !item.met).length, categories, departments, issueSummary, recommendations };
}

function countPayIssues(employees) {
  return employees.filter(employee => {
    if (!employee.salary || !['Female', 'Male'].includes(employee.gender)) return false;
    const opposite = employee.gender === 'Female' ? 'Male' : 'Female';
    const peers = employees.filter(peer => peer.id !== employee.id && peer.gender === opposite && peer.role === employee.role && Math.abs((peer.experienceYears || 0) - (employee.experienceYears || 0)) <= 2 && Math.abs((peer.performanceRating || 0) - (employee.performanceRating || 0)) <= .4 && peer.salary);
    const benchmark = average(peers.map(item => item.salary));
    return benchmark && employee.salary < benchmark * .97;
  }).length;
}
function standardDeviation(values) {
  if (!values.length) return 0;
  const mean = average(values);
  return Math.sqrt(average(values.map(value => (value - mean) ** 2)));
}
function tone(score) { return score >= 85 ? 'good' : score >= 70 ? 'review' : 'risk'; }
function statusLabel(score) { return score >= 85 ? 'Compliant' : score >= 70 ? 'Needs review' : 'Action required'; }
function Select({ label, value, setValue, options }) {
  return <label className="compliance-select"><span>{label}</span><select value={value} onChange={event => setValue(event.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select><ChevronDown size={14} /></label>;
}
function Title({ title, subtitle }) { return <div className="compliance-title"><h2>{title}</h2><p>{subtitle}</p></div>; }
function Empty({ text }) { return <div className="compliance-empty">{text}</div>; }

const styles = `
.compliance-page{display:flex;flex-direction:column;gap:18px;color:var(--text-dark)}
.compliance-hero{display:flex;align-items:center;justify-content:space-between;gap:28px;padding:30px 34px;border-radius:24px;background:linear-gradient(120deg,#252963,#374083);color:#fff}
.compliance-hero>div:first-child>span{display:flex;align-items:center;gap:7px;color:#76d9c7;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}
.compliance-hero h1{margin:8px 0 6px;font-family:var(--font-serif);font-size:38px}
.compliance-hero p{max-width:680px;color:rgba(255,255,255,.74);font-size:15px;line-height:1.5}
.compliance-actions{display:flex;gap:9px;flex:0 0 auto}
.compliance-actions button{display:flex;align-items:center;gap:7px;padding:11px 14px;border:1px solid rgba(255,255,255,.25);border-radius:10px;background:transparent;color:#fff;font-size:12px;font-weight:700;cursor:pointer}
.compliance-actions button.primary{border-color:#68d2bd;background:#68d2bd;color:#202558}
.compliance-filters{display:flex;align-items:center;padding:12px 14px;border:1px solid var(--border-light);border-radius:15px;background:#fff}
.filter-intro{display:flex;align-items:center;gap:9px;padding:0 20px 0 6px}
.filter-intro div{display:flex;flex-direction:column}
.filter-intro strong{font-size:14px}.filter-intro span{color:var(--text-muted);font-size:11px}
.compliance-select{position:relative;min-width:210px;padding:3px 32px 3px 14px;border-left:1px solid var(--border-light)}
.compliance-select>span{display:block;color:var(--text-muted);font-size:10px;font-weight:800;text-transform:uppercase}
.compliance-select select{width:100%;padding-top:4px;border:0;outline:0;appearance:none;background:transparent;color:var(--text-dark);font-size:13px;font-weight:650}
.compliance-select>svg{position:absolute;right:10px;top:50%;pointer-events:none}
.current-data-note{margin-left:auto;padding-right:8px;color:var(--text-muted);font-size:11px}
.compliance-overview{display:grid;grid-template-columns:1.1fr 2fr;gap:12px}
.overall-score{display:flex;align-items:center;gap:22px;padding:25px;border:1px solid var(--border-light);border-top:4px solid var(--warning-amber);border-radius:20px;background:#fff}
.overall-score.good{border-top-color:var(--secondary-teal)}.overall-score.risk{border-top-color:var(--accent-coral)}
.score-ring{width:116px;height:116px;display:flex;flex-direction:column;align-items:center;justify-content:center;flex:0 0 auto;border-radius:50%;background:radial-gradient(circle closest-side,#fff 75%,transparent 77% 99%),conic-gradient(var(--secondary-teal) var(--score),#edf0f4 0)}
.score-ring strong{font-size:32px;line-height:1;letter-spacing:-.04em}.score-ring span{margin-top:4px;color:var(--text-muted);font-size:11px;line-height:1}
.overall-score>div:last-child>span{color:var(--text-muted);font-size:11px;font-weight:800;text-transform:uppercase}
.overall-score h2{margin:4px 0;font-size:25px}.overall-score p{color:var(--text-muted);font-size:12px;line-height:1.5}
.category-scores{display:grid;grid-template-columns:repeat(5,1fr);overflow:hidden;border:1px solid var(--border-light);border-radius:20px;background:#fff}
.category-scores article{padding:20px 15px;border-right:1px solid var(--border-light)}.category-scores article:last-child{border:0}
.category-scores article>div:first-child{display:flex;align-items:center;gap:7px;min-height:34px}
.category-scores span{color:var(--text-muted);font-size:11px;font-weight:700;line-height:1.3}.category-scores strong{display:block;margin:9px 0;color:var(--primary-indigo);font-size:25px}
.category-scores small{color:var(--text-muted);font-size:11px}.category-scores i{display:grid;place-items:center;font-style:normal}
.pass{color:var(--secondary-teal)!important}.attention,.fail{color:var(--accent-coral)!important}
.mini-progress{height:5px!important;min-height:0!important;border-radius:5px;background:#edf0f4}
.mini-progress i{display:block;height:100%;border-radius:5px;background:var(--secondary-teal)}.mini-progress i.attention{background:var(--accent-coral)}
.compliance-card{overflow:hidden;border:1px solid var(--border-light);border-radius:20px;background:#fff}
.compliance-title{padding:20px 22px;border-bottom:1px solid var(--border-light)}
.compliance-title h2{color:var(--primary-indigo);font-size:19px}.compliance-title p{margin-top:4px;color:var(--text-muted);font-size:12px}
.checklist>div{display:grid;grid-template-columns:28px 1fr auto;align-items:center;gap:10px;padding:15px 21px;border-bottom:1px solid var(--border-light)}
.checklist>div:last-child{border:0}.checklist>div>i{display:grid;place-items:center}.checklist strong{display:block;font-size:13px}
.checklist span{display:block;margin-top:3px;color:var(--text-muted);font-size:11px}.checklist b{font-size:10px;text-transform:uppercase}
.department-compliance{padding:8px 20px 15px}
.department-row{display:grid;grid-template-columns:200px 1fr 42px 115px;align-items:center;gap:16px;padding:14px 3px;border-bottom:1px solid var(--border-light)}
.department-row:last-child{border:0}.department-row>div:first-child strong{display:block;font-size:13px}.department-row>div:first-child span{color:var(--text-muted);font-size:10px}
.department-track{height:12px;overflow:hidden;border-radius:8px;background:#edf0f4}.department-track i{display:block;height:100%;border-radius:8px;background:var(--warning-amber)}
.department-track i.good{background:var(--secondary-teal)}.department-track i.risk{background:var(--accent-coral)}
.department-row>strong{font-size:14px}.department-row>strong.good{color:var(--secondary-teal)}.department-row>strong.review{color:#a87518}.department-row>strong.risk{color:var(--accent-coral)}
.status-pill{padding:6px 8px;border-radius:15px;background:#fff2d8;color:#9b6810;text-align:center;font-size:9px;font-weight:800;text-transform:uppercase}
.status-pill.good{background:#e0f5f0;color:#227c6d}.status-pill.risk{background:#fbe6e3;color:#ac493d}
.issue-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.issue-cards article{display:flex;align-items:center;gap:13px;padding:19px;border:1px solid var(--border-light);border-radius:17px;background:#fff}
.issue-cards article.has-issue{border-left:4px solid var(--accent-coral)}.issue-cards article>i{width:42px;height:42px;display:grid;place-items:center;flex:0 0 auto;border-radius:12px;background:var(--neutral-bg);color:var(--primary-indigo)}
.issue-cards strong{color:var(--primary-indigo);font-size:25px}.issue-cards span,.issue-cards small{display:block}.issue-cards span{font-size:12px;font-weight:700}.issue-cards small{margin-top:2px;color:var(--text-muted);font-size:10px}
.recommendations-wrap{display:grid;grid-template-columns:minmax(0,760px);justify-content:end}
.recommendations{padding:22px;border-radius:20px;background:#252963;color:#fff}
.recommendations>div:first-child{display:flex;align-items:center;gap:11px;padding-bottom:15px;border-bottom:1px solid rgba(255,255,255,.1)}
.recommendations>div:first-child i{width:40px;height:40px;display:grid;place-items:center;border-radius:11px;background:rgba(112,214,196,.12);color:#70d6c4}
.recommendations>div:first-child span{color:#70d6c4;font-size:10px;text-transform:uppercase}.recommendations h2{font-family:var(--font-serif);font-size:23px}
.recommendation{display:flex;gap:11px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.09)}
.recommendation b{width:23px;height:23px;display:grid;place-items:center;flex:0 0 auto;border-radius:50%;background:#70d6c4;color:#22265a;font-size:11px}
.recommendation p{color:rgba(255,255,255,.82);font-size:12px;line-height:1.55}.recommendations>small{display:block;margin-top:15px;color:rgba(255,255,255,.5);font-size:10px;line-height:1.5}
.methodology-note{padding:14px 18px;border:1px dashed var(--border-light);border-radius:14px;background:#fff;color:var(--text-muted);font-size:11px;line-height:1.6}
.compliance-empty{padding:35px;color:var(--text-muted);text-align:center;font-size:12px}
@media(max-width:1100px){.compliance-overview{grid-template-columns:1fr}.category-scores{grid-template-columns:repeat(3,1fr)}.issue-cards{grid-template-columns:repeat(2,1fr)}}
@media(max-width:760px){.compliance-hero{align-items:flex-start;flex-direction:column}.compliance-actions{flex-wrap:wrap}.compliance-filters{align-items:stretch;flex-direction:column}.filter-intro{padding:5px}.compliance-select{padding:9px 32px 4px 5px;border-top:1px solid var(--border-light);border-left:0}.current-data-note{margin:5px}.category-scores{grid-template-columns:1fr}.category-scores article{border-right:0;border-bottom:1px solid var(--border-light)}.overall-score{align-items:flex-start;flex-direction:column}.checklist>div{grid-template-columns:28px 1fr}.checklist b{grid-column:2}.department-row{grid-template-columns:1fr 45px}.department-row>div:first-child,.department-row .status-pill{grid-column:1/-1}.issue-cards{grid-template-columns:1fr}.recommendations-wrap{grid-template-columns:1fr}}
@media print{.sidebar,.top-navbar,.compliance-actions,.compliance-filters{display:none!important}.compliance-hero{border:1px solid #ddd;background:#fff;color:#111}.compliance-hero p{color:#555}}
`;
