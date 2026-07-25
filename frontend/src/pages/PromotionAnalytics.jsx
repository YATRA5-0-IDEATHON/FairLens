import { useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, Filter, Scale, ShieldCheck } from 'lucide-react';
import { useData } from '../context/DataContext';

const ALL = 'All';
const REVIEW_OWNERS = {
  'Engineering & Ops': ['Nora Patel', 'Ethan Brooks'],
  'Product & Design': ['Mina Clarke'],
  'Sales & Marketing': ['Caleb Stone'],
  'Finance & Legal': ['Grace Liu'],
  'Executive Leadership': ['Board Committee'],
  'HR & People': ['Elena Rostova'],
};
const average = values => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

export default function PromotionAnalytics() {
  const { employees } = useData();
  const people = useMemo(() => employees.map((employee, index) => enrich(employee, index)), [employees]);
  const [department, setDepartment] = useState(ALL);
  const [level, setLevel] = useState(ALL);
  const [manager, setManager] = useState(ALL);
  const departments = useMemo(() => choices(people, 'department'), [people]);
  const levels = useMemo(() => choices(people, 'level'), [people]);
  const managers = useMemo(() => choices(people.filter(item => department === ALL || item.department === department), 'manager'), [people, department]);
  const scoped = useMemo(() => people.filter(item => (
    (department === ALL || item.department === department)
    && (level === ALL || item.level === level)
    && (manager === ALL || item.manager === manager)
  )), [people, department, level, manager]);
  const analysis = useMemo(() => analyze(scoped), [scoped]);
  const updateDepartment = value => { setDepartment(value); setManager(ALL); };

  return (
    <div className="gender-promo-page">
      <header className="gender-promo-hero">
        <div><span><ShieldCheck size={14} /> Gender advancement equity</span><h1>Promotion Fairness Analytics</h1><p>Compare whether women and men with similar performance and time in role receive equal promotion recommendations.</p></div>
        <div className="gender-promo-score" style={{ '--score': `${analysis.score * 3.6}deg` }}><strong>{analysis.score}</strong><span>Gender fairness</span></div>
      </header>

      <section className="gender-promo-filters">
        <div><Filter size={16} /><strong>Scope</strong><span>{scoped.length} employees</span></div>
        <Select label="Department" value={department} setValue={updateDepartment} values={departments} />
        <Select label="Job level" value={level} setValue={setLevel} values={levels} />
        <Select label="Review owner" value={manager} setValue={setManager} values={managers} />
      </section>

      <section className="gender-promo-kpis">
        <Kpi label="Gender fairness score" value={`${analysis.score}/100`} detail={`Recommendation-rate gap: ${analysis.rateGap.toFixed(1)} points`} tone={analysis.score >= 90 ? 'good' : 'risk'} />
        <Kpi label="Women recommended" value={rateLabel(analysis.female)} detail={`${analysis.female.recommended} of ${analysis.female.eligible} eligible women`} tone="female" />
        <Kpi label="Men recommended" value={rateLabel(analysis.male)} detail={`${analysis.male.recommended} of ${analysis.male.eligible} eligible men`} tone="male" />
        <Kpi label="Women’s wait-time difference" value={`${analysis.waitDelta >= 0 ? '+' : ''}${analysis.waitDelta.toFixed(1)} mo`} detail="Compared with recommended men" tone={Math.abs(analysis.waitDelta) > 4 ? 'risk' : 'good'} />
      </section>

      <article className="gender-promo-card comparison-card">
        <Title title="Women versus men: advancement opportunity" subtitle="Recommendation rate and average time in role among promotion-eligible employees" />
        <div className="gender-comparison">
          {[['Women', analysis.female, 'female'], ['Men', analysis.male, 'male']].map(([label, item, className]) => (
            <div className="gender-comparison-row" key={label}>
              <strong>{label}<small>{item.eligible} eligible employees</small></strong>
              <div className="comparison-measure"><span>Recommended</span><i><b className={className} style={{ width: `${item.rate}%` }} /></i><em>{item.eligible ? `${item.rate.toFixed(1)}%` : 'N/A'}</em></div>
              <div className="comparison-measure"><span>Avg. wait</span><i><b className={className} style={{ width: `${Math.min(100, item.wait / 48 * 100)}%` }} /></i><em>{item.wait ? `${item.wait.toFixed(1)} mo` : 'N/A'}</em></div>
            </div>
          ))}
        </div>
      </article>

      <article className="gender-promo-card">
        <Title title="Departments requiring gender-equity review" subtitle="Recommendation outcomes, wait time, and statistical disparity by department" />
        <div className="department-equity-list">
          {analysis.departments.map(item => (
            <div className="department-equity-item" key={item.department}>
              <div className="department-equity-heading">
                <div><strong>{item.department}</strong><span>{item.eligible} promotion-eligible employees</span></div>
                <Status value={item.status} />
              </div>
              <div className="department-gender-bars">
                <div>
                  <span><i className="female-dot" />Women <small>{item.female.recommended} of {item.female.eligible} eligible</small></span>
                  <div><b className="female-bar" style={{ width: `${item.female.rate}%` }} /></div>
                  <strong>{rateLabel(item.female)}</strong>
                </div>
                <div>
                  <span><i className="male-dot" />Men <small>{item.male.recommended} of {item.male.eligible} eligible</small></span>
                  <div><b className="male-bar" style={{ width: `${item.male.rate}%` }} /></div>
                  <strong>{rateLabel(item.male)}</strong>
                </div>
              </div>
              <div className="department-equity-metrics">
                <span>Recommendation gap <strong className={item.rateGap > 15 ? 'gap-risk' : ''}>{item.rateGap.toFixed(1)} points</strong></span>
                <span>Average eligible wait <strong>{item.wait.toFixed(1)} months</strong></span>
                <span>Statistical disparity <strong>{item.significant ? 'Detected' : 'Not detected'}</strong></span>
              </div>
            </div>
          ))}
          {!analysis.departments.length && <Empty text="No department has enough eligible employee data in this scope." />}
        </div>
        <div className="equity-legend">
          <Legend tone="healthy" title="Flow Healthy" text="Conversion ≥ 80%, wait ≤ 36 months, no significant gender gap." />
          <Legend tone="review" title="Needs Review" text="Conversion 60–79% or wait between 36–48 months." />
          <Legend tone="blocked" title="Promotion Bottleneck" text="Conversion < 60%, wait > 48 months, or significant gender disparity." />
        </div>
      </article>

      <article className="gender-promo-card">
        <Title title="Promotion-eligible employee evidence" subtitle="Employees with at least 18 months in role and a performance rating of 4.4 or higher" />
        <div className="candidate-table">
          <div className="candidate-head"><span>Employee</span><span>Gender</span><span>Department / level</span><span>Time in role</span><span>Performance</span><span>Recommendation</span><span>Gender disparity check</span></div>
          {analysis.eligible.map(item => (
            <div className="candidate-row" key={item.id}>
              <div><strong>{item.name}</strong><small>{item.id}</small></div><span>{item.gender}</span>
              <div><strong>{item.department}</strong><small>{item.role} · {item.level}</small></div>
              <span>{(item.monthsInRole / 12).toFixed(1)} years</span><strong>{item.performanceRating}/5</strong>
              <span className={`recommendation ${item.recommended ? 'ready' : ''}`}>{item.recommendation}</span>
              <span className={`disparity ${item.disparity ? 'flagged' : ''}`}>{item.disparity ? <><AlertTriangle size={12} /> Longer wait than gender peers</> : 'No disparity detected'}</span>
            </div>
          ))}
          {!analysis.eligible.length && <Empty text="No employees meet the promotion-review criteria in this scope." />}
        </div>
      </article>

      <div className="gender-promo-note"><Scale size={16} /><p>The employee dataset does not contain completed promotion decisions. Recommendations are decision-support signals based on recorded performance and time in role; completed promotions must be added as a separate historical dataset before reporting actual promotion rates.</p></div>
      <style>{styles}</style>
    </div>
  );
}

