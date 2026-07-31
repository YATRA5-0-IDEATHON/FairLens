import { useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, Filter, ShieldCheck } from 'lucide-react';
import { useData } from '../context/DataContext';

const ALL = 'All';
const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);
const average = values => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

export default function PayEquityAudit() {
  const { employees } = useData();
  const [department, setDepartment] = useState(ALL);
  const [role, setRole] = useState(ALL);
  const [experience, setExperience] = useState(ALL);

  const departments = useMemo(() => [ALL, ...new Set(employees.map(item => item.department).filter(Boolean))], [employees]);
  const roles = useMemo(() => [ALL, ...new Set(employees.filter(item => department === ALL || item.department === department).map(item => item.role).filter(Boolean))], [employees, department]);

  const filtered = useMemo(() => employees.filter(item => (
    (department === ALL || item.department === department)
    && (role === ALL || item.role === role)
    && matchesExperience(item.experienceYears, experience)
  )), [employees, department, role, experience]);

  const analysis = useMemo(() => analyzePayEquity(filtered), [filtered]);

  const updateDepartment = value => {
    setDepartment(value);
    setRole(ALL);
  };

  return (
    <div className="pay-page">
      <header className="pay-hero">
        <div>
          <span><ShieldCheck size={14} /> Compensation intelligence</span>
          <h1>Pay Equity Audit</h1>
          <p>Find material salary differences, understand likely causes, and focus remediation on employees who need review.</p>
        </div>
        <div className="pay-score" style={{ '--score': `${analysis.score * 3.6}deg` }}>
          <strong>{analysis.score}</strong><span>Pay equity score</span>
        </div>
      </header>

      <section className="pay-filters">
        <div><Filter size={16} /><strong>Audit scope</strong><span>{filtered.length} employees</span></div>
        <FilterSelect label="Department" value={department} onChange={updateDepartment} options={departments} />
        <FilterSelect label="Role" value={role} onChange={setRole} options={roles} />
        <FilterSelect label="Experience" value={experience} onChange={setExperience} options={[ALL, 'Entry (0–3 years)', 'Mid (4–7 years)', 'Senior (8+ years)']} />
      </section>

      <section className="pay-kpis">
        <Kpi label="Overall pay equity score" value={`${analysis.score}/100`} detail={analysis.score >= 90 ? 'Healthy range' : analysis.score >= 80 ? 'Review recommended' : 'Action required'} tone={analysis.score >= 90 ? 'good' : 'risk'} />
        <Kpi label="Average gender pay gap" value={analysis.hasBinaryComparison ? `${signed(analysis.orgGap)}%` : 'N/A'} detail="Female average compared with male average" tone={Math.abs(analysis.orgGap) > 5 ? 'risk' : 'good'} />
        <Kpi label="Significant disparities" value={analysis.flaggedEmployees.length} detail={`Threshold: 3% below comparable peers`} tone={analysis.flaggedEmployees.length ? 'risk' : 'good'} />
        <Kpi label="Estimated remediation" value={money(analysis.remediation)} detail="Annual adjustment to peer benchmark" tone="neutral" />
      </section>

      <section className="pay-charts">
        <article className="pay-card">
          <CardTitle title="Department-wise pay gap" subtitle="Female average salary relative to male average salary" />
          <div className="gap-chart">
            {analysis.departmentGaps.map(item => (
              <div className="gap-row" key={item.department}>
                <span>{item.department}</span>
                <div><i className={Math.abs(item.gap) > 5 ? 'risk' : 'safe'} style={{ width: `${Math.min(100, Math.abs(item.gap) * 8)}%` }} /></div>
                <strong className={Math.abs(item.gap) > 5 ? 'risk-text' : ''}>{signed(item.gap)}%</strong>
              </div>
            ))}
            {!analysis.departmentGaps.length && <Empty text="The selected scope does not contain both male and female salary records." />}
          </div>
        </article>

        <article className="pay-card">
          <CardTitle title="Salary distribution by gender" subtitle="Employee count within annual salary bands" />
          <div className="distribution-chart">
            <div className="distribution-legend"><span><i className="female" />Female</span><span><i className="male" />Male</span><span><i className="other" />Other / unspecified</span></div>
            <div className="distribution-columns">
              {analysis.distribution.map(bucket => (
                <div className="distribution-column" key={bucket.label}>
                  <div className="bars">
                    <i className="female" title={`${bucket.female} female`} style={{ height: `${barHeight(bucket.female, analysis.maxBucket)}%` }} />
                    <i className="male" title={`${bucket.male} male`} style={{ height: `${barHeight(bucket.male, analysis.maxBucket)}%` }} />
                    <i className="other" title={`${bucket.other} other/unspecified`} style={{ height: `${barHeight(bucket.other, analysis.maxBucket)}%` }} />
                  </div>
                  <span>{bucket.label}</span>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="pay-lower">
        <article className="pay-card disparity-card">
          <CardTitle title="Significant unexplained disparities" subtitle="Only employees at least 3% below comparable opposite-gender peers with similar experience and performance" />
          <div className="disparity-table">
            <div className="disparity-head"><span>Employee</span><span>Department / role</span><span>Current</span><span>Peer benchmark</span><span>Adjusted gap</span><span>Review</span></div>
            {analysis.flaggedEmployees.map(item => (
              <div className="disparity-row" key={item.employee.id}>
                <div><strong>{item.employee.name}</strong><small>{item.employee.id} · {item.employee.experienceYears} yrs · {item.employee.performanceRating}/5</small></div>
                <div><strong>{item.employee.department}</strong><small>{item.employee.role}</small></div>
                <span>{money(item.employee.salary)}</span>
                <span>{money(item.benchmark)}</span>
                <strong className="risk-text">{item.gap.toFixed(1)}%</strong>
                <span className="review-badge"><AlertTriangle size={12} /> Review</span>
              </div>
            ))}
            {!analysis.flaggedEmployees.length && <Empty text="No significant comparable-peer disparities were found in this scope." />}
          </div>
        </article>

      </section>
      <style>{styles}</style>
    </div>
  );
}

function analyzePayEquity(employees) {
  const women = employees.filter(item => item.gender === 'Female' && item.salary);
  const men = employees.filter(item => item.gender === 'Male' && item.salary);
  const femaleAverage = average(women.map(item => item.salary));
  const maleAverage = average(men.map(item => item.salary));
  const orgGap = maleAverage ? (femaleAverage - maleAverage) / maleAverage * 100 : 0;

  const departmentGaps = [...new Set(employees.map(item => item.department).filter(Boolean))].map(department => {
    const people = employees.filter(item => item.department === department);
    const female = average(people.filter(item => item.gender === 'Female').map(item => item.salary));
    const male = average(people.filter(item => item.gender === 'Male').map(item => item.salary));
    return female && male ? { department, gap: (female - male) / male * 100, female, male } : null;
  }).filter(Boolean).sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));

  const flaggedEmployees = employees.map(employee => {
    if (!employee.salary || !['Male', 'Female'].includes(employee.gender)) return null;
    const opposite = employee.gender === 'Female' ? 'Male' : 'Female';
    const peers = employees.filter(peer => (
      peer.id !== employee.id
      && peer.gender === opposite
      && peer.role === employee.role
      && Math.abs((peer.experienceYears || 0) - (employee.experienceYears || 0)) <= 2
      && Math.abs((peer.performanceRating || 0) - (employee.performanceRating || 0)) <= .4
      && peer.salary
    ));
    if (!peers.length) return null;
    const benchmark = average(peers.map(peer => peer.salary));
    const gap = (employee.salary - benchmark) / benchmark * 100;
    return gap <= -3 ? { employee, benchmark, gap, peerCount: peers.length } : null;
  }).filter(Boolean).sort((a, b) => a.gap - b.gap);

  const remediation = flaggedEmployees.reduce((sum, item) => sum + Math.max(0, item.benchmark - item.employee.salary), 0);
  const disparityPenalty = employees.length ? flaggedEmployees.length / employees.length * 35 : 0;
  const score = Math.max(0, Math.min(100, Math.round(100 - Math.abs(orgGap) * 1.8 - disparityPenalty)));
  const distribution = buildDistribution(employees);
  const maxBucket = Math.max(1, ...distribution.flatMap(item => [item.female, item.male, item.other]));
  return { score, orgGap, hasBinaryComparison: Boolean(femaleAverage && maleAverage), departmentGaps, flaggedEmployees, remediation, distribution, maxBucket };
}

function buildDistribution(employees) {
  const bands = [
    { label: '<$130k', min: 0, max: 130000 },
    { label: '$130–149k', min: 130000, max: 150000 },
    { label: '$150–169k', min: 150000, max: 170000 },
    { label: '$170–189k', min: 170000, max: 190000 },
    { label: '$190k+', min: 190000, max: Infinity },
  ];
  return bands.map(band => {
    const people = employees.filter(item => item.salary >= band.min && item.salary < band.max);
    return {
      label: band.label,
      female: people.filter(item => item.gender === 'Female').length,
      male: people.filter(item => item.gender === 'Male').length,
      other: people.filter(item => !['Female', 'Male'].includes(item.gender)).length,
    };
  });
}

function matchesExperience(years = 0, filter) {
  if (filter === ALL) return true;
  if (filter.startsWith('Entry')) return years <= 3;
  if (filter.startsWith('Mid')) return years >= 4 && years <= 7;
  return years >= 8;
}
function signed(value) {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}`;
}
function barHeight(value, max) {
  return value ? Math.max(8, value / max * 100) : 0;
}
function FilterSelect({ label, value, onChange, options }) {
  return <label className="filter-select"><span>{label}</span><select value={value} onChange={event => onChange(event.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select><ChevronDown size={14} /></label>;
}
function Kpi({ label, value, detail, tone }) {
  return <article className={`pay-kpi ${tone}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}
