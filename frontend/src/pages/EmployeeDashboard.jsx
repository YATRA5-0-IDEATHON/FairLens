import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, FileWarning, LogOut, 
  User, BadgeCheck, Calendar, Clock, MapPin, 
  ChevronLeft, ChevronRight, Briefcase, 
  Activity, Trophy, TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import EmployeeReportingPortal from './EmployeeReportingPortal';

// Mock attendance data
const MOCK_ATTENDANCE = {
  '2026-07': { present: 21, absent: 1, leave: 1, halfDay: 1 },
  '2026-06': { present: 22, absent: 0, leave: 0, halfDay: 0 },
  '2026-05': { present: 20, absent: 1, leave: 2, halfDay: 0 },
  '2026-04': { present: 21, absent: 0, leave: 1, halfDay: 1 },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function EmployeeDashboard() {
  const { auth, logout } = useAuth();
  const { employees } = useData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [currentMonth, setCurrentMonth] = useState(6); // July (0-indexed)
  const [currentYear, setCurrentYear] = useState(2026);

  // Find employee data from dataset
  const employeeData = useMemo(() => {
    const found = employees.find(emp => emp.id === auth.employeeId);
    return found || employees[0];
  }, [auth.employeeId, employees]);

  const promotionBoard = useMemo(() => employees
    .filter(employee => employee.level !== 'L6' && (employee.monthsInRole || 0) >= 18 && (employee.performanceRating || 0) >= 4.4)
    .map(employee => ({
      ...employee,
      recommended: employee.performanceRating >= 4.5,
      recommendation: employee.performanceRating >= 4.8
        ? 'Strongly recommended'
        : employee.performanceRating >= 4.5 ? 'Recommended' : 'Calibration review',
    }))
    .sort((a, b) => Number(b.recommended) - Number(a.recommended)
      || b.performanceRating - a.performanceRating
      || b.monthsInRole - a.monthsInRole)
    .map((employee, index) => ({ ...employee, rank: index + 1 })), [employees]);

  const handleLogout = () => {
    logout();
    navigate('/login?role=employee', { replace: true });
  };

  // Calendar helpers
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const attendanceStats = MOCK_ATTENDANCE[monthKey] || { present: 0, absent: 0, leave: 0, halfDay: 0 };
  const today = new Date();
  const isCurrentMonth = currentYear === today.getFullYear() && currentMonth === today.getMonth();

  // Mock calendar events - mark random days as present/absent
  const getDayStatus = (day) => {
    const calendarDate = new Date(currentYear, currentMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (calendarDate > today) return 'future';

    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    // Simple hash to simulate realistic attendance pattern
    const hash = dateStr.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    if (hash % 23 === 0) return 'absent';
    if (hash % 17 === 0) return 'leave';
    if (hash % 13 === 0) return 'half-day';
    return 'present';
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'promotions', label: 'Promotion board', icon: Trophy },
    { id: 'report', label: 'Report a Problem', icon: FileWarning },
  ];

  return (
    <div className="employee-workspace">
      <header className="employee-topbar">
        <div className="employee-topbar-inner">
          <div className="employee-brand"><b>FL</b><span>FairLens</span></div>
          <div className="employee-account">
            <span>{employeeData.name}<small>Employee workspace</small></span>
            <button onClick={handleLogout} title="Sign out"><LogOut size={15} /><span>Sign out</span></button>
          </div>
        </div>
      </header>

      <main className="employee-shell">
        <section className="employee-welcome">
          <div>
            <span>Welcome back</span>
            <h1>{employeeData.name.split(' ')[0]}’s workspace</h1>
            <p>{employeeData.role} · {employeeData.department}</p>
          </div>
          <div className="welcome-meta">
            <span><i /> {employeeData.status}</span>
            <small>{employeeData.id}</small>
          </div>
        </section>

        <nav className="employee-tabs" aria-label="Employee workspace sections">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
                <Icon size={17} /><span>{tab.label === 'Report a Problem' ? 'Private support' : tab.label}</span>
              </button>
            );
          })}
        </nav>

        {activeTab === 'profile' && (
          <div className="employee-content">
            <section className="employee-panel profile-panel">
              <div className="employee-section-heading">
                <div><span>Your information</span><h2>Work profile</h2></div>
                <span className="employee-status-pill"><i /> {employeeData.status}</span>
              </div>
              <div className="profile-grid">
                <ProfileField icon={User} label="Full name" value={employeeData.name} />
                <ProfileField icon={BadgeCheck} label="Employee ID" value={employeeData.id} />
                <ProfileField icon={Briefcase} label="Department" value={employeeData.department} />
                <ProfileField icon={MapPin} label="Role" value={employeeData.role} />
                <ProfileField icon={Activity} label="Job level" value={employeeData.level} />
                <ProfileField icon={Clock} label="Experience" value={`${employeeData.experienceYears} years`} />
              </div>
            </section>

            <aside className="employee-side">
              <section className="employee-panel role-summary">
                <span>Current role</span>
                <strong>{employeeData.monthsInRole}</strong>
                <p>months in this position</p>
                <div><Calendar size={15} /> Profile data is current</div>
              </section>
              <button className="support-shortcut" onClick={() => setActiveTab('report')}>
                <i><ShieldCheck size={20} /></i>
                <span><strong>Need private support?</strong><small>Contact HR safely at any time.</small></span>
                <ChevronRight size={18} />
              </button>
            </aside>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="attendance-view">
            <div className="employee-section-heading standalone"><div><span>Attendance</span><h2>Your month at a glance</h2></div></div>
            <div className="attendance-stats">
              <StatCard label="Present" value={attendanceStats.present} tone="blue" />
              <StatCard label="Absent" value={attendanceStats.absent} tone="red" />
              <StatCard label="Leave" value={attendanceStats.leave} tone="amber" />
              <StatCard label="Half days" value={attendanceStats.halfDay} tone="gray" />
            </div>
            <section className="employee-panel calendar-panel">
              <div className="calendar-heading">
                <button onClick={prevMonth}><ChevronLeft size={18} /></button>
                <h2>{MONTHS[currentMonth]} {currentYear}</h2>
                <button onClick={nextMonth} disabled={isCurrentMonth} title={isCurrentMonth ? 'Future attendance is not available' : 'Next month'}><ChevronRight size={18} /></button>
              </div>
              <div className="calendar-grid calendar-days">{DAYS.map(day => <div key={day}>{day}</div>)}</div>
              <div className="calendar-grid">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const status = getDayStatus(day);
                    const today = new Date();
                    const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;

                    return <div key={day} className={`calendar-cell ${status} ${isToday ? 'today' : ''}`}><span>{day}</span><i /></div>;
                  })}
              </div>
              <div className="calendar-legend">
                <LegendItem tone="present" label="Present" /><LegendItem tone="absent" label="Absent" />
                <LegendItem tone="leave" label="Leave" /><LegendItem tone="half-day" label="Half day" />
              </div>
            </section>
          </div>
        )}

        {activeTab === 'promotions' && (
          <div className="promotion-view">
            <div className="promotion-heading">
              <div><span>Promotion transparency</span><h2>Readiness board</h2><p>The same eligibility signals visible to HR, ranked consistently across the organization.</p></div>
              <div><Trophy size={19} /><strong>{promotionBoard.filter(item => item.recommended).length}</strong><span>recommended</span></div>
            </div>
            <div className="promotion-explainer">
              <TrendingUp size={17} />
              <p><strong>How this works:</strong> employees appear after 18 months in role with a performance rating of 4.4 or higher. This board supports transparent review; it does not guarantee a promotion.</p>
            </div>
            <section className="employee-panel promotion-board">
              <div className="promotion-board-head"><span>Rank</span><span>Employee</span><span>Department</span><span>Time in role</span><span>Performance</span><span>Current signal</span></div>
              {promotionBoard.map(person => (
                <div className={`promotion-person ${person.id === auth.employeeId ? 'current' : ''}`} key={person.id}>
                  <strong className={`promotion-rank rank-${person.rank}`}>{person.rank}</strong>
                  <div className="promotion-person-name"><i>{person.name.split(' ').map(part => part[0]).join('').slice(0, 2)}</i><span><strong>{person.name}{person.id === auth.employeeId && <em>You</em>}</strong><small>{person.role} · {person.level}</small></span></div>
                  <span>{person.department}</span>
                  <span>{(person.monthsInRole / 12).toFixed(1)} years</span>
                  <strong>{person.performanceRating}/5</strong>
                  <span className={`promotion-signal ${person.recommended ? 'ready' : ''}`}>{person.recommendation}</span>
                </div>
              ))}
              {!promotionBoard.length && <div className="promotion-empty">No employees currently meet the promotion-review criteria.</div>}
            </section>
          </div>
        )}

        {activeTab === 'report' && (
          <div className="employee-report-view">
            <div className="support-heading">
              <i><ShieldCheck size={22} /></i>
              <div><span>Private support</span><h2>Talk to HR safely.</h2><p>Create a report or return to an existing conversation.</p></div>
            </div>
            <EmployeeReportingPortal embedded onBackToDashboard={() => setActiveTab('profile')} />
          </div>
        )}
      </main>
      <style>{employeeStyles}</style>
    </div>
  );
}