function enrich(employee, index) {
  const owners = REVIEW_OWNERS[employee.department] || ['People Review Panel'];
  const eligible = employee.level !== 'L6' && (employee.monthsInRole || 0) >= 18 && (employee.performanceRating || 0) >= 4.4;
  const recommended = eligible && employee.performanceRating >= 4.5;
  return {
    ...employee, manager: owners[index % owners.length], eligible, recommended,
    recommendation: recommended ? (employee.performanceRating >= 4.8 ? 'Strongly recommend' : 'Recommend') : eligible ? 'Calibration review' : 'Not eligible',
  };
}

function analyze(people) {
  const outcome = (list, gender) => {
    const eligible = list.filter(item => item.gender === gender && item.eligible);
    const recommended = eligible.filter(item => item.recommended);
    return {
      eligible: eligible.length, recommended: recommended.length,
      rate: eligible.length ? recommended.length / eligible.length * 100 : 0,
      wait: average(recommended.map(item => item.monthsInRole)),
    };
  };
  const female = outcome(people, 'Female');
  const male = outcome(people, 'Male');
  const rateGap = female.eligible && male.eligible ? Math.abs(female.rate - male.rate) : 0;
  const waitDelta = female.wait && male.wait ? female.wait - male.wait : 0;
  const score = Math.max(0, Math.min(100, Math.round(100 - rateGap * .7 - Math.abs(waitDelta) * 1.5)));
  const genderWait = {
    Female: average(people.filter(item => item.gender === 'Female' && item.eligible).map(item => item.monthsInRole)),
    Male: average(people.filter(item => item.gender === 'Male' && item.eligible).map(item => item.monthsInRole)),
  };
  const departments = [...new Set(people.map(item => item.department).filter(Boolean))].map(department => {
    const departmentPeople = people.filter(item => item.department === department);
    const departmentFemale = outcome(departmentPeople, 'Female');
    const departmentMale = outcome(departmentPeople, 'Male');
    const eligible = departmentPeople.filter(item => item.eligible);
    const recommended = eligible.filter(item => item.recommended);
    const conversion = eligible.length ? recommended.length / eligible.length * 100 : 0;
    const wait = average(eligible.map(item => item.monthsInRole));
    const departmentGap = departmentFemale.eligible && departmentMale.eligible ? Math.abs(departmentFemale.rate - departmentMale.rate) : 0;
    const significant = significantGap(departmentFemale, departmentMale);
    const status = conversion < 60 || wait > 48 || significant ? 'Promotion Bottleneck' : conversion >= 80 && wait <= 36 ? 'Flow Healthy' : 'Needs Review';
    return { department, female: departmentFemale, male: departmentMale, rateGap: departmentGap, wait, status, eligible: eligible.length, significant };
  }).filter(item => item.eligible).sort((a, b) => statusRank(b.status) - statusRank(a.status) || b.rateGap - a.rateGap);
  const eligible = people.filter(item => item.eligible).map(item => ({
    ...item,
    disparity: ['Female', 'Male'].includes(item.gender) && genderWait[item.gender] && item.monthsInRole - genderWait[item.gender] > 6 && item.performanceRating >= 4.6,
  })).sort((a, b) => Number(b.disparity) - Number(a.disparity) || b.performanceRating - a.performanceRating);
  return { female, male, rateGap, waitDelta, score, departments, eligible };
}

