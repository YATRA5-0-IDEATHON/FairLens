import { useMemo, useState } from 'react';
import { Award, BriefcaseBusiness, ChevronDown, Filter, Gauge, TrendingUp, Users } from 'lucide-react';
import { useData } from '../context/DataContext';

const ALL = 'All';
const average = values => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

export default function PerformanceReviewAnalysis() {
  const { employees } = useData();
  const [department, setDepartment] = useState(ALL);
  const [role, setRole] = useState(ALL);
  const [level, setLevel] = useState(ALL);
  const [sortBy, setSortBy] = useState('rating');

  const departments = useMemo(() => choices(employees, 'department'), [employees]);
  const roles = useMemo(() => choices(employees.filter(item => department === ALL || item.department === department), 'role'), [employees, department]);
  const levels = useMemo(() => choices(employees, 'level'), [employees]);
  const filtered = useMemo(() => employees
    .filter(item => (department === ALL || item.department === department) && (role === ALL || item.role === role) && (level === ALL || item.level === level))
    .sort((a, b) => {
      if (sortBy === 'tenure') return (b.monthsInRole || 0) - (a.monthsInRole || 0);
      if (sortBy === 'experience') return (b.experienceYears || 0) - (a.experienceYears || 0);
      if (sortBy === 'name') return String(a.name).localeCompare(String(b.name));
      return (b.performanceRating || 0) - (a.performanceRating || 0);
    }), [employees, department, role, level, sortBy]);

  const stats = useMemo(() => calculateStats(filtered), [filtered]);
  const updateDepartment = value => { setDepartment(value); setRole(ALL); };

  return (
    <div className="work-page">
      <header className="work-hero">
        <div><span><Gauge size={15} /> Workforce performance</span><h1>Performance Review Analysis</h1><p>Review employee performance using work outcomes recorded in the HR dataset: ratings, experience, role tenure, level, and department benchmarks.</p></div>
        <div className="work-score"><strong>{stats.averageRating.toFixed(1)}</strong><span>Average rating</span><small>out of 5</small></div>
      </header>

      <section className="work-filters">
        <div><Filter size={16} /><strong>Review scope</strong><span>{filtered.length} employees</span></div>
        <Select label="Department" value={department} setValue={updateDepartment} values={departments} />
        <Select label="Role" value={role} setValue={setRole} values={roles} />
        <Select label="Level" value={level} setValue={setLevel} values={levels} />
        <Select label="Sort employees" value={sortBy} setValue={setSortBy} values={['rating', 'tenure', 'experience', 'name']} labels={{ rating: 'Highest rating', tenure: 'Longest in role', experience: 'Most experience', name: 'Name A–Z' }} />
      </section>

      <section className="work-kpis">
        <Kpi icon={Award} label="Average performance" value={`${stats.averageRating.toFixed(2)}/5`} detail="Mean recorded performance rating" tone="indigo" />
        <Kpi icon={TrendingUp} label="High performers" value={stats.highPerformers} detail="Employees rated 4.7 or higher" tone="teal" />
        <Kpi icon={BriefcaseBusiness} label="Average time in role" value={`${stats.averageMonths.toFixed(0)} months`} detail="Context for growth and mobility" tone="amber" />
        <Kpi icon={Users} label="Coaching review" value={stats.coachingReview} detail="Employees rated below 4.5" tone="coral" />
      </section>

      <section className="work-grid">
        <article className="work-card">
          <Title title="Department performance" subtitle="Average employee rating from the current dataset" />
          <div className="department-performance">
            {stats.departments.map(item => (
              <div key={item.department}>
                <span>{item.department}<small>{item.count} employees</small></span>
                <div><i style={{ width: `${item.rating / 5 * 100}%` }} /></div>
                <strong>{item.rating.toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="work-card">
          <Title title="Rating distribution" subtitle="Number of employees in each performance band" />
          <div className="rating-distribution">
            {stats.distribution.map(item => (
              <div key={item.label}>
                <div><i style={{ height: `${item.count ? Math.max(10, item.count / stats.maxDistribution * 100) : 0}%` }} /></div>
                <strong>{item.count}</strong><span>{item.label}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <article className="work-card employee-performance">
        <Title title="Employee performance records" subtitle="Work-related performance details available in the connected employee dataset" />
        <div className="work-table">
          <div className="work-head"><span>Employee</span><span>Department / role</span><span>Level</span><span>Experience</span><span>Time in role</span><span>Rating</span><span>Performance band</span></div>
          {filtered.map(employee => {
            const band = performanceBand(employee.performanceRating);
            return (
              <div className="work-row" key={employee.id}>
                <div><strong>{employee.name}</strong><small>{employee.id}</small></div>
                <div><strong>{employee.department || 'Unassigned'}</strong><small>{employee.role || 'Role not specified'}</small></div>
                <span>{employee.level || '—'}</span>
                <span>{employee.experienceYears != null ? `${employee.experienceYears} years` : '—'}</span>
                <span>{employee.monthsInRole != null ? `${employee.monthsInRole} months` : '—'}</span>
                <strong className="employee-rating">{employee.performanceRating != null ? `${employee.performanceRating}/5` : 'Not rated'}</strong>
                <span className={`performance-band ${band.className}`}>{band.label}</span>
              </div>
            );
          })}
          {!filtered.length && <div className="work-empty">No employee records match these filters.</div>}
        </div>
      </article>
      <style>{styles}</style>
    </div>
  );
}

function calculateStats(employees) {
  const ratings = employees.map(item => item.performanceRating).filter(Number.isFinite);
  const departmentNames = [...new Set(employees.map(item => item.department).filter(Boolean))];
  const departments = departmentNames.map(department => {
    const people = employees.filter(item => item.department === department);
    return { department, count: people.length, rating: average(people.map(item => item.performanceRating).filter(Number.isFinite)) };
  }).sort((a, b) => b.rating - a.rating);
  const ranges = [
    { label: '<4.0', test: value => value < 4 },
    { label: '4.0–4.3', test: value => value >= 4 && value < 4.4 },
    { label: '4.4–4.6', test: value => value >= 4.4 && value < 4.7 },
    { label: '4.7–4.8', test: value => value >= 4.7 && value < 4.9 },
    { label: '4.9–5.0', test: value => value >= 4.9 },
  ];
  const distribution = ranges.map(range => ({ label: range.label, count: ratings.filter(range.test).length }));
  return {
    averageRating: average(ratings),
    highPerformers: ratings.filter(value => value >= 4.7).length,
    coachingReview: ratings.filter(value => value < 4.5).length,
    averageMonths: average(employees.map(item => item.monthsInRole).filter(Number.isFinite)),
    departments,
    distribution,
    maxDistribution: Math.max(1, ...distribution.map(item => item.count)),
  };
}

function performanceBand(rating) {
  if (!Number.isFinite(rating)) return { label: 'Not rated', className: 'neutral' };
  if (rating >= 4.7) return { label: 'High performer', className: 'high' };
  if (rating >= 4.5) return { label: 'Strong performance', className: 'strong' };
  return { label: 'Coaching review', className: 'coaching' };
}
function choices(items, field) {
  return [ALL, ...new Set(items.map(item => item[field]).filter(Boolean))];
}
function Select({ label, value, setValue, values, labels = {} }) {
  return <label className="work-select"><span>{label}</span><select value={value} onChange={event => setValue(event.target.value)}>{values.map(item => <option key={item} value={item}>{labels[item] || item}</option>)}</select><ChevronDown size={14} /></label>;
}
function Kpi({ icon: Icon, label, value, detail, tone }) {
  return <article className={`work-kpi ${tone}`}><i><Icon size={18} /></i><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></article>;
}
function Title({ title, subtitle }) {
  return <div className="work-title"><h2>{title}</h2><p>{subtitle}</p></div>;
}

const styles = `
.work-page{display:flex;flex-direction:column;gap:18px}.work-hero{display:flex;align-items:center;justify-content:space-between;gap:30px;padding:31px 36px;border-radius:24px;background:linear-gradient(120deg,#252963,#343b82);color:#fff}.work-hero>div:first-child>span{display:flex;align-items:center;gap:7px;color:#70d6c4;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.09em}.work-hero h1{font-family:var(--font-serif);font-size:38px;margin:8px 0 5px}.work-hero p{max-width:800px;color:rgba(255,255,255,.74);font-size:15px;line-height:1.55}.work-score{min-width:125px;height:105px;border:1px solid rgba(255,255,255,.13);border-radius:20px;background:rgba(255,255,255,.06);display:flex;flex-direction:column;align-items:center;justify-content:center}.work-score strong{font-size:34px}.work-score span{font-size:11px;color:#70d6c4;font-weight:700}.work-score small{font-size:10px;color:rgba(255,255,255,.55)}.work-filters{display:flex;align-items:center;gap:7px;padding:13px;border:1px solid var(--border-light);border-radius:15px;background:#fff;overflow-x:auto}.work-filters>div{display:flex;align-items:center;gap:7px;padding:0 9px;white-space:nowrap}.work-filters>div strong{font-size:13px}.work-filters>div span{font-size:11px;color:var(--text-muted)}.work-select{position:relative;min-width:155px;border-left:1px solid var(--border-light);padding:2px 28px 2px 11px}.work-select span{display:block;font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700}.work-select select{width:100%;border:0;outline:0;appearance:none;background:transparent;padding-top:4px;font-size:13px;font-weight:600}.work-select svg{position:absolute;right:7px;top:50%;pointer-events:none}.work-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.work-kpi{display:flex;align-items:flex-start;gap:12px;padding:20px;border:1px solid var(--border-light);border-radius:17px;background:#fff}.work-kpi>i{width:40px;height:40px;border-radius:12px;background:#eef0fb;color:var(--primary-indigo);display:grid;place-items:center}.work-kpi.teal>i{background:#e2f5f0;color:#2f8b7c}.work-kpi.amber>i{background:#fff2d8;color:#a57617}.work-kpi.coral>i{background:#fbe7e4;color:#b44c40}.work-kpi>div{display:flex;flex-direction:column}.work-kpi span{font-size:11px;text-transform:uppercase;color:var(--text-muted);font-weight:700}.work-kpi strong{font-size:25px;color:var(--primary-indigo);margin:5px 0 2px}.work-kpi small{font-size:11px;color:var(--text-muted)}.work-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:12px}.work-card{background:#fff;border:1px solid var(--border-light);border-radius:20px;overflow:hidden}.work-title{padding:19px 21px;border-bottom:1px solid var(--border-light)}.work-title h2{font-size:18px;color:var(--primary-indigo)}.work-title p{font-size:12px;color:var(--text-muted);margin-top:4px}.department-performance{padding:20px;display:flex;flex-direction:column;gap:15px}.department-performance>div{display:grid;grid-template-columns:160px 1fr 40px;align-items:center;gap:12px}.department-performance span{font-size:13px;font-weight:600;display:flex;flex-direction:column}.department-performance small{font-size:10px;color:var(--text-muted);font-weight:400}.department-performance>div>div{height:14px;border-radius:8px;background:#edf0f4;overflow:hidden}.department-performance i{display:block;height:100%;border-radius:8px;background:linear-gradient(90deg,var(--primary-indigo),var(--secondary-teal))}.department-performance strong{font-size:13px;color:var(--primary-indigo);text-align:right}.rating-distribution{height:275px;display:grid;grid-template-columns:repeat(5,1fr);align-items:end;gap:12px;padding:20px 24px}.rating-distribution>div{height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center}.rating-distribution>div>div{height:205px;width:70%;display:flex;align-items:flex-end;justify-content:center;border-bottom:1px solid var(--border-light)}.rating-distribution i{display:block;width:70%;border-radius:6px 6px 0 0;background:linear-gradient(#5e67ad,#343b82)}.rating-distribution strong{font-size:13px;color:var(--primary-indigo);margin-top:5px}.rating-distribution span{font-size:10px;color:var(--text-muted)}.work-table{overflow-x:auto}.work-head,.work-row{min-width:1040px;display:grid;grid-template-columns:1.05fr 1.55fr .45fr .65fr .7fr .55fr .8fr;align-items:center;gap:12px;padding:14px 20px}.work-head{background:var(--neutral-bg);font-size:10px;text-transform:uppercase;font-weight:800;color:var(--text-muted)}.work-row{border-top:1px solid var(--border-light);font-size:13px}.work-row:hover{background:#fafbff}.work-row>div{display:flex;flex-direction:column}.work-row small{font-size:11px;color:var(--text-muted);margin-top:3px}.employee-rating{color:var(--primary-indigo)}.performance-band{display:inline-flex;width:max-content;padding:6px 9px;border-radius:20px;font-size:10px;font-weight:800;background:#eef0f4;color:#656b78}.performance-band.high{background:#e2f5f0;color:#277b6d}.performance-band.strong{background:#edf0fb;color:#454d93}.performance-band.coaching{background:#fff2d8;color:#906814}.work-empty{padding:40px;text-align:center;color:var(--text-muted);font-size:13px}@media(max-width:1000px){.work-kpis{grid-template-columns:repeat(2,1fr)}.work-grid{grid-template-columns:1fr}}@media(max-width:650px){.work-hero{align-items:flex-start}.work-filters{align-items:stretch;flex-direction:column}.work-select{border-left:0;border-top:1px solid var(--border-light);padding:8px 28px 4px 10px}.work-kpis{grid-template-columns:1fr}}`;