function CardTitle({ title, subtitle }) {
  return <div className="pay-card-title"><div><h2>{title}</h2><p>{subtitle}</p></div></div>;
}
function Empty({ text }) {
  return <div className="pay-empty">{text}</div>;
}

const styles = `
.pay-page{display:flex;flex-direction:column;gap:18px}.pay-hero{display:flex;align-items:center;justify-content:space-between;gap:30px;padding:30px 36px;border-radius:24px;background:linear-gradient(120deg,#252963,#343b82);color:#fff}.pay-hero>div:first-child>span{display:flex;align-items:center;gap:6px;color:#2dd4bf;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.09em}.pay-hero h1{font-family:var(--font-serif);font-size:38px;margin:8px 0 5px}.pay-hero p{font-size:15px;line-height:1.55;color:rgba(255,255,255,.72);max-width:760px}.pay-score{width:115px;height:115px;border-radius:50%;flex:0 0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle closest-side,#2d3270 76%,transparent 78% 99%),conic-gradient(#14b8a6 var(--score),rgba(255,255,255,.13) 0)}.pay-score strong{font-size:32px}.pay-score span{font-size:10px;color:rgba(255,255,255,.72)}.pay-filters{display:flex;align-items:center;gap:9px;padding:13px 15px;border:1px solid var(--border-light);border-radius:15px;background:#fff}.pay-filters>div{display:flex;align-items:center;gap:7px;padding:0 10px}.pay-filters>div strong{font-size:14px}.pay-filters>div span{font-size:12px;color:var(--text-muted)}.filter-select{position:relative;min-width:180px;border-left:1px solid var(--border-light);padding:2px 30px 2px 12px}.filter-select span{display:block;font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700}.filter-select select{width:100%;border:0;outline:0;appearance:none;background:transparent;font-size:13px;font-weight:600;padding-top:4px;color:var(--text-dark)}.filter-select svg{position:absolute;right:9px;top:50%;pointer-events:none}.pay-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.pay-kpi{padding:20px 22px;border:1px solid var(--border-light);border-radius:17px;background:#fff;box-shadow:0 8px 25px rgba(31,36,82,.04)}.pay-kpi>span{font-size:11px;text-transform:uppercase;color:var(--text-muted);font-weight:700}.pay-kpi strong{display:block;font-size:28px;color:var(--primary-indigo);margin:7px 0 3px}.pay-kpi small{font-size:12px;color:var(--text-muted)}.pay-kpi.risk{border-top:3px solid var(--accent-coral)}.pay-kpi.good{border-top:3px solid var(--secondary-teal)}.pay-charts{display:grid;grid-template-columns:1fr 1fr;gap:12px}.pay-card{background:#fff;border:1px solid var(--border-light);border-radius:20px;overflow:hidden}.pay-card-title{padding:20px 22px;border-bottom:1px solid var(--border-light)}.pay-card-title h2{font-size:18px;color:var(--primary-indigo)}.pay-card-title p{font-size:12px;line-height:1.45;color:var(--text-muted);margin-top:4px}.gap-chart{padding:20px 22px;display:flex;flex-direction:column;gap:16px;min-height:260px}.gap-row{display:grid;grid-template-columns:150px 1fr 58px;align-items:center;gap:12px}.gap-row>span{font-size:13px;font-weight:600}.gap-row>div{height:14px;border-radius:7px;background:#edf0f4;overflow:hidden}.gap-row i{display:block;height:100%;border-radius:7px;background:var(--secondary-teal)}.gap-row i.risk{background:var(--accent-coral)}.gap-row strong{text-align:right;font-size:13px;color:var(--secondary-teal)}.risk-text{color:var(--accent-coral)!important}.distribution-chart{padding:18px 22px}.distribution-legend{display:flex;gap:18px;font-size:12px;color:var(--text-muted)}.distribution-legend span{display:flex;align-items:center;gap:6px}.distribution-legend i{width:10px;height:10px;border-radius:2px}.female{background:var(--secondary-teal)}.male{background:var(--primary-indigo)}.other{background:var(--warning-amber)}.distribution-columns{height:225px;display:grid;grid-template-columns:repeat(5,1fr);gap:10px;border-bottom:1px solid var(--border-light);align-items:end;padding-top:15px}.distribution-column{height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center}.bars{height:175px;width:100%;display:flex;align-items:flex-end;justify-content:center;gap:4px}.bars i{display:block;width:18%;min-width:9px;border-radius:4px 4px 0 0}.distribution-column>span{font-size:11px;color:var(--text-muted);height:32px;padding-top:8px;text-align:center}.pay-lower{display:grid;grid-template-columns:1fr;gap:12px}.disparity-table{overflow-x:auto}.disparity-head,.disparity-row{min-width:880px;display:grid;grid-template-columns:1.1fr 1.45fr .7fr .8fr .55fr .55fr;align-items:center;gap:10px;padding:14px 20px}.disparity-head{background:var(--neutral-bg);font-size:10px;text-transform:uppercase;font-weight:800;color:var(--text-muted)}.disparity-row{border-top:1px solid var(--border-light);font-size:13px}.disparity-row>div{display:flex;flex-direction:column}.disparity-row small{font-size:11px;color:var(--text-muted);margin-top:3px}.review-badge{display:inline-flex;width:max-content;align-items:center;gap:4px;padding:6px 8px;border-radius:20px;background:#fbe7e4;color:#ad493d;font-size:10px;font-weight:800}.pay-empty{padding:38px;text-align:center;color:var(--text-muted);font-size:13px}.insights-panel{padding:22px;border-radius:20px;background:#252963;color:#fff}.insights-heading{display:flex;align-items:center;gap:10px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,.1)}.insights-heading>i{width:42px;height:42px;border-radius:12px;background:rgba(104,210,189,.12);display:grid;place-items:center;color:#2dd4bf}.insights-heading span{font-size:10px;text-transform:uppercase;color:#2dd4bf;font-weight:800}.insights-heading h2{font-family:var(--font-serif);font-size:24px}.insight{display:flex;gap:11px;padding:17px 0;border-bottom:1px solid rgba(255,255,255,.09)}.insight>i{color:#2dd4bf}.insight strong{font-size:13px}.insight p{font-size:12px;line-height:1.6;color:rgba(255,255,255,.7);margin-top:5px}.method-note{margin-top:16px;padding:14px;border-radius:11px;background:rgba(255,255,255,.055)}.method-note strong{font-size:12px}.method-note p{font-size:11px;line-height:1.55;color:rgba(255,255,255,.58);margin-top:4px}@media(max-width:1000px){.pay-kpis{grid-template-columns:repeat(2,1fr)}.pay-charts,.pay-lower{grid-template-columns:1fr}}@media(max-width:700px){.pay-hero{align-items:flex-start}.pay-filters{align-items:stretch;flex-direction:column}.filter-select{border-left:0;border-top:1px solid var(--border-light);padding:8px 30px 4px 10px}.pay-kpis{grid-template-columns:1fr}.pay-charts{grid-template-columns:1fr}.gap-row{grid-template-columns:115px 1fr 48px}}`;