// Sub-components
function ProfileField({ icon: Icon, label, value }) {
  return (
    <div className="profile-field">
      <i>{Icon && <Icon size={16} />}</i>
      <div><span>{label}</span><strong>{value}</strong></div>
    </div>
  );
}

function StatCard({ label, value, tone }) {
  return <div className={`attendance-stat ${tone}`}><span>{label}</span><strong>{value}</strong><i /></div>;
}

function LegendItem({ tone, label }) {
  return <div><i className={tone} /> {label}</div>;
}

const employeeStyles = `
.employee-workspace{min-height:100vh;background:#f6f7f9;color:#101828}.employee-topbar{position:sticky;z-index:50;top:0;height:72px;border-bottom:1px solid #e3e6eb;background:rgba(255,255,255,.92);backdrop-filter:blur(16px)}.employee-topbar-inner{width:min(1120px,calc(100% - 36px));height:100%;display:flex;align-items:center;justify-content:space-between;margin:0 auto}.employee-brand{display:flex;align-items:center;gap:10px}.employee-brand>b{width:38px;height:38px;display:grid;place-items:center;border-radius:10px;background:#17191d;color:#fff;font-size:12px}.employee-brand>span{font-family:var(--font-serif);font-size:19px;font-weight:700}.employee-account{display:flex;align-items:center;gap:14px}.employee-account>span{display:flex;flex-direction:column;text-align:right;font-size:11px;font-weight:700}.employee-account small{margin-top:2px;color:#98a2b3;font-size:9px;font-weight:500}.employee-account button{height:36px;display:flex;align-items:center;gap:7px;padding:0 11px;border:1px solid #dce1e8;border-radius:9px;background:#fff;color:#475467;font-size:11px;font-weight:700;cursor:pointer;transition:.2s}.employee-account button:hover{border-color:#b9c0cc;background:#f8fafc;color:#101828}.employee-shell{width:min(1120px,calc(100% - 36px));margin:0 auto;padding:34px 0 70px}.employee-welcome{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding:4px 2px 22px;border-bottom:1px solid #dfe3e8;animation:employee-rise .55s both}.employee-welcome>div:first-child>span,.employee-section-heading>div>span,.support-heading>div>span{color:#2563eb;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.09em}.employee-welcome h1{margin:7px 0 5px;color:#101828;font-family:var(--font-serif);font-size:35px;letter-spacing:-.035em}.employee-welcome p{color:#667085;font-size:12px}.welcome-meta{display:flex;align-items:center;gap:12px;padding-bottom:3px}.welcome-meta>span{display:flex;align-items:center;gap:6px;padding:7px 10px;border-radius:20px;background:#ecfdf3;color:#16794d;font-size:10px;font-weight:800}.welcome-meta i{width:7px;height:7px;border-radius:50%;background:#22a06b}.welcome-meta small{color:#98a2b3;font-family:var(--font-mono);font-size:9px}.employee-tabs{display:flex;gap:5px;margin:18px 0;padding:5px;border:1px solid #e1e5eb;border-radius:13px;background:#fff}.employee-tabs button{display:flex;align-items:center;justify-content:center;gap:8px;min-width:150px;padding:11px 15px;border:0;border-radius:9px;background:transparent;color:#667085;font-size:12px;font-weight:700;cursor:pointer;transition:.2s}.employee-tabs button:hover{background:#f7f8fa;color:#101828}.employee-tabs button.active{background:#17191d;color:#fff}.employee-content{display:grid;grid-template-columns:minmax(0,1fr) 285px;gap:16px;animation:employee-rise .45s both}.employee-panel{border:1px solid #e1e5eb;border-radius:17px;background:#fff;box-shadow:0 5px 18px rgba(16,24,40,.035)}.profile-panel{padding:27px}.employee-section-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:25px}.employee-section-heading h2{margin-top:3px;font-family:var(--font-serif);font-size:24px}.employee-status-pill{display:flex;align-items:center;gap:7px;padding:7px 10px;border-radius:20px;background:#ecfdf3;color:#16794d;font-size:10px;font-weight:800}.employee-status-pill i{width:7px;height:7px;border-radius:50%;background:#22a06b}.profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.profile-field{display:flex;align-items:center;gap:11px;padding:15px;border:1px solid #e8eaee;border-radius:12px;background:#fafbfc}.profile-field>i{width:34px;height:34px;display:grid;flex:none;place-items:center;border-radius:9px;background:#eef4ff;color:#2563eb}.profile-field>div{display:flex;min-width:0;flex-direction:column}.profile-field span{color:#98a2b3;font-size:9px;font-weight:750;text-transform:uppercase;letter-spacing:.05em}.profile-field strong{overflow:hidden;margin-top:3px;font-size:12px;text-overflow:ellipsis;white-space:nowrap}.employee-side{display:flex;flex-direction:column;gap:16px}.role-summary{padding:24px}.role-summary>span{color:#667085;font-size:10px;font-weight:700;text-transform:uppercase}.role-summary>strong{display:block;margin:10px 0 2px;font-size:42px;line-height:1}.role-summary>p{color:#667085;font-size:11px}.role-summary>div{display:flex;align-items:center;gap:7px;margin-top:24px;padding-top:15px;border-top:1px solid #e8eaee;color:#667085;font-size:10px}.support-shortcut{display:flex;align-items:center;gap:11px;padding:18px;border:0;border-radius:15px;background:#eef4ff;color:#1d4ed8;text-align:left;cursor:pointer}.support-shortcut>i{width:38px;height:38px;display:grid;flex:none;place-items:center;border-radius:10px;background:#fff}.support-shortcut>span{display:flex;flex:1;flex-direction:column}.support-shortcut strong{font-size:11px}.support-shortcut small{margin-top:3px;color:#5572ae;font-size:9px;line-height:1.4}.attendance-view,.employee-report-view,.promotion-view{animation:employee-rise .45s both}.employee-section-heading.standalone{margin:27px 2px 16px}.attendance-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:11px;margin-bottom:16px}.attendance-stat{position:relative;overflow:hidden;padding:19px;border:1px solid #e1e5eb;border-radius:14px;background:#fff}.attendance-stat span{color:#667085;font-size:10px;font-weight:700;text-transform:uppercase}.attendance-stat strong{display:block;margin-top:6px;font-size:26px}.attendance-stat>i{position:absolute;right:0;bottom:0;width:46px;height:4px;background:#98a2b3}.attendance-stat.blue>i{background:#2563eb}.attendance-stat.red>i{background:#d92d20}.attendance-stat.amber>i{background:#d97706}.calendar-panel{padding:25px}.calendar-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}.calendar-heading h2{font-family:var(--font-serif);font-size:21px}.calendar-heading button{width:36px;height:36px;display:grid;place-items:center;border:1px solid #dce1e8;border-radius:9px;background:#fff;color:#667085;cursor:pointer}.calendar-heading button:disabled{border-color:#eaecf0;background:#f8fafc;color:#c5cad2;cursor:not-allowed}.calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}.calendar-days{margin-bottom:6px;color:#98a2b3;font-size:9px;font-weight:800;text-align:center;text-transform:uppercase}.calendar-days>div{padding:8px}.calendar-cell{position:relative;min-height:54px;display:flex;align-items:center;justify-content:center;border:1px solid transparent;border-radius:9px;font-size:12px}.calendar-cell:hover{background:#f8fafc}.calendar-cell.today{border-color:#9db8f7;background:#f6f8ff;font-weight:800}.calendar-cell i{position:absolute;bottom:8px;width:5px;height:5px;border-radius:50%;background:#2563eb}.calendar-cell.absent i{background:#d92d20}.calendar-cell.leave i{background:#d97706}.calendar-cell.half-day i{background:#98a2b3}.calendar-cell.future{color:#c4c9d1}.calendar-cell.future i{display:none}.calendar-cell.future:hover{background:transparent}.calendar-legend{display:flex;justify-content:center;gap:20px;margin-top:20px;padding-top:17px;border-top:1px solid #e8eaee;color:#667085;font-size:10px}.calendar-legend>div{display:flex;align-items:center;gap:6px}.calendar-legend i{width:7px;height:7px;border-radius:50%;background:#2563eb}.calendar-legend i.absent{background:#d92d20}.calendar-legend i.leave{background:#d97706}.calendar-legend i.half-day{background:#98a2b3}.promotion-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin:27px 2px 16px}.promotion-heading>div:first-child>span{color:#2563eb;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.09em}.promotion-heading h2{margin:3px 0;font-family:var(--font-serif);font-size:26px}.promotion-heading p{color:#667085;font-size:11px}.promotion-heading>div:last-child{display:grid;grid-template-columns:auto auto;align-items:center;gap:0 7px;color:#2563eb}.promotion-heading>div:last-child svg{grid-row:1/3}.promotion-heading>div:last-child strong{font-size:19px;line-height:1}.promotion-heading>div:last-child span{color:#667085;font-size:9px}.promotion-explainer{display:flex;align-items:flex-start;gap:10px;margin-bottom:13px;padding:13px 15px;border:1px solid #dbe5fb;border-radius:12px;background:#f5f8ff;color:#475467}.promotion-explainer svg{flex:none;color:#2563eb}.promotion-explainer p{font-size:11px;line-height:1.55}.promotion-explainer strong{color:#101828}.promotion-board{overflow:hidden}.promotion-board-head,.promotion-person{min-width:930px;display:grid;grid-template-columns:48px 1.55fr 1.05fr .75fr .65fr 1fr;align-items:center;gap:12px;padding:13px 18px}.promotion-board-head{background:#f8fafc;color:#667085;font-size:9px;font-weight:800;text-transform:uppercase}.promotion-person{border-top:1px solid #e8eaee;font-size:11px}.promotion-person:hover{background:#fafbfc}.promotion-person.current{background:#f5f8ff;box-shadow:inset 3px 0 #2563eb}.promotion-rank{width:26px;height:26px;display:grid;place-items:center;border-radius:8px;background:#f0f2f5;color:#667085}.promotion-rank.rank-1{background:#fff4cc;color:#8b6513}.promotion-rank.rank-2{background:#eef1f5;color:#596274}.promotion-rank.rank-3{background:#f8e8dc;color:#975b34}.promotion-person-name{display:flex;align-items:center;gap:9px}.promotion-person-name>i{width:32px;height:32px;display:grid;flex:none;place-items:center;border-radius:9px;background:#eef4ff;color:#2563eb;font-size:9px;font-style:normal;font-weight:800}.promotion-person-name>span{display:flex;min-width:0;flex-direction:column}.promotion-person-name strong{display:flex;align-items:center;gap:6px}.promotion-person-name em{padding:2px 5px;border-radius:8px;background:#2563eb;color:#fff;font-size:7px;font-style:normal;text-transform:uppercase}.promotion-person-name small{overflow:hidden;margin-top:2px;color:#98a2b3;font-size:9px;text-overflow:ellipsis;white-space:nowrap}.promotion-signal{width:max-content;padding:6px 8px;border-radius:20px;background:#fff7e6;color:#9a6810;font-size:9px;font-weight:800}.promotion-signal.ready{background:#ecfdf3;color:#16794d}.promotion-empty{padding:35px;color:#667085;text-align:center;font-size:12px}.support-heading{display:flex;align-items:center;gap:13px;margin:27px 0 17px}.support-heading>i{width:45px;height:45px;display:grid;place-items:center;border-radius:12px;background:#eef4ff;color:#2563eb}.support-heading h2{margin:2px 0;font-family:var(--font-serif);font-size:25px}.support-heading p{color:#667085;font-size:11px}@keyframes employee-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}@media(max-width:800px){.employee-content{grid-template-columns:1fr}.employee-side{display:grid;grid-template-columns:1fr 1fr}.attendance-stats{grid-template-columns:repeat(2,1fr)}.promotion-board{overflow-x:auto}}@media(max-width:580px){.employee-topbar-inner{width:calc(100% - 28px)}.employee-account>span{display:none}.employee-shell{width:calc(100% - 24px);padding-top:20px}.employee-welcome{align-items:flex-start;flex-direction:column;padding-bottom:18px}.employee-welcome h1{font-size:27px}.welcome-meta{width:100%;justify-content:space-between}.employee-tabs{overflow-x:auto}.employee-tabs button{min-width:max-content}.profile-panel,.calendar-panel{padding:19px}.profile-grid,.employee-side{grid-template-columns:1fr}.calendar-cell{min-height:42px}.calendar-legend{flex-wrap:wrap}.promotion-heading{align-items:flex-start;flex-direction:column}.employee-account button span{display:none}.employee-account button{width:36px;padding:0;justify-content:center}}@media(prefers-reduced-motion:reduce){.employee-workspace *{animation:none!important;transition:none!important}}
`;
