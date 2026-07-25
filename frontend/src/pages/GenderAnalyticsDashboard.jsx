import { Fragment, useMemo, useState } from 'react';
import { ArrowUpDown, BarChart3, ChevronDown, ChevronRight, Search, Users, X } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function GenderAnalyticsDashboard() {
  const { employees } = useData();
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [query, setQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('All genders');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [sortBy, setSortBy] = useState('name');

  const departments = useMemo(() => {
    const grouped = employees.reduce((result, employee) => {
      const department = employee.department || employee.branch || 'Unassigned';
      result[department] ||= [];
      result[department].push(employee);
      return result;
    }, {});
    return Object.entries(grouped).map(([name, people]) => {
      const count = gender => people.filter(person => person.gender === gender).length;
      const total = people.length;
      const male = count('Male');
      const female = count('Female');
      const nonBinary = count('Non-Binary');
      const unspecified = total - male - female - nonBinary;
      const percentage = value => total ? Math.round(value / total * 100) : 0;
      const gap = Math.abs(percentage(male) - percentage(female));
      return {
        name, people, total, male, female, nonBinary, unspecified, gap,
        malePct: percentage(male), femalePct: percentage(female),
        nonBinaryPct: percentage(nonBinary), unspecifiedPct: percentage(unspecified),
        status: gap <= 10 ? 'Balanced' : gap <= 20 ? 'Monitor' : 'Gap flagged',
      };
    }).sort((a, b) => b.total - a.total);
  }, [employees]);

  const activeDepartment = departments.find(department => department.name === selectedDepartment);
  const genders = useMemo(() => ['All genders', ...new Set((activeDepartment?.people || []).map(employee => employee.gender).filter(Boolean))], [activeDepartment]);
  const statuses = useMemo(() => ['All statuses', ...new Set((activeDepartment?.people || []).map(employee => employee.status || 'Active'))], [activeDepartment]);

  const visibleEmployees = useMemo(() => (activeDepartment?.people || [])
    .filter(employee => genderFilter === 'All genders' || employee.gender === genderFilter)
    .filter(employee => statusFilter === 'All statuses' || (employee.status || 'Active') === statusFilter)
    .filter(employee => `${employee.name} ${employee.id} ${employee.role || ''} ${employee.level || ''}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'salary') return (b.salary || 0) - (a.salary || 0);
      if (sortBy === 'performance') return (b.performanceRating || 0) - (a.performanceRating || 0);
      if (sortBy === 'experience') return (b.experienceYears || 0) - (a.experienceYears || 0);
      if (sortBy === 'gender') return String(a.gender || '').localeCompare(String(b.gender || ''));
      return String(a.name || '').localeCompare(String(b.name || ''));
    }), [activeDepartment, genderFilter, statusFilter, query, sortBy]);

  const openDepartment = name => {
    setSelectedDepartment(current => current === name ? null : name);
    setQuery('');
    setGenderFilter('All genders');
    setStatusFilter('All statuses');
  };

  return (
    <div className="equity-page">
      <header className="equity-header">
        <div>
          <span><BarChart3 size={14} /> Live workforce dataset</span>
          <h1>Department Diversity Breakdown Heatmap</h1>
          <p>Select a department to inspect the employees behind every percentage.</p>
        </div>
        <div><strong>{employees.length}</strong><span>employees</span><strong>{departments.length}</strong><span>departments</span></div>
      </header>

      <section className="heatmap-panel">
        <div className="heatmap-legend">
          <div><i className="male" /> Male</div><div><i className="female" /> Female</div>
          <div><i className="nonbinary" /> Non-binary</div><div><i className="unspecified" /> Unspecified</div>
          <span>Calculated from {employees.length} employee records</span>
        </div>
        <div className="department-heatmap">
          {departments.map(department => (
            <Fragment key={department.name}>
              <button onClick={() => openDepartment(department.name)} className={selectedDepartment === department.name ? 'active' : ''} aria-expanded={selectedDepartment === department.name}>
                <div className="department-title">
                  <div><strong>{department.name}</strong><span>{department.total} employees</span></div>
                  <Status value={department.status} />
                  {selectedDepartment === department.name ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                </div>
                <div className="distribution-bar" aria-label={`${department.name} gender distribution`}>
                  {!!department.malePct && <i className="male" style={{ width: `${department.malePct}%` }} />}
                  {!!department.femalePct && <i className="female" style={{ width: `${department.femalePct}%` }} />}
                  {!!department.nonBinaryPct && <i className="nonbinary" style={{ width: `${department.nonBinaryPct}%` }} />}
                  {!!department.unspecifiedPct && <i className="unspecified" style={{ width: `${department.unspecifiedPct}%` }} />}
                </div>
                <div className="distribution-labels">
                  <span><b>{department.malePct}%</b> male</span>
                  <span><b>{department.femalePct}%</b> female</span>
                  <span><b>{department.nonBinaryPct}%</b> non-binary</span>
                  {!!department.unspecified && <span><b>{department.unspecifiedPct}%</b> unspecified</span>}
                </div>
              </button>
              {selectedDepartment === department.name && activeDepartment && (
                <DepartmentEmployees
                  department={activeDepartment}
                  visibleEmployees={visibleEmployees}
                  query={query}
                  setQuery={setQuery}
                  genderFilter={genderFilter}
                  setGenderFilter={setGenderFilter}
                  genders={genders}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  statuses={statuses}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  onClose={() => setSelectedDepartment(null)}
                />
              )}
            </Fragment>
          ))}
        </div>
      </section>
      <style>{styles}</style>
    </div>
  );
}

function DepartmentEmployees({
  department, visibleEmployees, query, setQuery, genderFilter, setGenderFilter,
  genders, statusFilter, setStatusFilter, statuses, sortBy, setSortBy, onClose,
}) {
  return (
    <section className="department-drawer">
      <div className="drawer-heading">
        <div><span>Expanded department</span><h2>{department.name}</h2><p>{visibleEmployees.length} of {department.total} employees shown</p></div>
        <button onClick={onClose} aria-label="Collapse department details"><X size={18} /></button>
      </div>
      <div className="employee-toolbar">
        <label className="employee-search"><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search name, ID, role or level…" /></label>
        <select value={genderFilter} onChange={event => setGenderFilter(event.target.value)}>{genders.map(gender => <option key={gender}>{gender}</option>)}</select>
        <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>{statuses.map(status => <option key={status}>{status}</option>)}</select>
        <label className="sort-control"><ArrowUpDown size={14} /><select value={sortBy} onChange={event => setSortBy(event.target.value)}><option value="name">Name A–Z</option><option value="gender">Gender</option><option value="performance">Performance</option><option value="experience">Experience</option><option value="salary">Salary</option></select></label>
      </div>
      <div className="employee-table">
        <div className="employee-table-head"><span>Employee</span><span>Gender</span><span>Role</span><span>Level</span><span>Experience</span><span>Performance</span><span>Status</span></div>
        {visibleEmployees.map(employee => (
          <div className="employee-row" key={employee.id}>
            <div className="employee-identity"><i><Users size={14} /></i><span><strong>{employee.name}</strong><small>{employee.id}</small></span></div>
            <span><Gender value={employee.gender} /></span>
            <span>{employee.role || 'Not specified'}</span>
            <span>{employee.level || '—'}</span>
            <span>{employee.experienceYears != null ? `${employee.experienceYears} yrs` : '—'}</span>
            <span>{employee.performanceRating != null ? `${employee.performanceRating}/5` : 'Not rated'}</span>
            <span className="employee-status">{employee.status || 'Active'}</span>
          </div>
        ))}
        {!visibleEmployees.length && <div className="employee-empty">No employees match the selected filters.</div>}
      </div>
    </section>
  );
}

function Status({ value }) {
  return <span className={`parity-status ${value.toLowerCase().replace(/\s+/g, '-')}`}>{value}</span>;
}
function Gender({ value = 'Unspecified' }) {
  return <span className={`gender-chip ${value.toLowerCase().replace(/\s+/g, '-')}`}><i />{value}</span>;
}

const styles = `
.equity-page{display:flex;flex-direction:column;gap:20px}.equity-header{display:flex;align-items:flex-end;justify-content:space-between;gap:25px;padding:30px 34px;border-radius:24px;background:linear-gradient(120deg,#252964,#343b83);color:#fff}.equity-header>div:first-child>span{display:flex;align-items:center;gap:6px;text-transform:uppercase;letter-spacing:.09em;font-size:12px;font-weight:800;color:#6ed6c4}.equity-header h1{font-family:var(--font-serif);font-size:38px;margin:8px 0 5px}.equity-header p{font-size:15px;line-height:1.5;color:rgba(255,255,255,.75)}.equity-header>div:last-child{display:grid;grid-template-columns:auto auto;gap:4px 9px;align-items:baseline}.equity-header>div:last-child strong{font-size:28px;text-align:right}.equity-header>div:last-child span{font-size:12px;color:rgba(255,255,255,.72);text-transform:uppercase}.heatmap-panel,.department-drawer{background:#fff;border:1px solid var(--border-light);border-radius:22px;overflow:hidden;box-shadow:0 10px 35px rgba(31,36,82,.055)}.heatmap-legend{display:flex;align-items:center;gap:22px;padding:19px 24px;border-bottom:1px solid var(--border-light);font-size:14px;color:var(--text-muted)}.heatmap-legend div{display:flex;align-items:center;gap:7px}.heatmap-legend i{width:12px;height:12px;border-radius:3px}.heatmap-legend>span{margin-left:auto;font-size:13px}.male{background:#535aa3}.female{background:#3fa796}.nonbinary{background:#e6ad48}.unspecified{background:#b7bcc9}.department-heatmap{display:flex;flex-direction:column;background:#fff}.department-heatmap>button{width:100%;border:0;border-bottom:1px solid var(--border-light);background:#fff;padding:26px 30px;text-align:left;cursor:pointer;transition:.2s}.department-heatmap>button:last-child{border-bottom:0}.department-heatmap>button:hover,.department-heatmap>button.active{background:#f7f9ff;box-shadow:inset 5px 0 var(--secondary-teal)}.department-heatmap>.department-drawer{width:100%;border:0;border-bottom:1px solid var(--border-light);border-radius:0;background:#fbfcff;box-shadow:inset 0 10px 24px rgba(31,36,82,.035);animation:accordionOpen .22s ease-out}.department-title{display:flex;align-items:center;gap:12px}.department-title>div:first-child{display:flex;flex-direction:column;flex:1}.department-title strong{font-size:20px;color:var(--primary-indigo)}.department-title span{font-size:14px;color:var(--text-muted);margin-top:4px}.parity-status{padding:7px 11px;border-radius:20px;font-size:11px;font-weight:800;text-transform:uppercase;background:#e4f4ef;color:#27786b}.parity-status.monitor{background:#fff3d8;color:#956e14}.parity-status.gap-flagged{background:#fbe7e4;color:#ad493d}.distribution-bar{height:22px;display:flex;overflow:hidden;border-radius:10px;background:#eef0f4;margin:20px 0 12px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.04)}.distribution-bar i{display:block;height:100%}.distribution-labels{display:grid;grid-template-columns:repeat(4,minmax(100px,1fr));gap:12px}.distribution-labels span{font-size:14px;color:var(--text-muted)}.distribution-labels b{font-size:16px;color:var(--text-dark);margin-right:3px}.drawer-heading{padding:22px 24px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-light)}.drawer-heading span{font-size:11px;text-transform:uppercase;color:var(--secondary-teal);font-weight:800;letter-spacing:.08em}.drawer-heading h2{font-family:var(--font-serif);font-size:28px;color:var(--primary-indigo);margin:4px 0}.drawer-heading p{font-size:13px;color:var(--text-muted)}.drawer-heading button{width:38px;height:38px;border:1px solid var(--border-light);border-radius:10px;background:#fff;display:grid;place-items:center;cursor:pointer;color:var(--text-muted)}.employee-toolbar{display:flex;gap:8px;padding:14px;border-bottom:1px solid var(--border-light)}.employee-toolbar select,.employee-search{border:1px solid var(--border-light);border-radius:10px;background:#fff;padding:10px 12px;color:var(--text-dark);font-size:13px}.employee-search{display:flex;align-items:center;gap:7px;flex:1}.employee-search input{border:0;outline:0;width:100%;font-size:13px}.sort-control{display:flex;align-items:center;border:1px solid var(--border-light);border-radius:10px;padding-left:8px}.sort-control select{border:0}.employee-table{overflow-x:auto}.employee-table-head,.employee-row{display:grid;grid-template-columns:1.25fr .7fr 1.35fr .45fr .65fr .7fr .55fr;min-width:980px;align-items:center;gap:12px;padding:15px 20px}.employee-table-head{background:var(--neutral-bg);font-size:11px;text-transform:uppercase;color:var(--text-muted);font-weight:800}.employee-row{border-top:1px solid var(--border-light);font-size:14px}.employee-row:hover{background:#fafbff}.employee-identity{display:flex;align-items:center;gap:9px}.employee-identity>i{width:36px;height:36px;display:grid;place-items:center;border-radius:9px;background:#eef0fb;color:var(--primary-indigo)}.employee-identity>span{display:flex;flex-direction:column}.employee-identity small{font-size:11px;color:var(--text-muted);margin-top:3px}.gender-chip{display:inline-flex;align-items:center;gap:6px;font-size:13px}.gender-chip i{width:8px;height:8px;border-radius:50%;background:#b7bcc9}.gender-chip.male i{background:#535aa3}.gender-chip.female i{background:#3fa796}.gender-chip.non-binary i{background:#e6ad48}.employee-status{display:inline-flex;width:max-content;padding:5px 8px;border-radius:20px;background:#e4f4ef;color:#27786b;font-size:12px;font-weight:700}.employee-empty{text-align:center;padding:38px;color:var(--text-muted);font-size:14px}@keyframes accordionOpen{from{opacity:0;transform:translateY(-7px)}to{opacity:1;transform:translateY(0)}}@media(max-width:850px){.equity-header{align-items:flex-start;flex-direction:column}.heatmap-legend{flex-wrap:wrap}.heatmap-legend>span{width:100%;margin-left:0}.distribution-labels{grid-template-columns:repeat(2,1fr)}.employee-toolbar{flex-wrap:wrap}.employee-search{flex-basis:100%}}`;