function significantGap(first, second) {
  if (first.eligible < 2 || second.eligible < 2) return false;
  const pooled = (first.recommended + second.recommended) / (first.eligible + second.eligible);
  const standardError = Math.sqrt(pooled * (1 - pooled) * (1 / first.eligible + 1 / second.eligible));
  return standardError > 0 && Math.abs(first.recommended / first.eligible - second.recommended / second.eligible) / standardError >= 1.96;
}
const choices = (items, field) => [ALL, ...new Set(items.map(item => item[field]).filter(Boolean))];
const rateLabel = item => item.eligible ? `${item.rate.toFixed(1)}%` : 'N/A';
const statusRank = status => status === 'Promotion Bottleneck' ? 3 : status === 'Needs Review' ? 2 : 1;
function Select({ label, value, setValue, values }) {
  return <label className="gender-promo-select"><span>{label}</span><select value={value} onChange={event => setValue(event.target.value)}>{values.map(item => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>;
}
function Kpi({ label, value, detail, tone }) {
  return <article className={`gender-promo-kpi ${tone}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}
function Title({ title, subtitle }) {
  return <div className="gender-promo-title"><h2>{title}</h2><p>{subtitle}</p></div>;
}
function Status({ value }) {
  return <span className={`flow-status ${value.toLowerCase().replace(/\s+/g, '-')}`}>{value}</span>;
}
function Legend({ tone, title, text }) {
  return <div><i className={tone} /><span><strong>{title}</strong>{text}</span></div>;
}
function Empty({ text }) {
  return <div className="gender-promo-empty">{text}</div>;
}

const styles = `
.gender-promo-page{display:flex;flex-direction:column;gap:18px}.gender-promo-hero{display:flex;align-items:center;justify-content:space-between;gap:30px;padding:31px 36px;border-radius:24px;background:linear-gradient(120deg,#252963,#343b82);color:#fff}.gender-promo-hero>div:first-child>span{display:flex;align-items:center;gap:6px;color:#70d6c4;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.09em}.gender-promo-hero h1{font-family:var(--font-serif);font-size:38px;margin:8px 0 5px}.gender-promo-hero p{max-width:780px;font-size:15px;line-height:1.55;color:rgba(255,255,255,.72)}.gender-promo-score{width:115px;height:115px;border-radius:50%;flex:0 0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle closest-side,#2d3270 76%,transparent 78% 99%),conic-gradient(#68d2bd var(--score),rgba(255,255,255,.13) 0)}.gender-promo-score strong{font-size:32px}.gender-promo-score span{font-size:10px;color:rgba(255,255,255,.72)}.gender-promo-filters{display:flex;align-items:center;gap:7px;padding:13px;border:1px solid var(--border-light);border-radius:15px;background:#fff;overflow-x:auto}.gender-promo-filters>div{display:flex;align-items:center;gap:7px;padding:0 9px;white-space:nowrap}.gender-promo-filters>div strong{font-size:13px}.gender-promo-filters>div span{font-size:11px;color:var(--text-muted)}.gender-promo-select{position:relative;min-width:170px;border-left:1px solid var(--border-light);padding:2px 28px 2px 11px}.gender-promo-select span{display:block;font-size:10px;text-transform:uppercase;color:var(--text-muted);font-weight:700}.gender-promo-select select{width:100%;border:0;outline:0;appearance:none;background:transparent;padding-top:4px;font-size:13px;font-weight:600}.gender-promo-select svg{position:absolute;right:7px;top:50%;pointer-events:none}.gender-promo-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.gender-promo-kpi{padding:20px 22px;border:1px solid var(--border-light);border-radius:17px;background:#fff}.gender-promo-kpi>span{font-size:11px;text-transform:uppercase;color:var(--text-muted);font-weight:700}.gender-promo-kpi strong{display:block;font-size:26px;color:var(--primary-indigo);margin:7px 0 3px}.gender-promo-kpi small{font-size:12px;color:var(--text-muted)}.gender-promo-kpi.good,.gender-promo-kpi.female{border-top:3px solid var(--secondary-teal)}.gender-promo-kpi.risk{border-top:3px solid var(--accent-coral)}.gender-promo-kpi.male{border-top:3px solid var(--primary-indigo)}.gender-promo-card{background:#fff;border:1px solid var(--border-light);border-radius:20px;overflow:hidden}.gender-promo-title{padding:19px 21px;border-bottom:1px solid var(--border-light)}.gender-promo-title h2{font-size:18px;color:var(--primary-indigo)}.gender-promo-title p{font-size:12px;color:var(--text-muted);margin-top:4px}.gender-comparison{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border-light)}.gender-comparison-row{padding:24px;background:#fff;display:flex;flex-direction:column;gap:17px}.gender-comparison-row>strong{font-size:18px;color:var(--primary-indigo);display:flex;justify-content:space-between}.gender-comparison-row small{font-size:11px;color:var(--text-muted);font-weight:400}.comparison-measure{display:grid;grid-template-columns:105px 1fr 75px;align-items:center;gap:12px}.comparison-measure>span{font-size:12px;color:var(--text-muted)}.comparison-measure>i{height:17px;border-radius:9px;background:#edf0f4;overflow:hidden}.comparison-measure b{display:block;height:100%;border-radius:9px}.comparison-measure b.female{background:var(--secondary-teal)}.comparison-measure b.male{background:var(--primary-indigo)}.comparison-measure em{font-size:13px;font-weight:700;font-style:normal;text-align:right}.equity-table,.candidate-table{overflow-x:auto}.equity-head,.equity-row{min-width:1050px;display:grid;grid-template-columns:1.35fr .8fr .8fr .8fr .65fr .65fr 1fr;align-items:center;gap:13px;padding:14px 20px}.equity-head,.candidate-head{background:var(--neutral-bg);font-size:10px;text-transform:uppercase;font-weight:800;color:var(--text-muted)}.equity-row{border-top:1px solid var(--border-light);font-size:13px}.equity-row>strong:first-child{color:var(--primary-indigo)}.gap-risk{color:var(--accent-coral)}.flow-status{display:inline-flex;width:max-content;padding:6px 9px;border-radius:20px;font-size:10px;font-weight:800}.flow-status.flow-healthy{background:#e2f5f0;color:#26796b}.flow-status.needs-review{background:#fff2d8;color:#906814}.flow-status.promotion-bottleneck{background:#fbe7e4;color:#ab493d}.equity-legend{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:16px 20px;border-top:1px solid var(--border-light);background:#fafbfe}.equity-legend>div{display:flex;align-items:flex-start;gap:8px}.equity-legend>div>i{width:10px;height:10px;border-radius:50%;margin-top:4px;flex:0 0 auto}.equity-legend i.healthy{background:#3fa796}.equity-legend i.review{background:#e1ad4b}.equity-legend i.blocked{background:#e36c5b}.equity-legend span{font-size:10px;line-height:1.45;color:var(--text-muted)}.equity-legend strong{display:block;font-size:11px;color:var(--text-dark)}.candidate-head,.candidate-row{min-width:1110px;display:grid;grid-template-columns:1fr .55fr 1.4fr .65fr .55fr .9fr 1.25fr;align-items:center;gap:13px;padding:14px 20px}.candidate-row{border-top:1px solid var(--border-light);font-size:13px}.candidate-row>div{display:flex;flex-direction:column}.candidate-row small{font-size:10px;color:var(--text-muted);margin-top:3px}.recommendation{display:inline-flex;width:max-content;padding:6px 8px;border-radius:20px;font-size:10px;font-weight:800;background:#fff2d8;color:#906814}.recommendation.ready{background:#e2f5f0;color:#26796b}.disparity{display:inline-flex;align-items:center;gap:5px;font-size:11px;color:#377e71}.disparity.flagged{color:#b04b3f;font-weight:700}.gender-promo-empty{padding:38px;text-align:center;color:var(--text-muted);font-size:13px}.gender-promo-note{display:flex;align-items:flex-start;gap:9px;padding:15px 17px;border:1px solid #dddff0;border-radius:13px;background:#f7f8fd;color:var(--text-muted)}.gender-promo-note svg{color:var(--primary-indigo);flex:0 0 auto}.gender-promo-note p{font-size:12px;line-height:1.55}.department-equity-list{display:flex;flex-direction:column}.department-equity-item{padding:22px 24px;border-bottom:1px solid var(--border-light)}.department-equity-item:last-child{border-bottom:0}.department-equity-item:hover{background:#fafbff}.department-equity-heading{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:20px}.department-equity-heading>div{display:flex;flex-direction:column}.department-equity-heading>div>strong{font-size:17px;color:var(--primary-indigo)}.department-equity-heading>div>span{font-size:11px;color:var(--text-muted);margin-top:3px}.department-gender-bars{display:grid;grid-template-columns:1fr 1fr;gap:28px}.department-gender-bars>div{display:grid;grid-template-columns:145px 1fr 60px;align-items:center;gap:12px}.department-gender-bars span{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:700}.department-gender-bars span small{display:block;font-size:10px;font-weight:400;color:var(--text-muted);margin-left:auto}.department-gender-bars span>i{width:10px;height:10px;border-radius:50%;flex:0 0 auto}.female-dot,.female-bar{background:var(--secondary-teal)}.male-dot,.male-bar{background:var(--primary-indigo)}.department-gender-bars>div>div{height:20px;border-radius:10px;background:#edf0f4;overflow:hidden}.department-gender-bars b{display:block;height:100%;border-radius:10px;min-width:0}.department-gender-bars>div>strong{text-align:right;font-size:14px}.department-equity-metrics{display:flex;align-items:center;gap:28px;margin-top:17px;padding:12px 14px;border-radius:10px;background:var(--neutral-bg)}.department-equity-metrics>span{font-size:11px;color:var(--text-muted)}.department-equity-metrics strong{color:var(--text-dark);margin-left:4px}.department-equity-metrics .gap-risk{color:var(--accent-coral)}@media(max-width:900px){.gender-promo-kpis{grid-template-columns:repeat(2,1fr)}.gender-comparison{grid-template-columns:1fr}.equity-legend{grid-template-columns:1fr}.department-gender-bars{grid-template-columns:1fr}.department-equity-metrics{align-items:flex-start;flex-direction:column;gap:7px}}@media(max-width:650px){.gender-promo-hero{align-items:flex-start}.gender-promo-filters{align-items:stretch;flex-direction:column}.gender-promo-select{border-left:0;border-top:1px solid var(--border-light);padding:8px 28px 4px 10px}.gender-promo-kpis{grid-template-columns:1fr}}`;
